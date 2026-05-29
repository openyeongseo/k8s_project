package com.geunuk.auth.controller;

import com.geunuk.auth.dto.request.LoginRequest;
import com.geunuk.auth.dto.request.PasswordChangeRequest;
import com.geunuk.auth.dto.request.ProfileUpdateRequest;
import com.geunuk.auth.dto.request.SignUpRequest;
import com.geunuk.auth.dto.response.ApiResponse;
import com.geunuk.auth.dto.response.TokenResponse;
import com.geunuk.auth.dto.response.UserResponse;
import com.geunuk.auth.service.AuthService;
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
 * HTTP 요청/응답 처리만 담당
 * userId는 Gateway/Filter에서 검증 후 X-User-Id 헤더로 전달
 */
@Tag(name = "Auth API", description = "인증/회원 관리 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ──────────────────────────────────────────────
    // POST /api/auth/signup
    // ──────────────────────────────────────────────
    @Operation(summary = "회원가입", description = "이메일/비밀번호로 가입. 가입 완료 시 100,000P 자동 지급.")
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponse>> signUp(
            @Valid @RequestBody SignUpRequest request
    ) {
        UserResponse response = authService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("회원가입이 완료되었습니다. 100,000P가 지급되었습니다.", response));
    }

    // ──────────────────────────────────────────────
    // POST /api/auth/login
    // ──────────────────────────────────────────────
    @Operation(summary = "로그인", description = "이메일/비밀번호 로그인. Access Token + Refresh Token 반환.")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        TokenResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("로그인되었습니다.", response));
    }

    // ──────────────────────────────────────────────
    // POST /api/auth/logout
    // ──────────────────────────────────────────────
    @Operation(summary = "로그아웃", description = "Access Token 블랙리스트 등록 + Refresh Token 삭제.")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("Authorization") String authorization
    ) {
        String accessToken = authorization.replace("Bearer ", "");
        authService.logout(userId, accessToken);
        return ResponseEntity.ok(ApiResponse.ok("로그아웃되었습니다.", null));
    }

    // ──────────────────────────────────────────────
    // POST /api/auth/reissue
    // ──────────────────────────────────────────────
    @Operation(summary = "토큰 재발급", description = "Refresh Token으로 새 Access Token 발급.")
    @PostMapping("/reissue")
    public ResponseEntity<ApiResponse<TokenResponse>> reissue(
            @RequestHeader("Refresh-Token") String refreshToken
    ) {
        TokenResponse response = authService.reissue(refreshToken);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ──────────────────────────────────────────────
    // GET /api/auth/me
    // ──────────────────────────────────────────────
    @Operation(summary = "내 정보 조회", description = "로그인한 회원의 정보를 반환.")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyInfo(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId
    ) {
        UserResponse response = authService.getMyInfo(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ──────────────────────────────────────────────
    // PUT /api/auth/me
    // ──────────────────────────────────────────────
    @Operation(summary = "내 정보 수정", description = "이름, 휴대폰, 주소 수정.")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        UserResponse response = authService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("정보가 수정되었습니다.", response));
    }

    // ──────────────────────────────────────────────
    // PATCH /api/auth/me/password
    // ──────────────────────────────────────────────
    @Operation(summary = "비밀번호 변경")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody PasswordChangeRequest request
    ) {
        authService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("비밀번호가 변경되었습니다.", null));
    }

    // ──────────────────────────────────────────────
    // DELETE /api/auth/me
    // 회원 탈퇴 (소프트 딜리트)
    // ──────────────────────────────────────────────
    @Operation(summary = "회원 탈퇴", description = "계정 상태를 WITHDRAWN으로 변경 (소프트 딜리트).")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> withdraw(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("Authorization") String authorization
    ) {
        String accessToken = authorization.replace("Bearer ", "");
        authService.withdraw(userId, accessToken);
        return ResponseEntity.ok(ApiResponse.ok("탈퇴 처리되었습니다.", null));
    }
}
