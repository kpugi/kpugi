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
      <div className="space-y-8 font-sans animate-fadeIn">
        {/* Step Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold mx-auto mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>PAYMENT VERIFIED & LOCKED</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Campaign Fully Funded!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Payment for this campaign has already been completed. Funds are safely locked.
          </p>
        </div>

        {/* Paid Receipt Summary Card */}
        <div className="p-6 rounded-3xl bg-[#f8f7ff] border border-[#e2e0fb] space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e2e0fb] pb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#4338ca]" />
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">
                  Payment Reference
                </h3>
                <p className="text-[11px] text-slate-500">Verified transaction record</p>
              </div>
            </div>
            <span className="font-mono text-sm font-extrabold text-[#4338ca] bg-white px-3.5 py-1.5 rounded-full border border-[#dcd8fc] shadow-2xs">
              {formData.paystack_reference || `KPG-PAY-${Date.now().toString().slice(-6)}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
              <div className="font-bold text-emerald-600 text-xs flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Paid & Verified</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</div>
              <div className="font-bold text-slate-900 text-xs capitalize">
                {paymentMethod === 'wallet' ? 'Kpugi Wallet' : 'Card / Transfer'}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Campaign Budget</div>
              <div className="font-mono text-sm font-extrabold text-slate-900">
                ₦{totalBudget.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Paid</div>
              <div className="font-mono text-sm font-extrabold text-emerald-600">
                ₦{totalPayable.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Proceed to Step 5 Action Card */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl text-center">
          <h3 className="font-display font-extrabold text-lg text-white">
            Ready for Final Launch
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Your campaign is funded. Proceed to review your live creator briefing card and launch your campaign to creators.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onProceedToStep5}
              className="px-8 py-3.5 rounded-full bg-[#4338ca] hover:bg-[#3730a3] text-white text-sm font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
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
    <div className="space-y-8 font-sans">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Okay let's get this funded
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Set your custom CPM payout rate, configure Campaign Budget, and complete payment to proceed to final launch.
        </p>
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
                CPM & Budget
              </h3>
              <p className="text-[11px] text-slate-500">
                Set what you are willing to pay per 1,000 views.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Custom CPM Input & Presets */}
          <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200">
            <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#4338ca]" />
                <span>CPM*</span>
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
                  updateFormData({ cpm_rate: Math.max(2000, Number(e.target.value)) })
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
                  onClick={() => updateFormData({ cpm_rate: preset })}
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
                <span>Total Campaign Budget (₦) *</span>
              </span>
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
                  updateFormData({ total_budget: e.target.value === '' ? 0 : Number(e.target.value) })
                }
                onBlur={(e) =>
                  updateFormData({ total_budget: Math.max(10000, Number(e.target.value)) })
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
                  onClick={() => updateFormData({ total_budget: preset })}
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

        {/* Live Calculated Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center pt-2 border-t border-[#e2e0fb]">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Campaign Budget
            </div>
            <div className="font-mono text-lg font-extrabold text-slate-900">
              ₦{totalBudget.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              CPM Rate
            </div>
            <div className="font-mono text-lg font-extrabold text-[#4338ca]">
              ₦{cpmRate.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Creator Slots
            </div>
            <div className="font-mono text-lg font-extrabold text-amber-700">
              {creatorSlots} Slots
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Est. Total Views
            </div>
            <div className="font-mono text-lg font-extrabold text-emerald-700">
              {potentialViews.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Itemized Checkout Table */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e0fb] space-y-3.5 shadow-2xs">
          <div className="text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
            Payment Breakdown
          </div>

          <div className="flex justify-between items-center text-xs text-slate-600">
            <span className="font-medium">Campaign Budget</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              ₦{totalBudget.toLocaleString()}
            </span>
          </div>

          {isFeatured && (
            <div className="flex justify-between items-center text-xs text-amber-900 bg-amber-50/80 px-3.5 py-2.5 rounded-xl border border-amber-200/80">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Add-On</span>
              </span>
              <span className="font-mono font-bold text-sm text-amber-900">+₦2,500</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-3 border-t border-slate-200">
            <span className="font-display text-base">Total :</span>
            <span className="font-mono text-xl font-extrabold text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
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
                Add-On
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
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
        <label className="text-xs font-bold text-slate-900">Payment Method</label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Kpugi Escrow Wallet */}
          <div
            onClick={() => updateFormData({ payment_method: 'wallet' })}
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
                    Lock ₦{totalPayable.toLocaleString()} from brand balance
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
            onClick={() => updateFormData({ payment_method: 'paystack' })}
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
              <span>Paystack Checkout</span>
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
          By proceeding with payment, you agree to Kpugi's{' '}
          <a href="#" className="text-[#4338ca] font-bold underline">
            Brand Terms of Service
          </a>
          , Campaign Budget Allocation Policy, and Creator Payout Verification Guidelines.
        </p>
      </div>
    </div>
  );
}
