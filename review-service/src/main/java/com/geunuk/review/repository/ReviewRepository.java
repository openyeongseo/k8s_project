package com.geunuk.review.repository;

import com.geunuk.review.domain.Review;
import com.geunuk.review.domain.ReviewStatus;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductIdAndStatus(Long productId, ReviewStatus status, Pageable pageable);
    Optional<Review> findByIdAndStatus(Long id, ReviewStatus status);
    boolean existsByProductIdAndUserIdAndStatus(Long productId, Long userId, ReviewStatus status);
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productId = :productId AND r.status = 'ACTIVE'")
    Double findAvgRatingByProductId(@Param("productId") Long productId);
}
