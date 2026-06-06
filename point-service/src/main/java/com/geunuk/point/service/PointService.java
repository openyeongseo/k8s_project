package com.geunuk.point.service;

import com.geunuk.point.domain.PointBalance;
import com.geunuk.point.dto.request.PointDeductRequest;
import com.geunuk.point.dto.request.PointGrantRequest;
import com.geunuk.point.dto.response.PointBalanceResponse;
import com.geunuk.point.dto.response.PointHistoryResponse;
import com.geunuk.point.exception.PointBalanceNotFoundException;
import com.geunuk.point.repository.PointBalanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

/**
 * [Business Layer]
 * point_balance / point_transactions 테이블 없음
 * → member.point 컬럼 직접 조회/업데이트
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PointService {

    private final PointBalanceRepository balanceRepository;

    // 잔액 조회
    @Transactional(readOnly = true)
    public PointBalanceResponse getBalance(Long userId) {
        PointBalance balance = balanceRepository.findByUserId(userId)
                .orElse(PointBalance.builder().userId(userId).balance(0L).build());
        return PointBalanceResponse.builder()
                .userId(userId)
                .balance(balance.getBalance())
                .build();
    }

    // 포인트 적립 (신규 가입, 구매 등)
    @Transactional
    public PointBalanceResponse grant(PointGrantRequest request) {
        log.info("[PointService] 적립 - userId:{}, amount:{}", request.getUserId(), request.getAmount());

        PointBalance balance = balanceRepository.findWithLockByUserId(request.getUserId())
                .orElseThrow(() -> new PointBalanceNotFoundException("포인트 정보가 없습니다."));

        balance.add(request.getAmount());
        balanceRepository.save(balance);

        return PointBalanceResponse.builder()
                .userId(request.getUserId())
                .balance(balance.getBalance())
                .build();
    }

    // 포인트 차감 (주문 사용)
    @Transactional
    public PointBalanceResponse deduct(Long userId, PointDeductRequest request) {
        log.info("[PointService] 차감 - userId:{}, amount:{}", userId, request.getAmount());

        PointBalance balance = balanceRepository.findWithLockByUserId(userId)
                .orElseThrow(() -> new PointBalanceNotFoundException("포인트 정보가 없습니다."));

        balance.deduct(request.getAmount());
        balanceRepository.save(balance);

        return PointBalanceResponse.builder()
                .userId(userId)
                .balance(balance.getBalance())
                .build();
    }

    // 포인트 내역 조회 - point_transactions 없으므로 빈 페이지 반환
    @Transactional(readOnly = true)
    public Page<PointHistoryResponse> getHistory(Long userId, int page, int size) {
        log.info("[PointService] 내역 조회 - userId:{} (point_transactions 테이블 미존재, 빈 결과 반환)", userId);
        return new PageImpl<>(Collections.emptyList(), PageRequest.of(page, size), 0);
    }
}
