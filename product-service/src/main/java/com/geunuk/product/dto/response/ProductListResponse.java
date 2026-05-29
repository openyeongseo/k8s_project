package com.geunuk.product.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Builder
@Schema(description = "상품 목록 응답 (페이징)")
public class ProductListResponse {

    @Schema(description = "상품 목록")
    private List<ProductResponse> products;

    @Schema(description = "전체 상품 수", example = "120")
    private long totalElements;

    @Schema(description = "전체 페이지 수", example = "12")
    private int totalPages;

    @Schema(description = "현재 페이지 (0-based)", example = "0")
    private int currentPage;

    @Schema(description = "페이지 크기", example = "10")
    private int pageSize;

    @Schema(description = "마지막 페이지 여부")
    private boolean last;

    public static ProductListResponse from(Page<ProductResponse> page) {
        return ProductListResponse.builder()
                .products(page.getContent())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .last(page.isLast())
                .build();
    }
}
