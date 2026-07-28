'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { linkSocialAccountAction } from '@/app/actions/creator';
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
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  RefreshCw,
  Sparkles,
  UserCheck,
  TrendingUp,
} from 'lucide-react';

interface CreatorAccountsViewProps {
  socialAccounts: Record<string, SocialAccountDetails | string>;
}

export interface PlatformConfig {
  key: string;
  name: string;
  category: string;
  description: string;
  oauthSupported: boolean;
  docUrl: string;
  envKeys: string[];
}

export const ALL_SUPPORTED_PLATFORMS: PlatformConfig[] = [
  {
    key: 'tiktok',
    name: 'TikTok',
    category: 'Short-form Video',
    description: 'Automatic video view scrapers & engagement metrics verification.',
    oauthSupported: true,
    docUrl: 'https://developers.tiktok.com/doc/login-kit-web/',
    envKeys: ['NEXT_PUBLIC_TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
  },
  {
    key: 'instagram',
    name: 'Instagram',
    category: 'Reels & Carousels',
    description: 'Graph API verification for Reels, Feed posts, and Stories.',
    oauthSupported: true,
    docUrl: 'https://developers.facebook.com/docs/instagram-basic-display-api',
    envKeys: ['NEXT_PUBLIC_INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET'],
  },
  {
    key: 'youtube',
    name: 'YouTube',
    category: 'Shorts & Long-form',
    description: 'Google Data API v3 OAuth scope for YouTube Shorts & Videos.',
    oauthSupported: true,
    docUrl: 'https://console.cloud.google.com/apis/credentials',
    envKeys: ['NEXT_PUBLIC_YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET'],
  },
  {
    key: 'twitter',
    name: 'Twitter / X',
    category: 'Text & Video Posts',
    description: 'Twitter API v2 OAuth 2.0 PKCE user context authentication.',
    oauthSupported: true,
    docUrl: 'https://developer.x.com/en/docs/authentication/oauth-2-0',
    envKeys: ['NEXT_PUBLIC_TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'],
  },
  {
    key: 'facebook',
    name: 'Facebook',
    category: 'Pages & Videos',
    description: 'Meta Graph API for Creator Pages & Video posts.',
    oauthSupported: true,
    docUrl: 'https://developers.facebook.com/docs/facebook-login',
    envKeys: ['NEXT_PUBLIC_FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    category: 'Professional Posts',
    description: 'LinkedIn Community Management & Analytics API.',
    oauthSupported: true,
    docUrl: 'https://developer.linkedin.com/documentation/oauth2',
    envKeys: ['NEXT_PUBLIC_LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
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

function getEngagementRate(
  rate: number | null | undefined,
  views: number | null | undefined,
  followers: number | null | undefined
): string {
  if (rate !== null && rate !== undefined && rate > 0) {
    return `${rate.toFixed(1)}%`;
  }
  if (views && followers && followers > 0) {
    const calc = (views / followers) * 100;
    return `${calc.toFixed(1)}%`;
  }
  return '0.0%';
}

export default function CreatorAccountsView({ socialAccounts }: CreatorAccountsViewProps) {
  const [mounted, setMounted] = useState(false);
  const [accountsState, setAccountsState] = useState<Record<string, SocialAccountDetails | string>>(socialAccounts || {});
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig>(ALL_SUPPORTED_PLATFORMS[0]);
  const [oauthGuidePlatform, setOauthGuidePlatform] = useState<PlatformConfig | null>(null);

  // Form input state
  const [handleInput, setHandleInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setAccountsState(socialAccounts || {});
  }, [socialAccounts]);

  // Render platform icon helper
  function renderIcon(key: string, className: string = 'w-6 h-6') {
    switch (key) {
      case 'tiktok': return <TikTokIcon className={className} />;
      case 'instagram': return <InstagramIcon className={className} />;
      case 'youtube': return <YouTubeIcon className={className} />;
      case 'twitter': return <TwitterXIcon className={className} />;
      case 'facebook': return <FacebookIcon className={className} />;
      case 'threads': return <ThreadsIcon className={className} />;
      case 'linkedin': return <LinkedInIcon className={className} />;
      default: return <Sparkles className={`${className} text-kpugi-blue`} />;
    }
  }

  // Handle manual linking submit
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const cleanHandle = handleInput.trim().replace(/^@/, '');

    const formData = new FormData();
    formData.append('platform', selectedPlatform.key);
    formData.append('handle', cleanHandle);

    const res = await linkSocialAccountAction(formData);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to link account handle');
    } else {
      setSuccessMsg(`Successfully connected @${cleanHandle} on ${selectedPlatform.name}!`);
      setAccountsState((prev) => ({ ...prev, [selectedPlatform.key]: { handle: cleanHandle } }));
      setTimeout(() => {
        setShowModal(false);
        setSuccessMsg('');
        setHandleInput('');
      }, 1200);
    }
  }

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'OAUTH_SUCCESS') {
        const { platform, username } = event.data;
        if (platform && username) {
          setAccountsState((prev) => ({ ...prev, [platform]: { handle: decodeURIComponent(username) } }));
        }
        window.location.reload();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // OAuth popup window launcher
  function handleOAuthConnect(platform: PlatformConfig) {
    const width = 600;
    const height = 750;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const oauthUrl = platform.key === 'tiktok' ? '/api/auth/oauth/tiktok' : `/api/auth/oauth/${platform.key}`;

    const popup = window.open(
      oauthUrl,
      `OAuthConnect_${platform.key}`,
      `toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=no,width=${width},height=${height},top=${top},left=${left}`
    );

    if (!popup) {
      window.location.href = oauthUrl;
    }
  }

  const connectedCount = Object.keys(accountsState).filter((k) => {
    const acc = accountsState[k];
    return !!acc && (typeof acc === 'string' ? !!acc : !!acc.handle);
  }).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink font-sans pb-12">
      {/* ─────────────────────────────────────────────────────
         HEADER & TOP STATS BAR
      ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-kpugi-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-kpugi-blue text-[11px] font-bold font-mono uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Creator Social Matrix
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink tracking-tight">
            Social Accounts & OAuth Integration
          </h1>
          <p className="font-sans text-xs sm:text-sm text-kpugi-slate mt-1">
            Link your verified content creation handles for real-time scraper audits and instant CPM performance payouts.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPlatform(ALL_SUPPORTED_PLATFORMS[0]);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New Account</span>
        </button>
      </div>

      {/* Overview Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-kpugi-slate uppercase tracking-wider block">Connected Platforms</span>
            <span className="font-mono font-extrabold text-3xl text-kpugi-ink mt-1 block">
              {connectedCount} <span className="text-slate-400 text-lg">/ {ALL_SUPPORTED_PLATFORMS.length}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6 text-kpugi-blue" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-kpugi-slate uppercase tracking-wider block">Anti-fraud Verification</span>
            <span className="font-mono font-bold text-sm text-emerald-600 mt-2 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
              Real-time Sync Active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-kpugi-slate uppercase tracking-wider block">OAuth 2.0 Security</span>
            <span className="font-mono font-bold text-xs text-kpugi-ink mt-2 block">
              PKCE Encrypted Tokens
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
          const accountData = accountsState[platform.key];
          const isConnected = !!accountData && (typeof accountData === 'string' ? !!accountData : !!accountData.handle);
          const handle = typeof accountData === 'string' ? accountData : accountData?.handle;
          const avatarUrl = typeof accountData === 'object' ? accountData?.avatarUrl : null;
          const followerCount = typeof accountData === 'object' ? accountData?.followerCount : null;
          const avgViews = typeof accountData === 'object' ? accountData?.avgViews : null;
          const engagementRate = typeof accountData === 'object' ? accountData?.engagementRate : null;

          const hasAvgViews = avgViews !== null && avgViews !== undefined && avgViews > 0;
          const followerLabel = platform.key === 'youtube' ? 'SUBSCRIBERS' : 'FOLLOWERS';
          const formattedFollowers = formatCompactNumber(followerCount);
          const formattedViews = formatCompactNumber(avgViews);
          const formattedEngRate = getEngagementRate(engagementRate, avgViews, followerCount);

          if (isConnected) {
            return (
              <div
                key={platform.key}
                className="p-6 rounded-3xl bg-white border border-emerald-200 ring-2 ring-emerald-500/10 shadow-xs flex flex-col justify-between space-y-5 text-center transition-all relative overflow-hidden"
              >
                {/* Header Connected Badge */}
                <div className="flex items-center justify-between w-full border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                      {renderIcon(platform.key, 'w-3.5 h-3.5')}
                    </div>
                    <span className="font-display font-bold text-xs text-kpugi-ink">{platform.name}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                    CONNECTED
                  </span>
                </div>

                {/* Profile Picture & Sync Status (Image 2 style) */}
                <div className="pt-1 flex flex-col items-center">
                  <div className="relative inline-block mx-auto mb-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={handle || platform.name}
                        className="w-20 h-20 rounded-full border-4 border-slate-50 shadow-md object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-kpugi-border flex items-center justify-center shadow-inner">
                        {renderIcon(platform.key, 'w-10 h-10')}
                      </div>
                    )}
                    {/* Network / Verified Badge Overlay */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-kpugi-blue border-2 border-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <h3 className="font-display font-extrabold text-base text-kpugi-ink">
                    Sync Successful
                  </h3>
                  <p className="text-xs text-kpugi-slate leading-relaxed mt-1 max-w-xs mx-auto">
                    Your <span className="font-bold text-kpugi-ink">{platform.name}</span> account{' '}
                    <span className="font-mono font-bold text-kpugi-blue">@{handle}</span> has been securely linked to Kpugi Creator.
                  </p>
                </div>

                {/* Metrics Box Area */}
                {hasAvgViews ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                        <span className="text-[10px] font-bold text-kpugi-slate block uppercase tracking-wider font-mono">
                          {followerLabel}
                        </span>
                        <span className="font-mono font-extrabold text-base sm:text-lg text-kpugi-blue mt-1 block">
                          {formattedFollowers}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                        <span className="text-[10px] font-bold text-kpugi-slate block uppercase tracking-wider font-mono">
                          AVG VIEWS
                        </span>
                        <span className="font-mono font-extrabold text-base sm:text-lg text-kpugi-blue mt-1 block">
                          {formattedViews}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between px-4">
                      <span className="text-[10px] font-bold text-kpugi-slate uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-kpugi-blue" />
                        ENGAGEMENT RATE
                      </span>
                      <span className="font-mono font-extrabold text-sm text-kpugi-ink">
                        {formattedEngRate}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Single Centered Followers/Subscribers Box if Avg Views is missing */
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center max-w-xs mx-auto w-full">
                    <span className="text-[10px] font-bold text-kpugi-slate block uppercase tracking-wider font-mono">
                      {followerLabel}
                    </span>
                    <span className="font-mono font-extrabold text-xl text-kpugi-blue mt-1 block">
                      {formattedFollowers}
                    </span>
                  </div>
                )}

                {/* Action Buttons & Security Footer (Dashboard button removed!) */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOAuthConnect(platform)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-kpugi-ink border border-slate-300 font-sans text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-kpugi-slate" />
                      <span>Update Link</span>
                    </button>

                    <button
                      onClick={() => setOauthGuidePlatform(platform)}
                      className="p-2.5 rounded-xl border border-kpugi-border bg-white text-kpugi-slate hover:text-kpugi-blue hover:bg-blue-50 transition-colors"
                      title={`View OAuth 2.0 Setup Guide for ${platform.name}`}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[11px] text-kpugi-slate font-sans flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Data synced via {platform.name} Official API</span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={platform.key}
              className="p-6 rounded-3xl bg-white border border-kpugi-border hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-kpugi-border flex items-center justify-center shrink-0 shadow-xs">
                    {renderIcon(platform.key, 'w-6 h-6')}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-kpugi-ink">{platform.name}</h3>
                    <span className="text-[10px] font-bold text-kpugi-slate uppercase tracking-wider font-mono">
                      {platform.category}
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono shrink-0 bg-slate-100 text-slate-500 border border-slate-200">
                  NOT LINKED
                </span>
              </div>

              {/* Description & Handle Status */}
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleOAuthConnect(platform)}
                  className="flex-1 py-2.5 px-3 rounded-xl font-sans text-xs font-bold transition-all flex items-center justify-center gap-2 bg-kpugi-blue hover:bg-blue-700 text-white shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Connect Account</span>
                </button>

                <button
                  onClick={() => setOauthGuidePlatform(platform)}
                  className="p-2.5 rounded-xl border border-kpugi-border bg-white text-kpugi-slate hover:text-kpugi-blue hover:bg-blue-50 transition-colors"
                  title={`View OAuth 2.0 Setup Guide for ${platform.name}`}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────
         MODAL 1: LINK SOCIAL HANDLE & OAUTH TRIGGER (PORTALED)
      ───────────────────────────────────────────────────── */}
      {showModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-kpugi-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-kpugi-border flex items-center justify-center shrink-0">
                {renderIcon(selectedPlatform.key, 'w-5 h-5')}
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-kpugi-ink">
                  Connect {selectedPlatform.name}
                </h3>
                <span className="text-xs text-kpugi-slate">OAuth 2.0 Authentication & Handle Sync</span>
              </div>
            </div>

            {errorMsg && <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">{successMsg}</p>}

            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1 uppercase tracking-wider">
                  Select Platform
                </label>
                <select
                  value={selectedPlatform.key}
                  onChange={(e) => {
                    const p = ALL_SUPPORTED_PLATFORMS.find((item) => item.key === e.target.value);
                    if (p) setSelectedPlatform(p);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-kpugi-border font-sans text-xs focus:outline-none focus:border-kpugi-blue bg-white font-bold"
                >
                  {ALL_SUPPORTED_PLATFORMS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1 uppercase tracking-wider">
                  Social Handle / Channel ID
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-kpugi-slate font-mono font-bold">@</span>
                  <input
                    type="text"
                    placeholder="creator_handle"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-kpugi-border font-mono text-xs focus:outline-none focus:border-kpugi-blue bg-slate-50"
                  />
                </div>
                <span className="text-[11px] text-kpugi-slate mt-1 block">
                  Enter your public {selectedPlatform.name} username or channel handle.
                </span>
              </div>

              {/* OAuth 2.0 Direct Auth Button */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-kpugi-ink flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-kpugi-blue" />
                    Official OAuth 2.0 Connect
                  </span>
                  <span className="text-[10px] font-bold text-kpugi-blue uppercase font-mono">RECOMMENDED</span>
                </div>
                <p className="text-[11px] text-kpugi-slate leading-relaxed">
                  Authenticate directly with {selectedPlatform.name} API credentials for instant verified badge status.
                </p>
                {selectedPlatform.key === 'tiktok' && (
                  <a
                    href="/api/auth/oauth/tiktok"
                    className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-slate-900 text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <TikTokIcon className="w-4 h-4 fill-current" />
                    <span>Authorize with TikTok OAuth 2.0</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-kpugi-border bg-white text-kpugi-slate hover:text-kpugi-ink hover:bg-slate-50 font-sans text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-3 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20"
                >
                  {loading ? 'Saving...' : `Link ${selectedPlatform.name}`}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────
         MODAL 2: OAUTH SETUP GUIDE FOR DEVELOPER (PORTALED)
      ───────────────────────────────────────────────────── */}
      {oauthGuidePlatform && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-kpugi-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-kpugi-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-kpugi-border flex items-center justify-center shrink-0">
                  {renderIcon(oauthGuidePlatform.key, 'w-5 h-5')}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-kpugi-ink">
                    {oauthGuidePlatform.name} OAuth 2.0 Setup
                  </h3>
                  <span className="text-xs text-kpugi-slate font-mono">Developer Integration Steps</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-kpugi-ink block uppercase text-[10px] tracking-wider">
                  Developer Portal URL:
                </span>
                <a
                  href={oauthGuidePlatform.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kpugi-blue font-mono text-[11px] hover:underline inline-flex items-center gap-1"
                >
                  <span>{oauthGuidePlatform.docUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-kpugi-ink block text-xs">Required Environment Variables (`.env.local`):</span>
                <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1">
                  {oauthGuidePlatform.envKeys.map((k) => (
                    <div key={k}>{k}=your_app_key_here</div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-kpugi-ink block text-xs">Step-by-Step Configuration:</span>
                <ol className="list-decimal list-inside space-y-1.5 text-kpugi-slate leading-relaxed">
                  <li>Register an application in the official {oauthGuidePlatform.name} Developer Portal.</li>
                  <li>Set Redirect URI to: <code className="bg-slate-100 text-kpugi-ink px-1.5 py-0.5 rounded font-mono text-[11px]">https://your-domain.com/api/auth/oauth/{oauthGuidePlatform.key}/callback</code></li>
                  <li>Enable required Scopes (e.g. read user profile, read video metrics, public metrics).</li>
                  <li>Copy Client Key/ID and Secret into your <code className="bg-slate-100 text-kpugi-ink px-1.5 py-0.5 rounded font-mono text-[11px]">.env.local</code> file.</li>
                </ol>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setOauthGuidePlatform(null)}
                className="w-full py-3 rounded-xl bg-kpugi-ink text-white font-sans text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
