'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Hero9, type Hero9Avatar } from '@/components/watermelon-ui/hero-9';
import { SlideDeck } from '@/components/watermelon-ui/slide-deck';
import { Integrations5 } from '@/components/watermelon-ui/integrations-5';
import { Features1 } from '@/components/watermelon-ui/features-1';
import { StickerWall } from '@/components/watermelon-ui/sticker-wall';
import { Faq6, type FaqItem } from '@/components/watermelon-ui/faq-6';
import PerformanceOverviewCTA from '@/components/marketing/PerformanceOverviewCTA';
import { ArrowRight, Sparkles, CheckCircle2, Shield, Zap, TrendingUp, ChevronDown, ChevronUp, Sliders } from 'lucide-react';
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
  FaFacebook,
  FaLinkedin,
} from 'react-icons/fa6';

export interface DbCreatorAvatar {
  src: string;
  alt: string;
}

export interface DbTickerItem {
  handle: string;
  amount: string;
  platform: string;
  views: string;
}

export interface DbLiveDrop {
  id: string;
  title: string;
  cpm: number;
  channels: string[];
  spotsLeft: number;
  badge: string;
  category: string;
}

export interface PlatformItem {
  id: string;
  name: string;
  format: string;
  rateRange: string;
  defaultCpm: number;
  color: string;
  gradient: string;
  bgLight: string;
  borderGlow: string;
  activeDrops: number;
  icon: React.ReactNode;
}

export interface CreatorsPageClientProps {
  realAvatars: DbCreatorAvatar[];
  tickerItems: DbTickerItem[];
  liveDrops: DbLiveDrop[];
  totalCreatorsCount: number;
  totalEarningsDisbursed: number;
  totalVerifiedViews: number;
  platforms: PlatformItem[];
}

