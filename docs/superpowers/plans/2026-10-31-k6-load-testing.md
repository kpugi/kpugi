# k6.io Production Load Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement, verify, and execute a multi-scenario k6 load testing suite against `https://kpugi.com` (up to 100 concurrent VUs) with rate-limit bypass safeguards and automated HTML reporting.

**Architecture:** A modular k6 test suite running three concurrent scenarios (Public 70%, Creator 20%, API 10%) across an 8-minute staged load curve. Middleware is updated to permit a cryptographically random `x-load-test-token` to bypass Upstash Redis IP rate limiting without disrupting live public visitors.

**Tech Stack:** Grafana k6, JavaScript (ES6 k6 runtime), Next.js 15, Upstash Redis, Supabase, `k6-reporter`.

---

## File Structure

```text
k6/
├── config.js                 # Target URL, credentials, bypass token, and thresholds
├── main.js                   # Master orchestrator combining scenarios and HTML reporting
├── scenarios/
│   ├── public.js             # Scenario 1: Public browsing (/, /browse, /go)
│   ├── creator.js            # Scenario 2: Authenticated creator (/c/browse, /wallet, etc.)
│   └── api.js                # Scenario 3: API & DB health probes (/api/campaigns, /api/health/*)
└── reports/                  # Destination for k6-load-test-report.html
middleware.ts                 # Add x-load-test-token bypass for LOAD_TEST_SECRET
```

---

### Task 1: Install and Verify k6 CLI on Host

**Files:**
- N/A (System package installation)

- [ ] **Step 1: Check or install k6 via winget**
  Run: `winget install Grafana.k6 --accept-source-agreements --accept-package-agreements`
  Expected: Installation successful or package already installed.

- [ ] **Step 2: Verify k6 CLI execution and version**
  Run: `k6 version`
  Expected: Output showing k6 version (e.g. `k6 v0.50+` or similar).

---

### Task 2: Implement Rate-Limit Bypass in `middleware.ts`

**Files:**
- Modify: `middleware.ts:96-112`
- Modify: `.env.local` (add `LOAD_TEST_SECRET`)

- [ ] **Step 1: Add LOAD_TEST_SECRET to `.env.local`**
  Add a secure token (e.g. `LOAD_TEST_SECRET=kpugi_lt_sec_9f82d1e04b7a`) to `.env.local`.

- [ ] **Step 2: Update `middleware.ts` rate-limiting block**
  Update the Upstash rate limit check so requests carrying `x-load-test-token: <LOAD_TEST_SECRET>` bypass the 60 req/min limit:
  ```typescript
  const loadTestSecret = process.env.LOAD_TEST_SECRET;
  const isLoadTestAuthorized =
    Boolean(loadTestSecret) &&
    req.headers.get('x-load-test-token') === loadTestSecret;

  if (ratelimit && !isLoadTestAuthorized && req.nextUrl.pathname.startsWith('/api/') && !req.nextUrl.pathname.startsWith('/api/health')) {
    // Upstash rate limiting logic
  }
  ```

- [ ] **Step 3: Run TypeScript compiler check**
  Run: `npx tsc --noEmit`
  Expected: Clean compilation without errors.

- [ ] **Step 4: Commit middleware update**
  ```bash
  git add middleware.ts .env.example
  git commit -m "feat(middleware): add secure bypass token for k6 load testing"
  ```

---

### Task 3: Build k6 Configuration & Utilities

**Files:**
- Create: `k6/config.js`

- [ ] **Step 1: Create `k6/config.js`**
  Define baseline target URL (`https://kpugi.com`), default bypass headers, and SLA thresholds:
  ```javascript
  export const BASE_URL = __ENV.TARGET_URL || 'https://kpugi.com';
  export const LOAD_TEST_SECRET = __ENV.LOAD_TEST_SECRET || 'kpugi_lt_sec_9f82d1e04b7a';

  export const HEADERS = {
    'User-Agent': 'k6-load-tester/1.0 (Kpugi Performance Audit)',
    'x-load-test-token': LOAD_TEST_SECRET,
  };

  export const THRESHOLDS = {
    http_req_failed: ['rate<0.01'], // Global error rate < 1%
    http_req_duration: ['p(95)<800'], // Global 95% under 800ms
    'http_req_duration{scenario:public_visitors}': ['p(95)<1200'], // SSR page threshold
    'http_req_duration{scenario:api_probes}': ['p(95)<400'], // Cached API threshold
    'http_req_duration{name:db_probe}': ['p(99)<500'], // Direct DB probe threshold
  };
  ```

