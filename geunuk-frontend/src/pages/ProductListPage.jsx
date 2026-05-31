import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CATEGORY_MAP, PARENT_CATEGORIES, MOCK_PRODUCTS } from '../data/mock';
import ProductCard from '../components/common/ProductCard';
import styles from './ProductListPage.module.css';

const SORTS = ['인기순', '신상품순', '낮은가격순', '높은가격순', '리뷰순'];

export default function ProductListPage() {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('keyword') || '');
  const category = params.get('category') || '전체';
  useEffect(() => { setKeyword(params.get('keyword') || ''); }, [params]);
  const sort = params.get('sort') || '인기순';

  const isParent = cat => PARENT_CATEGORIES.includes(cat);
  const activeParent = category === '전체' ? null : isParent(category) ? category : PARENT_CATEGORIES.find(p => CATEGORY_MAP[p].includes(category)) || null;
  const subCategories = activeParent ? CATEGORY_MAP[activeParent] : [];
  const headingText = category === '전체' ? '전체 상품' : !isParent(category) && activeParent ? `${activeParent} › ${category}` : category;

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    value && value !== '전체' ? next.set(key, value) : next.delete(key);
    setParams(next);
  };
  const search = e => { e.preventDefault(); setFilter('keyword', keyword.trim()); };
  const filtered = useMemo(() => {
    let products = [...MOCK_PRODUCTS];
    const query = (params.get('keyword') || '').trim().toLowerCase();
    if (category !== '전체') {
      if (isParent(category)) products = products.filter(p => CATEGORY_MAP[category].includes(p.category));
      else products = products.filter(p => p.category === category);
    }
    if (query) products = products.filter(product => `${product.name} ${product.brand} ${(product.tags || []).join(' ')}`.toLowerCase().includes(query));
    if (sort === '낮은가격순') products.sort((a, b) => a.price - b.price);
    if (sort === '높은가격순') products.sort((a, b) => b.price - a.price);
    if (sort === '리뷰순') products.sort((a, b) => b.reviews - a.reviews);
    if (sort === '신상품순') products.sort((a, b) => (b.badge === 'NEW') - (a.badge === 'NEW'));
    if (sort === '인기순') products.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews);
    return products;
  }, [params, category, sort]);

  return (
    <div className="page-wrap">
      <div className="breadcrumb"><span onClick={() => nav('/')}>홈</span><span className="sep">›</span><span>상품 목록</span></div>
      <header className={styles.heading}><p>SHOP</p><h1>{headingText}</h1></header>
      <form className={styles.search} onSubmit={search}>
        <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="상품명, 브랜드, 운동 키워드를 검색하세요" />
        <button type="submit">검색</button>
      </form>
      <section className={styles.filters}>
        <div className={styles.filterTop}>
          <div className={styles.categories}>
            <button className={category === '전체' ? styles.selected : ''} onClick={() => setFilter('category', '전체')}>전체</button>
            {PARENT_CATEGORIES.map(item => <button key={item} className={activeParent === item ? styles.selected : ''} onClick={() => setFilter('category', item)}>{item}</button>)}
          </div>
          <select value={sort} onChange={e => setFilter('sort', e.target.value)} aria-label="정렬 기준">
            {SORTS.map(item => <option key={item}>{item}</option>)}
          </select>
        </div>
        {subCategories.length > 0 && (
          <div className={styles.subcategories}>
            {subCategories.map(item => <button key={item} className={category === item ? styles.subSelected : ''} onClick={() => setFilter('category', item)}>{item}</button>)}
          </div>
        )}
      </section>
      <div className={styles.resultHeader}><strong>Total {filtered.length}</strong><span>{params.get('keyword') && `“${params.get('keyword')}” 검색 결과`}</span></div>
      {filtered.length ? <section className={styles.grid}>{filtered.map(product => <ProductCard key={product.id} product={product} />)}</section> : <div className={styles.empty}><h2>검색 결과가 없습니다.</h2><p>다른 키워드 또는 카테고리를 선택해주세요.</p></div>}
    </div>
  );
}
