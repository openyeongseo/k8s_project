package com.geunuk.review.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews",
       uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "user_id"}))
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED) @AllArgsConstructor @Builder
public class Review {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false) private Long productId;
    @Column(name = "user_id", nullable = false)    private Long userId;

    @Column(name = "user_name", nullable = false, length = 50)
    private String userName;

    @Column(nullable = false)
    private Integer rating;   // 1~5

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10) @Builder.Default
    private ReviewStatus status = ReviewStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public void delete()                         { this.status = ReviewStatus.DELETED; }
    public boolean isOwnedBy(Long userId)        { return this.userId.equals(userId); }
}
