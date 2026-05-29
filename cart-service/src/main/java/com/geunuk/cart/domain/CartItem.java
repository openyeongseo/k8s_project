package com.geunuk.cart.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Redis Hash 구조: cart:{userId}:{productId}
 * TTL: 7일 (RedisHash ttl 속성)
 */
@RedisHash(value = "cart", timeToLive = 604800L)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem implements Serializable {

    @Id
    private String id;          // "{userId}:{productId}"

    @Indexed
    private Long userId;

    private Long productId;
    private String productName;
    private BigDecimal price;
    private Integer quantity;
    private String imageUrl;

    public void updateQuantity(int quantity) {
        if (quantity < 1) throw new IllegalArgumentException("수량은 1 이상이어야 합니다.");
        this.quantity = quantity;
    }

    public BigDecimal getSubtotal() {
        return this.price.multiply(BigDecimal.valueOf(this.quantity));
    }

    public static String generateId(Long userId, Long productId) {
        return userId + ":" + productId;
    }
}
