package com.financetracker.backend.ai.dto;

/**
 * Modern Java Record for OCR response data.
 * Adheres to Phase 2: Modern Java requirement.
 */
public record ReceiptResponse(
    String merchant,
    Double amount,
    String date,
    String category,
    String description,
    boolean error,
    String errorMessage
) {
    public static ReceiptResponse error(String message) {
        return new ReceiptResponse(null, null, null, null, null, true, message);
    }
}
