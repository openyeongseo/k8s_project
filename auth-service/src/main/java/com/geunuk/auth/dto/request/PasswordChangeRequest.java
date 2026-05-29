package com.geunuk.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "비밀번호 변경 요청")
public class PasswordChangeRequest {

    @NotBlank
    @Schema(description = "현재 비밀번호")
    private String currentPassword;

    @NotBlank @Size(min = 8)
    @Schema(description = "새 비밀번호 (8자 이상)")
    private String newPassword;
}
