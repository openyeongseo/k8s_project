import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS, CATEGORY_MAP } from '../data/mock';
import ProductCard from '../components/common/ProductCard';
import { useToast, useWish } from '../store';
import styles from './BmiPage.module.css';

const GOALS = [
  { key: 'muscle', label: '근육 증가', category: '근력기구' },
  { key: 'diet', label: '다이어트', category: '유산소' },
  { key: 'weight', label: '웨이트트레이닝', category: '웨이트리프팅' },
  { key: 'recovery', label: '회복/스트레칭', category: '보조 컬렉션' },
];

export function BmiPage() {
  const nav = useNavigate();
  const { show } = useToast();
  const [form, setForm] = useState({ height: '', weight: '', age: '', gender: '여성', activity: '보통 활동', goal: 'muscle' });
  const [result, setResult] = useState(null);
  const goal = GOALS.find(item => item.key === form.goal);
  const recommendations = useMemo(() => {
    if (!result) return [];
    const subs = CATEGORY_MAP[result.category] || [result.category];
    return MOCK_PRODUCTS.filter(p => subs.includes(p.category)).slice(0, 3);
  }, [result]);

  const calculate = e => {
    e.preventDefault();
    const heightM = Number(form.height) / 100;
    const weight = Number(form.weight);
    if (!heightM || !weight) { show('키와 몸무게를 입력해주세요.', 'error'); return; }
    const bmi = +(weight / (heightM * heightM)).toFixed(1);
    const status = bmi < 18.5 ? '저체중' : bmi < 25 ? '정상' : bmi < 30 ? '과체중' : '비만';
    let category = goal.category;
    if (status === '과체중' || status === '비만') category = form.goal === 'recovery' ? '보조 컬렉션' : '유산소';
    setResult({ bmi, status, category });
  };

  return (
    <div className="page-wrap">
      <div className="breadcrumb"><span onClick={() => nav('/')}>홈</span><span className="sep">›</span><span>헬스 전략 찾기</span></div>
      <section className={styles.hero}><p>HEALTH STRATEGY</p><h1>나에게 맞는 운동을 찾아보세요</h1><span>BMI와 운동 목적을 바탕으로 카테고리와 상품을 추천합니다.</span></section>
      <section className={styles.calculator}>
        <form className={styles.form} onSubmit={calculate}>
          <h2>WHAT IS BMI.</h2><p className={styles.guide}>키, 몸무게와 활동 정보를 입력해 체질량지수를 측정해보세요.</p>
          <div className={styles.fieldGrid}>
            <input type="number" placeholder="키 / cm" value={form.height} onChange={e => setForm(prev => ({ ...prev, height: e.target.value }))} />
            <input type="number" placeholder="몸무게 / kg" value={form.weight} onChange={e => setForm(prev => ({ ...prev, weight: e.target.value }))} />
            <input type="number" placeholder="나이" value={form.age} onChange={e => setForm(prev => ({ ...prev, age: e.target.value }))} />
            <select value={form.gender} onChange={e => setForm(prev => ({ ...prev, gender: e.target.value }))}><option>여성</option><option>남성</option><option>선택 안함</option></select>
            <select className={styles.full} value={form.activity} onChange={e => setForm(prev => ({ ...prev, activity: e.target.value }))}><option>낮은 활동량</option><option>보통 활동</option><option>높은 활동량</option></select>
          </div>
          <label className={styles.goalLabel}>운동 목적</label>
          <div className={styles.goals}>{GOALS.map(item => <button type="button" key={item.key} className={form.goal === item.key ? styles.goalActive : ''} onClick={() => setForm(prev => ({ ...prev, goal: item.key }))}>{item.label}</button>)}</div>
          <button className="btn-primary" type="submit">CALCULATE →</button>
        </form>
        <div className={styles.bmiTable}>
          <h3>BMI <span>WEIGHT STATUS</span></h3>
          <div><b>Below 18.5</b><span>저체중</span></div><div><b>18.5 - 24.9</b><span>정상</span></div><div><b>25.0 - 29.9</b><span>과체중</span></div><div><b>30.0 and Above</b><span>비만</span></div>
          {result && <aside className={styles.result}><p>나의 BMI</p><strong>{result.bmi}</strong><b>{result.status}</b><button onClick={() => nav(`/products?category=${encodeURIComponent(result.category)}`)}>{result.category} 상품 전체보기 →</button></aside>}
        </div>
      </section>
      {result && <section className={styles.recommend}><header><div><p>RECOMMENDED FOR YOU</p><h2>{result.category} 추천 상품</h2></div><button onClick={() => nav(`/products?category=${encodeURIComponent(result.category)}`)}>추천 카테고리 이동 →</button></header><div className={styles.grid}>{recommendations.map(product => <ProductCard key={product.id} product={product} />)}</div></section>}
    </div>
  );
}

export function WishlistPage() {
  const nav = useNavigate();
  const { ids } = useWish();
  const products = MOCK_PRODUCTS.filter(product => ids.has(product.id));
  return (
    <div className="page-wrap">
      <div className="breadcrumb"><span onClick={() => nav('/')}>홈</span><span className="sep">›</span><span>찜 목록</span></div>
      <header className={styles.wishHeading}><p>WISHLIST</p><h1>찜한 상품</h1></header>
      {products.length ? <section className={styles.wishGrid}>{products.map(product => <ProductCard key={product.id} product={product} />)}</section> : <div className={styles.wishEmpty}><h2>찜한 상품이 없습니다.</h2><button className="btn-primary" onClick={() => nav('/products')}>상품 둘러보기</button></div>}
    </div>
  );
}
