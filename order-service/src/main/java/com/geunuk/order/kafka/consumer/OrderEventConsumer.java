package com.geunuk.order.kafka.consumer;

import com.geunuk.order.kafka.producer.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * [Kafka Consumer]
 * order.created 토픽 수신 후:
 *   1. inventory-service → 재고 차감 (WebClient)
 *   2. MongoDB → order_event_logs 저장
 *
 * 설계도의 "Order Event Consumer" 에 해당
 */
@Slf4j
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "true", matchIfMissing = false)
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final MongoTemplate mongoTemplate;
    private final WebClient webClient;

    @KafkaListener(
        topics = "order.created",
        groupId = "order-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(
            @Payload OrderCreatedEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment ack
    ) {
        log.info("[OrderEventConsumer] 이벤트 수신 - orderId: {}, partition: {}, offset: {}",
                event.getOrderId(), partition, offset);

        try {
            // 1. 재고 차감 (inventory-service 호출)
            decreaseInventory(event);

            // 2. MongoDB 이벤트 로그 저장
            saveEventLog(event, "SUCCESS");

            // 수동 ACK (at-least-once 보장)
            ack.acknowledge();
            log.info("[OrderEventConsumer] 처리 완료 - orderId: {}", event.getOrderId());

        } catch (Exception e) {
            log.error("[OrderEventConsumer] 처리 실패 - orderId: {}, error: {}",
                    event.getOrderId(), e.getMessage());
            saveEventLog(event, "FAILED");
            // ACK 하지 않으면 재시도됨 (retry 설정에 따라)
            throw e;
        }
    }

    /**
     * inventory-service 재고 차감
     * K8s 내부: http://inventory-service/api/inventory/decrease
     */
    private void decreaseInventory(OrderCreatedEvent event) {
        event.getItems().forEach(item -> {
            try {
                webClient.patch()
                        .uri("http://inventory-service/api/inventory/decrease")
                        .bodyValue(Map.of(
                                "productId", item.getProductId(),
                                "quantity",  item.getQuantity(),
                                "orderId",   event.getOrderId()
                        ))
                        .retrieve()
                        .bodyToMono(Void.class)
                        .block(); // Consumer는 동기 처리

                log.debug("[OrderEventConsumer] 재고 차감 완료 - productId: {}, qty: {}",
                        item.getProductId(), item.getQuantity());

            } catch (Exception e) {
                log.error("[OrderEventConsumer] 재고 차감 실패 - productId: {}, error: {}",
                        item.getProductId(), e.getMessage());
                throw new RuntimeException("재고 차감 실패: productId=" + item.getProductId(), e);
            }
        });
    }

    /**
     * MongoDB order_event_logs 저장
     */
    private void saveEventLog(OrderCreatedEvent event, String result) {
        try {
            Map<String, Object> log_data = new HashMap<>();
            log_data.put("orderId",    event.getOrderId());
            log_data.put("userId",     event.getUserId());
            log_data.put("totalPrice", event.getTotalPrice());
            log_data.put("itemCount",  event.getItems().size());
            log_data.put("result",     result);
            log_data.put("eventType",  "ORDER_CREATED");
            log_data.put("loggedAt",   LocalDateTime.now().toString());

            mongoTemplate.insert(log_data, "order_event_logs");
        } catch (Exception e) {
            log.warn("[OrderEventConsumer] 이벤트 로그 저장 실패 - orderId: {}", event.getOrderId());
        }
    }
}
