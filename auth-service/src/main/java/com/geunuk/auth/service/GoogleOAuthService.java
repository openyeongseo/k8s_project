package com.geunuk.auth.service;

import com.geunuk.auth.domain.User;
import com.geunuk.auth.dto.response.TokenResponse;
import com.geunuk.auth.repository.UserRepository;
import com.geunuk.auth.security.jwt.JwtProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final PointServiceClient pointServiceClient;

    @Value("${google.client-id}")
    private String googleClientId;

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";
    private static final long   REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 7L;
    private static final long   ACCESS_TOKEN_EXPIRY  = 1800L;

    @Transactional
    public TokenResponse loginWithGoogle(String idToken) {
        GoogleIdToken.Payload payload = verifyGoogleIdToken(idToken);

        String googleSub = payload.getSubject();
        String email     = payload.getEmail();
        String name      = (String) payload.get("name");
        if (name == null || name.isBlank()) name = email.split("@")[0];

        log.info("[GoogleOAuth] 구글 로그인 요청 - email: {}, sub: {}", email, googleSub);

        User user = userRepository.findByGoogleSub(googleSub).orElse(null);

        if (user == null) {
            user = userRepository.findByEmail(email).orElse(null);

            if (user != null) {
                user.linkGoogleSub(googleSub);
                log.info("[GoogleOAuth] 기존 회원 구글 연동 - userId: {}", user.getId());
            } else {
                final String finalName = name;
                user = User.builder()
                        .email(email)
                        .name(finalName)
                        .googleSub(googleSub)
                        .build();
                user = userRepository.save(user);
                log.info("[GoogleOAuth] 신규 회원 가입 - userId: {}", user.getId());
                pointServiceClient.grantSignUpPoint(user.getId(), 100_000L);
            }
        }

        if (!user.isActive()) {
            throw new IllegalStateException("이용이 제한된 계정입니다.");
        }

        String accessToken  = jwtProvider.createAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtProvider.createRefreshToken(user.getId());

        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + user.getId(),
                refreshToken,
                REFRESH_TOKEN_EXPIRY,
                TimeUnit.SECONDS
        );

        log.info("[GoogleOAuth] 로그인 완료 - userId: {}", user.getId());
        return TokenResponse.builder()
                .userId(user.getId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(ACCESS_TOKEN_EXPIRY)
                .build();
    }

    private GoogleIdToken.Payload verifyGoogleIdToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw new IllegalArgumentException("유효하지 않은 Google ID Token입니다.");
            }
            return googleIdToken.getPayload();
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("[GoogleOAuth] ID Token 검증 실패", e);
            throw new IllegalArgumentException("Google 인증에 실패했습니다.");
        }
    }
}
