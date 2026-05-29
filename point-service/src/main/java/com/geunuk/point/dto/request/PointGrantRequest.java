package com.geunuk.point.dto.request;

import com.geunuk.point.domain.PointReason;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class PointGrantRequest {
    @NotNull private Long userId;
    @NotNull @Min(1) private Long amount;
    @NotNull private PointReason reason;
    private Long referenceId;
}
