package com.geunuk.product.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@Schema(description = "상품 등록 요청")
public class ProductCreateRequest {

    @NotBlank(message = "상품명은 필수입니다.")
    @Size(max = 200)
    @Schema(description = "상품명", example = "프리미엄 육각 덤벨 세트")
    private String name;

    @NotBlank(message = "브랜드는 필수입니다.")
    @Schema(description = "브랜드", example = "GEUNUK")
    private String brand;

    @Schema(description = "상품 설명", example = "논슬립 그립, 고내구성 철제")
    private String description;

    @NotNull(message = "가격은 필수입니다.")
    @DecimalMin(value = "0.0", inclusive = false)
    @Schema(description = "판매가", example = "89000")
    private BigDecimal price;

    @Schema(description = "정가(할인 전)", example = "99000")
    private BigDecimal originalPrice;

    @NotNull(message = "재고는 필수입니다.")
    @Min(0)
    @Schema(description = "재고 수량", example = "100")
    private Integer stock;

    @NotBlank(message = "카테고리는 필수입니다.")
    @Schema(description = "카테고리", example = "덤벨/바벨")
    private String category;

    @Schema(description = "상품 이미지 URL")
    private String imageUrl;
}
