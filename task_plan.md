# Task Plan: Comprehensive Creator Rules & Compliance Master Document Migration

## Goal
Author an authoritative, exhaustive "Creator Rules, Quality Standards & Compliance Master Document" covering all operational, legal, auditing, and financial scopes for Kpugi creators. Migrate all platform references from `/rules` to the official support knowledge base article, implement automatic redirects on `/rules`, and sync the knowledge base for KpugiBot AI.

---

## Phases & Tasks

### [x] Phase 1: Research & Document Architecture
- [x] **Task 1.1**: Audit existing rules, knowledge base files (`docs/Kpugi_Knowledge_Base.txt`), and all references to `/rules` across the codebase.
- [x] **Task 1.2**: Define comprehensive document outline covering all 12 operational scopes (KYC, Code-in-Bio, Briefs, 1,000-view cliff, 60-min audits, 72-hr retention, fraud/bot zero-tolerance, Friday payouts, ARCON ad disclosures, IP/music licensing, strikes & appeals).
- [x] **Task 1.3**: Update `findings.md` with regulatory, operational, and financial compliance standards.

### [x] Phase 2: Authoring the Giant Rules & Compliance Master Document
- [x] **Task 2.1**: Author `docs/KPUGI_CREATOR_COMPLIANCE_RULES_MASTER.md` — The exhaustive, legally rigorous, authoritative source of truth for creators.
- [x] **Task 2.2**: Generate `docs/Kpugi_Rules_Article.html` — Clean, styled HTML version formatted specifically for Freshdesk Knowledge Base / Solutions article publishing.
- [x] **Task 2.3**: Update `docs/Kpugi_Knowledge_Base.txt` — Incorporate the master rules into the bot training knowledge base so KpugiBot (Freddy AI) can cite and answer compliance queries.

### [x] Phase 3: Codebase Migration from `/rules` to Support Article
- [x] **Task 3.1**: Create `lib/support/freshdesk-constants.ts` and update `lib/support/freshdesk.ts` to add `FRESHDESK_LINKS.rules` pointing to the support solutions article.
- [x] **Task 3.2**: Update `components/onboarding/TourHelpMenu.tsx` to link to `FRESHDESK_LINKS.rules` with `target="_blank" rel="noopener noreferrer"`.
- [x] **Task 3.3**: Update `components/dashboard/DashboardFooter.tsx` to link to `FRESHDESK_LINKS.rules` with `target="_blank" rel="noopener noreferrer"`.
- [x] **Task 3.4**: Update `components/layout/Footer.tsx` to link to `FRESHDESK_LINKS.rules` with `target="_blank" rel="noopener noreferrer"`.
- [x] **Task 3.5**: Update `app/(marketing)/rules/page.tsx` with Next.js `redirect()` to forward visitors directly to the support article.

### [x] Phase 4: Verification & Integrity Testing
- [x] **Task 4.1**: Run TypeScript typecheck (`npx tsc --noEmit`) to verify 0 errors.
- [x] **Task 4.2**: Verify redirect and external link behavior in browser/devtools (Verified: HTTP 307 to `https://support.kpugi.com/support/solutions/articles/creator-rules-compliance`).
- [x] **Task 4.3**: Update `walkthrough.md` and complete `/goal`.

---

## Status: All Phases Successfully Completed.
