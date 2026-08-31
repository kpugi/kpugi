import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createAdminClient } from '@/lib/supabase/server';
import BrandHoverExpand from '@/components/advertiser/BrandHoverExpand';
import BrandHero32 from '@/components/advertiser/BrandHero32';
import BrandPricingSplitSection from '@/components/advertiser/BrandPricingSplitSection';
import BrandTestimonialsVertical from '@/components/advertiser/BrandTestimonialsVertical';
import BrandCTASection from '@/components/advertiser/BrandCTASection';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    absolute: 'For Brands — Pay Only for Real Verified Views | Kpugi',
  },
  description:
    'Launch creator campaigns across Nigeria. Distribute content to hundreds of verified creators and only pay when real audiences engage and view.',
  keywords: [
    'influencer marketing Nigeria for brands',
    'hire Nigerian creators',
    'performance ads Nigeria',
    'CPM advertising Nigeria',
    'brand creator campaigns',
    'verified view advertising',
    'TikTok ads Nigeria creators',
    'Instagram influencer campaigns Nigeria',
    'Kpugi brands',
    'guaranteed view advertising Nigeria',
  ],
  alternates: {
    canonical: '/brands',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: `${siteUrl}/brands`,
    siteName: 'Kpugi',
    title: 'For Brands — Pay Only for Real Verified Views | Kpugi',
    description:
      'Launch creator campaigns across Nigeria. Distribute content to hundreds of verified creators and only pay when real audiences engage and view.',
    images: [
      {
        url: `${siteUrl}/og-brands.png`,
        width: 1200,
        height: 630,
        alt: 'Kpugi for Brands — Guaranteed View Performance Marketing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For Brands — Pay Only for Real Verified Views | Kpugi',
    description:
      'Launch creator campaigns across Nigeria. Distribute content to hundreds of verified creators and only pay when real audiences engage and view.',
    images: [`${siteUrl}/og-brands.png`],
  },
};

// ─── Server data fetchers ───────────────────────────────────────────────────
async function getActiveBrands() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('advertiser_profiles')
      .select(`
        company_name,
        profiles!inner(avatar_url, full_name)
      `)
      .not('company_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return (data ?? []).filter((b: any) => b.company_name);
  } catch {
    return [];
  }
}

async function getBrandReviews() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('brand_reviews')
      .select(`
        id,
        reviewer_name,
        reviewer_role,
        content,
        metric,
        rating,
        advertiser_profiles (
          company_name,
          profiles (
            avatar_url
          )
        )
      `)
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((r: any) => ({
      id: r.id,
      name: r.reviewer_name,
      role: r.reviewer_role,
      company: r.advertiser_profiles?.company_name ?? 'Verified Brand',
      avatar_url: r.advertiser_profiles?.profiles?.avatar_url ?? null,
      content: r.content,
      metric: r.metric,
      rating: r.rating ?? 5,
    }));
  } catch {
    return [];
  }
}

