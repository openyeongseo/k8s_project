import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FALLBACK_IMAGE } from '../data/mock';
import { useAuth, useToast } from '../store';
import styles from './CartPage.module.css';

export default function CartPage() {
  const nav = useNavigate();
  const { user, loggedIn } = useAuth();
  const { show } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(new Set());

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'X-User-Id': String(user?.id || ''),
    'Authorization': `Bearer ${user?.accessToken || ''}`,
  }), [user]);

  // 장바구니 조회
  const fetchCart = useCallback(() => {
    if (!loggedIn || !user?.id) { setLoading(false); return; }
    setLoading(true);
    fetch('/api/cart', { headers: headers() })
      .then(r => r.json())
      .then(data => {
        const list = data.data?.items || [];
        setItems(list);
        setChecked(new Set(list.map(i => i.productId)));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [loggedIn, user, headers]);

  useEffect(() => {
    if (!loggedIn) { nav('/login'); return; }
    fetchCart();
  }, [loggedIn]);

  const selectedItems = items.filter(i => checked.has(i.productId));
  const total = useMemo(() => selectedItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0), [selectedItems]);
  const delivery = !selectedItems.length || total >= 50000 ? 0 : 3000;
  const finalTotal = total + delivery;
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const toggleAll = () => setChecked(allSelected ? new Set() : new Set(items.map(i => i.productId)));
  const toggle = id => setChecked(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  // 수량 변경
  const updateQty = (productId, qty) => {
    if (qty < 1) return;
    fetch(`/api/cart/${productId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ quantity: qty }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success !== false) {
          setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
        } else {
          show(data.message || '수량 변경 실패', 'error');
        }
      })
      .catch(() => show('서버 오류가 발생했습니다.', 'error'));
  };

  // 단건 삭제
  const removeItem = (productId) => {
    fetch(`/api/cart/${productId}`, { method: 'DELETE', headers: headers() })
      .then(r => r.json())
      .then(() => {
        setItems(prev => prev.filter(i => i.productId !== productId));
        setChecked(prev => { const next = new Set(prev); next.delete(productId); return next; });
        show('상품을 삭제했습니다.');
      })
      .catch(() => show('서버 오류가 발생했습니다.', 'error'));
  };

  // 선택 삭제
  const removeSelected = () => {
    Promise.all([...checked].map(productId =>
      fetch(`/api/cart/${productId}`, { method: 'DELETE', headers: headers() })
    ))
      .then(() => {
        setItems(prev => prev.filter(i => !checked.has(i.productId)));
        setChecked(new Set());
        show('선택 상품을 삭제했습니다.');
      })
      .catch(() => show('서버 오류가 발생했습니다.', 'error'));
  };

  // 전체 삭제
  const clearCart = () => {
    fetch('/api/cart', { method: 'DELETE', headers: headers() })
      .then(r => r.json())
      .then(() => { setItems([]); setChecked(new Set()); show('장바구니를 비웠습니다.'); })
      .catch(() => show('서버 오류가 발생했습니다.', 'error'));
  };

  const order = orderItems => {
    if (!orderItems.length) { show('구매할 상품을 선택해주세요.', 'error'); return; }
    nav('/order', {
      state: {
        items: orderItems.map(i => ({
          productId: i.productId,
          productName: i.productName,
          price: Number(i.price),
          quantity: i.quantity,
          image: i.imageUrl,
        }))
      }
    });
  };

  if (loading) return <div className="page-wrap"><div className={styles.empty}>불러오는 중...</div></div>;

  return (
    <div className="page-wrap">
      <div className="breadcrumb"><span onClick={() => nav('/')}>홈</span><span className="sep">›</span><span>장바구니</span></div>
      <header className={styles.heading}><p>CART</p><h1>장바구니</h1></header>
      <div className={styles.layout}>
        <section>
          <div className={styles.tools}>
            <label><input type="checkbox" checked={allSelected} onChange={toggleAll} /> 전체 선택 <b>({selectedItems.length}/{items.length})</b></label>
            <div>
              <button onClick={removeSelected} disabled={!selectedItems.length}>선택 삭제</button>
              <button onClick={clearCart} disabled={!items.length}>전체 삭제</button>
            </div>
          </div>
          {items.length === 0 ? (
            <div className={styles.empty}><h2>장바구니가 비어 있습니다.</h2><p>근육캐치의 인기 장비를 살펴보세요.</p><button className="btn-primary" onClick={() => nav('/products')}>상품 보러가기</button></div>
          ) : items.map(item => (
            <article key={item.productId} className={styles.item}>
              <input className={styles.check} type="checkbox" checked={checked.has(item.productId)} onChange={() => toggle(item.productId)} aria-label="상품 선택" />
              <img src={item.imageUrl} alt={item.productName} onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} onClick={() => nav(`/products/${item.productId}`)} />
              <div className={styles.itemInfo}>
                <h2 onClick={() => nav(`/products/${item.productId}`)}>{item.productName}</h2>
                <p>기본 구성 / 무료배송</p>
                <strong>{Number(item.price).toLocaleString()}원</strong>
              </div>
              <div className={styles.control}>
                <button className={styles.delete} onClick={() => removeItem(item.productId)} aria-label="삭제">×</button>
                <div className={styles.qty}>
                  <button onClick={() => updateQty(item.productId, Math.max(1, item.quantity - 1))}>−</button>
                  <b>{item.quantity}</b>
                  <button onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                </div>
                <strong>{(Number(item.price) * item.quantity).toLocaleString()}원</strong>
              </div>
            </article>
          ))}
        </section>
        <aside className={styles.summary}>
          <h2>결제 예정 금액</h2>
          <dl>
            <dt>선택 상품 금액</dt><dd>{total.toLocaleString()}원</dd>
            <dt>배송비</dt><dd>{delivery === 0 ? '무료' : `${delivery.toLocaleString()}원`}</dd>
            <dt>보유 혜택</dt><dd>결제 단계에서 포인트 사용</dd>
          </dl>
          <div className={styles.final}><span>총 결제 금액</span><strong>{finalTotal.toLocaleString()}원</strong></div>
          <button className="btn-primary" onClick={() => order(selectedItems)}>선택 상품 구매</button>
          <button className="btn-secondary" onClick={() => order(items)}>전체 상품 구매</button>
        </aside>
      </div>
    </div>
  );
}
