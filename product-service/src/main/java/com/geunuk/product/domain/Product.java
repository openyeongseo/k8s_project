package com.geunuk.product.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_key")
    private Long id;

    // item 테이블에 category_key FK 필요 → 기본값 1로 삽입 (크롤링 DB 기준)
    @Column(name = "category_key", nullable = false)
    @Builder.Default
    private Integer categoryKey = 1;

    @Column(name = "product_name", nullable = false, length = 500)
    private String name;

    // brand는 item 테이블에 없음 → DB 매핑 제외
    @Transient
    private String brand;

    // description은 item 테이블에 없음 → DB 매핑 제외
    @Transient
    private String description;

    // sale_price는 int → BigDecimal 매핑
    @Column(name = "sale_price", nullable = false)
    @Builder.Default
    private Integer salePrice = 0;

    @Column(name = "original_price")
    @Builder.Default
    private Integer originalPriceRaw = 0;

    // cnt = 재고 수량
    @Column(name = "cnt", nullable = false)
    @Builder.Default
    private Integer stock = 0;

    // category_key로 매핑하므로 category 문자열은 Transient
    @Transient
    private String category;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    // item 테이블에 status 컬럼 없음 → 항상 ACTIVE
    @Transient
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    // item 테이블에 created_at 없음 (crawled_at 사용)
    @Column(name = "crawled_at")
    private LocalDateTime createdAt;

    // ── 서비스 레이어에서 BigDecimal로 접근하는 메서드 ──

    public BigDecimal getPrice() {
        return salePrice != null ? BigDecimal.valueOf(salePrice) : BigDecimal.ZERO;
    }

    public BigDecimal getOriginalPrice() {
        return originalPriceRaw != null ? BigDecimal.valueOf(originalPriceRaw) : BigDecimal.ZERO;
    }

    // ── 비즈니스 메서드 ──────────────────────────

    public void update(String name, String description, BigDecimal price, Integer stock, String category) {
        this.name = name;
        this.description = description;
        this.salePrice = price != null ? price.intValue() : 0;
        this.stock = stock;
        this.category = category;
    }

    public void decreaseStock(int quantity) {
        if (this.stock < quantity) {
            throw new IllegalStateException("재고가 부족합니다. 현재 재고: " + this.stock);
        }
        this.stock -= quantity;
    }

    public void delete() {
        this.status = ProductStatus.DELETED;
    }
}
