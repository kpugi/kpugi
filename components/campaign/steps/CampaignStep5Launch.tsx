'use client';

import React from 'react';
import {
  CheckCircle2,
  Rocket,
  Eye,
  Lock,
  FileText,
  Sparkles,
  Target,
  ShieldCheck,
  Receipt,
} from 'lucide-react';
import { PlatformBadge } from '@/components/ui/SocialIcons';

interface Step5Props {
  formData: any;
  paymentRef: string;
  paymentMethod: 'wallet' | 'paystack';
  isPublishing: boolean;
  onConfirmLaunch: () => void;
}

export function CampaignStep5Launch({
  formData,
  paymentRef,
  paymentMethod,
  isPublishing,
  onConfirmLaunch,
}: Step5Props) {
  const cpmRate = Math.max(2000, Number(formData.cpm_rate || 2000));
  const minThreshold = Number(formData.min_view_threshold || 1000);
  const totalBudget = Math.max(10000, Number(formData.total_budget || 100000));

  const creatorSlots = cpmRate > 0 ? Math.floor(totalBudget / cpmRate) : 0;
  const potentialViews = cpmRate > 0 ? Math.floor((totalBudget / cpmRate) * 1000) : 0;

  const channels: string[] = formData.channels || ['TikTok', 'Instagram'];
  const hashtags: string[] = formData.requirements?.hashtags || ['#KpugiLaunch'];
  const mentions: string[] = formData.requirements?.mentions || ['@KpugiApp'];

  const isFeatured = Boolean(formData.is_featured);
  const featuredFee = isFeatured ? 2500 : 0;
  const totalPayable = totalBudget + featuredFee;

  return (
    <div className="space-y-8 font-sans">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold mx-auto mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>PAYMENT VERIFIED!</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Alright, let's get this out there!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Payment has been confirmed. Review your ready-to-post creative briefing card below and launch your campaign to qualified creators.
        </p>
      </div>

      {/* Verified Escrow Payment Confirmation Banner */}
      <div className="p-5 rounded-3xl bg-[#f8f7ff] border border-[#e2e0fb] space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e2e0fb] pb-3 text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-[#4338ca]" />
            <span>Payment Reference</span>
          </span>
          <span className="font-mono font-bold text-[#4338ca] bg-white px-3 py-1 rounded-full border border-[#dcd8fc]">
            {paymentRef || `KPG-PAY-${Date.now().toString(36).slice(-5).toUpperCase()}`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</div>
            <div className="font-bold text-slate-800 text-xs capitalize">
              {paymentMethod === 'wallet' ? 'Kpugi Wallet' : 'Card / Bank Transfer'}
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Campaign Budget</div>
            <div className="font-mono text-xs font-bold text-slate-900">
              ₦{totalBudget.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase">CPM Rate</div>
            <div className="font-mono text-xs font-bold text-[#4338ca]">
              ₦{cpmRate.toLocaleString()} / 1k
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Total Paid</div>
            <div className="font-mono text-xs font-bold text-emerald-600">
              ₦{totalPayable.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Live Creator Briefing Card Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#4338ca]" />
            <span>Live Creator Briefing Preview (How Creators See It)</span>
          </label>
          <div className="flex items-center gap-2">
            {isFeatured && (
              <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>FEATURED CAMPAIGN</span>
              </span>
            )}
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Grab & Post Enabled
            </span>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 overflow-hidden">
          {formData.cover_image_url && (
            <div className="w-full h-44 sm:h-56 overflow-hidden relative border-b border-white/10">
              <img
                src={formData.cover_image_url}
                alt="Campaign Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>READY TO LAUNCH</span>
                </div>
                <h3 className="font-display text-2xl font-extrabold text-white">
                  {formData.title || 'Untitled Campaign'}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-2xl">
                  {formData.description || 'No description provided.'}
                </p>
              </div>
              <div className="text-right shrink-0 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10">
                <div className="font-mono text-xl font-extrabold text-amber-400">
                  ₦{cpmRate.toLocaleString()}{' '}
                  <span className="text-xs text-slate-400 font-normal">/ 1k views</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Min View Goal: {minThreshold.toLocaleString()} views
                </div>
              </div>
            </div>

            {/* Target Social Platforms Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10 text-xs">
              <span className="text-slate-400 font-bold text-[11px] flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#818cf8]" />
                <span>Target Platforms:</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {channels.map((ch: string) => (
                  <PlatformBadge key={ch} platform={ch} showLabel={true} className="!py-1 !px-2.5" />
                ))}
              </div>
            </div>

            {/* Grab & Post Creative Box */}
            {formData.requirements?.creative_text_copy && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Approved Post Caption (Creators Copy This)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full">
                    Ready to Post
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-mono italic leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                  "{formData.requirements.creative_text_copy}"
                </p>
              </div>
            )}

            {/* Mandatory Hashtags & Mentions */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10 text-xs">
              <span className="text-slate-400 font-bold text-[11px]">Mandatory Tags:</span>
              {hashtags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30"
                >
                  {tag}
                </span>
              ))}
              {mentions.map((m: string) => (
                <span
                  key={m}
                  className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Notification Notice */}
      <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <span className="leading-relaxed">
          Clicking <strong>Publish Campaign</strong> below will immediately release this briefing to qualified creators and send real-time push notifications & emails.
        </span>
      </div>

      {/* Paramount Launch Button */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          disabled={isPublishing}
          onClick={onConfirmLaunch}
          className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#4338ca] hover:bg-[#3730a3] text-white text-base font-extrabold transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50"
        >
          <Rocket className="w-5 h-5 text-amber-300 animate-bounce" />
          <span>
            {isPublishing
              ? 'Publishing Campaign...'
              : 'PUBLISH!'}
          </span>
        </button>
      </div>
    </div>
  );
}