- [ ] **Step 2: Verify configuration syntax**
  Run: `node -e "import('./k6/config.js').then(c => console.log('Config OK', c.BASE_URL))"`
  Expected: `Config OK https://kpugi.com`.

---

### Task 4: Build Scenario Modules

**Files:**
- Create: `k6/scenarios/public.js`
- Create: `k6/scenarios/creator.js`
- Create: `k6/scenarios/api.js`

- [ ] **Step 1: Create `k6/scenarios/public.js`**
  Implements the 70% public visitor journey:
  - Hits `GET /`
  - Pauses 1-3s (think time)
  - Hits `GET /browse`
  - Pauses 2-4s
  - Hits `GET /go` with prelander check
  - Checks HTTP 200/304 response codes.

- [ ] **Step 2: Create `k6/scenarios/creator.js`**
  Implements the 20% creator journey:
  - Hits `GET /sign-in`
  - Pauses 1-2s
  - Hits `GET /onboarding/role`
  - Hits `GET /c/browse` (with test session cookie header if available, or verifies redirect/auth protection response time)
  - Hits `GET /wallet`

- [ ] **Step 3: Create `k6/scenarios/api.js`**
  Implements the 10% core API & database health probes:
  - Hits `GET /api/campaigns` (tests Redis cache hit & response body)
  - Hits `GET /api/health/database` (measures Supabase direct connection latency with custom tag `{ name: 'db_probe' }`)
  - Hits `GET /api/health/payments` (checks payment health route)
  - Passes `x-load-test-token` header.

- [ ] **Step 4: Commit scenario modules**
  ```bash
  git add k6/
  git commit -m "feat(k6): create public, creator, and api scenario modules"
  ```

---

### Task 5: Build Master Orchestrator and Run Smoke Test

**Files:**
- Create: `k6/main.js`

- [ ] **Step 1: Create `k6/main.js` with staged ramp-up and HTML reporting**
  Configure k6 options:
  - Stages:
    - 0m - 1m: 10 VUs (Warmup)
    - 1m - 4m: 10 -> 100 VUs (Ramp-up)
    - 4m - 7m: 100 VUs (Peak Soak)
    - 7m - 8m: 100 -> 0 VUs (Cooldown)
  - Scenarios:
    - `public_visitors`: 70% traffic execution
    - `creator_journey`: 20% traffic execution
    - `api_probes`: 10% traffic execution
  - Embed `handleSummary(data)` using `htmlReport` bundle to output `k6/reports/k6-load-test-report.html`.

- [ ] **Step 2: Execute Phase 1 Smoke Test (5 VUs, 30s)**
  Run: `k6 run --vus 5 --duration 30s k6/main.js`
  Expected:
  - 100% pass on status checks (200/304).
  - 0% HTTP 429 rate limit errors.
  - HTML report created at `k6/reports/k6-load-test-report.html`.

- [ ] **Step 3: Commit master test orchestrator**
  ```bash
  git add k6/main.js
  git commit -m "feat(k6): create master orchestrator and verify smoke test"
  ```

---

### Task 6: Execute Full 8-Minute Load Test & Performance Analysis

**Files:**
- Output: `k6/reports/k6-load-test-report.html`

- [ ] **Step 1: Execute Full Staged Load Test (8 minutes, 100 VUs peak)**
  Run: `k6 run k6/main.js`
  Observe:
  - CLI throughput gauges (req/s, active VUs).
  - Real-time p95 / p99 latencies.
  - Circuit breaker validation (< 1% error rate).

- [ ] **Step 2: Review and Summarize Performance Findings**
  - Verify if all SLAs were met (Error rate < 1%, p95 < 800ms, DB probe p99 < 500ms).
  - Open `k6/reports/k6-load-test-report.html` in browser for visual audit.
  - Check Supabase Dashboard connection pool status during peak 100 VUs.
  - Document findings and recommendations in `k6/reports/load-test-results.md`.

