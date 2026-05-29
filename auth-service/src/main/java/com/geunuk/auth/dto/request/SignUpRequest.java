package com.geunuk.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "회원가입 요청")
public class SignUpRequest {

    @NotBlank @Email
    @Schema(description = "이메일", example = "user@geunuk.kr")
    private String email;

    @NotBlank @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
    @Schema(description = "비밀번호 (8자 이상)", example = "password123!")
    private String password;

    @NotBlank @Size(max = 50)
    @Schema(description = "이름", example = "홍길동")
    private String name;

    @Pattern(regexp = "^010-\\d{4}-\\d{4}$", message = "010-XXXX-XXXX 형식으로 입력해주세요.")
    @Schema(description = "휴대폰", example = "010-1234-5678")
    private String phone;
}
