package com.project.OnlineBookStore.service;

import com.project.OnlineBookStore.model.Material;
import com.project.OnlineBookStore.model.Purchase;
import com.project.OnlineBookStore.model.PurchaseStatus;
import com.project.OnlineBookStore.model.User;
import com.project.OnlineBookStore.repository.MaterialRepository;
import com.project.OnlineBookStore.repository.PurchaseRepository;
import com.project.OnlineBookStore.repository.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final MaterialRepository materialRepository;
    private final UserRepository userRepository;
    private final StripeService stripeService;

    public PurchaseService(PurchaseRepository purchaseRepository, 
                          MaterialRepository materialRepository,
                          UserRepository userRepository,
                          StripeService stripeService) {
        this.purchaseRepository = purchaseRepository;
        this.materialRepository = materialRepository;
        this.userRepository = userRepository;
        this.stripeService = stripeService;
    }

    /**
     * Create a payment intent for purchasing material
     */
    public Purchase createPaymentIntent(Long userId, Long materialId) throws StripeException {
        System.out.println("Creating payment intent for user: " + userId + ", material: " + materialId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found: " + materialId));

        System.out.println("Found material: " + material.getTitle() + ", price: " + material.getPrice());

        // Check if user already purchased this material
        if (purchaseRepository.existsByUserAndMaterialId(user, materialId)) {
            throw new RuntimeException("Material already purchased by user");
        }

        // Create Stripe payment intent
        System.out.println("Creating Stripe payment intent...");
        Long amountInCents = stripeService.convertToSmallestUnit(material.getPrice());
        String description = "Purchase of " + material.getTitle();
        System.out.println("Amount in cents: " + amountInCents + ", description: " + description);
        
        PaymentIntent paymentIntent = stripeService.createPaymentIntent(amountInCents, "usd", description);
        System.out.println("Created payment intent: " + paymentIntent.getId());

        // Create purchase record with payment intent info
        Purchase purchase = new Purchase();
        purchase.setUser(user);
        purchase.setMaterial(material);
        purchase.setPurchasePrice(material.getPrice());
        purchase.setStatus(PurchaseStatus.NEW);
        purchase.setStripePaymentIntentId(paymentIntent.getId());
        purchase.setStripeClientSecret(paymentIntent.getClientSecret());

        return purchaseRepository.save(purchase);
    }

    /**
     * Complete the purchase after successful payment
     */
    public Purchase completePurchase(String paymentIntentId) throws StripeException {
        Purchase purchase = purchaseRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Purchase not found for payment intent: " + paymentIntentId));

        // Verify payment with Stripe
        PaymentIntent paymentIntent = stripeService.retrievePaymentIntent(paymentIntentId);
        
        if ("succeeded".equals(paymentIntent.getStatus())) {
            purchase.setStatus(PurchaseStatus.DONE);
        } else {
            purchase.setStatus(PurchaseStatus.FAIL);
            throw new RuntimeException("Payment failed or incomplete");
        }

        return purchaseRepository.save(purchase);
    }



    public List<Purchase> getUserPurchases(Long userId) {
        return purchaseRepository.findByUserId(userId);
    }

    public boolean hasUserPurchased(Long userId, Long materialId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        return purchaseRepository.existsByUserAndMaterialId(user, materialId);
    }

    public Optional<Purchase> findById(Long id) {
        return purchaseRepository.findById(id);
    }

    public List<Purchase> findAll() {
        return purchaseRepository.findAll();
    }
}