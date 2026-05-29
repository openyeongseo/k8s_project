package com.geunuk.auth.repository;

import com.geunuk.auth.domain.OAuthAccount;
import com.geunuk.auth.domain.OAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * [Data Access Layer]
 */
public interface OAuthAccountRepository extends JpaRepository<OAuthAccount, Long> {

    Optional<OAuthAccount> findByProviderAndProviderId(OAuthProvider provider, String providerId);
}
