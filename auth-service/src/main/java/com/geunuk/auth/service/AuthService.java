package com.geunuk.auth.service;

import com.geunuk.auth.domain.User;
import com.geunuk.auth.domain.UserStatus;
import com.geunuk.auth.dto.request.LoginRequest;
import com.geunuk.auth.dto.request.PasswordChangeRequest;
import com.geunuk.auth.dto.request.ProfileUpdateRequest;
import com.geunuk.auth.dto.request.SignUpRequest;
import com.geunuk.auth.dto.response.TokenResponse;
import com.geunuk.auth.dto.response.UserResponse;
import com.geunuk.auth.exception.DuplicateEmailException;
import com.geunuk.auth.exception.InvalidPasswordException;
import com.geunuk.auth.exception.UserNotFoundException;
import com.geunuk.auth.repository.UserRepository;
import com.geunuk.auth.security.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

/**
 * [Business Layer]
 * - 회원가입, 로그인, 로그아웃, 내 정보 조회/수정, 탈퇴
 * - JWT 발급 및 Redis 블랙리스트 관리
 * - 신규 가입 시 point-service에 포인트 지급 요청 (WebClient)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final PointServiceClient pointServiceClient;  // WebClient 래퍼

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";
    private static final String BLACKLIST_PREFIX     = "blacklist:";
    private static final long   ACCESS_TOKEN_EXPIRY  = 1800L;       // 30분(초)
    private static final long   REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 7L; // 7일(초)

    // ──────────────────────────────────────────────
    // 회원가입
    // 트랜잭션: users 저장 + point-service 호출(비동기)
    // ──────────────────────────────────────────────
    @Transactional
    public UserResponse signUp(SignUpRequest request) {
        log.info("[AuthService] 회원가입 요청 - email: {}", request.getEmail());

        // 중복 이메일 검사
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("이미 사용 중인 이메일입니다: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .build();

        User saved = userRepository.save(user);
        log.info("[AuthService] 회원가입 완료 - userId: {}", saved.getId());

        // 신규 가입 포인트 지급 (point-service WebClient 호출, 실패해도 가입은 유지)
        pointServiceClient.grantSignUpPoint(saved.getId(), 100_000L);

        return UserResponse.from(saved);
    }

    // ──────────────────────────────────────────────
    // 로그인
    // Access Token + Refresh Token 발급
    // Refresh Token은 Redis에 저장
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        log.info("[AuthService] 로그인 요청 - email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("이메일 또는 비밀번호를 확인해주세요."));

        if (!user.isActive()) {
            throw new IllegalStateException("이용이 제한된 계정입니다. 상태: " + user.getStatus());
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidPasswordException("이메일 또는 비밀번호를 확인해주세요.");
        }

        String accessToken  = jwtProvider.createAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtProvider.createRefreshToken(user.getId());

        // Refresh Token → Redis 저장 (TTL: 7일)
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + user.getId(),
                refreshToken,
                REFRESH_TOKEN_EXPIRY,
                TimeUnit.SECONDS
        );

        log.info("[AuthService] 로그인 완료 - userId: {}", user.getId());
        return TokenResponse.builder()
                .userId(user.getId())
                .username(user.getName())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(ACCESS_TOKEN_EXPIRY)
                .build();
    }

    // ──────────────────────────────────────────────
    // 로그아웃
    // Access Token 블랙리스트 등록 + Refresh Token 삭제
    // ──────────────────────────────────────────────
    public void logout(Long userId, String accessToken) {
        log.info("[AuthService] 로그아웃 - userId: {}", userId);

        // Access Token 블랙리스트 (남은 TTL 동안 유지)
        redisTemplate.opsForValue().set(
                BLACKLIST_PREFIX + accessToken,
                "logout",
                ACCESS_TOKEN_EXPIRY,
                TimeUnit.SECONDS
        );

        // Refresh Token 삭제
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + userId);

        log.info("[AuthService] 로그아웃 완료 - userId: {}", userId);
    }

    // ──────────────────────────────────────────────
    // 토큰 재발급
    // Refresh Token 검증 후 새 Access Token 발급
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public TokenResponse reissue(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken) || !jwtProvider.isRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 Refresh Token입니다.");
        }

        Long userId = jwtProvider.getUserId(refreshToken);

        // Redis에 저장된 Refresh Token과 비교
        String storedToken = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + userId);
        if (!refreshToken.equals(storedToken)) {
            throw new IllegalArgumentException("만료되었거나 이미 사용된 Refresh Token입니다.");
        }

        User user = userRepository.findActiveById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        String newAccessToken = jwtProvider.createAccessToken(user.getId(), user.getEmail(), user.getRole().name());

        return TokenResponse.builder()
                .userId(user.getId())
                .username(user.getName())
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Refresh Token은 그대로 반환
                .expiresIn(ACCESS_TOKEN_EXPIRY)
                .build();
    }

    // ──────────────────────────────────────────────
    // 내 정보 조회
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public UserResponse getMyInfo(Long userId) {
        User user = userRepository.findActiveById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));
        return UserResponse.from(user);
    }

    // ──────────────────────────────────────────────
    // 내 정보 수정
    // ──────────────────────────────────────────────
    @Transactional
    public UserResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        log.info("[AuthService] 정보 수정 - userId: {}", userId);

        User user = userRepository.findActiveById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        user.updateProfile(request.getName(), request.getPhone(), request.getAddress());
        return UserResponse.from(user); // Dirty Checking 자동 반영
    }

    // ──────────────────────────────────────────────
    // 비밀번호 변경
    // ──────────────────────────────────────────────
    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {
        log.info("[AuthService] 비밀번호 변경 - userId: {}", userId);

        User user = userRepository.findActiveById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidPasswordException("현재 비밀번호가 일치하지 않습니다.");
        }

        user.updatePassword(passwordEncoder.encode(request.getNewPassword()));
    }

    // ──────────────────────────────────────────────
    // 회원 탈퇴 (소프트 딜리트)
    // ──────────────────────────────────────────────
    @Transactional
    public void withdraw(Long userId, String accessToken) {
        log.info("[AuthService] 회원 탈퇴 - userId: {}", userId);

        User user = userRepository.findActiveById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        user.withdraw(); // status = WITHDRAWN

        // 토큰 무효화
        logout(userId, accessToken);
    }
}
