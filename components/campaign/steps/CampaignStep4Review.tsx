'use client';

import React, { useState } from 'react';
import { ShieldCheck, Rocket, Eye, CheckCircle2, Lock, FileText, Link as LinkIcon, Sparkles } from 'lucide-react';

interface Step4Props {
  formData: any;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function CampaignStep4Review({ formData, isSubmitting, onSubmit }: Step4Props) {
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paystack'>('wallet');

  const cpmRate = Number(formData.cpm_rate || 2000);
  const minThreshold = Number(formData.min_view_threshold || 1000);
  const totalBudget = Number(formData.total_budget || 100000);

  const baseReserve = Math.round((minThreshold / 1000) * cpmRate);
  const creatorSlots = cpmRate > 0 ? Math.floor(totalBudget / cpmRate) : 0;
  const potentialViews = cpmRate > 0 ? Math.floor((totalBudget / cpmRate) * 1000) : 0;

  const hashtags: string[] = formData.requirements?.hashtags || ['#KpugiLaunch'];
  const mentions: string[] = formData.requirements?.mentions || ['@KpugiApp'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="font-display text-xl font-bold text-kpugi-ink">
          Step 4: Final Review, Escrow Deposit & Launch
        </h2>
        <p className="text-xs text-kpugi-slate mt-0.5">
          Review your creator briefing card, confirm escrow budget allocation, and publish your ad campaign.
        </p>
      </div>

      {/* Live Creator Briefing Card Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-kpugi-ink flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-kpugi-blue" />
            <span>Live Creator Briefing Preview (How Creators See It)</span>
          </label>
          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Grab & Post Enabled
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-5 shadow-lg border border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE CAMPAIGN</span>
              </div>
              <h3 className="font-display text-xl font-extrabold">{formData.title || 'Untitled Campaign'}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                {formData.description || 'No description provided.'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-xl font-extrabold text-amber-400">
                ₦{cpmRate.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ 1k views</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                Min View Goal: {minThreshold.toLocaleString()} views
              </div>
            </div>
          </div>

          {/* Grab & Post Creative Box */}
          {formData.requirements?.creative_text_copy && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Approved Post Caption (Creators Copy This)</span>
                </span>
                <span className="text-[10px] font-mono bg-amber-400/20 px-2 py-0.5 rounded">Ready to Post</span>
              </div>
              <p className="text-xs text-slate-200 font-mono italic leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                "{formData.requirements.creative_text_copy}"
              </p>
            </div>
          )}

          {/* Mandatory Hashtags & Mentions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 text-xs">
            <span className="text-slate-400 font-bold text-[11px]">Mandatory Tags:</span>
            {hashtags.map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30">
                {tag}
              </span>
            ))}
            {mentions.map((m: string) => (
              <span key={m} className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Financial & Escrow Summary Card */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-kpugi-ink">
            <Lock className="w-4 h-4 text-kpugi-blue" />
            <span className="font-display font-bold text-sm">Escrow Budget Allocation Summary</span>
          </div>
          <span className="text-xs font-mono font-bold text-kpugi-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Escrow Protected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-kpugi-slate uppercase">Total Budget</div>
            <div className="font-mono text-base font-extrabold text-kpugi-ink mt-0.5">
              ₦{totalBudget.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-kpugi-slate uppercase">CPM Payout Rate</div>
            <div className="font-mono text-base font-extrabold text-kpugi-blue mt-0.5">
              ₦{cpmRate.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-kpugi-slate uppercase">Creator Slots</div>
            <div className="font-mono text-base font-extrabold text-amber-700 mt-0.5">
              {creatorSlots} Slots
            </div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-kpugi-slate uppercase">Est. Total Views</div>
            <div className="font-mono text-base font-extrabold text-emerald-700 mt-0.5">
              {potentialViews.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Escrow Deposit Method */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-kpugi-ink">Escrow Payment & Funding Method</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => setPaymentMethod('wallet')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
              paymentMethod === 'wallet'
                ? 'bg-kpugi-blue/5 border-kpugi-blue ring-1 ring-kpugi-blue'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="w-5 h-5 rounded-full border border-kpugi-blue bg-kpugi-blue text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-kpugi-ink">Kpugi Escrow Wallet</h4>
              <p className="text-[11px] text-kpugi-slate mt-0.5">
                Instantly lock ₦{totalBudget.toLocaleString()} from your brand wallet escrow.
              </p>
            </div>
          </div>

          <div
            onClick={() => setPaymentMethod('paystack')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
              paymentMethod === 'paystack'
                ? 'bg-kpugi-blue/5 border-kpugi-blue ring-1 ring-kpugi-blue'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
              {paymentMethod === 'paystack' && <CheckCircle2 className="w-3.5 h-3.5 text-kpugi-blue" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-kpugi-ink">Paystack Instant Escrow Checkout</h4>
              <p className="text-[11px] text-kpugi-slate mt-0.5">
                Pay via Debit Card, Bank Transfer, or USSD to lock escrow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Launch CTA Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-kpugi-slate">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Smart Contract Protected — Creator payouts released upon verified views.</span>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="px-6 py-3 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-kpugi-blue-dark transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
        >
          <Rocket className="w-4 h-4" />
          <span>{isSubmitting ? 'Publishing Campaign...' : 'Publish & Launch Campaign'}</span>
        </button>
      </div>
    </div>
  );
}
