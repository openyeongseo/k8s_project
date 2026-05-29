package com.geunuk.order.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@NoArgsConstructor
@Schema(description = "주문 생성 요청")
public class OrderCreateRequest {

    @NotEmpty(message = "주문 상품이 없습니다.")
    @Valid
    @Schema(description = "주문 상품 목록")
    private List<OrderItemRequest> items;

    @NotBlank
    @Schema(description = "수령인 이름", example = "홍길동")
    private String receiverName;

    @NotBlank
    @Pattern(regexp = "^010-\\d{4}-\\d{4}$")
    @Schema(description = "수령인 연락처", example = "010-1234-5678")
    private String receiverPhone;

    @NotBlank
    @Schema(description = "배송 주소", example = "서울시 강남구 테헤란로 123")
    private String deliveryAddress;

    @Min(0)
    @Schema(description = "사용할 포인트", example = "5000")
    private Long usedPoint = 0L;

    @Getter
    @NoArgsConstructor
    @Schema(description = "주문 상품 항목")
    public static class OrderItemRequest {

        @NotNull
        @Schema(description = "상품 ID", example = "1")
        private Long productId;

        @NotBlank
        @Schema(description = "상품명 (주문 당시 스냅샷)", example = "프리미엄 육각 덤벨 세트")
        private String productName;

        @NotNull @DecimalMin("0.0")
        @Schema(description = "상품 단가 (주문 당시 스냅샷)", example = "89000")
        private BigDecimal price;

        @NotNull @Min(1)
        @Schema(description = "수량", example = "1")
        private Integer quantity;
    }
}
