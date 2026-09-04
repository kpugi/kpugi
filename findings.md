# Findings: Creator Compliance, Platform Rules & Architecture Research

## 1. Compliance Architecture & Requirements
- **Target Audience**: Nigerian and international digital content creators operating across short-form platforms (TikTok, Instagram Reels, YouTube Shorts, X/Twitter, Facebook, and LinkedIn).
- **Regulatory Framework**:
  - **ARCON (Advertising Regulatory Council of Nigeria)**: Requires clear disclosure of commercial promotions, prohibits false/misleading product claims, and enforces truth in advertising.
  - **NDPR & Nigeria Data Protection Act (NDPA 2023)**: Strict data privacy for KYC documents (NIN, voter cards, passports) and bank identifiers.
  - **CBN / NIBSS & AML Regulations**: Rigorous account holder name verification ensuring creator NUBAN accounts match verified legal identity to prevent money laundering and payout redirection fraud.
  - **FCCPC (Federal Competition and Consumer Protection Commission)**: Consumer transparency, authentic testimonials, and prohibition of deceptive influencer marketing.

## 2. Platform Mechanics & Scopes to Formalize
1. **The 1,000-View Hard Cliff**:
   - Zero follower threshold to join.
   - Any post that finishes below 1,000 verified organic views earns ₦0.00.
   - Gross payout formula: `(Verified Views / 1,000) * CPM Rate`.
   - Platform fee: 10% facilitation deduction; Creator receives 90% net take-home pay.
2. **Automated Scraping & Auditing Engine**:
   - Automated 60-minute recurring verification checks from post submission to campaign drop expiration.
   - 72-Hour Public Retention rule: Deleting, archiving, or privating videos voids all pending and escrowed payouts.
3. **Anti-Fraud & Traffic Authenticity**:
   - Zero tolerance for SMM panels, click farms, loopers, headless browser bots, or view-exchange groups.
   - Automatic velocity & engagement audit flags resulting in disqualification, wallet forfeiture, and permanent blacklisting.
4. **Financial Rail & Settlements**:
   - Automatic Friday afternoon batch bank settlements via Paystack/NIBSS.
   - Zero (₦0) withdrawal fee for creators.
   - Bank accounts supported: all licensed Nigerian commercial banks and tier-3 fintechs (OPay, Kuda, PalmPay, Moniepoint, etc.).
5. **Code-in-Bio Verification**:
   - Zero password sharing / No OAuth required.
   - Unique alphanumeric token in creator profile bio verified publicly via scraper.
6. **Dispute Resolution & Appeals**:
   - 48-hour appeal window for flagged audit decisions.
   - Triaged via KpugiBot AI / Freshdesk human ticketing at `support.kpugi.com`.

## 3. Platform Routing & Link Audit
- Current internal links to `/rules`:
  - `components/onboarding/TourHelpMenu.tsx` (Line 153)
  - `components/dashboard/DashboardFooter.tsx` (Line 45)
  - `components/layout/Footer.tsx` (Line 129)
  - `app/(marketing)/rules/page.tsx` (currently a 34-line placeholder)
- Solution:
  - Migrate all references to use `FRESHDESK_LINKS.rules` (`https://support.kpugi.com/support/solutions`).
  - Add permanent redirect on `app/(marketing)/rules/page.tsx` forwarding users to the support solutions rules article.
