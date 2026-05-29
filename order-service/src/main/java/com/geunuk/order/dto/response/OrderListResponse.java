package com.geunuk.order.dto.response;

import com.geunuk.order.domain.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@Schema(description = "주문 목록 응답 (페이징)")
public class OrderListResponse {

    private List<OrderSummary> orders;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private boolean last;

    @Getter
    @Builder
    public static class OrderSummary {
        private Long id;
        private BigDecimal totalPrice;
        private OrderStatus status;
        private int itemCount;
        private String firstItemName; // 대표 상품명
        private LocalDateTime createdAt;
    }

    public static OrderListResponse from(Page<com.geunuk.order.domain.Order> page) {
        List<OrderSummary> summaries = page.getContent().stream()
                .map(o -> OrderSummary.builder()
                        .id(o.getId())
                        .totalPrice(o.getTotalPrice())
                        .status(o.getStatus())
                        .itemCount(o.getOrderItems().size())
                        .firstItemName(o.getOrderItems().isEmpty() ? ""
                                : o.getOrderItems().get(0).getProductName())
                        .createdAt(o.getCreatedAt())
                        .build())
                .toList();

        return OrderListResponse.builder()
                .orders(summaries)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentPage(page.getNumber())
                .last(page.isLast())
                .build();
    }
}
