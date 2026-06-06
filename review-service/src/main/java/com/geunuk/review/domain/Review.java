package com.geunuk.review.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_key")
    private Long id;

    @Column(name = "item_key", nullable = false)
    private Long productId;

    @Column(name = "cust_key")
    private Long userId;

    // review_writer 컬럼을 userName으로 매핑
    @Column(name = "review_writer", length = 100)
    private String userName;

    // star → rating 매핑
    @Column(name = "star", nullable = false)
    @Builder.Default
    private Integer rating = 0;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // review 테이블에 status 없음 → Transient (논리 삭제 미지원)
    @Transient
    @Builder.Default
    private ReviewStatus status = ReviewStatus.ACTIVE;

    @Column(name = "review_date")
    private LocalDate reviewDate;

    @Column(name = "crawled_at")
    private LocalDateTime createdAt;

    public void delete()                         { this.status = ReviewStatus.DELETED; }
    public boolean isOwnedBy(Long userId)        { return this.userId != null && this.userId.equals(userId); }
}
