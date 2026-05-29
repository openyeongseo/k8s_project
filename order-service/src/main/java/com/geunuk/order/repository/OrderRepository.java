package com.geunuk.order.repository;

import com.geunuk.order.domain.Order;
import com.geunuk.order.domain.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * [Data Access Layer]
 */
public interface OrderRepository extends JpaRepository<Order, Long> {

    // 내 주문 목록 (페이징)
    Page<Order> findByUserId(Long userId, Pageable pageable);

    // 내 주문 단건 조회 (OrderItem fetch join → N+1 방지)
    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.orderItems " +
           "WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    // 상태별 주문 목록 (관리자)
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
}
