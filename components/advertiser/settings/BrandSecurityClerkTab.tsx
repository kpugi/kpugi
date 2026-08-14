'use client';

import React, { useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { BrandSettingsData } from '@/lib/supabase/advertiser';
import { syncBrandClerkIdentityAction } from '@/app/actions/advertiser';
import {
  ShieldCheck,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

interface BrandSecurityClerkTabProps {
  data: BrandSettingsData;
  onSyncSuccess: (data: { imageUrl?: string | null; name?: string | null }) => void;
}

export default function BrandSecurityClerkTab({ data, onSyncSuccess }: BrandSecurityClerkTabProps) {
  const clerk = useClerk();
  const { user } = useUser();

  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleForceSync = async () => {
    setIsSyncing(true);
    setMessage(null);

    try {
      const res = await syncBrandClerkIdentityAction();

      if (!res.success) {
        setMessage({ type: 'error', text: res.error || 'Failed to refresh account data.' });
      } else {
        setMessage({
          type: 'success',
          text: 'Account profile and credentials refreshed successfully!',
        });
        if (res.data) {
          onSyncSuccess({
            imageUrl: res.data.imageUrl,
            name: res.data.name,
          });
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'An unexpected error occurred.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenSecurityModal = () => {
    if (clerk.openUserProfile) {
      clerk.openUserProfile();
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Account Security & Identity Status */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-kpugi-blue font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Account Status</span>
            </div>
            <h2 className="font-display text-xl font-bold text-kpugi-ink mt-1">Identity & Authentication Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your brand profile credentials and active device sessions are verified and secured.
            </p>
          </div>

          <button
            type="button"
            onClick={handleForceSync}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-kpugi-blue hover:text-kpugi-blue/80 border border-kpugi-border text-xs font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Refreshing Profile...' : 'Refresh Account Data'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Account Reference ID */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Reference</p>
            <p className="text-xs font-mono font-bold text-slate-700 truncate" title={`KP-ADV-${data.profile.id.slice(0, 8).toUpperCase()}`}>
              KP-ADV-{data.profile.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Verification Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Status</p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active & Protected
            </div>
          </div>

          {/* Account Role */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Role</p>
            <p className="text-xs font-bold text-kpugi-ink">Brand Partner (Advertiser)</p>
          </div>
        </div>
      </div>

      {/* Password, 2FA & Active Sessions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-kpugi-blue font-bold text-xs uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>Login Credentials</span>
          </div>
          <h2 className="font-display text-xl font-bold text-kpugi-ink mt-1">Password & Multi-Factor Authentication (2FA)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your login password, enable two-factor authentication, and review active device sessions.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-kpugi-ink flex items-center gap-2">
              <Lock className="w-4 h-4 text-kpugi-blue" />
              Security & Credential Management
            </h4>
            <p className="text-xs text-slate-500">
              Update your account password, configure authenticator app 2FA, passkeys, and connected logins.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenSecurityModal}
            className="px-5 py-3 bg-kpugi-blue hover:bg-kpugi-blue/90 text-white text-xs font-bold rounded-2xl shadow-md shadow-kpugi-blue/20 hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            Update Password & 2FA
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 sm:p-8 rounded-3xl bg-red-50/50 border border-red-200 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Account Actions</span>
          </div>
          <h2 className="font-display text-xl font-bold text-red-900 mt-1">Danger Zone</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            If you need to close your brand partner account or export your campaign audit archive, contact support.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="mailto:support@kpugi.com?subject=Brand%20Data%20Export%20Request"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-kpugi-border transition-all"
          >
            Request Brand Data Archive (.zip)
          </a>
          <a
            href="mailto:support@kpugi.com?subject=Brand%20Account%20Closure%20Request"
            className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-all"
          >
            Request Account Deactivation
          </a>
        </div>
      </div>
    </div>
  );
}
