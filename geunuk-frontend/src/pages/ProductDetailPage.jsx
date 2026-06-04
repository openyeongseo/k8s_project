import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FALLBACK_IMAGE } from '../data/mock';
import ProductCard from '../components/common/ProductCard';
import { useWish, useToast, useAuth } from '../store';
import styles from './ProductDetailPage.module.css';

const TABS = ['상품 정보', '리뷰', '배송/반품', '관련 상품'];
const API = '/api/products';

export default function ProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { has, toggle } = useWish();
  const { show } = useToast();
  const { loggedIn, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('상품 정보');
  const [selectedOpt, setSelectedOpt] = useState('기본 구성');

  // 리뷰
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/${id}`)
      .then(r => r.json())
      .then(data => {
        const p = data.data;
        if (!p) return;
        const mapped = {
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: Number(p.price),
          originalPrice: Number(p.originalPrice),
          category: p.category,
          image: p.imageUrl,
          description: p.description,
          status: p.status,
        };
        setProduct(mapped);
        return fetch(`${API}?category=${encodeURIComponent(p.category)}&size=5`)
          .then(r => r.json())
          .then(listData => {
            const list = (listData.data?.products || [])
              .filter(item => item.id !== p.id)
              .slice(0, 4)
              .map(item => ({
                id: item.id,
                name: item.name,
                brand: item.brand,
                price: Number(item.price),
                originalPrice: Number(item.originalPrice),
                category: item.category,
                image: item.imageUrl,
              }));
            setRelated(list);
          });
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  // 리뷰 탭 클릭 시 조회
  const loadReviews = () => {
    setReviewLoading(true);
    fetch(`/api/reviews/product/${id}?page=0&size=20`)
      .then(r => r.json())
      .then(data => setReviews(data.data?.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setReviewLoading(false));
  };

  const handleTabClick = (t) => {
    setTab(t);
    if (t === '리뷰') loadReviews();
  };

  // 리뷰 등록
  const submitReview = () => {
    if (!reviewForm.content.trim()) { show('리뷰 내용을 입력해주세요.', 'error'); return; }
    fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': String(user?.id || ''),
        'Authorization': `Bearer ${user?.accessToken || ''}`,
      },
      body: JSON.stringify({ productId: Number(id), rating: reviewForm.rating, content: reviewForm.content }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success !== false) {
          show('리뷰가 등록되었습니다.');
          setShowReviewForm(false);
          setReviewForm({ rating: 5, content: '' });
          loadReviews();
        } else {
          show(data.message || '리뷰 등록에 실패했습니다.', 'error');
        }
      })
      .catch(() => show('서버 오류가 발생했습니다.', 'error'));
  };

  // 리뷰 삭제
  const deleteReview = (reviewId) => {
    fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'X-User-Id': String(user?.id || ''),
        'Authorization': `Bearer ${user?.accessToken || ''}`,
      },
    })
      .then(r => r.json())
      .then(() => { show('리뷰가 삭제되었습니다.'); loadReviews(); })
      .catch(() => show('서버 오류가 발생했습니다.', 'error'));
  };

  if (loading) return <div className={styles.notFound}>불러오는 중...</div>;
  if (!product) return (
    <div className={styles.notFound}>
      상품을 찾을 수 없습니다.
      <button className="btn-secondary" onClick={() => nav('/products')}>상품 목록으로</button>
    </div>
  );

  const wished = has(product.id);
  const point = Math.round(product.price * 0.01);
  const totalPrice = product.price * qty;
  const options = ['기본 구성', '블랙', '그레이'];

  const addCart = () => {
    if (!loggedIn || !user?.id) { show('로그인이 필요합니다.', 'error'); nav('/login'); return; }
    fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': String(user.id),
        'Authorization': `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({ productId: product.id, productName: product.name, price: product.price, imageUrl: product.image, quantity: qty }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success !== false) show('장바구니에 담았습니다.');
        else show(data.message || '오류가 발생했습니다.', 'error');
      })
      .catch(() => show('서버 오류가 발생했습니다.', 'error'));
  };

  const buyNow = () => {
    nav('/order', { state: { items: [{ productId: product.id, productName: product.name, price: product.price, quantity: qty, image: product.image }] } });
  };
  const wish = () => { toggle(product.id); show(wished ? '찜 목록에서 제거했습니다.' : '찜 목록에 추가했습니다.'); };

  return (
    <div className="page-wrap">
      <div className="breadcrumb">
        <span onClick={() => nav('/')}>홈</span><span className="sep">›</span>
        <span onClick={() => nav('/products')}>상품 목록</span><span className="sep">›</span>
        <span>{product.category}</span>
      </div>
      <section className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}><img src={product.image} alt={product.name} onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} /></div>
          <div className={styles.thumbnails}>
            {[product.image, product.image, product.image].map((image, idx) => (
              <button key={idx} className={idx === 0 ? styles.thumbActive : ''}>
                <img src={image} alt="" onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} />
              </button>
            ))}
          </div>
        </div>
        <div className={styles.detail}>
          <p className={styles.brand}>{product.brand}</p>
          <h1>{product.name}</h1>
          {user?.role === 'ADMIN' && (
            <div className={styles.admin}>
              <b>관리자 메뉴</b>
              <button onClick={() => show('상품 수정 화면은 API 연결 후 제공됩니다.', 'info')}>수정</button>
              <button onClick={() => show('상품 삭제 요청을 확인했습니다.', 'info')}>삭제</button>
            </div>
          )}
          <div className={styles.priceBox}>
            {product.originalPrice > product.price && <del>{product.originalPrice.toLocaleString()}원</del>}
            <div><strong>{product.price.toLocaleString()}</strong>원</div>
            <dl>
              <dt>적립금</dt><dd>{point.toLocaleString()}P (1%)</dd>
              <dt>배송비</dt><dd>무료배송 / 설치 상품 별도 안내</dd>
            </dl>
          </div>
          <label className={styles.optionLabel}>옵션 선택</label>
          <select className={styles.select} value={selectedOpt} onChange={e => setSelectedOpt(e.target.value)}>
            {options.map(option => <option key={option}>{option}</option>)}
          </select>
          <div className={styles.selectedItem}>
            <span>{product.name}<small>{selectedOpt}</small></span>
            <div className={styles.qty}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <b>{qty}</b>
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>
          <div className={styles.total}><span>총 상품금액</span><strong>{totalPrice.toLocaleString()}원</strong></div>
          <div className={styles.actions}>
            <button className={styles.wish} onClick={wish} aria-label="찜하기">{wished ? '♥' : '♡'}</button>
            <button className="btn-secondary" onClick={addCart}>장바구니</button>
            <button className="btn-primary" onClick={buyNow}>구매하기</button>
          </div>
        </div>
      </section>

      <nav className={styles.tabs}>
        {TABS.map(item => (
          <button key={item} className={tab === item ? styles.tabActive : ''} onClick={() => handleTabClick(item)}>{item}</button>
        ))}
      </nav>

      <section className={styles.tabContent}>
        {tab === '상품 정보' && (
          <div className={styles.description}>
            <h2>근육캐치 프리미엄 장비</h2>
            <p>{product.description || '견고한 프레임과 안정적인 사용감을 갖춘 트레이닝 장비입니다.'}</p>
            <img src={product.image} alt="상품 상세 이미지" onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} />
          </div>
        )}

        {tab === '리뷰' && (
          <div className={styles.reviews}>
            {reviewLoading ? (
              <p>불러오는 중...</p>
            ) : reviews.length ? (
              reviews.map(review => (
                <article key={review.id}>
                  <strong>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</strong>
                  <b>{review.userName || `사용자 ${review.userId}`}</b>
                  <time>{new Date(review.createdAt).toLocaleDateString('ko-KR')}</time>
                  <p>{review.content}</p>
                  {loggedIn && user?.id === review.userId && (
                    <button onClick={() => deleteReview(review.id)} style={{ fontSize: 11, color: 'var(--red)' }}>삭제</button>
                  )}
                </article>
              ))
            ) : (
              <p>아직 작성된 리뷰가 없습니다.</p>
            )}

            {loggedIn && (
              showReviewForm ? (
                <div className={styles.reviewForm}>
                  <div>
                    <label>별점: </label>
                    <select value={reviewForm.rating} onChange={e => setReviewForm(p => ({ ...p, rating: Number(e.target.value) }))}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}점</option>)}
                    </select>
                  </div>
                  <textarea
                    className="form-input"
                    placeholder="리뷰를 작성해주세요."
                    rows={4}
                    value={reviewForm.content}
                    onChange={e => setReviewForm(p => ({ ...p, content: e.target.value }))}
                  />
                  <div>
                    <button className="btn-primary" onClick={submitReview}>등록</button>
                    <button className="btn-secondary" onClick={() => setShowReviewForm(false)}>취소</button>
                  </div>
                </div>
              ) : (
                <button className="btn-secondary" onClick={() => setShowReviewForm(true)}>리뷰 작성</button>
              )
            )}
          </div>
        )}

        {tab === '배송/반품' && (
          <table className={styles.infoTable}>
            <tbody>
              <tr><th>배송 안내</th><td>결제 완료 후 평균 2~5영업일 소요됩니다.</td></tr>
              <tr><th>반품 안내</th><td>설치 전 미사용 제품에 한하여 수령일로부터 7일 이내 접수 가능합니다.</td></tr>
              <tr><th>품질 보증</th><td>프레임 1년 무상 보증, 소모품은 제외됩니다.</td></tr>
            </tbody>
          </table>
        )}

        {tab === '관련 상품' && (
          <div className={styles.related}>
            {related.length ? related.map(item => <ProductCard key={item.id} product={item} />) : <p>관련 상품이 없습니다.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
