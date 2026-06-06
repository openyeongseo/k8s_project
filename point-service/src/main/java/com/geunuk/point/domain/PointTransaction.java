package com.geunuk.point.domain;

import lombok.*;
import java.time.LocalDateTime;

/**
 * point_transactions 테이블이 DB에 없음
 * → @Entity 제거, 히스토리 조회 시 빈 결과 반환
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PointTransaction {

    private Long id;
    private Long userId;
    private Long amount;
    private Long balanceAfter;
    private PointReason reason;
    private Long referenceId;
    private LocalDateTime createdAt;
}
