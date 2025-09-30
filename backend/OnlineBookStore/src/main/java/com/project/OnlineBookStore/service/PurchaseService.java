package com.project.OnlineBookStore.service;

import com.project.OnlineBookStore.model.Material;
import com.project.OnlineBookStore.model.Purchase;
import com.project.OnlineBookStore.model.PurchaseStatus;
import com.project.OnlineBookStore.model.User;
import com.project.OnlineBookStore.repository.MaterialRepository;
import com.project.OnlineBookStore.repository.PurchaseRepository;
import com.project.OnlineBookStore.repository.UserRepository;
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

    public PurchaseService(PurchaseRepository purchaseRepository, 
                          MaterialRepository materialRepository,
                          UserRepository userRepository) {
        this.purchaseRepository = purchaseRepository;
        this.materialRepository = materialRepository;
        this.userRepository = userRepository;
    }

    public Purchase purchaseMaterial(Long userId, Long materialId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found: " + materialId));

        // Check if user already purchased this material
        if (purchaseRepository.existsByUserAndMaterialId(user, materialId)) {
            throw new RuntimeException("Material already purchased by user");
        }

        Purchase purchase = new Purchase();
        purchase.setUser(user);
        purchase.setMaterial(material);
        purchase.setPurchasePrice(material.getPrice());
        purchase.setStatus(PurchaseStatus.COMPLETED);

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