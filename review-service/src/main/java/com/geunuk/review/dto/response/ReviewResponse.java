package com.geunuk.review.dto.response;

import com.geunuk.review.domain.Review;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Builder
public class ReviewResponse {
    private Long id;
    private Long productId;
    private Long userId;
    private String userName;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;

    public static ReviewResponse from(Review r) {
        return ReviewResponse.builder()
                .id(r.getId()).productId(r.getProductId()).userId(r.getUserId())
                .userName(r.getUserName()).rating(r.getRating())
                .content(r.getContent()).createdAt(r.getCreatedAt()).build();
    }
}
