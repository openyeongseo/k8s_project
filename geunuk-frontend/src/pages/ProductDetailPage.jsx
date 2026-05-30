import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FALLBACK_IMAGE, MOCK_PRODUCTS, MOCK_REVIEWS } from '../data/mock';
import ProductCard from '../components/common/ProductCard';
import { useCart, useWish, useToast, useAuth } from '../store';
import styles from './ProductDetailPage.module.css';

const TABS = ['상품 정보', '리뷰', '배송/반품', '관련 상품'];

export default function ProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const { has, toggle } = useWish();
  const { show } = useToast();
  const { loggedIn, user } = useAuth();
  const product = MOCK_PRODUCTS.find(item => item.id === Number(id));
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('상품 정보');
  const [selectedOpt, setSelectedOpt] = useState('기본 구성');

  if (!product) return <div className={styles.notFound}>상품을 찾을 수 없습니다.<button className="btn-secondary" onClick={() => nav('/products')}>상품 목록으로</button></div>;
  const wished = has(product.id);
  const related = MOCK_PRODUCTS.filter(item => item.category === product.category && item.id !== product.id).concat(MOCK_PRODUCTS.filter(item => item.id !== product.id)).slice(0, 4);
  const reviews = MOCK_REVIEWS.filter(review => review.productId === product.id);
  const point = Math.round(product.price * 0.01);
  const totalPrice = product.price * qty;
  const options = product.category === '스미스머신' ? ['기본 구성', '설치 포함', '매트 포함'] : ['기본 구성', '블랙', '그레이'];

  const addCart = () => { add(product, qty); show('장바구니에 담았습니다.'); };
  const buyNow = () => { nav('/order', { state: { items: [{ productId: product.id, productName: product.name, price: product.price, quantity: qty, image: product.image }] } }); };
  const wish = () => { toggle(product.id); show(wished ? '찜 목록에서 제거했습니다.' : '찜 목록에 추가했습니다.'); };

  return (
    <div className="page-wrap">
      <div className="breadcrumb"><span onClick={() => nav('/')}>홈</span><span className="sep">›</span><span onClick={() => nav('/products')}>상품 목록</span><span className="sep">›</span><span>{product.category}</span></div>
      <section className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}><img src={product.image} alt={product.name} onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} /></div>
          <div className={styles.thumbnails}>{[product.image, product.image, product.image].map((image, idx) => <button key={idx} className={idx === 0 ? styles.thumbActive : ''}><img src={image} alt="" onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} /></button>)}</div>
        </div>
        <div className={styles.detail}>
          <p className={styles.brand}>{product.brand}</p>
          <h1>{product.name}</h1>
          <div className={styles.rating}><strong>★ {product.rating}</strong><span>리뷰 {product.reviews}개</span><span>상품문의 3개</span></div>
          {user?.role === 'ADMIN' && <div className={styles.admin}><b>관리자 메뉴</b><button onClick={() => show('상품 수정 화면은 API 연결 후 제공됩니다.', 'info')}>수정</button><button onClick={() => show('상품 삭제 요청을 확인했습니다.', 'info')}>삭제</button></div>}
          <div className={styles.priceBox}>
            {product.original && <del>{product.original.toLocaleString()}원</del>}
            <div><strong>{product.price.toLocaleString()}</strong>원 {product.badge && <span className={`badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>}</div>
            <dl><dt>적립금</dt><dd>{point.toLocaleString()}P (1%)</dd><dt>배송비</dt><dd>무료배송 / 설치 상품 별도 안내</dd></dl>
          </div>
          <label className={styles.optionLabel}>옵션 선택</label>
          <select className={styles.select} value={selectedOpt} onChange={e => setSelectedOpt(e.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select>
          <div className={styles.selectedItem}><span>{product.name}<small>{selectedOpt}</small></span><div className={styles.qty}><button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button><b>{qty}</b><button onClick={() => setQty(q => q + 1)}>+</button></div></div>
          <div className={styles.total}><span>총 상품금액</span><strong>{totalPrice.toLocaleString()}원</strong></div>
          <div className={styles.actions}>
            <button className={styles.wish} onClick={wish} aria-label="찜하기">{wished ? '♥' : '♡'}</button>
            <button className="btn-secondary" onClick={addCart}>장바구니</button>
            <button className="btn-primary" onClick={buyNow}>구매하기</button>
          </div>
        </div>
      </section>
      <nav className={styles.tabs}>{TABS.map(item => <button key={item} className={tab === item ? styles.tabActive : ''} onClick={() => setTab(item)}>{item}</button>)}</nav>
      <section className={styles.tabContent}>
        {tab === '상품 정보' && <div className={styles.description}><h2>근육캐치 프리미엄 장비</h2><p>견고한 프레임과 안정적인 사용감을 갖춘 트레이닝 장비입니다. 홈짐부터 상업용 공간까지 사용할 수 있도록 설계되었으며, 선택 옵션에 따라 설치 및 매트 구성이 추가됩니다.</p><img src={product.image} alt="상품 상세 이미지" onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} /></div>}
        {tab === '리뷰' && <div className={styles.reviews}><div className={styles.reviewScore}><b>{product.rating}</b><span>★★★★★</span><small>구매 고객 만족도</small></div><div>{reviews.length ? reviews.map(review => <article key={review.id}><strong>{'★'.repeat(review.rating)}</strong><b>{review.userName}</b><time>{review.createdAt}</time><p>{review.content}</p></article>) : <p>아직 작성된 리뷰가 없습니다.</p>}{loggedIn && <button className="btn-secondary" onClick={() => show('구매 완료 후 리뷰를 작성할 수 있습니다.', 'info')}>리뷰 작성</button>}</div></div>}
        {tab === '배송/반품' && <table className={styles.infoTable}><tbody><tr><th>배송 안내</th><td>결제 완료 후 평균 2~5영업일 소요됩니다. 대형 장비는 설치 일정을 별도로 안내합니다.</td></tr><tr><th>반품 안내</th><td>설치 전 미사용 제품에 한하여 수령일로부터 7일 이내 접수 가능합니다.</td></tr><tr><th>품질 보증</th><td>프레임 1년 무상 보증, 소모품은 제외됩니다.</td></tr></tbody></table>}
        {tab === '관련 상품' && <div className={styles.related}>{related.map(item => <ProductCard key={item.id} product={item} />)}</div>}
      </section>
    </div>
  );
}
