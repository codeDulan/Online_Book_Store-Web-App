package com.project.OnlineBookStore.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentConfirmParams;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    /**
     * Create a payment intent for the purchase
     * @param amount Amount in the smallest currency unit (e.g., cents for USD, but LKR doesn't have smaller units)
     * @param currency Currency code (e.g., "lkr" for Sri Lankan Rupee)
     * @param description Description of the payment
     * @return PaymentIntent object
     * @throws StripeException if Stripe API call fails
     */
    public PaymentIntent createPaymentIntent(Long amount, String currency, String description) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .setDescription(description)
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();

        return PaymentIntent.create(params);
    }

    /**
     * Confirm a payment intent
     * @param paymentIntentId Payment intent ID
     * @return Updated PaymentIntent object
     * @throws StripeException if Stripe API call fails
     */
    public PaymentIntent confirmPaymentIntent(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        PaymentIntentConfirmParams params = PaymentIntentConfirmParams.builder().build();
        return paymentIntent.confirm(params);
    }

    /**
     * Retrieve a payment intent
     * @param paymentIntentId Payment intent ID
     * @return PaymentIntent object
     * @throws StripeException if Stripe API call fails
     */
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }

    /**
     * Convert price to cents (smallest currency unit)
     * For LKR, we'll multiply by 100 to work with Stripe's expected format
     * @param price Price in major currency unit
     * @return Amount in smallest currency unit
     */
    public Long convertToSmallestUnit(Double price) {
        return Math.round(price * 100);
    }
}