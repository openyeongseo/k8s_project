import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FALLBACK_IMAGE, MOCK_ORDERS, STATUS_LABEL } from '../data/mock';
import { useToast } from '../store';
import styles from './OrderDetailPage.module.css';

const STEPS = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const { show } = useToast();
  const order = location.state?.order || MOCK_ORDERS.find(item => item.id === Number(id)) || MOCK_ORDERS[0];
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
            {order.items.map((item, index) => <article className={styles.item} key={index}><img src={item.image || FALLBACK_IMAGE} alt="" onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} /><div><b>{item.name}</b><span>수량 {item.qty || item.quantity}개</span></div><strong>{((item.price || order.totalPrice) * (item.qty || item.quantity || 1)).toLocaleString()}원</strong></article>)}
          </section>
          <section className={styles.section}>
            <h2>결제 정보</h2>
            <dl><dt>결제 수단</dt><dd>신용/체크카드</dd><dt>배송비</dt><dd>무료</dd><dt>결제 금액</dt><dd className={styles.total}>{order.totalPrice.toLocaleString()}원</dd></dl>
          </section>
        </div>
        <div className={styles.buttons}><button className="btn-secondary" onClick={() => nav('/products')}>쇼핑 계속하기</button><button className="btn-primary" onClick={() => nav('/mypage')}>주문 내역 보기</button>{!isCancelled && order.status !== 'COMPLETED' && <button className={styles.cancel} onClick={() => show('주문 취소 접수가 완료되었습니다.', 'info')}>주문 취소</button>}</div>
      </section>
    </div>
  );
}
