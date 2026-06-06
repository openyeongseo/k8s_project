package com.geunuk.order.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_detail")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_detail_key")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_key", nullable = false)
    private Order order;

    @Column(name = "item_key", nullable = false)
    private Long productId;

    // order_detail에 product_name 없음 → Transient
    @Transient
    private String productName;

    @Column(name = "price", nullable = false)
    @Builder.Default
    private Integer priceRaw = 0;

    @Column(name = "cnt", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    // ── BigDecimal 호환 메서드 ──

    public BigDecimal getPrice() {
        return priceRaw != null ? BigDecimal.valueOf(priceRaw) : BigDecimal.ZERO;
    }

    // 연관관계 편의 메서드
    public void assignOrder(Order order) {
        this.order = order;
    }

    public BigDecimal getSubtotal() {
        return getPrice().multiply(BigDecimal.valueOf(this.quantity));
    }
}
