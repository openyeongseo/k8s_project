package com.geunuk.review.service;

import com.geunuk.review.domain.Review;
import com.geunuk.review.domain.ReviewStatus;
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
import org.springframework.transaction.annotation.Transactional;

/**
 * [Business Layer]
 * 리뷰 CRUD - 1인 1리뷰 제한, 소프트 딜리트
 */
@Slf4j @Service @RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public ReviewListResponse getReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ReviewResponse> result = reviewRepository
                .findByProductIdAndStatus(productId, ReviewStatus.ACTIVE, pageable)
                .map(ReviewResponse::from);
        Double avg = reviewRepository.findAvgRatingByProductId(productId);
        return ReviewListResponse.from(result, avg);
    }

    @Transactional
    public ReviewResponse createReview(Long userId, ReviewCreateRequest request) {
        // 1인 1리뷰 검사
        if (reviewRepository.existsByProductIdAndUserIdAndStatus(
                request.getProductId(), userId, ReviewStatus.ACTIVE)) {
            throw new DuplicateReviewException("이미 리뷰를 작성하셨습니다.");
        }

        Review review = Review.builder()
                .productId(request.getProductId()).userId(userId)
                .userName(request.getUserName()).rating(request.getRating())
                .content(request.getContent()).build();

        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findByIdAndStatus(reviewId, ReviewStatus.ACTIVE)
                .orElseThrow(() -> new ReviewNotFoundException("리뷰를 찾을 수 없습니다."));
        if (!review.isOwnedBy(userId))
            throw new UnauthorizedReviewAccessException("삭제 권한이 없습니다.");
        review.delete();
    }
}
