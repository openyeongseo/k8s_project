package com.geunuk.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID Token은 필수입니다.")
    private String idToken;
}
