import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS, CATEGORIES } from '../data/mock';
import ProductCard from '../components/common/ProductCard';
import styles from './HomePage.module.css';

export default function HomePage() {
  const nav = useNavigate();
  const [activeCat, setActiveCat] = useState('전체');

  const popular = MOCK_PRODUCTS.slice(0, 4);
  const newArrivals = MOCK_PRODUCTS.filter(p => p.badge === 'NEW' || p.badge === 'BEST');

  return (
    <div className="page-wrap">
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <span className={styles.heroTag}>NEW ARRIVAL 2025</span>
            <h1 className={styles.heroTitle}>
              근육을<br /><span>캐치</span>하라
            </h1>
            <p className={styles.heroSub}>
              당신의 목표를 위한 최강의 헬스용품<br />
              지금 바로 시작하세요
            </p>
            <div className={styles.heroBtns}>
              <button className="btn-primary" onClick={() => nav('/products')}>쇼핑하기 →</button>
              <button className="btn-secondary" onClick={() => nav('/bmi')}>BMI 체크</button>
            </div>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}><span className={styles.statNum}>2.5K+</span><span className={styles.statLabel}>PRODUCTS</span></div>
            <div className={styles.stat}><span className={styles.statNum}>98%</span><span className={styles.statLabel}>SATISFACTION</span></div>
            <div className={styles.stat}><span className={styles.statNum}>15K+</span><span className={styles.statLabel}>CUSTOMERS</span></div>
          </div>
        </div>
        <div className={styles.heroBg} />
      </section>

      {/* CATEGORY STRIP */}
      <section className={styles.catSection}>
        <div className={styles.catStrip}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`${styles.catChip} ${activeCat === c ? styles.catActive : ''}`}
              onClick={() => setActiveCat(c)}
            >{c}</button>
          ))}
        </div>
      </section>

      {/* POPULAR ITEMS */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className="sec-title">POPULAR ITEMS</h2>
          <span className={styles.more} onClick={() => nav('/products')}>전체보기 →</span>
        </div>
        <div className={styles.grid4}>
          {popular.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* BANNER */}
      <section className={styles.banner}>
        <div className={styles.bannerInner}>
          <div className={styles.bannerText}>
            <div className={styles.bannerTag}>SPECIAL OFFER</div>
            <div className={styles.bannerTitle}>신규 가입 시<br /><span>100,000P</span> 지급</div>
            <div className={styles.bannerSub}>지금 가입하고 포인트로 바로 사용하세요</div>
          </div>
          <button className="btn-primary" onClick={() => nav('/signup')} style={{ fontSize: '14px', padding: '15px 36px' }}>
            회원가입하기
          </button>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className="sec-title">NEW & BEST</h2>
          <span className={styles.more} onClick={() => nav('/products')}>전체보기 →</span>
        </div>
        <div className={styles.grid4}>
          {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>GEUNUK</div>
        <div className={styles.footerText}>© 2025 근육캐치. K8s MSA 이커머스 프로젝트.</div>
        <div className={styles.footerLinks}>
          <span>GitHub</span><span>Notion</span><span>Swagger</span>
        </div>
      </footer>
    </div>
  );
}
