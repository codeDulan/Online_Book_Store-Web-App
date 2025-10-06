package com.project.OnlineBookStore.dto;

import com.project.OnlineBookStore.model.PurchaseStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PurchaseDTO {
    private Long id;
    private UserDTO user;
    private MaterialDTO material;
    private Double purchasePrice;
    private LocalDateTime purchaseDate;
    private PurchaseStatus status;
    private String stripePaymentIntentId;
    private String stripeClientSecret;
}