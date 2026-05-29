package com.geunuk.product.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * [Business Layer - 부가 서비스]
 * 상품 조회 로그를 MongoDB에 비동기 저장
 * Application 설계도의 "MongoDB product_view_logs" 에 해당
 */
@Slf4j
@Service
public class ProductViewLogService {

    private final MongoTemplate mongoTemplate;

    public ProductViewLogService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * @Async: 별도 스레드풀에서 실행 → 메인 요청 블로킹 없음
     * ProductServiceApplication에 @EnableAsync 필요
     */
    @Async
    public void saveViewLog(Long productId) {
        try {
            Map<String, Object> log_data = new HashMap<>();
            log_data.put("productId", productId);
            log_data.put("viewedAt", LocalDateTime.now().toString());
            log_data.put("source", "product-service");

            mongoTemplate.insert(log_data, "product_view_logs");
            log.debug("[ViewLog] 조회 로그 저장 완료 - productId: {}", productId);
        } catch (Exception e) {
            // 로그 저장 실패가 메인 로직에 영향 주지 않도록 예외 흡수
            log.warn("[ViewLog] 조회 로그 저장 실패 - productId: {}, error: {}", productId, e.getMessage());
        }
    }
}
