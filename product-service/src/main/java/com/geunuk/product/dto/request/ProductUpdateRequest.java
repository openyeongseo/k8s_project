package com.geunuk.product.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@Schema(description = "상품 수정 요청")
public class ProductUpdateRequest {

    @NotBlank(message = "상품명은 필수입니다.")
    @Schema(description = "상품명", example = "프리미엄 육각 덤벨 세트 (개정판)")
    private String name;

    @Schema(description = "상품 설명")
    private String description;

    @NotNull(message = "가격은 필수입니다.")
    @DecimalMin(value = "0.0", inclusive = false)
    @Schema(description = "판매가", example = "85000")
    private BigDecimal price;

    @NotNull(message = "재고는 필수입니다.")
    @Min(0)
    @Schema(description = "재고 수량", example = "50")
    private Integer stock;

    @NotBlank(message = "카테고리는 필수입니다.")
    @Schema(description = "카테고리", example = "덤벨/바벨")
    private String category;
}
