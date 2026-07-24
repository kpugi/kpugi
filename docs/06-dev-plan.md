# Kpugi — Dev Plan (for Antigravity)

Structured as sequential phases, each broken into discrete tasks with a clear scope and acceptance criteria — written so each task can be handed to an agent as a self-contained unit of work, verified, then closed before moving to the next. Reference docs: `01-platform-design.md`, `02-database-design.md`, `03-folder-structure.md`, `04-design-system.md`, `05-homepage-prompt.md`.

---

## Phase 0 — Project setup

**Goal:** empty but correctly wired Next.js app with every service connected end-to-end.

- [ ] Scaffold Next.js (App Router) + TypeScript + Tailwind. Match `03-folder-structure.md` exactly.
- [ ] Install and configure DaisyUI; register the custom `kpugi` theme from `04-design-system.md` in `tailwind.config.ts`.
- [ ] Install and configure Clerk; wrap root layout in `<ClerkProvider>`; add `middleware.ts` protecting `(advertiser)` and `(creator)` route groups.
- [ ] Set up Supabase project; run the schema from `02-database-design.md` as an initial migration in `supabase/migrations/`.
- [ ] Wire Supabase client (browser + server/service-role) in `lib/supabase/`.
- [ ] Add Paystack, Resend, and Knock SDK clients (`lib/paystack`, `lib/resend`, `lib/knock`) with env vars stubbed in `.env.local`.
- [ ] Deploy a "hello world" build to Vercel to confirm the full pipeline (env vars, build, deploy) works before building features.

**Acceptance:** app builds and deploys; a test user can sign up via Clerk and a matching row appears in `profiles` (via the Clerk webhook → `profiles` sync).

---

## Phase 1 — Auth, roles, and onboarding

- [ ] `api/webhooks/clerk/route.ts` — on `user.created`, insert a `profiles` row.
- [ ] Onboarding flow: `/onboarding/role` → choose advertiser or creator → writes `profiles.role` and creates the matching `advertiser_profiles` or `creator_profiles` row.
- [ ] `/onboarding/advertiser` — company name, website, billing email; sets `agreed_global_rules_at` on submit (this is the platform-wide rules agreement from `01-platform-design.md`).
- [ ] `/onboarding/creator` — prompts at least one social account connection before continuing (can be skipped and completed later from `/accounts`).
- [ ] Route guards: signed-in user without a `role` is redirected to onboarding from any dashboard route.

**Acceptance:** a new user can sign up, pick a role, complete the matching onboarding step, and land on the correct dashboard shell.

---

## Phase 2 — Social account connection (OAuth)

- [ ] Build OAuth flow for one platform first (recommend Instagram/Meta, since it has the most mature Graph API) end-to-end before adding others.
- [ ] `lib/oauth/instagram.ts` — auth URL builder + token exchange.
- [ ] `api/webhooks/oauth/instagram/callback/route.ts` — handles callback, stores tokens (encrypted) + `follower_count` in `social_accounts`.
- [ ] `/accounts` page — list connected accounts, connect/revoke actions.
- [ ] Revoke flow: when a creator disconnects, set `revoked_at`; if the account has an active `submissions` row, mark it `forfeited` per the rule in `01-platform-design.md`.
- [ ] Repeat for TikTok and X once the Instagram flow is proven — treat each as its own scoped task, not a batch.

**Acceptance:** a creator can connect an Instagram account, see it listed with a follower count, and revoking it correctly forfeits any active submission tied to it.

---

## Phase 3 — Campaign creation (advertiser side)

- [ ] `/campaigns/new` — multi-step form: creative upload (image/video) or copy text, description, requirements (structured fields feeding `requirements` jsonb), CPM rate (default ₦2,000, editable), total budget, required live duration.
- [ ] Campaign starts in `draft` status; validate all required fields with a zod schema before allowing submission.
- [ ] `/campaigns/[campaignId]/fund` — Paystack funding flow; on successful payment, `api/webhooks/paystack/route.ts` verifies the transaction, credits the advertiser wallet, and flips campaign `draft → funding_pending → live` once `total_budget` is fully covered.
- [ ] `/campaigns` (advertiser list) and `/campaigns/[campaignId]` (single campaign overview: status, budget bar, submissions list) — read-only for now, submissions wired in Phase 5.

**Acceptance:** an advertiser can create a campaign, fund it via Paystack (test mode), and see it flip to `live` and appear in the public catalogue.

---

## Phase 4 — Campaign catalogue (creator side)

- [ ] `/catalogue` — public list of all `live` campaigns, filterable by ad format and platform. No eligibility gate — every campaign is visible to every creator per `01-platform-design.md`.
- [ ] `/catalogue/[campaignId]` — campaign detail page: creative preview, full requirements (rendered as advisory pill tags, not a gate), CPM, budget-remaining progress bar, "Post this" CTA.
- [ ] Campaign card and detail components per `04-design-system.md` (budget progress bar behavior, requirement pills).

**Acceptance:** a signed-in creator can browse live campaigns and open a detail page showing accurate, live budget-remaining data.

