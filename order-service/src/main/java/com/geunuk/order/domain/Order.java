package com.geunuk.order.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    // 배송지 정보
    @Column(name = "receiver_name", nullable = false, length = 50)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    private String receiverPhone;

    @Column(name = "delivery_address", nullable = false, length = 300)
    private String deliveryAddress;

    @Column(name = "used_point")
    @Builder.Default
    private Long usedPoint = 0L;

    // 주문 상품 목록 (1:N)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── 비즈니스 메서드 ──────────────────────────

    public void addOrderItem(OrderItem item) {
        this.orderItems.add(item);
    }

    public void confirm() {
        validateStatus(OrderStatus.PENDING, "결제 확인");
        this.status = OrderStatus.CONFIRMED;
    }

    public void ship() {
        validateStatus(OrderStatus.CONFIRMED, "배송 시작");
        this.status = OrderStatus.SHIPPING;
    }

    public void complete() {
        validateStatus(OrderStatus.SHIPPING, "배송 완료");
        this.status = OrderStatus.COMPLETED;
    }

    public void cancel() {
        if (this.status == OrderStatus.SHIPPING || this.status == OrderStatus.COMPLETED) {
            throw new IllegalStateException("배송 중이거나 완료된 주문은 취소할 수 없습니다.");
        }
        this.status = OrderStatus.CANCELLED;
    }

    private void validateStatus(OrderStatus required, String action) {
        if (this.status != required) {
            throw new IllegalStateException(
                action + " 처리를 할 수 없는 상태입니다. 현재 상태: " + this.status
            );
        }
    }

    public boolean isOwnedBy(Long userId) {
        return this.userId.equals(userId);
    }
}
