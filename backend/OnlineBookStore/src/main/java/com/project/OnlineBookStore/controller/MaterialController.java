package com.project.OnlineBookStore.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.OnlineBookStore.model.Material;
import com.project.OnlineBookStore.service.MaterialService;
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

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
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

    // Download file — accessible to both users and admins
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/api/materials/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Material m = materialService.findById(id).orElseThrow(() -> new RuntimeException("Material not found"));
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
}
