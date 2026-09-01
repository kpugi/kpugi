'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Wallet,
  Plus,
  ExternalLink,
  Download,
  FileText,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Clock,
  X,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Receipt,
  Printer,
  ArrowUpRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { CampaignDetailsForCreator } from '@/lib/supabase/dashboard';
import { submitCampaignVideoAction, unjoinCampaignAction, deleteSubmissionLinkAction } from '@/app/actions/creator';
import { validatePostUrlOwnership, parseSocialPostUrl } from '@/lib/utils/social-url';
import { PlatformBadge } from '@/components/ui/SocialIcons';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/utils/format';
import ConfirmModal from '@/components/common/ConfirmModal';
import { CampaignReviewModal } from '@/components/reviews/CampaignReviewModal';
import { CampaignReviewsDisplay } from '@/components/reviews/CampaignReviewsDisplay';
import { getCampaignReviewStatusAction } from '@/app/actions/reviews';

interface CreatorCampaignWorkspaceViewProps {
  data: CampaignDetailsForCreator;
  campaignId: string;
}

export default function CreatorCampaignWorkspaceView({ data, campaignId }: CreatorCampaignWorkspaceViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { campaign, submission, creatives, allSubmissions, socialAccounts = [] } = data;
  const [submissionState, setSubmissionState] = useState(submission);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    setSubmissionState(submission);
  }, [submission]);

  useEffect(() => {
    async function checkReview() {
      try {
        const res = await getCampaignReviewStatusAction(campaignId);
        if (res.reviewed) {
          setHasReviewed(true);
          setExistingReview(res.review);
        }
      } catch (err) {
        console.error('Failed to fetch review status', err);
      }
    }
    checkReview();

    if (searchParams?.get('review') === 'true') {
      setShowReviewModal(true);
    }
    if (searchParams?.get('receipt') === 'true') {
      setShowReceiptModal(true);
    }
  }, [campaignId, searchParams]);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowReceiptModal(false);
        if (!loading) setShowSubmitModal(false);
      }
    };
    if (showReceiptModal || showSubmitModal) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showReceiptModal, showSubmitModal, loading]);
  const [isUnjoining, setIsUnjoining] = useState(false);
  const [isDeletingLink, setIsDeletingLink] = useState(false);
  const [showDeleteLinkConfirm, setShowDeleteLinkConfirm] = useState(false);
  const [showUnjoinConfirm, setShowUnjoinConfirm] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const auditPageSize = 8;
  const [msg, setMsg] = useState('');

  async function handleConfirmDeleteLink() {
    setIsDeletingLink(true);
    try {
      const res = await deleteSubmissionLinkAction(campaignId);
      if (res.success) {
        setSubmissionState((prev: any) => prev ? {
          ...prev,
          post_url: null,
          screenshot_url: null,
          status: 'joined',
          final_view_count: 0,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          pending_payout_amount: 0,
          payout_amount: null,
          last_scraped_at: null,
          verified_at: null,
          submitted_at: new Date().toISOString(),
        } : null);
        setMsg('Post link removed. You can now submit a new link afresh.');
        setShowDeleteLinkConfirm(false);
        router.refresh();
      } else {
        setMsg(`Error: ${res.error}`);
        setShowDeleteLinkConfirm(false);
      }
    } catch (err: any) {
      setMsg(`Error: ${err.message || 'Failed to remove post link'}`);
      setShowDeleteLinkConfirm(false);
    } finally {
      setIsDeletingLink(false);
    }
  }

  async function handleConfirmUnjoin() {
    setIsUnjoining(true);
    try {
      const res = await unjoinCampaignAction(campaignId);
      if (res.success) {
        setShowUnjoinConfirm(false);
        router.push('/c/campaigns');
      } else {
        setMsg(`Error: ${res.error}`);
        setShowUnjoinConfirm(false);
      }
    } catch (err: any) {
      setMsg(`Error: ${err.message || 'Failed to unjoin campaign'}`);
      setShowUnjoinConfirm(false);
    } finally {
      setIsUnjoining(false);
    }
  }
  const [copiedHashtag, setCopiedHashtag] = useState<string | null>(null);
  const hasSubmittedLink = Boolean(submissionState && submissionState.post_url && submissionState.post_url.trim().length > 0);

  const totalCampaignBudget = Number(campaign?.total_budget || 0);
  const maxCreatorPoolCap = totalCampaignBudget > 0 ? totalCampaignBudget * 0.25 : 0;

  // Real 60-minute countdown calculation based on submission or last audit timestamp
  const computeRemainingSeconds = () => {
    if (!hasSubmittedLink) return 3600;
    const baseTimeStr = (submissionState as any)?.last_scraped_at || (submissionState as any)?.submitted_at;
    if (!baseTimeStr) return 3600;
    const baseTimestamp = new Date(baseTimeStr).getTime();
    if (isNaN(baseTimestamp)) return 3600;
    const nextAuditTime = baseTimestamp + 60 * 60 * 1000;
    const diffSeconds = Math.floor((nextAuditTime - Date.now()) / 1000);
    return Math.max(0, diffSeconds);
  };

  const [secondsToNextAudit, setSecondsToNextAudit] = useState<number>(3600);

  React.useEffect(() => {
    if (!hasSubmittedLink) return;
    setSecondsToNextAudit(computeRemainingSeconds());

    const timer = setInterval(() => {
      setSecondsToNextAudit(computeRemainingSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, [hasSubmittedLink, (submissionState as any)?.last_scraped_at, (submissionState as any)?.submitted_at]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  if (!campaign) return null;

  async function handleSubmitVideo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg('');

    const formData = new FormData(e.currentTarget);
    const videoUrl = (formData.get('videoUrl') as string)?.trim();

    // Dynamic Anti-Fraud Handle Ownership Check based on the submitted URL's platform
    const parsed = parseSocialPostUrl(videoUrl);
    const matchingAccount = socialAccounts.find(
      s => s.platform.toLowerCase() === parsed.platform.toLowerCase() ||
           (parsed.platform === 'x' && (s.platform.toLowerCase() === 'twitter' || s.platform.toLowerCase() === 'x'))
    );

    const platformDisplay = parsed.platform === 'x' ? 'X (Twitter)' : parsed.platform.charAt(0).toUpperCase() + parsed.platform.slice(1);

    if (!matchingAccount && parsed.platform !== 'unknown') {
      setMsg(`Error: No connected ${platformDisplay} account found. Please connect your ${platformDisplay} account under Connected Accounts before submitting.`);
      return;
    }

    const ownershipCheck = validatePostUrlOwnership(
      videoUrl,
      matchingAccount?.handle,
      matchingAccount?.platform || parsed.platform
    );

    if (!ownershipCheck.isValid) {
      setMsg(`Error: ${ownershipCheck.error || 'Invalid post URL format or ownership mismatch.'}`);
      return;
    }

    setLoading(true);
    const res = await submitCampaignVideoAction(formData);
    setLoading(false);
    if (!res.success) {
      setMsg(`Error: ${res.error}`);
    } else {
      setMsg('Post submitted successfully! View audit cycle initiated.');
      setShowSubmitModal(false);
      setSubmissionState((prev: any) => prev ? {
        ...prev,
        post_url: videoUrl,
        social_account_id: matchingAccount?.id || prev.social_account_id,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      } : null);
      router.refresh();
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedHashtag(text);
    setTimeout(() => setCopiedHashtag(null), 2000);
  }

  // Calculate analytics values strictly based on verified views
  const totalViews = submissionState?.final_view_count || 0;
  const targetThreshold = campaign.min_view_threshold || 1000;
  const viewsPct = Math.min(100, Math.round((totalViews / targetThreshold) * 100));
  const baseReserve = Math.round((targetThreshold / 1000) * campaign.cpm_rate);
  
  // Reserve is met when verified views reach target threshold or payout is released
  const isReserveMet = totalViews >= targetThreshold || Number(submissionState?.payout_amount || 0) > 0 || submissionState?.status === 'paid';
  const calculatedViewsEarned = isReserveMet ? Math.floor((totalViews / 1000) * campaign.cpm_rate) : 0;
  const paidAndPending = Number(submissionState?.payout_amount || 0) + Number(submissionState?.pending_payout_amount || 0);
  const rawEarned = isReserveMet ? Math.max(paidAndPending, calculatedViewsEarned) : 0;
  const earnedAmount = maxCreatorPoolCap > 0 ? Math.min(rawEarned, maxCreatorPoolCap) : rawEarned;
  const isCapReached = maxCreatorPoolCap > 0 && rawEarned >= maxCreatorPoolCap;

  // Gross & Net 10% Platform Fee Calculations
  const grossCampaignValue = isReserveMet ? Math.floor((totalViews / 1000) * campaign.cpm_rate) : 0;
  const cappedGross = maxCreatorPoolCap > 0 ? Math.min(grossCampaignValue, maxCreatorPoolCap) : grossCampaignValue;
  const platformFee = Math.round(cappedGross * 0.10);
  const netTakeHome = cappedGross - platformFee;

  const docUrl = campaign.requirements?.google_doc_url || campaign.requirements?.brand_guide_url || campaign.requirements?.doc_url;
  const driveUrl = campaign.requirements?.google_drive_url || campaign.requirements?.asset_pack_url || campaign.requirements?.drive_url;

  // Extract mandatory tags from campaign requirements
  const hashtags: string[] = campaign.requirements?.hashtags || ['#KpugiCreator', `#${campaign.title.replace(/\s+/g, '')}`];
  const mentions: string[] = campaign.requirements?.mentions || [`@${campaign.company_name?.toLowerCase().replace(/\s+/g, '') || 'brand'}`];
  const isCompleted = campaign.status === 'completed' || campaign.status === 'archived';
  const matchingAccount = socialAccounts.find(s => s.id === submissionState?.social_account_id);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-kpugi-ink dark:text-white font-sans">
      {/* ─────────────────────────────────────────────────────
         HERO HEADER CARD (Strict Theme Compliance)
      ───────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/c/campaigns"
              className="text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white transition-colors mr-1"
              title="Back to My Campaigns"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
              {campaign.campaign_code || `KPG-${campaign.id.slice(0, 8).toUpperCase()}`}
            </span>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              campaign.status === 'completed'
                ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                : campaign.status === 'paused'
                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
            }`}>
              {campaign.status === 'completed' ? '🏁 Completed' : campaign.status === 'paused' ? '⏸️ Paused' : '🟢 Live'}
            </span>

            {campaign.cpm_rate > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/20 font-mono text-[10px] font-bold">
                {formatCompactCurrency(campaign.cpm_rate)} / 1k views
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {campaign.company_logo ? (
              <img
                src={campaign.company_logo}
                alt={campaign.company_name || campaign.title}
                className="w-10 h-10 rounded-xl object-cover border border-kpugi-border dark:border-white/10 shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 text-kpugi-ink dark:text-white font-bold text-sm flex items-center justify-center uppercase shrink-0 border border-kpugi-border dark:border-white/10 shadow-xs">
                {(campaign.company_name || campaign.title).charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-kpugi-ink dark:text-white truncate">
                {campaign.title}
              </h1>
              <span className="text-xs text-kpugi-slate dark:text-slate-400 block truncate">
                {campaign.company_name || 'Brand Partner'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => {
              const el = document.getElementById('content-brief-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            title="View Campaign Briefing"
            className="h-9 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-kpugi-ink dark:text-white border border-kpugi-border dark:border-white/10 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Briefing</span>
          </button>

          {isCompleted ? (
            <button
              onClick={() => setShowReceiptModal(true)}
              className="h-9 px-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Receipt className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Earnings Receipt</span>
            </button>
          ) : hasSubmittedLink ? (
            <div className="flex items-center gap-2">
              <div
                title="Post link is live and undergoing hourly view audit"
                className="h-9 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Link Active</span>
              </div>

              {submissionState?.status !== 'paid' && (
                <button
                  onClick={() => setShowDeleteLinkConfirm(true)}
                  disabled={isDeletingLink}
                  title="Remove Post Link"
                  className="h-9 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span className="hidden sm:inline">{isDeletingLink ? 'Removing...' : 'Remove'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUnjoinConfirm(true)}
                disabled={isUnjoining}
                title="Unjoin Campaign & Release Slot"
                className="h-9 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span className="hidden sm:inline">{isUnjoining ? 'Leaving...' : 'Unjoin'}</span>
              </button>

              <button
                onClick={() => setShowSubmitModal(true)}
                title="Submit Published Post Link"
                className="h-9 px-3.5 rounded-xl bg-kpugi-blue hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Link</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         COMPLETED CAMPAIGN SETTLEMENT RECEIPT BANNER
      ───────────────────────────────────────────────────── */}
      {isCompleted && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50/40 to-blue-50/30 dark:from-[#1A1426] dark:via-[#131728] dark:to-[#0D111D] border border-purple-200/80 dark:border-purple-500/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40">
                <CheckCircle2 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                Campaign Concluded & Settled
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                10% Platform Fee Applied
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This campaign has concluded. Your final verified views have been reconciled, Kpugi&apos;s 10% facilitation fee accounted for, and your net take-home earnings credited to your available wallet balance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setShowReceiptModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>View Settlement Receipt</span>
            </button>
            <Link
              href="/c/wallet"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Wallet</span>
            </Link>
          </div>
        </div>
      )}

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${msg.startsWith('Error') ? 'bg-red-50 dark:bg-rose-950/40 text-red-800 dark:text-rose-300 border border-red-200 dark:border-rose-500/30' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'}`}>
          {msg}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
         6 CORE METRICS SUMMARY GRID (Matches Brand Architecture)
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Verified Views */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-kpugi-blue dark:text-blue-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">Verified Views</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink dark:text-white">
            {totalViews.toLocaleString()}
          </p>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium block">
            {viewsPct}% of threshold
          </span>
        </div>

        {/* 2. Earned Payout */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">
              {isCompleted ? 'Net Payout' : 'Earned Payout'}
            </span>
            <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 leading-none">₦</span>
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink dark:text-white">
            {formatCompactCurrency(isCompleted ? netTakeHome : earnedAmount)}
          </p>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block truncate">
            {isCompleted
              ? `Net (10% fee: ₦${platformFee.toLocaleString()})`
              : isReserveMet
              ? 'Verified Run Settled'
              : `₦${baseReserve.toLocaleString()} Reserved`}
          </span>
        </div>

        {/* 3. CPM Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">Rate (CPM)</span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">1K</span>
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink dark:text-white">
            ₦{campaign.cpm_rate.toLocaleString()}
          </p>
          <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-medium block">Per 1k views</span>
        </div>

        {/* 4. Min Threshold */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">Min Goal</span>
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink dark:text-white">
            {formatCompactNumber(targetThreshold)}
          </p>
          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium block">Minimum views required</span>
        </div>

        {/* 5. Placement Handle */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">Handle</span>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">@</span>
          </div>
          <p className="font-display text-xs sm:text-sm font-bold text-kpugi-ink dark:text-white truncate">
            {matchingAccount ? `@${matchingAccount.handle}` : 'Connected'}
          </p>
          <span className="text-[9px] text-purple-600 dark:text-purple-400 font-medium block uppercase truncate">
            {matchingAccount?.platform || 'Social Profile'}
          </span>
        </div>

        {/* 6. Status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">Status</span>
            <Lock className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
          </div>
          <p className="font-display text-xs sm:text-sm font-bold text-kpugi-ink dark:text-white uppercase truncate">
            {isCompleted ? 'Completed' : submissionState?.status || 'Active'}
          </p>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium block">
            {isCompleted ? 'Payout Released' : 'Auditing Active'}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         CAMPAIGN REVIEW SECTION (CREATOR'S OWN REVIEW)
      ───────────────────────────────────────────────────── */}
      {(isCompleted || isReserveMet || submissionState?.status === 'paid') && (
        hasReviewed && existingReview ? (
          <CampaignReviewsDisplay
            variant="single"
            summary={{
              averageRating: existingReview.rating || 5,
              totalReviews: 1,
              sentimentCounts: {},
              topTags: [],
              reviews: [existingReview],
            }}
            ownReview={existingReview}
          />
        ) : (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-purple-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <Star className="size-5 fill-current" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-950 dark:text-white flex items-center gap-2">
                  <span>How was working with {campaign.company_name || 'this brand'}?</span>
                </h3>
                <p className="font-sans text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Share quick feedback on brief clarity, CPM rates, and payouts in 20 seconds.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#12141A] hover:bg-slate-50 dark:hover:bg-white/10 text-kpugi-ink dark:text-white border border-slate-200 dark:border-white/15 font-display font-bold text-xs shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="size-3.5 text-emerald-500" />
              <span>Leave a Review ⭐</span>
            </button>
          </div>
        )
      )}

      {/* ─────────────────────────────────────────────────────
         MIDDLE ROW: SUBMISSION TRACKER (LEFT) & CONTENT BRIEF (RIGHT)
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: SUBMISSION TRACKER */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-kpugi-border dark:border-white/10 pb-4 mb-6">
              <h3 className="font-display font-bold text-xl text-kpugi-ink dark:text-white">Submission Tracker</h3>
              {isCompleted ? (
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                  <span>🏁 Settlement Concluded</span>
                </span>
              ) : hasSubmittedLink ? (
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Link Active</span>
                </span>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 rounded-xl bg-kpugi-blue text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Post Link</span>
                </button>
              )}
            </div>

            {submissionState && submissionState.post_url ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-kpugi-border dark:border-white/10 bg-slate-50/60 dark:bg-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {(() => {
                      const detectedPlat =
                        (submissionState as any).social_account_platform ||
                        (submissionState.post_url?.includes('x.com') || submissionState.post_url?.includes('twitter.com') ? 'x' : null) ||
                        (submissionState.post_url?.includes('tiktok.com') ? 'tiktok' : null) ||
                        (submissionState.post_url?.includes('youtube.com') || submissionState.post_url?.includes('youtu.be') ? 'youtube' : null) ||
                        (submissionState.post_url?.includes('facebook.com') ? 'facebook' : null) ||
                        'instagram';
                      return <PlatformBadge platform={detectedPlat} />;
                    })()}
                    <div className="truncate">
                      <a
                        href={submissionState.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs font-bold text-kpugi-ink dark:text-white hover:text-kpugi-blue dark:hover:text-blue-400 hover:underline truncate block"
                      >
                        {submissionState.post_url}
                      </a>
                      <span className="text-[11px] text-kpugi-slate dark:text-slate-400 font-sans block mt-0.5">
                        Submitted {new Date(submissionState.submitted_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-kpugi-ink dark:text-white block">
                        {formatCompactNumber(submissionState.final_view_count || 0)} VIEWS
                      </span>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase mt-1 ${
                          submissionState.status === 'verified_pass' || submissionState.status === 'paid'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {submissionState.status === 'verified_pass' ? 'Verified' : submissionState.status}
                      </span>
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => setShowDeleteLinkConfirm(true)}
                        disabled={isDeletingLink}
                        title="Remove Post Link & Start Afresh"
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-kpugi-border dark:border-white/10 rounded-3xl space-y-3">
                <FileText className="w-8 h-8 text-kpugi-slate dark:text-slate-400 mx-auto" />
                <h4 className="font-display font-bold text-base text-kpugi-ink dark:text-white">
                  {isCompleted ? 'Campaign Concluded' : 'No post link submitted yet'}
                </h4>
                <p className="text-xs text-kpugi-slate dark:text-slate-400 max-w-xs mx-auto">
                  {isCompleted
                    ? 'This campaign has ended. No new post submissions can be made.'
                    : 'Paste your live post link (TikTok, Instagram, YouTube, X, Facebook, LinkedIn) to start real-time view auditing.'}
                </p>
                {!isCompleted && (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-kpugi-blue text-white text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit Post Link Now</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 5 COLS: CONTENT BRIEF */}
        <div id="content-brief-section" className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-kpugi-border dark:border-white/10 pb-4">
            <FileText className="w-5 h-5 text-kpugi-blue dark:text-blue-400" />
            <h3 className="font-display font-bold text-xl text-kpugi-ink dark:text-white">Content Brief</h3>
          </div>

          {/* Mandatory Assets */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400 block">
              MANDATORY HASHTAGS & MENTIONS
            </span>
            <div className="flex flex-wrap gap-2">
              {[...hashtags, ...mentions].map((tag) => (
                <button
                  key={tag}
                  onClick={() => copyToClipboard(tag)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-kpugi-ink dark:text-white font-mono text-xs font-bold transition-colors border border-slate-200 dark:border-white/10"
                  title="Click to copy"
                >
                  <span>{tag}</span>
                  {copiedHashtag === tag ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Hard-Cliff Rules Box */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Hard-Cliff Rules</span>
            </div>
            <ul className="space-y-1.5 text-rose-900/80 dark:text-rose-200/80 text-[11px] list-disc list-inside font-medium leading-relaxed">
              <li>Payout starts only after reaching minimum verified views threshold ({targetThreshold.toLocaleString()}).</li>
              <li>Post must remain public for at least 30 days without deletion.</li>
              <li>Bots or artificial engagement leads to immediate disqualification.</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 pt-2 border-t border-kpugi-border dark:border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400 block">
              QUICK ASSET LINKS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {docUrl ? (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl border border-kpugi-border dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold text-kpugi-ink dark:text-white flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">📄</span>
                    <span className="truncate group-hover:text-kpugi-blue dark:group-hover:text-blue-400">Brand Guide (Google Doc)</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-kpugi-slate dark:text-slate-400 shrink-0 ml-2" />
                </a>
              ) : (
                <div className="p-3 rounded-xl border border-kpugi-border/60 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-xs text-kpugi-slate dark:text-slate-400 flex items-center justify-between opacity-70">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📄</span>
                    <span>Brand Guide (Google Doc)</span>
                  </div>
                  <span className="text-[10px] italic">Not attached</span>
                </div>
              )}

              {driveUrl ? (
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl border border-kpugi-border dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold text-kpugi-ink dark:text-white flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">📁</span>
                    <span className="truncate group-hover:text-kpugi-blue dark:group-hover:text-blue-400">Asset Pack (Google Drive)</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-kpugi-slate dark:text-slate-400 shrink-0 ml-2" />
                </a>
              ) : (
                <div className="p-3 rounded-xl border border-kpugi-border/60 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-xs text-kpugi-slate dark:text-slate-400 flex items-center justify-between opacity-70">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📁</span>
                    <span>Asset Pack (Google Drive)</span>
                  </div>
                  <span className="text-[10px] italic">Not attached</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         BOTTOM ROW: LIVE AUDIT LOG
      ───────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCapReached ? 'bg-emerald-500' : 'bg-kpugi-blue animate-pulse'}`} />
            <h3 className="font-display font-bold text-xl text-kpugi-ink dark:text-white">Live Audit Log</h3>
            <span className="text-xs text-kpugi-slate dark:text-slate-400 ml-2 font-medium hidden sm:inline">
              {isCapReached ? 'Audits Concluded • Maximum Cap Settled' : 'Live Metric Sync Active'}
            </span>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="text-xs font-bold text-kpugi-blue dark:text-blue-400 hover:underline flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Log</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-kpugi-border dark:border-white/10 text-kpugi-slate dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4 text-left">TIMESTAMP</th>
                <th className="py-3 px-4 text-left">AUDIT CYCLE</th>
                <th className="py-3 px-4 text-left">NET NEW VIEWS</th>
                <th className="py-3 px-4 text-left">EARNED PAYOUT</th>
                <th className="py-3 px-4 text-right">SETTLEMENT STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.audits && data.audits.length > 0 ? (
                data.audits
                  .slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize)
                  .map((audit: any, idx: number) => {
                    const cycleIndex = data.audits!.length - ((auditPage - 1) * auditPageSize + idx);
                    return (
                      <tr
                        key={audit.id || idx}
                        className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="font-mono text-kpugi-slate dark:text-slate-400 whitespace-nowrap py-3.5 px-4">
                          <span className="font-bold text-kpugi-ink dark:text-white text-xs block">
                            {new Date(audit.settled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">
                            {new Date(audit.settled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="font-bold text-kpugi-ink dark:text-white py-3.5 px-4">
                          Cycle #{cycleIndex}
                        </td>
                        <td className="font-mono font-bold text-emerald-600 dark:text-emerald-400 py-3.5 px-4">
                          +{formatCompactNumber(audit.views_delta)}
                        </td>
                        <td className="font-mono font-bold text-kpugi-blue dark:text-blue-400 py-3.5 px-4">
                          {formatCompactCurrency(audit.payout_amount)}
                        </td>
                        <td className="text-right py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md font-mono font-bold uppercase text-[10px] ${
                            audit.status === 'auto_approved'
                              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                              : audit.status === 'approved'
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                              : audit.status === 'pending' || audit.status === 'accumulating'
                              ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                              : 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-500/30'
                          }`}>
                            {audit.status === 'auto_approved'
                              ? '⚡ Auto-Credited'
                              : audit.status === 'approved'
                              ? '✓ Settled & Approved'
                              : audit.status === 'pending' || audit.status === 'accumulating'
                              ? (audit.views_delta > 0 && audit.payout_amount > 0 ? '⏳ Verified & Auditing' : '⏳ Accumulating Views')
                              : audit.status === 'failed'
                              ? '❌ Unreachable'
                              : audit.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-kpugi-slate dark:text-slate-400 mb-1">
                        <Clock className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-sm text-kpugi-ink dark:text-white">No Settled Audit Runs Yet</p>
                      <p className="text-xs text-kpugi-slate dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Automated view audits verify engagement and settle payouts into your available balance automatically as milestones are reached.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Audit Log Pagination Controls */}
        {data.audits && data.audits.length > auditPageSize && (() => {
          const totalAudits = data.audits.length;
          const totalAuditPages = Math.ceil(totalAudits / auditPageSize);
          return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-kpugi-border text-xs font-sans">
              <span className="text-kpugi-slate text-[11px] font-medium">
                Showing <strong className="text-kpugi-ink">{(auditPage - 1) * auditPageSize + 1}</strong> to{' '}
                <strong className="text-kpugi-ink">{Math.min(auditPage * auditPageSize, totalAudits)}</strong> of{' '}
                <strong className="text-kpugi-ink">{totalAudits}</strong> audit runs
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                  disabled={auditPage === 1}
                  className="px-2.5 py-1.5 rounded-xl border border-kpugi-border bg-white hover:bg-slate-50 text-kpugi-ink font-bold disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalAuditPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAuditPage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                        auditPage === i + 1
                          ? 'bg-kpugi-blue text-white shadow-2xs'
                          : 'text-kpugi-slate hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setAuditPage((p) => Math.min(totalAuditPages, p + 1))}
                  disabled={auditPage === totalAuditPages}
                  className="px-2.5 py-1.5 rounded-xl border border-kpugi-border bg-white hover:bg-slate-50 text-kpugi-ink font-bold disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* SUBMIT POST LINK MODAL (PORTALED WITH BLUR BACKDROP) */}
      {showSubmitModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) setShowSubmitModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-[#12141A] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 dark:border-white/10 relative text-kpugi-ink dark:text-white">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-kpugi-ink dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-kpugi-blue dark:text-blue-400 text-[11px] font-bold font-mono uppercase tracking-wider mb-2 border border-blue-100 dark:border-blue-800/40">
                Verification Pipeline
              </div>
              <h3 className="font-display font-bold text-2xl text-kpugi-ink dark:text-white">Submit Post Link</h3>
              <p className="text-xs text-kpugi-slate dark:text-slate-400 mt-1 leading-relaxed">
                Paste the public URL of your posted content (TikTok, Instagram, YouTube, X/Twitter, Facebook, LinkedIn).
              </p>
            </div>

            <form onSubmit={handleSubmitVideo} className="space-y-4 pt-1">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <div>
                <label className="block text-xs font-bold text-kpugi-slate dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Public Post URL
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  placeholder="https://www.tiktok.com/@creator/video/... or https://x.com/..."
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 font-mono text-xs text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal focus:outline-none focus:border-kpugi-blue focus:ring-4 focus:ring-kpugi-blue/10 transition-all shadow-sm"
                />
              </div>

              {msg && (
                <div className={`p-3 rounded-xl text-xs font-bold ${msg.startsWith('Error') ? 'bg-red-50 dark:bg-rose-950/40 text-red-700 dark:text-rose-300 border border-red-200 dark:border-rose-500/30' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'}`}>
                  {msg}
                </div>
              )}

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 font-sans text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-3 rounded-xl bg-kpugi-blue hover:bg-blue-600 text-white font-sans text-xs font-bold transition-all shadow-md shadow-kpugi-blue/20"
                >
                  {loading ? 'Submitting...' : 'Submit Post Link'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal: Delete Post Link */}
      <ConfirmModal
        isOpen={showDeleteLinkConfirm}
        onClose={() => setShowDeleteLinkConfirm(false)}
        onConfirm={handleConfirmDeleteLink}
        title="Remove Post Link?"
        description="All verified views, audit history, and associated earnings for this post will be removed. Any cleared earnings will be deducted from your wallet balance and refunded to the campaign budget."
        confirmText="Remove Link & Reset"
        cancelText="Keep Post Link"
        variant="danger"
        isLoading={isDeletingLink}
      />

      {/* Confirmation Modal: Unjoin Campaign */}
      <ConfirmModal
        isOpen={showUnjoinConfirm}
        onClose={() => setShowUnjoinConfirm(false)}
        onConfirm={handleConfirmUnjoin}
        title="Unjoin Campaign?"
        description="Are you sure you want to leave this campaign? Your reserved slot and budget will be released back to the campaign pool."
        confirmText="Unjoin Campaign"
        cancelText="Stay in Campaign"
        variant="danger"
        isLoading={isUnjoining}
        theme="light"
      />

      {/* ─────────────────────────────────────────────────────
         CAMPAIGN REVIEW MODAL
      ───────────────────────────────────────────────────── */}
      <CampaignReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        campaignId={campaignId}
        campaignTitle={campaign.title}
        brandName={campaign.company_name}
        role="creator"
        metricsHighlight={earnedAmount > 0 ? `₦${earnedAmount.toLocaleString()} earned` : `${totalViews.toLocaleString()} views`}
        onSubmitted={() => {
          setHasReviewed(true);
        }}
      />

      {/* ─────────────────────────────────────────────────────
         CAMPAIGN SETTLEMENT & EARNINGS RECEIPT MODAL
      ───────────────────────────────────────────────────── */}
      {showReceiptModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReceiptModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-[#12141A] rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden relative text-kpugi-ink dark:text-white my-8">
            {/* Header Pattern */}
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white p-6 sm:p-7 relative">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="absolute top-5 right-5 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider font-mono">
                  Official Settlement Receipt
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-bold font-mono">
                  Concluded
                </span>
              </div>

              <h3 className="font-display font-extrabold text-2xl tracking-tight">
                Campaign Earnings Receipt
              </h3>
              <p className="text-xs text-white/80 mt-1 font-mono">
                {campaign.campaign_code || `KPG-${campaign.id.slice(0, 8).toUpperCase()}`} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              {/* Campaign Meta Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Campaign
                  </span>
                  <span className="text-xs font-bold text-kpugi-ink dark:text-white truncate max-w-[200px]">
                    {campaign.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Brand Partner
                  </span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {campaign.company_name || 'Brand Partner'}
                  </span>
                </div>
                {matchingAccount && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Connected Profile
                    </span>
                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                      @{matchingAccount.handle} ({matchingAccount.platform})
                    </span>
                  </div>
                )}
              </div>

              {/* Itemized Financial Breakdown Table */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Financial Breakdown
                </span>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-white/5 font-sans text-xs">
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total Verified Views Delivered</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {totalViews.toLocaleString()} views
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Campaign CPM Rate</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ₦{campaign.cpm_rate.toLocaleString()} / 1k views
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Gross Campaign Value</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ₦{cappedGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between bg-purple-50/40 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300">
                    <div className="space-y-0.5">
                      <span className="font-medium block">Kpugi Platform Facilitation Fee (10%)</span>
                      <span className="text-[10px] text-purple-700 dark:text-purple-400 block">Performance facilitation & anti-fraud audit</span>
                    </div>
                    <span className="font-mono font-bold">
                      -₦{platformFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-bold border-t border-emerald-200 dark:border-emerald-500/20">
                    <div className="space-y-0.5">
                      <span className="text-xs uppercase tracking-wider block">Net Creator Pay</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-normal block">90% Creator Net Share</span>
                    </div>
                    <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₦{netTakeHome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settlement Notice */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 flex items-start gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
                    Settled to Available Wallet Balance
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Net funds have concluded settlement and are available in your wallet.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-1/2 py-3 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <Link
                  href="/c/wallet"
                  className="w-1/2 py-3 rounded-xl bg-kpugi-blue hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-kpugi-blue/20 text-center"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Go to Wallet</span>
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
