package com.project.OnlineBookStore.controller;

import com.project.OnlineBookStore.dto.PurchaseDTO;
import com.project.OnlineBookStore.model.Purchase;
import com.project.OnlineBookStore.service.DTOConversionService;
import com.project.OnlineBookStore.service.PurchaseService;
import com.project.OnlineBookStore.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PurchaseController {

    private final PurchaseService purchaseService;
    private final JwtUtil jwtUtil;
    private final DTOConversionService dtoConversionService;

    public PurchaseController(PurchaseService purchaseService, JwtUtil jwtUtil, DTOConversionService dtoConversionService) {
        this.purchaseService = purchaseService;
        this.jwtUtil = jwtUtil;
        this.dtoConversionService = dtoConversionService;
    }

    // Purchase a material
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/materials/{materialId}/purchase")
    public ResponseEntity<PurchaseDTO> purchaseMaterial(@PathVariable Long materialId, HttpServletRequest request) {
        try {
            Long userId = extractUserIdFromRequest(request);
            Purchase purchase = purchaseService.purchaseMaterial(userId, materialId);
            PurchaseDTO dto = dtoConversionService.convertToPurchaseDTO(purchase);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get user's purchase history
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/purchases")
    public ResponseEntity<List<PurchaseDTO>> getUserPurchases(HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        List<Purchase> purchases = purchaseService.getUserPurchases(userId);
        List<PurchaseDTO> purchaseDTOs = purchases.stream()
                .map(dtoConversionService::convertToPurchaseDTO)
                .toList();
        return ResponseEntity.ok(purchaseDTOs);
    }

    // Check if user has purchased a specific material
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/materials/{materialId}/purchased")
    public ResponseEntity<Map<String, Boolean>> checkIfPurchased(@PathVariable Long materialId, HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        boolean purchased = purchaseService.hasUserPurchased(userId, materialId);
        return ResponseEntity.ok(Map.of("purchased", purchased));
    }

    // Admin: Get all purchases
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/purchases")
    public ResponseEntity<List<PurchaseDTO>> getAllPurchases() {
        List<Purchase> purchases = purchaseService.findAll();
        List<PurchaseDTO> purchaseDTOs = purchases.stream()
                .map(dtoConversionService::convertToPurchaseDTO)
                .toList();
        return ResponseEntity.ok(purchaseDTOs);
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