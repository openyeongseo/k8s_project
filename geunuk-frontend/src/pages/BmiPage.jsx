import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../data/mock';
import ProductCard from '../components/common/ProductCard';
import styles from './BmiPage.module.css';

export function BmiPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ height: '', weight: '' });
  const [result, setResult] = useState(null);

  const calc = () => {
    const h = Number(form.height) / 100;
    const w = Number(form.weight);
    if (!h || !w) return;
    const bmi = (w / (h * h)).toFixed(1);
    let grade, color, recommend;
    if      (bmi < 18.5) { grade = '저체중';   color = '#60a5fa'; recommend = '덤벨/바벨'; }
    else if (bmi < 23)   { grade = '정상';     color = 'var(--acc)'; recommend = '스트레칭'; }
    else if (bmi < 25)   { grade = '과체중';   color = '#fbbf24'; recommend = '매트'; }
    else                  { grade = '비만';     color = 'var(--red)'; recommend = '런닝머신'; }
    setResult({ bmi, grade, color, recommend });
  };

  const recommended = result ? MOCK_PRODUCTS.filter(p => p.category === result.recommend).slice(0, 3) : [];

  return (
    <div className="page-wrap">
      <div className="breadcrumb">
        <span onClick={() => nav('/')}>홈</span><span className="sep">›</span><span>헬스 전략 찾기</span>
      </div>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <h1 className={styles.title}>BMI<br /><span>체크</span></h1>
          <p className={styles.sub}>나에게 맞는 헬스 전략을 찾아보세요</p>

          <div className={styles.inputs}>
            <div className="form-group">
              <label className="form-label">키 (cm)</label>
              <input className="form-input" type="number" placeholder="예: 175" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">몸무게 (kg)</label>
              <input className="form-input" type="number" placeholder="예: 70" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} />
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={calc}>BMI 계산하기</button>

          {result && (
            <div className={styles.result}>
              <div className={styles.bmiNum} style={{ color: result.color }}>{result.bmi}</div>
              <div className={styles.bmiGrade} style={{ color: result.color }}>{result.grade}</div>
              <div className={styles.bmiMsg}>추천 운동: <b style={{ color: result.color }}>{result.recommend}</b> 카테고리</div>
              <div className={styles.bmiDesc}>
                {result.grade === '저체중' && '근육량을 늘리는 웨이트 트레이닝을 시작해보세요.'}
                {result.grade === '정상'   && '현재 체형을 유지하는 스트레칭과 균형 운동을 추천합니다.'}
                {result.grade === '과체중' && '유산소와 코어 운동을 병행하세요.'}
                {result.grade === '비만'   && '꾸준한 유산소 운동으로 체중 감량을 시작해보세요.'}
              </div>
            </div>
          )}
        </div>

        {result && recommended.length > 0 && (
          <div className={styles.recSection}>
            <h2 className="sec-title" style={{ marginBottom: 20 }}>추천 상품</h2>
            <div className={styles.recGrid}>
              {recommended.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function WishlistPage() {
  const nav = useNavigate();
  const { ids } = require('../store').useWish();
  const wished = MOCK_PRODUCTS.filter(p => ids.has(p.id));

  return (
    <div className="page-wrap">
      <div className="breadcrumb">
        <span onClick={() => nav('/')}>홈</span><span className="sep">›</span><span>찜 목록</span>
      </div>
      <div style={{ padding: '32px' }}>
        <h2 className="sec-title" style={{ marginBottom: 24 }}>WISHLIST</h2>
        {wished.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--txt3)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤍</div>
            <p>찜한 상품이 없습니다.</p>
            <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => nav('/products')}>상품 보러가기</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {wished.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
