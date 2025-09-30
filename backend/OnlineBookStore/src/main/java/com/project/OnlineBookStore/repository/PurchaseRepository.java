package com.project.OnlineBookStore.repository;

import com.project.OnlineBookStore.model.Purchase;
import com.project.OnlineBookStore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByUser(User user);
    List<Purchase> findByUserId(Long userId);
    Optional<Purchase> findByUserAndMaterialId(User user, Long materialId);
    boolean existsByUserAndMaterialId(User user, Long materialId);
}