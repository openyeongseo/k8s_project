package com.geunuk.point.service;

import com.geunuk.point.domain.*;
import com.geunuk.point.dto.request.PointDeductRequest;
import com.geunuk.point.dto.request.PointGrantRequest;
import com.geunuk.point.dto.response.PointBalanceResponse;
import com.geunuk.point.dto.response.PointHistoryResponse;
import com.geunuk.point.exception.PointBalanceNotFoundException;
import com.geunuk.point.repository.PointBalanceRepository;
import com.geunuk.point.repository.PointTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * [Business Layer]
 * 포인트 적립/차감 - 비관적 락으로 동시성 제어
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PointService {

    private final PointBalanceRepository balanceRepository;
    private final PointTransactionRepository txRepository;

    // 잔액 조회
    @Transactional(readOnly = true)
    public PointBalanceResponse getBalance(Long userId) {
        PointBalance balance = balanceRepository.findByUserId(userId)
                .orElse(PointBalance.builder().userId(userId).balance(0L).build());
        return PointBalanceResponse.builder().userId(userId).balance(balance.getBalance()).build();
    }

    // 포인트 적립 (신규 가입, 구매 적립 등)
    @Transactional
    public PointBalanceResponse grant(PointGrantRequest request) {
        log.info("[PointService] 적립 - userId:{}, amount:{}, reason:{}", request.getUserId(), request.getAmount(), request.getReason());

        PointBalance balance = balanceRepository.findWithLockByUserId(request.getUserId())
                .orElse(PointBalance.builder().userId(request.getUserId()).build());

        balance.add(request.getAmount());
        balanceRepository.save(balance);

        txRepository.save(PointTransaction.builder()
                .userId(request.getUserId())
                .amount(request.getAmount())
                .balanceAfter(balance.getBalance())
                .reason(request.getReason())
                .referenceId(request.getReferenceId())
                .build());

        return PointBalanceResponse.builder().userId(request.getUserId()).balance(balance.getBalance()).build();
    }

    // 포인트 차감 (주문 사용)
    @Transactional
    public PointBalanceResponse deduct(Long userId, PointDeductRequest request) {
        log.info("[PointService] 차감 - userId:{}, amount:{}", userId, request.getAmount());

        PointBalance balance = balanceRepository.findWithLockByUserId(userId)
                .orElseThrow(() -> new PointBalanceNotFoundException("포인트 정보가 없습니다."));

        balance.deduct(request.getAmount());

        txRepository.save(PointTransaction.builder()
                .userId(userId)
                .amount(-request.getAmount())   // 음수로 저장
                .balanceAfter(balance.getBalance())
                .reason(PointReason.USE)
                .referenceId(request.getReferenceId())
                .build());

        return PointBalanceResponse.builder().userId(userId).balance(balance.getBalance()).build();
    }

    // 포인트 내역 조회 (페이징)
    @Transactional(readOnly = true)
    public Page<PointHistoryResponse> getHistory(Long userId, int page, int size) {
        return txRepository.findByUserId(
                userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).map(PointHistoryResponse::from);
    }
}
