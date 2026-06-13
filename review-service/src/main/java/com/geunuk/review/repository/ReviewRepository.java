package com.geunuk.review.repository;

import com.geunuk.review.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {
    Page<Review> findByProductId(Long productId, Pageable pageable);
    Optional<Review> findById(String id);
    boolean existsByProductIdAndUserId(Long productId, Long userId);
}
