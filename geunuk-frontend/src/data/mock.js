/* 근육캐치 프론트엔드 데모 데이터
   실제 백엔드 연동 시 이 파일의 배열을 API 응답으로 교체하세요. */

export const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="760" viewBox="0 0 640 760">
    <defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f7f7f4"/><stop offset="1" stop-color="#e7e7e2"/></linearGradient></defs>
    <rect width="640" height="760" fill="url(#bg)"/>
    <text x="320" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#171816">MUSCLE</text>
    <text x="320" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#b5d800">CATCH</text>
  </svg>`);

export const MOCK_USER = {
  id: 1,
  name: 'TEAM1',
  email: 'jina@musclecatch.kr',
  phone: '010-1234-5678',
  address: '서울특별시 강남구 테헤란로 123',
  point: 100000,
  role: 'USER',
};

const IMG = {
  rack: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80',
  cable: 'https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?auto=format&fit=crop&w=900&q=80',
  gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
  bike: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
  dumbbell: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80',
  training: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
  stretch: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
  apparel: 'https://images.unsplash.com/photo-1517838277536-f5f99be5010c?auto=format&fit=crop&w=900&q=80',
};

export const MOCK_PRODUCTS = [
  { id: 1, name: '올인원 스미스 머신 MC-75', brand: 'MUSCLE CATCH', price: 4990000, original: 5290000, category: '스미스머신', badge: 'BEST', image: IMG.rack, rating: 4.9, reviews: 38, tags: ['홈짐', '근력'] },
  { id: 2, name: '프로 멀티 케이블 스테이션 X6', brand: 'BODY LAB', price: 4290000, original: null, category: '스미스머신', badge: 'NEW', image: IMG.cable, rating: 4.8, reviews: 19, tags: ['클럽용', '웨이트'] },
  { id: 3, name: '컴팩트 하프랙 홈짐 세트', brand: 'MUSCLE CATCH', price: 3590000, original: 3890000, category: '스미스머신', badge: 'SALE', image: IMG.gym, rating: 4.7, reviews: 22, tags: ['홈짐', '랙'] },
  { id: 4, name: 'EMS 스마트 바이크 U80', brand: 'MOVEMENT', price: 269000, original: 329000, category: '유산소', badge: 'SALE', image: IMG.bike, rating: 4.8, reviews: 74, tags: ['사이클', '다이어트'] },
  { id: 5, name: '무게조절 덤벨 24kg 2개 세트', brand: 'IRON CATCH', price: 389000, original: 449000, category: '덤벨/원판', badge: 'BEST', image: IMG.dumbbell, rating: 4.9, reviews: 106, tags: ['덤벨', '홈트'] },
  { id: 6, name: '프로 인클라인 벤치 B-90', brand: 'MUSCLE CATCH', price: 219000, original: null, category: '벤치', badge: 'NEW', image: IMG.training, rating: 4.7, reviews: 31, tags: ['벤치', '근력'] },
  { id: 7, name: '올림픽 바벨봉 20kg', brand: 'IRON CATCH', price: 139000, original: 159000, category: '덤벨/원판', badge: null, image: IMG.dumbbell, rating: 4.6, reviews: 28, tags: ['바벨', '웨이트'] },
  { id: 8, name: '폼롤러 리커버리 세트', brand: 'RECOVER FIT', price: 39000, original: 49000, category: '리커버리', badge: 'HOT', image: IMG.stretch, rating: 4.7, reviews: 65, tags: ['스트레칭', '회복'] },
  { id: 9, name: '파워 리프팅 글러브', brand: 'GRIP LAB', price: 32000, original: null, category: '액세서리', badge: null, image: IMG.apparel, rating: 4.5, reviews: 44, tags: ['장갑', '그립'] },
  { id: 10, name: '튜빙밴드 트레이닝 키트', brand: 'MOVE ON', price: 29000, original: 39000, category: '홈트레이닝', badge: 'NEW', image: IMG.training, rating: 4.8, reviews: 58, tags: ['밴드', '홈트'] },
  { id: 11, name: '워킹패드 저소음 런닝머신', brand: 'CARDIO FIT', price: 459000, original: 520000, category: '유산소', badge: 'BEST', image: IMG.gym, rating: 4.7, reviews: 26, tags: ['런닝', '다이어트'] },
  { id: 12, name: '컴프레션 트레이닝 셋업', brand: 'MUSCLE WEAR', price: 79000, original: 99000, category: '액세서리', badge: 'SALE', image: IMG.apparel, rating: 4.6, reviews: 16, tags: ['의류', '트레이닝'] },
];

export const CATEGORIES = ['전체', '스미스머신', '벤치', '덤벨/원판', '유산소', '홈트레이닝', '리커버리', '액세서리'];

export const MOCK_REVIEWS = [
  { id: 1, productId: 1, userName: '김*수', rating: 5, content: '프레임이 단단하고 동작이 부드러워 홈짐 완성도가 높아졌습니다.', createdAt: '2026.05.12' },
  { id: 2, productId: 1, userName: '이*진', rating: 4, content: '조립 안내가 깔끔했고 배송 설치도 친절했습니다.', createdAt: '2026.04.28' },
  { id: 3, productId: 5, userName: '박*호', rating: 5, content: '공간을 많이 차지하지 않아서 홈트용으로 아주 좋아요.', createdAt: '2026.05.20' },
];

export const MOCK_ORDERS = [
  { id: 1001, items: [{ productId: 5, name: '무게조절 덤벨 24kg 2개 세트', qty: 1, image: IMG.dumbbell, price: 389000 }], totalPrice: 389000, status: 'COMPLETED', createdAt: '2026.05.10' },
  { id: 1002, items: [{ productId: 8, name: '폼롤러 리커버리 세트', qty: 1, image: IMG.stretch, price: 39000 }, { productId: 9, name: '파워 리프팅 글러브', qty: 1, image: IMG.apparel, price: 32000 }], totalPrice: 71000, status: 'SHIPPING', createdAt: '2026.05.18' },
  { id: 1003, items: [{ productId: 4, name: 'EMS 스마트 바이크 U80', qty: 1, image: IMG.bike, price: 269000 }], totalPrice: 269000, status: 'CONFIRMED', createdAt: '2026.05.25' },
];

export const MOCK_POINT_HISTORY = [
  { id: 1, amount: 100000, reason: 'SIGN_UP', desc: '신규 가입 포인트', createdAt: '2026.05.01' },
  { id: 2, amount: 3890, reason: 'PURCHASE', desc: '덤벨 세트 구매 적립', createdAt: '2026.05.10' },
  { id: 3, amount: -10000, reason: 'USE', desc: '주문 결제 포인트 사용', createdAt: '2026.05.18' },
];

export const STATUS_LABEL = {
  PENDING: '결제 대기', CONFIRMED: '결제 확인', SHIPPING: '배송 중', COMPLETED: '배송 완료', CANCELLED: '취소됨',
};
