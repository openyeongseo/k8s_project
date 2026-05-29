package com.geunuk.point.repository;

import com.geunuk.point.domain.PointBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface PointBalanceRepository extends JpaRepository<PointBalance, Long> {

    // 잔액 변경 시 비관적 락 적용 (동시 차감 방지)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<PointBalance> findWithLockByUserId(Long userId);

    Optional<PointBalance> findByUserId(Long userId);
}
