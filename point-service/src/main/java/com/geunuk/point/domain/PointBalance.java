package com.geunuk.point.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name = "point_balance")
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED) @AllArgsConstructor @Builder
public class PointBalance {

    @Id
    private Long userId;       // auth-service users.id와 동일 (공유 PK)

    @Column(nullable = false)
    @Builder.Default
    private Long balance = 0L;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void add(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("적립 금액은 0보다 커야 합니다.");
        this.balance += amount;
    }

    public void deduct(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("차감 금액은 0보다 커야 합니다.");
        if (this.balance < amount) throw new IllegalStateException("포인트가 부족합니다. 현재 잔액: " + this.balance);
        this.balance -= amount;
    }
}
