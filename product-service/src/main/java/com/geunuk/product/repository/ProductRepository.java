package com.geunuk.product.repository;

import com.geunuk.product.domain.Product;
import com.geunuk.product.domain.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * [Data Access Layer]
 * JPA Repository - MariaDB 접근
 */
public interface ProductRepository extends JpaRepository<Product, Long> {

    // 삭제되지 않은 상품 단건 조회
    Optional<Product> findByIdAndStatusNot(Long id, ProductStatus status);

    // 카테고리별 + 상태 필터 페이징 조회
    Page<Product> findByCategoryAndStatusNot(String category, ProductStatus status, Pageable pageable);

    // 상태 필터 전체 페이징 조회
    Page<Product> findByStatusNot(ProductStatus status, Pageable pageable);

    // 상품명 검색 (LIKE) + 상태 필터
    @Query("SELECT p FROM Product p " +
           "WHERE p.status != :status " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:keyword IS NULL OR p.name LIKE %:keyword% OR p.brand LIKE %:keyword%)")
    Page<Product> searchProducts(
            @Param("status") ProductStatus status,
            @Param("category") String category,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
