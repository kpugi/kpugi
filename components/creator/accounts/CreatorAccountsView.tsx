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
  LayoutGrid,
  List,
  Download,
  ChevronLeft,
  FileText,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

import CreatorLevelBadge from '@/components/creator/CreatorLevelBadge';
import CreatorAccountsListView from './CreatorAccountsListView';

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

function getDisplayHandle(handle: string): string {
  const clean = handle.trim().replace(/^@/, '').replace(/^https?:\/\/[^\/]+\//, '');
  if (!clean) return '';
  const idMatch = clean.match(/id=(\d+)/i) || clean.match(/^(\d+)$/);
  if (idMatch) {
    return `Facebook Profile (${idMatch[1]})`;
  }
  if (clean.includes('?') || clean.includes('/') || clean.toLowerCase().startsWith('profile.php')) {
    return clean;
  }
  if (clean.includes(' ')) {
    return clean;
  }
  return `@${clean}`;
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

  // View mode switcher: Grid or List
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Verification method in Modal Step 2: 'bio' or 'post'
  const [verificationTab, setVerificationTab] = useState<'bio' | 'post'>('bio');
  const [postUrlInput, setPostUrlInput] = useState('');
  const [postCheckLoading, setPostCheckLoading] = useState(false);
  const [postTemplate, setPostTemplate] = useState<{ caption: string; assetUrl: string } | null>(null);
  const [captionCopied, setCaptionCopied] = useState(false);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!startLoading) setShowConnectModal(false);
        setInfoGuidePlatform(null);
        if (!checkLoading) setDeleteConfirmAccount(null);
      }
    };
    if (showConnectModal || infoGuidePlatform || deleteConfirmAccount) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showConnectModal, infoGuidePlatform, deleteConfirmAccount, startLoading, checkLoading]);

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
      if (data.postTemplate) {
        setPostTemplate(data.postTemplate);
      } else {
        setPostTemplate({
          caption: `The creator economy is changing — and I’m here for it. 👀💙\n\nCreators have the audience. Brands have the opportunities. Kpugi brings both together.\n\nMore opportunities. More connections. More room to grow. 🚀\n\nCreators × Brands. Let’s build.\n\n#Kpugi #CreatorEconomy #Creators #ContentCreator #CreatorLife\n\nID: ${data.code}`,
          assetUrl: '/images/kpugi-creator-verification.jpg',
        });
      }
      setVerificationTab('bio');
      setPostUrlInput('');
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

  // Open verification modal directly for a pending account (shows code & verification post options)
  async function handlePendingVerify(platformKey: string, handle: string, existingCode?: string | null) {
    const platformConfig = ALL_SUPPORTED_PLATFORMS.find(
      (p) => p.key === platformKey || (platformKey === 'x' && p.key === 'twitter')
    ) || ALL_SUPPORTED_PLATFORMS[0];

    setSelectedPlatform(platformConfig);
    setHandleInput(handle);
    setErrorMsg('');
    setSuccessMsg('');
    setShowConnectModal(true);

    if (existingCode) {
      setGeneratedCode(existingCode);
      const instructions: Record<string, string> = {
        x: `Go to your X profile → Edit Profile → add "${existingCode}" anywhere in your bio → Save → click Verify Account.`,
        twitter: `Go to your X profile → Edit Profile → add "${existingCode}" anywhere in your bio → Save → click Verify Account.`,
        tiktok: `Go to your TikTok profile → Edit Profile → add "${existingCode}" anywhere in your bio → Save → click Verify Account.`,
        instagram: `Go to your Instagram profile → Edit Profile → add "${existingCode}" anywhere in your bio → Save → click Verify Account.`,
        youtube: `Go to YouTube Studio → Customization → Basic Info → add "${existingCode}" to your channel description → Publish → click Verify Account.`,
        facebook: `Go to your Facebook profile → Edit Details → add "${existingCode}" to your bio → Save → click Verify Account.`,
        linkedin: `Go to your LinkedIn profile → Edit intro → add "${existingCode}" to your headline or summary → Save → click Verify Account.`,
      };
      setCodeInstructions(instructions[platformKey] || `Add "${existingCode}" to your bio and click Verify.`);
      setPostTemplate({
        caption: `The creator economy is changing — and I’m here for it. 👀💙\n\nCreators have the audience. Brands have the opportunities. Kpugi brings both together.\n\nMore opportunities. More connections. More room to grow. 🚀\n\nCreators × Brands. Let’s build.\n\n#Kpugi #CreatorEconomy #Creators #ContentCreator #CreatorLife\n\nID: ${existingCode}`,
        assetUrl: '/images/kpugi-creator-verification.jpg',
      });
      setVerificationTab('bio');
      setModalStep(2);
      return;
    }

    // If no existing code, generate one via start endpoint
    setStartLoading(true);
    try {
      const res = await fetch('/api/verify/social/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformKey, handle }),
      });
      const data = await res.json();
      setStartLoading(false);
      if (res.ok && data.code) {
        setGeneratedCode(data.code);
        setCodeInstructions(data.instructions);
        if (data.postTemplate) setPostTemplate(data.postTemplate);
        const pKey = platformKey === 'twitter' ? 'x' : platformKey;
        setAccountsGrouped((prev) => {
          const list = prev[pKey] || [];
          const updated = list.map((a) =>
            a.handle.toLowerCase() === handle.toLowerCase() ? { ...a, verificationCode: data.code } : a
          );
          return { ...prev, [pKey]: updated };
        });
        setVerificationTab('bio');
        setModalStep(2);
      } else {
        setModalStep(1);
        setErrorMsg(data.error || 'Failed to generate verification code');
      }
    } catch {
      setStartLoading(false);
      setModalStep(1);
    }
  }

  // Trigger verification check via bio
  async function runVerificationCheck(platformKey: string, handle: string, accountId?: string) {
    setCheckLoading(handle);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/verify/social/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformKey, handle, accountId }),
      });

      const data = await res.json();
      setCheckLoading(null);

      if (!res.ok || data.error) {
        if (data.code) {
          handlePendingVerify(platformKey, handle, data.code);
        }
        setErrorMsg(data.error || 'Verification check failed');
        return;
      }

      if (data.verified) {
        setSuccessMsg(data.message || `Account verified successfully!`);
        const pKey = platformKey === 'twitter' ? 'x' : platformKey;
        setAccountsGrouped((prev) => {
          const list = prev[pKey] || [];
          const newList = list.map((a) => {
            if (
              (accountId && a.id === accountId) ||
              a.handle.toLowerCase() === handle.toLowerCase() ||
              (a.displayName && a.displayName.toLowerCase() === handle.toLowerCase())
            ) {
              return {
                ...a,
                verificationStatus: 'verified' as const,
                avatarUrl: data.stats?.avatarUrl || a.avatarUrl,
                followerCount:
                  data.stats?.followerCount !== undefined && data.stats?.followerCount !== null
                    ? data.stats.followerCount
                    : a.followerCount,
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

  // Trigger verification check via published post
  async function handleVerifyPost() {
    if (!postUrlInput.trim()) {
      setErrorMsg('Please paste the URL of your verification post.');
      return;
    }

    setPostCheckLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const platformKey = selectedPlatform.key === 'twitter' ? 'x' : selectedPlatform.key;
    const cleanHandle = handleInput.trim().replace(/^@/, '').replace(/^https?:\/\/[^\/]+\//, '');

    try {
      const res = await fetch('/api/verify/social/check-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platformKey,
          handle: cleanHandle,
          postUrl: postUrlInput.trim(),
        }),
      });

      const data = await res.json();
      setPostCheckLoading(false);

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Verification check failed.');
        return;
      }

      if (data.verified) {
        const verifiedName = data.accountName || data.handle || cleanHandle;
        setSuccessMsg(`Account "${verifiedName}" verified successfully via verification post!`);
        setAccountsGrouped((prev) => {
          const list = prev[platformKey] || [];
          const newList = list.map((a) => {
            if (
              (data.accountId && a.id === data.accountId) ||
              a.handle.toLowerCase() === cleanHandle.toLowerCase() ||
              a.handle === cleanHandle ||
              (data.oldHandle && a.handle.toLowerCase() === data.oldHandle.toLowerCase()) ||
              (data.oldHandle && a.handle.includes(data.oldHandle)) ||
              (cleanHandle.includes('profile.php') && a.handle.includes('profile.php'))
            ) {
              return {
                ...a,
                handle: data.handle || verifiedName,
                displayName: verifiedName,
                verificationStatus: 'verified' as const,
                verificationMethod: 'post',
                avatarUrl: data.stats?.avatarUrl || a.avatarUrl,
                followerCount: data.stats?.followerCount ?? a.followerCount,
              };
            }
            return a;
          });
          return { ...prev, [platformKey]: newList };
        });

        setTimeout(() => setShowConnectModal(false), 1500);
      } else {
        setErrorMsg(data.message || 'Verification post could not be validated.');
      }
    } catch {
      setPostCheckLoading(false);
      setErrorMsg('Network error while verifying post.');
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
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink dark:text-white font-sans pb-12">
      {/* ─────────────────────────────────────────────────────
         HEADER & TOP STATS BAR
      ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-kpugi-border dark:border-white/10 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink dark:text-white tracking-tight">
            Accounts Center
          </h1>
          <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 mt-1">
            Connect & verify your social handles to enable campaign tracking & automated payout metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-kpugi-border dark:border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-white/10 text-kpugi-blue dark:text-blue-400 shadow-xs'
                  : 'text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-white/10 text-kpugi-blue dark:text-blue-400 shadow-xs'
                  : 'text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">List</span>
            </button>
          </div>

          <button
            onClick={() => openConnectModal(ALL_SUPPORTED_PLATFORMS[0])}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Connect New Account</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMsg && !showConnectModal && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-xs font-bold text-red-600 dark:text-red-300 flex items-center justify-between">
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
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
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
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider block">Connected Handles</span>
            <span className="font-mono font-extrabold text-3xl text-kpugi-ink dark:text-white mt-1 block">
              {totalConnectedCount} <span className="text-slate-400 dark:text-slate-500 text-lg">active</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/40 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6 text-kpugi-blue" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider block">Profile Verification</span>
            <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-2 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
              Kpugi System Active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider block">Multiple Accounts Support</span>
            <span className="font-mono font-bold text-xs text-kpugi-ink dark:text-white mt-2 block">
              Multi-handle Enabled
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800/40 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         GRID OR LIST OF ALL SUPPORTED SOCIAL PLATFORMS
      ───────────────────────────────────────────────────── */}
      {viewMode === 'list' ? (
        <CreatorAccountsListView
          platforms={ALL_SUPPORTED_PLATFORMS}
          accountsGrouped={accountsGrouped}
          renderIcon={renderIcon}
          onConnect={openConnectModal}
          onVerify={(pKey, handle, code) => {
            const p = pKey === 'twitter' ? 'x' : pKey;
            const existing = (accountsGrouped[p] || []).find((a) => a.handle.toLowerCase() === handle.toLowerCase());
            if (existing?.verificationStatus === 'verified') {
              runVerificationCheck(pKey, handle);
            } else {
              handlePendingVerify(pKey, handle, code || existing?.verificationCode);
            }
          }}
          onDisconnect={(pKey, handle, accountId) => setDeleteConfirmAccount({ platformKey: pKey, handle, accountId })}
          onOpenGuide={(platform) => setInfoGuidePlatform(platform)}
          checkLoading={checkLoading}
          formatCompactNumber={formatCompactNumber}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_SUPPORTED_PLATFORMS.map((platform) => {
            const pKey = platform.key === 'twitter' ? 'x' : platform.key;
            const accountsList = accountsGrouped[pKey] || accountsGrouped[platform.key] || [];

            return (
              <div
                key={platform.key}
                className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs flex flex-col justify-between space-y-5"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-kpugi-border dark:border-white/10 flex items-center justify-center shrink-0 shadow-xs">
                      {renderIcon(platform.key, 'w-6 h-6')}
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-display font-bold text-base text-kpugi-ink dark:text-white leading-tight">{platform.name}</h3>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono shrink-0 ${
                      accountsList.some((a) => a.verificationStatus === 'verified')
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
                        : accountsList.length > 0
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10'
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
                              ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200/80 dark:border-emerald-500/20'
                              : 'bg-amber-50/40 dark:bg-amber-500/10 border-amber-200/80 dark:border-amber-500/20'
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
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-white/10"
                                  />
                                  <div className="avatar-fallback w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 hidden items-center justify-center font-bold text-xs absolute inset-0">
                                    {account.handle.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-xs shrink-0 text-slate-700 dark:text-slate-300">
                                  {(account.handle || '').replace(/^@/, '').charAt(0).toUpperCase()}
                                </div>
                              )}
                            <div className="min-w-0">
                              <span className="font-sans font-bold text-xs text-kpugi-blue dark:text-blue-400 block truncate">
                                {getDisplayHandle(account.handle)}
                              </span>
                              <span className="text-[10px] text-kpugi-slate dark:text-slate-400 block font-medium">
                                {isVerified ? '✓ Verified Account' : '⌛ Verification Pending'}
                              </span>
                            </div>
                          </div>

                          {/* Follower / Subscriber Count Display */}
                          {isVerified && account.followerCount !== undefined && account.followerCount !== null && (
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-bold text-kpugi-slate dark:text-slate-400 uppercase font-mono block">
                                {followerLabel}
                              </span>
                              <span className="font-mono font-extrabold text-xs text-kpugi-ink dark:text-white block">
                                {formatCompactNumber(account.followerCount)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bio Verification Code Badge for Pending Accounts */}
                        {isPending && account.verificationCode && (
                          <div className="my-2.5 p-2.5 rounded-xl bg-slate-900 dark:bg-black/60 text-white text-[11px] font-mono flex items-center justify-between gap-2 border border-slate-800 dark:border-white/10">
                            <div className="truncate">
                              <span className="text-[9px] uppercase text-slate-400 font-bold block">Bio Code:</span>
                              <span className="text-emerald-400 font-bold tracking-wider select-all">{account.verificationCode}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(account.verificationCode!)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 flex items-center gap-1 border border-slate-700 shrink-0"
                            >
                              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                            </button>
                          </div>
                        )}

                        {/* Action Buttons: Verify / Re-sync + Trash Remove Button */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex items-center gap-2">
                          {isPending ? (
                            <button
                              onClick={() => handlePendingVerify(platform.key, account.handle, account.verificationCode)}
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
                              onClick={() => runVerificationCheck(platform.key, account.handle, account.id)}
                              disabled={checkLoading === account.handle}
                              className="flex-1 py-1.5 px-3 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-kpugi-ink dark:text-white border border-slate-200 dark:border-white/10 font-sans text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                              <RefreshCw className={`w-3 h-3 text-kpugi-slate dark:text-slate-400 ${checkLoading === account.handle ? 'animate-spin' : ''}`} />
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
                            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 transition-colors shrink-0"
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
                  <p className="text-xs text-kpugi-slate dark:text-slate-400 leading-relaxed">{platform.description}</p>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <span className="text-[10px] font-bold text-kpugi-slate dark:text-slate-400 block uppercase tracking-wider">
                      Linked Handle
                    </span>
                    <span className="font-mono font-bold text-xs text-kpugi-ink dark:text-white mt-0.5 block truncate">
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
                  className="p-2.5 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-blue dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shrink-0"
                  title={`Verification Instructions for ${platform.name}`}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* ─────────────────────────────────────────────────────
         MODAL 1: CONNECT & VERIFY MODAL (DIRECT PLATFORM)
      ───────────────────────────────────────────────────── */}
      {showConnectModal && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !startLoading && !checkLoading && !postCheckLoading) {
              setShowConnectModal(false);
            }
          }}
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
        >
          <div
            className={`bg-white dark:bg-[#11141D] rounded-3xl p-5 sm:p-7 w-full shadow-2xl border border-slate-200/80 dark:border-white/10 text-kpugi-ink dark:text-white transition-all duration-300 max-h-[92vh] flex flex-col ${
              modalStep === 1 ? 'max-w-md' : 'max-w-3xl lg:max-w-4xl'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                {modalStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setModalStep(1)}
                    className="p-1.5 -ml-1 rounded-xl text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    title="Change handle"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/10 dark:to-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shadow-xs shrink-0">
                  {renderIcon(selectedPlatform.key, 'w-5 h-5')}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-kpugi-ink dark:text-white tracking-tight">
                    {modalStep === 1 ? `Connect ${selectedPlatform.name}` : `Verify ${selectedPlatform.name}`}
                  </h3>
                  <div className="text-xs text-kpugi-slate dark:text-slate-400 font-sans mt-0.5">
                    {modalStep === 1 ? (
                      'Enter your public handle to begin verification'
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Target account: <span className="font-mono font-bold text-kpugi-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/40">{getDisplayHandle(handleInput)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="p-2 rounded-xl text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-xs font-bold text-red-600 dark:text-red-300 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
                <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {successMsg && (
              <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
                <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="overflow-y-auto flex-1 mt-4 space-y-4 pr-1 -mr-1">
              {/* ──────── STEP 1: ENTER HANDLE ──────── */}
              {modalStep === 1 && (
                <form onSubmit={handleStartVerification} className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="block text-xs font-bold text-kpugi-slate dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Public {selectedPlatform.name} Handle or Profile URL
                    </label>

                    <div className="flex items-center rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden focus-within:border-kpugi-blue focus-within:ring-2 focus-within:ring-kpugi-blue/20">
                      <span className="px-3 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs font-bold bg-slate-100 dark:bg-white/10 border-r border-slate-200 dark:border-white/10 shrink-0 select-none">
                        {selectedPlatform.baseUrl}
                      </span>
                      <input
                        type="text"
                        placeholder={selectedPlatform.placeholder}
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value)}
                        required
                        autoFocus
                        className="w-full px-3 py-3 font-mono text-xs text-slate-900 dark:text-white focus:outline-none bg-white dark:bg-transparent font-bold"
                      />
                    </div>
                    <span className="text-[11px] text-kpugi-slate dark:text-slate-400 mt-2 block">
                      Enter your public handle without @ or your full profile link. You can add multiple accounts.
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowConnectModal(false)}
                      className="w-1/2 py-3 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 font-sans text-xs font-bold transition-all"
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
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ──────── STEP 2: VERIFICATION METHODS (BIO OR POST) ──────── */}
              {modalStep === 2 && (
                <div className="space-y-4 font-sans text-xs">
                  {/* Method Switcher Tabs */}
                  <div className="p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setVerificationTab('bio')}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        verificationTab === 'bio'
                          ? 'bg-white dark:bg-white/10 text-kpugi-ink dark:text-white shadow-xs'
                          : 'text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-kpugi-slate dark:text-slate-400" />
                      <span>1. Code in Bio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerificationTab('post')}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        verificationTab === 'post'
                          ? 'bg-white dark:bg-white/10 text-kpugi-ink dark:text-white shadow-xs'
                          : 'text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-kpugi-blue" />
                      <span>2. Verification Post</span>
                      <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/60 text-kpugi-blue dark:text-blue-300 font-bold">
                        No bio edit
                      </span>
                    </button>
                  </div>

                  {/* Option 1: Code in Bio Tab */}
                  {verificationTab === 'bio' && (
                    <div className="space-y-4">
                      {/* Hero Code Box */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white space-y-3 border border-slate-800 shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            Your Unique Verification Code
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">Active 24h</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/50 p-3.5 rounded-xl border border-white/10">
                          <span className="font-mono text-xl sm:text-2xl font-extrabold tracking-wider text-emerald-400 select-all">
                            {generatedCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(generatedCode)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 ${
                              copied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                            }`}
                          >
                            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-slate-300" />}
                            <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2.5">
                        <span className="font-bold text-kpugi-ink dark:text-white block text-xs flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-kpugi-blue" />
                          Instructions for {getDisplayHandle(handleInput)}:
                        </span>
                        <p className="text-xs text-kpugi-slate dark:text-slate-300 leading-relaxed font-sans">
                          {codeInstructions}
                        </p>
                        <div className="pt-2 flex items-center gap-2 text-[11px] text-kpugi-slate dark:text-slate-400 border-t border-slate-200/60 dark:border-white/5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>You can safely delete this code from your profile bio after verification.</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowConnectModal(false)}
                          className="w-1/3 py-3.5 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white font-sans text-xs font-bold transition-all"
                        >
                          Verify Later
                        </button>
                        <button
                          type="button"
                          onClick={() => runVerificationCheck(selectedPlatform.key, handleInput.trim().replace(/^@/, ''))}
                          disabled={!!checkLoading}
                          className="w-2/3 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                          {checkLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Scanning Bio...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              <span>I've Saved It — Verify Bio</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Option 2: Verification Post Tab */}
                  {verificationTab === 'post' && (
                    <div className="space-y-4">
                      {/* Friendly Banner */}
                      <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/80 dark:border-blue-800/40 text-xs text-kpugi-blue dark:text-blue-300 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-kpugi-blue shrink-0 mt-0.5" />
                        <p className="leading-relaxed font-medium">
                          Prefer not to edit your bio? Download the official verification poster, publish a quick post on your public <span className="font-bold">{getDisplayHandle(handleInput)}</span> profile with the ready-to-post caption, then paste your link below.
                        </p>
                      </div>

                      {/* 2-Column Responsive Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        
                        {/* Column 1: Graphic Asset Card (md:col-span-5) */}
                        <div className="md:col-span-5 flex flex-col rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3.5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-kpugi-ink dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                              <ImageIcon className="w-3.5 h-3.5 text-kpugi-blue" />
                              Official Graphic
                            </span>
                           
                          </div>

                          {/* Poster Mockup Preview */}
                          <div className="relative rounded-xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-slate-900 aspect-[9/13] max-h-72 w-full flex items-center justify-center shadow-md group">
                            <img
                              src={postTemplate?.assetUrl || "/images/kpugi-creator-verification.jpg"}
                              alt="Kpugi Verification Graphic"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                              <span className="text-white text-[11px] font-bold">CREATORS ARE THE NEW MEDIA</span>
                            </div>
                          </div>

                          {/* Direct Download Button */}
                          <a
                            href={postTemplate?.assetUrl || "/images/kpugi-creator-verification.jpg"}
                            download="kpugi-creator-verification.jpg"
                            className="w-full py-2.5 px-4 rounded-xl bg-kpugi-blue hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md shadow-kpugi-blue/20 flex items-center justify-center gap-2 active:scale-95"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Poster</span>
                          </a>
                          <span className="text-[10px] text-center text-kpugi-slate dark:text-slate-400 block font-sans">
                            Attach this graphic when publishing your post.
                          </span>
                        </div>

                        {/* Column 2: Caption & Verification Link (md:col-span-7) */}
                        <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                          
                          {/* Ready to post caption card */}
                          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-4 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-kpugi-ink dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-kpugi-blue" />
                                Caption
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const cap = postTemplate?.caption || `The creator economy is changing — and I’m here for it. 👀💙\n\nCreators have the audience. Brands have the opportunities. Kpugi brings both together.\n\nMore opportunities. More connections. More room to grow. 🚀\n\nCreators × Brands. Let’s build.\n\n#Kpugi #CreatorEconomy #Creators #ContentCreator #CreatorLife\n\nID: ${generatedCode}`;
                                  navigator.clipboard.writeText(cap);
                                  setCaptionCopied(true);
                                  setTimeout(() => setCaptionCopied(false), 2000);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                                  captionCopied
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-kpugi-blue hover:bg-blue-600 text-white'
                                }`}
                              >
                                {captionCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{captionCopied ? 'Copied!' : 'Copy'}</span>
                              </button>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white dark:bg-black/50 border border-slate-200/80 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 space-y-2.5 leading-relaxed font-sans max-h-48 overflow-y-auto">
                              <p className="font-medium text-slate-900 dark:text-white">
                                The creator economy is changing — and I’m here for it. 👀💙
                              </p>
                              <p>
                                Creators have the audience. Brands have the opportunities. Kpugi brings both together.
                              </p>
                              <p>
                                More opportunities. More connections. More room to grow. 🚀
                              </p>
                              <p className="font-semibold text-kpugi-blue dark:text-blue-400">
                                Creators × Brands. Let’s build.
                              </p>

                              {/* Hashtag Badges */}
                              <div className="flex flex-wrap gap-1 pt-1">
                                {['#Kpugi', '#CreatorEconomy', '#Creators', '#ContentCreator', '#CreatorLife'].map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-kpugi-blue dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              {/* Token ID */}
                              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                <span>Token ID:</span>
                                <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">
                                  {generatedCode}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Post URL Input */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">
                              Post Link
                            </label>
                            <div className="flex items-center rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden focus-within:border-kpugi-blue focus-within:ring-2 focus-within:ring-kpugi-blue/20">
                              <div className="pl-3.5 pr-1.5 text-kpugi-slate dark:text-slate-400 shrink-0">
                                {renderIcon(selectedPlatform.key, 'w-4 h-4')}
                              </div>
                              <input
                                type="url"
                                placeholder={`https://${selectedPlatform.key === 'x' ? 'x.com' : selectedPlatform.key + '.com'}/...`}
                                value={postUrlInput}
                                onChange={(e) => setPostUrlInput(e.target.value)}
                                className="w-full px-2 py-3 font-mono text-xs text-slate-900 dark:text-white bg-transparent focus:outline-none font-medium"
                              />
                            </div>
                          </div>

                          {/* Verification Action Buttons */}
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowConnectModal(false)}
                              className="w-1/3 py-3.5 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white font-sans text-xs font-bold transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleVerifyPost}
                              disabled={postCheckLoading || !postUrlInput.trim()}
                              className="w-2/3 py-3.5 rounded-xl bg-kpugi-blue hover:bg-blue-600 disabled:opacity-50 text-white font-sans text-xs font-bold transition-all shadow-md shadow-kpugi-blue/25 flex items-center justify-center gap-2"
                            >
                              {postCheckLoading ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>Auditing Post...</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4" />
                                  <span>Verify</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────
         MODAL 2: INSTRUCTION / TOOLTIP GUIDE MODAL
      ───────────────────────────────────────────────────── */}
      {infoGuidePlatform && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setInfoGuidePlatform(null);
          }}
          className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#12141A] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-kpugi-border dark:border-white/10 max-h-[90vh] overflow-y-auto text-kpugi-ink dark:text-white">
            <div className="flex items-center justify-between border-b border-kpugi-border dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                  {renderIcon(infoGuidePlatform.key, 'w-5 h-5')}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-kpugi-ink dark:text-white">
                    {infoGuidePlatform.name} Verification Instructions
                  </h3>
                  <span className="text-xs text-kpugi-slate dark:text-slate-400 font-mono">Kpugi System Verification Guide</span>
                </div>
              </div>
              <button
                onClick={() => setInfoGuidePlatform(null)}
                className="p-2 rounded-xl text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-kpugi-ink dark:text-white space-y-1">
                <span className="font-bold block text-xs flex items-center gap-1.5 text-kpugi-blue dark:text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                  How Verification Works:
                </span>
                <p className="text-xs text-kpugi-slate dark:text-slate-300 leading-relaxed">
                  No password or private access required. Generate a code, paste it into your public {infoGuidePlatform.name} bio, and click Verify. The Kpugi system verifies your profile bio and confirms ownership.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-kpugi-ink dark:text-white block text-xs">Steps to Verify:</span>
                <ol className="list-decimal list-inside space-y-2 text-kpugi-slate dark:text-slate-300 leading-relaxed">
                  <li>Click <strong>Connect Account</strong> and enter your public handle (<code className="bg-slate-100 dark:bg-white/10 text-kpugi-ink dark:text-white px-1.5 py-0.5 rounded font-mono text-[11px]">{infoGuidePlatform.baseUrl}your_handle</code>).</li>
                  <li>Copy the generated code (e.g. <code className="bg-slate-900 dark:bg-black text-emerald-400 px-1.5 py-0.5 rounded font-mono text-[11px]">kpugi-xxxxxx</code>).</li>
                  <li>Paste the code anywhere in your public {infoGuidePlatform.name} bio and save your profile changes.</li>
                  <li>Click <strong>Verify Account</strong>. Once verified, you can safely remove the code from your bio!</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 dark:bg-black/60 text-slate-100 font-mono text-[11px] space-y-1 border border-slate-800 dark:border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Public Profile Format:</span>
                <div className="text-emerald-400">{infoGuidePlatform.baseUrl}username</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setInfoGuidePlatform(null)}
                className="w-full py-3 rounded-xl bg-kpugi-ink dark:bg-white text-white dark:text-slate-900 font-sans text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm"
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
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !checkLoading) setDeleteConfirmAccount(null);
          }}
          className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#12141A] rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-5 shadow-2xl border border-kpugi-border dark:border-white/10 text-center text-kpugi-ink dark:text-white">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-500/30 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-kpugi-ink dark:text-white">
                Disconnect @{deleteConfirmAccount.handle}?
              </h3>
              <p className="text-xs text-kpugi-slate dark:text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to disconnect this account? It will be removed from your verified social matrix.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAccount(null)}
                className="w-1/2 py-3 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 font-sans text-xs font-bold transition-all"
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
