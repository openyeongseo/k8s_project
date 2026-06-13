package com.geunuk.point.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * member 테이블의 point 컬럼을 직접 매핑
 * point_balance 별도 테이블 없음 → member 테이블 사용
 */
@Entity
@Table(name = "member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PointBalance {

    @Id
    @Column(name = "cust_key")
    private Long userId;

    @Column(name = "point", nullable = false)
    @Builder.Default
    private Long balance = 0L;

    // member 테이블의 나머지 컬럼은 무시 (insertable=false, updatable=false)
    @Column(name = "email", insertable = false, updatable = false)
    private String email;

    @Column(name = "password_hash", insertable = false, updatable = false)
    private String passwordHash;

    @Column(name = "username", insertable = false, updatable = false)
    private String username;

    @Column(name = "withdrawn_at", insertable = false, updatable = false)
    private java.time.LocalDateTime withdrawnAt;

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
