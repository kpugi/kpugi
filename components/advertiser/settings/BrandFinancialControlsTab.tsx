'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BrandSettingsData } from '@/lib/supabase/advertiser';
import { updateBrandFinancialSettingsAction } from '@/app/actions/advertiser';
import {
  Wallet,
  BellRing,
  AlertTriangle,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Coins,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface BrandFinancialControlsTabProps {
  data: BrandSettingsData;
}

const PRESET_THRESHOLDS = [20000, 50000, 100000, 250000];

export default function BrandFinancialControlsTab({ data }: BrandFinancialControlsTabProps) {
  const [lowBalanceAlertEnabled, setLowBalanceAlertEnabled] = useState(
    data.advertiser.lowBalanceAlertEnabled ?? true
  );
  const [threshold, setThreshold] = useState<number>(
    Number(data.advertiser.lowBalanceAlertThreshold || 50000)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await updateBrandFinancialSettingsAction({
        lowBalanceAlertEnabled,
        lowBalanceAlertThreshold: threshold,
      });

      if (!res.success) {
        setMessage({ type: 'error', text: res.error || 'Failed to save financial settings.' });
      } else {
        setMessage({ type: 'success', text: 'Financial control settings updated successfully!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  const isLowBalance = data.wallet.balance < threshold;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-kpugi-ink dark:text-white">
      {/* Toast Feedback */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
              : 'bg-red-50 dark:bg-rose-950/40 text-red-800 dark:text-rose-300 border border-red-200 dark:border-rose-500/30'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Live Brand Wallet Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-xl font-bold text-kpugi-ink dark:text-white mt-1">Current Brand Liquidity</h2>
            
            <div className="flex items-baseline gap-6 mt-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available Balance</p>
                <p className="font-mono text-2xl sm:text-3xl font-extrabold text-kpugi-naira">
                  ₦{data.wallet.balance.toLocaleString()}
                </p>
              </div>
              <div className="border-l border-kpugi-border dark:border-white/10 pl-6">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Escrow Locked</p>
                <p className="font-mono text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300">
                  ₦{data.wallet.escrowLocked.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/b/wallet"
              className="px-5 py-3 bg-kpugi-blue hover:bg-kpugi-blue/90 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-kpugi-blue/20 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Coins className="w-4 h-4" />
              Top Up Wallet
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {isLowBalance && lowBalanceAlertEnabled && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Low Balance Warning:</span> Your available balance (₦{data.wallet.balance.toLocaleString()}) is currently below your configured alert threshold (₦{threshold.toLocaleString()}). Top up soon to avoid interruption of creator payouts or campaign auto-pausing.
            </div>
          </div>
        )}
      </div>

      {/* Automated Low-Balance Guardrail */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-kpugi-ink dark:text-white mt-1">Low-Balance Email Alerts</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Receive automatic alerts when your available funding balance drops below your safety limit.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={lowBalanceAlertEnabled}
              onChange={(e) => setLowBalanceAlertEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kpugi-blue"></div>
          </label>
        </div>

        {lowBalanceAlertEnabled && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/10 animate-fadeIn">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Low-Balance Threshold (₦ NGN)
            </label>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {PRESET_THRESHOLDS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setThreshold(preset)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                    threshold === preset
                      ? 'bg-kpugi-blue text-white border-kpugi-blue shadow-sm'
                      : 'bg-slate-50 dark:bg-white/5 border-kpugi-border dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  ₦{preset.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="relative max-w-sm mt-3">
              <span className="absolute left-3.5 top-3.5 text-sm font-bold text-slate-400">₦</span>
              <input
                type="number"
                min="0"
                step="5000"
                value={threshold}
                onChange={(e) => setThreshold(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-kpugi-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs sm:text-sm font-mono text-kpugi-ink dark:text-white focus:bg-white dark:focus:bg-[#161820] focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Immediate alert emails will be sent to <strong className="text-slate-700 dark:text-slate-300">{data.advertiser.billingEmail || data.profile.email}</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Receipts & Transaction History Shortcut */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-kpugi-ink dark:text-white mt-1">Receipts & Payment History</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Access itemized PDF receipts, deposit transactions, and campaign escrow settlements.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/b/wallet"
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-kpugi-ink dark:text-white text-xs font-bold rounded-2xl border border-kpugi-border dark:border-white/10 transition-all"
          >
            <Receipt className="w-4 h-4 text-kpugi-blue dark:text-blue-400" />
            View Transactions in Wallet →
          </Link>
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
              Saving Settings...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Save Financial Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
}
