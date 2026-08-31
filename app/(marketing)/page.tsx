import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createAdminClient } from '@/lib/supabase/server';
import HomeHero32 from '@/components/marketing/HomeHero32';
import HomeEcosystemSection from '@/components/marketing/HomeEcosystemSection';
import HomeNetworksHoneyComb from '@/components/marketing/HomeNetworksHoneyComb';
import HomeCampaignsCarousel from '@/components/marketing/HomeCampaignsCarousel';
import HomeCalculatorSection from '@/components/marketing/HomeCalculatorSection';
import HomeTelemetryPulse from '@/components/marketing/HomeTelemetryPulse';
import HomeWallOfLove from '@/components/marketing/HomeWallOfLove';
import PerformanceOverviewCTA from '@/components/marketing/PerformanceOverviewCTA';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Activity,
  Users,
  Building2,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { formatCompactCurrency } from '@/lib/utils/format';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    absolute: 'Kpugi — Nigeria’s Verified Creator Marketplace',
  },
  description:
    'Where posts turn into payouts and brands buy verified reach. Connect with creators across TikTok, Instagram, YouTube, X, Facebook & LinkedIn.',
  keywords: [
    'Kpugi',
    'creator marketplace Nigeria',
    'influencer marketing Nigeria',
    'get paid to post',
    'performance ad network Nigeria',
    'verified creators Nigeria',
    'TikTok creator network Nigeria',
    'Instagram influencer marketing Nigeria',
    'WhatsApp status monetization Nigeria',
    'CPM advertising Nigeria',
    'brand creator collaboration',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: siteUrl,
    siteName: 'Kpugi',
    title: 'Kpugi — Nigeria’s Verified Creator Marketplace',
    description:
      'Where posts turn into payouts and brands buy verified reach. Connect with creators across TikTok, Instagram, YouTube, X, Facebook & LinkedIn.',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Kpugi Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    title: 'Kpugi — Nigeria’s Verified Creator Marketplace',
    description:
      'Where posts turn into payouts and brands buy verified reach. Connect with creators across TikTok, Instagram, YouTube, X, Facebook & LinkedIn.',
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

// ─── Data fetchers ───────────────────────────────────────────────────────────
async function getHomepageData() {
  try {
    const supabase = createAdminClient();
    
    // 1. Fetch only REAL FEATURED campaigns from the DB
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        description,
        ad_format,
        requirements,
        cpm_rate,
        total_budget,
        spent_budget,
        min_view_threshold,
        status,
        channels,
        cover_image_url,
        is_featured,
        advertiser:advertiser_profiles (
          company_name,
          industry,
          company_logo_url,
          profile:profiles (avatar_url)
        )
      `)
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6);

    // 2. Fetch REAL platform telemetry stats
    const [creatorsCount, campaignsCount, submissions] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'creator'),
      supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('submissions').select('final_view_count, payout_amount, status'),
    ]);

    const totalViews = (submissions.data || []).reduce(
      (acc, s) => acc + (Number(s.final_view_count) || 0),
      0
    );

    const totalEarnings = (submissions.data || []).reduce(
      (acc, s) => acc + (Number(s.payout_amount) || 0),
      0
    );

    return {
      campaigns: campaigns || [],
      stats: {
        activeCreators: creatorsCount.count || 0,
        activeCampaigns: campaignsCount.count || 0,
        totalEarnings: totalEarnings,
        totalViews: totalViews,
      },
    };
  } catch (error) {
    console.error('Error loading homepage live data:', error);
    return {
      campaigns: [],
      stats: {
        activeCreators: 0,
        activeCampaigns: 0,
        totalEarnings: 0,
        totalViews: 0,
      },
    };
  }
}

export default async function HomePage() {
  const { campaigns, stats } = await getHomepageData();

  const faqs = [
    {
      q: 'What is Kpugi?',
      a: 'Kpugi is Nigeria’s performance-driven creator marketplace. Advertisers distribute briefs and only pay for verified views. Creators distribute branded posts and earn automated payouts per 1,000 views.',
    },
    {
      q: 'How does Kpugi protect brand budgets?',
      a: 'Funds stay locked in your protected balance until our automated verification engine confirms genuine views on creator post URLs. Unspent budget is automatically returned.',
    },
    {
      q: 'Do creators need to record original videos from scratch?',
      a: 'Not necessarily! Brands upload ready-made campaign assets, banners, and audio briefs. Creators can amplify, react, or share them to their audiences across 6 social networks.',
    },
    {
      q: 'Which social media platforms are supported?',
      a: 'Kpugi supports 6 major platforms: TikTok, Instagram, YouTube, X (Twitter), Facebook, and LinkedIn.',
    },
    {
      q: 'How do creators receive payments?',
      a: 'As post views pass verified 1,000-view milestones, payouts hit your Kpugi wallet and transfer directly to any Nigerian commercial bank account every Friday.',
    },
  ];

  // ─── JSON-LD STRUCTURED DATA SCHEMAS ─────────────────────────────────────
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kpugi',
    url: siteUrl,
    description:
      'Where posts turn into payouts and brands buy verified reach. Nigeria’s verified creator performance marketplace.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/browse?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kpugi',
    url: siteUrl,
    logo: `${siteUrl}/kpugi_logo.png`,
    sameAs: [
      'https://x.com/Kpugi_hq',
      'https://instagram.com/Kpugi_hq',
      'https://facebook.com/Kpugi_hq',
      'https://linkedin.com/company/Kpugi_hq',
      'https://youtube.com/@Kpugi_hq',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@kpugi.com',
      availableLanguage: ['en'],
    },
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

  return (
    <>
      {/* ─── INJECTED STRUCTURED DATA SCHEMAS ────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#08090D] text-slate-900 dark:text-white font-satoshi transition-colors duration-300 selection:bg-[#2F49E8]/20 selection:text-[#2F49E8]">
        
        {/* ─── HERO (HERO32 MOTION PHYSICS) ──────────────────────────────────── */}
        <div id="hero">
          <HomeHero32 />
        </div>

        {/* ─── TWO-SIDED PERFORMANCE ECOSYSTEM ────────────────────────────────── */}
        <div id="ecosystem">
          <HomeEcosystemSection />
        </div>

        {/* ─── SUPPORTED SOCIAL NETWORKS HONEYCOMB ────────────────────────────── */}
        <div id="networks">
          <HomeNetworksHoneyComb />
        </div>

        {/* ─── LIVE CAMPAIGNS APPLE CAROUSEL ──────────────────────────────────── */}
        <div id="campaigns">
          <HomeCampaignsCarousel campaigns={campaigns} />
        </div>

        {/* ─── INTERACTIVE PERFORMANCE CALCULATOR ─────────────────────────────── */}
        <div id="calculator">
          <HomeCalculatorSection />
        </div>

        {/* ─── LIVE TELEMETRY & ACTIVITY PULSE ────────────────────────────────── */}
        <div id="telemetry">
          <HomeTelemetryPulse stats={stats} />
        </div>

        {/* ─── DUAL-SIDED WALL OF LOVE (REVIEWS) ──────────────────────────────── */}
        <div id="reviews">
          <HomeWallOfLove />
        </div>

        {/* ─── FAQS ───────────────────────────────────────────────────────────── */}
        <section id="faqs" className="py-24 px-6 bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
          <div className="max-w-[740px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-clash font-bold text-[clamp(1.75rem,3.5vw,2.5rem)] text-slate-900 dark:text-white mb-2 tracking-[-0.02em]">
                Frequently asked questions
              </h2>
              <p className="text-[0.9375rem] text-slate-600 dark:text-white/40 font-satoshi">
                Everything you need to know about navigating Kpugi.
              </p>
            </div>

            <div className="space-y-2">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="border-b border-slate-200 dark:border-white/10 p-0 group bg-white dark:bg-[#0E121E] rounded-xl px-5 mb-3 border"
                >
                  <summary className="font-satoshi font-semibold text-[0.9375rem] text-slate-900 dark:text-white cursor-pointer py-4 list-none flex justify-between items-center transition-colors">
                    {f.q}
                    <span aria-hidden className="text-slate-400 dark:text-white/30 text-lg flex-shrink-0 ml-4 group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="font-satoshi text-sm text-slate-600 dark:text-white/50 leading-[1.65] pb-4 m-0">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PERFORMANCE OVERVIEW CTA ───────────────────────────────────────── */}
        <div id="cta">
          <PerformanceOverviewCTA />
        </div>

      </div>
    </>
  );
}
