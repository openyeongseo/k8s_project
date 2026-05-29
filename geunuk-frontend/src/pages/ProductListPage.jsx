import React, { useState, useMemo } from 'react';
import { MOCK_PRODUCTS, CATEGORIES } from '../data/mock';
import ProductCard from '../components/common/ProductCard';
import styles from './ProductListPage.module.css';

const SORTS = ['최신순', '인기순', '낮은가격순', '높은가격순'];

export default function ProductListPage() {
  const [cat, setCat]       = useState('전체');
  const [sort, setSort]     = useState('최신순');
  const [keyword, setKw]    = useState('');

  const filtered = useMemo(() => {
    let list = [...MOCK_PRODUCTS];
    if (cat !== '전체') list = list.filter(p => p.category === cat);
    if (keyword) list = list.filter(p => p.name.includes(keyword) || p.brand.includes(keyword));
    if (sort === '낮은가격순') list.sort((a, b) => a.price - b.price);
    if (sort === '높은가격순') list.sort((a, b) => b.price - a.price);
    if (sort === '인기순')    list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [cat, sort, keyword]);

  return (
    <div className="page-wrap">
      <div className="breadcrumb">
        <span>홈</span><span className="sep">›</span><span>상품 목록</span>
      </div>

      {/* 검색 바 */}
      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          placeholder="상품명, 브랜드 검색..."
          value={keyword}
          onChange={e => setKw(e.target.value)}
        />
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      {/* 카테고리 */}
      <div className={styles.catStrip}>
        {CATEGORIES.map(c => (
          <button key={c} className={`${styles.chip} ${cat === c ? styles.active : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {/* 헤더 */}
      <div className={styles.listHeader}>
        <span className={styles.count}>총 <b>{filtered.length}</b>개 상품</span>
        <div className={styles.sortRow}>
          {SORTS.map(s => (
            <button key={s} className={`${styles.sortBtn} ${sort === s ? styles.sortActive : ''}`} onClick={() => setSort(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* 그리드 */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>검색 결과가 없습니다.</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
