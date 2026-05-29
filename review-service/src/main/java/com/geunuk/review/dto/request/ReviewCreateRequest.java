package com.geunuk.review.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class ReviewCreateRequest {
    @NotNull private Long productId;
    @NotNull @Min(1) @Max(5) private Integer rating;
    @NotBlank @Size(min = 5, max = 500) private String content;
    @NotBlank private String userName;
}
