package com.geunuk.point.repository;

import com.geunuk.point.domain.PointBalance;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PointBalanceRepository extends JpaRepository<PointBalance, Long> {

    // member.cust_key 기준 조회
    @Query("SELECT p FROM PointBalance p WHERE p.userId = :userId")
    Optional<PointBalance> findByUserId(@Param("userId") Long userId);

    // 비관적 락 (동시 차감 방지)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PointBalance p WHERE p.userId = :userId")
    Optional<PointBalance> findWithLockByUserId(@Param("userId") Long userId);
}
