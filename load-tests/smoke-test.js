import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5, // 5 users
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // less than 1% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';

export default function () {
  // 1. Browse Products
  let res = http.get(`${BASE_URL}/products?limit=10`);
  check(res, {
    'products status is 200': (r) => r.status === 200,
    'products body is not empty': (r) => r.body.length > 0,
  });

  // 2. Browse Categories
  res = http.get(`${BASE_URL}/categories`);
  check(res, {
    'categories status is 200': (r) => r.status === 200,
  });

  // 3. Health Check
  res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
