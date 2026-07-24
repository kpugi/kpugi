# Kpugi — Folder Structure (Next.js App Router)

```
kpugi/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                       # homepage
│   │   ├── how-it-works/page.tsx
│   │   ├── pricing/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx    # Clerk sign-in
│   │   ├── sign-up/[[...sign-up]]/page.tsx    # Clerk sign-up
│   │   └── onboarding/
│   │       ├── role/page.tsx                  # choose advertiser / creator
│   │       ├── advertiser/page.tsx            # company details
│   │       └── creator/page.tsx               # connect social accounts (OAuth)
│   │
│   ├── (advertiser)/
│   │   ├── layout.tsx                         # advertiser dashboard shell
│   │   ├── dashboard/page.tsx
│   │   ├── campaigns/
│   │   │   ├── page.tsx                       # list advertiser's campaigns
│   │   │   ├── new/page.tsx                   # create campaign wizard
│   │   │   └── [campaignId]/
│   │   │       ├── page.tsx                   # campaign overview + submissions
│   │   │       ├── edit/page.tsx
│   │   │       └── fund/page.tsx              # Paystack funding flow
│   │   ├── wallet/page.tsx                    # advertiser funding wallet
│   │   └── settings/page.tsx
│   │
│   ├── (creator)/
│   │   ├── layout.tsx                         # creator dashboard shell
│   │   ├── dashboard/page.tsx
│   │   ├── catalogue/
│   │   │   ├── page.tsx                       # browse open campaigns
│   │   │   └── [campaignId]/
│   │   │       ├── page.tsx                   # campaign detail page
│   │   │       └── submit/page.tsx            # submit post URL + screenshot
│   │   ├── submissions/
│   │   │   ├── page.tsx                       # creator's submission history
│   │   │   └── [submissionId]/page.tsx        # status + verification detail
│   │   ├── accounts/page.tsx                  # manage connected social accounts (OAuth)
│   │   ├── earnings/page.tsx                  # creator earnings wallet + payout history
│   │   └── settings/page.tsx
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── paystack/route.ts              # Paystack payment webhooks
│   │   │   ├── clerk/route.ts                 # Clerk user sync webhook
│   │   │   └── oauth/
│   │   │       ├── instagram/callback/route.ts
│   │   │       ├── tiktok/callback/route.ts
│   │   │       └── x/callback/route.ts
│   │   ├── cron/
│   │   │   ├── verify-submissions/route.ts    # scraper + view-count verification job
│   │   │   ├── close-expired-campaigns/route.ts
│   │   │   └── release-payouts/route.ts
│   │   ├── campaigns/route.ts
│   │   ├── campaigns/[campaignId]/route.ts
│   │   ├── submissions/route.ts
│   │   ├── submissions/[submissionId]/route.ts
│   │   ├── wallet/fund/route.ts
│   │   └── wallet/withdraw/route.ts
│   │
│   ├── layout.tsx                             # root layout (Clerk provider, theme)
│   ├── globals.css                            # Tailwind + DaisyUI theme
│   └── not-found.tsx
│
├── components/
│   ├── ui/                                    # shared primitives (Button, Card, Badge, Modal)
│   ├── campaign/
│   │   ├── CampaignCard.tsx
│   │   ├── CampaignForm.tsx
│   │   ├── CampaignRequirementsList.tsx
│   │   └── BudgetProgressBar.tsx
│   ├── submission/
│   │   ├── SubmissionForm.tsx
│   │   ├── SubmissionStatusBadge.tsx
│   │   └── VerificationTimeline.tsx
│   ├── wallet/
│   │   ├── FundWalletModal.tsx
│   │   └── TransactionList.tsx
│   ├── social/
│   │   ├── ConnectAccountButton.tsx
│   │   └── ConnectedAccountCard.tsx
│   └── layout/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                          # browser client
│   │   ├── server.ts                          # server client (service role for cron/webhooks)
│   │   └── types.ts                           # generated DB types
│   ├── clerk/
│   │   └── auth.ts                            # helpers, role checks
│   ├── paystack/
│   │   ├── client.ts
│   │   ├── fund-campaign.ts
│   │   └── payout.ts
│   ├── resend/
│   │   └── send-email.ts
│   ├── knock/
│   │   └── notify.ts
│   ├── scraper/
│   │   ├── instagram.ts
│   │   ├── tiktok.ts
│   │   ├── x.ts
│   │   └── index.ts                           # platform dispatch
│   ├── oauth/
│   │   ├── instagram.ts
│   │   ├── tiktok.ts
│   │   └── x.ts
│   └── utils/
│       ├── payout-math.ts                     # CPM + commission calculations
│       ├── budget.ts                          # reservation/refund logic
│       └── validation.ts                      # zod schemas
│
├── hooks/
│   ├── useCampaigns.ts
│   ├── useSubmissions.ts
│   ├── useWallet.ts
│   └── useSocialAccounts.ts
│
├── types/
│   ├── campaign.ts
│   ├── submission.ts
│   ├── wallet.ts
│   └── social-account.ts
│
├── public/
│   ├── logo.svg
│   ├── favicon.ico
│   └── images/
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── middleware.ts                              # Clerk route protection
├── tailwind.config.ts                         # DaisyUI theme config
├── next.config.js
├── package.json
└── .env.local
```

## Notes

- Route groups `(marketing)`, `(auth)`, `(advertiser)`, `(creator)` keep layouts and access rules cleanly separated without affecting the URL path.
- `middleware.ts` uses Clerk to gate `(advertiser)` and `(creator)` route groups, and can redirect a signed-in user without a completed `profiles.role` to `/onboarding/role`.
- `api/cron/*` routes are triggered by Vercel Cron (or an external scheduler) — this is where the scraper + verification + payout-release logic actually runs.
- `lib/scraper/*` is isolated by platform so a broken/rate-limited scraper for one platform doesn't block verification for the others.
- All Paystack, OAuth token, and Knock/Resend keys live in `.env.local` — never in client-exposed `NEXT_PUBLIC_*` vars except publishable keys (Clerk/Paystack public key).
