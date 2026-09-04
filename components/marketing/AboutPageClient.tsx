'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  Users,
  Building2,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Lock,
  Scale,
  FileText,
  HelpCircle,
  MapPin,
  Clock,
  Coins,
  Eye,
  Check,
  X,
  BookOpen,
  LifeBuoy,
} from 'lucide-react';
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
  FaFacebook,
  FaLinkedin,
} from 'react-icons/fa6';
import { FRESHDESK_LINKS } from '@/lib/support/freshdesk-constants';

interface RealPlatformStats {
  activeCreators: number;
  activeCampaigns: number;
  totalEarnings: number;
  totalViews: number;
}

interface AboutPageClientProps {
  realStats: RealPlatformStats;
}

export default function AboutPageClient({ realStats }: AboutPageClientProps) {
  const [activeTab, setActiveTab] = useState<'brands' | 'creators'>('brands');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Check if real database numbers are available and meaningful
  const hasRealActivity =
    realStats.activeCreators > 0 ||
    realStats.activeCampaigns > 0 ||
    realStats.totalEarnings > 0 ||
    realStats.totalViews > 0;

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const channels = [
    { name: 'TikTok', icon: FaTiktok, color: '#00F2FE' },
    { name: 'Instagram', icon: FaInstagram, color: '#E1306C' },
    { name: 'YouTube Shorts', icon: FaYoutube, color: '#FF0000' },
    { name: 'X (Twitter)', icon: FaXTwitter, color: '#FFFFFF' },
    { name: 'Facebook', icon: FaFacebook, color: '#1877F2' },
    { name: 'LinkedIn', icon: FaLinkedin, color: '#0A66C2' },
  ];

  const brandFaqs = [
    {
      q: 'How does Kpugi protect my brand budget from wasted ad spend?',
      a: 'Every campaign budget is pre-funded and held in automated Paystack escrow. Creators are only compensated when their public post clears the verified view threshold (minimum 1,000 authentic views). If a post fails verification, is deleted, or underperforms, reserved funds immediately unlock and return to your campaign pool or wallet.',
    },
    {
      q: 'How does Kpugi prevent bot views and artificial engagement?',
      a: 'Our proprietary verification scrapers audit post URLs directly at regular intervals. We track velocity spikes, view-to-engagement anomalies, account authenticity signals, and enforce a mandatory 72-hour retention window. Accounts suspected of bot manipulation face permanent platform ban and immediate forfeiture.',
    },
    {
      q: 'Do I have to negotiate with individual creators?',
      a: 'No. Kpugi completely removes the friction of manual negotiation. You set your campaign requirements, upload your creative brief, and specify your target CPM (e.g., ₦2,000 per 1,000 views). Eligible creators self-assess and distribute your creative programmatically.',
    },
    {
      q: 'Are Kpugi campaigns compliant with Nigerian advertising regulations (ARCON)?',
      a: 'Yes. All creators on Kpugi are required to include compliant commercial disclosure tags (#Ad, #Sponsored, #KpugiPartner) in adherence to the Advertising Regulatory Council of Nigeria (ARCON) guidelines.',
    },
  ];

  const creatorFaqs = [
    {
      q: 'Do I need thousands of followers to earn on Kpugi?',
      a: 'No! Kpugi has zero minimum follower requirements. Whether you have 500 or 500,000 followers, what matters is verified reach. As long as your post hits at least 1,000 authentic views within the campaign duration, you get paid.',
    },
    {
      q: 'What is the 1,000-view cliff, and how does it work?',
      a: 'The 1,000-view threshold is our baseline quality floor. Below 1,000 verified views, payouts are ₦0. Once you cross 1,000 views, you earn the full CPM rate based on the exact formula: (verified views / 1,000) × campaign CPM rate, minus our 10% platform fee.',
    },
    {
      q: 'When and how do creators receive payouts?',
      a: 'Payouts settle every Friday directly to your verified Nigerian commercial bank account via Paystack. There is no manual invoice submission or chasing brand representatives.',
    },
    {
      q: 'How do I prove I posted the brand creative?',
      a: 'After posting the approved creative to your connected social profile, copy the public post URL and paste it into the campaign dashboard to "clock in." Our automated crawlers take over from there to monitor your views.',
    },
  ];

  return (
    <div className="w-full text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ─── 1. HERO & MANIFESTO ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold tracking-wide shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400"></span>
            </span>
            <span>About Kpugi • Nigeria’s Verified Creator Performance Network</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display leading-[1.08] tracking-tight text-slate-900 dark:text-white">
            Where Verified Reach Meets{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              Guaranteed Payouts.
            </span>
          </h1>

          {/* Manifesto / Narrative */}
          <p className="text-slate-600 dark:text-slate-300 text-lg sm:text-xl sm:leading-relaxed max-w-3xl font-medium">
            Kpugi is an automated creator performance ad network and escrow protocol. 
            We replace manual influencer gatekeeping, vanity impressions, and delayed invoices with 
            programmatic proof, verified public view audits, and direct weekly bank settlements.
          </p>

          {/* Quick Audience Action Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/brands"
              className="px-6 py-3.5 rounded-full bg-[#2F49E8] hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center gap-2 group"
            >
              <Building2 className="size-4" />
              <span>For Brands & Advertisers</span>
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/creators"
              className="px-6 py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-sm shadow-md transition-all flex items-center gap-2 group"
            >
              <Users className="size-4" />
              <span>For Creators & Publishers</span>
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/browse"
              className="px-6 py-3.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-sm transition-all border border-slate-300/80 dark:border-white/10 flex items-center gap-2"
            >
              <Sparkles className="size-4 text-amber-500" />
              <span>Browse Live Drops</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 2. ARCHITECTURAL GUARANTEES & REAL TELEMETRY ────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden">
          {/* Subtle watermark badge */}
          <div className="absolute -top-6 -right-6 text-slate-900/[0.02] dark:text-white/[0.03] select-none pointer-events-none font-display font-black text-9xl">
            KPUGI
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                <ShieldCheck className="size-4" />
                <span>Protocol Standards & Platform Truth</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Built on Transparent, Non-Negotiable Rules
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Paystack Escrow Protected
              </span>
            </div>
          </div>

          {/* Architectural Pillars */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            
            {/* Metric 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Baseline Floor</span>
                <Eye className="size-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                1,000 <span className="text-base font-sans font-semibold text-slate-500 dark:text-slate-400">Views</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The strict verification cliff. Below 1k views, payout is ₦0. Ensures brands only pay for real traction.
              </p>
            </div>

            {/* Metric 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Capital Safety</span>
                <Lock className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                100% <span className="text-base font-sans font-semibold text-slate-500 dark:text-slate-400">Escrow</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Brand budgets are locked upfront in Paystack escrow. Creators know funds exist before posting.
              </p>
            </div>

            {/* Metric 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Settlement Cycle</span>
                <Clock className="size-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
                Every <span className="text-base font-sans font-semibold text-slate-500 dark:text-slate-400">Friday</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Direct bank payouts to creators every single Friday. Zero manual chasing or 90-day invoice delays.
              </p>
            </div>

            {/* Metric 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Platform Fee</span>
                <Coins className="size-4 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-amber-500">
                Flat 10%
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Deducted transparently upon successful payout release. No agency markups or hidden account maintenance fees.
              </p>
            </div>

          </div>

          {/* Conditional Real Database Stats Row (shown only if real data exists in Supabase) */}
          {hasRealActivity && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {realStats.activeCreators > 0 && (
                <div>
                  <div className="text-2xl font-mono font-extrabold text-blue-600 dark:text-blue-400">
                    {realStats.activeCreators.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Active Creators</div>
                </div>
              )}
              {realStats.activeCampaigns > 0 && (
                <div>
                  <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    {realStats.activeCampaigns.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Active Campaigns</div>
                </div>
              )}
              {realStats.totalViews > 0 && (
                <div>
                  <div className="text-2xl font-mono font-extrabold text-purple-600 dark:text-purple-400">
                    {realStats.totalViews.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Verified Views</div>
                </div>
              )}
              {realStats.totalEarnings > 0 && (
                <div>
                  <div className="text-2xl font-mono font-extrabold text-amber-500">
                    ₦{realStats.totalEarnings.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Creator Earnings Settled</div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── 3. THE DUAL-SIDED MARKETPLACE: COVERING BOTH SIDES OF USERS ───── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span>Two Sides. One Unified Protocol.</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            Designed for African Brands & Digital Creators Alike
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Traditional influencer marketing in Africa is broken for both sides. Kpugi solves the fundamental 
            asymmetry by aligning brand outcomes directly with creator rewards.
          </p>

          {/* Interactive Role Switcher Tab */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-white/10 border border-slate-300 dark:border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab('brands')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'brands'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="size-4" />
              <span>For Brands & Advertisers</span>
            </button>
            <button
              onClick={() => setActiveTab('creators')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'creators'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="size-4" />
              <span>For Creators & Publishers</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'brands' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* The Old Broken Way for Brands */}
            <div className="p-8 sm:p-10 rounded-3xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <X className="size-3.5" />
                  <span>The Agency & Legacy Way</span>
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  Paying Upfront with Zero Delivery Guarantees
                </h3>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <X className="size-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Massive Upfront Retainers:</strong> Handing over ₦500k–₦5M to agencies with no guarantee that target audiences will ever see the post.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="size-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Fake Screenshots & Bot Views:</strong> Influencer reports doctored with vanity metrics, purchased bot engagement, and zero accountability.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="size-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Manual Friction:</strong> Weeks wasted in back-and-forth email negotiations, contracts, and manual payment follow-ups.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-rose-200/60 dark:border-rose-900/40 text-xs font-medium text-rose-700 dark:text-rose-300">
                Result: High budget risk, wasted ad spend, and zero predictable customer acquisition.
              </div>
            </div>

            {/* The Kpugi Protocol for Brands */}
            <div className="p-8 sm:p-10 rounded-3xl bg-blue-50/50 dark:bg-[#0E1326] border border-blue-200 dark:border-blue-900/50 flex flex-col justify-between shadow-xl">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <Check className="size-3.5" />
                  <span>The Kpugi Automated Way</span>
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  Programmatic Creator Reach on Verified CPM
                </h3>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Escrow Budget Lock:</strong> Funds sit safely in Paystack escrow. If creators don’t hit verified thresholds, your money returns to your campaign pool.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Audited Views Only:</strong> Automated scrapers verify view counts and 72-hour public retention. You only pay for authentic reach.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Multi-Creator Swarm:</strong> Launch 1 brief and watch dozens or hundreds of verified creators amplify your brand simultaneously.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Link
                    href="/brands"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Launch as a Brand</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <a
                    href={FRESHDESK_LINKS.brandRules}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <span>Brand Rules & Standards</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                <Link
                  href="/roiestimator"
                  className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600"
                >
                  Estimate Campaign ROI →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* The Old Broken Way for Creators */}
            <div className="p-8 sm:p-10 rounded-3xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <X className="size-3.5" />
                  <span>The Legacy Creator Trap</span>
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  Endless Gatekeeping & Unpaid Invoices
                </h3>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <X className="size-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Agency Gatekeeping:</strong> Ignored unless you already have 100k+ followers or personal connections with agency middlemen.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="size-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>60–90 Day Payment Delays:</strong> Posting for brands and having to beg for your money months later, with some brands ghosting entirely.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="size-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Uncompensated Creative Energy:</strong> Spending hours pitching ideas without any assurance of being selected or fairly compensated.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-rose-200/60 dark:border-rose-900/40 text-xs font-medium text-rose-700 dark:text-rose-300">
                Result: Unpredictable income, financial stress, and lack of creative autonomy.
              </div>
            </div>

            {/* The Kpugi Protocol for Creators */}
            <div className="p-8 sm:p-10 rounded-3xl bg-emerald-50/50 dark:bg-[#071610] border border-emerald-200 dark:border-emerald-900/50 flex flex-col justify-between shadow-xl">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Check className="size-3.5" />
                  <span>The Kpugi Creator Protocol</span>
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  Zero Follower Minimums & Guaranteed Friday Payouts
                </h3>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Zero Minimum Follower Filter:</strong> Micro and nano creators can earn just like celebrities. Reach and authentic audience views are all that matter.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Escrow-Guaranteed Payouts:</strong> Every campaign is already funded before you post. Payouts automatically credit your bank on Friday.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Open Drop Catalogue:</strong> No pitches or waiting for brand approval. Open the app, grab a live drop that matches your audience, post, and clock in.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Link
                    href="/creators"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>Start Earning as Creator</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <a
                    href={FRESHDESK_LINKS.rules}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    <span>Creator Compliance Rules</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                <Link
                  href="/calculator"
                  className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                >
                  CPM Earnings Calculator →
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── 4. MULTI-PLATFORM DISTRIBUTION CHANNELS ───────────────────────── */}
      <section className="py-12 bg-slate-100/70 dark:bg-[#080A10] border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
            Supported Distribution Channels Across Nigeria
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {channels.map((ch, idx) => {
              const Icon = ch.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0E111C] border border-slate-200/80 dark:border-white/5 flex flex-col items-center justify-center gap-2 shadow-sm hover:border-blue-500/40 transition-colors"
                >
                  <Icon className="size-6 text-slate-800 dark:text-white" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{ch.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. THE KPUGI ENGINE: 4-STEP ESCROW & VERIFICATION PIPELINE ─────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span>The Mechanics</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            How Kpugi Automates Trust
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            A programmatic pipeline where funds, post audits, and payouts flow without human bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="relative p-7 rounded-3xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-lg flex items-center justify-center">
              01
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              Escrow Budget Lock
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Advertisers pre-fund campaigns in Naira via Paystack. Funds are locked securely in escrow, guaranteeing creators get paid upon verified completion.
            </p>
            <div className="pt-2">
              <Link href="/escrow-policy" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                <span>View Escrow Policy</span>
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-7 rounded-3xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-lg flex items-center justify-center">
              02
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              Open Claim & Clock-In
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Creators browse open briefs, self-assess audience match, post to their channel, and submit the live post link to clock in. Budget reservation occurs immediately.
            </p>
            <div className="pt-2">
              <Link href="/browse" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">
                <span>Browse Live Drops</span>
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-7 rounded-3xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold text-lg flex items-center justify-center">
              03
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              Automated Scraper Audit
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Public crawlers periodically check the URL, verifying authentic views, confirming the post stays live for 72+ hours, and auditing commercial disclosure tags.
            </p>
            <div className="pt-2">
              <a href={FRESHDESK_LINKS.rules} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1">
                <span>Audit & Verification Rules</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative p-7 rounded-3xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 font-mono font-bold text-lg flex items-center justify-center">
              04
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              Instant Friday Settlement
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Once verified ≥1k views, earnings are calculated automatically and transferred straight to creator Nigerian bank accounts every Friday via Paystack direct rails.
            </p>
            <div className="pt-2">
              <Link href="/payment-terms" className="text-xs font-bold text-amber-600 hover:underline inline-flex items-center gap-1">
                <span>Payment Settlement Terms</span>
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. OUR STORY ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-[#0B1026] to-[#05060A] text-white p-8 sm:p-12 lg:p-16 border border-white/10 relative overflow-hidden shadow-2xl">
          {/* Radial ambient light */}
          <div className="absolute -top-24 -right-24 size-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="size-3.5 text-blue-400" />
              <span>Our Story • The Kpugi Mission</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight mb-6">
              Engineering Trust in African Digital Creator Advertising.
            </h2>

            <div className="space-y-4 text-slate-300 text-sm sm:text-base sm:leading-relaxed">
              <p>
                Kpugi was built to solve a systemic problem in the creator economy. For years, Nigerian brands poured millions into opaque influencer retainers with no guarantee that real audiences would ever see the post. At the same time, hardworking creators drove massive cultural momentum only to chase unpaid invoices for 60 to 90 days—or get ghosted entirely.
              </p>
              <p>
                We built Kpugi as a fully remote, digital-first performance protocol connecting brands and verified creators across Nigeria. We operate with a distributed team, registered and originated out of Bonny Island, Rivers State.
              </p>
              <p>
                Our thesis is simple: <em>replace manual gatekeeping with automated escrow, public view verification, and guaranteed weekly bank payouts</em>. When brands only pay for verified views and creators are guaranteed payment the second their post verifies, everyone wins.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center gap-6">
              <a
                href="https://blog.kpugi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-md"
              >
                <BookOpen className="size-4 text-blue-600" />
                <span>Read our perspectives on the Kpugi Blog</span>
                <ExternalLink className="size-3 text-slate-500" />
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                <span>Get in touch with our team</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. OUR FOUR CORE VALUES ────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span>Our Principles</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            The Principles That Guide Us
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            We don’t believe in empty corporate platitudes. These are the operational commitments hardcoded into every line of Kpugi code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Value 1 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 space-y-4 shadow-sm hover:border-blue-500/30 transition-all">
            <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Eye className="size-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              1. Proof Over Promises
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Vanity follower counts and agency sales decks do not generate business value. We believe only audited, public, verified view delivery matters. If a view cannot be verified programmatically, it does not exist on Kpugi.
            </p>
          </div>

          {/* Value 2 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 space-y-4 shadow-sm hover:border-emerald-500/30 transition-all">
            <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Scale className="size-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              2. Mutual Escrow Liquidity
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              True fairness requires balanced security. Advertisers deserve to keep their capital until real delivery is verified. Creators deserve to know money is locked in escrow before spending a single second creating content.
            </p>
          </div>

          {/* Value 3 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 space-y-4 shadow-sm hover:border-purple-500/30 transition-all">
            <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="size-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              3. Radical Inclusivity
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              A student in Nsukka with 1,200 engaged TikTok followers who delivers 2,500 real views deserves the exact same respect, rate, and instant Friday payout as an established influencer in Lekki. Performance is the only benchmark.
            </p>
          </div>

          {/* Value 4 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 space-y-4 shadow-sm hover:border-amber-500/30 transition-all">
            <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Zap className="size-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              4. Engineering Integrity
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Financial infrastructure must be robust. We invest relentlessly in low-latency scraper crons, anti-fraud telemetry, automated Paystack webhooks, and sub-second database transactions to ensure zero lost funds and 99.9% uptime.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 8. REGULATORY & INSTITUTIONAL COMPLIANCE ──────────────────────── */}
      <section className="py-16 bg-slate-50 dark:bg-[#08090D] border-y border-slate-200/80 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Institutional Governance</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
                Security, Privacy & Regulatory Compliance
              </h2>
            </div>
            <a
              href={FRESHDESK_LINKS.knowledgeBase}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold hover:text-blue-600 transition-colors shrink-0"
            >
              <LifeBuoy className="size-4" />
              <span>Explore Help Center Solutions</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ARCON */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0E111C] border border-slate-200/80 dark:border-white/5 space-y-3">
              <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText className="size-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ARCON Standards Compliance
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Full adherence to the Advertising Regulatory Council of Nigeria standards. All creator placements enforce mandatory commercial disclosure tags (#Ad, #Sponsored).
              </p>
              <a
                href={FRESHDESK_LINKS.brandRules}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Read Advertising Guidelines</span>
                <ExternalLink className="size-3" />
              </a>
            </div>

            {/* NDPR */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0E111C] border border-slate-200/80 dark:border-white/5 space-y-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                NDPR Data Protection
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                User accounts, identity verification data, and bank details are strictly protected under the Nigeria Data Protection Regulation (NDPR) with enterprise SSL/TLS encryption.
              </p>
              <Link
                href="/privacy"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Read Privacy Policy</span>
                <ChevronRight className="size-3" />
              </Link>
            </div>

            {/* Corporate & Paystack */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0E111C] border border-slate-200/80 dark:border-white/5 space-y-3">
              <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Lock className="size-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                PCI-DSS Escrow Banking
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                All payment processing, card transactions, and bank payouts are powered by Paystack (a Stripe company) with certified PCI-DSS Level 1 security standards.
              </p>
              <Link
                href="/terms"
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Read Terms of Service</span>
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. FREQUENTLY ASKED QUESTIONS (DUAL AUDIENCE) ─────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="size-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Everything you need to know about navigating Kpugi as an advertiser or creator.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            Brand & Advertiser Inquiries
          </div>
          {brandFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`size-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-90 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}

          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 pt-6 mb-2">
            Creator & Publisher Inquiries
          </div>
          {creatorFaqs.map((faq, idx) => {
            const adjustedIdx = idx + brandFaqs.length;
            const isOpen = openFaqIndex === adjustedIdx;
            return (
              <div
                key={adjustedIdx}
                className="rounded-2xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(adjustedIdx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`size-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-90 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-blue-50/50 dark:bg-white/[0.02] border border-blue-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Have a more specific question?</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">Our support desk is available 24/7 for account, billing, and technical inquiries.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={FRESHDESK_LINKS.submitTicket}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
            >
              Open a Support Ticket
            </a>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-xs hover:bg-slate-300 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 10. DUAL CALL-TO-ACTION (CTA) ─────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand CTA */}
          <div className="p-8 sm:p-12 rounded-[2rem] bg-[#2F49E8] text-white flex flex-col justify-between space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 size-64 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider">
                <Building2 className="size-3.5" />
                <span>Ready to Grow?</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
                Stop Guessing. Pay Only for Real Verified Views.
              </h3>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                Launch a targeted campaign across TikTok, Instagram, and YouTube. Deposit your budget safely into Paystack escrow and watch vetted Nigerian creators drive quantifiable reach.
              </p>
            </div>
            <div className="relative z-10 pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/brands"
                className="px-6 py-3.5 rounded-full bg-white text-[#2F49E8] font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2"
              >
                <span>Launch a Brand Campaign</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/roiestimator"
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/15"
              >
                Estimate ROI
              </Link>
            </div>
          </div>

          {/* Creator CTA */}
          <div className="p-8 sm:p-12 rounded-[2rem] bg-slate-900 dark:bg-[#0E111A] text-white border border-slate-800 dark:border-white/10 flex flex-col justify-between space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 size-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Users className="size-3.5" />
                <span>Ready to Earn?</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
                Turn Your Views into Guaranteed Friday Bank Payouts.
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                No follower gates. No pitching agencies. Pick up active brand drops, post to your audience, clock in your link, and receive your cash every Friday.
              </p>
            </div>
            <div className="relative z-10 pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/creators"
                className="px-6 py-3.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 transition-all shadow-lg flex items-center gap-2"
              >
                <span>Join as a Creator</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/browse"
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/15"
              >
                Browse Live Drops
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
