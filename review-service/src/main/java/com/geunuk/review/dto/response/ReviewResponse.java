package com.geunuk.review.dto.response;
import com.geunuk.review.domain.Review;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;
@Getter @Builder
public class ReviewResponse {
    private String id;
    private Long productId;
    private Long userId;
    private Integer rating;
    private String content;
    private LocalDate reviewDate;
    public static ReviewResponse from(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .productId(r.getProductId())
                .userId(r.getUserId())
                .rating(r.getRating())
                .content(r.getContent())
                .reviewDate(r.getReviewDate())
                .build();
    }
}
