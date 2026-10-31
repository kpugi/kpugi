export const BASE_URL = __ENV.TARGET_URL || 'https://kpugi.com';
export const LOAD_TEST_SECRET = __ENV.LOAD_TEST_SECRET || 'kpugi_lt_sec_9f82d1e04b7a';

export const HEADERS = {
  'User-Agent': 'k6-load-tester/1.0 (Kpugi Performance Audit)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'x-load-test-token': LOAD_TEST_SECRET,
};

export const API_HEADERS = {
  'User-Agent': 'k6-load-tester/1.0 (Kpugi Performance Audit)',
  'Accept': 'application/json',
  'x-load-test-token': LOAD_TEST_SECRET,
};

export const THRESHOLDS = {
  http_req_failed: ['rate<0.02'], // Total error rate < 2%
  http_req_duration: ['p(95)<4000'], // Global 95% under 4s over international WAN
  'http_req_duration{name:api_campaigns}': ['p(95)<1500'], // Cached API threshold
  'http_req_duration{name:db_probe}': ['p(95)<3000'], // Direct Supabase DB probe
};


