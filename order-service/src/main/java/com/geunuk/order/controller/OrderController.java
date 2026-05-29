package com.geunuk.order.controller;

import com.geunuk.order.dto.request.OrderCreateRequest;
import com.geunuk.order.dto.request.OrderStatusUpdateRequest;
import com.geunuk.order.dto.response.ApiResponse;
import com.geunuk.order.dto.response.OrderListResponse;
import com.geunuk.order.dto.response.OrderResponse;
import com.geunuk.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * [Presentation Layer]
 * userId는 Istio/Gateway가 검증 후 X-User-Id 헤더로 주입
 */
@Tag(name = "Order API", description = "주문 관리 API")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    // GET /api/orders  — 내 주문 목록
    @Operation(summary = "내 주문 목록 조회", description = "페이징 지원. 최신순 정렬.")
    @GetMapping
    public ResponseEntity<ApiResponse<OrderListResponse>> getMyOrders(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getMyOrders(userId, page, size)));
    }

    // GET /api/orders/{id}  — 주문 단건 조회
    @Operation(summary = "주문 단건 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @PathVariable Long id,
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrder(id, userId)));
    }

    // POST /api/orders  — 주문 생성 + Kafka 이벤트 발행
    @Operation(
        summary = "주문 생성",
        description = "주문 생성 후 Kafka order.created 이벤트 발행 → 재고 차감, 이벤트 로그 저장"
    )
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody OrderCreateRequest request
    ) {
        OrderResponse response = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("주문이 생성되었습니다.", response));
    }

    // PATCH /api/orders/{id}/status  — 주문 상태 변경 (관리자)
    @Operation(summary = "주문 상태 변경 (관리자)", description = "CONFIRMED / SHIPPING / COMPLETED / CANCELLED")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("주문 상태가 변경되었습니다.", orderService.updateStatus(id, request)));
    }

    // DELETE /api/orders/{id}  — 주문 취소 (본인)
    @Operation(summary = "주문 취소", description = "배송 중/완료 상태는 취소 불가")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.ok("주문이 취소되었습니다.", orderService.cancelOrder(id, userId)));
    }
}
