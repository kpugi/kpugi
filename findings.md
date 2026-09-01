# Findings & Security Audit Notes

## Platform Stack
- Next.js 15 (App Router with Turbopack)
- Supabase (PostgreSQL with Service Role Key & Anon Key)
- Clerk (Authentication)
- Paystack (Payment Gateway & Funding Webhooks)
- Didit (Identity & KYC Verification)
- Knock & Resend (Notifications)
- Upstash Redis (Rate limiting and caching)

## Key Vulnerabilities Found
1. **Paystack Webhook**: Missing HMAC-SHA512 `x-paystack-signature` check -> allows forging deposit webhooks.
2. **Clerk Webhook**: Missing Svix signature verification -> allows forging user sync and role escalation.
3. **Didit KYC Webhook**: Missing signature/secret verification -> allows forging KYC verification decisions.
4. **Supabase RLS**: 12 core tables had RLS disabled -> client `anon_key` could read OAuth tokens, wallets, profiles, and submissions directly.
5. **Cron Endpoints**: `/api/cron/release-payouts` and `/api/cron/verify-submissions` were completely open; `/api/cron/daily-settlement` had insecure fallback when `CRON_SECRET` was missing.
6. **Campaign Creation**: `POST /api/campaigns` lacked `auth()` and spread `...body` into the database without field allowlists.
7. **OAuth Callbacks**: Legacy OAuth callbacks (`app/api/auth/oauth/*`) had state bypasses; social verification is now handled via bio code scraping (`/api/verify/social/*`).
8. **Prelander Open Redirect**: `app/go/page.tsx` lacked protocol validation.
9. **Chat Stored XSS**: `components/support/KpugiBotChat.tsx` used `rehype-raw` without sanitization.
10. **Security Headers**: `next.config.js` lacked HTTP defensive headers.
