package com.geunuk.product.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "category")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {

    @Id
    @Column(name = "category_key")
    private Integer categoryKey;

    @Column(name = "big_category")
    private String bigCategory;

    @Column(name = "small_category")
    private String smallCategory;
}
