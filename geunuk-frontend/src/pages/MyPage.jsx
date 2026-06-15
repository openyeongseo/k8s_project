import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast, useWish } from '../store';
import { MOCK_PRODUCTS, STATUS_LABEL } from '../data/mock';
import ProductCard from '../components/common/ProductCard';
import styles from './MyPage.module.css';

const TABS = ['주문 내역', '포인트', '찜 목록', '내 정보'];

const REASON_LABEL = {
  SIGNUP: '회원가입 적립',
  ORDER: '주문 적립',
  DEDUCT: '포인트 사용',
  ADMIN: '관리자 지급',
  REFUND: '환불 적립',
};

export default function MyPage() {
  const nav = useNavigate();
  const { user, loggedIn, logout } = useAuth();
  const { show } = useToast();
  const { ids } = useWish();
  const [tab, setTab] = useState('주문 내역');

  // 주문
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // 포인트
  const [pointBalance, setPointBalance] = useState(null);
  const [pointHistory, setPointHistory] = useState([]);
  const [pointLoading, setPointLoading] = useState(false);

  // 내 정보
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const authHeaders = () => ({
    'X-User-Id': String(user?.id || ''),
    'Authorization': `Bearer ${user?.accessToken || ''}`,
  });

  if (!loggedIn) {
    return (
      <div className={styles.notLogged}>
        <p>로그인이 필요한 페이지입니다.</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => nav('/login')}>로그인하기</button>
      </div>
    );
  }
  useEffect(() => {
    if (!user?.id) return;
    fetch('/api/points/balance', { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setPointBalance(data.data?.balance ?? 0))
      .catch(() => {});
  }, [user?.id]);

  const wishProducts = MOCK_PRODUCTS.filter(p => ids.has(p.id));
  const handleTabClick = (t) => {
    setTab(t);
    if (t === '주문 내역') {
      setOrdersLoading(true);
      fetch('/api/orders', { headers: authHeaders() })
        .then(r => r.json())
        .then(data => setOrders(data.data?.orders || []))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
    if (t === '포인트') {
      setPointLoading(true);
      Promise.all([
        fetch('/api/points/balance', { headers: authHeaders() }).then(r => r.json()),
        fetch('/api/points/history?page=0&size=20', { headers: authHeaders() }).then(r => r.json()),
      ])
        .then(([balanceData, historyData]) => {
          setPointBalance(balanceData.data?.balance ?? 0);
          // Spring Page 응답: data.content
          setPointHistory(historyData.data?.content || []);
        })
        .catch(() => { setPointBalance(0); setPointHistory([]); })
        .finally(() => setPointLoading(false));
    }
  };

  // 마운트 시 주문 내역 첫 로드
  useEffect(() => {
    handleTabClick('주문 내역');
  }, []);

  return (
    <div className="page-wrap">
      <div className="breadcrumb">
        <span onClick={() => nav('/')}>홈</span><span className="sep">›</span><span>마이페이지</span>
      </div>
      <div className={styles.layout}>
        {/* 사이드바 */}
        <aside className={styles.sidebar}>
          <div className={styles.profile}>
            <div className={styles.avatar}>{(user?.name || '?')[0]}</div>
            <div className={styles.profileName}>{user?.name || ''}님</div>
            <div className={styles.profileEmail}>{user?.email || ''}</div>
            <div className={styles.pointBadge}>
              <span>💰</span> {(pointBalance ?? user?.point ?? 0).toLocaleString()}P
            </div>
          </div>
          <nav className={styles.sideNav}>
            {TABS.map(t => (
              <button key={t} className={`${styles.navItem} ${tab === t ? styles.navActive : ''}`} onClick={() => handleTabClick(t)}>{t}</button>
            ))}
            <button
              className={styles.navItem}
              style={{ color: 'var(--red)', marginTop: 8 }}
              onClick={() => { logout(); show('로그아웃되었습니다.'); nav('/'); window.location.reload(); }}
            >
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
                        {order.firstItemName || '(상품명 로딩 중)'}{order.itemCount > 1 ? ` 외 ${order.itemCount - 1}건` : ''}
                      </div>
                      <div className={styles.orderDate}>
                        주문번호 #{order.id} · {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <div className={styles.orderPrice}>{Number(order.totalPrice) > 0 ? `${Number(order.totalPrice).toLocaleString()}원` : '포인트 결제'}</div>
                    <span className={`badge badge-${order.status?.toLowerCase()}`}>{STATUS_LABEL[order.status]}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── 포인트 ── */}
          {tab === '포인트' && (
            <div>
              <h2 className={styles.contentTitle}>포인트</h2>
              {pointLoading ? (
                <div className={styles.empty}>불러오는 중...</div>
              ) : (
                <>
                  <div className={styles.pointCard}>
                    <div className={styles.pointBig}>{(pointBalance ?? 0).toLocaleString()}<span>P</span></div>
                    <div className={styles.pointLabel}>보유 포인트</div>
                  </div>
                  <div className={styles.historyTitle}>포인트 내역</div>
                  {pointHistory.length === 0 ? (
                    <div className={styles.empty}>포인트 내역이 없습니다.</div>
                  ) : pointHistory.map(h => (
                    <div key={h.id} className={styles.historyRow}>
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--txt)' }}>{REASON_LABEL[h.reason] || h.reason}</div>
                        <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>
                          {new Date(h.createdAt).toLocaleDateString('ko-KR')} · 잔액 {Number(h.balanceAfter).toLocaleString()}P
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, color: h.amount > 0 ? '#789000' : 'var(--red)' }}>
                        {h.amount > 0 ? '+' : ''}{Number(h.amount).toLocaleString()}P
                      </span>
                    </div>
                  ))}
                </>
              )}
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
