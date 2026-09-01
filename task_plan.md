# Task Plan: Kpugi Security Hardening & Vulnerability Fixes

## Goal
Systematically remediate all identified security vulnerabilities across the Kpugi codebase, validating each chunk with automated typechecks and functional integrity tests before proceeding to the next.

---

## Phases & Tasks

### [x] Phase 1: Webhook Cryptographic Verification
- [x] **Task 1.1**: Secure Paystack Webhook (`app/api/webhooks/paystack/route.ts`) with HMAC-SHA512 `x-paystack-signature` validation.
- [x] **Task 1.2**: Secure Clerk Webhook (`app/api/webhooks/clerk/route.ts`) with Svix signature validation headers (`svix-id`, `svix-timestamp`, `svix-signature`).
- [x] **Task 1.3**: Secure Didit KYC Webhook (`app/api/kyc/didit/webhook/route.ts`) with signature / secret validation.
- [x] **Task 1.4**: *Validation*: Run TypeScript compiler (`npx tsc --noEmit`) to verify zero type errors on all webhook routes (Passed).

### [x] Phase 2: Database Row Level Security (RLS) Migration
- [x] **Task 2.1**: Write migration script `supabase/migrations/20260901_enable_rls_security.sql`.
- [x] **Task 2.2**: Add `ENABLE ROW LEVEL SECURITY` and explicit `CREATE POLICY` statements for all 12 core tables:
  - `profiles`, `advertiser_profiles`, `creator_profiles`, `social_accounts`, `campaigns`, `campaign_creatives`, `submissions`, `verification_checks`, `wallets`, `wallet_transactions`, `paystack_events`, `notifications`.
- [x] **Task 2.3**: *Validation*: Validate SQL syntax and confirm server-side `createAdminClient` functions are unaffected (Passed).

### [x] Phase 3: Cron Jobs & Financial Settlement Route Protection
- [x] **Task 3.1**: Secure `/api/cron/release-payouts/route.ts` with mandatory `CRON_SECRET` Bearer token check.
- [x] **Task 3.2**: Secure `/api/cron/verify-submissions/route.ts` with mandatory `CRON_SECRET` Bearer token check.
- [x] **Task 3.3**: Secure `/api/cron/daily-settlement/route.ts` by removing insecure fallback and requiring `CRON_SECRET`.
- [x] **Task 3.4**: *Validation*: Run typecheck and verify unauthenticated requests are rejected (Passed).

### [x] Phase 4: Campaign Creation Hardening & Deprecated OAuth Cleanup
- [x] **Task 4.1**: Secure `POST /api/campaigns` in `app/api/campaigns/route.ts` with `getOrCreateUserProfile()`, role check (`advertiser`), and explicit field mapping.
- [x] **Task 4.2**: Remove deprecated legacy OAuth callback folders in `app/api/auth/oauth/` (since manual bio code scraping via `/api/verify/social/*` is used).
- [x] **Task 4.3**: *Validation*: Run TypeScript compilation and check for broken imports (Passed).

### [x] Phase 5: Open Redirect, Chat XSS & Security Headers
- [x] **Task 5.1**: Harden `/go` prelander in `app/go/page.tsx` against unvalidated open redirects and `javascript:` URIs.
- [x] **Task 5.2**: Harden AI Chat Markdown in `components/support/KpugiBotChat.tsx` against stored XSS / unescaped HTML.
- [x] **Task 5.3**: Add standard HTTP security headers in `next.config.js` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- [x] **Task 5.4**: *Validation*: Run full project TypeScript verification and verify local dev build integrity (Passed).

---

## Decisions Log
- **Social Account Verification**: Kept manual bio code-scraping mechanism (`/api/verify/social/*`); cleaned up obsolete OAuth endpoints.
- **Supabase Service Role**: Maintained `createAdminClient()` for backend workers so RLS policies protect against anon client querying without breaking server cron workers.

---

## Errors & Issues Log
| Issue | Attempt | Resolution |
|-------|---------|------------|
| (None yet) | - | - |
