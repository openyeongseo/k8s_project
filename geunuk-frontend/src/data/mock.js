/* ─────────────────────────────────────────────
   Mock Data  (실제 연동 시 api.js 함수로 교체)
───────────────────────────────────────────── */

export const MOCK_USER = {
  id: 1,
  name: '준혁',
  email: 'junhyuk@geunuk.kr',
  phone: '010-1234-5678',
  address: '서울시 강남구 테헤란로 123',
  point: 12450,
};

export const MOCK_PRODUCTS = [
  { id:1,  name:'프리미엄 육각 덤벨 세트',   brand:'GEUNUK',   price:89000, original:99000,  category:'덤벨/바벨',  badge:'SALE', icon:'🏋️', rating:4.8, reviews:24 },
  { id:2,  name:'케틀벨 16kg 주철',          brand:'IRONKING', price:45000, original:null,    category:'덤벨/바벨',  badge:null,   icon:'🔔', rating:4.6, reviews:11 },
  { id:3,  name:'요가매트 TPE 6mm',           brand:'FLEXMAT',  price:38000, original:48000,  category:'매트',       badge:'BEST', icon:'🟦', rating:4.9, reviews:58 },
  { id:4,  name:'바벨봉 + 원판 20kg 세트',    brand:'POWERBAR', price:185000,original:null,   category:'덤벨/바벨',  badge:null,   icon:'⚖️', rating:4.7, reviews:9  },
  { id:5,  name:'웨이트 트레이닝 장갑 M',     brand:'GRIPMAX',  price:25000, original:35000,  category:'헬스장갑',   badge:'SALE', icon:'🧤', rating:4.5, reviews:33 },
  { id:6,  name:'폼롤러 33cm 고밀도',         brand:'ROLLPRO',  price:18000, original:null,    category:'스트레칭',   badge:null,   icon:'🟠', rating:4.4, reviews:17 },
  { id:7,  name:'하체 강화 저항밴드 5종 세트', brand:'FLEXBAND', price:22000, original:28000,  category:'스트레칭',   badge:'NEW',  icon:'⭕', rating:4.6, reviews:22 },
  { id:8,  name:'플라이오 박스 60cm',          brand:'JUMPBOX',  price:95000, original:null,    category:'기타',       badge:null,   icon:'📦', rating:4.3, reviews:6  },
  { id:9,  name:'프로틴 쉐이커 700ml',        brand:'SHAKEPRO', price:12000, original:15000,  category:'보조제',     badge:'HOT',  icon:'🥤', rating:4.7, reviews:41 },
  { id:10, name:'인클라인 벤치 프레스',        brand:'BENCHKING',price:320000,original:380000, category:'런닝머신',   badge:'SALE', icon:'🛋️', rating:4.9, reviews:5  },
  { id:11, name:'스쿼트 랙 홈짐용',           brand:'RACKPRO',  price:450000,original:null,   category:'기타',       badge:'NEW',  icon:'🏗️', rating:4.8, reviews:3  },
  { id:12, name:'EZ바 컬 바 120cm',           brand:'CURLBAR',  price:55000, original:65000,  category:'덤벨/바벨',  badge:null,   icon:'〰️', rating:4.5, reviews:14 },
];

export const CATEGORIES = ['전체','덤벨/바벨','런닝머신','보조제','의류','스트레칭','헬스장갑','매트','기타'];

export const MOCK_REVIEWS = [
  { id:1, productId:1, userName:'김*수', rating:5, content:'정말 튼튼하고 그립감이 좋습니다. 배송도 빠르고 만족합니다!', createdAt:'2025.05.12' },
  { id:2, productId:1, userName:'이*진', rating:4, content:'품질은 좋은데 포장이 조금 아쉬웠어요. 상품 자체는 추천합니다.', createdAt:'2025.04.28' },
  { id:3, productId:1, userName:'박*호', rating:5, content:'홈트용으로 구매했는데 완전 만족! 무게감도 딱 좋고 마감도 깔끔해요.', createdAt:'2025.04.15' },
];

export const MOCK_ORDERS = [
  { id:1001, items:[{name:'프리미엄 덤벨 세트 5kg', qty:1}], totalPrice:89000, status:'COMPLETED', createdAt:'2025.05.10' },
  { id:1002, items:[{name:'요가매트 6mm', qty:1},{name:'케틀벨 16kg', qty:1}], totalPrice:83000, status:'SHIPPING', createdAt:'2025.05.18' },
  { id:1003, items:[{name:'웨이트 트레이닝 장갑', qty:1}], totalPrice:25000, status:'CANCELLED', createdAt:'2025.04.29' },
  { id:1004, items:[{name:'폼롤러 33cm', qty:2}], totalPrice:36000, status:'CONFIRMED', createdAt:'2025.05.25' },
];

export const MOCK_POINT_HISTORY = [
  { id:1, amount:100000, reason:'SIGN_UP',  desc:'신규 가입 포인트',   createdAt:'2025.01.01' },
  { id:2, amount:890,    reason:'PURCHASE', desc:'덤벨 세트 구매 적립', createdAt:'2025.05.10' },
  { id:3, amount:-5000,  reason:'USE',      desc:'포인트 사용',         createdAt:'2025.05.18' },
  { id:4, amount:380,    reason:'PURCHASE', desc:'요가매트 구매 적립',  createdAt:'2025.05.18' },
];

export const STATUS_LABEL = {
  PENDING:   '결제 대기',
  CONFIRMED: '결제 확인',
  SHIPPING:  '배송 중',
  COMPLETED: '배송 완료',
  CANCELLED: '취소됨',
};
