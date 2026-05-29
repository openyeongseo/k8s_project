package com.geunuk.cart.controller;

import com.geunuk.cart.dto.request.CartAddRequest;
import com.geunuk.cart.dto.request.CartUpdateRequest;
import com.geunuk.cart.dto.response.ApiResponse;
import com.geunuk.cart.dto.response.CartListResponse;
import com.geunuk.cart.dto.response.CartResponse;
import com.geunuk.cart.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * [Presentation Layer]
 * GET    /api/cart          — 장바구니 조회
 * POST   /api/cart          — 상품 담기
 * PATCH  /api/cart/{productId} — 수량 변경
 * DELETE /api/cart/{productId} — 단건 삭제
 * DELETE /api/cart          — 전체 비우기
 */
@Tag(name = "Cart API", description = "장바구니 API (Redis)")
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @Operation(summary = "장바구니 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<CartListResponse>> getCart(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.getCart(userId)));
    }

    @Operation(summary = "상품 담기", description = "동일 상품 재담기 시 수량 합산")
    @PostMapping
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CartAddRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("장바구니에 담겼습니다.", cartService.addItem(userId, request)));
    }

    @Operation(summary = "수량 변경")
    @PatchMapping("/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long productId,
            @Valid @RequestBody CartUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.updateItem(userId, productId, request)));
    }

    @Operation(summary = "상품 삭제")
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long productId) {
        cartService.removeItem(userId, productId);
        return ResponseEntity.ok(ApiResponse.ok("삭제되었습니다.", null));
    }

    @Operation(summary = "장바구니 전체 비우기")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.ok("장바구니를 비웠습니다.", null));
    }
}
