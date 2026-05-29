package com.geunuk.product;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * product-service 메인 클래스
 * @EnableAsync: ProductViewLogService의 @Async 비동기 처리 활성화
 */
@SpringBootApplication
@EnableAsync
public class ProductServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }
}
