import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useWish, useToast } from '../../store';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const nav = useNavigate();
  const { add } = useCart();
  const { has, toggle } = useWish();
  const { show } = useToast();
  const wished = has(product.id);

  const handleCart = (e) => {
    e.stopPropagation();
    add(product, 1);
    show('장바구니에 담겼습니다! 🛒');
  };
  const handleWish = (e) => {
    e.stopPropagation();
    toggle(product.id);
    show(wished ? '찜 목록에서 제거되었습니다.' : '찜 목록에 추가되었습니다! ❤️');
  };

  return (
    <div className={styles.card} onClick={() => nav(`/products/${product.id}`)}>
      {product.badge && (
        <span className={`badge badge-${product.badge.toLowerCase()} ${styles.badge}`}>
          {product.badge}
        </span>
      )}
      <button className={`${styles.wish} ${wished ? styles.wished : ''}`} onClick={handleWish}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill={wished ? 'var(--red)' : 'none'} stroke={wished ? 'var(--red)' : 'currentColor'} strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      <div className={styles.imgWrap}>
        <div className={styles.icon}>{product.icon}</div>
        <div className={styles.overlay}>
          <button className={styles.overlayBtn} onClick={handleCart}>장바구니</button>
          <button className={styles.overlayBtn} onClick={(e) => { e.stopPropagation(); nav(`/products/${product.id}`); }}>상세보기</button>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.brand}>{product.brand}</div>
        <div className={styles.name}>{product.name}</div>
        <div className={styles.priceRow}>
          <span className={styles.price}>{product.price.toLocaleString()}원</span>
          {product.original && <span className={styles.original}>{product.original.toLocaleString()}원</span>}
        </div>
        <div className={styles.meta}>
          <span className={styles.stars}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
          <span className={styles.ratingNum}>{product.rating}</span>
          <span className={styles.reviewCount}>({product.reviews})</span>
        </div>
      </div>
    </div>
  );
}
