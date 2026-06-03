import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CATEGORY_MAP, PARENT_CATEGORIES } from '../data/mock';
import ProductCard from '../components/common/ProductCard';
import styles from './ProductListPage.module.css';

const SORTS = ['인기순', '신상품순', '낮은가격순', '높은가격순', '리뷰순'];
const API = '/api/products';

export default function ProductListPage() {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('keyword') || '');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  const category = params.get('category') || '전체';
  const sort = params.get('sort') || '인기순';

  const isParent = cat => PARENT_CATEGORIES.includes(cat);
  const activeParent = category === '전체' ? null : isParent(category) ? category : PARENT_CATEGORIES.find(p => CATEGORY_MAP[p].includes(category)) || null;
  const subCategories = activeParent ? CATEGORY_MAP[activeParent] : [];
  const headingText = category === '전체' ? '전체 상품' : !isParent(category) && activeParent ? `${activeParent} › ${category}` : category;

  useEffect(() => { setKeyword(params.get('keyword') || ''); }, [params]);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();

    // 대분류 선택 시 소분류 전체 OR 쿼리 → 일단 category 파라미터 없이 전체 받아서 프론트 필터
    if (category !== '전체' && !isParent(category)) query.set('category', category);
    if (params.get('keyword')) query.set('keyword', params.get('keyword'));
    query.set('page', '0');
    query.set('size', '100');

    fetch(`${API}?${query.toString()}`)
      .then(r => r.json())
      .then(data => {
        let list = (data.data?.products || []).map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: Number(p.price),
          originalPrice: Number(p.originalPrice),
          category: p.category,
          image: p.imageUrl,
          status: p.status,
          createdAt: p.createdAt,
        }));

        // 대분류 필터 (프론트에서 처리)
        if (category !== '전체' && isParent(category)) {
          list = list.filter(p => CATEGORY_MAP[category].includes(p.category));
        }

        // 정렬
        if (sort === '낮은가격순') list.sort((a, b) => a.price - b.price);
        if (sort === '높은가격순') list.sort((a, b) => b.price - a.price);
        if (sort === '신상품순') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setProducts(list);
        setTotalElements(list.length);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [params, category, sort]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    value && value !== '전체' ? next.set(key, value) : next.delete(key);
    setParams(next);
  };

  const search = e => { e.preventDefault(); setFilter('keyword', keyword.trim()); };

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
            {PARENT_CATEGORIES.map(item => (
              <button key={item} className={activeParent === item ? styles.selected : ''} onClick={() => setFilter('category', item)}>{item}</button>
            ))}
          </div>
          <select value={sort} onChange={e => setFilter('sort', e.target.value)} aria-label="정렬 기준">
            {SORTS.map(item => <option key={item}>{item}</option>)}
          </select>
        </div>
        {subCategories.length > 0 && (
          <div className={styles.subcategories}>
            {subCategories.map(item => (
              <button key={item} className={category === item ? styles.subSelected : ''} onClick={() => setFilter('category', item)}>{item}</button>
            ))}
          </div>
        )}
      </section>
      <div className={styles.resultHeader}>
        <strong>Total {totalElements}</strong>
        <span>{params.get('keyword') && `"${params.get('keyword')}" 검색 결과`}</span>
      </div>
      {loading ? (
        <div className={styles.empty}>불러오는 중...</div>
      ) : products.length ? (
        <section className={styles.grid}>{products.map(product => <ProductCard key={product.id} product={product} />)}</section>
      ) : (
        <div className={styles.empty}><h2>검색 결과가 없습니다.</h2><p>다른 키워드 또는 카테고리를 선택해주세요.</p></div>
      )}
    </div>
  );
}