// ─── FAQ item (Light & Dark Mode) ───────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="border-b border-slate-200 dark:border-white/10 p-0 group">
      <summary className="font-satoshi font-semibold text-[0.9375rem] text-slate-900 dark:text-white cursor-pointer py-[22px] list-none flex justify-between items-center transition-colors">
        {q}
        <span
          aria-hidden
          className="text-slate-400 dark:text-white/30 text-lg flex-shrink-0 ml-4 group-open:rotate-45 transition-transform duration-200"
        >
          +
        </span>
      </summary>
      <p className="font-satoshi text-sm text-slate-600 dark:text-white/50 leading-[1.7] mb-[22px] pr-8">
        {a}
      </p>
    </details>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BrandsPage() {
  const [brands, reviews] = await Promise.all([
    getActiveBrands(),
    getBrandReviews(),
  ]);

  const faqs = [
    {
      q: 'How does Kpugi make sure I only pay for real views?',
      a: 'Every post submitted by a creator is tracked automatically by our verification system, which checks the live post URL continuously and counts views from real people. Your campaign budget is only drawn down when views are confirmed — not before.',
    },
    {
      q: 'What happens if I fund a campaign and creators do not get enough views?',
      a: 'If a creator\'s post doesn\'t hit the minimum view threshold, that slot is cancelled and the reserved amount returns to your campaign budget instantly — so other creators can claim it.',
    },
    {
      q: 'Can I set my own rate per 1,000 views?',
      a: 'Yes. When creating a campaign you set your CPM rate. The platform default is ₦2,000 per 1,000 views. You can go higher to attract more creators or match a specific content budget.',
    },
    {
      q: 'What happens to unspent budget when my campaign ends?',
      a: 'Any funds not matched to verified views stay in your Kpugi wallet and are available for your next campaign. You can also request a full transfer back to your bank account at any time.',
    },
    {
      q: 'How quickly do I start seeing creators post my content?',
      a: 'Campaigns go live immediately once funded. Most live campaigns receive their first creator submissions within a few hours — the open marketplace means any creator can pick up your brief at any time.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/brands#webpage`,
        url: `${siteUrl}/brands`,
        name: 'For Brands — Pay Only for Real Verified Views | Kpugi',
        description:
          'Launch creator campaigns across Nigeria. Distribute content to hundreds of verified creators and only pay when real audiences engage and view.',
        inLanguage: 'en-NG',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          url: siteUrl,
          name: 'Kpugi',
        },
      },
      {
        '@type': 'Service',
        '@id': `${siteUrl}/brands#service`,
        name: 'Kpugi Performance Creator Campaigns for Brands',
        provider: {
          '@type': 'Organization',
          name: 'Kpugi',
          url: siteUrl,
          logo: `${siteUrl}/logo.png`,
        },
        serviceType: 'Performance Influencer Marketing & CPM Advertising',
        areaServed: 'NG',
        description:
          'Performance creator marketplace where Nigerian brands distribute media assets to vetted creators and only pay for verified, authentic views.',
      },
      {
        '@type': 'HowTo',
        '@id': `${siteUrl}/brands#howto`,
        name: 'How to Launch a Guaranteed View Campaign on Kpugi',
        description: 'Step-by-step guide for brands to distribute content and only pay for verified creator views.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Create Campaign Brief & Set CPM Budget',
            text: 'Choose your platforms, upload video/image creative assets, write your guidelines, and set your target CPM rate and budget.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Escrow Funds Safely',
            text: 'Fund your campaign securely. Your money stays protected in escrow and is only drawn down upon verified view delivery.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Creators Claim & Publish',
            text: 'Vetted Nigerian creators accept your brief, post your exact assets to their audience, and submit the live link.',
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Automated View Auditing & Settlement',
            text: 'Kpugi automated scraper audits live views in real-time. Payouts release only for verified results, and unspent budget is refunded.',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/brands#faq`,
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#08090D] text-slate-900 dark:text-white font-satoshi transition-colors duration-300">
        {/* ─── HERO (HERO32 MOTION PHYSICS) ──────────────────────────────────── */}
        <div id="hero">
          <BrandHero32 />
        </div>

        {/* ─── BRAND CLOUD ───────────────────────────────────────────────────── */}
        <section id="partners" className="relative py-20 overflow-hidden">
        {/* Ambient Glow */}
        <div
          aria-hidden
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[140%] pointer-events-none z-0
            bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,rgba(47,73,232,0.15)_0%,rgba(47,73,232,0.03)_50%,transparent_80%)]
            dark:bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,rgba(47,73,232,0.28)_0%,rgba(47,73,232,0.08)_50%,transparent_80%)]"
        />

        {/* Heading */}
        <div className="text-center mb-12 relative z-10 px-6">
          <h2 className="font-clash font-bold text-[clamp(2rem,4.5vw,3.25rem)] text-slate-900 dark:text-white mb-3 tracking-[-0.025em] leading-[1.1]">
            Join{' '}
            <span className="bg-gradient-to-br from-[#4162FF] via-[#2F49E8] to-[#1A32D4] bg-clip-text text-transparent">
              {brands.length > 0 ? `${brands.length}+` : '200+'} brands
            </span>{' '}
            already running campaigns
          </h2>
          <p className="font-satoshi text-base text-slate-600 dark:text-white/45 m-0">
            Real Nigerian brands distributing content across 6 platforms — right now.
          </p>
        </div>

        {/* Cards */}
        <div className="relative z-10">
          {brands.length > 0 ? (
            <BrandHoverExpand
              brands={brands.map((b: any) => ({
                company_name: b.company_name,
                avatar_url: b.profiles?.avatar_url ?? null,
              }))}
            />
          ) : (
            <BrandHoverExpand
              brands={[
                { company_name: 'NovaBev', avatar_url: null },
                { company_name: 'SkinGlow', avatar_url: null },
                { company_name: 'FastCart', avatar_url: null },
                { company_name: 'PulseFM', avatar_url: null },
                { company_name: 'CityDrip', avatar_url: null },
                { company_name: 'GoTrack', avatar_url: null },
                { company_name: 'BrewCo', avatar_url: null },
                { company_name: 'AgroPlus', avatar_url: null },
              ]}
            />
          )}
        </div>
      </section>

      {/* ─── PRICING & PERFORMANCE SPLIT SECTION ──────────────────────────── */}
      <div id="pricing">
        <BrandPricingSplitSection />
      </div>

      {/* ─── WHY BRANDS TRUST US — BENTO GRID ─────────────────────────────── */}
      <section id="features" className="bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto py-20 px-6">
          {/* Heading */}
          <div className="text-center mb-14">
            <h2 className="font-clash font-bold text-[clamp(2rem,4vw,3rem)] text-slate-900 dark:text-white mb-3 tracking-[-0.025em] leading-[1.1]">
              Why brands trust Kpugi
            </h2>
            <p className="font-satoshi text-base text-slate-600 dark:text-white/40 m-0">
              Built around one rule: you only pay when real people see your content.
            </p>
          </div>

          {/* Row 1: 2 large cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: 16,
              marginBottom: 16,
            }}
            className="bento-row-1"
          >
            {/* Card A — Big stat: ₦0 upfront */}
            <div className="relative bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-[20px] p-10 overflow-hidden min-h-[280px] flex flex-col justify-end shadow-sm dark:shadow-none">
              {/* Dot grid texture */}
              <div
                aria-hidden
                className="absolute inset-0 bg-[size:28px_28px] pointer-events-none
                  [background-image:radial-gradient(circle,rgba(0,0,0,0.04)_1px,transparent_1px)]
                  dark:[background-image:radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)]"
              />
              {/* Blue glow behind stat */}
              <div
                aria-hidden
                className="absolute top-0 left-0 w-[70%] h-[80%] pointer-events-none
                  bg-[radial-gradient(ellipse_80%_70%_at_20%_20%,rgba(47,73,232,0.15)_0%,transparent_70%)]
                  dark:bg-[radial-gradient(ellipse_80%_70%_at_20%_20%,rgba(47,73,232,0.3)_0%,transparent_70%)]"
              />
              {/* Giant stat */}
              <div className="font-clash font-bold text-[clamp(5rem,12vw,9rem)] leading-[0.9] tracking-[-0.04em] bg-gradient-to-br from-[#4162FF] via-[#2F49E8] to-[#1A32D4] bg-clip-text text-transparent mb-6 relative z-10">
                ₦0
              </div>
              <h3 className="font-clash font-bold text-xl text-slate-900 dark:text-white mb-2 relative z-10">
                Zero spend before results
              </h3>
              <p className="font-satoshi text-sm text-slate-600 dark:text-white/45 leading-[1.65] m-0 max-w-[340px] relative z-10">
                Not a single naira leaves your account until our system confirms real views from real people.
              </p>
            </div>

            {/* Card B — Automated verification */}
            <div className="relative bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-[20px] p-10 overflow-hidden min-h-[280px] flex flex-col justify-end shadow-sm dark:shadow-none">
              <div
                aria-hidden
                className="absolute inset-0 bg-[size:28px_28px] pointer-events-none
                  [background-image:radial-gradient(circle,rgba(0,0,0,0.04)_1px,transparent_1px)]
                  dark:[background-image:radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)]"
              />
              <svg
                aria-hidden
                width="120"
                height="120"
                viewBox="0 0 24 24"
                fill="none"
                className="absolute top-7 right-7 text-blue-500/10 dark:text-blue-500/20 pointer-events-none"
              >
                <path
                  d="M12 2L3 6.5v5C3 16.09 6.84 20.74 12 22c5.16-1.26 9-5.91 9-10.5v-5L12 2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="rgba(47,73,232,0.06)"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="rgba(47,73,232,0.5)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h3 className="font-clash font-bold text-xl text-slate-900 dark:text-white mb-2 relative z-10">
                Fully automated verification
              </h3>
              <p className="font-satoshi text-sm text-slate-600 dark:text-white/45 leading-[1.65] m-0 relative z-10">
                Every post URL is tracked continuously by our system — no human reviews, no disputes, no guesswork. Objective and instant.
              </p>
            </div>
          </div>

          {/* Row 2: 3 cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.1fr 1fr',
              gap: 16,
            }}
            className="bento-row-2"
          >
            {/* Card C — Instant refund */}
            <div className="relative bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-[20px] p-8 overflow-hidden min-h-[240px] flex flex-col justify-end shadow-sm dark:shadow-none">
              <div
                aria-hidden
                className="absolute inset-0 bg-[size:28px_28px] pointer-events-none
                  [background-image:radial-gradient(circle,rgba(0,0,0,0.04)_1px,transparent_1px)]
                  dark:[background-image:radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)]"
              />
              <svg
                aria-hidden
                width="72"
                height="72"
                viewBox="0 0 24 24"
                fill="none"
                className="absolute top-6 right-5 text-blue-500/10 dark:text-blue-500/15 pointer-events-none"
              >
                <path
                  d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M3 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="font-clash font-bold text-base text-slate-900 dark:text-white mb-2 relative z-10">
                Automatic refunds
              </h3>
              <p className="font-satoshi text-[0.8125rem] text-slate-600 dark:text-white/45 leading-[1.65] m-0 relative z-10">
                Unspent budget returns to your wallet the moment a campaign closes. Nothing is ever lost.
              </p>
            </div>

            {/* Card D — 10% fee (highlighted) */}
            <div className="relative bg-slate-50 dark:bg-[#0A0E1F] border border-[#2F49E8]/40 rounded-[20px] p-8 overflow-hidden min-h-[240px] flex flex-col justify-end shadow-sm dark:shadow-[0_0_40px_rgba(47,73,232,0.15)]">
              <div
                aria-hidden
                className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[120%] h-[120%] pointer-events-none
                  bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,rgba(47,73,232,0.18)_0%,transparent_65%)]
                  dark:bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,rgba(47,73,232,0.35)_0%,transparent_65%)]"
              />
              <div className="font-clash font-bold text-[clamp(3.5rem,8vw,6rem)] leading-[0.9] tracking-[-0.04em] bg-gradient-to-br from-[#4162FF] via-[#2F49E8] to-[#1A32D4] bg-clip-text text-transparent mb-5 relative z-10">
                10%
              </div>
              <h3 className="font-clash font-bold text-base text-slate-900 dark:text-white mb-2 relative z-10">
                Our entire fee. Nothing else.
              </h3>
              <p className="font-satoshi text-[0.8125rem] text-slate-600 dark:text-white/45 leading-[1.65] m-0 relative z-10">
                10% per verified payout. The rest goes directly to the creators delivering your results.
              </p>
            </div>

            {/* Card E — Real-time dashboard preview */}
            <div className="relative bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-[20px] overflow-hidden min-h-[260px] flex flex-col justify-between shadow-sm dark:shadow-none">
              <div className="relative w-full h-[140px] overflow-hidden border-b border-slate-200 dark:border-white/[0.07] bg-slate-900">
                <Image
                  src="/images/campaign-dashboard-mockup.png"
                  alt="Kpugi Campaign Management Dashboard"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'top left',
                  }}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-white dark:to-[#0E121E] pointer-events-none"
                />
              </div>

              <div className="p-5 pt-3 relative z-10">
                <h3 className="font-clash font-bold text-base text-slate-900 dark:text-white mb-1.5">
                  Live campaign dashboard
                </h3>
                <p className="font-satoshi text-[0.8125rem] text-slate-600 dark:text-white/45 leading-normal m-0">
                  Track views, creators, and remaining budget in real time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .bento-row-1, .bento-row-2 { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ─── PROTECTION & VERIFICATION INSIGHTS ────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto py-24 px-6">
        <div className="text-center mb-14">
          <h2 className="font-clash font-bold text-[clamp(2rem,4vw,3rem)] text-slate-900 dark:text-white mb-3 tracking-[-0.025em] leading-[1.1]">
            Your money stays yours until results arrive.
          </h2>
          <p className="font-satoshi text-base text-slate-600 dark:text-white/45 max-w-[620px] mx-auto leading-relaxed">
            Every impression is audited automatically before funds release. Complete real-time clarity on creator delivery, view velocity, and budget safety.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            alignItems: 'stretch',
          }}
        >
          {/* Card 1: Live Verification Stream */}
          <div className="bg-slate-50 dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-[32px] p-5 flex flex-col justify-between gap-6 shadow-sm dark:shadow-none">
            <div className="text-center pt-3 px-2">
              <h3 className="font-clash font-semibold text-xl text-slate-900 dark:text-white mb-2">
                Live verification stream
              </h3>
              <p className="font-satoshi text-sm text-slate-600 dark:text-white/45 leading-normal m-0">
                Track live impression events across creator links in real time as viewers engage with your content.
              </p>
            </div>

            <div className="bg-white dark:bg-[#07090F] border border-slate-200 dark:border-white/[0.06] rounded-3xl p-5 min-h-[340px] flex flex-col justify-between shadow-inner">
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-slate-600 dark:text-white/50 font-satoshi">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2F49E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 20h.01M7 20v-4M12 20v-8M17 20V4M22 20h.01" />
                  </svg>
                  Live views audited
                </span>
                <span className="text-[#17A75B] text-xs font-bold font-satoshi">
                  ● live sync
                </span>
              </div>

              <div className="flex justify-between items-end my-2">
                <div className="font-clash font-bold text-4xl text-slate-900 dark:text-white leading-none">
                  18,942
                </div>
                <div className="font-mono text-[#17A75B] text-sm font-bold">
                  +14% / hr
                </div>
              </div>

              {/* Bar visualization */}
              <div className="flex items-end gap-1.5 h-[90px] py-2">
                {[40, 65, 35, 80, 55, 95, 75].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`flex-1 rounded-md transition-all duration-300 ${
                      i === 5 ? 'bg-[#2F49E8]' : 'bg-[#2F49E8]/35 dark:bg-[#2F49E8]/45'
                    }`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] rounded-xl p-2.5">
                  <div className="text-[11px] text-slate-500 dark:text-white/40 font-satoshi mb-0.5">
                    Scrape latency
                  </div>
                  <div className="font-mono text-base font-semibold text-slate-900 dark:text-white">
                    0.8s
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] rounded-xl p-2.5">
                  <div className="text-[11px] text-slate-500 dark:text-white/40 font-satoshi mb-0.5">
                    Bot filter
                  </div>
                  <div className="font-mono text-base font-semibold text-[#17A75B]">
                    0.0% fraud
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Creator Reach Breakdown */}
          <div className="bg-slate-50 dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-[32px] p-5 flex flex-col justify-between gap-6 shadow-sm dark:shadow-none">
            <div className="text-center pt-3 px-2">
              <h3 className="font-clash font-semibold text-xl text-slate-900 dark:text-white mb-2">
                Channel distribution
              </h3>
              <p className="font-satoshi text-sm text-slate-600 dark:text-white/45 leading-normal m-0">
                Understand how different platforms perform and pinpoint which channels drive the highest retention.
              </p>
            </div>

            <div className="bg-white dark:bg-[#07090F] border border-slate-200 dark:border-white/[0.06] rounded-3xl p-5 min-h-[340px] flex flex-col justify-between shadow-inner">
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-slate-600 dark:text-white/50 font-satoshi">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2F49E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Active channels
                </span>
                <span className="text-slate-500 dark:text-white/40 text-xs font-satoshi">
                  6 platforms
                </span>
              </div>

              {/* Circular gauge */}
              <div className="flex justify-center items-center my-3">
                <div className="relative w-[100px] h-[100px] rounded-full border-8 border-[#2F49E8]/20 flex items-center justify-center">
                  <div className="absolute -inset-2 rounded-full border-8 border-[#2F49E8] border-t-transparent rotate-45" />
                  <span className="font-clash font-bold text-xl text-slate-900 dark:text-white">
                    78%
                  </span>
                </div>
              </div>

              {/* Segment breakdown */}
              <div className="flex flex-col gap-2">
                {[
                  { name: 'TikTok & Reels', value: 52 },
                  { name: 'YouTube Shorts', value: 30 },
                  { name: 'X & LinkedIn', value: 18 },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between items-center text-[0.8125rem] font-satoshi"
                  >
                    <span className="text-slate-500 dark:text-white/45">{item.name}</span>
                    <span className="text-slate-900 dark:text-white font-semibold font-mono">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Multi-color segment bar */}
              <div className="flex gap-1 h-1.5 mt-1">
                <div className="flex-[52] bg-[#2F49E8] rounded-full" />
                <div className="flex-[30] bg-[#2F49E8]/60 rounded-full" />
                <div className="flex-[18] bg-[#2F49E8]/25 rounded-full" />
              </div>
            </div>
          </div>

          {/* Card 3: Campaign Performance Score */}
          <div className="bg-slate-50 dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-[32px] p-5 flex flex-col justify-between gap-6 shadow-sm dark:shadow-none">
            <div className="text-center pt-3 px-2">
              <h3 className="font-clash font-semibold text-xl text-slate-900 dark:text-white mb-2">
                Campaign health score
              </h3>
              <p className="font-satoshi text-sm text-slate-600 dark:text-white/45 leading-normal m-0">
                Monitor aggregate delivery metrics with an automated score, revealing budget velocity and delivery safety.
              </p>
            </div>

            <div className="bg-white dark:bg-[#07090F] border border-slate-200 dark:border-white/[0.06] rounded-3xl p-5 min-h-[340px] flex flex-col justify-between shadow-inner">
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-slate-600 dark:text-white/50 font-satoshi">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2F49E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  Delivery index
                </span>
                <span className="bg-[#2F49E8]/10 dark:bg-[#2F49E8]/15 border border-[#2F49E8]/30 text-[#2F49E8] dark:text-[#5B7CFF] rounded-full px-2 py-0.5 text-[11px] font-bold font-satoshi">
                  +8.4%
                </span>
              </div>

              <div className="font-clash font-bold text-5xl text-slate-900 dark:text-white leading-none my-1">
                94<span className="text-xl text-slate-400 dark:text-white/35">/100</span>
              </div>

              {/* Metric progress bars */}
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'View verification rate', value: 98 },
                  { label: 'Audience authenticity', value: 95 },
                  { label: 'Budget efficiency', value: 89 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-white/45 font-satoshi mb-1">
                      <span>{item.label}</span>
                      <span className="font-mono text-slate-900 dark:text-white">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-white/[0.07] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.value}%` }}
                        className="h-full bg-gradient-to-r from-[#2F49E8] to-[#5B7CFF] rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-white/40 font-satoshi">
                  Delivery status
                </span>
                <span className="text-[#17A75B] font-bold text-[0.8125rem] font-satoshi">
                  Optimal
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS & CASE STUDIES ─────────────────────────────────────── */}
      <div id="testimonials">
        <BrandTestimonialsVertical reviews={reviews} />
      </div>

      {/* ─── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faqs" className="bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
        <div className="max-w-[740px] mx-auto py-20 px-6">
          <h2 className="font-clash font-bold text-[clamp(1.5rem,3vw,2.25rem)] text-slate-900 dark:text-white mb-2 tracking-[-0.02em]">
            Questions from brands
          </h2>
          <p className="text-[0.9375rem] text-slate-600 dark:text-white/40 mb-10 font-satoshi">
            Everything you need to know before your first campaign.
          </p>
          {faqs.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA SECTION ─────────────────────────────────────────────── */}
      <div id="cta">
        <BrandCTASection
          brands={brands.map((b: any) => ({
            company_name: b.company_name,
            avatar_url: b.profiles?.avatar_url ?? null,
          }))}
        />
      </div>
    </div>
    </>
  );
}
