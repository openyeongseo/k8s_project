package com.geunuk.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "내 정보 수정 요청")
public class ProfileUpdateRequest {

    @NotBlank @Size(max = 50)
    @Schema(description = "이름", example = "홍길동")
    private String name;

    @Pattern(regexp = "^010-\\d{4}-\\d{4}$")
    @Schema(description = "휴대폰", example = "010-9999-8888")
    private String phone;

    @Schema(description = "배송지 주소", example = "서울시 강남구 테헤란로 123")
    private String address;
}
