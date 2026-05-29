package com.geunuk.order.domain;

public enum OrderStatus {
    PENDING,    // 결제 대기
    CONFIRMED,  // 결제 확인
    SHIPPING,   // 배송 중
    COMPLETED,  // 배송 완료
    CANCELLED   // 취소
}
