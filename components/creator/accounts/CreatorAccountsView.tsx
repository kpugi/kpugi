'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SocialAccountDetails } from '@/lib/supabase/creator';
import {
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  TwitterXIcon,
  FacebookIcon,
  ThreadsIcon,
  LinkedInIcon,
} from '@/components/ui/SocialIcons';
import {
  Plus,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Zap,
  Info,
  RefreshCw,
  Sparkles,
  UserCheck,
  Copy,
  Check,
  ArrowRight,
  AlertCircle,
  X,
  Trash2,
} from 'lucide-react';

import CreatorLevelBadge from '@/components/creator/CreatorLevelBadge';

interface CreatorAccountsViewProps {
  groupedAccounts?: Record<string, SocialAccountDetails[]>;
  socialAccounts?: Record<string, SocialAccountDetails | string>;
}

export interface PlatformConfig {
  key: string;
  name: string;
  category: string;
  description: string;
  baseUrl: string;
  placeholder: string;
}

export const ALL_SUPPORTED_PLATFORMS: PlatformConfig[] = [
  {
    key: 'tiktok',
    name: 'TikTok',
    category: 'Short-form Video',
    description: 'System verification for Short-form video accounts & engagement metrics.',
    baseUrl: 'https://tiktok.com/@',
    placeholder: 'username',
  },
  {
    key: 'instagram',
    name: 'Instagram',
    category: 'Reels & Carousels',
    description: 'System verification for Reels, Feed posts, and Stories.',
    baseUrl: 'https://instagram.com/',
    placeholder: 'username',
  },
  {
    key: 'youtube',
    name: 'YouTube',
    category: 'Shorts & Long-form',
    description: 'System verification for YouTube Shorts & Channel metrics.',
    baseUrl: 'https://youtube.com/@',
    placeholder: 'channel_handle',
  },
  {
    key: 'twitter',
    name: 'Twitter / X',
    category: 'Text & Video Posts',
    description: 'System verification for X/Twitter creator profiles & metrics.',
    baseUrl: 'https://x.com/',
    placeholder: 'handle',
  },
  {
    key: 'facebook',
    name: 'Facebook',
    category: 'Pages & Videos',
    description: 'System verification for Facebook Creator Profiles & Pages.',
    baseUrl: 'https://facebook.com/',
    placeholder: 'profile_or_page',
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    category: 'Professional Posts',
    description: 'System verification for LinkedIn creator profiles & professional posts.',
    baseUrl: 'https://linkedin.com/in/',
    placeholder: 'vanity_name',
  },
];

function formatCompactNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

