package com.geunuk.auth.repository;
import com.geunuk.auth.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    @Query("SELECT u FROM User u WHERE u.id = :id AND u.signout = false")
    Optional<User> findActiveById(@Param("id") Long id);
    boolean existsByEmail(String email);
}
