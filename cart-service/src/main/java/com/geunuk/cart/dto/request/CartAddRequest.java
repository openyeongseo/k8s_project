package com.geunuk.cart.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@Schema(description = "장바구니 담기 요청")
public class CartAddRequest {

    @NotNull @Schema(description = "상품 ID", example = "1")
    private Long productId;

    @NotBlank @Schema(description = "상품명", example = "프리미엄 덤벨 세트")
    private String productName;

    @NotNull @DecimalMin("0.0") @Schema(description = "단가", example = "89000")
    private BigDecimal price;

    @NotNull @Min(1) @Schema(description = "수량", example = "1")
    private Integer quantity;

    @Schema(description = "이미지 URL")
    private String imageUrl;
}
