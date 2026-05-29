import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart, useToast, useAuth } from '../store';
import { MOCK_USER } from '../data/mock';
import styles from './OrderPage.module.css';

export default function OrderPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const { clear } = useCart();
  const { show } = useToast();
  const { user } = useAuth();

  const items = loc.state?.items || [];
  const [form, setForm] = useState({
    receiverName: user?.name || '',
    receiverPhone: user?.phone || '',
    deliveryAddress: user?.address || '',
    usedPoint: 0,
  });
  const [loading, setLoading] = useState(false);

  const subTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery  = subTotal >= 50000 ? 0 : 3000;
  const discount  = Number(form.usedPoint) || 0;
  const finalTotal = Math.max(0, subTotal + delivery - discount);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = () => {
    if (!form.receiverName || !form.receiverPhone || !form.deliveryAddress) {
      show('배송 정보를 모두 입력해주세요.', 'error'); return;
    }
    if (items.length === 0) { show('주문 상품이 없습니다.', 'error'); return; }
    setLoading(true);
    // Mock: 주문 생성 (실제는 orderAPI.create 호출)
    setTimeout(() => {
      clear();
      show('주문이 완료되었습니다! 🎉');
      nav('/orders/1001');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="page-wrap">
      <div className="breadcrumb">
        <span onClick={() => nav('/')}>홈</span><span className="sep">›</span>
        <span onClick={() => nav('/cart')}>장바구니</span><span className="sep">›</span>
        <span>주문/결제</span>
      </div>
      <div className={styles.layout}>
        <div className={styles.left}>
          {/* 주문 상품 */}
          <section className={styles.sec}>
            <h3 className={styles.secTitle}>ORDER ITEMS</h3>
            {items.length === 0 ? (
              <div className={styles.empty}>주문할 상품이 없습니다.<br /><button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => nav('/products')}>상품 보러가기</button></div>
            ) : items.map((item, i) => (
              <div key={i} className={styles.item}>
                <div className={styles.itemIcon}>{item.icon}</div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.productName}</div>
                  <div className={styles.itemQty}>수량: {item.quantity}개</div>
                </div>
                <div className={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()}원</div>
              </div>
            ))}
          </section>

          {/* 배송 정보 */}
          <section className={styles.sec}>
            <h3 className={styles.secTitle}>DELIVERY INFO</h3>
            {[
              { key: 'receiverName',    label: '수령인',    ph: '홍길동',             type: 'text' },
              { key: 'receiverPhone',   label: '연락처',    ph: '010-0000-0000',      type: 'text' },
              { key: 'deliveryAddress', label: '배송 주소', ph: '서울시 강남구 테헤란로', type: 'text' },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type} name={f.key} placeholder={f.ph} value={form[f.key]} onChange={handle} />
              </div>
            ))}
          </section>

          {/* 포인트 */}
          <section className={styles.sec}>
            <h3 className={styles.secTitle}>POINT</h3>
            <div className={styles.pointRow}>
              <span style={{ fontSize: 13, color: 'var(--txt2)' }}>
                보유 포인트: <b style={{ color: 'var(--acc)' }}>{(user?.point || MOCK_USER.point).toLocaleString()}P</b>
              </span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="form-input" type="number" name="usedPoint" min={0}
                  max={user?.point || MOCK_USER.point} value={form.usedPoint} onChange={handle} style={{ width: 140 }} />
                <button className="btn-ghost" onClick={() => setForm(p => ({ ...p, usedPoint: user?.point || MOCK_USER.point }))}>전액 사용</button>
              </div>
            </div>
          </section>
        </div>

        {/* 결제 요약 */}
        <div className={styles.summaryWrap}>
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>ORDER SUMMARY</h3>
            <div className={styles.sRow}><span>상품 금액</span><span>{subTotal.toLocaleString()}원</span></div>
            <div className={styles.sRow}><span>배송비</span><span style={{ color: delivery === 0 ? 'var(--acc)' : '' }}>{delivery === 0 ? '무료' : '3,000원'}</span></div>
            {discount > 0 && <div className={styles.sRow}><span>포인트 할인</span><span style={{ color: 'var(--red)' }}>-{discount.toLocaleString()}원</span></div>}
            <div className={`${styles.sRow} ${styles.sTotal}`}>
              <span>최종 결제 금액</span><span style={{ color: 'var(--acc)' }}>{finalTotal.toLocaleString()}원</span>
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={submit} disabled={loading || items.length === 0}>
              {loading ? '처리 중...' : '결제하기'}
            </button>
            <button className="btn-secondary" style={{ width: '100%', marginTop: 10 }} onClick={() => nav('/cart')}>장바구니로</button>
            <div className={styles.notice}>
              <p>• 결제 후 Kafka를 통해 재고가 차감됩니다.</p>
              <p>• 배송 시작 전까지 취소 가능합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
