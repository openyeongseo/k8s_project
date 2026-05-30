import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FALLBACK_IMAGE } from '../../data/mock';
import { useCart, useWish, useToast } from '../../store';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const nav = useNavigate();
  const { add } = useCart();
  const { has, toggle } = useWish();
  const { show } = useToast();
  const wished = has(product.id);

  const handleCart = e => { e.stopPropagation(); add(product, 1); show('장바구니에 상품을 담았습니다.'); };
  const handleWish = e => { e.stopPropagation(); toggle(product.id); show(wished ? '찜 목록에서 제거했습니다.' : '찜 목록에 추가했습니다.'); };
  const discount = product.original ? Math.round((1 - product.price / product.original) * 100) : null;

  return (
    <article className={styles.card} onClick={() => nav(`/products/${product.id}`)}>
      <div className={styles.imageWrap}>
        <img src={product.image} alt={product.name} loading="lazy" onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} />
        <div className={styles.flags}>
          {product.badge && <span className={`badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>}
          {discount && <span className={styles.discount}>{discount}%</span>}
        </div>
        <button className={`${styles.wish} ${wished ? styles.wished : ''}`} onClick={handleWish} aria-label="찜하기">
          <svg viewBox="0 0 24 24"><path d="M20.8 4.8a5.4 5.4 0 0 0-7.6 0L12 6l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z" /></svg>
        </button>
        <div className={styles.quick}><button onClick={handleCart}>장바구니 담기</button></div>
      </div>
      <div className={styles.info}>
        <div className={styles.brand}>{product.brand}</div>
        <h3>{product.name}</h3>
        <div className={styles.priceRow}>
          <strong>{product.price.toLocaleString()}원</strong>
          {product.original && <del>{product.original.toLocaleString()}원</del>}
        </div>
        <div className={styles.meta}><span>★ {product.rating}</span><small>리뷰 {product.reviews}</small></div>
      </div>
    </article>
  );
}
