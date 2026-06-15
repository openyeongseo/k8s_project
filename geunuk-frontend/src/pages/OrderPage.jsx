import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FALLBACK_IMAGE } from '../data/mock';
import { useAuth, useToast, useCart } from '../store';
import styles from './OrderPage.module.css';

export default function OrderPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { show } = useToast();
  const { user } = useAuth();
  const { setCartCount } = useCart();
  const items = location.state?.items || [];

  const [pointBalance, setPointBalance] = useState(null);
  const [usedPoint, setUsedPoint] = useState(0);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!user?.id) return;
    fetch('/api/points/balance', {
      headers: { 'X-User-Id': String(user.id), 'Authorization': `Bearer ${user.accessToken}` }
    })
      .then(r => r.json())
      .then(data => setPointBalance(data.data?.balance ?? 0))
      .catch(() => setPointBalance(0));
  }, [user]);

  const availablePoint = pointBalance ?? 0;
  const subTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const point = Math.min(Number(usedPoint) || 0, availablePoint, subTotal);
  const finalTotal = Math.max(0, subTotal - point);

  const submit = () => {
    if (!items.length) { show('주문 상품이 없습니다.', 'error'); return; }
    setLoading(true);

    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': String(user?.id || ''),
        'Authorization': `Bearer ${user?.accessToken || ''}`,
      },
      body: JSON.stringify({
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
        })),
        receiverName: user?.name || '수령인',
        receiverPhone: '010-0000-0000',
        deliveryAddress: '미입력',
        usedPoint: point,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success !== false && data.data) {
          const order = data.data;
          fetch('/api/cart', { method: 'DELETE', headers: { 'X-User-Id': String(user?.id || ''), 'Authorization': `Bearer ${user?.accessToken || ''}` } });
          setCartCount(0);
          show('주문이 완료되었습니다.');
          nav(`/orders/${order.id}`, { state: { order } });
        } else {
          show(data.message || '주문 처리 중 오류가 발생했습니다.', 'error');
        }
      })
      .catch(() => show('서버 오류가 발생했습니다.', 'error'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="page-wrap">
      <div className="breadcrumb">
        <span onClick={() => nav('/')}>홈</span><span className="sep">›</span>
        <span onClick={() => nav('/cart')}>장바구니</span><span className="sep">›</span>
        <span>주문/결제</span>
      </div>
      <header className={styles.heading}><p>CHECKOUT</p><h1>주문 / 결제</h1></header>
      <div className={styles.layout}>
        <div className={styles.left}>
          <section className={styles.section}>
            <h2>주문 상품 <small>{items.length}개</small></h2>
            {items.length ? items.map(item => (
              <article className={styles.item} key={item.productId}>
                <img src={item.image} alt="" onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                <div><b>{item.productName}</b><span>수량 {item.quantity}개</span></div>
                <strong>{(item.price * item.quantity).toLocaleString()}원</strong>
              </article>
            )) : (
              <div className={styles.empty}>주문할 상품이 없습니다. <button onClick={() => nav('/products')}>상품 보기</button></div>
            )}
          </section>
          <section className={styles.section}>
            <h2>포인트 사용</h2>
            <div className={styles.point}>
              <span>사용 가능 포인트 <b>{availablePoint.toLocaleString()}P</b></span>
              <input
                className="form-input"
                type="number"
                min="0"
                max={availablePoint}
                value={usedPoint}
                onChange={e => setUsedPoint(e.target.value)}
              />
              <button onClick={() => setUsedPoint(Math.min(availablePoint, subTotal))}>전액 사용</button>
            </div>
          </section>
        </div>
        <aside className={styles.summary}>
          <h2>최종 결제 금액</h2>
          <dl>
            <dt>상품 금액</dt><dd>{subTotal.toLocaleString()}원</dd>
            <dt>포인트 사용</dt><dd className={styles.deduct}>-{point.toLocaleString()}P</dd>
          </dl>
          <div className={styles.final}><span>총 결제금액</span><strong>{finalTotal.toLocaleString()}원</strong></div>
          <button className="btn-primary" onClick={submit} disabled={loading || !items.length}>
            {loading ? '결제 처리 중...' : `${finalTotal.toLocaleString()}원 결제하기`}
          </button>
          <p className={styles.notice}>결제 버튼 클릭 시 주문 정보와 포인트 사용이 처리됩니다.</p>
        </aside>
      </div>
    </div>
  );
}
