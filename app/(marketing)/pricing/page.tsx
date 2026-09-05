import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Coins,
  Building2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pricing2 } from '@/components/marketing/PricingTable';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Pricing & Transparent CPM Rates — Zero Waste Creator Advertising | Kpugi',
  description:
    'Transparent pricing for Nigerian brands and creators. Fixed ₦2,000 CPM model, 100% escrow protection, and zero agency retainers. Explore display flight packages and creator payout splits.',
  keywords: [
    'Kpugi pricing',
    'influencer marketing CPM Nigeria',
    'cost of influencer marketing Nigeria',
    'creator advertising rates Nigeria',
    'banner ad pricing Nigeria',
    'pay per view ad rates',
  ],
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: `${siteUrl}/pricing`,
    siteName: 'Kpugi',
    title: 'Pricing & Transparent CPM Rates — Zero Waste Creator Advertising | Kpugi',
    description:
      'Fixed ₦2,000 CPM model with 100% escrow protection. Pay only for real, verified views.',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Kpugi Pricing & Performance CPM Rates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    title: 'Pricing & Transparent CPM Rates | Kpugi',
    description: 'Fixed ₦2,000 CPM model with 100% escrow protection. Zero retainers.',
    images: ['/kpugi_logo.png'],
  },
};

export default function PricingPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${siteUrl}/pricing#webpage`,
      url: `${siteUrl}/pricing`,
      name: 'Pricing & Transparent CPM Rates — Kpugi',
      description:
        'Fixed ₦2,000 CPM creator performance model and on-platform display flight packages with zero agency retainers and 100% escrow protection.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Pricing',
            item: `${siteUrl}/pricing`,
          },
        ],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Kpugi Brand Campaign CPM Drop',
      description:
        'Pay-per-view creator distribution across TikTok, Instagram Reels, and X with 100% escrow protection and automated view verification.',
      brand: {
        '@type': 'Brand',
        name: 'Kpugi',
      },
      offers: {
        '@type': 'Offer',
        price: '2000.00',
        priceCurrency: 'NGN',
        priceValidUntil: '2027-12-31',
        availability: 'https://schema.org/InStock',
        description: '₦2,000 CPM per 1,000 verified authentic human views.',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${siteUrl}/pricing#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the default CPM rate on Kpugi?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our standard baseline rate is ₦2,000 CPM (₦2.00 per verified organic view). Brands have the flexibility to offer higher CPM rates for competitive drops or urgent deadlines.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are there any upfront retainer fees for brands?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'None. Kpugi operates with zero monthly agency retainers and zero account setup fees. You only fund the exact view budget you want delivered into escrow.',
          },
        },
        {
          '@type': 'Question',
          name: 'What platform fee does Kpugi charge creators?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Kpugi retains a flat 10% platform facilitation fee on creator earnings upon successful view delivery. Creators take home 90% of all generated earnings with zero withdrawal penalties.',
          },
        },
        {
          '@type': 'Question',
          name: 'What happens if a campaign does not reach all expected views?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Your budget is 100% protected in escrow. Any unspent portion of your view budget is automatically refunded to your brand wallet when the campaign flight expires.',
          },
        },
      ],
    },
  ];

  return (
    <div className="w-full text-slate-900 dark:text-white transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#2F49E8] dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
          <Coins className="size-3.5" />
          <span>Transparent Economics</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] tracking-tight text-slate-900 dark:text-white">
          Transparent, Performance-Driven Pricing.
        </h1>

        <p className="mt-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          No bloated agency retainers. No paying for ghosted influencer DMs. Pay only for real, audited views locked securely in platform escrow.
        </p>
      </section>

      {/* ─── DUAL CORE PRICING CARDS ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Brand Pricing Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Building2 className="size-3.5" />
                <span>For Brands & Advertisers</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  Pay-Per-View Campaign Drops
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Upload finished flyers, discount graphics, or official video ads. Creators syndicate your assets to their active audiences.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-display text-slate-900 dark:text-white">₦2,000</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">CPM (per 1,000 verified views)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Equivalent to ~₦2.00 per real engaged view across TikTok, Instagram Reels, and X feeds.
                </p>
              </div>

              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                {[
                  '100% Escrow Protection: Budget held safely until views are verified',
                  'AI Bot & Fraud Filtering: Non-human traffic is automatically blocked',
                  'Zero Upfront Agency Fees: No retainers, no contract lock-ins',
                  'Instant Refund Guarantee: Unspent budget returned on campaign expiry',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="size-4 text-[#17A75B] mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/calculator"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2F49E8] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Calculate Campaign Views</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/brands"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/15 transition-all text-center"
              >
                <span>Brand Suite Overview</span>
              </Link>
            </div>
          </div>

          {/* Creator Pricing Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Coins className="size-3.5" />
                <span>For Content Creators</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  Effortless Organic Monetization
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Claim campaigns that match your niche. Post ready brand assets to your feeds, and let your organic views earn on autopilot.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-display text-[#17A75B]">90%</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Net Creator Payout</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kpugi charges a flat 10% platform facilitation fee only when views successfully deliver.
                </p>
              </div>

              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                {[
                  'Zero Minimum Followers: Join with 100 or 100,000 followers',
                  'Instant Bank Withdrawals: Transfer directly to any Nigerian bank',
                  'No Hidden Withdrawal Penalties: You keep what you earn',
                  'Direct Campaign Access: No negotiation or agency middlemen',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="size-4 text-[#17A75B] mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Join as a Creator</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/creators"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/15 transition-all text-center"
              >
                <span>Creator Benefits</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ─── ON-PLATFORM DISPLAY FLIGHT PACKAGES ────────────────────────────── */}
      <section id="display-pricing" className="py-16 bg-slate-100/60 dark:bg-white/[0.02] border-y border-slate-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Pricing2
            title="On-Platform Display Flight Packages"
            subtitle="High-impact display banners, billboard takeovers, and email sponsorships reaching active creators and founders daily."
            yearlyLabel="Pay Quarterly (Save 20%)"
            monthlyLabel="Pay Monthly"
            discountText="Save 20%"
            tiers={[
              {
                id: 'tier-essential',
                name: 'Starter Drop',
                monthlyPrice: '₦150k',
                yearlyPrice: '₦120k',
                priceUnit: 'Week',
                buttonText: 'Book Starter Flight',
                features: [
                  { name: '1x Medium Rectangle MPU (300x250)' },
                  { name: 'Native in-feed placement on /browse' },
                  { name: 'Real-time impression & click analytics' },
                  { name: 'Standard UTM link attribution' },
                ],
              },
              {
                id: 'tier-professional',
                name: 'Billboard Flight',
                monthlyPrice: '₦500k',
                yearlyPrice: '₦400k',
                priceUnit: '2 Weeks',
                buttonText: 'Book Billboard Flight',
                features: [
                  { name: '1x Leaderboard (970x250 / 728x90)' },
                  { name: '1x Mobile Sticky Banner (320x50)' },
                  { name: '50%+ Above-the-fold Share of Voice' },
                  { name: 'Weekly verified analytics breakdown' },
                ],
              },
              {
                id: 'tier-business',
                name: 'Complete Takeover',
                monthlyPrice: '₦1.5M',
                yearlyPrice: '₦1.2M',
                priceUnit: 'Month',
                buttonText: 'Book Platform Takeover',
                isHighlighted: true,
                features: [
                  { name: 'Full Display Bundle (Billboard + MPU + Skyscraper)' },
                  { name: 'Dedicated Friday Payout newsletter sponsorship' },
                  { name: '1x Pinned "Featured Sponsor" in catalogue' },
                  { name: '100% Category Share of Voice' },
                  { name: 'Priority Ad Operations support' },
                ],
              },
              {
                id: 'tier-enterprise',
                name: 'Enterprise Network',
                monthlyPrice: 'Custom',
                yearlyPrice: 'Custom',
                priceUnit: '',
                buttonText: 'Contact Ad Sales Desk',
                features: [
                  { name: 'Custom multi-channel banner & email campaigns' },
                  { name: 'Instant Drop Alert email blast sponsor' },
                  { name: 'Custom A/B creative testing & 3rd-party tags' },
                  { name: 'Dedicated Ad Operations account director' },
                  { name: 'Custom SLA & invoicing agreements' },
                ],
              },
            ]}
          />
        </div>
      </section>

      {/* ─── PRICING FAQS ─────────────────────────────────────────────────── */}
      <section id="pricing-faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="size-3.5" />
            <span>Pricing FAQs</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white">
            Common Questions on Rates & Escrow
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'What is the default CPM rate on Kpugi?',
              a: 'Our standard baseline rate is ₦2,000 CPM (₦2.00 per verified organic view). Brands have the flexibility to offer higher CPM rates for competitive drops or urgent deadlines.',
            },
            {
              q: 'Are there any upfront retainer fees for brands?',
              a: 'None. Kpugi operates with zero monthly agency retainers and zero account setup fees. You only fund the exact view budget you want delivered into escrow.',
            },
            {
              q: 'What platform fee does Kpugi charge creators?',
              a: 'Kpugi retains a flat 10% platform facilitation fee on creator earnings upon successful view delivery. Creators take home 90% of all generated earnings with zero withdrawal penalties.',
            },
            {
              q: 'What happens if a campaign does not reach all expected views?',
              a: 'Your budget is 100% protected in escrow. Any unspent portion of your view budget is automatically refunded to your brand wallet when the campaign flight expires.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.q}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
