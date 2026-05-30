import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FALLBACK_IMAGE } from '../data/mock';
import { useCart, useToast } from '../store';
import styles from './CartPage.module.css';

export default function CartPage() {
  const nav = useNavigate();
  const { items, remove, updateQty, clear } = useCart();
  const { show } = useToast();
  const [checked, setChecked] = useState(new Set(items.map(item => item.id)));

  const selectedItems = items.filter(item => checked.has(item.id));
  const total = useMemo(() => selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0), [selectedItems]);
  const delivery = !selectedItems.length || total >= 50000 ? 0 : 3000;
  const finalTotal = total + delivery;
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const toggleAll = () => setChecked(allSelected ? new Set() : new Set(items.map(item => item.id)));
  const toggle = id => setChecked(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const removeSelected = () => { selectedItems.forEach(item => remove(item.id)); show('선택 상품을 삭제했습니다.'); };
  const order = orderItems => {
    if (!orderItems.length) { show('구매할 상품을 선택해주세요.', 'error'); return; }
    nav('/order', { state: { items: orderItems.map(item => ({ productId: item.id, productName: item.name, price: item.price, quantity: item.qty, image: item.image })) } });
  };

  return (
    <div className="page-wrap">
      <div className="breadcrumb"><span onClick={() => nav('/')}>홈</span><span className="sep">›</span><span>장바구니</span></div>
      <header className={styles.heading}><p>CART</p><h1>장바구니</h1></header>
      <div className={styles.layout}>
        <section>
          <div className={styles.tools}>
            <label><input type="checkbox" checked={allSelected} onChange={toggleAll} /> 전체 선택 <b>({selectedItems.length}/{items.length})</b></label>
            <div><button onClick={removeSelected} disabled={!selectedItems.length}>선택 삭제</button><button onClick={clear} disabled={!items.length}>전체 삭제</button></div>
          </div>
          {items.length === 0 ? (
            <div className={styles.empty}><h2>장바구니가 비어 있습니다.</h2><p>근육캐치의 인기 장비를 살펴보세요.</p><button className="btn-primary" onClick={() => nav('/products')}>상품 보러가기</button></div>
          ) : items.map(item => (
            <article key={item.id} className={styles.item}>
              <input className={styles.check} type="checkbox" checked={checked.has(item.id)} onChange={() => toggle(item.id)} aria-label="상품 선택" />
              <img src={item.image} alt={item.name} onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} onClick={() => nav(`/products/${item.id}`)} />
              <div className={styles.itemInfo}>
                <small>{item.brand}</small><h2 onClick={() => nav(`/products/${item.id}`)}>{item.name}</h2><p>기본 구성 / 무료배송</p>
                <strong>{item.price.toLocaleString()}원</strong>
              </div>
              <div className={styles.control}>
                <button className={styles.delete} onClick={() => remove(item.id)} aria-label="삭제">×</button>
                <div className={styles.qty}><button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}>−</button><b>{item.qty}</b><button onClick={() => updateQty(item.id, item.qty + 1)}>+</button></div>
                <strong>{(item.price * item.qty).toLocaleString()}원</strong>
              </div>
            </article>
          ))}
        </section>
        <aside className={styles.summary}>
          <h2>결제 예정 금액</h2>
          <dl><dt>선택 상품 금액</dt><dd>{total.toLocaleString()}원</dd><dt>배송비</dt><dd>{delivery === 0 ? '무료' : `${delivery.toLocaleString()}원`}</dd><dt>보유 혜택</dt><dd>결제 단계에서 포인트 사용</dd></dl>
          <div className={styles.final}><span>총 결제 금액</span><strong>{finalTotal.toLocaleString()}원</strong></div>
          <button className="btn-primary" onClick={() => order(selectedItems)}>선택 상품 구매</button>
          <button className="btn-secondary" onClick={() => order(items)}>전체 상품 구매</button>
        </aside>
      </div>
    </div>
  );
}
