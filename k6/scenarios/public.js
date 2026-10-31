import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, HEADERS } from '../config.js';

export default function publicVisitorScenario() {
  // 1. Visit landing page
  const homeRes = http.get(`${BASE_URL}/`, {
    headers: HEADERS,
    tags: { name: 'page_home' },
  });

  check(homeRes, {
    'home status is 200': (r) => r.status === 200,
    'home has html body': (r) => r.body && r.body.length > 500,
  });

  // User reading hero section (1 - 3s)
  sleep(Math.random() * 2 + 1);

  // 2. Visit /browse campaign directory
  const browseRes = http.get(`${BASE_URL}/browse`, {
    headers: HEADERS,
    tags: { name: 'page_browse' },
  });

  check(browseRes, {
    'browse status is 200/304': (r) => r.status === 200 || r.status === 304,
  });

  // User exploring listings (2 - 4s)
  sleep(Math.random() * 2 + 2);

  // 3. Visit /go redirector / pre-lander
  const goRes = http.get(`${BASE_URL}/go`, {
    headers: HEADERS,
    tags: { name: 'page_go' },
  });

  check(goRes, {
    'go status is 200/302/307': (r) => r.status === 200 || r.status === 302 || r.status === 307,
  });

  sleep(Math.random() * 1.5 + 0.5);
}

