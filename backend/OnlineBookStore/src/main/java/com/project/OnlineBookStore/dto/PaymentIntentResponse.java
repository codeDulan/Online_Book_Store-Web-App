package com.project.OnlineBookStore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PaymentIntentResponse {
    private String clientSecret;
    private String paymentIntentId;
    private Long purchaseId;
    private Double amount;
    private String currency;
}