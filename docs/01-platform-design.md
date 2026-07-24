# Kpugi — Platform Design

## 1. What Kpugi is

Kpugi is a Nigeria-first marketplace that connects **advertisers/brands** with **creators** (owners of social media pages/profiles) for paid ad placements. Advertisers fund campaigns and supply creatives (text, image, or video); creators post those creatives to their own social accounts to earn a payout based on performance. There is no manual vetting step — eligibility, verification, and payout are all rule-based and automated.

Positioning: like clipping.net-style clipping platforms, but supports three ad formats (not just video) and is built around Nigerian creators and Naira/Paystack payouts.

## 2. User roles

### Advertiser (Brand)
- Signs up, funds their wallet via Paystack.
- Creates campaigns: uploads creative(s), writes description, sets requirements, sets CPM rate (or uses the platform default of ₦2,000 / 1k views), sets total budget.
- Agrees to platform-wide global rules at campaign creation (no manual approval step exists — this agreement + their own stated requirements is the only gate).
- Watches campaign performance in real time (submissions, views, spend, budget remaining).

### Creator (Publisher)
- Signs up, connects social account(s) via OAuth (Meta/Instagram, TikTok, X, etc. — platform coverage depends on what's launched).
- Browses the open campaign catalogue (no application step — every campaign is open to all creators).
- Reads a campaign's detail page (creative, requirements, CPM, budget remaining) and self-assesses fit.
- Posts the creative on their own account, then submits the live post URL + a screenshot to "clock in" to the campaign.
- Gets paid automatically if the post clears the 1k-view floor within the campaign's required duration; gets nothing if it doesn't (hard cliff).

### Platform (Kpugi)
- Enforces global rules, runs verification (scraper + cron), reserves/releases budget, handles payouts minus a 10% commission, and moves failed-slot budget back into the live campaign pool.

## 3. Core end-to-end flow

1. **Advertiser creates campaign** — creative, description, requirements, target CPM (default ₦2,000/1k views or custom), total budget, campaign duration.
2. **Advertiser funds the campaign** via Paystack. Campaign stays in draft until fully funded.
3. **Campaign goes live** and appears in the open catalogue — visible to all creators, no application/approval gate.
4. **Creator browses catalogue**, opens a campaign detail page, reads the creative + requirements, and decides if they're a fit.
5. **Creator posts** the creative on their own connected social account.
6. **Creator submits** the live post URL + screenshot. This "clocks them in" to the campaign and reserves their estimated slice of the budget (based on the creator's follower count × CPM, or a platform-estimated ceiling).
7. **Verification window runs.** A cron job + scraper periodically checks the live URL:
   - Confirms the post is still up.
   - Tracks view count against the 1k baseline.
   - Confirms the post stays live for the campaign's required duration.
8. **Outcome:**
   - **Pass** (post stayed live, hit ≥1k views by end of duration/grace window): payout is calculated as `(views / 1000) × CPM`, minus Kpugi's 10% commission, released to the creator's Paystack payout account.
   - **Fail** (post deleted/privated, OAuth revoked, or below the 1k floor at check time): payout is ₦0 — hard cliff, no partial credit. Reserved budget for that slot returns to the campaign's live pool so another creator's submission can be backfilled.
9. **Campaign ends** when its budget is fully depleted (spent on successful payouts) or its funded budget is fully reserved/committed across active submissions.

## 4. Key mechanics

### CPM & payout math
- Default: ₦2,000 per 1,000 views. Advertisers may set a custom rate per campaign.
- Payout = `(verified views / 1000) × CPM`, only if verified views ≥ 1,000.
- Below 1,000 views → payout is ₦0 (hard cliff, not pro-rated).
- Kpugi commission: 10%, deducted from the creator's payout at release.

### Automated eligibility (no manual approval)
- There is no advertiser review/approval step. Every campaign is open to every creator.
- Requirements set by the advertiser (audience, niche, follower minimums, etc.) are **advisory, not gated** — it's on the creator to self-assess fit from the campaign detail page.
- The only real enforcement is outcome-based: if a creator's audience doesn't match, they won't hit 1k views and won't get paid. This makes mismatch self-correcting rather than something Kpugi has to police at claim-time.

### Budget reservation
- The moment a creator submits their post link ("clocks in"), Kpugi reserves their estimated payout amount from the campaign's remaining budget.
- This prevents multiple creators from overcommitting a campaign's budget before verification completes.
- A campaign stops accepting new submissions once its budget is fully reserved. If a reserved slot later fails verification, that budget unlocks back to the live pool and can backfill a queued/new submission.

### Verification
- Verification of "is the post still live" and "how many views does it have" is done via scrapers hitting the public post URL directly — not solely via platform APIs — since posts are public by nature of the campaign.
- OAuth (per creator, per connected account) is used for **identity and payout linkage** — proving the creator owns the account they're posting from, and connecting it to their Paystack payout details — not for pulling view data.
- If a creator revokes OAuth access mid-campaign, they forfeit payout for that placement (treated as a failed slot).
- Screenshots submitted alongside the post URL are a human-readable sanity artifact for the record, not the source of truth for payout — the scraper's live check is authoritative.

### Anti-gaming
- URL deduplication: the same post URL cannot be submitted more than once, by the same or different creators.
- One active submission per creator per campaign.
- Hard cliff on the 1k-view floor discourages bot/low-quality traffic since there's no partial payout to game.
- (Future/v2, not a launch blocker): fraud-score layer to flag accounts with inflated/fake followers gaming a min-follower requirement, since follower count alone isn't a quality signal.

## 5. Campaign lifecycle states

`draft` → `funding_pending` → `live` → `budget_committed` (fully reserved, closed to new submissions) → `completed` (funded budget fully spent on verified payouts, or duration/window expired)

## 6. Out of scope for v1 (explicitly deferred)
- Manual advertiser review/approval of creators.
- Fraud-score / follower-quality scoring beyond the view-count hard cliff.
- Multi-currency support (Naira/Nigeria-first only).
- Platforms beyond initial OAuth + scraper coverage (expand platform support post-launch based on scraper reliability).
