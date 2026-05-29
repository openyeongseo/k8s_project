package com.geunuk.point.dto.response;

import com.geunuk.point.domain.PointTransaction;
import com.geunuk.point.domain.PointReason;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Builder
public class PointBalanceResponse {
    private Long userId;
    private Long balance;
}

