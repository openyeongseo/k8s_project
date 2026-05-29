package com.geunuk.cart.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.util.List;

@Getter @Builder
public class CartListResponse {
    private List<CartResponse> items;
    private int totalCount;
    private BigDecimal totalPrice;

    public static CartListResponse from(List<CartResponse> items) {
        BigDecimal total = items.stream()
                .map(CartResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return CartListResponse.builder()
                .items(items).totalCount(items.size()).totalPrice(total).build();
    }
}
