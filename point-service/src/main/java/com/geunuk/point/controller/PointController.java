package com.geunuk.point.controller;

import com.geunuk.point.dto.request.PointDeductRequest;
import com.geunuk.point.dto.request.PointGrantRequest;
import com.geunuk.point.dto.response.ApiResponse;
import com.geunuk.point.dto.response.PointBalanceResponse;
import com.geunuk.point.dto.response.PointHistoryResponse;
import com.geunuk.point.service.PointService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * GET  /api/points/balance       — 잔액 조회
 * GET  /api/points/history       — 내역 조회
 * POST /api/points/grant         — 적립 (서비스 간 호출용)
 * POST /api/points/deduct        — 차감
 */
@Tag(name = "Point API", description = "포인트 관리 API")
@RestController
@RequestMapping("/api/points")
@RequiredArgsConstructor
public class PointController {

    private final PointService pointService;

    @Operation(summary = "포인트 잔액 조회")
    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<PointBalanceResponse>> getBalance(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(pointService.getBalance(userId)));
    }

    @Operation(summary = "포인트 내역 조회")
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<PointHistoryResponse>>> getHistory(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(pointService.getHistory(userId, page, size)));
    }

    @Operation(summary = "포인트 적립 (서비스 내부 호출)", description = "auth-service 신규 가입 시 호출")
    @PostMapping("/grant")
    public ResponseEntity<ApiResponse<PointBalanceResponse>> grant(
            @Valid @RequestBody PointGrantRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("포인트가 적립되었습니다.", pointService.grant(request)));
    }

    @Operation(summary = "포인트 차감 (주문 시 사용)")
    @PostMapping("/deduct")
    public ResponseEntity<ApiResponse<PointBalanceResponse>> deduct(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody PointDeductRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("포인트가 차감되었습니다.", pointService.deduct(userId, request)));
    }
}