export default function CreatorAccountsView({
  groupedAccounts: initialGroupedAccounts,
  socialAccounts: initialSocialAccounts,
}: CreatorAccountsViewProps) {
  const [mounted, setMounted] = useState(false);

  // Grouped state mapping platform -> array of account objects
  const [accountsGrouped, setAccountsGrouped] = useState<Record<string, SocialAccountDetails[]>>(() => {
    if (initialGroupedAccounts) return initialGroupedAccounts;
    if (initialSocialAccounts) {
      const g: Record<string, SocialAccountDetails[]> = {};
      Object.entries(initialSocialAccounts).forEach(([k, v]) => {
        const key = k === 'twitter' ? 'x' : k.toLowerCase();
        if (!g[key]) g[key] = [];
        if (typeof v === 'string') {
          g[key].push({ handle: v, verificationStatus: 'verified' });
        } else if (v) {
          g[key].push(v);
        }
      });
      return g;
    }
    return {};
  });

  // Modal 1: 2-Step Connect & Verification Modal
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig>(ALL_SUPPORTED_PLATFORMS[0]);
  const [handleInput, setHandleInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeInstructions, setCodeInstructions] = useState('');

  // Loading & Feedback states
  const [startLoading, setStartLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal 2: Info Guide Modal
  const [infoGuidePlatform, setInfoGuidePlatform] = useState<PlatformConfig | null>(null);

  // Modal 3: Custom Disconnect Confirmation Modal (replaces browser confirm)
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<{
    platformKey: string;
    handle: string;
    accountId?: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialGroupedAccounts) {
      setAccountsGrouped(initialGroupedAccounts);
    }
  }, [initialGroupedAccounts]);

  function renderIcon(key: string, className: string = 'w-6 h-6') {
    switch (key) {
      case 'tiktok': return <TikTokIcon className={className} />;
      case 'instagram': return <InstagramIcon className={className} />;
      case 'youtube': return <YouTubeIcon className={className} />;
      case 'twitter': case 'x': return <TwitterXIcon className={className} />;
      case 'facebook': case 'facebook_page': return <FacebookIcon className={className} />;
      case 'threads': return <ThreadsIcon className={className} />;
      case 'linkedin': return <LinkedInIcon className={className} />;
      default: return <Sparkles className={`${className} text-kpugi-blue`} />;
    }
  }

  // Open Connect Modal for a specific platform
  function openConnectModal(platformConfig: PlatformConfig) {
    setSelectedPlatform(platformConfig);
    setHandleInput('');
    setGeneratedCode('');
    setCodeInstructions('');
    setModalStep(1);
    setErrorMsg('');
    setSuccessMsg('');
    setShowConnectModal(true);
  }

  // Step 1: Submit handle & generate code
  async function handleStartVerification(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setStartLoading(true);

    const cleanHandle = handleInput.trim().replace(/^@/, '').replace(/^https?:\/\/[^\/]+\//, '');
    if (!cleanHandle) {
      setErrorMsg('Please enter a valid username/handle');
      setStartLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/verify/social/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: selectedPlatform.key, handle: cleanHandle }),
      });

      const data = await res.json();
      setStartLoading(false);

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Failed to generate verification code');
        return;
      }

      setGeneratedCode(data.code);
      setCodeInstructions(data.instructions);
      setModalStep(2);

      // Optimistically update state
      const platformKey = selectedPlatform.key === 'twitter' ? 'x' : selectedPlatform.key;
      setAccountsGrouped((prev) => {
        const list = prev[platformKey] || [];
        const existingIdx = list.findIndex((a) => a.handle.toLowerCase() === cleanHandle.toLowerCase());
        const updatedItem: SocialAccountDetails = {
          handle: cleanHandle,
          verificationStatus: 'pending',
          verificationCode: data.code,
          verificationMethod: 'code_in_bio',
        };
        const newList = [...list];
        if (existingIdx >= 0) {
          newList[existingIdx] = { ...newList[existingIdx], ...updatedItem };
        } else {
          newList.push(updatedItem);
        }
        return { ...prev, [platformKey]: newList };
      });
    } catch {
      setStartLoading(false);
      setErrorMsg('Network error. Please try again.');
    }
  }

  // Copy code
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Trigger verification check
  async function runVerificationCheck(platformKey: string, handle: string) {
    setCheckLoading(handle);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/verify/social/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformKey, handle }),
      });

      const data = await res.json();
      setCheckLoading(null);

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Verification check failed');
        return;
      }

      if (data.verified) {
        setSuccessMsg(`Account @${handle} verified successfully!`);
        const pKey = platformKey === 'twitter' ? 'x' : platformKey;
        setAccountsGrouped((prev) => {
          const list = prev[pKey] || [];
          const newList = list.map((a) => {
            if (a.handle.toLowerCase() === handle.toLowerCase()) {
              return {
                ...a,
                verificationStatus: 'verified' as const,
                avatarUrl: data.stats?.avatarUrl || a.avatarUrl,
                followerCount: data.stats?.followerCount ?? a.followerCount,
              };
            }
            return a;
          });
          return { ...prev, [pKey]: newList };
        });

        if (showConnectModal) {
          setTimeout(() => setShowConnectModal(false), 1200);
        }
      } else {
        setErrorMsg(data.message || 'Verification code not found in bio yet.');
      }
    } catch {
      setCheckLoading(null);
      setErrorMsg('Network error while checking verification status.');
    }
  }

  // Delete account connection handler
  async function handleDeleteAccount(platformKey: string, handle: string, accountId?: string) {
    setCheckLoading(handle);

    try {
      const res = await fetch('/api/verify/social/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformKey, handle, accountId }),
      });

      const data = await res.json();
      setCheckLoading(null);
      setDeleteConfirmAccount(null);

      if (res.ok && data.success) {
        setSuccessMsg(`Disconnected @${handle}`);
        const pKey = platformKey === 'twitter' ? 'x' : platformKey;
        setAccountsGrouped((prev) => {
          const list = prev[pKey] || [];
          const newList = list.filter((a) => a.handle.toLowerCase() !== handle.toLowerCase());
          return { ...prev, [pKey]: newList };
        });
      } else {
        setErrorMsg(data.error || 'Failed to disconnect account');
      }
    } catch {
      setCheckLoading(null);
      setDeleteConfirmAccount(null);
      setErrorMsg('Network error disconnecting account');
    }
  }

  const totalConnectedCount = ALL_SUPPORTED_PLATFORMS.reduce((acc, p) => {
    const pKey = p.key === 'twitter' ? 'x' : p.key;
    const list = accountsGrouped[pKey] || [];
    return acc + list.filter((a) => a.verificationStatus === 'verified' || !!a.handle).length;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink font-sans pb-12">
      {/* ─────────────────────────────────────────────────────
         HEADER & TOP STATS BAR
      ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-kpugi-border pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink tracking-tight">
            Accounts Center
          </h1>
          <p className="font-sans text-xs sm:text-sm text-kpugi-slate mt-1">
            Connect & verify your social handles to enable campaign tracking & automated payout metrics.
          </p>
        </div>

        <button
          onClick={() => openConnectModal(ALL_SUPPORTED_PLATFORMS[0])}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New Account</span>
        </button>
      </div>

      {/* Global Alerts */}
      {errorMsg && !showConnectModal && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && !showConnectModal && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-kpugi-slate uppercase tracking-wider block">Connected Handles</span>
            <span className="font-mono font-extrabold text-3xl text-kpugi-ink mt-1 block">
              {totalConnectedCount} <span className="text-slate-400 text-lg">active</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6 text-kpugi-blue" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-kpugi-slate uppercase tracking-wider block">Profile Verification</span>
            <span className="font-mono font-bold text-sm text-emerald-600 mt-2 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
              Kpugi System Verification Active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-kpugi-slate uppercase tracking-wider block">Multiple Accounts Support</span>
            <span className="font-mono font-bold text-xs text-kpugi-ink mt-2 block">
              Multi-handle Enabled
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         GRID OF ALL SUPPORTED SOCIAL PLATFORMS
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_SUPPORTED_PLATFORMS.map((platform) => {
          const pKey = platform.key === 'twitter' ? 'x' : platform.key;
          const accountsList = accountsGrouped[pKey] || accountsGrouped[platform.key] || [];

          return (
            <div
              key={platform.key}
              className="p-6 rounded-3xl bg-white border border-kpugi-border hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-5"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-kpugi-border flex items-center justify-center shrink-0 shadow-xs">
                    {renderIcon(platform.key, 'w-6 h-6')}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-display font-bold text-base text-kpugi-ink leading-tight">{platform.name}</h3>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono shrink-0 ${
                    accountsList.some((a) => a.verificationStatus === 'verified')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : accountsList.length > 0
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {accountsList.some((a) => a.verificationStatus === 'verified')
                    ? 'CONNECTED'
                    : accountsList.length > 0
                    ? 'PENDING'
                    : 'NOT LINKED'}
                </span>
              </div>

              {/* Connected / Linked Accounts List */}
              {accountsList.length > 0 ? (
                <div className="space-y-3">
                  {accountsList.map((account, idx) => {
                    const isVerified = account.verificationStatus === 'verified';
                    const isPending = account.verificationStatus === 'pending' || !isVerified;
                    const followerLabel = platform.key === 'youtube' ? 'SUBSCRIBERS' : 'FOLLOWERS';

                    return (
                      <div
                        key={account.id || idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          isVerified
                            ? 'bg-emerald-50/50 border-emerald-200/80'
                            : 'bg-amber-50/40 border-amber-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {account.avatarUrl ? (
                              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                                <img
                                  src={account.avatarUrl}
                                  alt={account.handle}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                    const parent = (e.currentTarget as HTMLElement).parentElement;
                                    if (parent) {
                                      const fallback = parent.querySelector('.avatar-fallback');
                                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                    }
                                  }}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                />
                                <div className="avatar-fallback w-8 h-8 rounded-full bg-slate-200 text-slate-700 hidden items-center justify-center font-bold text-xs absolute inset-0">
                                  {account.handle.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs shrink-0 text-slate-700">
                                {account.handle.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-mono font-bold text-xs text-kpugi-blue block truncate">
                                @{account.handle}
                              </span>
                              <span className="text-[10px] text-kpugi-slate block font-medium">
                                {isVerified ? '✓ Verified Account' : '⌛ Verification Pending'}
                              </span>
                            </div>
                          </div>

                          {/* Follower / Subscriber Count Display */}
                          {isVerified && account.followerCount !== undefined && account.followerCount !== null && (
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-bold text-kpugi-slate uppercase font-mono block">
                                {followerLabel}
                              </span>
                              <span className="font-mono font-extrabold text-xs text-kpugi-ink block">
                                {formatCompactNumber(account.followerCount)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bio Verification Code Badge for Pending Accounts */}
                        {isPending && account.verificationCode && (
                          <div className="my-2.5 p-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-mono flex items-center justify-between gap-2">
                            <div className="truncate">
                              <span className="text-[9px] uppercase text-slate-400 font-bold block">Bio Code:</span>
                              <span className="text-emerald-400 font-bold tracking-wider select-all">{account.verificationCode}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(account.verificationCode!)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 flex items-center gap-1 border border-slate-700 shrink-0"
                            >
                              <Copy className="w-3 h-3 text-slate-300" />
                              <span>Copy Code</span>
                            </button>
                          </div>
                        )}

                        {/* Action Buttons: Verify / Re-sync + Trash Remove Button */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                          {isPending ? (
                            <button
                              onClick={() => runVerificationCheck(platform.key, account.handle)}
                              disabled={checkLoading === account.handle}
                              className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                            >
                              {checkLoading === account.handle ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Checking Profile...</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Verify Account</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => runVerificationCheck(platform.key, account.handle)}
                              disabled={checkLoading === account.handle}
                              className="flex-1 py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-kpugi-ink border border-slate-200 font-sans text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                              <RefreshCw className={`w-3 h-3 text-kpugi-slate ${checkLoading === account.handle ? 'animate-spin' : ''}`} />
                              <span>Re-sync Stats</span>
                            </button>
                          )}

                          {/* Trash Delete Button triggers custom modal */}
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmAccount({
                                platformKey: platform.key,
                                handle: account.handle,
                                accountId: account.id,
                              })
                            }
                            disabled={checkLoading === account.handle}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                            title={`Disconnect @${account.handle}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-kpugi-slate leading-relaxed">{platform.description}</p>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-kpugi-slate block uppercase tracking-wider">
                      Linked Handle
                    </span>
                    <span className="font-mono font-bold text-xs text-kpugi-ink mt-0.5 block truncate">
                      No handle connected yet
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Card Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => openConnectModal(platform)}
                  className="flex-1 py-2.5 px-3 rounded-xl font-sans text-xs font-bold transition-all flex items-center justify-center gap-2 bg-kpugi-blue hover:bg-blue-700 text-white shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{accountsList.length > 0 ? 'Add Another Account' : 'Connect Account'}</span>
                </button>

                <button
                  onClick={() => setInfoGuidePlatform(platform)}
                  className="p-2.5 rounded-xl border border-kpugi-border bg-white text-kpugi-slate hover:text-kpugi-blue hover:bg-blue-50 transition-colors shrink-0"
                  title={`Verification Instructions for ${platform.name}`}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────
         MODAL 1: CONNECT & VERIFY MODAL (DIRECT PLATFORM)
      ───────────────────────────────────────────────────── */}
      {showConnectModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-kpugi-border">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-kpugi-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  {renderIcon(selectedPlatform.key, 'w-5 h-5')}
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-kpugi-ink">
                    Connect {selectedPlatform.name}
                  </h3>
                  <span className="text-xs text-kpugi-slate font-mono">
                    Step {modalStep} of 2 — {modalStep === 1 ? 'Enter Handle' : 'Copy Verification Code'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="p-2 rounded-xl text-kpugi-slate hover:text-kpugi-ink hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </p>
            )}

            {/* ──────── STEP 1: ENTER HANDLE ──────── */}
            {modalStep === 1 && (
              <form onSubmit={handleStartVerification} className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block text-xs font-bold text-kpugi-slate mb-1.5 uppercase tracking-wider">
                    Enter Public {selectedPlatform.name} Handle
                  </label>

                  {/* Clean text input with prefilled URL prefix */}
                  <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-kpugi-blue focus-within:ring-2 focus-within:ring-kpugi-blue/20">
                    <span className="px-3 py-3 text-slate-500 font-mono text-xs font-bold bg-slate-100 border-r border-slate-200 shrink-0 select-none">
                      {selectedPlatform.baseUrl}
                    </span>
                    <input
                      type="text"
                      placeholder={selectedPlatform.placeholder}
                      value={handleInput}
                      onChange={(e) => setHandleInput(e.target.value)}
                      required
                      autoFocus
                      className="w-full px-3 py-3 font-mono text-xs text-slate-900 focus:outline-none bg-white font-bold"
                    />
                  </div>
                  <span className="text-[11px] text-kpugi-slate mt-2 block">
                    Enter your public {selectedPlatform.name} handle. You can add multiple accounts.
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="w-1/2 py-3 rounded-xl border border-kpugi-border bg-white text-kpugi-slate hover:text-kpugi-ink hover:bg-slate-50 font-sans text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={startLoading}
                    className="w-1/2 py-3 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20 flex items-center justify-center gap-2"
                  >
                    {startLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ──────── STEP 2: DISPLAY CODE & INSTRUCTIONS ──────── */}
            {modalStep === 2 && (
              <div className="space-y-4 font-sans text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                    Your Unique Verification Code
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-base sm:text-lg font-extrabold tracking-wider text-emerald-400 select-all">
                      {generatedCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedCode)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 text-white transition-all shrink-0 border border-slate-700"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-kpugi-ink block text-xs flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-kpugi-blue" />
                    Instructions for @{handleInput.trim().replace(/^@/, '')}:
                  </span>
                  <p className="text-xs text-kpugi-slate leading-relaxed">
                    {codeInstructions}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => runVerificationCheck(selectedPlatform.key, handleInput.trim().replace(/^@/, ''))}
                    disabled={!!checkLoading}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    {checkLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Bio...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>I've Saved It — Verify Now</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-kpugi-slate font-sans text-xs font-bold transition-all"
                  >
                    Close (Verify Later on Card)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────
         MODAL 2: INSTRUCTION / TOOLTIP GUIDE MODAL
      ───────────────────────────────────────────────────── */}
      {infoGuidePlatform && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-kpugi-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-kpugi-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  {renderIcon(infoGuidePlatform.key, 'w-5 h-5')}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-kpugi-ink">
                    {infoGuidePlatform.name} Verification Instructions
                  </h3>
                  <span className="text-xs text-kpugi-slate font-mono">Kpugi System Verification Guide</span>
                </div>
              </div>
              <button
                onClick={() => setInfoGuidePlatform(null)}
                className="p-2 rounded-xl text-kpugi-slate hover:text-kpugi-ink hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-kpugi-ink space-y-1">
                <span className="font-bold block text-xs flex items-center gap-1.5 text-kpugi-blue">
                  <ShieldCheck className="w-4 h-4" />
                  How Verification Works:
                </span>
                <p className="text-xs text-kpugi-slate leading-relaxed">
                  No password or private access required. Generate a code, paste it into your public {infoGuidePlatform.name} bio, and click Verify. The Kpugi system verifies your profile bio and confirms ownership.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-kpugi-ink block text-xs">Steps to Verify:</span>
                <ol className="list-decimal list-inside space-y-2 text-kpugi-slate leading-relaxed">
                  <li>Click <strong>Connect Account</strong> and enter your public handle (<code className="bg-slate-100 text-kpugi-ink px-1.5 py-0.5 rounded font-mono text-[11px]">{infoGuidePlatform.baseUrl}your_handle</code>).</li>
                  <li>Copy the generated code (e.g. <code className="bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-[11px]">kpugi-xxxxxx</code>).</li>
                  <li>Paste the code anywhere in your public {infoGuidePlatform.name} bio and save your profile changes.</li>
                  <li>Click <strong>Verify Account</strong>. Once verified, you can safely remove the code from your bio!</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Public Profile Format:</span>
                <div className="text-emerald-400">{infoGuidePlatform.baseUrl}username</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setInfoGuidePlatform(null)}
                className="w-full py-3 rounded-xl bg-kpugi-ink text-white font-sans text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────
         MODAL 3: CUSTOM DISCONNECT CONFIRMATION MODAL
      ───────────────────────────────────────────────────── */}
      {deleteConfirmAccount && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-5 shadow-2xl border border-kpugi-border text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-kpugi-ink">
                Disconnect @{deleteConfirmAccount.handle}?
              </h3>
              <p className="text-xs text-kpugi-slate mt-1 leading-relaxed">
                Are you sure you want to disconnect this account? It will be removed from your verified social matrix.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAccount(null)}
                className="w-1/2 py-3 rounded-xl border border-kpugi-border bg-white text-kpugi-slate hover:text-kpugi-ink hover:bg-slate-50 font-sans text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!checkLoading}
                onClick={() =>
                  handleDeleteAccount(
                    deleteConfirmAccount.platformKey,
                    deleteConfirmAccount.handle,
                    deleteConfirmAccount.accountId
                  )
                }
                className="w-1/2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5"
              >
                {checkLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
