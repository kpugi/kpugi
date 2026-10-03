'use client';

import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  FileText,
  Coins,
  Sparkles,
  Share2,
  Tag,
  Users,
} from 'lucide-react';
import { PlatformBadge } from '@/components/ui/SocialIcons';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/utils/format';
import CampaignBriefRenderer from './CampaignBriefRenderer';

export interface CampaignInteractivePreviewProps {
  formData: any;
  cpmRate?: number;
  minThreshold?: number;
  isFeatured?: boolean;
}

export default function CampaignInteractivePreview({
  formData,
  cpmRate: propCpmRate,
  minThreshold: propMinThreshold,
  isFeatured: propIsFeatured,
}: CampaignInteractivePreviewProps) {
  const cpmRate = propCpmRate ?? Math.max(2000, Number(formData.cpm_rate || 2000));
  const minThreshold = propMinThreshold ?? Number(formData.min_view_threshold || 1000);
  const isFeatured = propIsFeatured ?? Boolean(formData.is_featured);
  const totalBudget = Math.max(10000, Number(formData.total_budget || 100000));

  // Dynamic calculations for views and slots
  const potentialViews = cpmRate > 0 ? Math.floor((totalBudget / cpmRate) * 1000) : 0;
  const creatorSlots = cpmRate > 0 ? Math.floor(totalBudget / cpmRate) : 0;

  const channels: string[] =
    formData.channels && formData.channels.length > 0
      ? formData.channels
      : ['TikTok', 'Instagram', 'YouTube', 'Facebook', 'X', 'LinkedIn'];

  const hashtags: string[] =
    formData.requirements?.hashtags && formData.requirements.hashtags.length > 0
      ? formData.requirements.hashtags
      : ['#KpugiLaunch', `#${(formData.title || 'Kpugi').replace(/[^a-zA-Z0-9]/g, '')}`];

  const mentions: string[] =
    formData.requirements?.mentions && formData.requirements.mentions.length > 0
      ? formData.requirements.mentions
      : ['@KpugiApp'];

  // Only use creative caption if brand explicitly specified or generated one
  const creativeCopy = (formData.requirements?.creative_text_copy || '').trim();

  return (
    <div className="w-full font-sans text-kpugi-ink dark:text-white">
      {/* ─────────────────────────────────────────────────────
         MAIN CAMPAIGN PREVIEW GRID (DUAL PAGE WITH STICKY RHS)
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: CREATIVE BANNER & FORMATTED BRIEF */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 rounded-3xl overflow-hidden shadow-xs">
            
            {/* Top Cover Image Area */}
            <div className="relative w-full h-[320px] sm:h-[400px] bg-slate-900 overflow-hidden group">
              {formData.cover_image_url ? (
                <img
                  src={formData.cover_image_url}
                  alt={formData.title || 'Campaign Creative'}
                  className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-slate-400 p-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white font-display font-extrabold text-2xl shadow-inner">
                    {(formData.title || 'K').charAt(0)}
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Campaign creative banner will render here upon image upload.
                  </p>
                </div>
              )}

              {/* Status / Category floating pill */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-950/80 text-white font-sans text-[11px] font-bold tracking-wider uppercase backdrop-blur-md border border-white/15 shadow-md">
                  {formData.ad_format ? `${formData.ad_format} Campaign` : 'Video Campaign'}
                </span>
                {isFeatured && (
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-sans text-[11px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>Featured</span>
                  </span>
                )}
              </div>
            </div>

            {/* Campaign Details Content */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                  {formData.title || 'Reach Real Audiences Through Creators'}
                </h2>
                <div className="mt-4">
                  <CampaignBriefRenderer
                    content={
                      formData.description ||
                      'Want your brand in front of real audiences? Kpugi connects brands with creators who can turn your campaigns into engaging social content. Create a campaign, choose your audience, and let creators amplify your message across their platforms.'
                    }
                  />
                </div>
              </div>

              {/* Approved Post Caption — Render ONLY if brand entered/generated a caption */}
              {creativeCopy && (
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/10 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#4338ca] dark:text-indigo-400" />
                    <span>Approved Post Caption</span>
                  </span>
                  <p className="text-xs italic text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {creativeCopy}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: FINANCIALS & PROJECTED REACH (STICKY / FLOATING) */}
        <div className="lg:col-span-1 sticky top-6 self-start flex flex-col gap-5">
          
          {/* RETOUCHED: PROJECTED REACH & METRICS CARD */}
          <div className="bg-white dark:bg-[#12141A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
               
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block leading-tight">
                    Projected Reach
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    Audience Delivery
                  </span>
                </div>
              </div>
              
            </div>

            {/* Estimated Views Main Metric */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                Estimated Campaign Views
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {potentialViews.toLocaleString()}+
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  views
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Based on your <strong className="text-slate-900 dark:text-white font-semibold">₦{cpmRate.toLocaleString()} CPM</strong> & <strong className="text-slate-900 dark:text-white font-semibold">{formatCompactCurrency(totalBudget)}</strong> budget pool.
              </p>
            </div>

            {/* Structured Stats Grid */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#4338ca] dark:text-indigo-400" />
                  <span>Max Slots</span>
                </span>
                <span className="font-display font-bold text-slate-900 dark:text-white text-sm">
                  ~{creatorSlots} creators
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Min Threshold</span>
                </span>
                <span className="font-display font-bold text-slate-900 dark:text-white text-sm">
                  {formatCompactNumber(minThreshold)} views
                </span>
              </div>
            </div>
          </div>

          {/* Financials & Payouts Card */}
          <div className="bg-white dark:bg-[#12141A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xs border-l-4 border-l-[#4338ca] space-y-4">
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#4338ca] dark:text-indigo-400" />
              <span>Budget & Payouts</span>
            </h3>

            <div className="flex justify-between items-end pb-3.5 border-b border-slate-100 dark:border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  CPM Rate
                </span>
                <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                  ₦{cpmRate.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  Total Budget
                </span>
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCompactCurrency(totalBudget)}
                </span>
              </div>
            </div>
          </div>

          {/* Target Platforms Card */}
          <div className="bg-white dark:bg-[#12141A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#4338ca] dark:text-indigo-400" />
              <span>Target Platforms</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {channels.map((ch: string) => (
                <PlatformBadge
                  key={ch}
                  platform={ch}
                  showLabel={false}
                  className="!w-10 !h-10 !p-0 flex items-center justify-center !rounded-2xl shadow-sm hover:scale-105 transition-transform"
                />
              ))}
            </div>
          </div>

          {/* Campaign Tags */}
          <div className="bg-white dark:bg-[#12141A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Campaign Tags</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {hashtags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-xl font-mono text-xs font-bold border border-blue-200 dark:border-blue-800/40"
                >
                  {tag}
                </span>
              ))}
              {mentions.map((m: string) => (
                <span
                  key={m}
                  className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-xl font-mono text-xs font-bold border border-purple-200 dark:border-purple-800/40"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
