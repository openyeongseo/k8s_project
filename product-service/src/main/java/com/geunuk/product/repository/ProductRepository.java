package com.geunuk.product.repository;

import com.geunuk.product.domain.Product;
import com.geunuk.product.domain.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // 삭제 상태 없으므로 전체 조회 (item 테이블 기준)
    Optional<Product> findById(Long id);

    // status 필터 무시 버전 (item 테이블엔 status 없음)
    default Optional<Product> findByIdAndStatusNot(Long id, ProductStatus status) {
        return findById(id);
    }

    // 전체 상품 페이징 (category_key 기반이지만 keyword 검색은 product_name으로)
    @Query("SELECT p FROM Product p " +
           "WHERE (:keyword IS NULL OR p.name LIKE %:keyword%)")
    Page<Product> searchProducts(
            @Param("status") ProductStatus status,
            @Param("category") String category,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
