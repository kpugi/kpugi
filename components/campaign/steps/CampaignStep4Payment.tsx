'use client';

import React from 'react';
import {
  Lock,
  Sparkles,
  Wallet,
  CreditCard,
  FileCheck,
  Coins,
  TrendingUp,
  CheckCircle2,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/utils/format';

interface Step4Props {
  formData: any;
  updateFormData: (fields: Partial<any>) => void;
  walletBalance?: number;
  isSubmitting: boolean;
  onInitiatePayment: () => void;
  onProceedToStep5?: () => void;
}

export function CampaignStep4Payment({
  formData,
  updateFormData,
  walletBalance = 0,
  isSubmitting,
  onInitiatePayment,
  onProceedToStep5,
}: Step4Props) {
  const cpmRate = Math.max(2000, Number(formData.cpm_rate || 2000));
  const totalBudget = Math.max(10000, Number(formData.total_budget || 100000));

  const creatorSlots = cpmRate > 0 ? Math.floor(totalBudget / cpmRate) : 0;
  const potentialViews = cpmRate > 0 ? Math.floor((totalBudget / cpmRate) * 1000) : 0;

  const isFeatured = Boolean(formData.is_featured);
  const featuredFee = isFeatured ? 2500 : 0;
  const totalPayable = totalBudget + featuredFee;
  const paymentMethod = formData.payment_method || 'wallet';

  const isAlreadyPaid = Boolean(formData.paystack_reference || formData.is_paid);

  const toggleFeatured = () => {
    if (isAlreadyPaid) return; // Locked once paid
    updateFormData({ is_featured: !isFeatured });
  };

  const cpmPresets = [2000, 2500, 3500, 5000, 7500, 10000];
  const budgetPresets = [25000, 50000, 100000, 250000, 500000, 1000000];

  const formatBudgetTag = (val: number) => {
    if (val >= 1000000) return `₦${val / 1000000}M`;
    return `₦${val / 1000}k`;
  };

  // Render Already Paid / Funded Success State
  if (isAlreadyPaid) {
    return (
      <div className="space-y-8 font-sans animate-fadeIn text-slate-900 dark:text-white">
        {/* Step Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-mono font-bold mx-auto mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>PAYMENT VERIFIED & LOCKED</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Campaign Fully Funded!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Payment for this campaign has already been completed. Funds are safely locked.
          </p>
        </div>

        {/* Paid Receipt Summary Card */}
        <div className="p-6 rounded-3xl bg-[#f8f7ff] dark:bg-white/[0.03] border border-[#e2e0fb] dark:border-white/10 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e2e0fb] dark:border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#4338ca] dark:text-indigo-400" />
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">
                  Payment Reference
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Verified transaction record</p>
              </div>
            </div>
            <span className="font-mono text-sm font-extrabold text-[#4338ca] dark:text-indigo-400 bg-white dark:bg-white/10 px-3.5 py-1.5 rounded-full border border-[#dcd8fc] dark:border-white/10 shadow-2xs">
              {formData.paystack_reference || `KPG-PAY-${Date.now().toString().slice(-6)}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
            <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Status</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Paid & Verified</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Payment Method</div>
              <div className="font-bold text-slate-900 dark:text-white text-xs capitalize">
                {paymentMethod === 'wallet' ? 'Kpugi Wallet' : 'Card / Transfer'}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Campaign Budget</div>
              <div className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                ₦{totalBudget.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Total Paid</div>
              <div className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                ₦{totalPayable.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Proceed to Step 5 Action Card */}
        <div className="p-6 rounded-3xl bg-slate-900 dark:bg-[#161820] text-white space-y-4 shadow-xl text-center border border-transparent dark:border-white/10">
          <h3 className="font-display font-extrabold text-lg text-white">
            Ready for Final Launch
          </h3>
          <p className="text-xs text-slate-300 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Your campaign is funded. Proceed to review your live creator briefing card and launch your campaign to creators.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onProceedToStep5}
              className="px-8 py-3.5 rounded-full bg-[#4338ca] hover:bg-[#3730a3] dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-sm font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
            >
              <span>Publish & Launch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-slate-900 dark:text-white">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Okay let's get this funded
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Set your custom CPM payout rate, configure Campaign Budget, and complete payment to proceed to final launch.
        </p>
      </div>

      {/* Interactive Custom CPM Rate & Campaign Budget Setup */}
      <div className="p-6 rounded-3xl bg-[#f8f7ff] dark:bg-white/[0.03] border border-[#e2e0fb] dark:border-white/10 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e2e0fb] dark:border-white/10 pb-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <div className="w-8 h-8 rounded-full bg-[#eeedfd] dark:bg-indigo-950/60 text-[#4338ca] dark:text-indigo-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                CPM & Budget
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Set what you are willing to pay per 1,000 views.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Custom CPM Input & Presets */}
          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#4338ca] dark:text-indigo-400" />
                <span>CPM*</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                Min: ₦2,000
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-extrabold text-slate-400 dark:text-slate-500">
                ₦
              </span>
              <input
                type="number"
                min={2000}
                step={250}
                value={formData.cpm_rate || 2000}
                onChange={(e) =>
                  updateFormData({ cpm_rate: Math.max(2000, Number(e.target.value)) })
                }
                placeholder="2000"
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#f8f7ff] dark:bg-white/5 border border-[#e2e0fb] dark:border-white/10 text-sm font-mono font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#161820] focus:ring-2 focus:ring-[#4338ca] dark:focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {cpmPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateFormData({ cpm_rate: preset })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all border ${
                    cpmRate === preset
                      ? 'bg-[#4338ca] dark:bg-indigo-600 text-white border-[#4338ca] dark:border-indigo-600'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  ₦{preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Total Campaign Budget Input & Presets */}
          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#4338ca] dark:text-indigo-400" />
                <span>Total Campaign Budget (₦) *</span>
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-extrabold text-slate-400 dark:text-slate-500">
                ₦
              </span>
              <input
                type="number"
                min={10000}
                step={5000}
                value={formData.total_budget ?? ''}
                onChange={(e) =>
                  updateFormData({ total_budget: e.target.value === '' ? 0 : Number(e.target.value) })
                }
                onBlur={(e) =>
                  updateFormData({ total_budget: Math.max(10000, Number(e.target.value)) })
                }
                placeholder="100000"
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#f8f7ff] dark:bg-white/5 border border-[#e2e0fb] dark:border-white/10 text-sm font-mono font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#161820] focus:ring-2 focus:ring-[#4338ca] dark:focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {budgetPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateFormData({ total_budget: preset })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all border ${
                    totalBudget === preset
                      ? 'bg-[#4338ca] dark:bg-indigo-600 text-white border-[#4338ca] dark:border-indigo-600'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  {formatBudgetTag(preset)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Calculated Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 text-center pt-2 border-t border-[#e2e0fb] dark:border-white/10">
          <div className="p-3 sm:p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Campaign Budget
            </div>
            <div className="font-mono text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate" title={`₦${totalBudget.toLocaleString()}`}>
              {formatCompactCurrency(totalBudget)}
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              CPM Rate
            </div>
            <div className="font-mono text-base sm:text-lg font-extrabold text-[#4338ca] dark:text-indigo-400 truncate">
              ₦{cpmRate.toLocaleString()}
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Creator Slots
            </div>
            <div className="font-mono text-base sm:text-lg font-extrabold text-amber-700 dark:text-amber-400 truncate" title={`${creatorSlots.toLocaleString()} Slots`}>
              {formatCompactNumber(creatorSlots)} Slots
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Est. Total Views
            </div>
            <div className="font-mono text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-400 truncate" title={`${potentialViews.toLocaleString()} Views`}>
              {formatCompactNumber(potentialViews)}
            </div>
          </div>
        </div>

        {/* Itemized Checkout Table */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/5 border border-[#e2e0fb] dark:border-white/10 space-y-3 shadow-2xs">
          <div className="text-xs font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-2.5 uppercase tracking-wide">
            Payment Breakdown
          </div>

          <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-300 gap-3">
            <span className="font-medium shrink-0">Campaign Budget</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm shrink-0 whitespace-nowrap">
              ₦{totalBudget.toLocaleString()}
            </span>
          </div>

          {isFeatured && (
            <div className="flex justify-between items-center text-xs text-amber-900 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 px-3.5 py-2 rounded-xl border border-amber-200/80 dark:border-amber-500/30 gap-3">
              <span className="flex items-center gap-1.5 font-bold shrink-0">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Featured Add-On</span>
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-300 shrink-0 whitespace-nowrap">+₦2,500</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-white/10 gap-3">
            <span className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white shrink-0 whitespace-nowrap">Total Due</span>
            <span className="font-mono text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30 shadow-2xs shrink-0 whitespace-nowrap">
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
            ? 'bg-[#eeedfd] dark:bg-indigo-950/40 border-2 border-amber-500 shadow-xs'
            : 'bg-[#f8f7ff] dark:bg-white/[0.03] border border-[#e2e0fb] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              isFeatured ? 'bg-amber-500 text-white' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">
                Promote
              </h4>
              <span className="text-[10px] font-mono font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/40">
                Add-On
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Get sticky top placement on the creator catalogue with a golden <strong>FEATURED</strong> badge.
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

      {/* Escrow Deposit Method Selection Cards */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-900 dark:text-white">Payment Method</label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Kpugi Escrow Wallet */}
          <div
            onClick={() => updateFormData({ payment_method: 'wallet' })}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
              paymentMethod === 'wallet'
                ? 'bg-[#eeedfd] dark:bg-indigo-950/40 border-2 border-[#4338ca] dark:border-indigo-500 text-[#4338ca] dark:text-indigo-300 shadow-sm'
                : 'bg-[#f8f7ff] dark:bg-white/[0.03] border border-[#e2e0fb] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    paymentMethod === 'wallet'
                      ? 'bg-[#4338ca] dark:bg-indigo-600 text-white shadow-xs'
                      : 'bg-[#e9e6fd] dark:bg-white/10 text-[#4338ca] dark:text-indigo-400'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">
                    Wallet Balance
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Lock ₦{totalPayable.toLocaleString()} from brand balance
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  paymentMethod === 'wallet'
                    ? 'border-[#4338ca] bg-[#4338ca] text-white'
                    : 'border-slate-300 dark:border-white/20 bg-white dark:bg-white/5'
                }`}
              >
                {paymentMethod === 'wallet' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>

            <div className="pt-2 border-t border-[#dcd8fc]/60 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Available Balance:</span>
              <span className="font-mono font-extrabold text-[#4338ca] dark:text-indigo-400 bg-white dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-[#dcd8fc] dark:border-white/10">
                ₦{walletBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Option 2: Instant Card & Bank Transfer */}
          <div
            onClick={() => updateFormData({ payment_method: 'paystack' })}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
              paymentMethod === 'paystack'
                ? 'bg-[#eeedfd] dark:bg-indigo-950/40 border-2 border-[#4338ca] dark:border-indigo-500 text-[#4338ca] dark:text-indigo-300 shadow-sm'
                : 'bg-[#f8f7ff] dark:bg-white/[0.03] border border-[#e2e0fb] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    paymentMethod === 'paystack'
                      ? 'bg-[#4338ca] dark:bg-indigo-600 text-white shadow-xs'
                      : 'bg-[#e9e6fd] dark:bg-white/10 text-[#4338ca] dark:text-indigo-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">
                    Instant Card & Bank Transfer
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Debit Card, Bank Transfer or USSD checkout
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  paymentMethod === 'paystack'
                    ? 'border-[#4338ca] bg-[#4338ca] text-white'
                    : 'border-slate-300 dark:border-white/20 bg-white dark:bg-white/5'
                }`}
              >
                {paymentMethod === 'paystack' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>

            <div className="pt-2 border-t border-[#dcd8fc]/60 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Paystack Checkout</span>
              <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                Instant Activation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Notice Box */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <FileCheck className="w-4 h-4 text-[#4338ca] dark:text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          By proceeding with payment, you agree to Kpugi's{' '}
          <a href="#" className="text-[#4338ca] dark:text-indigo-400 font-bold underline">
            Brand Terms of Service
          </a>
          , Campaign Budget Allocation Policy, and Creator Payout Verification Guidelines.
        </p>
      </div>
    </div>
  );
}
