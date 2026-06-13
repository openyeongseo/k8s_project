package com.geunuk.review.controller;
import com.geunuk.review.dto.request.ReviewCreateRequest;
import com.geunuk.review.dto.response.*;
import com.geunuk.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@Tag(name = "Review API", description = "리뷰 관리 API")
@RestController @RequestMapping("/api/reviews") @RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    @Operation(summary = "상품 리뷰 목록 조회")
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<ReviewListResponse>> getReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviews(productId, page, size)));
    }
    @Operation(summary = "리뷰 등록 (1인 1리뷰)")
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ReviewCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("리뷰가 등록되었습니다.", reviewService.createReview(userId, request)));
    }
    @Operation(summary = "리뷰 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable String id,
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        reviewService.deleteReview(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("삭제되었습니다.", null));
    }
}
