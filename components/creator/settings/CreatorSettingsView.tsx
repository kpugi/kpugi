'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CreatorSettingsPayload } from '@/lib/supabase/creator';
import { updateCreatorProfileAction, updateNotificationPreferencesAction } from '@/app/actions/creator';
import CreatorLevelBadge from '@/components/creator/CreatorLevelBadge';
import { getCreatorLevel } from '@/lib/utils/levels';
import {
  User,
  FileText,
  Tag,
  Link2,
  CreditCard,
  ShieldCheck,
  Lock,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Send,
} from 'lucide-react';

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
  const router = useRouter();
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

  // Calculate Creator Rank Level Info
  const levelData = getCreatorLevel(creator.total_earned || 0);

  const connectedAccountsList = React.useMemo(() => {
    const list: { id?: string; platform: string; handle: string; followerCount?: number | null }[] = [];
    const seenHandles = new Set<string>();

    Object.entries(socialAccounts || {}).forEach(([platformKey, val]) => {
      const pKey = platformKey === 'twitter' ? 'x' : platformKey;
      if (Array.isArray(val)) {
        val.forEach((acc) => {
          if (acc?.handle) {
            const uniqueKey = `${acc.platform || pKey}:${acc.handle.toLowerCase()}`;
            if (!seenHandles.has(uniqueKey)) {
              seenHandles.add(uniqueKey);
              list.push({
                id: acc.id,
                platform: acc.platform || pKey,
                handle: acc.handle,
                followerCount: acc.followerCount,
              });
            }
          }
        });
      } else if (val && typeof val === 'object' && 'handle' in val && (val as any).handle) {
        const h = (val as any).handle;
        const uniqueKey = `${pKey}:${h.toLowerCase()}`;
        if (!seenHandles.has(uniqueKey)) {
          seenHandles.add(uniqueKey);
          list.push({
            platform: pKey,
            handle: h,
            followerCount: (val as any).followerCount,
          });
        }
      } else if (typeof val === 'string' && (val as string).trim()) {
        const strVal = (val as string).trim();
        const uniqueKey = `${pKey}:${strVal.toLowerCase()}`;
        if (!seenHandles.has(uniqueKey)) {
          seenHandles.add(uniqueKey);
          list.push({
            platform: pKey,
            handle: strVal,
            followerCount: null,
          });
        }
      }
    });

    return list;
  }, [socialAccounts]);

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
      setNotifMsg({ type: 'success', text: 'Notification preferences updated successfully!' });
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
      router.refresh();
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
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans text-kpugi-ink dark:text-white">
      {/* Top Hero Banner & Profile Overview */}
      <div className="relative rounded-3xl bg-slate-900 dark:bg-[#12141A] text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-slate-800 dark:border-white/10">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-kpugi-blue/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-slate-800 dark:bg-white/5 shrink-0">
              <Image
                src={avatarUrl}
                alt={displayName || 'Creator'}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {displayName || 'Creator Control Panel'}
                </h1>

                {/* User Creator Rank Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold border flex items-center gap-1.5 shadow-sm ${levelData.levelInfo.badgeBg} ${levelData.levelInfo.badgeText} ${levelData.levelInfo.badgeBorder}`}>
                  <span>{levelData.levelInfo.icon}</span>
                  <span>Rank Lvl {levelData.levelInfo.level}: {levelData.levelInfo.title}</span>
                </div>

                {kycStatus === 'verified' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Identity Verified
                  </span>
                )}
              </div>

              <p className="text-slate-400 text-xs mt-1.5">
                {creatorHandle ? `@${creatorHandle}` : profile.email} • Control center for public profile, payouts, accounts & identity verification
              </p>
            </div>
          </div>
        </div>

        {/* Profile Completeness Meter & Small Card Checklist Icons Grid */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-kpugi-blue" />
              <span>Control Panel Setup Progress</span>
            </span>
            <span className="font-bold text-kpugi-blue font-mono text-sm">{completeness.score}% Complete</span>
          </div>

          <div className="w-full bg-slate-800 dark:bg-white/10 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700 dark:border-white/10">
            <div
              className="bg-gradient-to-r from-kpugi-blue via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completeness.score}%` }}
            />
          </div>

          {/* Small Cards Grid with Icons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {completeness.steps.map((step) => {
              let IconComponent = User;
              if (step.id === 'handle' || step.id === 'profile') IconComponent = User;
              else if (step.id === 'bio') IconComponent = FileText;
              else if (step.id === 'niches') IconComponent = Tag;
              else if (step.id === 'social') IconComponent = Link2;
              else if (step.id === 'bank') IconComponent = CreditCard;
              else if (step.id === 'kyc') IconComponent = ShieldCheck;

              const cleanLabel = step.label
                .replace(/\s*\(Didit KYC\)/i, '')
                .replace(/\s*\(Didit\)/i, '')
                .replace(/Nigerian Bank Payout Account/i, 'Payout Bank Account');

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                    step.isComplete
                      ? 'bg-slate-900/90 dark:bg-white/10 border-emerald-500/30 text-white shadow-xs'
                      : 'bg-slate-900/60 dark:bg-white/5 border-slate-800 dark:border-white/10 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      step.isComplete ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 dark:bg-white/10 text-slate-400 border border-slate-700 dark:border-white/10'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      step.isComplete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 dark:bg-white/10 text-slate-400'
                    }`}>
                      {step.isComplete ? '✓ Done' : '○ Pending'}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white leading-tight truncate">
                      {cleanLabel}
                    </div>
                    {!step.isComplete && step.shortcutUrl && (
                      <Link href={step.shortcutUrl} className="text-[10px] font-bold text-kpugi-blue dark:text-blue-400 hover:text-white transition-colors inline-block mt-1">
                        Fix →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Creator Level & Rank Progress Widget Card */}
      <CreatorLevelBadge totalEarned={creator.total_earned || 0} variant="widget" />

      {/* Quick Control Shortcuts Hub (Social Accounts, Payout Bank, Clean Identity Card) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Social Accounts Status Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-kpugi-blue dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                <Link2 className="w-4 h-4" />
                <span>Social Accounts</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                {connectedAccountsList.length} Connected
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 leading-relaxed">
              OAuth connected handles used for automated view verification and clock-in submissions.
            </p>

            <div className="mt-3 space-y-1.5">
              {connectedAccountsList.length > 0 ? (
                connectedAccountsList.slice(0, 3).map((acc) => (
                  <div key={acc.platform} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-white/10">
                    <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">@{acc.handle}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{acc.platform}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-100 dark:border-amber-500/30">
                  No social accounts linked yet.
                </div>
              )}
            </div>
          </div>

          <Link
            href="/accounts"
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 font-bold text-xs text-center transition-colors block"
          >
            Manage Connected Accounts →
          </Link>
        </div>

        {/* Bank Account Details Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Payout Bank Account</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${primaryBank ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'}`}>
                {primaryBank ? 'Ready' : 'Unset'}
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 leading-relaxed">
              Verified bank account where campaign view earnings are transferred directly.
            </p>

            <div className="mt-3">
              {primaryBank ? (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white text-xs">{(primaryBank as any).accountName || (primaryBank as any).account_name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {(primaryBank as any).bankName || (primaryBank as any).bank_name} • {((primaryBank as any).accountNumber || (primaryBank as any).account_number || '').slice(-4)}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-100 dark:border-amber-500/30">
                  Enter bank details on Wallet page to enable payouts.
                </div>
              )}
            </div>
          </div>

          <Link
            href="/c/wallet"
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 font-bold text-xs text-center transition-colors block"
          >
            Update Bank & Payouts →
          </Link>
        </div>

        {/* Clean Identity Verification Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Identity Verification</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                kycStatus === 'verified'
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                  : kycStatus === 'pending'
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 animate-pulse'
                  : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
              }`}>
                {kycStatus === 'verified' ? '✓ Verified' : kycStatus === 'pending' ? '⏳ Under Review' : 'Required'}
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 leading-relaxed">
              Verify your official government ID (NIN, Voter Card, or Passport) to enable instant earnings withdrawals.
            </p>

            <div className="mt-4">
              {kycStatus === 'verified' ? (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Official Government ID Verified</span>
                </div>
              ) : kycStatus === 'pending' ? (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>⏳ Verification Under Review</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    Your verification submission is being checked. This card will update automatically.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Withdrawal Requirement</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
          <form onSubmit={handleProfileSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-6">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Creator Profile & Brand</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Customize your public identity shown to advertisers in campaign audits.</p>
            </div>

            {profileMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-bold ${profileMsg.type === 'error' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'}`}>
                {profileMsg.text}
              </div>
            )}

            {/* Avatar Picker */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Profile Avatar</label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-kpugi-blue shadow-md bg-slate-100 dark:bg-white/5 shrink-0">
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
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-kpugi-blue"
                  />
                </div>
              </div>
            </div>

            {/* Display Name & Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="e.g. Tobi Creator"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-medium focus:outline-none focus:border-kpugi-blue text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Creator Handle</span>
                  {creator.creator_handle && (
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Locked
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    value={creatorHandle}
                    disabled={!!creator.creator_handle}
                    onChange={(e) => setCreatorHandle(e.target.value.replace(/^@/, ''))}
                    placeholder="tobi_creates"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-medium focus:outline-none focus:border-kpugi-blue text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-white/5 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </div>
                {creator.creator_handle ? (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
                    <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                    Usernames are permanent and cannot be changed once created.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Choose your permanent creator username. This cannot be changed later.
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Bio / Creator Statement
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell brands about your content style, audience demographics, and viral formats..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-medium focus:outline-none focus:border-kpugi-blue text-slate-900 dark:text-white leading-relaxed"
              />
            </div>

            {/* Niches */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
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
                          ? 'bg-kpugi-blue dark:bg-blue-600 text-white border-kpugi-blue dark:border-blue-600 shadow-2xs'
                          : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                      }`}
                    >
                      {niche} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex justify-end">
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
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Notification Toggles & Account Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Notification Preferences Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                {savingNotifs && <span className="text-[10px] font-bold text-kpugi-blue animate-pulse">Saving...</span>}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Control live email and payout alert triggers stored in your database record.</p>
            </div>

            {notifMsg && (
              <div className={`p-2.5 rounded-xl text-xs font-bold ${notifMsg.type === 'error' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'}`}>
                {notifMsg.text}
              </div>
            )}

            <div className="space-y-4 divide-y divide-slate-100 dark:divide-white/5">
              {/* Email Notifications Toggle */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Email Notifications</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Receive campaign updates, audit approvals, and platform alerts.</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotif('notify_email')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifs.notify_email ? 'bg-kpugi-blue' : 'bg-slate-200 dark:bg-white/10'
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
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Payout & 1k View Floor Alerts</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Get notified immediately when posts reach 1,000 views or bank payouts complete.</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotif('notify_payouts')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifs.notify_payouts ? 'bg-kpugi-blue' : 'bg-slate-200 dark:bg-white/10'
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
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Campaign Match Alerts</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Receive instant alerts when new high-CPM briefs match your selected content niches.</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotif('notify_campaigns')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifs.notify_campaigns ? 'bg-kpugi-blue' : 'bg-slate-200 dark:bg-white/10'
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
          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Account & Security</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">Account Email</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{profile.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">Authentication Method</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Clerk SSO / Managed</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Platform ID</span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{profile.id.slice(0, 13)}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
