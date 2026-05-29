package com.geunuk.auth.dto.response;

import com.geunuk.auth.domain.Role;
import com.geunuk.auth.domain.User;
import com.geunuk.auth.domain.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@Schema(description = "회원 정보 응답")
public class UserResponse {

    @Schema(description = "회원 ID", example = "1")
    private Long id;

    @Schema(description = "이메일", example = "user@geunuk.kr")
    private String email;

    @Schema(description = "이름", example = "홍길동")
    private String name;

    @Schema(description = "휴대폰", example = "010-1234-5678")
    private String phone;

    @Schema(description = "주소")
    private String address;

    @Schema(description = "권한")
    private Role role;

    @Schema(description = "계정 상태")
    private UserStatus status;

    @Schema(description = "가입일시")
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
