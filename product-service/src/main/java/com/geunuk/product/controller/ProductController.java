package com.geunuk.product.controller;

import com.geunuk.product.dto.request.ProductCreateRequest;
import com.geunuk.product.dto.request.ProductUpdateRequest;
import com.geunuk.product.dto.response.ApiResponse;
import com.geunuk.product.dto.response.ProductListResponse;
import com.geunuk.product.dto.response.ProductResponse;
import com.geunuk.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * [Presentation Layer]
 * - HTTP 요청/응답 처리만 담당
 * - 비즈니스 로직은 Service에 위임
 * - DTO ↔ 응답 변환
 */
@Tag(name = "Product API", description = "상품 관리 API")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ──────────────────────────────────────────────
    // GET /api/products
    // 상품 목록 조회 (카테고리, 검색, 페이징)
    // ──────────────────────────────────────────────
    @Operation(
        summary = "상품 목록 조회",
        description = "카테고리/키워드 필터 및 페이징을 지원합니다. Redis 캐시 우선 조회."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<ProductListResponse>> getProducts(
            @Parameter(description = "카테고리 (null이면 전체)", example = "덤벨/바벨")
            @RequestParam(required = false) String category,

            @Parameter(description = "검색 키워드 (상품명/브랜드)", example = "덤벨")
            @RequestParam(required = false) String keyword,

            @Parameter(description = "페이지 번호 (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        ProductListResponse response = productService.getProducts(category, keyword, page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ──────────────────────────────────────────────
    // GET /api/products/{id}
    // 상품 단건 조회
    // ──────────────────────────────────────────────
    @Operation(summary = "상품 단건 조회", description = "상품 ID로 상세 정보를 조회합니다. 조회 로그 MongoDB 저장.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(
            @Parameter(description = "상품 ID", example = "1")
            @PathVariable Long id
    ) {
        ProductResponse response = productService.getProduct(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ──────────────────────────────────────────────
    // POST /api/products
    // 상품 등록 (관리자)
    // ──────────────────────────────────────────────
    @Operation(summary = "상품 등록 (관리자)", description = "새로운 상품을 등록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductCreateRequest request
    ) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("상품이 등록되었습니다.", response));
    }

    // ──────────────────────────────────────────────
    // PUT /api/products/{id}
    // 상품 수정 (관리자)
    // ──────────────────────────────────────────────
    @Operation(summary = "상품 수정 (관리자)", description = "상품 정보를 수정합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.ok("상품이 수정되었습니다.", response));
    }

    // ──────────────────────────────────────────────
    // DELETE /api/products/{id}
    // 상품 삭제 (소프트 딜리트, 관리자)
    // ──────────────────────────────────────────────
    @Operation(summary = "상품 삭제 (관리자)", description = "상품을 소프트 딜리트합니다. (status = DELETED)")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable Long id
    ) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("상품이 삭제되었습니다.", null));
    }
}
