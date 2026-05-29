package com.geunuk.order.kafka.producer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

/**
 * [Kafka Producer]
 * 주문 생성 이벤트를 order.created 토픽으로 발행
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventProducer {

    private static final String TOPIC = "order.created";

    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    public void publishOrderCreated(OrderCreatedEvent event) {
        log.info("[OrderEventProducer] 이벤트 발행 시작 - orderId: {}", event.getOrderId());

        CompletableFuture<SendResult<String, OrderCreatedEvent>> future =
                kafkaTemplate.send(TOPIC, String.valueOf(event.getOrderId()), event);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("[OrderEventProducer] 이벤트 발행 실패 - orderId: {}, error: {}",
                        event.getOrderId(), ex.getMessage());
                // TODO: 실패 시 재시도 or Dead Letter Queue 처리
            } else {
                log.info("[OrderEventProducer] 이벤트 발행 성공 - orderId: {}, partition: {}, offset: {}",
                        event.getOrderId(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }
}
