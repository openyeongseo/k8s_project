package com.geunuk.product.service;

import com.geunuk.product.domain.Product;
import com.geunuk.product.domain.ProductStatus;
import com.geunuk.product.dto.request.ProductCreateRequest;
import com.geunuk.product.dto.request.ProductUpdateRequest;
import com.geunuk.product.dto.response.ProductListResponse;
import com.geunuk.product.dto.response.ProductResponse;
import com.geunuk.product.exception.ProductNotFoundException;
import com.geunuk.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * [Business Layer]
 * - 비즈니스 로직 처리
 * - Redis 캐시 관리 (@Cacheable, @CacheEvict)
 * - 트랜잭션 경계 설정
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductViewLogService productViewLogService; // MongoDB 로그용

    // ──────────────────────────────────────────────
    // 상품 목록 조회
    // Redis 캐시 키: "products::category::{category}::page::{page}"
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    @Cacheable(
        value = "products",
        key = "'category::' + (#category ?: 'all') + '::page::' + #page + '::size::' + #size",
        unless = "#result == null"
    )
    public ProductListResponse getProducts(String category, String keyword, int page, int size) {
        log.info("[ProductService] 상품 목록 조회 - category: {}, keyword: {}, page: {}", category, keyword, page);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<ProductResponse> productPage = productRepository
                .searchProducts(ProductStatus.DELETED, category, keyword, pageable)
                .map(ProductResponse::from);

        return ProductListResponse.from(productPage);
    }

    // ──────────────────────────────────────────────
    // 상품 단건 조회
    // Redis 캐시 키: "product::{id}"
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    @Cacheable(value = "product", key = "#id")
    public ProductResponse getProduct(Long id) {
        log.info("[ProductService] 상품 단건 조회 - id: {}", id);

        Product product = productRepository
                .findByIdAndStatusNot(id, ProductStatus.DELETED)
                .orElseThrow(() -> new ProductNotFoundException("상품을 찾을 수 없습니다. id: " + id));

        // MongoDB에 조회 로그 비동기 저장
        productViewLogService.saveViewLog(id);

        return ProductResponse.from(product);
    }

    // ──────────────────────────────────────────────
    // 상품 등록 (관리자)
    // 캐시 전체 무효화
    // ──────────────────────────────────────────────
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse createProduct(ProductCreateRequest request) {
        log.info("[ProductService] 상품 등록 - name: {}", request.getName());

        Product product = Product.builder()
                .name(request.getName())
                .brand(request.getBrand())
                .description(request.getDescription())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .stock(request.getStock())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .build();

        return ProductResponse.from(productRepository.save(product));
    }

    // ──────────────────────────────────────────────
    // 상품 수정 (관리자)
    // 해당 상품 캐시 + 목록 캐시 무효화
    // ──────────────────────────────────────────────
    @Transactional
    @CacheEvict(value = {"product", "products"}, allEntries = true)
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        log.info("[ProductService] 상품 수정 - id: {}", id);

        Product product = productRepository
                .findByIdAndStatusNot(id, ProductStatus.DELETED)
                .orElseThrow(() -> new ProductNotFoundException("상품을 찾을 수 없습니다. id: " + id));

        product.update(
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getStock(),
                request.getCategory()
        );

        // @Transactional → Dirty Checking으로 자동 save
        return ProductResponse.from(product);
    }

    // ──────────────────────────────────────────────
    // 상품 삭제 (소프트 딜리트, 관리자)
    // ──────────────────────────────────────────────
    @Transactional
    @CacheEvict(value = {"product", "products"}, allEntries = true)
    public void deleteProduct(Long id) {
        log.info("[ProductService] 상품 삭제 - id: {}", id);

        Product product = productRepository
                .findByIdAndStatusNot(id, ProductStatus.DELETED)
                .orElseThrow(() -> new ProductNotFoundException("상품을 찾을 수 없습니다. id: " + id));

        product.delete(); // status = DELETED (소프트 딜리트)
    }
}
