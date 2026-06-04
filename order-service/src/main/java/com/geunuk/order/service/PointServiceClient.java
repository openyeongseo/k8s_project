package com.geunuk.order.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PointServiceClient {

    private final WebClient webClient;

    @Value("${service.point.url:http://point-service:8085}")
    private String pointServiceUrl;

    public void deductPoint(Long userId, Long amount, Long orderId) {
        if (amount == null || amount <= 0) return;
        try {
            webClient.post()
                    .uri(pointServiceUrl + "/api/points/deduct")
                    .header("X-User-Id", String.valueOf(userId))
                    .bodyValue(Map.of("amount", amount, "referenceId", orderId))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            log.info("[PointServiceClient] 포인트 차감 완료 - userId: {}, amount: {}", userId, amount);
        } catch (Exception e) {
            log.error("[PointServiceClient] 포인트 차감 실패 - userId: {}, error: {}", userId, e.getMessage());
        }
    }
}
