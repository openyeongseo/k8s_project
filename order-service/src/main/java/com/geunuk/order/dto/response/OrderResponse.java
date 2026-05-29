package com.geunuk.order.dto.response;

import com.geunuk.order.domain.Order;
import com.geunuk.order.domain.OrderItem;
import com.geunuk.order.domain.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@Schema(description = "주문 상세 응답")
public class OrderResponse {

    private Long id;
    private Long userId;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private String receiverName;
    private String receiverPhone;
    private String deliveryAddress;
    private Long usedPoint;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @Schema(description = "주문 상품 항목")
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal subtotal;
    }

    public static OrderResponse from(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .deliveryAddress(order.getDeliveryAddress())
                .usedPoint(order.getUsedPoint())
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
