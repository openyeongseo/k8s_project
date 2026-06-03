package com.geunuk.auth.dto.response;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
@Getter
@Builder
@Schema(description = "JWT 토큰 응답")
public class TokenResponse {
    @Schema(description = "사용자 ID")
    private Long userId;
    @Schema(description = "Access Token (Bearer)")
    private String accessToken;
    @Schema(description = "Refresh Token")
    private String refreshToken;
    @Schema(description = "토큰 타입", example = "Bearer")
    @Builder.Default
    private String tokenType = "Bearer";
    @Schema(description = "Access Token 만료 시간(초)", example = "1800")
    private long expiresIn;
}
