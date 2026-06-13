package com.geunuk.auth.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

    @Column(name = "username", nullable = false, length = 15)
    private String name;

    @Transient
    private String phone;

    @Transient
    private String address;

    @Transient
    @Builder.Default
    private Role role = Role.USER;

    @Column(name = "withdrawn_at")
    private LocalDateTime withdrawnAt;

    @Column(name = "google_sub", length = 255)
    private String googleSub;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updateProfile(String name, String phone, String address) {
        this.name = name;
        this.phone = phone;
        this.address = address;
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void withdraw() {
        this.withdrawnAt = LocalDateTime.now();
    }

    public void linkGoogleSub(String googleSub) {
        this.googleSub = googleSub;
    }

    public boolean isActive() {
        return this.withdrawnAt == null;
    }

    public UserStatus getStatus() {
        return this.withdrawnAt == null ? UserStatus.ACTIVE : UserStatus.WITHDRAWN;
    }

    public Role getRole() {
        return Role.USER;
    }
}
