import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FALLBACK_IMAGE, MOCK_PRODUCTS } from '../data/mock';
import ProductCard from '../components/common/ProductCard';
import styles from './HomePage.module.css';

const FEATURED_CATEGORIES = [
  { title: 'STRENGTH ZONE', sub: '근력기구', category: '스미스머신', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80' },
  { title: 'CARDIO TRAINING', sub: '유산소', category: '유산소', image: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?auto=format&fit=crop&w=800&q=80' },
  { title: 'HOME RECOVERY', sub: '리커버리', category: '리커버리', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80' },
];

export default function HomePage() {
  const nav = useNavigate();
  const popular = MOCK_PRODUCTS.filter(p => ['BEST', 'SALE'].includes(p.badge)).slice(0, 4);
  const recommended = MOCK_PRODUCTS.filter(p => ['NEW', 'HOT'].includes(p.badge)).slice(0, 4);
  const shopCategory = category => nav(`/products?category=${encodeURIComponent(category)}`);

  return (
    <div className="page-wrap">
      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>MUSCLE CATCH · FITNESS EQUIPMENT</p>
          <h1>내 몸에 맞는<br />운동을 <strong>캐치</strong>하다</h1>
          <p className={styles.heroDesc}>전문가급 홈짐 장비부터 목표 기반 상품 추천까지.<br />근육캐치에서 나만의 운동 공간을 완성하세요.</p>
          <div className={styles.heroActions}>
            <button className="btn-primary" onClick={() => nav('/products')}>상품 둘러보기</button>
            <button className={styles.outlineButton} onClick={() => nav('/bmi')}>헬스 전략 찾기</button>
          </div>
        </div>
      </section>

      <section className={styles.tiles}>
        {FEATURED_CATEGORIES.map(item => (
          <button key={item.category} className={styles.tile} onClick={() => shopCategory(item.category)}>
            <img src={item.image} alt={item.sub} onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }} />
            <span><b>{item.title}</b><small>{item.sub} 상품 보기 →</small></span>
          </button>
        ))}
      </section>

      <div className={styles.ticker}>
        <span>FITNESS & GYM</span><i /> <span>HOME TRAINING</span><i /> <span>HEALTH STRATEGY</span><i /> <span>RECOVERY GOODS</span><i /> <span>NEW ARRIVAL</span>
      </div>

      <section className={styles.products}>
        <div className={styles.sectionTitle}>
          <div><p>BEST COLLECTION</p><h2>인기 상품</h2></div>
          <button onClick={() => nav('/products?sort=인기순')}>전체 보기 →</button>
        </div>
        <div className={styles.grid}>{popular.map(product => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className={styles.strategy}>
        <div className={styles.strategyPhoto} />
        <div className={styles.strategyText}>
          <p>HEALTH STRATEGY FINDER</p>
          <h2>BMI와 운동 목표로<br />상품을 추천받으세요</h2>
          <p className={styles.description}>키와 몸무게, 운동 목표를 입력하면 내게 필요한 카테고리와 추천 상품을 바로 확인할 수 있습니다.</p>
          <button className="btn-primary" onClick={() => nav('/bmi')}>나의 전략 찾기</button>
        </div>
      </section>

      <section className={styles.products}>
        <div className={styles.sectionTitle}>
          <div><p>NEW & CURATED</p><h2>추천 상품</h2></div>
          <button onClick={() => nav('/products')}>더 보기 →</button>
        </div>
        <div className={styles.grid}>{recommended.map(product => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className={styles.joinBanner}>
        <div><p>NEW MEMBER BENEFIT</p><h2>회원가입 즉시 <strong>100,000P</strong></h2><span>장비 구매 시 바로 사용할 수 있는 신규 회원 혜택</span></div>
        <button className="btn-primary" onClick={() => nav('/signup')}>회원가입하기</button>
      </section>
    </div>
  );
}
