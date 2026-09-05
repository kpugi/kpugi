'use client';

import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, ArrowRight, TrendingUp, FileText } from 'lucide-react';
import Link from 'next/link';
import { MediaPlanModal, type MediaPlanData } from '@/components/marketing/MediaPlanModal';

export type BrandCampaignType = 'ready_creative' | 'video_creative' | 'omnichannel';

interface BrandRoiCalculatorProps {
  id?: string;
  className?: string;
}

export default function BrandRoiCalculator({
  id = 'brand-roi-calculator-section',
  className = '',
}: BrandRoiCalculatorProps) {
  const { toast } = useToast();

  // State
  const [campaignType, setCampaignType] = useState<BrandCampaignType>('ready_creative');
  const [budgetM, setBudgetM] = useState<number>(2.5); // ₦2.5 Million default
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [copied, setCopied] = useState<boolean>(false);
  const [isMediaPlanOpen, setIsMediaPlanOpen] = useState<boolean>(false);

  // Conversion rate: ₦1,500 = $1 USD for reference
  const exchangeRate = 1500;

  // Actual budget in NGN
  const budgetNgn = Math.round(budgetM * 1000000);

  // Kpugi CPM benchmark (₦2,000 per 1k verified views for ready flyers, ₦3,500 for official videos, ₦5,000 for omnichannel)
  const baseCpm = campaignType === 'ready_creative' ? 2000 : campaignType === 'video_creative' ? 3500 : 5000;
  
  // Guaranteed views delivered on Kpugi
  const guaranteedViews = Math.round((budgetNgn / baseCpm) * 1000);
  const estimatedCreators = Math.max(5, Math.round(budgetNgn / 65000));

  // Views delivered by competitors for the same budget:
  // Typical Agency: 40%+ retainer markup, expensive overhead, delivering ~35% of the verified reach
  const agencyEstimatedViews = Math.round((guaranteedViews * 0.35) / 1000) * 1000;

  // Direct Manual Outreach: creator ghosting, high bot inflation, delivering ~58% of authentic reach
  const manualOutreachViews = Math.round((guaranteedViews * 0.58) / 1000) * 1000;

  const formatPrice = (amountNgn: number): string => {
    if (currency === 'USD') {
      const usd = Math.round(amountNgn / exchangeRate);
      return `$${usd.toLocaleString()}`;
    }
    return `₦${amountNgn.toLocaleString()}`;
  };

  const handleCopyEstimate = () => {
    const typeLabel =
      campaignType === 'ready_creative'
        ? 'Brand Flyer & Graphic Drop (Upload & Syndicate)'
        : campaignType === 'video_creative'
        ? 'Official Brand Video Drops (Upload & Syndicate)'
        : 'Full 360° Omnichannel Syndicate';

    const summary = `Kpugi Brand Campaign Reach Comparison:
• Drop Type: ${typeLabel}
• Campaign Budget: ${formatPrice(budgetNgn)}
• Guaranteed Verified Views with Kpugi: ${guaranteedViews.toLocaleString()} views
• Creators Activated: ~${estimatedCreators} creators
• Quality Safeguards: AI Bot Filtering + 100% Escrow Protection
-------------------------
• Typical Agency Delivery: ~${agencyEstimatedViews.toLocaleString()} views (Unverified)
• Manual Outreach Delivery: ~${manualOutreachViews.toLocaleString()} views (High Bot Risk)
• Kpugi Guaranteed Delivery: ${guaranteedViews.toLocaleString()} views (100% Escrow Backed)`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast({
        title: 'Brand ROI Estimate Copied!',
        description: `Campaign plan for ${guaranteedViews.toLocaleString()} guaranteed views copied.`,
      });
    }
  };

  return (
    <section
      id={id}
      className={`relative w-full bg-[#F8F9FD] dark:bg-[#050811] py-16 md:py-24 px-4 md:px-16 transition-colors duration-300 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-slate-900 dark:text-white tracking-tight max-w-3xl mx-auto">
            Get guaranteed verified views within your budget
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-neutral-400 mt-3 max-w-2xl mx-auto">
            Upload your ready flyers, videos, or banners. Hundreds of verified creators pick them up and syndicate across socials with zero wasted ad spend.
          </p>
        </div>

        {/* 2-Column Calculator Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-2xl bg-white dark:bg-[#08090D] transition-colors">
          {/* LEFT COLUMN: Calculator Form */}
          <div className="bg-slate-50/70 dark:bg-[#0B1026] p-8 lg:p-12 divide-y divide-slate-200 dark:divide-[#1C2237] transition-colors flex flex-col justify-between">
            {/* 1. Campaign Model */}
            <div className="pb-8">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">How do you want to run this campaign?</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-5">
                Brands provide finished ad creatives — creators simply grab, post, and amplify.
              </p>
              <div className="space-y-3.5">
                {[
                  {
                    id: 'ready_creative',
                    label: 'Brand Flyer & Graphic Drops (Upload & Syndicate)',
                    cpm: 2000,
                    desc: 'Upload your ready banners, promo flyers, or announcement graphics. Creators grab & post to socials with 0 editing.',
                  },
                  {
                    id: 'video_creative',
                    label: 'Official Brand Video Drops (Upload & Syndicate)',
                    cpm: 3500,
                    desc: 'Upload ready commercial videos, motion reels, or product launch clips. Creators syndicate directly with 0 filming.',
                  },
                  {
                    id: 'omnichannel',
                    label: '360° Omnichannel Campaign Syndicate',
                    cpm: 5000,
                    desc: 'Combined blitz across Instagram Reels/Stories, TikTok, and X feeds.',
                  },
                ].map((option) => {
                  const isChecked = campaignType === option.id;
                  return (
                    <label
                      key={option.id}
                      onClick={() => setCampaignType(option.id as BrandCampaignType)}
                      className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer group select-none ${
                        isChecked
                          ? 'border-[#2F49E8] bg-[#2F49E8]/10'
                          : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-white dark:bg-neutral-900/30'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors duration-200 ${
                          isChecked
                            ? 'border-[#2F49E8]'
                            : 'border-slate-300 dark:border-neutral-600 group-hover:border-[#2F49E8] bg-transparent'
                        }`}
                      >
                        {isChecked && <div className="w-2 h-2 rounded-full bg-[#2F49E8]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${isChecked ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-neutral-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                            {option.label}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                            isChecked
                              ? 'bg-[#2F49E8] text-white'
                              : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-neutral-300'
                          }`}>
                            {formatPrice(option.cpm)} CPM
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">{option.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. Campaign Budget (Slider) */}
            <div className="pt-8">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Select campaign budget:</h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#2F49E8]/10 text-[#2F49E8] dark:text-[#6882FF] border border-[#2F49E8]/20">
                      {formatPrice(baseCpm)} CPM
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-neutral-400">
                    Delivers 1,000 verified views per {formatPrice(baseCpm)} • 100% escrow backed
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#17A75B] block">
                    {formatPrice(budgetNgn)}
                  </span>
                </div>
              </div>

              <div className="pt-2 pb-1">
                <Slider
                  min={0.25}
                  max={10}
                  step={0.25}
                  value={[budgetM]}
                  onValueChange={(val) => setBudgetM(val[0])}
                  className="py-2"
                  rangeClassName="bg-gradient-to-r from-[#2F49E8] to-[#17A75B]"
                  thumbClassName="border-[#2F49E8] focus-visible:ring-[#2F49E8]"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 dark:text-neutral-500 font-mono mt-1">
                <span>{currency === 'USD' ? '$170' : '₦250,000'}</span>
                <span>{currency === 'USD' ? '$6,700+' : '₦10,000,000+'}</span>
              </div>

              {/* Dynamic View Delivery & CPM Breakdown */}
              <div className="mt-5 p-4 rounded-xl bg-slate-100 dark:bg-[#080B18] border border-slate-200 dark:border-white/10 space-y-2.5 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#17A75B]" />
                    <span className="text-xs text-slate-700 dark:text-neutral-300 font-medium">Guaranteed Views Delivered:</span>
                  </div>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {guaranteedViews.toLocaleString()} views
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-white/5 text-xs text-slate-500 dark:text-neutral-400 flex-wrap gap-1">
                  <span>
                    Applied Rate: <strong className="text-[#2F49E8] dark:text-[#6882FF] font-semibold">{formatPrice(baseCpm)} CPM</strong> ({formatPrice(budgetNgn)} ÷ {formatPrice(baseCpm)})
                  </span>
                  <span>~{estimatedCreators} verified creators</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Views & Reach Comparison */}
          <div className="p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#050811] flex flex-col justify-between transition-colors">
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">Estimated Campaign Reach Comparison</h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Compare the verified views and guaranteed reach delivered on Kpugi versus legacy agencies and manual outreach for your budget.
                </p>
              </div>

              {/* 3 Stacked Cards */}
              <div className="space-y-4">
                {/* Traditional Agency Card */}
                <div className="rounded-2xl p-6 bg-slate-50 dark:bg-[#0D111F] border border-slate-200/80 dark:border-white/5 space-y-2.5 transition-all">
                  <div className="text-sm text-slate-500 dark:text-neutral-400 font-normal">Typical Ad Agency delivers only</div>
                  <div className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                    ~{agencyEstimatedViews.toLocaleString()} <span className="text-xl font-medium text-slate-500 dark:text-neutral-400">views</span>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
                    + 40% retainer markup, zero view guarantee & slow 4-week execution
                  </div>
                </div>

                {/* Freelancer / Manual Outreach Card */}
                <div className="rounded-2xl p-6 bg-slate-50 dark:bg-[#0D111F] border border-slate-200/80 dark:border-white/5 space-y-2.5 transition-all">
                  <div className="text-sm text-slate-500 dark:text-neutral-400 font-normal">Direct Manual Outreach delivers</div>
                  <div className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                    ~{manualOutreachViews.toLocaleString()} <span className="text-xl font-medium text-slate-500 dark:text-neutral-400">views</span>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
                    + Creator ghosting, high bot inflation & zero escrow protection
                  </div>
                </div>

                {/* With Kpugi (Solid Brand Blue) - Primary Element is VIEWS */}
                <div className="rounded-2xl p-6 bg-[#2F49E8] text-white space-y-3 shadow-2xl shadow-[#2F49E8]/30 transition-transform duration-200 hover:scale-[1.01]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-base font-semibold text-white/95">Guaranteed Views with Kpugi</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                      100% Escrow Backed
                    </span>
                  </div>
                  <div className="text-5xl lg:text-6xl font-extrabold tracking-tight">
                    {guaranteedViews.toLocaleString()} <span className="text-2xl font-bold text-white/85">views</span>
                  </div>
                  <div className="text-sm font-medium text-white/90">
                    Delivered across ~{estimatedCreators} verified creators at {formatPrice(baseCpm)} CPM for your {formatPrice(budgetNgn)} budget
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 mt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsMediaPlanOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#2F49E8]/30 bg-[#2F49E8]/10 hover:bg-[#2F49E8]/20 text-[#2F49E8] dark:text-[#6882FF] text-xs font-bold transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Executive Media Plan (PDF)</span>
                </button>

                
              </div>

              <Link
                href="/brands"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-semibold transition-all shadow-md"
              >
                <span>Launch Brand Campaign</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Media Plan Modal with @react-pdf/renderer Generator */}
      <MediaPlanModal
        isOpen={isMediaPlanOpen}
        onClose={() => setIsMediaPlanOpen(false)}
        data={{
          planRef: `KP-MP-${budgetNgn.toString().slice(0, 3)}-${baseCpm}`,
          issuedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          validUntil: new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          campaignType,
          campaignTypeName:
            campaignType === 'ready_creative'
              ? 'Brand Flyer & Graphic Drops (Upload & Syndicate)'
              : campaignType === 'video_creative'
              ? 'Official Brand Video Drops (Upload & Syndicate)'
              : '360° Omnichannel Campaign Syndicate',
          budgetNgn,
          budgetFormatted: formatPrice(budgetNgn),
          guaranteedViews,
          baseCpm,
          baseCpmFormatted: formatPrice(baseCpm),
          estimatedCreators,
          agencyViews: agencyEstimatedViews,
          manualViews: manualOutreachViews,
          currency,
        }}
      />
    </section>
  );
}
