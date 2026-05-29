package com.geunuk.product.exception;

// ─────────────────────────────────────────────────
// 커스텀 예외
// ─────────────────────────────────────────────────
public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(String message) {
        super(message);
    }
}
