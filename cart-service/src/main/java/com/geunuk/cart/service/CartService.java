package com.geunuk.cart.service;

import com.geunuk.cart.domain.CartItem;
import com.geunuk.cart.dto.request.CartAddRequest;
import com.geunuk.cart.dto.request.CartUpdateRequest;
import com.geunuk.cart.dto.response.CartListResponse;
import com.geunuk.cart.dto.response.CartResponse;
import com.geunuk.cart.exception.CartItemNotFoundException;
import com.geunuk.cart.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * [Business Layer]
 * Redis 기반 장바구니 CRUD
 * 동일 상품 재담기 → 수량 합산
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;

    // 장바구니 조회
    public CartListResponse getCart(Long userId) {
        List<CartResponse> items = cartRepository.findByUserId(userId)
                .stream().map(CartResponse::from).toList();
        return CartListResponse.from(items);
    }

    // 장바구니 담기 (동일 상품이면 수량 합산)
    public CartResponse addItem(Long userId, CartAddRequest request) {
        log.info("[CartService] 담기 - userId:{}, productId:{}", userId, request.getProductId());

        String id = CartItem.generateId(userId, request.getProductId());
        CartItem item = cartRepository.findById(id)
                .map(existing -> {
                    existing.updateQuantity(existing.getQuantity() + request.getQuantity());
                    return existing;
                })
                .orElse(CartItem.builder()
                        .id(id)
                        .userId(userId)
                        .productId(request.getProductId())
                        .productName(request.getProductName())
                        .price(request.getPrice())
                        .quantity(request.getQuantity())
                        .imageUrl(request.getImageUrl())
                        .build());

        return CartResponse.from(cartRepository.save(item));
    }

    // 수량 변경
    public CartResponse updateItem(Long userId, Long productId, CartUpdateRequest request) {
        String id = CartItem.generateId(userId, productId);
        CartItem item = cartRepository.findById(id)
                .orElseThrow(() -> new CartItemNotFoundException("장바구니 상품을 찾을 수 없습니다."));

        item.updateQuantity(request.getQuantity());
        return CartResponse.from(cartRepository.save(item));
    }

    // 단건 삭제
    public void removeItem(Long userId, Long productId) {
        String id = CartItem.generateId(userId, productId);
        if (!cartRepository.existsById(id)) {
            throw new CartItemNotFoundException("장바구니 상품을 찾을 수 없습니다.");
        }
        cartRepository.deleteById(id);
    }

    // 전체 비우기
    public void clearCart(Long userId) {
        log.info("[CartService] 장바구니 전체 삭제 - userId:{}", userId);
        List<CartItem> items = cartRepository.findByUserId(userId);
        cartRepository.deleteAll(items);
    }
}
