import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FALLBACK_IMAGE, STATUS_LABEL } from '../data/mock';
import { useToast, useAuth } from '../store';
import styles from './OrderDetailPage.module.css';

const STEPS = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const { show } = useToast();
  const { user } = useAuth();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (location.state?.order) return;
    fetch(`/api/orders/${id}`, {
      headers: {
        'X-User-Id': String(user?.id || ''),
        'Authorization': `Bearer ${user?.accessToken || ''}`,
      },
    })
      .then(r => r.json())
      .then(data => { if (data.data) setOrder(data.data); })
      .catch(() => show('주문 정보를 불러오지 못했습니다.', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-wrap"><p style={{ padding: 40 }}>불러오는 중...</p></div>;
  if (!order) return <div className="page-wrap"><p style={{ padding: 40 }}>주문 정보를 찾을 수 없습니다.</p></div>;

  const stepIndex = STEPS.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="page-wrap">
      <div className="breadcrumb"><span onClick={() => nav('/')}>홈</span><span className="sep">›</span><span onClick={() => nav('/mypage')}>마이페이지</span><span className="sep">›</span><span>주문 상세</span></div>
      <header className={styles.heading}>
        <p>ORDER COMPLETE</p><h1>주문이 완료되었습니다</h1><span>주문번호 MC-{order.id} · {order.createdAt}</span>
      </header>
      <section className={styles.wrap}>
        <div className={styles.status}>
          <h2>주문 상태 <span className={`badge badge-${order.status.toLowerCase()}`}>{STATUS_LABEL[order.status]}</span></h2>
          {!isCancelled && <div className={styles.steps}>{STEPS.map((step, index) => <React.Fragment key={step}><div className={index <= stepIndex ? styles.active : ''}><b>{index + 1}</b><span>{STATUS_LABEL[step]}</span></div>{index < STEPS.length - 1 && <i className={index < stepIndex ? styles.lineActive : ''} />}</React.Fragment>)}</div>}
          {isCancelled && <p className={styles.cancelled}>취소 처리된 주문입니다.</p>}
        </div>
        <div className={styles.columns}>
          <section className={styles.section}>
            <h2>주문 상품</h2>
            {(order.items || []).map((item, index) => <article className={styles.item} key={index}><img src={item.image || item.imageUrl || FALLBACK_IMAGE} alt="" onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} /><div><b>{item.productName || item.name}</b><span>수량 {item.quantity || item.qty}개</span></div><strong>{(Number(item.price) * (item.quantity || item.qty || 1)).toLocaleString()}원</strong></article>)}
          </section>
          <section className={styles.section}>
            <h2>결제 정보</h2>
            <dl><dt>결제 수단</dt><dd>신용/체크카드</dd><dt>배송비</dt><dd>무료</dd>{order.usedPoint > 0 && <><dt>포인트 사용</dt><dd>{Number(order.usedPoint).toLocaleString()}P</dd></>}<dt>결제 금액</dt><dd className={styles.total}>{Number(order.totalPrice) === 0 && order.usedPoint > 0 ? '무료 (포인트 결제)' : `${Number(order.totalPrice).toLocaleString()}원`}</dd></dl>
          </section>
        </div>
        <div className={styles.buttons}><button className="btn-secondary" onClick={() => nav('/products')}>쇼핑 계속하기</button><button className="btn-primary" onClick={() => nav('/mypage')}>주문 내역 보기</button>{!isCancelled && order.status !== 'COMPLETED' && <button className={styles.cancel} onClick={() => show('주문 취소 접수가 완료되었습니다.', 'info')}>주문 취소</button>}</div>
      </section>
    </div>
  );
}
