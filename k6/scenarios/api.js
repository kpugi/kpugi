import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, API_HEADERS } from '../config.js';

export default function apiScenario() {
  // 1. Fetch campaigns (tests Redis cache + database read fallback)
  const campaignsRes = http.get(`${BASE_URL}/api/campaigns`, {
    headers: API_HEADERS,
    tags: { name: 'api_campaigns' },
  });

  check(campaignsRes, {
    'campaigns status is 200': (r) => r.status === 200,
    'campaigns is not rate-limited (not 429)': (r) => r.status !== 429,
  });

  sleep(Math.random() * 0.8 + 0.2);

  // 2. Direct database connection probe (un-cached Supabase query)
  const dbHealthRes = http.get(`${BASE_URL}/api/health/database`, {
    headers: API_HEADERS,
    tags: { name: 'db_probe' },
  });

  check(dbHealthRes, {
    'database health is 200': (r) => r.status === 200,
    'database operational': (r) => {
      try {
        const json = JSON.parse(r.body);
        return json.status === 'operational';
      } catch (e) {
        return false;
      }
    },
  });

  sleep(Math.random() * 0.5 + 0.2);

  // 3. Payment gateway connectivity probe
  const payHealthRes = http.get(`${BASE_URL}/api/health/payments`, {
    headers: API_HEADERS,
    tags: { name: 'api_payments_health' },
  });

  check(payHealthRes, {
    'payments health is 200': (r) => r.status === 200,
  });

  sleep(Math.random() * 1.0 + 0.5);
}

