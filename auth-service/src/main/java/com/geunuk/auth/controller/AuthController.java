package com.geunuk.auth.controller;

import com.geunuk.auth.dto.request.GoogleLoginRequest;
import com.geunuk.auth.dto.request.LoginRequest;
import com.geunuk.auth.dto.request.PasswordChangeRequest;
import com.geunuk.auth.dto.request.ProfileUpdateRequest;
import com.geunuk.auth.dto.request.SignUpRequest;
import com.geunuk.auth.dto.response.ApiResponse;
import com.geunuk.auth.dto.response.TokenResponse;
import com.geunuk.auth.dto.response.UserResponse;
import com.geunuk.auth.service.AuthService;
import com.geunuk.auth.service.GoogleOAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth API", description = "인증/회원 관리 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuthService googleOAuthService;

    @Operation(summary = "회원가입")
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponse>> signUp(
            @Valid @RequestBody SignUpRequest request
    ) {
        UserResponse response = authService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("회원가입이 완료되었습니다. 100,000P가 지급되었습니다.", response));
    }

    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        TokenResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("로그인되었습니다.", response));
    }

    @Operation(summary = "구글 로그인/회원가입", description = "프론트에서 받은 Google ID Token으로 로그인. 신규 유저면 자동 가입.")
    @PostMapping("/oauth2/google")
    public ResponseEntity<ApiResponse<TokenResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request
    ) {
        TokenResponse response = googleOAuthService.loginWithGoogle(request.getIdToken());
        return ResponseEntity.ok(ApiResponse.ok("구글 로그인되었습니다.", response));
    }

    @Operation(summary = "로그아웃")
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

    @Operation(summary = "토큰 재발급")
    @PostMapping("/reissue")
    public ResponseEntity<ApiResponse<TokenResponse>> reissue(
            @RequestHeader("Refresh-Token") String refreshToken
    ) {
        TokenResponse response = authService.reissue(refreshToken);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "내 정보 조회")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyInfo(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId
    ) {
        UserResponse response = authService.getMyInfo(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "내 정보 수정")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        UserResponse response = authService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("정보가 수정되었습니다.", response));
    }

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

    @Operation(summary = "회원 탈퇴")
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
