package com.geunuk.review.service;
import com.geunuk.review.domain.Review;
import com.geunuk.review.dto.request.ReviewCreateRequest;
import com.geunuk.review.dto.response.ReviewListResponse;
import com.geunuk.review.dto.response.ReviewResponse;
import com.geunuk.review.exception.DuplicateReviewException;
import com.geunuk.review.exception.ReviewNotFoundException;
import com.geunuk.review.exception.UnauthorizedReviewAccessException;
import com.geunuk.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Slf4j @Service @RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public ReviewListResponse getReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reviewDate"));
        Page<ReviewResponse> result = reviewRepository
                .findByProductId(productId, pageable)
                .map(ReviewResponse::from);
        Double avg = reviewRepository.findByProductId(productId, Pageable.unpaged())
                .stream()
                .mapToInt(r -> r.getRating())
                .average()
                .orElse(0.0);
        return ReviewListResponse.from(result, avg);
    }

    public ReviewResponse createReview(Long userId, ReviewCreateRequest request) {
        if (reviewRepository.existsByProductIdAndUserId(request.getProductId(), userId)) {
            throw new DuplicateReviewException("이미 리뷰를 작성하셨습니다.");
        }
        Review review = Review.builder()
                .productId(request.getProductId())
                .userId(userId)
                .rating(request.getRating())
                .content(request.getContent())
                .build();
        return ReviewResponse.from(reviewRepository.save(review));
    }

    public void deleteReview(String reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("리뷰를 찾을 수 없습니다."));
        if (!review.isOwnedBy(userId))
            throw new UnauthorizedReviewAccessException("삭제 권한이 없습니다.");
        reviewRepository.delete(review);
    }
}
