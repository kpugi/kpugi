'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Rocket,
  Eye,
  CheckCircle2,
  Lock,
  FileText,
  Sparkles,
  Wallet,
  CreditCard,
  Target,
  FileCheck,
  Coins,
  TrendingUp,
} from 'lucide-react';
import { PlatformBadge } from '@/components/ui/SocialIcons';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/utils/format';

interface Step4Props {
  formData: any;
  updateFormData?: (fields: Partial<any>) => void;
  walletBalance?: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function CampaignStep4Review({
  formData,
  updateFormData,
  walletBalance = 0,
  isSubmitting,
  onSubmit,
}: Step4Props) {
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paystack'>('wallet');

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

  const toggleFeatured = () => {
    if (updateFormData) {
      updateFormData({ is_featured: !isFeatured });
    }
  };

  const cpmPresets = [2000, 2500, 3500, 5000, 7500, 10000];
  const budgetPresets = [25000, 50000, 100000, 250000, 500000, 1000000];

  const formatBudgetTag = (val: number) => {
    if (val >= 1000000) return `₦${val / 1000000}M`;
    return `₦${val / 1000}k`;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Title & Subtitle Section */}
      <div className="text-center space-y-2">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Let's review and launch.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Set your custom CPM payout rate, configure total Campaign Budget, and launch your campaign.
        </p>
      </div>

      {/* Live Creator Briefing Card Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#4338ca]" />
            <span>PREVIEW</span>
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

      {/* Interactive Custom CPM Rate & Campaign Budget Setup */}
      <div className="p-6 rounded-3xl bg-[#f8f7ff] border border-[#e2e0fb] space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e2e0fb] pb-4">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="w-8 h-8 rounded-full bg-[#eeedfd] text-[#4338ca] flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900">
                Custom CPM Payout Rate & Campaign Budget
              </h3>
              <p className="text-[11px] text-slate-500">
                Set your custom payout rate per 1,000 views — no forced platform minimums.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#4338ca] bg-[#eeedfd] px-3 py-1.5 rounded-full border border-[#dcd8fc]">
            Custom Pricing
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Custom CPM Input & Presets */}
          <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200">
            <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#4338ca]" />
                <span>CPM Payout Rate (₦ / 1k Views) *</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Min: ₦2,000
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-extrabold text-slate-400">
                ₦
              </span>
              <input
                type="number"
                min={2000}
                step={250}
                value={formData.cpm_rate || 2000}
                onChange={(e) =>
                  updateFormData && updateFormData({ cpm_rate: Math.max(2000, Number(e.target.value)) })
                }
                placeholder="2000"
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#f8f7ff] border border-[#e2e0fb] text-sm font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#4338ca] outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {cpmPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateFormData && updateFormData({ cpm_rate: preset })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all border ${
                    cpmRate === preset
                      ? 'bg-[#4338ca] text-white border-[#4338ca]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ₦{preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Total Campaign Budget Input & Presets */}
          <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200">
            <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#4338ca]" />
                <span>Total Escrow View Budget (₦) *</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Escrow Pool</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-extrabold text-slate-400">
                ₦
              </span>
              <input
                type="number"
                min={10000}
                step={5000}
                value={formData.total_budget ?? ''}
                onChange={(e) =>
                  updateFormData && updateFormData({ total_budget: e.target.value === '' ? 0 : Number(e.target.value) })
                }
                onBlur={(e) =>
                  updateFormData && updateFormData({ total_budget: Math.max(10000, Number(e.target.value)) })
                }
                placeholder="100000"
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#f8f7ff] border border-[#e2e0fb] text-sm font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#4338ca] outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {budgetPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateFormData && updateFormData({ total_budget: preset })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all border ${
                    totalBudget === preset
                      ? 'bg-[#4338ca] text-white border-[#4338ca]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {formatBudgetTag(preset)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Key Financial Metric Cards (Live Calculated) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 text-center pt-2 border-t border-[#e2e0fb]">
          <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Escrow View Budget
            </div>
            <div className="font-mono text-base sm:text-lg font-extrabold text-slate-900 truncate" title={`₦${totalBudget.toLocaleString()}`}>
              {formatCompactCurrency(totalBudget)}
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              CPM Payout Rate
            </div>
            <div className="font-mono text-base sm:text-lg font-extrabold text-[#4338ca] truncate">
              ₦{cpmRate.toLocaleString()}
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Creator Slots
            </div>
            <div className="font-mono text-base sm:text-lg font-extrabold text-amber-700 truncate" title={`${creatorSlots.toLocaleString()} Slots`}>
              {formatCompactNumber(creatorSlots)} Slots
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Est. Total Views
            </div>
            <div className="font-mono text-base sm:text-lg font-extrabold text-emerald-700 truncate" title={`${potentialViews.toLocaleString()} Views`}>
              {formatCompactNumber(potentialViews)}
            </div>
          </div>
        </div>

