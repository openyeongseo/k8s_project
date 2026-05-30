import React from 'react';
import { Link } from 'react-router-dom';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <div className={styles.brand}>근육캐치 <span>MUSCLE CATCH</span></div>
          <p className={styles.desc}>운동 목적과 체형에 맞는 장비를 추천하는 헬스 이커머스 플랫폼</p>
        </div>
        <div className={styles.links}>
          <Link to="/products">상품 목록</Link><Link to="/bmi">헬스 전략 찾기</Link><Link to="/mypage">마이페이지</Link>
        </div>
        <div className={styles.company}>
          <b>근육캐치</b>
          <span>고객센터 1588-0000 | 평일 10:00 - 18:00</span>
          <span>© 2026 MUSCLE CATCH. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
}
