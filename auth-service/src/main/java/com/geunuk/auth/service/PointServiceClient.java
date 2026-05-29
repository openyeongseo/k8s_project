package com.geunuk.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * [Service → Service 통신]
 * WebClient를 사용한 point-service 호출
 * Application 설계도의 "신규 가입 100,000 포인트 지급" 흐름
 *
 * 호출 흐름:
 *   auth-service → (Istio Ingress / K8s Service) → point-service
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PointServiceClient {

    private final WebClient webClient;

    @Value("${service.point.url}")
    private String pointServiceUrl;

    /**
     * @Async: 포인트 지급 실패가 회원가입 트랜잭션에 영향 주지 않도록 비동기 처리
     */
    @Async
    public void grantSignUpPoint(Long userId, Long amount) {
        log.info("[PointServiceClient] 신규 가입 포인트 지급 요청 - userId: {}, amount: {}", userId, amount);

        webClient.post()
                .uri(pointServiceUrl + "/api/points/grant")
                .bodyValue(Map.of(
                        "userId", userId,
                        "amount", amount,
                        "reason", "SIGN_UP"
                ))
                .retrieve()
                .bodyToMono(Void.class)
                .onErrorResume(e -> {
                    // 포인트 지급 실패 → 경고 로그만 남기고 가입은 유지
                    log.warn("[PointServiceClient] 포인트 지급 실패 - userId: {}, error: {}", userId, e.getMessage());
                    return Mono.empty();
                })
                .subscribe();
    }
}
