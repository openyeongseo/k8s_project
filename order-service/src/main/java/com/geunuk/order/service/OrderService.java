package com.geunuk.order.service;

import com.geunuk.order.domain.Order;
import com.geunuk.order.domain.OrderItem;
import com.geunuk.order.domain.OrderStatus;
import com.geunuk.order.dto.request.OrderCreateRequest;
import com.geunuk.order.dto.request.OrderStatusUpdateRequest;
import com.geunuk.order.dto.response.OrderListResponse;
import com.geunuk.order.dto.response.OrderResponse;
import com.geunuk.order.exception.OrderNotFoundException;
import com.geunuk.order.exception.UnauthorizedOrderAccessException;
import com.geunuk.order.kafka.producer.OrderCreatedEvent;
import com.geunuk.order.kafka.producer.OrderEventProducer;
import org.springframework.lang.Nullable;
import com.geunuk.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * [Business Layer]
 * - 주문 CRUD
 * - 주문 생성 시 Kafka 이벤트 발행 (order.created)
 * - 트랜잭션: DB 저장 성공 후 Kafka 발행 (outbox 패턴 미적용 - 팀 합의 후 확장 가능)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    @Nullable
    private final OrderEventProducer orderEventProducer;
    private final PointServiceClient pointServiceClient;

    // ──────────────────────────────────────────────
    // 주문 목록 조회 (내 주문)
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public OrderListResponse getMyOrders(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findByUserId(userId, pageable);
        return OrderListResponse.from(orderPage);
    }

    // ──────────────────────────────────────────────
    // 주문 단건 조회
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId, Long userId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderNotFoundException("주문을 찾을 수 없습니다. id: " + orderId));

        // 본인 주문만 조회 허용
        if (!order.isOwnedBy(userId)) {
            throw new UnauthorizedOrderAccessException("접근 권한이 없는 주문입니다.");
        }

        return OrderResponse.from(order);
    }

    // ──────────────────────────────────────────────
    // 주문 생성
    // 트랜잭션: DB 저장 완료 → Kafka 이벤트 발행
    // ──────────────────────────────────────────────
    @Transactional
    public OrderResponse createOrder(Long userId, OrderCreateRequest request) {
        log.info("[OrderService] 주문 생성 - userId: {}, itemCount: {}", userId, request.getItems().size());

        // 총 금액 계산
        BigDecimal totalPrice = request.getItems().stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 포인트 사용 차감
        if (request.getUsedPoint() != null && request.getUsedPoint() > 0) {
            totalPrice = totalPrice.subtract(BigDecimal.valueOf(request.getUsedPoint()));
            if (totalPrice.compareTo(BigDecimal.ZERO) < 0) totalPrice = BigDecimal.ZERO;
        }

        // Order 생성
        Order order = Order.builder()
                .userId(userId)
                .totalPriceRaw(totalPrice.intValue())
                // receiverName @Transient - skipped
                // receiverPhone @Transient - skipped
                // deliveryAddress @Transient - skipped
                // usedPoint @Transient - skipped
                .build();

        // OrderItem 생성 및 연관관계 설정
        request.getItems().forEach(itemReq -> {
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(itemReq.getProductId())
                    // productName @Transient - skipped
                    .priceRaw(itemReq.getPrice() != null ? itemReq.getPrice().intValue() : 0)
                    .quantity(itemReq.getQuantity())
                    .build();
            order.addOrderItem(item);
        });

        Order saved = orderRepository.save(order);
        log.info("[OrderService] 주문 DB 저장 완료 - orderId: {}", saved.getId());

        // Kafka 이벤트 발행 (트랜잭션 커밋 후)
        List<OrderCreatedEvent.OrderItemEvent> itemEvents = saved.getOrderItems().stream()
                .map(i -> OrderCreatedEvent.OrderItemEvent.builder()
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .quantity(i.getQuantity())
                        .price(i.getPrice())
                        .build())
                .toList();

        if (orderEventProducer != null) orderEventProducer.publishOrderCreated(
                OrderCreatedEvent.builder()
                        .orderId(saved.getId())
                        .userId(saved.getUserId())
                        .totalPrice(saved.getTotalPrice())
                        .receiverName(saved.getReceiverName())
                        .deliveryAddress(saved.getDeliveryAddress())
                        .items(itemEvents)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        pointServiceClient.deductPoint(userId, request.getUsedPoint(), saved.getId());
        return OrderResponse.from(saved);
    }

    // ──────────────────────────────────────────────
    // 주문 상태 변경 (관리자)
    // ──────────────────────────────────────────────
    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatusUpdateRequest request) {
        log.info("[OrderService] 주문 상태 변경 - orderId: {}, status: {}", orderId, request.getStatus());

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderNotFoundException("주문을 찾을 수 없습니다. id: " + orderId));

        switch (request.getStatus()) {
            case CONFIRMED  -> order.confirm();
            case SHIPPING   -> order.ship();
            case COMPLETED  -> order.complete();
            case CANCELLED  -> order.cancel();
            default -> throw new IllegalArgumentException("처리할 수 없는 상태입니다: " + request.getStatus());
        }

        return OrderResponse.from(order);
    }

    // ──────────────────────────────────────────────
    // 주문 취소 (본인)
    // ──────────────────────────────────────────────
    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        log.info("[OrderService] 주문 취소 - orderId: {}, userId: {}", orderId, userId);

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderNotFoundException("주문을 찾을 수 없습니다. id: " + orderId));

        if (!order.isOwnedBy(userId)) {
            throw new UnauthorizedOrderAccessException("접근 권한이 없는 주문입니다.");
        }

        order.cancel();
        return OrderResponse.from(order);
    }
}
