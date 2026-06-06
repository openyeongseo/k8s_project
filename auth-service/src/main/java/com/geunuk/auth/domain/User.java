package com.geunuk.auth.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cust_key")
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String password;

    @Column(name = "username", nullable = false, length = 50)
    private String name;

    // member 테이블에 phone, address 컬럼 없음 → DB 매핑 제외
    @Transient
    private String phone;

    @Transient
    private String address;

    // member 테이블에 role 컬럼 없음 → 항상 USER로 고정
    @Transient
    @Builder.Default
    private Role role = Role.USER;

    // signout: 0=활성, 1=탈퇴
    @Column(name = "signout", nullable = false)
    @Builder.Default
    private Boolean signout = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── 비즈니스 메서드 ──────────────────────────

    public void updateProfile(String name, String phone, String address) {
        this.name = name;
        // phone, address는 DB에 없으므로 메모리만 갱신 (응답 DTO용)
        this.phone = phone;
        this.address = address;
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void withdraw() {
        this.signout = true;
    }

    public boolean isActive() {
        return !this.signout;
    }

    public UserStatus getStatus() {
        return this.signout ? UserStatus.WITHDRAWN : UserStatus.ACTIVE;
    }
}
