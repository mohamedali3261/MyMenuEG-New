import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 }, // ramp up to 20 users
    { duration: '3m', target: 20 }, // stay at 20 users
    { duration: '1m', target: 0 },  // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/products?limit=20`],
    ['GET', `${BASE_URL}/categories`],
    ['GET', `${BASE_URL}/settings`],
  ]);

  check(responses[0], { 'products 200': (r) => r.status === 200 });
  check(responses[1], { 'categories 200': (r) => r.status === 200 });
  
  sleep(1);
}
