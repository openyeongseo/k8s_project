import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useToast } from '../store';
import styles from './CartPage.module.css';

export default function CartPage() {
  const nav = useNavigate();
  const { items, remove, updateQty, total, clear } = useCart();
  const { show } = useToast();

  const delivery = total >= 50000 ? 0 : 3000;
  const finalTotal = total + delivery;

  const handleOrder = () => {
    if (items.length === 0) { show('장바구니가 비어있습니다.', 'error'); return; }
    nav('/order', {
      state: {
        items: items.map(i => ({
          productId: i.id, productName: i.name,
          price: i.price, quantity: i.qty, icon: i.icon
        }))
      }
    });
  };

  return (
    <div className="page-wrap">
      <div className="breadcrumb">
        <span onClick={() => nav('/')}>홈</span><span className="sep">›</span><span>장바구니</span>
      </div>
      <div className={styles.layout}>
        <div className={styles.left}>
          <div className={styles.cartHeader}>
            <span className={styles.cartTitle}>CART <span>({items.length}개)</span></span>
            {items.length > 0 && <button className="btn-ghost" onClick={clear}>전체 삭제</button>}
          </div>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
              <p>장바구니가 비어있습니다.</p>
              <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => nav('/products')}>쇼핑하러 가기</button>
            </div>
          ) : items.map(item => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemImg}>{item.icon}</div>
              <div className={styles.itemInfo}>
                <div className={styles.itemBrand}>{item.brand}</div>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemPrice}>{(item.price * item.qty).toLocaleString()}원</div>
              </div>
              <div className={styles.itemRight}>
                <button className={styles.delBtn} onClick={() => { remove(item.id); show('삭제되었습니다.'); }}>✕</button>
                <div className={styles.qtyRow}>
                  <button className={styles.qBtn} onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                  <span className={styles.qNum}>{item.qty}</span>
                  <button className={styles.qBtn} onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>ORDER SUMMARY</h3>
          <div className={styles.row}><span>상품 금액</span><span>{total.toLocaleString()}원</span></div>
          <div className={styles.row}><span>배송비</span><span style={{ color: delivery === 0 ? 'var(--acc)' : 'var(--txt)' }}>{delivery === 0 ? '무료' : '3,000원'}</span></div>
          <div className={`${styles.row} ${styles.total}`}>
            <span>최종 금액</span><span style={{ color: 'var(--acc)' }}>{finalTotal.toLocaleString()}원</span>
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={handleOrder}>주문하기</button>
          <button className="btn-secondary" style={{ width: '100%', marginTop: 10 }} onClick={() => nav('/products')}>쇼핑 계속하기</button>
        </div>
      </div>
    </div>
  );
}
