package com.geunuk.order.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

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
    @Column(name = "order_key")
    private Long id;

    @Column(name = "cust_key", nullable = false)
    private Long userId;

    @Column(name = "total_price", nullable = false)
    @Builder.Default
    private Integer totalPriceRaw = 0;

    // order_status는 VARCHAR '주문접수' 등 한글 → String으로 관리
    @Column(name = "order_status", nullable = false, length = 20)
    @Builder.Default
    private String orderStatus = "주문접수";

    // item_count: 주문 상품 종류 수
    @Column(name = "item_count", nullable = false)
    @Builder.Default
    private Integer itemCount = 0;

    // orders 테이블에 없는 필드 → Transient
    @Transient private String receiverName;
    @Transient private String receiverPhone;
    @Transient private String deliveryAddress;
    @Transient @Builder.Default private Long usedPoint = 0L;

    // order_detail과 1:N (실제 FK order_key)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "order_date", updatable = false)
    private LocalDateTime createdAt;

    // ── BigDecimal 호환 메서드 ──

    public BigDecimal getTotalPrice() {
        return totalPriceRaw != null ? BigDecimal.valueOf(totalPriceRaw) : BigDecimal.ZERO;
    }

    public OrderStatus getStatus() {
        return switch (orderStatus) {
            case "주문확인" -> OrderStatus.CONFIRMED;
            case "배송중"   -> OrderStatus.SHIPPING;
            case "배송완료" -> OrderStatus.COMPLETED;
            case "취소"     -> OrderStatus.CANCELLED;
            default         -> OrderStatus.PENDING;
        };
    }

    // ── 비즈니스 메서드 ──────────────────────────

    public void addOrderItem(OrderItem item) {
        this.orderItems.add(item);
        this.itemCount = this.orderItems.size();
    }

    public void setTotalPrice(BigDecimal price) {
        this.totalPriceRaw = price.intValue();
    }

    public void confirm() {
        validateStatus("주문접수", "결제 확인");
        this.orderStatus = "주문확인";
    }

    public void ship() {
        validateStatus("주문확인", "배송 시작");
        this.orderStatus = "배송중";
    }

    public void complete() {
        validateStatus("배송중", "배송 완료");
        this.orderStatus = "배송완료";
    }

    public void cancel() {
        if ("배송중".equals(orderStatus) || "배송완료".equals(orderStatus)) {
            throw new IllegalStateException("배송 중이거나 완료된 주문은 취소할 수 없습니다.");
        }
        this.orderStatus = "취소";
    }

    private void validateStatus(String required, String action) {
        if (!required.equals(this.orderStatus)) {
            throw new IllegalStateException(action + " 처리를 할 수 없는 상태입니다. 현재 상태: " + this.orderStatus);
        }
    }

    public boolean isOwnedBy(Long userId) {
        return this.userId.equals(userId);
    }
}
