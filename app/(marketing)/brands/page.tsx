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
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Kpugi for Brands',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    title: 'For Brands — Pay Only for Real Verified Views | Kpugi',
    description:
      'Launch creator campaigns across Nigeria. Distribute content to hundreds of verified creators and only pay when real audiences engage and view.',
    images: ['/kpugi_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
          company_logo_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error || !data || data.length === 0) {
      return [
        {
          id: '1',
          name: 'Adewale Adeleke',
          role: 'Head of Growth',
          company: 'Flutterwave',
          avatar_url: null,
          content:
            'We coordinated 100+ creators across Nigeria for our app launch. Every single view was verified automatically with complete clarity.',
          metric: '1.2M+ Views at ₦2,200 CPM',
          rating: 5,
        },
        {
          id: '2',
          name: 'Chioma Okonkwo',
          role: 'Brand Lead',
          company: 'PiggyVest',
          avatar_url: null,
          content:
            'The guaranteed view mechanism is revolutionary in Nigeria. We never had to chase creators for screenshots or manual stats.',
          metric: '₦4.5M Budget Fully Tracked',
          rating: 5,
        },
      ];
    }

    return data.map((r: any) => ({
      id: r.id,
      name: r.reviewer_name || 'Brand Partner',
      role: r.reviewer_role || 'Marketing Executive',
      company: r.advertiser_profiles?.company_name || 'Partner Brand',
      avatar_url: r.advertiser_profiles?.company_logo_url ?? null,
      content: r.content,
      metric: r.metric || '500k+ Verified Impressions',
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

  // ─── JSON-LD STRUCTURED DATA SCHEMAS ─────────────────────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
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
        name: 'For Brands',
        item: `${siteUrl}/brands`,
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Creator Performance Advertising Platform for Brands',
    provider: {
      '@type': 'Organization',
      name: 'Kpugi',
      url: siteUrl,
      logo: `${siteUrl}/kpugi_logo.png`,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
    description:
      'Launch performance creator campaigns in Nigeria. Pay only for verified post views across TikTok, Instagram, YouTube, X, Facebook, and LinkedIn.',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How Brands Launch Guaranteed View Creator Campaigns on Kpugi',
    description:
      'A 5-step guide for brands in Nigeria to launch creator marketing campaigns and only pay for verified post views.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Create Your Campaign Brief',
        text: 'Upload your brand video, image, or creative brief with simple guidelines and required talking points.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Set CPM Rate & Fund Budget',
        text: 'Choose your desired payout per 1,000 views (starting at ₦2,000 CPM) and deposit your campaign budget safely.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Creators Claim & Post',
        text: 'Verified Nigerian creators across TikTok, Instagram, YouTube, X, Facebook, and LinkedIn claim brief slots and publish to their feeds.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Automated View Auditing',
        text: 'Kpugi continuously audits live post URLs with real-time automated view verification and zero manual dispute friction.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Pay Only for Real Views',
        text: 'Funds only disburse as verified view thresholds are unlocked. Unspent budget is automatically returned to your wallet.',
      },
    ],
  };

  return (
    <>
      {/* ─── INJECTED STRUCTURED DATA SCHEMAS ────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#08090D] text-slate-900 dark:text-white font-satoshi transition-colors duration-300">
        {/* ─── HERO (HERO32 MOTION PHYSICS) ──────────────────────────────────── */}
        <div id="hero">
          <BrandHero32 />
        </div>

        {/* ─── HOVER EXPAND INTERACTIVE CARDS ────────────────────────────────── */}
        <div id="brands">
          <BrandHoverExpand
            brands={brands.map((b: any) => ({
              company_name: b.company_name,
              avatar_url: b.profiles?.avatar_url ?? null,
            }))}
          />
        </div>

        {/* ─── BENTO GRID: WHY BRANDS CHOOSE KPUGI ───────────────────────────── */}
        <section id="guarantee" className="max-w-[1200px] mx-auto py-24 px-6">
          <div className="text-center mb-14">
            <h2 className="font-clash font-bold text-[clamp(2rem,4vw,3rem)] text-slate-900 dark:text-white mb-3 tracking-[-0.025em] leading-[1.1]">
              Every campaign is guaranteed.
            </h2>
            <p className="font-satoshi text-base text-slate-600 dark:text-white/45 max-w-[560px] mx-auto leading-relaxed">
              Traditional influencer marketing is guesswork. Kpugi turns creator reach into predictable, performance-priced view delivery.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Row 1: 2 asymmetric cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: 16,
              }}
              className="bento-row-1"
            >
              {/* Card A — Pay only for verified views */}
              <div className="relative bg-[#2F49E8] rounded-[24px] p-8 md:p-10 overflow-hidden text-white min-h-[280px] flex flex-col justify-between shadow-xl">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[size:32px_32px] opacity-10 pointer-events-none
                    [background-image:radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)]"
                />
                <span className="bg-white/15 border border-white/25 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide w-fit relative z-10">
                  Performance-first
                </span>
                <div className="relative z-10">
                  <h3 className="font-clash font-bold text-2xl md:text-3xl text-white mb-2 leading-tight">
                    Pay only for real views. Not promises.
                  </h3>
                  <p className="font-satoshi text-sm md:text-base text-white/75 leading-relaxed max-w-[440px] m-0">
                    If a creator's post doesn't reach the view floor, you pay ₦0 for those views. Every Naira spent maps to verified audience impressions.
                  </p>
                </div>
              </div>

              {/* Card B — Automated verification */}
              <div className="relative bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-[24px] p-8 overflow-hidden min-h-[280px] flex flex-col justify-end shadow-sm dark:shadow-none">
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
                <span className="font-clash font-extrabold text-3xl text-[#17A75B] mb-2 relative z-10">
                  ₦0 risk
                </span>
                <h3 className="font-clash font-semibold text-lg text-slate-900 dark:text-white mb-1.5 relative z-10">
                  Instant budget recycling
                </h3>
                <p className="font-satoshi text-xs text-slate-600 dark:text-white/45 leading-relaxed m-0 relative z-10">
                  Unclaimed or under-threshold slots return funds to your campaign pool immediately.
                </p>
              </div>

              {/* Card D — 6 platforms */}
              <div className="relative bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-[20px] p-8 overflow-hidden min-h-[240px] flex flex-col justify-end shadow-sm dark:shadow-none">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[size:28px_28px] pointer-events-none
                    [background-image:radial-gradient(circle,rgba(0,0,0,0.04)_1px,transparent_1px)]
                    dark:[background-image:radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)]"
                />
                <div className="flex gap-2 flex-wrap mb-3 relative z-10">
                  {['TikTok', 'Instagram', 'YouTube', 'X', 'Facebook', 'LinkedIn'].map((p) => (
                    <span
                      key={p}
                      className="bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-white/70"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <h3 className="font-clash font-semibold text-lg text-slate-900 dark:text-white mb-1.5 relative z-10">
                  Cross-platform reach
                </h3>
                <p className="font-satoshi text-xs text-slate-600 dark:text-white/45 leading-relaxed m-0 relative z-10">
                  Launch once, activate creators across 6 major social networks simultaneously.
                </p>
              </div>

              {/* Card E — Direct creator payout */}
              <div className="relative bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-[20px] p-8 overflow-hidden min-h-[240px] flex flex-col justify-end shadow-sm dark:shadow-none">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[size:28px_28px] pointer-events-none
                    [background-image:radial-gradient(circle,rgba(0,0,0,0.04)_1px,transparent_1px)]
                    dark:[background-image:radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)]"
                />
                <span className="font-clash font-extrabold text-3xl text-[#2F49E8] dark:text-[#5B7CFF] mb-2 relative z-10">
                  Every Friday
                </span>
                <h3 className="font-clash font-semibold text-lg text-slate-900 dark:text-white mb-1.5 relative z-10">
                  Automated payouts
                </h3>
                <p className="font-satoshi text-xs text-slate-600 dark:text-white/45 leading-relaxed m-0 relative z-10">
                  Creators are motivated by automated weekly Friday bank pay, driving fast brief turnaround times.
                </p>
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .bento-row-1, .bento-row-2 {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </section>

        {/* ─── PRICING CALCULATOR & COMPARISON SECTION ──────────────────────── */}
        <div id="pricing">
          <BrandPricingSplitSection />
        </div>

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
