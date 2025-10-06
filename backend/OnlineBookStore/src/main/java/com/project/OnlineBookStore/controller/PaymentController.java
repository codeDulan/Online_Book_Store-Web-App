package com.project.OnlineBookStore.controller;

import com.project.OnlineBookStore.dto.PaymentConfirmRequest;
import com.project.OnlineBookStore.dto.PaymentIntentRequest;
import com.project.OnlineBookStore.dto.PaymentIntentResponse;
import com.project.OnlineBookStore.dto.PurchaseDTO;
import com.project.OnlineBookStore.model.Purchase;
import com.project.OnlineBookStore.service.DTOConversionService;
import com.project.OnlineBookStore.service.PurchaseService;
import com.project.OnlineBookStore.util.JwtUtil;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PurchaseService purchaseService;
    private final JwtUtil jwtUtil;
    private final DTOConversionService dtoConversionService;

    @Value("${stripe.public.key}")
    private String stripePublicKey;

    public PaymentController(PurchaseService purchaseService, JwtUtil jwtUtil, DTOConversionService dtoConversionService) {
        this.purchaseService = purchaseService;
        this.jwtUtil = jwtUtil;
        this.dtoConversionService = dtoConversionService;
    }

    // Get Stripe public key for frontend
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getPaymentConfig() {
        return ResponseEntity.ok(Map.of("publishableKey", stripePublicKey));
    }

    // Create payment intent for material purchase
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody PaymentIntentRequest request, HttpServletRequest httpRequest) {
        try {
            Long userId = extractUserIdFromRequest(httpRequest);
            Purchase purchase = purchaseService.createPaymentIntent(userId, request.getMaterialId());
            
            PaymentIntentResponse response = new PaymentIntentResponse();
            response.setClientSecret(purchase.getStripeClientSecret());
            response.setPaymentIntentId(purchase.getStripePaymentIntentId());
            response.setPurchaseId(purchase.getId());
            response.setAmount(purchase.getPurchasePrice());
            response.setCurrency("usd");
            
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Payment service error: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Confirm payment completion
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/confirm-payment")
    public ResponseEntity<?> confirmPayment(@RequestBody PaymentConfirmRequest request) {
        try {
            Purchase purchase = purchaseService.completePurchase(request.getPaymentIntentId());
            PurchaseDTO dto = dtoConversionService.convertToPurchaseDTO(purchase);
            return ResponseEntity.ok(dto);
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Payment service error: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
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