package com.geunuk.point.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class PointDeductRequest {
    @NotNull @Min(1) private Long amount;
    private Long referenceId;
}
