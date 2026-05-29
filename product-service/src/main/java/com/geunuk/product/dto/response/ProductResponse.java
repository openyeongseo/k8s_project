package com.geunuk.product.dto.response;

import com.geunuk.product.domain.Product;
import com.geunuk.product.domain.ProductStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Redis 직렬화를 위해 Serializable 구현
 */
@Getter
@Builder
@Schema(description = "상품 단건 응답")
public class ProductResponse implements Serializable {

    @Schema(description = "상품 ID", example = "1")
    private Long id;

    @Schema(description = "상품명", example = "프리미엄 육각 덤벨 세트")
    private String name;

    @Schema(description = "브랜드", example = "GEUNUK")
    private String brand;

    @Schema(description = "상품 설명")
    private String description;

    @Schema(description = "판매가", example = "89000")
    private BigDecimal price;

    @Schema(description = "정가", example = "99000")
    private BigDecimal originalPrice;

    @Schema(description = "재고", example = "100")
    private Integer stock;

    @Schema(description = "카테고리", example = "덤벨/바벨")
    private String category;

    @Schema(description = "이미지 URL")
    private String imageUrl;

    @Schema(description = "상품 상태")
    private ProductStatus status;

    @Schema(description = "등록일시")
    private LocalDateTime createdAt;

    // Entity → DTO 변환 팩토리 메서드
    public static ProductResponse from(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .brand(product.getBrand())
                .description(product.getDescription())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .stock(product.getStock())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
