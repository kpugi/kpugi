'use client';

import React, { useState } from 'react';
import { BrandSettingsData } from '@/lib/supabase/advertiser';
import { updateBrandCampaignDefaultsAction } from '@/app/actions/advertiser';
import {
  Sliders,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface BrandCampaignDefaultsTabProps {
  data: BrandSettingsData;
}

export default function BrandCampaignDefaultsTab({ data }: BrandCampaignDefaultsTabProps) {
  const [defaultGraceHours, setDefaultGraceHours] = useState(
    data.advertiser.campaignDefaults.defaultGraceHours || 48
  );
  const [defaultLiveHours, setDefaultLiveHours] = useState(
    data.advertiser.campaignDefaults.defaultLiveHours || 24
  );
  const [preferKycCreators, setPreferKycCreators] = useState(
    data.advertiser.campaignDefaults.preferKycCreators || false
  );
  const [autoPauseThresholdPct, setAutoPauseThresholdPct] = useState(
    data.advertiser.campaignDefaults.autoPauseThresholdPct || 95
  );

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await updateBrandCampaignDefaultsAction({
        defaultGraceHours,
        defaultLiveHours,
        preferKycCreators,
        autoPauseThresholdPct,
      });

      if (!res.success) {
        setMessage({ type: 'error', text: res.error || 'Failed to save campaign defaults.' });
      } else {
        setMessage({ type: 'success', text: 'Campaign defaults and governance rules updated successfully!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toast Feedback */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Verification & Submission Windows */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-xs space-y-6">
        <div>
         
          <h2 className="font-display text-xl font-bold text-kpugi-ink mt-1">Verification Windows & Timing</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-configure default audit and post life parameters for new campaign creation flows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Default Grace Period */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Default Verification Grace Period
            </label>
            <select
              value={defaultGraceHours}
              onChange={(e) => setDefaultGraceHours(Number(e.target.value))}
              className="w-full p-3.5 rounded-xl border border-kpugi-border bg-slate-50 text-xs sm:text-sm text-kpugi-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
            >
              <option value={24}>24 Hours (Fast Verification)</option>
              <option value={48}>48 Hours (Recommended Standard)</option>
              <option value={72}>72 Hours (Extended Review Window)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Time window for AI view audit scraping and manual submission approvals.
            </p>
          </div>

          {/* Default Required Live Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Default Minimum Live Post Duration
            </label>
            <select
              value={defaultLiveHours}
              onChange={(e) => setDefaultLiveHours(Number(e.target.value))}
              className="w-full p-3.5 rounded-xl border border-kpugi-border bg-slate-50 text-xs sm:text-sm text-kpugi-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
            >
              <option value={24}>24 Hours Minimum</option>
              <option value={48}>48 Hours Minimum</option>
              <option value={72}>72 Hours Minimum (Maximum Reach)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum duration creator content must stay publicly accessible before final escrow payout.
            </p>
          </div>
        </div>
      </div>

      {/* Quality & Budget Protection Rules */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-kpugi-blue font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Brand Protection</span>
          </div>
          <h2 className="font-display text-xl font-bold text-kpugi-ink mt-1">Quality & Budget Overrun Rules</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated safety rules to optimize creator quality and safeguard campaign budgets.
          </p>
        </div>

        <div className="space-y-4">
          {/* Prioritize KYC Creators */}
          <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-kpugi-ink">
                  Prioritize KYC-Verified Creators
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-kpugi-blue/10 text-kpugi-blue border border-kpugi-blue/20">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Prioritize campaign applications from creators with verified government identity (NIN/BVN) and verified bank accounts.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={preferKycCreators}
                onChange={(e) => setPreferKycCreators(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kpugi-blue"></div>
            </label>
          </div>

          {/* Auto-Pause Threshold */}
          <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-kpugi-ink">
                  Auto-Pause Campaigns at 95% Budget Spent
                </span>
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-xs text-slate-500">
                Automatically stops new creator joins once 95% of the campaign escrow budget has been reserved to prevent budget overflows.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoPauseThresholdPct === 95}
                onChange={(e) => setAutoPauseThresholdPct(e.target.checked ? 95 : 100)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kpugi-blue"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3.5 bg-kpugi-blue hover:bg-kpugi-blue/90 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-kpugi-blue/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving Defaults...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Save Campaign Defaults
            </>
          )}
        </button>
      </div>
    </form>
  );
}
