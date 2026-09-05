'use client';

import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export type CreatorDropType = 'ready_creative' | 'video_creative' | 'omnichannel';

interface CreatorEarningsCalculatorProps {
  id?: string;
  className?: string;
}

export default function CreatorEarningsCalculator({
  id = 'creator-calculator-section',
  className = '',
}: CreatorEarningsCalculatorProps) {
  const { toast } = useToast();

  // State
  const [dropType, setDropType] = useState<CreatorDropType>('ready_creative');
  const [viewsK, setViewsK] = useState<number>(60); // 60,000 views default
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [copied, setCopied] = useState<boolean>(false);

  // Conversion rate: ₦1,500 = $1 USD for reference
  const exchangeRate = 1500;

  // Base CPM per 1,000 verified views in NGN
  const getBaseCpm = (): number => {
    switch (dropType) {
      case 'ready_creative':
        // Ready Brand Graphic (Grab & Post: flyers, banners, status graphics)
        return 2000;
      case 'video_creative':
        // Official Brand Video (Grab & Post: promo clips, motion reels)
        return 3500;
      case 'omnichannel':
        // Multi-Platform Syndicate (WhatsApp + IG + TikTok + X)
        return 5000;
      default:
        return 2000;
    }
  };

  // Compute effective CPM
  const effectiveCpm = getBaseCpm();

  // Gross campaign value
  const grossCampaignValue = (viewsK * 1000 / 1000) * effectiveCpm;

  // With Kpugi: Creator keeps 90% direct payout (flat 10% platform fee)
  const kpugiCreatorPayout = Math.round(grossCampaignValue * 0.9);

  // Typical Agency: Takes 45% to 50% commission, plus admin deductions
  const agencyCreatorPayout = Math.round(grossCampaignValue * 0.52);

  // Generic Middleman Platform: Takes 30% cut + 5% payout/wire fees
  const middlemanCreatorPayout = Math.round(grossCampaignValue * 0.65);

  const formatPrice = (amountNgn: number): string => {
    if (currency === 'USD') {
      const usd = Math.round(amountNgn / exchangeRate);
      return `$${usd.toLocaleString()}`;
    }
    return `₦${amountNgn.toLocaleString()}`;
  };

  const extraCashWithKpugi = kpugiCreatorPayout - agencyCreatorPayout;

  const handleCopyEstimate = () => {
    const dropName =
      dropType === 'ready_creative'
        ? 'Brand Flyer & Graphic (Grab & Post)'
        : dropType === 'video_creative'
        ? 'Official Brand Video (Grab & Post)'
        : 'Omnichannel Multi-Platform Syndicate';

    const summary = `Kpugi Creator Payout Estimate:
• Drop Type: ${dropName}
• Estimated Verified Views: ${(viewsK * 1000).toLocaleString()} views
-------------------------
• With Kpugi (90% Net Payout): ${formatPrice(kpugiCreatorPayout)}
• Typical Agency Payout (Takes 48%): ${formatPrice(agencyCreatorPayout)}
• Extra Earnings with Kpugi: +${formatPrice(extraCashWithKpugi)}
• Settlement: Weekly Friday Bank Transfer`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast({
        title: 'Creator Estimate Copied!',
        description: `Estimated payout of ${formatPrice(kpugiCreatorPayout)} copied to clipboard.`,
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
            Get paid what you actually deserve for your views
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-neutral-400 mt-3 max-w-2xl mx-auto">
            Grab ready brand graphics, banners, and official video clips. Amplify brand campaigns to your audience on WhatsApp, Instagram, TikTok, and X.
          </p>
        </div>

        {/* 2-Column Calculator Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-2xl bg-white dark:bg-[#08090D] transition-colors">
          {/* LEFT COLUMN: Calculator Form */}
          <div className="bg-slate-50/70 dark:bg-[#0B1026] p-8 lg:p-12 divide-y divide-slate-200 dark:divide-[#1C2237] transition-colors">
            {/* 1. Drop Format */}
            <div className="pb-8">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">What kind of brand drop are you picking up?</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-5">
                Brands provide finished ad creatives and briefs — you simply grab, post, and amplify.
              </p>
              <div className="space-y-3.5">
                {[
                  {
                    id: 'ready_creative',
                    label: 'Brand Flyer & Graphic Drops (Grab & Post)',
                    desc: 'Advertiser provides flyers, banners, or status graphics. Grab & post to socials with 0 editing.',
                  },
                  {
                    id: 'video_creative',
                    label: 'Official Brand Video Drops (Grab & Post)',
                    desc: 'Advertiser supplies ready promo videos, reels, or motion clips. Post to TikTok, Reels & Shorts with 0 editing.',
                  },
                  {
                    id: 'omnichannel',
                    label: 'Omnichannel Multi-Platform Syndicate',
                    desc: 'Amplify the campaign simultaneously across WhatsApp Status, Instagram, TikTok, and X.',
                  },
                ].map((option) => {
                  const isChecked = dropType === option.id;
                  return (
                    <label
                      key={option.id}
                      onClick={() => setDropType(option.id as CreatorDropType)}
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
                        <div className={`text-sm font-medium ${isChecked ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-neutral-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{option.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. Number of Views (Slider) - The final element on the left card */}
            <div className="pt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">Estimated verified views:</h3>
                  <span className="text-xs text-slate-500 dark:text-neutral-400">Total reach across all your active posts</span>
                </div>
                <span className="text-2xl font-bold text-[#17A75B]">
                  {(viewsK * 1000).toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-neutral-400">views</span>
                </span>
              </div>
              <div className="pt-2 pb-1">
                <Slider
                  min={10}
                  max={500}
                  step={5}
                  value={[viewsK]}
                  onValueChange={(val) => setViewsK(val[0])}
                  className="py-2"
                  rangeClassName="bg-gradient-to-r from-[#2F49E8] to-[#17A75B]"
                  thumbClassName="border-[#2F49E8] focus-visible:ring-[#2F49E8]"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 dark:text-neutral-500 font-mono mt-1">
                <span>10,000 views</span>
                <span>500,000 views</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Cost & Payout Comparison */}
          <div className="p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#050811] flex flex-col justify-between transition-colors">
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">Estimated Net Creator Payout</h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
                  This is what lands in your bank account compared to legacy agencies and generic middleman networks.
                </p>
              </div>

              {/* 3 Stacked Cards */}
              <div className="space-y-4">
                {/* Traditional Agency */}
                <div className="rounded-2xl p-6 bg-slate-50 dark:bg-[#0D111F] border border-slate-200/80 dark:border-white/5 space-y-2.5 transition-all">
                  <div className="text-sm text-slate-500 dark:text-neutral-400 font-normal">Typical Agency pays you only</div>
                  <div className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {formatPrice(agencyCreatorPayout)}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
                    + Takes 45-50% cut, Net-90 delayed payout & hidden fees
                  </div>
                </div>

                {/* Legacy Middleman Platform */}
                <div className="rounded-2xl p-6 bg-slate-50 dark:bg-[#0D111F] border border-slate-200/80 dark:border-white/5 space-y-2.5 transition-all">
                  <div className="text-sm text-slate-500 dark:text-neutral-400 font-normal">Generic Middleman Platform pays</div>
                  <div className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {formatPrice(middlemanCreatorPayout)}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
                    + High withdrawal fees, escrow lockups & 30% platform cut
                  </div>
                </div>

                {/* With Kpugi (Vibrant Brand Gradient: Kpugi Blue to Emerald) */}
                <div className="rounded-2xl p-6 bg-gradient-to-r from-[#2F49E8] via-indigo-600 to-[#17A75B] text-white space-y-3 shadow-2xl shadow-[#2F49E8]/30 transition-transform duration-200 hover:scale-[1.01]">
                  <div className="text-base font-semibold text-white/95">With Kpugi Creator Network</div>
                  <div className="text-5xl lg:text-6xl font-extrabold tracking-tight">
                    {formatPrice(kpugiCreatorPayout)}
                  </div>
                  <div className="text-sm font-medium text-white/90">
                    Keep 90% of your earnings • Weekly Friday bank settlement directly to your account
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 mt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleCopyEstimate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white text-sm font-medium transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#17A75B]" />
                    <span>Copied Breakdown</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
                    <span>Copy Estimate</span>
                  </>
                )}
              </button>

              <Link
                href="/sign-up"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-sm font-semibold transition-all shadow-md"
              >
                <span>Claim Creator Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
