package com.geunuk.order.kafka.producer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Kafka 토픽: order.created
 * 설계도 흐름:
 *   주문 생성 → Kafka(order.created) → Order Event Consumer
 *     ├── 재고 차감 (inventory-service)
 *     └── MongoDB (order_event_logs)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreatedEvent {

    private Long orderId;
    private Long userId;
    private BigDecimal totalPrice;
    private String receiverName;
    private String deliveryAddress;
    private List<OrderItemEvent> items;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemEvent {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal price;
    }
}
