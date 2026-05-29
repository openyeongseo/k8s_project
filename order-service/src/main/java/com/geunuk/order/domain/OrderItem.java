package com.geunuk.order.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;       // 주문 당시 가격 (스냅샷)

    @Column(nullable = false)
    private Integer quantity;

    // 연관관계 편의 메서드
    public void assignOrder(Order order) {
        this.order = order;
    }

    public BigDecimal getSubtotal() {
        return this.price.multiply(BigDecimal.valueOf(this.quantity));
    }
}
