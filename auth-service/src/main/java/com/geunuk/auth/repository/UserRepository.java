package com.geunuk.auth.repository;

import com.geunuk.auth.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    // signout=false인 활성 사용자만 조회
    @Query("SELECT u FROM User u WHERE u.id = :id AND u.signout = false")
    Optional<User> findActiveById(@Param("id") Long id);

    // 기존 findByIdAndStatus 호환용 (UserStatus.ACTIVE만 허용)
    @Query("SELECT u FROM User u WHERE u.id = :id AND u.signout = false")
    Optional<User> findByIdAndStatus(@Param("id") Long id, @Param("status") Object status);

    boolean existsByEmail(String email);
}
