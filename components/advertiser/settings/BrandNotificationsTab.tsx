'use client';

import React, { useState } from 'react';
import { BrandSettingsData } from '@/lib/supabase/advertiser';
import { updateBrandNotificationPreferencesAction } from '@/app/actions/advertiser';
import {
  Bell,
  Sparkles,
  Layers,
  Wallet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

interface BrandNotificationsTabProps {
  data: BrandSettingsData;
}

export default function BrandNotificationsTab({ data }: BrandNotificationsTabProps) {
  const [emailMilestones, setEmailMilestones] = useState(
    data.advertiser.notificationPreferences.emailMilestones ?? true
  );
  const [emailSubmissions, setEmailSubmissions] = useState(
    data.advertiser.notificationPreferences.emailSubmissions ?? true
  );
  const [emailWallet, setEmailWallet] = useState(
    data.advertiser.notificationPreferences.emailWallet ?? true
  );
  const [weeklyDigest, setWeeklyDigest] = useState(
    data.advertiser.notificationPreferences.weeklyDigest ?? true
  );

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await updateBrandNotificationPreferencesAction({
        emailMilestones,
        emailSubmissions,
        emailWallet,
        weeklyDigest,
      });

      if (!res.success) {
        setMessage({ type: 'error', text: res.error || 'Failed to save notification preferences.' });
      } else {
        setMessage({ type: 'success', text: 'Notification preferences updated successfully!' });
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

      {/* Notification Preferences Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-kpugi-blue font-bold text-xs uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Alert Preferences</span>
          </div>
          <h2 className="font-display text-xl font-bold text-kpugi-ink mt-1">Email Alert Channels</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Notifications are sent to <strong className="text-slate-700">{data.advertiser.billingEmail || data.profile.email}</strong>.
          </p>
        </div>

        <div className="space-y-3.5">
          {/* Campaign Milestones */}
          <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-kpugi-blue/10 text-kpugi-blue flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-kpugi-ink">Campaign Milestones & Budget Usage</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Real-time alerts when a campaign launches, hits 50% budget allocated, or delivers 100% target views.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={emailMilestones}
                onChange={(e) => setEmailMilestones(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kpugi-blue"></div>
            </label>
          </div>

          {/* Creator Submissions & AI View Audits */}
          <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-kpugi-ink">Creator Submissions & View Audits</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Receive notifications when creators clock in video proof links and when automated view audits verify views and release escrow.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={emailSubmissions}
                onChange={(e) => setEmailSubmissions(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kpugi-blue"></div>
            </label>
          </div>

          {/* Financial & Deposit Confirmations */}
          <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-kpugi-ink">Financial & Wallet Confirmations</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Instant receipts when funding your wallet or locking budget for new campaign escrows.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={emailWallet}
                onChange={(e) => setEmailWallet(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kpugi-blue"></div>
            </label>
          </div>

          {/* Weekly Performance Digest */}
          <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-kpugi-ink">Weekly Performance & ROI Digest</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every Monday morning executive summary with CPM efficiency, top-performing creators, and total views delivered.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
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
              Saving Preferences...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Save Notification Preferences
            </>
          )}
        </button>
      </div>
    </form>
  );
}