        {/* Enhanced Itemized Checkout Table */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e0fb] space-y-3 shadow-2xs">
          <div className="text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
            Itemized Payment Breakdown
          </div>

          <div className="flex justify-between items-center text-xs text-slate-600 gap-3">
            <span className="font-medium shrink-0">Campaign Escrow View Budget</span>
            <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm shrink-0 whitespace-nowrap">
              ₦{totalBudget.toLocaleString()}
            </span>
          </div>

          {isFeatured && (
            <div className="flex justify-between items-center text-xs text-amber-900 bg-amber-50/80 px-3.5 py-2 rounded-xl border border-amber-200/80 gap-3">
              <span className="flex items-center gap-1.5 font-bold shrink-0">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Featured Add-On</span>
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-amber-600 shrink-0 whitespace-nowrap">+₦2,500</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-slate-200 gap-3">
            <span className="font-display font-extrabold text-sm sm:text-base text-slate-900 shrink-0 whitespace-nowrap">Total Due</span>
            <span className="font-mono text-base sm:text-lg font-extrabold text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-2xs shrink-0 whitespace-nowrap">
              ₦{totalPayable.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Promote as Featured Campaign (+₦2,500 Add-On Fee) Card */}
      <div
        onClick={toggleFeatured}
        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
          isFeatured
            ? 'bg-[#eeedfd] border-2 border-amber-500 shadow-xs'
            : 'bg-[#f8f7ff] border border-[#e2e0fb] hover:border-slate-300'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              isFeatured ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h4 className="font-display font-extrabold text-sm text-slate-900">
                Promote
              </h4>
              <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                +₦2,500 Add-On
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Get sticky top placement on the creator catalogue with a golden <strong>FEATURED</strong> badge.
              <br />
              <span className="text-[11px] font-medium text-amber-800">
                Note: The ₦2,500 fee is billed separately as a platform service fee and is NOT deducted from your Campaign Budget.
              </span>
            </p>
          </div>
        </div>

        <input
          type="checkbox"
          checked={isFeatured}
          onChange={() => {}}
          className="w-5 h-5 rounded border-amber-400 text-amber-600 focus:ring-amber-500 mt-1 cursor-pointer"
        />
      </div>

      {/* Escrow Deposit Method (Prominent Cards with Wallet Balance) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-900">Escrow Payment & Funding Method</label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Kpugi Escrow Wallet */}
          <div
            onClick={() => setPaymentMethod('wallet')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
              paymentMethod === 'wallet'
                ? 'bg-[#eeedfd] border-2 border-[#4338ca] text-[#4338ca] shadow-sm'
                : 'bg-[#f8f7ff] border border-[#e2e0fb] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    paymentMethod === 'wallet'
                      ? 'bg-[#4338ca] text-white shadow-xs'
                      : 'bg-[#e9e6fd] text-[#4338ca]'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-slate-900">
                    Wallet Balance
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Instantly lock ₦{totalPayable.toLocaleString()} from brand balance
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  paymentMethod === 'wallet'
                    ? 'border-[#4338ca] bg-[#4338ca] text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {paymentMethod === 'wallet' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>

            <div className="pt-2 border-t border-[#dcd8fc]/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Available Balance:</span>
              <span className="font-mono font-extrabold text-[#4338ca] bg-white px-2.5 py-0.5 rounded-full border border-[#dcd8fc]">
                ₦{walletBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Option 2: Instant Card & Bank Transfer */}
          <div
            onClick={() => setPaymentMethod('paystack')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
              paymentMethod === 'paystack'
                ? 'bg-[#eeedfd] border-2 border-[#4338ca] text-[#4338ca] shadow-sm'
                : 'bg-[#f8f7ff] border border-[#e2e0fb] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    paymentMethod === 'paystack'
                      ? 'bg-[#4338ca] text-white shadow-xs'
                      : 'bg-[#e9e6fd] text-[#4338ca]'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-slate-900">
                    Instant Card & Bank Transfer
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Debit Card, Bank Transfer or USSD checkout
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  paymentMethod === 'paystack'
                    ? 'border-[#4338ca] bg-[#4338ca] text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {paymentMethod === 'paystack' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>

            <div className="pt-2 border-t border-[#dcd8fc]/60 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Instant Escrow Funding</span>
              <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Instant Activation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Notice Box */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <FileCheck className="w-4 h-4 text-[#4338ca] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          By launching this campaign, you agree to Kpugi's{' '}
          <a href="#" className="text-[#4338ca] font-bold underline">
            Brand Terms of Service
          </a>
          , Campaign Budget Allocation Policy, and Creator Payout Verification Guidelines. Creator payouts are released strictly upon verified CPM view deliverables.
        </p>
      </div>
    </div>
  );
}