---

## Phase 5 — Submission flow (the core loop)

This is the highest-risk phase — build and test it in isolation before moving on.

- [ ] `/catalogue/[campaignId]/submit` — form for post URL + screenshot upload; creator selects which connected social account it belongs to.
- [ ] Server-side on submit (`api/submissions/route.ts`):
  - Reject if `post_url` already exists anywhere (global de-dupe).
  - Reject if creator already has an active submission on this campaign.
  - Reject if campaign has no remaining reservable budget.
  - Compute `reserved_amount` (estimate from follower count × CPM, capped at remaining budget).
  - Insert `submissions` row (`status = pending`), increment `campaigns.reserved_budget`, insert a `budget_reservation` wallet_transaction.
  - Flip campaign to `budget_committed` if this submission fully reserves the remaining budget.
- [ ] `/submissions` and `/submissions/[submissionId]` — creator's own submission list + status detail.
- [ ] Notification on submit (Knock) confirming the clock-in.

**Acceptance:** a creator can submit a post link that correctly reserves budget, is rejected on duplicate URL or duplicate active submission, and correctly closes the campaign to new submissions once budget is fully committed.

---

## Phase 6 — Verification cron + scraper

- [ ] `lib/scraper/instagram.ts` (build first platform only) — given a post URL, return `{ reachable: boolean, view_count: number | null }`.
- [ ] `api/cron/verify-submissions/route.ts` — scheduled job (Vercel Cron):
  - For each `pending` submission past its `required_live_duration_hours` (+ `verification_grace_hours`), run the scraper.
  - Insert a `verification_checks` row every run (not just at the end) so there's a full audit trail, not just a final result.
  - On final check: if `view_count >= min_view_threshold` and post still reachable → `verified_pass`; otherwise → `verified_fail` with the correct `failure_reason`.
- [ ] `api/cron/release-payouts/route.ts` — for `verified_pass` submissions, compute payout/commission (per `02-database-design.md` payout math), insert wallet transactions, move `reserved_budget → spent_budget`, trigger Paystack transfer to the creator, flip status to `paid`.
- [ ] Failed-slot refund logic — for `verified_fail`/`forfeited`, release `reserved_amount` back into `campaigns.reserved_budget` reduction (i.e. back to available budget), insert `budget_release_refund` transaction, and re-open the campaign to new submissions if it had been `budget_committed`.
- [ ] Repeat scraper build for TikTok/X once Instagram path is proven, matching the pattern from Phase 2.

**Acceptance:** running the cron against a seeded test submission correctly produces a pass (payout released, wallet updated) and a fail (budget refunded, campaign reopened) case.

---

## Phase 7 — Wallets, payouts, and campaign completion

- [ ] `/wallet` (advertiser) — funding balance, transaction history, "add funds" via Paystack.
- [ ] `/earnings` (creator) — earnings balance, payout history, Paystack payout account setup (`paystack_recipient_code`).
- [ ] Campaign auto-completion: when `spent_budget + reserved_budget >= total_budget` and no `pending` submissions remain, flip campaign to `completed`.
- [ ] Notifications (Knock + Resend) for: campaign funded, submission verified pass/fail, payout released.

**Acceptance:** full loop works test-to-test: fund campaign → creator submits → cron verifies → payout hits creator wallet → campaign completes when budget exhausted.

---

## Phase 8 — Homepage and marketing pages

- [ ] Build homepage using `05-homepage-prompt.md` exactly, with the Live Ticker as a real animated component (illustrative data, clearly commented as placeholder).
- [ ] `/how-it-works`, `/pricing` pages — reuse design system components, no new visual language.

**Acceptance:** homepage matches the design system tokens (color, type, spacing) and the Live Ticker animates correctly with reduced-motion respected.

---

## Phase 9 — Hardening & launch prep

- [ ] RLS policies on every Supabase table per the pattern in `02-database-design.md`; test that an advertiser cannot read another advertiser's campaigns/wallet via the client.
- [ ] Rate-limit `api/submissions` and OAuth callback routes.
- [ ] Encrypt OAuth tokens at rest (confirm `social_accounts.oauth_access_token`/`refresh_token` are not stored in plaintext).
- [ ] Error/empty states across dashboards (per the "treat failure and emptiness as moments for direction" rule in the design system).
- [ ] Load-test the verification cron against a realistic number of concurrent `pending` submissions.
- [ ] Buy `kpugi.com`, connect to Vercel, set up production environment variables and Paystack live keys.

**Acceptance:** RLS verified with a real cross-account test, cron performs acceptably at expected volume, domain live and pointed at production.

---

## Suggested sequencing note for Antigravity

Work phase-by-phase, not feature-by-feature across phases — each phase produces a genuinely testable slice (auth works → campaigns can be created → creators can browse → submissions work → verification works → payouts work → homepage exists → hardened). Phase 5 and 6 are the riskiest and most novel (budget reservation math, scraper reliability) — build with real seeded data and manual verification before wiring the cron schedule live.
