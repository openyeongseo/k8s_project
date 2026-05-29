import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS, MOCK_REVIEWS } from '../data/mock';
import ProductCard from '../components/common/ProductCard';
import { useCart, useWish, useToast, useAuth } from '../store';
import styles from './ProductDetailPage.module.css';

const TABS = ['상품정보', '리뷰', '상품필수정보', '관련상품'];

export default function ProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const { has, toggle } = useWish();
  const { show } = useToast();
  const { loggedIn } = useAuth();

  const product = MOCK_PRODUCTS.find(p => p.id === Number(id));
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('상품정보');
  const [selectedOpt, setSelectedOpt] = useState('5kg');
  const [selectedColor, setSelectedColor] = useState('블랙');

  if (!product) return (
    <div className={styles.notFound}>
      상품을 찾을 수 없습니다.
      <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => nav('/products')}>목록으로</button>
    </div>
  );

  const wished = has(product.id);
  const related = MOCK_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const reviews = MOCK_REVIEWS.filter(r => r.productId === product.id);
  const totalPrice = product.price * qty;

  const handleAddCart = () => { add(product, qty); show('장바구니에 담겼습니다! 🛒'); };
  const handleBuyNow  = () => {
    add(product, qty);
    nav('/order', { state: { items: [{ ...product, productId: product.id, productName: product.name, quantity: qty, icon: product.icon }] } });
  };
  const handleWish = () => {
    toggle(product.id);
    show(wished ? '찜 목록에서 제거되었습니다.' : '찜 목록에 추가되었습니다! ❤️');
  };

  return (
    <div className="page-wrap">
      <div className="breadcrumb">
        <span onClick={() => nav('/')}>홈</span><span className="sep">›</span>
        <span onClick={() => nav('/products')}>상품 목록</span><span className="sep">›</span>
        <span>{product.name}</span>
      </div>

      {/* 메인 레이아웃 */}
      <div className={styles.layout}>
        {/* 이미지 */}
        <div className={styles.imgCol}>
          <div className={styles.mainImg}><span>{product.icon}</span></div>
          <div className={styles.thumbRow}>
            {[product.icon, '📦', '⭐', '🏷️'].map((ic, i) => (
              <div key={i} className={`${styles.thumb} ${i === 0 ? styles.thumbActive : ''}`}>{ic}</div>
            ))}
          </div>
        </div>

        {/* 정보 */}
        <div className={styles.infoCol}>
          <div className={styles.brand}>{product.brand}</div>
          <h1 className={styles.name}>{product.name}</h1>

          <div className={styles.priceBlock}>
            <div className={styles.priceRow}>
              <span className={styles.price}>{product.price.toLocaleString()}원</span>
              {product.original && <span className={styles.original}>{product.original.toLocaleString()}원</span>}
              {product.badge && <span className={`badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>}
            </div>
            <div className={styles.benefit}>포인트 적립 <b>{Math.round(product.price * 0.01).toLocaleString()}P</b></div>
            <div className={styles.delivery}>배송비 3,000원 (50,000원 이상 무료)</div>
          </div>

          {/* 옵션 */}
          <div className={styles.optLabel}>무게 선택</div>
          <div className={styles.optRow}>
            {['5kg','10kg','15kg','20kg'].map(o => (
              <button key={o} className={`${styles.optBtn} ${selectedOpt === o ? styles.optActive : ''}`} onClick={() => setSelectedOpt(o)}>{o}</button>
            ))}
          </div>
          <div className={styles.optLabel}>색상</div>
          <div className={styles.optRow}>
            {['블랙','그레이','크롬'].map(c => (
              <button key={c} className={`${styles.optBtn} ${selectedColor === c ? styles.optActive : ''}`} onClick={() => setSelectedColor(c)}>{c}</button>
            ))}
          </div>

          {/* 수량 */}
          <div className={styles.qtyRow}>
            <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span className={styles.qtyNum}>{qty}</span>
            <button className={styles.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
          </div>

          {/* 합계 */}
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>총 상품 금액</span>
            <span className={styles.totalPrice}>{totalPrice.toLocaleString()}원</span>
          </div>

          {/* 버튼 */}
          <div className={styles.btnRow}>
            <button className={`btn-primary ${styles.btnBuy}`} onClick={handleBuyNow}>바로 구매</button>
            <button className={`btn-secondary ${styles.btnCart}`} onClick={handleAddCart}>장바구니</button>
            <button className={`${styles.btnWish} ${wished ? styles.btnWished : ''}`} onClick={handleWish}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wished ? 'var(--red)' : 'none'} stroke={wished ? 'var(--red)' : 'currentColor'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className={styles.tabRow}>
        {TABS.map(t => (
          <button key={t} className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className={styles.tabContent}>
        {tab === '상품정보' && (
          <div className={styles.infoBox}>
            <div style={{ fontSize: 64, textAlign: 'center', marginBottom: 20 }}>{product.icon}</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{product.name}</p>
            <p style={{ color: 'var(--txt2)', lineHeight: 1.8 }}>고강도 훈련을 위한 전문가급 제품입니다. 논슬립 그립과 내구성 높은 소재로 제작되었으며 장기간 사용해도 변형 없는 고품질을 보장합니다.</p>
          </div>
        )}
        {tab === '리뷰' && (
          <div>
            <div className={styles.reviewSummary}>
              <div className={styles.bigScore}>{product.rating}</div>
              <div>
                <div className={styles.bigStars}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</div>
                <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 4 }}>{product.reviews}개 리뷰</div>
              </div>
            </div>
            {reviews.map(r => (
              <div key={r.id} className={styles.reviewItem}>
                <div className={styles.reviewMeta}>
                  <span style={{ color: '#fbbf24', fontSize: 13 }}>{'★'.repeat(r.rating)}</span>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{r.userName}</span>
                  <span style={{ color: 'var(--txt3)', fontSize: 11 }}>{r.createdAt}</span>
                </div>
                <p style={{ color: 'var(--txt2)', fontSize: 13 }}>{r.content}</p>
              </div>
            ))}
            {reviews.length === 0 && <div className={styles.empty}>아직 리뷰가 없습니다.</div>}
            {loggedIn && (
              <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => show('리뷰 작성 기능은 구매 확인 후 이용 가능합니다.', 'info')}>
                리뷰 작성하기
              </button>
            )}
          </div>
        )}
        {tab === '상품필수정보' && (
          <table className={styles.specTable}>
            <tbody>
              <tr><td>소비자유형</td><td>스포츠용품</td><td>등록년월</td><td>2025.1</td></tr>
              <tr><td>크기/중량</td><td>W16.5 x L53cm / 5kg</td><td>색상</td><td>블랙</td></tr>
              <tr><td>재질</td><td>EVA+PVC</td><td>제품구성</td><td>덤벨 2개</td></tr>
              <tr><td>제조사</td><td>GEUNUK</td><td>제조국</td><td>대한민국</td></tr>
            </tbody>
          </table>
        )}
        {tab === '관련상품' && (
          <div className={styles.relatedGrid}>
            {related.length > 0 ? related.map(p => <ProductCard key={p.id} product={p} />) : <p style={{ color: 'var(--txt3)' }}>관련 상품이 없습니다.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
