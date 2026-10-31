# Kpugi k6.io Production Load Testing Design Specification

**Date:** 2026-10-31  
**Target Environment:** Live Production (`https://kpugi.com`)  
**Tooling:** Grafana k6 (`k6.io`), `k6-reporter`  
**Max Concurrency:** 100 Virtual Users (VUs)  
**Total Run Duration:** 8 minutes (Warmup -> Ramp -> Peak Soak -> Cooldown)

---

## 1. Overview & Objectives

This design specification details the load testing strategy, scenario distribution, safety architecture, performance thresholds, and operational sequence for evaluating the performance and resilience of the Kpugi platform under realistic high-traffic conditions.

### Primary Objectives
1. **Assess Edge & SSR Latency:** Measure Time To First Byte (TTFB) and Next.js Server-Side Rendering response times under concurrent user loads up to 100 VUs.
2. **Stress Supabase Connection Pool:** Ensure that concurrent dynamic database queries (via `/api/health/database` and campaign catalogs) do not exhaust the Supabase connection pool or induce transaction queuing.
3. **Verify Redis Cache Throughput:** Validate that Upstash Redis caching properly shields the database on hot endpoints like `/api/campaigns`.
4. **Safeguard Live Production:** Guarantee zero data pollution, prevent 3rd-party bill shocks (Clerk / Paystack), and protect public visitors with a circuit-breaker mechanism.

---

## 2. Safety Architecture & Guardrails

Running load tests directly against a live production environment requires strict safeguards:

### 2.1 Upstash Rate-Limit Bypass Header
* **Constraint:** In `middleware.ts`, public API endpoints are restricted to 60 req/min per IP via Upstash Redis. At 100 VUs, a single k6 runner IP would be throttled with HTTP 429 within seconds.
* **Mechanism:** A secure bypass header `x-load-test-token: <LOAD_TEST_SECRET>` will be checked in `middleware.ts`:
  ```typescript
  const loadTestSecret = process.env.LOAD_TEST_SECRET;
  const isLoadTestAuthorized =
    Boolean(loadTestSecret) &&
    req.headers.get('x-load-test-token') === loadTestSecret;

  if (ratelimit && !isLoadTestAuthorized && req.nextUrl.pathname.startsWith('/api/') && !req.nextUrl.pathname.startsWith('/api/health')) {
    // Standard 60 req/min sliding-window IP rate limiter
  }
  ```
* **Security:** Public user requests remain strictly throttled; only authenticated test runs possessing the secret token bypass the rate limiter.

### 2.2 Account & Payment Isolation (No Live DB Pollution)
* **Pre-Seeded Test Accounts:** Instead of automating live user registration via Clerk (which triggers bot defense rate-limits and inflates Clerk MAU billing), pre-created test accounts with valid session cookies will be used for authenticated scenarios.
* **Read-Only / Safe Write Guarantee:** No random mutative writes, deposits, or withdrawals will be triggered against Paystack or live bank rails. Test requests exercise read endpoints, SSR renders, and non-destructive health probes.

### 2.3 Automated Circuit Breaker
* If HTTP error rates (`5xx` or `429`) exceed **5%** across any 10-second window, k6 will abort immediately to prevent degradation of service for real users.

---

## 3. Traffic Scenarios & User Flows

The test suite will execute three concurrent scenarios via k6's multi-scenario architecture:

```
Total Load Distribution:
├── Scenario 1: Public Discovery (70% - up to 70 VUs)
├── Scenario 2: Creator Experience (20% - up to 20 VUs)
└── Scenario 3: API & Database Health (10% - up to 10 VUs)
```

### Scenario 1: Public Discovery & Browsing (70% Traffic)
* **Persona:** Unregistered visitors browsing the landing page and campaigns.
* **Flow:**
  1. `GET /` — Marketing homepage (measures Next.js SSR + static asset delivery).
  2. Think time: `sleep(random(1, 3))`.
  3. `GET /browse` — Public campaign catalog directory.
  4. Think time: `sleep(random(2, 4))`.
  5. `GET /go` — Pre-lander redirect and tracking page.
* **Key Metrics:** TTFB, Edge CDN hit rate, SSR duration.

