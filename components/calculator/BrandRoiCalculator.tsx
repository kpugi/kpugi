'use client';

import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, ArrowRight, ShieldCheck, Zap, Sparkles, TrendingUp, Layers, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export type BrandCampaignType = 'ready_creative' | 'bespoke_ugc' | 'omnichannel';
export type BrandFlightSpeed = 'rush' | 'fast' | 'regular';

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
  const [antiFraudAudit, setAntiFraudAudit] = useState<boolean>(true);
  const [includeWhatsappNetwork, setIncludeWhatsappNetwork] = useState<boolean>(true);
  const [flightSpeed, setFlightSpeed] = useState<BrandFlightSpeed>('regular');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [copied, setCopied] = useState<boolean>(false);

  // Conversion rate: ₦1,500 = $1 USD for reference
  const exchangeRate = 1500;

  // Actual budget in NGN
  const budgetNgn = Math.round(budgetM * 1000000);

  // Kpugi CPM benchmark (₦2,000 per 1k verified views for ready creatives)
  const baseCpm = campaignType === 'ready_creative' ? 2000 : campaignType === 'bespoke_ugc' ? 3500 : 5000;
  
  // Guaranteed views delivered on Kpugi
  const guaranteedViews = Math.round((budgetNgn / baseCpm) * 1000);
  const estimatedCreators = Math.max(5, Math.round(budgetNgn / 65000));

  // Typical Agency cost for identical reach:
  // Agencies charge massive retainers (minimum ₦3.5M-₦6M) and 45%-60% management overhead
  const agencyEquivalentCost = Math.round(budgetNgn * 2.5 + 1500000);

  // Direct Freelancer / Manual outreach cost:
  // Includes lost labor hours (estimated ₦800k+), creative leakage, and unverified bot views (up to 30% waste)
  const freelancerEquivalentCost = Math.round(budgetNgn * 1.6 + 600000);

  // Savings
  const agencySavings = agencyEquivalentCost - budgetNgn;

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
        ? 'Ready Brand Creative Drop (Upload & Syndicate)'
        : campaignType === 'bespoke_ugc'
        ? 'Custom Creator UGC Drops'
        : 'Full 360° Omnichannel Syndicate';

    const flightLabel =
      flightSpeed === 'rush'
        ? 'Within 7 Days (Viral Flash)'
        : flightSpeed === 'fast'
        ? 'Within 14 Days (Sustained Wave)'
        : 'Regular Flexible Flight';

    const summary = `Kpugi Brand Campaign ROI Estimate:
• Drop Type: ${typeLabel}
• Campaign Budget: ${formatPrice(budgetNgn)}
• Guaranteed Verified Views: ${guaranteedViews.toLocaleString()} views
• Creators Activated: ~${estimatedCreators} creators
• Quality Safeguards: AI Bot Filtering + 100% Escrow Protection
• Turnaround: ${flightLabel}
-------------------------
• Total Kpugi Investment: ${formatPrice(budgetNgn)}
• Typical Agency Charge: ${formatPrice(agencyEquivalentCost)}
• Direct Savings with Kpugi: +${formatPrice(agencySavings)}
• Verification: 100% Verified Escrow`;

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
          <div className="bg-slate-50/70 dark:bg-[#0B1026] p-8 lg:p-12 divide-y divide-slate-200 dark:divide-[#1C2237] transition-colors">
            {/* 1. Campaign Model */}
            <div className="pb-8">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">How do you want to run this campaign?</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-5">
                Bring your own ready creatives for instant syndication, or commission bespoke creator content.
              </p>
              <div className="space-y-3.5">
                {[
                  {
                    id: 'ready_creative',
                    label: 'Ready Brand Creative Drop (Upload & Syndicate)',
                    desc: 'Upload your ready banners, promo flyers, or official clips. Creators grab & post to their WhatsApp, IG, and TikTok handles.',
                  },
                  {
                    id: 'bespoke_ugc',
                    label: 'Custom Creator UGC (Native Brand Video)',
                    desc: 'Creators produce bespoke review, unboxing, or testimonial videos based on your creative brief.',
                  },
                  {
                    id: 'omnichannel',
                    label: '360° Omnichannel Domination',
                    desc: 'Combined blitz across WhatsApp Status, Instagram Stories/Reels, TikTok, and X feeds.',
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

            {/* 2. Campaign Budget (Slider) */}
            <div className="py-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">Select campaign budget:</h3>
                  <span className="text-xs text-slate-500 dark:text-neutral-400">Locked in automated escrow until views are verified</span>
                </div>
                <span className="text-2xl font-bold text-[#17A75B]">
                  {formatPrice(budgetNgn)}
                </span>
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

              {/* Dynamic View Delivery Badge */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-100 dark:bg-gradient-to-r dark:from-[#2F49E8]/10 dark:to-[#17A75B]/10 border border-slate-200 dark:border-[#2F49E8]/20 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-[#17A75B]" />
                  <span className="text-xs text-slate-600 dark:text-neutral-300">Guaranteed Verified Views:</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {guaranteedViews.toLocaleString()} views <span className="text-xs font-normal text-slate-500 dark:text-neutral-400">(~{estimatedCreators} creators)</span>
                </span>
              </div>
            </div>

            {/* 3. Quality Safeguards & Channels */}
            <div className="py-8">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Included safeguards & channel boosts:</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-5">
                Every drop is protected by automated verification and fraud detection.
              </p>
              <div className="space-y-4">
                {/* Safeguard 1 */}
                <label
                  onClick={() => setAntiFraudAudit(!antiFraudAudit)}
                  className={`flex items-center justify-between cursor-pointer group select-none p-3 rounded-xl border transition-all ${
                    antiFraudAudit
                      ? 'border-[#2F49E8]/40 bg-[#2F49E8]/5 dark:bg-[#2F49E8]/10'
                      : 'border-slate-200 dark:border-white/5 bg-white dark:bg-neutral-900/30 hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                        antiFraudAudit
                          ? 'border-[#2F49E8] bg-[#2F49E8]'
                          : 'border-slate-300 dark:border-neutral-600 group-hover:border-[#2F49E8] bg-transparent'
                      }`}
                    >
                      {antiFraudAudit && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    <div>
                      <span className={`text-sm font-medium ${antiFraudAudit ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-neutral-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                        AI Bot Detection & Anti-Fraud View Filtering
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-neutral-400">Purges invalid bot clicks and suspicious spikes</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#17A75B] px-2.5 py-1 rounded-md bg-[#17A75B]/10 border border-[#17A75B]/20 shrink-0 whitespace-nowrap ml-4">
                    INCLUDED
                  </span>
                </label>

                {/* Safeguard 2 */}
                <label
                  onClick={() => setIncludeWhatsappNetwork(!includeWhatsappNetwork)}
                  className={`flex items-center justify-between cursor-pointer group select-none p-3 rounded-xl border transition-all ${
                    includeWhatsappNetwork
                      ? 'border-[#2F49E8]/40 bg-[#2F49E8]/5 dark:bg-[#2F49E8]/10'
                      : 'border-slate-200 dark:border-white/5 bg-white dark:bg-neutral-900/30 hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                        includeWhatsappNetwork
                          ? 'border-[#2F49E8] bg-[#2F49E8]'
                          : 'border-slate-300 dark:border-neutral-600 group-hover:border-[#2F49E8] bg-transparent'
                      }`}
                    >
                      {includeWhatsappNetwork && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    <div>
                      <span className={`text-sm font-medium ${includeWhatsappNetwork ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-neutral-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                        Syndicate across High-Converting WhatsApp Status Network
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-neutral-400">Private messaging feeds with 8x higher CTR</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#17A75B] px-2.5 py-1 rounded-md bg-[#17A75B]/10 border border-[#17A75B]/20 shrink-0 whitespace-nowrap ml-4">
                    INCLUDED
                  </span>
                </label>
              </div>
            </div>

            {/* 4. Flight Speed */}
            <div className="pt-8">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-5">How fast do you want your campaign completed?</h3>
              <div className="space-y-3.5">
                {[
                  { id: 'rush', label: 'Within 7 Days (Viral Flash Sprint)', fee: '0% rush surcharge' },
                  { id: 'fast', label: 'Within 14 Days (Sustained Growth Wave)', fee: '0% rush surcharge' },
                  { id: 'regular', label: 'Regular Speed (Flexible 30-Day Window)', fee: 'Default' },
                ].map((option) => {
                  const isChecked = flightSpeed === option.id;
                  return (
                    <label
                      key={option.id}
                      onClick={() => setFlightSpeed(option.id as BrandFlightSpeed)}
                      className="flex items-center justify-between cursor-pointer group select-none"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                            isChecked
                              ? 'border-[#2F49E8]'
                              : 'border-slate-300 dark:border-neutral-600 group-hover:border-[#2F49E8] bg-transparent'
                          }`}
                        >
                          {isChecked && <div className="w-2 h-2 rounded-full bg-[#2F49E8]" />}
                        </div>
                        <span className={`text-sm font-normal ${isChecked ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-neutral-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                          {option.label}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[#17A75B]">{option.fee}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Cost & ROI Comparison */}
          <div className="p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#050811] flex flex-col justify-between min-h-[717.98px] transition-colors">
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">Estimated Campaign Cost</h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Compare your total investment across traditional agencies, direct influencer outreach, and Kpugi's verified platform.
                </p>
              </div>

              {/* 3 Stacked Cards */}
              <div className="space-y-4">
                {/* Traditional Agency Card */}
                <div className="rounded-2xl p-6 bg-slate-50 dark:bg-[#0D111F] border border-slate-200/80 dark:border-white/5 space-y-2.5 transition-all">
                  <div className="text-sm text-slate-500 dark:text-neutral-400 font-normal">Typical Ad Agency charges minimum</div>
                  <div className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {formatPrice(agencyEquivalentCost)}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
                    + Too much extra time, 40% retainer markup & zero view guarantee
                  </div>
                </div>

                {/* Freelancer / Manual Outreach Card */}
                <div className="rounded-2xl p-6 bg-slate-50 dark:bg-[#0D111F] border border-slate-200/80 dark:border-white/5 space-y-2.5 transition-all">
                  <div className="text-sm text-slate-500 dark:text-neutral-400 font-normal">Direct Manual Outreach costs</div>
                  <div className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {formatPrice(freelancerEquivalentCost)}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
                    + Too much headache, creator ghosting & unverified bot views
                  </div>
                </div>

                {/* With Kpugi (Vibrant Brand Gradient: Kpugi Blue to Emerald) */}
                <div className="rounded-2xl p-6 bg-gradient-to-r from-[#2F49E8] via-indigo-600 to-[#17A75B] text-white space-y-3 shadow-2xl shadow-[#2F49E8]/30 transition-transform duration-200 hover:scale-[1.01]">
                  <div className="text-base font-semibold text-white/95">With Kpugi Brand Suite</div>
                  <div className="text-5xl lg:text-6xl font-extrabold tracking-tight">
                    {formatPrice(budgetNgn)}
                  </div>
                  <div className="text-sm font-medium text-white/90">
                    Save your money, time & headache • 100% verified views escrow
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
                href="/brands"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-sm font-semibold transition-all shadow-md"
              >
                <span>Launch Brand Campaign</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
