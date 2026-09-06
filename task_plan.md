# Task Plan: Social Scraping & Verification System Engineering & Security Overhaul

## Goal
Implement the per-post 60-minute cooldown and 72-hour audit lifecycle, eliminate critical security and financial vulnerabilities (handle spoofing, budget race conditions, suspended account leakage), optimize execution performance with multi-threading (100% free on GitHub Actions), and clean up rogue view-inflating cron simulation code.

---

## Phases & Tasks

### [x] Phase 1: Timing & Eligibility Engine (60-Min Cooldown & 72-Hr Lifecycle)
- [x] **Task 1.1**: Update `.scraper/db.py` (`fetch_active_submissions`) to enforce the **60-minute post-submission cooldown** via Supabase RPC `get_due_submissions` with dual-guard Python fallback.
- [x] **Task 1.2**: Implement the **72-Hour Lifecycle Cap** in `.scraper/runner.py`: posts older than 72 hours receive a final settlement audit and mark `verified_pass` or `verified_fail` (cutoff expired), halting further recurring checks.
- [x] **Task 1.3**: Update `app/actions/creator.ts` so new link submissions enter the 60-minute organic growth window in status `pending` without premature instant zero-view audits, while manual resync correctly clears `last_scraped_at`.

### [x] Phase 2: Security, Fraud & Financial Hardening
- [x] **Task 2.1**: Fix Author Handle Ownership in `.scraper/runner.py` by removing loose substring matches and enforcing strict exact equality against connected account handles.
- [x] **Task 2.2**: Implement atomic Postgres RPC function `atomic_update_campaign_budget` in Supabase with `FOR UPDATE` row-level locking to eliminate the read-modify-write race condition.
- [x] **Task 2.3**: Add tombstone & suspension detection in `.scraper/extractors/fallbacks.py` and `runner.py` (e.g. "This post is from a suspended account") to fail/forfeit dead posts and reverse pending budget reservations.
- [x] **Task 2.4**: Add domain whitelisting and URL canonicalization in `.scraper/extractors/__init__.py` to block SSRF and prevent duplicate submissions via query parameter manipulation.

### [x] Phase 3: High-Performance Multi-Threaded Execution ($0 Budget)
- [x] **Task 3.1**: Convert `.scraper/runner.py` from a sequential `for` loop to a parallel `ThreadPoolExecutor(max_workers=6)` to achieve 30-45 second batch execution.
- [x] **Task 3.2**: Fix the YouTube Innertube player fallback in `fallbacks.py` to directly send a POST request instead of attempting an invalid initial GET request.
- [x] **Task 3.3**: Optimize GitHub Actions workflow (`scraper-cron.yml`) to run on an optimal 30-minute schedule with a 5-minute timeout guard.

### [x] Phase 4: Dead Code Elimination, Rogue Cron Cleanup & Verification
- [x] **Task 4.1**: Cleaned up `app/api/cron/verify-submissions/route.ts` to remove artificial view inflation (+5,000 views) and route safely to `triggerScraperRun()`.
- [x] **Task 4.2**: Synchronized `lib/scraper/index.ts` to export real types and dispatchers without misleading mock view counts.
- [x] **Task 4.3**: Ran end-to-end live integration test of `.scraper/runner.py` against live Supabase submissions; verified 0 errors, active cooldown enforcement, and sub-minute execution.

---

## Status: All Phases Successfully Completed.
