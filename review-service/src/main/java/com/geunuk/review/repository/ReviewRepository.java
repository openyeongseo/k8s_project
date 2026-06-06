package com.geunuk.review.repository;

import com.geunuk.review.domain.Review;
import com.geunuk.review.domain.ReviewStatus;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // review 테이블에 status 없음 → item_key 기준으로만 조회
    @Query("SELECT r FROM Review r WHERE r.productId = :productId")
    Page<Review> findByProductIdAndStatus(
            @Param("productId") Long productId,
            ReviewStatus status,   // 파라미터는 유지 (서비스 레이어 호환)
            Pageable pageable);

    // status 없으므로 id로만 조회
    @Query("SELECT r FROM Review r WHERE r.id = :id")
    Optional<Review> findByIdAndStatus(
            @Param("id") Long id,
            ReviewStatus status);

    // 1인 1리뷰: item_key + cust_key 기준 (source_review_id unique 있음)
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
           "FROM Review r WHERE r.productId = :productId AND r.userId = :userId")
    boolean existsByProductIdAndUserIdAndStatus(
            @Param("productId") Long productId,
            @Param("userId") Long userId,
            ReviewStatus status);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productId = :productId")
    Double findAvgRatingByProductId(@Param("productId") Long productId);
}
