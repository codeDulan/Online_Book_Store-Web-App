package com.project.OnlineBookStore.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.OnlineBookStore.dto.MaterialDTO;
import com.project.OnlineBookStore.model.Material;
import com.project.OnlineBookStore.service.DTOConversionService;
import com.project.OnlineBookStore.service.MaterialService;
import com.project.OnlineBookStore.service.PurchaseService;
import com.project.OnlineBookStore.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

@RestController
public class MaterialController {

    private final MaterialService materialService;
    private final PurchaseService purchaseService;
    private final JwtUtil jwtUtil;
    private final DTOConversionService dtoConversionService;

    public MaterialController(MaterialService materialService, PurchaseService purchaseService, 
                             JwtUtil jwtUtil, DTOConversionService dtoConversionService) {
        this.materialService = materialService;
        this.purchaseService = purchaseService;
        this.jwtUtil = jwtUtil;
        this.dtoConversionService = dtoConversionService;
    }

    // Create — admin only
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/api/admin/materials", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Material> createMaterial(
            @RequestPart("file") MultipartFile file,
            @RequestPart("metadata") String metadataJson
    ) throws Exception {
        // Parse JSON string to Material object
        ObjectMapper mapper = new ObjectMapper();
        Material metadata = mapper.readValue(metadataJson, Material.class);
        
        Material saved = materialService.create(file, metadata);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Update — admin only
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/api/admin/materials/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Material> updateMaterial(
            @PathVariable Long id,
            @RequestPart("metadata") String metadataJson,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws Exception {
        // Parse JSON string to Material object
        ObjectMapper mapper = new ObjectMapper();
        Material metadata = mapper.readValue(metadataJson, Material.class);
        
        Material updated = materialService.update(id, metadata, file);
        return ResponseEntity.ok(updated);
    }

    // Delete — admin only
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/admin/materials/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // List materials — accessible to both users and admins
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/api/materials")
    public List<Material> listAll() {
        return materialService.listAll();
    }

    // Get single material — accessible to both users and admins
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/api/materials/{id}")
    public ResponseEntity<Material> getOne(@PathVariable Long id) {
        return materialService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Browse materials with purchase status for users
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/api/user/materials")
    public List<MaterialDTO> browseMaterials(HttpServletRequest request) {
        List<Material> materials = materialService.listAll();
        Long userId = extractUserIdFromRequest(request);
        
        return materials.stream()
                .map(material -> {
                    boolean purchased = purchaseService.hasUserPurchased(userId, material.getId());
                    return dtoConversionService.convertToMaterialDTO(material, purchased);
                })
                .toList();
    }

    // Get single material with purchase status for users
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/api/user/materials/{id}")
    public ResponseEntity<MaterialDTO> getMaterialForUser(@PathVariable Long id, HttpServletRequest request) {
        return materialService.findById(id)
                .map(material -> {
                    Long userId = extractUserIdFromRequest(request);
                    boolean purchased = purchaseService.hasUserPurchased(userId, material.getId());
                    return ResponseEntity.ok(dtoConversionService.convertToMaterialDTO(material, purchased));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Search materials by university for users
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/api/user/materials/search/university/{university}")
    public List<MaterialDTO> searchByUniversity(@PathVariable String university, HttpServletRequest request) {
        List<Material> materials = materialService.findByUniversity(university);
        Long userId = extractUserIdFromRequest(request);
        
        return materials.stream()
                .map(material -> {
                    boolean purchased = purchaseService.hasUserPurchased(userId, material.getId());
                    return dtoConversionService.convertToMaterialDTO(material, purchased);
                })
                .toList();
    }

    // Search materials by faculty for users
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/api/user/materials/search/faculty/{faculty}")
    public List<MaterialDTO> searchByFaculty(@PathVariable String faculty, HttpServletRequest request) {
        List<Material> materials = materialService.findByFaculty(faculty);
        Long userId = extractUserIdFromRequest(request);
        
        return materials.stream()
                .map(material -> {
                    boolean purchased = purchaseService.hasUserPurchased(userId, material.getId());
                    return dtoConversionService.convertToMaterialDTO(material, purchased);
                })
                .toList();
    }

    // Download file — accessible to both users and admins
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/api/materials/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id, HttpServletRequest request) {
        Material m = materialService.findById(id).orElseThrow(() -> new RuntimeException("Material not found"));
        
        // Check if user has purchased this material (admins can download without purchase)
        if (!hasUserRole("ADMIN", request) && !hasUserPurchasedMaterial(id, request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Path path = materialService.getFilePath(m.getFilename());
        Resource resource = new PathResource(path);
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment().filename(m.getFilename()).build());
        headers.setContentType(MediaType.APPLICATION_PDF);
        return ResponseEntity.ok()
                .headers(headers)
                .body(resource);
    }

    // Helper method to check if user has a specific role
    private boolean hasUserRole(String role, HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            String userRole = jwtUtil.extractRole(token);
            return ("ROLE_" + role).equals(userRole);
        }
        return false;
    }

    // Helper method to check if user has purchased a material
    private boolean hasUserPurchasedMaterial(Long materialId, HttpServletRequest request) {
        try {
            String authorizationHeader = request.getHeader("Authorization");
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                String token = authorizationHeader.substring(7);
                Long userId = jwtUtil.extractUserId(token);
                return purchaseService.hasUserPurchased(userId, materialId);
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    // Helper method to extract user ID from JWT token in request header
    private Long extractUserIdFromRequest(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("No valid JWT token found in request");
    }
}