export function CreatorsPageClient({
  realAvatars,
  tickerItems,
  liveDrops,
  totalCreatorsCount,
  totalEarningsDisbursed,
  totalVerifiedViews,
  platforms,
}: CreatorsPageClientProps) {
  // Calculator State
  const [views, setViews] = useState<number>(25000);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('instagram');
  const [customCpm, setCustomCpm] = useState<number>(2000);
  const selectedPlatform = platforms.find((p) => p.id === selectedPlatformId) || platforms[0];
  const effectiveCpm = customCpm || selectedPlatform.defaultCpm;

  // Calculation Math
  const grossEarnings = (views / 1000) * effectiveCpm;
  const platformFee = grossEarnings * 0.1;
  const netEarnings = grossEarnings - platformFee;

  const sliderPercent = ((views - 1000) / (500000 - 1000)) * 100;

  const eyebrow = totalCreatorsCount > 0
    ? `${totalCreatorsCount} Verified Creators on Kpugi`
    : 'Join Verified Creators on Kpugi';

  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      question: 'Do I need thousands of followers to join and earn?',
      answer: 'Zero follower minimum! No gatekeeping. Whether you have 200 followers or 200,000 followers, as long as your post gets at least 1,000 verified views, you get paid.',
    },
    {
      id: 'faq-2',
      question: 'When and how do payouts hit my bank account?',
      answer: 'Every single Friday! Once your live post hits the view count threshold and passes verification, your earnings are automatically sent every Friday directly to GTBank, Opay, Kuda, Zenith, Access, or any Nigerian bank account.',
    },
    {
      id: 'faq-3',
      question: 'How does Kpugi verify post views?',
      answer: 'We use automatic link verification that reads public views on TikTok, Instagram, YouTube, X, Facebook, and LinkedIn. No human reviews, no favoritism, no delays.',
    },
    {
      id: 'faq-4',
      question: 'What if my post falls short of 1,000 views?',
      answer: "If a post doesn't reach the 1,000 view milestone before the campaign window closes, no payout is triggered for that drop, and the reserved budget returns to the brand.",
    },
    {
      id: 'faq-5',
      question: 'Can I claim multiple campaign drops at the same time?',
      answer: '100% yes! You can claim slots in as many active brand campaigns as you like across all your connected social handles.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4FD] dark:bg-[#050811] text-slate-900 dark:text-white font-sans antialiased overflow-x-hidden">
      {/* ─── MODERN HERO SECTION (DYNAMIC METRICS & REAL AVATARS) ──────────── */}
      <Hero9
        showNav={false}
        logoText="Kpugi"
        avatars={realAvatars}
        eyebrowText={eyebrow}
        title={`Turn Every 1,000 Views\nInto Direct Cash.`}
        description={`Pick a brand campaign drop. Post on TikTok, Instagram, YouTube, X, or LinkedIn.\nWatch your verified views stack up and receive direct deposits into your Nigerian bank account every Friday.`}
        emailPlaceholder="Enter your email to start earning"
        submitText="Start for Free"
        formAction="/sign-up"
        ctaText="Browse Active Drops"
        ctaHref="/browse"
      />

      {/* ─── LIVE PAYOUT TICKER (FROM REAL DB SUBMISSIONS) ───────────────────── */}
      {tickerItems.length > 0 && (
        <section className="relative py-6 overflow-hidden bg-transparent">
          {/* Left & Right Edge Vignette Gradient Fades */}
          <div className="pointer-events-none absolute left-0 inset-y-0 w-24 sm:w-40 bg-gradient-to-r from-[#F0F4FD] dark:from-[#050811] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 inset-y-0 w-24 sm:w-40 bg-gradient-to-l from-[#F0F4FD] dark:from-[#050811] to-transparent z-10" />

          <div className="flex gap-6 w-max animate-ticker whitespace-nowrap">
            {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-md text-xs sm:text-sm transition-transform hover:scale-105 cursor-default"
              >
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.handle}</span>
                <span className="text-slate-500 dark:text-slate-400">earned</span>
                <span className="font-extrabold text-slate-900 dark:text-emerald-300 font-mono">{item.amount}</span>
                <span className="text-slate-400 dark:text-slate-500">• {item.platform}</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-200/80">({item.views})</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── FROSTED GLASS INTERACTIVE PAYOUT CALCULATOR ──────────────────────── */}
      <section id="calculator" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Radial Glowing Mesh behind the frosted glass */}
        <div className="pointer-events-none absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-emerald-500/20 via-sky-400/20 to-indigo-500/20 dark:from-emerald-500/15 dark:via-cyan-500/15 dark:to-violet-600/15 blur-[120px] rounded-full" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-emerald-400/15 dark:bg-emerald-500/10 blur-[100px] rounded-full" />

        {/* Section Header */}
        <div className="relative z-10 text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-xs backdrop-blur-md">
            <Zap className="size-3.5" /> Interactive Calculator
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
            Calculate Your Bag 💰
          </h2>
          <p className="font-sans mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Select your preferred platform and projected view count to calculate your exact estimated payout.
          </p>
        </div>

        {/* ─── MAIN FROSTED GLASS CONTAINER ──────────────────────────────────── */}
        <div className="relative z-10 overflow-hidden rounded-[32px] bg-white/60 dark:bg-[#070b16]/75 p-6 sm:p-10 lg:p-12 border border-white/80 dark:border-white/[0.12] shadow-[0_24px_80px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300">
          {/* Specular glass top highlight line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 dark:via-emerald-400/40 to-transparent"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Controls Column */}
            <div className="lg:col-span-7 space-y-8">
              {/* 1. Platform Selector with Official Brand Icons */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    1. Select Social Platform
                  </label>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ₦{effectiveCpm.toLocaleString()} CPM Base
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {platforms.map((p) => {
                    const isSelected = p.id === selectedPlatformId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlatformId(p.id);
                          setCustomCpm(p.defaultCpm);
                        }}
                        className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden ${
                          isSelected
                            ? 'bg-white/90 dark:bg-white/15 border-2 border-emerald-500 text-slate-950 dark:text-white shadow-[0_8px_25px_rgba(16,185,129,0.25)] scale-[1.03] backdrop-blur-xl'
                            : 'bg-white/40 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 backdrop-blur-md'
                        }`}
                      >
                        <div
                          className="size-8 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110"
                          style={{
                            color: isSelected ? p.color : undefined,
                            background: isSelected ? p.bgLight : 'transparent',
                          }}
                        >
                          {p.icon}
                        </div>
                        <span className="text-xs font-bold truncate max-w-full">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Projected Views Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    2. Projected Post Views
                  </label>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <span className="text-lg sm:text-xl font-black font-mono">
                      {views.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold">views</span>
                  </div>
                </div>

                {/* Custom Frosted Slider Track */}
                <div className="relative py-2">
                  <input
                    type="range"
                    min={1000}
                    max={500000}
                    step={1000}
                    value={views}
                    onChange={(e) => setViews(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #10B981 0%, #10B981 ${sliderPercent}%, rgba(148, 163, 184, 0.25) ${sliderPercent}%, rgba(148, 163, 184, 0.25) 100%)`,
                    }}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer border border-slate-300/60 dark:border-white/10 accent-emerald-500 transition-all shadow-inner focus:outline-none"
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold font-mono">
                  <span>1,000</span>
                  <span>50,000</span>
                  <span>150,000</span>
                  <span>300,000</span>
                  <span>500,000+</span>
                </div>
              </div>

              {/* Quick Presets Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Quick View Presets:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[5000, 15000, 50000, 100000, 250000, 500000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setViews(preset)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        views === preset
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-105'
                          : 'bg-white/50 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10'
                      }`}
                    >
                      {(preset / 1000).toFixed(0)}k views
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── FROSTED GLASS RESULTS CARD ────────────────────────────────── */}
            <div className="lg:col-span-5 relative overflow-hidden rounded-[26px] bg-white/80 dark:bg-[#0c1122]/90 p-7 sm:p-9 border border-emerald-500/35 shadow-[0_16px_50px_rgba(16,185,129,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl text-center flex flex-col justify-between">
              {/* Internal glow aura */}
              <div className="pointer-events-none absolute -top-20 -right-20 size-48 bg-emerald-500/20 blur-3xl rounded-full" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                  Estimated Payout
                </div>

                <div className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight my-3 drop-shadow-sm">
                  ₦{Math.round(netEarnings).toLocaleString()}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center justify-center gap-1.5">
                  <span>Based on ₦{effectiveCpm.toLocaleString()} CPM</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedPlatform.name}
                  </span>
                </p>

                {/* Line Item Fee Breakdown */}
                <div className="border-t border-slate-200/80 dark:border-white/10 pt-4 space-y-2.5 text-left text-sm mb-7">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Campaign Earnings:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      ₦{Math.round(grossEarnings).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Kpugi Platform Fee (10%):</span>
                    <span className="font-bold text-rose-500 font-mono">
                      -₦{Math.round(platformFee).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-100 dark:border-white/5 text-base">
                    <span>Payout:</span>
                    <span className="font-mono">₦{Math.round(netEarnings).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/sign-up"
                className="relative z-10 inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span>Start Creating</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CREATOR SUPERPOWERS / FEATURES (SLIDE DECK) ──────────────────── */}
      <div id="features">
        <SlideDeck
          badgeText="Creator Superpowers"
          title="Engineered for Creators. Zero Friction."
          description="Swipe through how Kpugi transforms short-form video views into predictable weekly earnings."
        />
      </div>

      {/* ─── NETWORKS & ECOSYSTEM MOSAIC (INTEGRATIONS5) ───────────────────── */}
      <div id="networks">
        <Integrations5
          badgeText="Supported Networks & Ecosystem"
          title="Every Social Network. Seamlessly Integrated."
          description="Distribute brand campaign drops across 6 major social networks with automatic view counting and direct Friday bank payouts."
        />
      </div>

      {/* ─── LIVE SAMPLE DROPS TEASER (REAL CAMPAIGNS FROM DB) ────────────────── */}
      {liveDrops.length > 0 && (
        <section id="drops" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                🔥 Live Opportunities
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
                Active Brand Drops
              </h2>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>View All Open Campaigns</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {liveDrops.map((drop) => (
              <div
                key={drop.id}
                className="flex flex-col justify-between p-6 rounded-3xl bg-white/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      {drop.badge}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{drop.category}</span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-950 dark:text-white mb-3 line-clamp-2">
                    {drop.title}
                  </h3>

                  <div className="flex gap-1.5 flex-wrap mb-6">
                    {drop.channels.map((c) => (
                      <span
                        key={c}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center py-3 border-t border-slate-100 dark:border-white/5 mb-4">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">CPM RATE</div>
                      <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        ₦{drop.cpm.toLocaleString()}
                        <span className="text-[10px] text-slate-400">/1k</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">SPOTS</div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {drop.spotsLeft} left
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/campaigns/${drop.id}`}
                    className="block w-full text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    Claim Slot Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 5 BENTO STEPS (FEATURES1) ────────────────────────────────────── */}
      <div id="steps">
        <Features1
          badgeText="Zero Hassle Workflow"
          title="Five Steps from Signup to Direct Pay 💸"
          description="How Kpugi eliminates traditional agency delays and guarantees direct bank payouts per 1,000 verified views."
        />
      </div>

      {/* ─── CREATOR HYPE & FEEDBACK WALL (STICKERWALL) ─────────────────────── */}
      <div id="community">
        <StickerWall
          badgeText="Creator Community Wall"
          title="Creator Wins & Hype Wall 💬"
          description="Drop a win, toss an emoji, or drag stickers around. Real physics, no limits. Leave your mark on the wall."
        />
      </div>

      {/* ─── FREQUENTLY ASKED QUESTIONS (FAQ6) ───────────────────────────────── */}
      <div id="faqs">
        <Faq6
          badge="Got Questions? We Got Answers"
          title={<>Frequently Asked Questions 💬</>}
          faqs={faqs}
        />
      </div>

      {/* ─── FINAL PERFORMANCE OVERVIEW CTA ──────────────────────────────────── */}
      <div id="cta">
      <PerformanceOverviewCTA
        title="Your Next Post Could Be Your Next"
        accentWord="Payday 💰"
        subtitle={
          totalCreatorsCount > 0
            ? `Join ${totalCreatorsCount}+ registered creators monetizing their social media pages and profiles across Nigeria. Free to join. Zero follower minimums.`
            : 'Join creators monetizing posts across Nigeria. Free to join. Zero follower minimums.'
        }
        ctaLabel="Start Creating for Free"
      />
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-ticker {
          animation: ticker-scroll 35s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

export default CreatorsPageClient;
