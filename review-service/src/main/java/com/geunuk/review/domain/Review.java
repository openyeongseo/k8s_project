package com.geunuk.review.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;

@Document(collection = "review")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Review {

    @Id
    private String id;

    @Field("item_key")
    private Long productId;

    @Field("cust_key")
    private Long userId;

    @Field("star")
    @Builder.Default
    private Integer rating = 0;

    @Field("content")
    private String content;

    @Field("review_date")
    private LocalDate reviewDate;

    @Builder.Default
    private ReviewStatus status = ReviewStatus.ACTIVE;

    public void delete()                  { this.status = ReviewStatus.DELETED; }
    public boolean isOwnedBy(Long userId) { return this.userId != null && this.userId.equals(userId); }
}
