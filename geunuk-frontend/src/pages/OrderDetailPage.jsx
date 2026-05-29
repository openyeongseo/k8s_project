import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_ORDERS, STATUS_LABEL } from '../data/mock';
import { useToast } from '../store';
import styles from './OrderDetailPage.module.css';

const STEPS = ['PENDING','CONFIRMED','SHIPPING','COMPLETED'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { show } = useToast();

  const order = MOCK_ORDERS.find(o => o.id === Number(id)) || MOCK_ORDERS[0];
  const stepIdx = STEPS.indexOf(order.status);
  const cancelled = order.status === 'CANCELLED';

  const handleCancel = () => {
    show('주문이 취소되었습니다.', 'info');
    nav('/mypage');
  };

  return (
    <div className="page-wrap">
      <div className="breadcrumb">
        <span onClick={() => nav('/')}>홈</span><span className="sep">›</span>
        <span onClick={() => nav('/mypage')}>마이페이지</span><span className="sep">›</span>
        <span>주문 상세</span>
      </div>
      <div className={styles.wrap}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div>
            <div className={styles.orderId}>ORDER #{order.id}</div>
            <div className={styles.orderDate}>{order.createdAt}</div>
          </div>
          <span className={`badge badge-${order.status.toLowerCase()}`}>{STATUS_LABEL[order.status]}</span>
        </div>

        {/* 진행 스텝 */}
        {!cancelled && (
          <div className={styles.stepBar}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={styles.stepItem}>
                  <div className={`${styles.dot} ${i <= stepIdx ? styles.dotActive : ''}`} />
                  <div className={`${styles.stepLabel} ${i <= stepIdx ? styles.stepLabelActive : ''}`}>{STATUS_LABEL[s]}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`${styles.line} ${i < stepIdx ? styles.lineActive : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* 주문 상품 */}
        <div className={styles.sec}>
          <h3 className={styles.secTitle}>주문 상품</h3>
          {order.items.map((item, i) => (
            <div key={i} className={styles.item}>
              <div className={styles.itemIcon}>📦</div>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemMeta}>수량 {item.qty || 1}개</div>
              </div>
              <div className={styles.itemPrice}>{order.totalPrice.toLocaleString()}원</div>
            </div>
          ))}
        </div>

        {/* 결제 정보 */}
        <div className={styles.sec}>
          <h3 className={styles.secTitle}>결제 정보</h3>
          <div className={styles.payRow}><span>총 결제 금액</span><span style={{ color: 'var(--acc)', fontWeight: 700 }}>{order.totalPrice.toLocaleString()}원</span></div>
        </div>

        {/* 버튼 */}
        <div className={styles.actions}>
          <button className="btn-secondary" onClick={() => nav('/mypage')}>목록으로</button>
          {['PENDING','CONFIRMED'].includes(order.status) && (
            <button className={styles.cancelBtn} onClick={handleCancel}>주문 취소</button>
          )}
        </div>
      </div>
    </div>
  );
}
