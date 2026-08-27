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

  const channels: string[] = formData.channels && formData.channels.length > 0
    ? formData.channels
    : ['TikTok', 'Instagram', 'YouTube', 'Facebook', 'X', 'LinkedIn'];

  const hashtags: string[] = formData.requirements?.hashtags && formData.requirements.hashtags.length > 0
    ? formData.requirements.hashtags
    : ['#KpugiLaunch', `#${(formData.title || 'Kpugi').replace(/[^a-zA-Z0-9]/g, '')}`];

  const mentions: string[] = formData.requirements?.mentions && formData.requirements.mentions.length > 0
    ? formData.requirements.mentions
    : ['@KpugiApp'];

  const creativeCopy = formData.requirements?.creative_text_copy ||
    `"Your brand deserves more than an ad. It deserves attention. 🚀 Kpugi connects brands with creators who can put your campaign in front of real audiences across social platforms. 📣 Reach more people 🎥 Get creators talking about your brand 📈 Turn content into growth. #Kpugi #CreatorMarketing #BrandAwareness"`;

  return (
    <div className="w-full font-sans text-kpugi-ink dark:text-white">
      {/* ─────────────────────────────────────────────────────
         MAIN CAMPAIGN PREVIEW GRID
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: CREATIVE BANNER & BRIEF */}
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
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink dark:text-white leading-tight tracking-tight">
                  {formData.title || 'Reach Real Audiences Through Creators'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {formData.description ||
                    'Want your brand in front of real audiences? Kpugi connects brands with creators who can turn your campaigns into engaging social content. Create a campaign, choose your audience, and let creators amplify your message across their platforms.'}
                </p>
              </div>

              {/* Recommended Caption */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-dashed border-kpugi-border dark:border-white/10 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-kpugi-blue dark:text-blue-400" />
                  <span>Approved Post Caption</span>
                </span>
                <p className="text-xs italic text-kpugi-ink dark:text-slate-200 leading-relaxed font-sans">
                  {creativeCopy}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: FINANCIALS & PROJECTED REACH */}
        <div className="flex flex-col gap-5">
          
          {/* Financials & Payouts Card */}
          <div className="bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 rounded-3xl p-6 shadow-xs border-l-4 border-l-kpugi-blue space-y-4">
            <h3 className="font-display text-sm font-bold text-kpugi-ink dark:text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-kpugi-blue dark:text-blue-400" />
              <span>Budget & Payouts</span>
            </h3>

            <div className="flex justify-between items-end pb-3.5 border-b border-kpugi-border dark:border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  CPM
                </span>
                <span className="font-mono text-2xl font-black text-kpugi-ink dark:text-white">
                  ₦{cpmRate.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  Min View
                </span>
                <span className="font-mono text-sm font-bold text-kpugi-ink dark:text-white">
                  {formatCompactNumber(minThreshold)} views
                </span>
              </div>
            </div>

            
          </div>

          {/* Target Platforms Card (Only Icons) */}
          <div className="bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="font-display text-sm font-bold text-kpugi-ink dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
          <div className="bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="font-display text-sm font-bold text-kpugi-ink dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Campaign Tags</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {hashtags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-blue-50 dark:bg-blue-950/40 text-kpugi-blue dark:text-blue-400 px-3 py-1 rounded-xl font-mono text-xs font-bold border border-blue-200 dark:border-blue-800/40"
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

          {/* PROJECTED REACH & LIVE VIEW AUDIT CARD (POPPING HERO CARD) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 shadow-lg border border-white/15 space-y-4">
            
            {/* Big Computed Est Views Display */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block mb-0.5">
                Estimated Campaign Views
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {potentialViews.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  views
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Based on your <strong className="text-white">₦{cpmRate.toLocaleString()} CPM</strong> & <strong className="text-white">{formatCompactCurrency(totalBudget)}</strong> budget pool.
              </p>
            </div>

            {/* Creator Match breakdown */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold flex items-center gap-1 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Max Creator Slots</span>
                </span>
                <span className="font-mono font-bold text-white text-xs">
                  ~{creatorSlots} creators
                </span>
              </div>

              
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
