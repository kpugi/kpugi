import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, HEADERS } from '../config.js';

export default function creatorScenario() {
  // 1. Visit sign-in gateway
  const signInRes = http.get(`${BASE_URL}/sign-in`, {
    headers: HEADERS,
    tags: { name: 'page_signin' },
  });

  check(signInRes, {
    'sign-in status is 200/302/307': (r) => r.status === 200 || r.status === 302 || r.status === 307,
  });

  // Brief pause
  sleep(Math.random() * 1.5 + 1);

  // 2. Creator checks role selection / onboarding
  const onboardingRes = http.get(`${BASE_URL}/onboarding/role`, {
    headers: HEADERS,
    tags: { name: 'page_onboarding_role' },
  });

  check(onboardingRes, {
    'onboarding status is 200/302/307': (r) => r.status === 200 || r.status === 302 || r.status === 307,
  });

  sleep(Math.random() * 2 + 1);

  // 3. Creator visits campaign catalog
  const creatorBrowseRes = http.get(`${BASE_URL}/c/browse`, {
    headers: HEADERS,
    tags: { name: 'page_creator_browse' },
  });

  check(creatorBrowseRes, {
    'creator browse responds (200/302/307/401)': (r) => [200, 302, 307, 401].includes(r.status),
  });

  sleep(Math.random() * 1.5 + 1);

  // 4. Creator checks wallet view
  const walletRes = http.get(`${BASE_URL}/wallet`, {
    headers: HEADERS,
    tags: { name: 'page_wallet' },
  });

  check(walletRes, {
    'wallet responds (200/302/307/401)': (r) => [200, 302, 307, 401].includes(r.status),
  });

  sleep(Math.random() * 1.5 + 0.5);
}

