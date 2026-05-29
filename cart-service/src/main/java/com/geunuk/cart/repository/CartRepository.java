package com.geunuk.cart.repository;

import com.geunuk.cart.domain.CartItem;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

/**
 * [Data Access Layer] - Redis
 */
public interface CartRepository extends CrudRepository<CartItem, String> {

    List<CartItem> findByUserId(Long userId);

    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserId(Long userId);
}
