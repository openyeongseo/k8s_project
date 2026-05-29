package com.geunuk.order.dto.request;

import com.geunuk.order.domain.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "주문 상태 변경 요청 (관리자)")
public class OrderStatusUpdateRequest {

    @NotNull
    @Schema(description = "변경할 상태", example = "CONFIRMED")
    private OrderStatus status;
}
