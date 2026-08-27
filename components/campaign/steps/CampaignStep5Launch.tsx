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
import { formatCompactCurrency } from '@/lib/utils/format';
import CampaignInteractivePreview from '@/components/campaign/CampaignInteractivePreview';

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
    <div className="space-y-8 font-sans text-slate-900 dark:text-white">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-mono font-bold mx-auto mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>PAYMENT VERIFIED!</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Alright, let's get this out there!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Payment has been confirmed. Review your ready-to-post creative briefing card below and launch your campaign to qualified creators.
        </p>
      </div>

      {/* Verified Escrow Payment Confirmation Banner */}
      <div className="p-5 rounded-3xl bg-[#f8f7ff] dark:bg-white/[0.03] border border-[#e2e0fb] dark:border-white/10 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e2e0fb] dark:border-white/10 pb-3 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-[#4338ca] dark:text-indigo-400" />
            <span>Payment Reference</span>
          </span>
          <span className="font-mono font-bold text-[#4338ca] dark:text-indigo-400 bg-white dark:bg-white/10 px-3 py-1 rounded-full border border-[#dcd8fc] dark:border-white/10">
            {paymentRef || `KPG-PAY-${Date.now().toString(36).slice(-5).toUpperCase()}`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Payment Method</div>
            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs capitalize truncate">
              {paymentMethod === 'wallet' ? 'Kpugi Wallet' : 'Card / Transfer'}
            </div>
          </div>

          <div className="p-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Campaign Budget</div>
            <div className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate" title={`₦${totalBudget.toLocaleString()}`}>
              {formatCompactCurrency(totalBudget)}
            </div>
          </div>

          <div className="p-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">CPM Rate</div>
            <div className="font-mono text-xs font-bold text-[#4338ca] dark:text-indigo-400 truncate">
              ₦{cpmRate.toLocaleString()} / 1k
            </div>
          </div>

          <div className="p-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Total Paid</div>
            <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate" title={`₦${totalPayable.toLocaleString()}`}>
              {formatCompactCurrency(totalPayable)}
            </div>
          </div>
        </div>
      </div>

      {/* Live Creator Briefing Card Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#4338ca] dark:text-indigo-400" />
            <span>PREVIEW</span>
          </label>
        </div>

        <CampaignInteractivePreview
          formData={formData}
          cpmRate={cpmRate}
          minThreshold={minThreshold}
          isFeatured={isFeatured}
        />
      </div>

      {/* Security & Notification Notice */}
      <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
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
          className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#4338ca] hover:bg-[#3730a3] dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-base font-extrabold transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50"
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
