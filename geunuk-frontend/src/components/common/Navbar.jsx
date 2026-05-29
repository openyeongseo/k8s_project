import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../store';
import { useAuth } from '../../store';
import styles from './Navbar.module.css';

export default function Navbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { count } = useCart();
  const { loggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (path) => { nav(path); setMenuOpen(false); };
  const active = (path) => loc.pathname === path ? styles.active : '';

  return (
    <nav className={styles.nav}>
      <span className={styles.logo} onClick={() => go('/')}>GEUNUK</span>

      <div className={`${styles.menu} ${menuOpen ? styles.open : ''}`}>
        <span className={active('/')}          onClick={() => go('/')}>홈</span>
        <span className={active('/products')}  onClick={() => go('/products')}>상품 목록</span>
        <span className={active('/bmi')}       onClick={() => go('/bmi')}>헬스 전략</span>
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn} onClick={() => go('/products')} title="검색">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <button className={styles.iconBtn} onClick={() => go('/wishlist')} title="찜목록">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button className={styles.cartBtn} onClick={() => go('/cart')} title="장바구니">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          {count > 0 && <span className={styles.cartBadge}>{count}</span>}
        </button>
        {loggedIn ? (
          <>
            <button className={styles.iconBtn} onClick={() => go('/mypage')} title="마이페이지">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            <button className={styles.logoutBtn} onClick={() => { logout(); go('/'); }}>로그아웃</button>
          </>
        ) : (
          <button className={styles.loginBtn} onClick={() => go('/login')}>로그인</button>
        )}
        <button className={styles.burger} onClick={() => setMenuOpen(v => !v)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
