import http from 'k6/http';
import { sleep, check } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const BASE_URL = 'http://healthshop.geunuk.local';
const ITEM_KEYS = [1385, 3257, 3622, 3719, 3723, 3947, 3979, 4093, 4167, 4363];

export const options = {
  stages: [
    { duration: '20s', target: 10 },  // 워밍업
    { duration: '40s', target: 30 },  // 부하 증가
    { duration: '60s', target: 30 },  // HPA 동작 관찰
    { duration: '30s', target: 0  },  // 부하 감소
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  // 70% 확률로 목록, 30% 확률로 상세 조회
  if (Math.random() < 0.7) {
    const res = http.get(`${BASE_URL}/api/products`);
    check(res, { '목록 조회 200': (r) => r.status === 200 });
  } else {
    const id = randomItem(ITEM_KEYS);
    const res = http.get(`${BASE_URL}/api/products/${id}`);
    check(res, { '상세 조회 200': (r) => r.status === 200 });
  }
  sleep(1);
}
