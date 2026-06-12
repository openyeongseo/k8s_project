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
    Optional<Product> findById(Long id);
    default Optional<Product> findByIdAndStatusNot(Long id, ProductStatus status) {
        return findById(id);
    }
    @Query("SELECT p FROM Product p WHERE (:keyword IS NULL OR p.name LIKE %:keyword%)")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);
}
