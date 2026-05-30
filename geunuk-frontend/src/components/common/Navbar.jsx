import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../data/mock';
import { useAuth, useCart } from '../../store';
import styles from './Navbar.module.css';

export default function Navbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { count } = useCart();
  const { loggedIn, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const go = (path) => { nav(path); setMenuOpen(false); };
  const search = (e) => {
    e.preventDefault();
    nav(`/products?keyword=${encodeURIComponent(keyword)}`);
    setSearchOpen(false);
  };
  const active = (path) => loc.pathname === path ? styles.active : '';

  return (
    <header className={styles.header}>
      <div className={styles.notice}>신규 가입 고객 <b>100,000P</b> 지급 · 홈짐 장비 무료 배송 이벤트</div>
      <div className={styles.main}>
        <button className={styles.mobileBtn} onClick={() => setMenuOpen(v => !v)} aria-label="메뉴 열기"><span /><span /><span /></button>
        <Link className={styles.logo} to="/">
          <span className={styles.logoMark}>M</span>
          <span className={styles.logoText}>근육캐치<small>MUSCLE CATCH</small></span>
        </Link>
        <nav className={`${styles.mainMenu} ${menuOpen ? styles.open : ''}`}>
          <button className={active('/')} onClick={() => go('/')}>홈</button>
          <button className={active('/products')} onClick={() => go('/products')}>상품 목록</button>
          <button className={active('/bmi')} onClick={() => go('/bmi')}>헬스 전략 찾기</button>
          <button className={active('/wishlist')} onClick={() => go('/wishlist')}>찜 목록</button>
        </nav>
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => setSearchOpen(v => !v)} aria-label="검색">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          </button>
          <button className={styles.iconBtn} onClick={() => go('/wishlist')} aria-label="찜 목록">
            <svg viewBox="0 0 24 24"><path d="M20.8 4.8a5.4 5.4 0 0 0-7.6 0L12 6l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z" /></svg>
          </button>
          <button className={styles.iconBtn} onClick={() => go('/cart')} aria-label="장바구니">
            <svg viewBox="0 0 24 24"><path d="M2.5 3h3l2.3 11.5h10.7l2-8H6.2" /><circle cx="9" cy="19" r="1.5" /><circle cx="18" cy="19" r="1.5" /></svg>
            {count > 0 && <em>{count}</em>}
          </button>
          {loggedIn ? (
            <button className={styles.userButton} onClick={() => go('/mypage')}>{user?.name || '마이페이지'}</button>
          ) : <button className={styles.login} onClick={() => go('/login')}>로그인</button>}
          {loggedIn && <button className={styles.logout} onClick={() => { logout(); go('/'); }}>로그아웃</button>}
        </div>
      </div>
      {searchOpen && (
        <form className={styles.searchBox} onSubmit={search}>
          <input autoFocus value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="상품명 또는 브랜드를 검색하세요" />
          <button type="submit">검색</button>
        </form>
      )}
      <div className={styles.categoryBar}>
        {CATEGORIES.slice(1).map(category => (
          <button key={category} onClick={() => nav(`/products?category=${encodeURIComponent(category)}`)}>{category}<span>+</span></button>
        ))}
      </div>
    </header>
  );
}