### Scenario 2: Creator Experience (20% Traffic)
* **Persona:** Authenticated creators checking campaign opportunities and their wallet.
* **Flow:**
  1. `GET /sign-in` — Auth portal page load.
  2. Think time: `sleep(random(1, 2))`.
  3. `GET /onboarding/role` — Creator role onboarding screen.
  4. Think time: `sleep(random(2, 3))`.
  5. `GET /c/browse` — Creator campaign catalog (with session cookies).
  6. `GET /wallet` — Creator wallet balance & earnings overview.
* **Key Metrics:** Server action latency, Supabase RLS query time under concurrency.

### Scenario 3: API Engine & Supabase Health (10% Traffic)
* **Persona:** High-frequency API polling, mobile background sync, and system probes.
* **Flow:**
  1. `GET /api/campaigns` — Evaluates Redis cache hits vs database queries.
  2. `GET /api/health/database` — Direct, un-cached Supabase database query probe (`head: true`) testing active connection pool latency.
  3. `GET /api/health/payments` — Payment gateway health probe.
* **Headers:** Transmits `x-load-test-token: <LOAD_TEST_SECRET>`.
* **Key Metrics:** p95 and p99 response times, connection pool queuing delay.

---

## 4. Performance Thresholds (Pass/Fail SLAs)

| Metric | Target / SLA | Rationale |
| :--- | :--- | :--- |
| **Global Error Rate (`http_req_failed`)** | **< 1.0%** | Zero tolerance for server crashes or 5xx unhandled exceptions. |
| **Global p95 Latency** | **< 800ms** | 95% of all requests must complete within 800ms across all scenarios. |
| **Public SSR Pages (`/`, `/browse`)** | **p95 < 1,200ms** | Covers Next.js server-side rendering and edge network transit. |
| **Cached API (`/api/campaigns`)** | **p95 < 400ms** | Validates Redis cache delivery speed. |
| **Database Probe (`/api/health/database`)** | **p99 < 500ms** | Proves Supabase connection pool is not bottlenecked under peak load. |

---

## 5. Load Curve & Execution Stages

The primary load test runs for **8 minutes** across 4 stages:

```
VUs
100 |                 ┌───────────────┐
    |                /                 \
 50 |               /                   \
    |   ┌──────────/                     \
 10 |───┘                                 \
  0 └───┴──────────┴───────────────┴───────┴──
       0m   1m            4m              7m   8m
     Warmup    Ramp-Up       Peak Soak     Cooldown
```

1. **Stage 1 (0:00 - 1:00): Warm-up (10 VUs)** — Pre-warms Vercel serverless instances and Edge caches; confirms bypass header works.
2. **Stage 2 (1:00 - 4:00): Ramp-Up (10 -> 100 VUs)** — Linearly scales concurrency to observe system elasticity and response time curve.
3. **Stage 3 (4:00 - 7:00): Peak Soak (100 VUs Sustained)** — Stresses database connection pools, memory, and cache hit consistency.
4. **Stage 4 (7:00 - 8:00): Cool-down (100 -> 0 VUs)** — Validates graceful connection closure and system recovery.

---

## 6. Directory Structure & Implementation Layout

```text
k6/
├── main.js                  # Master test orchestrator (stages, thresholds, HTML report)
├── config.js                # Base URL, credentials, token headers, thresholds
├── scenarios/
│   ├── public.js            # Scenario 1: Public browsing
│   ├── creator.js           # Scenario 2: Creator authenticated flow
│   └── api.js               # Scenario 3: API & database health probes
└── reports/                 # Output destination for k6-load-test-report.html
```

---

## 7. Operational Run Sequence Tonight

1. **Tooling Verification:** Confirm/install `k6` via Windows `winget install Grafana.k6`.
2. **Middleware Safeguard:** Deploy `x-load-test-token` bypass in `middleware.ts`.
3. **Smoke Test (Phase 1):** Run 30s smoke pass with 5 VUs to verify HTTP 200 responses and header bypass.
4. **Load Test (Phase 2):** Execute the 8-minute 100-VU test.
5. **Report & Review (Phase 3):** Open `reports/k6-load-test-report.html` and review Supabase & Upstash performance graphs.

