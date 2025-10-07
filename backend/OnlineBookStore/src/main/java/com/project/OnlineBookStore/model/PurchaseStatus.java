package com.project.OnlineBookStore.model;

public enum PurchaseStatus {
    PND,    // PENDING
    NEW,    // CREATED - Payment intent created
    PROC,   // PROCESSING - Payment being processed
    DONE,   // COMPLETED - Payment successful
    FAIL,   // FAILED - Payment failed
    REF     // REFUNDED - Payment refunded
}