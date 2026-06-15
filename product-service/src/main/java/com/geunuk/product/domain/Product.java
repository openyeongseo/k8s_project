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
    @Column(name = "category_key", nullable = false)
    @Builder.Default
    private Integer categoryKey = 1;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_key", insertable = false, updatable = false)
    private Category categoryEntity;
    @Column(name = "product_name", nullable = false, length = 500)
    private String name;
    @Transient
    private String brand;
    @Transient
    private String description;
    @Column(name = "sale_price", nullable = false)
    @Builder.Default
    private Integer salePrice = 0;
    @Column(name = "original_price")
    @Builder.Default
    private Integer originalPriceRaw = 0;
    @Column(name = "stock_cnt", nullable = false)
    @Builder.Default
    private Integer stock = 0;
    @Getter(AccessLevel.NONE)
    @Transient
    private String category;
    @Column(name = "image_url", length = 1000)
    private String imageUrl;
    @Transient
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;
    @Transient
    private LocalDateTime createdAt;
    public BigDecimal getPrice() {
        return salePrice != null ? BigDecimal.valueOf(salePrice) : BigDecimal.ZERO;
    }
    public BigDecimal getOriginalPrice() {
        return originalPriceRaw != null ? BigDecimal.valueOf(originalPriceRaw) : BigDecimal.ZERO;
    }
    /**
     * 카테고리(소분류) 반환 - category_key로 조인된 Category의 small_category 사용
     * 조인 실패 시 기존 transient category 값을 fallback으로 사용
     */
    public String getCategory() {
        if (categoryEntity != null) {
            return categoryEntity.getSmallCategory();
        }
        return category;
    }
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
