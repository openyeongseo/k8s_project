package com.geunuk.review.dto.response;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;
import java.util.List;

@Getter @Builder
public class ReviewListResponse {
    private List<ReviewResponse> reviews;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private Double avgRating;

    public static ReviewListResponse from(Page<ReviewResponse> page, Double avgRating) {
        return ReviewListResponse.builder()
                .reviews(page.getContent()).totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages()).currentPage(page.getNumber())
                .avgRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .build();
    }
}
