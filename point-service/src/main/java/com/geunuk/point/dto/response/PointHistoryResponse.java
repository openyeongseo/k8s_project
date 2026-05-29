package com.geunuk.point.dto.response;

import com.geunuk.point.domain.PointReason;
import com.geunuk.point.domain.PointTransaction;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Builder
public class PointHistoryResponse {
    private Long id;
    private Long amount;
    private Long balanceAfter;
    private PointReason reason;
    private Long referenceId;
    private LocalDateTime createdAt;

    public static PointHistoryResponse from(PointTransaction tx) {
        return PointHistoryResponse.builder()
                .id(tx.getId()).amount(tx.getAmount()).balanceAfter(tx.getBalanceAfter())
                .reason(tx.getReason()).referenceId(tx.getReferenceId()).createdAt(tx.getCreatedAt())
                .build();
    }
}
