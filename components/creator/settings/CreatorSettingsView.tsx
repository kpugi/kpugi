'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CreatorSettingsPayload } from '@/lib/supabase/creator';
import { updateCreatorProfileAction, updateNotificationPreferencesAction } from '@/app/actions/creator';

interface CreatorSettingsViewProps {
  payload: CreatorSettingsPayload;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

const ALL_NICHES = [
  'Comedy & Memes',
  'Lifestyle & Vlog',
  'Tech & Gadgets',
  'Fashion & Beauty',
  'Gaming & Esports',
  'Entertainment & Movies',
  'Education & Career',
  'Finance & Crypto',
  'Fitness & Health',
  'Food & Travel',
];

export default function CreatorSettingsView({ payload }: CreatorSettingsViewProps) {
  const { profile, creator, socialAccounts, primaryBank, completeness } = payload;

  const [displayName, setDisplayName] = useState(creator.display_name || profile.full_name || '');
  const [creatorHandle, setCreatorHandle] = useState(creator.creator_handle || '');
  const [bio, setBio] = useState(creator.bio || '');
  const [selectedNiches, setSelectedNiches] = useState<string[]>(creator.niche_categories || []);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || PRESET_AVATARS[0]);
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  // Notification Preferences State (Live connected to DB)
  const [notifs, setNotifs] = useState(creator.notification_preferences);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifMsg, setNotifMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Form State
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live Identity Verification (KYC) State
  const [kycStatus, setKycStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>(creator.kyc_status);
  const [startingKyc, setStartingKyc] = useState(false);

  const connectedAccountsList = Object.entries(socialAccounts).map(([platform, data]) => ({
    platform,
    handle: data.handle,
    followers: data.followerCount,
  }));

  // Real-time Event Listener & Polling for Verification Results
  useEffect(() => {
    // 1. Message Event Listener for verification popup postMessage events
    const handleMessageEvent = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object') {
        const type = event.data.type || event.data.event;
        if (type === 'KYC_APPROVED' || type === 'VERIFICATION_SUCCESS') {
          setKycStatus('verified');
        } else if (type === 'KYC_PENDING' || type === 'VERIFICATION_SUBMITTED') {
          setKycStatus('pending');
        }
      }
    };

    window.addEventListener('message', handleMessageEvent);

    // 2. Real-time Status Poller while verification status is pending
    let pollInterval: NodeJS.Timeout | null = null;
    if (kycStatus === 'pending') {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/kyc/status');
          const data = await res.json();
          if (data.success && data.status) {
            setKycStatus(data.status);
            if (data.status === 'verified' || data.status === 'rejected') {
              if (pollInterval) clearInterval(pollInterval);
            }
          }
        } catch (err) {
          console.error('[KYC Status Poll Error]:', err);
        }
      }, 3000);
    }

    return () => {
      window.removeEventListener('message', handleMessageEvent);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [kycStatus]);

  async function handleToggleNotif(key: keyof typeof notifs) {
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    setSavingNotifs(true);
    setNotifMsg(null);

    const res = await updateNotificationPreferencesAction(updated);
    setSavingNotifs(false);
    if (res.success) {
      setNotifMsg({ type: 'success', text: 'Notification preferences updated live in database!' });
      setTimeout(() => setNotifMsg(null), 3000);
    } else {
      setNotifs(notifs);
      setNotifMsg({ type: 'error', text: res.error || 'Failed to update preferences.' });
    }
  }

  function handleNicheToggle(niche: string) {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter((n) => n !== niche));
    } else {
      setSelectedNiches([...selectedNiches, niche]);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    const formData = new FormData();
    formData.append('displayName', displayName);
    formData.append('creatorHandle', creatorHandle);
    formData.append('bio', bio);
    formData.append('avatarUrl', avatarUrl);
    selectedNiches.forEach((n) => formData.append('niches', n));

    const res = await updateCreatorProfileAction(formData);
    setSavingProfile(false);

    if (res.success) {
      setProfileMsg({ type: 'success', text: 'Creator control panel updated successfully!' });
      setTimeout(() => setProfileMsg(null), 4000);
    } else {
      setProfileMsg({ type: 'error', text: res.error || 'Failed to save settings.' });
    }
  }

  async function handleStartVerification() {
    setStartingKyc(true);
    try {
      const res = await fetch('/api/kyc/didit/session', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.sessionUrl) {
        setKycStatus('pending');
        window.open(data.sessionUrl, '_blank', 'width=520,height=720');
      } else {
        alert(`Verification Notice: ${data.error || 'Could not initiate identity verification session.'}`);
      }
    } catch (err: any) {
      alert(`Error starting verification: ${err.message}`);
    } finally {
      setStartingKyc(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans text-kpugi-ink">
      {/* Header Banner & Profile Summary */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-kpugi-blue/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-slate-800 shrink-0">
              <Image
                src={avatarUrl}
                alt={displayName || 'Creator'}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {displayName || 'Creator Control Panel'}
                </h1>
                {kycStatus === 'verified' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span>✓</span> Verified Creator
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Pro Creator Hub
                  </span>
                )}
              </div>

              <p className="text-slate-400 text-xs mt-1">
                {creatorHandle ? `@${creatorHandle}` : profile.email} • Control center for public profile, payouts, accounts & identity verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/campaigns"
              className="px-4 py-2.5 rounded-xl bg-kpugi-blue hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-kpugi-blue/30 transition-all flex items-center gap-1.5"
            >
              <span>Explore Campaigns</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Profile Completeness Score Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Control Panel Setup</span>
              <span className="font-bold text-kpugi-blue">{completeness.score}% Complete</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-kpugi-blue via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness.score}%` }}
              />
            </div>
          </div>

          <div className="md:col-span-8 flex flex-wrap gap-2 text-[11px]">
            {completeness.steps.map((step) => (
              <div
                key={step.id}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-medium ${
                  step.isComplete
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <span>{step.isComplete ? '✓' : '○'}</span>
                <span>{step.label}</span>
                {!step.isComplete && step.shortcutUrl && (
                  <Link href={step.shortcutUrl} className="underline text-kpugi-blue hover:text-white font-bold ml-1">
                    Fix →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Control Shortcuts Hub (Accounts, Payouts, Clean Identity Verification Card) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Social Accounts Status Card */}
        <div className="p-5 rounded-3xl bg-white border border-kpugi-border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-kpugi-blue font-bold text-xs uppercase tracking-wider">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Social Accounts</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {connectedAccountsList.length} Connected
              </span>
            </div>

            <p className="text-slate-600 text-xs mt-2 leading-relaxed">
              OAuth connected handles used for automated view verification and clock-in submissions.
            </p>

            <div className="mt-3 space-y-1.5">
              {connectedAccountsList.length > 0 ? (
                connectedAccountsList.slice(0, 3).map((acc) => (
                  <div key={acc.platform} className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                    <span className="font-semibold capitalize text-slate-800">@{acc.handle}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{acc.platform}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                  No social accounts linked yet.
                </div>
              )}
            </div>
          </div>

          <Link
            href="/accounts"
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors block"
          >
            Manage Connected Accounts →
          </Link>
        </div>

        {/* Bank Payouts Status Card */}
        <div className="p-5 rounded-3xl bg-white border border-kpugi-border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Payout Bank Account</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${primaryBank ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                {primaryBank ? 'Paystack Ready' : 'Unset'}
              </span>
            </div>

            <p className="text-slate-600 text-xs mt-2 leading-relaxed">
              Nigerian NUBAN account where verified campaign earnings are transferred automatically.
            </p>

            <div className="mt-3">
              {primaryBank ? (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">{primaryBank.accountName}</div>
                  <div className="text-[11px] text-slate-500">
                    {primaryBank.bankName} • •••• {primaryBank.accountNumber.slice(-4)}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                  Enter bank details on Earnings page to enable payouts.
                </div>
              )}
            </div>
          </div>

          <Link
            href="/earnings"
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors block"
          >
            Manage Payout Details →
          </Link>
        </div>

        {/* Clean White-labeled Identity Verification Card */}
        <div className="p-5 rounded-3xl bg-white border border-kpugi-border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Identity Verification</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                kycStatus === 'verified'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : kycStatus === 'pending'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
              }`}>
                {kycStatus === 'verified' ? '✓ Verified' : kycStatus === 'pending' ? '⏳ Under Review' : 'Required'}
              </span>
            </div>

            <p className="text-slate-600 text-xs mt-2 leading-relaxed">
              Verify your official government ID (NIN, Voter Card, or Passport) to enable instant earnings withdrawals.
            </p>

            <div className="mt-4">
              {kycStatus === 'verified' ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <span>✓ Official Government ID Verified</span>
                </div>
              ) : kycStatus === 'pending' ? (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>⏳ Verification Under Review</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Your verification submission is being checked. This card will update automatically.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-1">
                  <div className="font-bold text-slate-900">Withdrawal Requirement</div>
                  <p className="text-[11px] text-slate-500">
                    Unverified accounts cannot request earnings payouts. Complete 1-minute verification below.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            {kycStatus === 'verified' ? (
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-default"
              >
                <span>Identity Verified ✓</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartVerification}
                disabled={startingKyc}
                className="w-full py-3 rounded-xl bg-kpugi-blue hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-kpugi-blue/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {startingKyc ? (
                  <span>Launching Verification...</span>
                ) : kycStatus === 'pending' ? (
                  <span>Check Verification Status ⏳</span>
                ) : (
                  <span>Verify Identity 🛡️</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Settings Sections: Public Profile & Live DB Notification Toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Creator Profile Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleProfileSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-6">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Creator Profile & Brand</h2>
              <p className="text-slate-500 text-xs mt-0.5">Customize your public identity shown to advertisers in campaign audits.</p>
            </div>

            {profileMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-bold ${profileMsg.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                {profileMsg.text}
              </div>
            )}

            {/* Avatar Picker */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Profile Avatar</label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-kpugi-blue shadow-md bg-slate-100 shrink-0">
                  <Image src={avatarUrl} alt="Selected Avatar" fill className="object-cover" unoptimized />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(url)}
                        className={`relative w-8 h-8 rounded-xl overflow-hidden border-2 transition-all ${avatarUrl === url ? 'border-kpugi-blue scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      >
                        <Image src={url} alt={`Preset ${idx + 1}`} fill className="object-cover" unoptimized />
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    value={customAvatarInput}
                    onChange={(e) => {
                      setCustomAvatarInput(e.target.value);
                      if (e.target.value.trim()) setAvatarUrl(e.target.value.trim());
                    }}
                    placeholder="Or paste custom image URL..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-kpugi-blue"
                  />
                </div>
              </div>
            </div>

            {/* Display Name & Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="e.g. Tobi Creator"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-kpugi-blue text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Creator Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    value={creatorHandle}
                    onChange={(e) => setCreatorHandle(e.target.value.replace(/^@/, ''))}
                    placeholder="tobi_creates"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-kpugi-blue text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bio / Creator Statement
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell brands about your content style, audience demographics, and viral formats..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-kpugi-blue text-slate-900 leading-relaxed"
              />
            </div>

            {/* Niches */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Content Niches & Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_NICHES.map((niche) => {
                  const isSelected = selectedNiches.includes(niche);
                  return (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => handleNicheToggle(niche)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-kpugi-blue text-white border-kpugi-blue shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {niche} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-kpugi-blue hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {savingProfile ? (
                  <span>Saving Profile...</span>
                ) : (
                  <>
                    <span>Save Control Panel Settings</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Notification Toggles & Account Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Notification Preferences Card (Connected Live to Supabase DB) */}
          <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-slate-900">Notification Preferences</h2>
                {savingNotifs && <span className="text-[10px] font-bold text-kpugi-blue animate-pulse">Syncing DB...</span>}
              </div>
              <p className="text-slate-500 text-xs mt-0.5">Control live email and payout alert triggers stored in your database record.</p>
            </div>

            {notifMsg && (
              <div className={`p-2.5 rounded-xl text-xs font-bold ${notifMsg.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'}`}>
                {notifMsg.text}
              </div>
            )}

            <div className="space-y-4 divide-y divide-slate-100">
              {/* Email Notifications Toggle */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-slate-900">Email Notifications</div>
                  <div className="text-[11px] text-slate-500">Receive campaign updates, audit approvals, and platform alerts.</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotif('notify_email')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifs.notify_email ? 'bg-kpugi-blue' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifs.notify_email ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Instant Payout & Escrow Alerts */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-slate-900">Payout & 1k View Floor Alerts</div>
                  <div className="text-[11px] text-slate-500">Get notified immediately when posts reach 1,000 views or Paystack transfers complete.</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotif('notify_payouts')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifs.notify_payouts ? 'bg-kpugi-blue' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifs.notify_payouts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Campaign Match Alerts */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-slate-900">Campaign Match Alerts</div>
                  <div className="text-[11px] text-slate-500">Receive instant alerts when new high-CPM briefs match your selected content niches.</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotif('notify_campaigns')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifs.notify_campaigns ? 'bg-kpugi-blue' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifs.notify_campaigns ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account Security & Identity Info */}
          <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">Account & Security</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Account Email</span>
                <span className="font-bold text-slate-800">{profile.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Authentication Method</span>
                <span className="font-bold text-slate-800">Clerk SSO / Managed</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Platform ID</span>
                <span className="font-mono text-[11px] text-slate-600">{profile.id.slice(0, 13)}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
