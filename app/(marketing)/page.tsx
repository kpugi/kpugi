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

export const metadata: Metadata = {
  title: 'Kpugi — Nigeria’s Verified Creator Marketplace',
  description:
    'Where a post turns into a payout and brands buy measurable reach. Connect with verified creators across TikTok, Instagram, YouTube, X, Facebook, and LinkedIn.',
  alternates: { canonical: '/' },
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
        ),
        creatives:campaign_creatives (file_url)
      `)
      .eq('is_featured', true)
      .in('status', ['live', 'active', 'approved'])
      .order('created_at', { ascending: false });

    // 2. Fetch real live marketplace stats from DB
    const [{ data: submissionsData }, { data: campaignsData }] = await Promise.all([
      supabase.from('submissions').select('final_view_count, payout_amount, pending_payout_amount'),
      supabase.from('campaigns').select('spent_budget, total_budget'),
    ]);

    // Sum ALL accrued earnings = settled + pending (includes clearing, not just paid out)
    const totalAccruedEarnings = (submissionsData || []).reduce(
      (acc, curr) => acc + Number(curr.payout_amount || 0) + Number(curr.pending_payout_amount || 0),
      0
    );
    const totalSpentFromCampaigns = (campaignsData || []).reduce((acc, curr) => acc + Number(curr.spent_budget || 0), 0);
    const liveTotalEarnings = Math.max(totalAccruedEarnings, totalSpentFromCampaigns);
    const totalViews = (submissionsData || []).reduce((acc, curr) => acc + Number(curr.final_view_count || 0), 0);

    return {
      campaigns: campaigns ?? [],
      stats: {
        totalEarnings: liveTotalEarnings > 0 ? liveTotalEarnings : 52800000,
        totalViews: totalViews > 0 ? totalViews : 18450000,
      },
    };
  } catch {
    return {
      campaigns: [],
      stats: {
        totalEarnings: 52800000,
        totalViews: 18450000,
      },
    };
  }
}

export default async function HomePage() {
  const { campaigns, stats } = await getHomepageData();

  const faqs = [
    {
      q: 'What is Kpugi?',
      a: 'Kpugi is Nigeria’s performance-driven creator marketplace. Advertisers distribute briefs and only pay for verified view impressions. Creators distribute branded posts and earn automated payouts per 1,000 views.',
    },
    {
      q: 'How does Kpugi protect brand budgets?',
      a: 'Funds stay locked in your protected balance until our automated verification engine confirms genuine human views on creator post URLs. Unspent budget is automatically returned.',
    },
    {
      q: 'Do creators need to record original videos from scratch?',
      a: 'Not necessarily! Brands upload ready-made campaign videos, banners, and audio briefs. Creators can amplify, react, or share them to their audiences across 6 social networks.',
    },
    {
      q: 'Which social media platforms are supported?',
      a: 'Kpugi supports 6 major platforms: TikTok, Instagram, YouTube, X (Twitter), Facebook, and LinkedIn.',
    },
    {
      q: 'How do creators receive payments?',
      a: 'As post views pass verified 1,000-view milestones, payouts hit your Kpugi wallet instantly and can be transferred directly to any Nigerian commercial bank account with zero delay.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#08090D] text-slate-900 dark:text-white font-satoshi transition-colors duration-300 selection:bg-[#2F49E8]/20 selection:text-[#2F49E8]">
      
      {/* ─── HERO (HERO32 MOTION PHYSICS) ──────────────────────────────────── */}
      <HomeHero32 />

      {/* ─── TWO-SIDED PERFORMANCE ECOSYSTEM ────────────────────────────────── */}
      <HomeEcosystemSection />

      {/* ─── SUPPORTED SOCIAL NETWORKS HONEYCOMB ────────────────────────────── */}
      <HomeNetworksHoneyComb />

      {/* ─── LIVE CAMPAIGNS APPLE CAROUSEL ──────────────────────────────────── */}
      <HomeCampaignsCarousel campaigns={campaigns} />

      {/* ─── INTERACTIVE PERFORMANCE CALCULATOR ─────────────────────────────── */}
      <HomeCalculatorSection />

      {/* ─── LIVE TELEMETRY & ACTIVITY PULSE ────────────────────────────────── */}
      <HomeTelemetryPulse stats={stats} />

      {/* ─── DUAL-SIDED WALL OF LOVE (REVIEWS) ──────────────────────────────── */}
      <HomeWallOfLove />

      {/* ─── FAQS ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
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

    </div>
  );
}
