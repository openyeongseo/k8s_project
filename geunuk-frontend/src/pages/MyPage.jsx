import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast, useWish } from '../store';
import { MOCK_POINT_HISTORY, MOCK_PRODUCTS, STATUS_LABEL } from '../data/mock';
import ProductCard from '../components/common/ProductCard';
import styles from './MyPage.module.css';

const TABS = ['주문 내역', '포인트', '찜 목록', '내 정보'];

export default function MyPage() {
  const nav = useNavigate();
  const { user, loggedIn, logout } = useAuth();
  const { show } = useToast();
  const { ids } = useWish();
  const [tab, setTab] = useState('주문 내역');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '한지나', email: user?.email || '', phone: user?.phone || '', address: user?.address || '' });

  if (!loggedIn) {
    return (
      <div className={styles.notLogged}>
        <p>로그인이 필요한 페이지입니다.</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => nav('/login')}>로그인하기</button>
      </div>
    );
  }

  const wishProducts = MOCK_PRODUCTS.filter(p => ids.has(p.id));

  const handleTabClick = (t) => {
    setTab(t);
    if (t === '주문 내역') {
      setOrdersLoading(true);
      fetch('http://192.168.56.104:8080/api/orders', {
        headers: { 'Authorization': `Bearer ${user?.accessToken}` }
      })
        .then(r => r.json())
        .then(data => setOrders(data.data?.orders || []))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  };

  return (
    <div className="page-wrap">
      <div className="breadcrumb">
        <span onClick={() => nav('/')}>홈</span><span className="sep">›</span><span>마이페이지</span>
      </div>
      <div className={styles.layout}>
        {/* 사이드바 */}
        <aside className={styles.sidebar}>
          <div className={styles.profile}>
            <div className={styles.avatar}>{(user?.name || '한')[0]}</div>
            <div className={styles.profileName}>{user?.name || '한지나'}님</div>
            <div className={styles.profileEmail}>{user?.email || 'jina@musclecatch.kr'}</div>
            <div className={styles.pointBadge}>
              <span>💰</span> {(user?.point || 100000).toLocaleString()}P
            </div>
          </div>
          <nav className={styles.sideNav}>
            {TABS.map(t => (
              <button key={t} className={`${styles.navItem} ${tab === t ? styles.navActive : ''}`} onClick={() => handleTabClick(t)}>{t}</button>
            ))}
            <button className={styles.navItem} style={{ color: 'var(--red)', marginTop: 8 }}
              onClick={() => { logout(); show('로그아웃되었습니다.'); nav('/'); }}>
              로그아웃
            </button>
          </nav>
        </aside>

        {/* 콘텐츠 */}
        <section className={styles.content}>
          {/* ── 주문 내역 ── */}
          {tab === '주문 내역' && (
            <div>
              <h2 className={styles.contentTitle}>주문 내역</h2>
              {ordersLoading ? (
                <div className={styles.empty}>불러오는 중...</div>
              ) : orders.length === 0 ? (
                <div className={styles.empty}>주문 내역이 없습니다.</div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className={styles.orderRow} onClick={() => nav(`/orders/${order.id}`)}>
                    <div className={styles.orderInfo}>
                      <div className={styles.orderName}>
                        {order.firstItemName}{order.itemCount > 1 ? ` 외 ${order.itemCount - 1}건` : ''}
                      </div>
                      <div className={styles.orderDate}>
                        주문번호 #{order.id} · {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <div className={styles.orderPrice}>{Number(order.totalPrice).toLocaleString()}원</div>
                    <span className={`badge badge-${order.status.toLowerCase()}`}>{STATUS_LABEL[order.status]}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── 포인트 ── */}
          {tab === '포인트' && (
            <div>
              <h2 className={styles.contentTitle}>포인트</h2>
              <div className={styles.pointCard}>
                <div className={styles.pointBig}>{(user?.point || 100000).toLocaleString()}<span>P</span></div>
                <div className={styles.pointLabel}>보유 포인트</div>
              </div>
              <div className={styles.historyTitle}>포인트 내역</div>
              {MOCK_POINT_HISTORY.map(h => (
                <div key={h.id} className={styles.historyRow}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--txt)' }}>{h.desc}</div>
                    <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{h.createdAt}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: h.amount > 0 ? '#789000' : 'var(--red)' }}>
                    {h.amount > 0 ? '+' : ''}{h.amount.toLocaleString()}P
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── 찜 목록 ── */}
          {tab === '찜 목록' && (
            <div>
              <h2 className={styles.contentTitle}>찜 목록</h2>
              {wishProducts.length === 0 ? (
                <div className={styles.empty}>찜한 상품이 없습니다.</div>
              ) : (
                <div className={styles.wishGrid}>
                  {wishProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          )}

          {/* ── 내 정보 ── */}
          {tab === '내 정보' && (
            <div>
              <h2 className={styles.contentTitle}>내 정보</h2>
              {[
                { key: 'name',    label: '이름',   type: 'text' },
                { key: 'email',   label: '이메일', type: 'email' },
                { key: 'phone',   label: '휴대폰', type: 'text' },
                { key: 'address', label: '배송지', type: 'text' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} value={profile[f.key]}
                    onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <button className="btn-primary" onClick={() => show('정보가 저장되었습니다.')}>저장하기</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
