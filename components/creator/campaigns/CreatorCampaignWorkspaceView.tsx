'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { CampaignDetailsForCreator } from '@/lib/supabase/dashboard';
import { submitCampaignVideoAction, unjoinCampaignAction, deleteSubmissionLinkAction } from '@/app/actions/creator';
import { validatePostUrlOwnership, parseSocialPostUrl } from '@/lib/utils/social-url';
import { PlatformBadge } from '@/components/ui/SocialIcons';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/utils/format';
import ConfirmModal from '@/components/common/ConfirmModal';

interface CreatorCampaignWorkspaceViewProps {
  data: CampaignDetailsForCreator;
  campaignId: string;
}

export default function CreatorCampaignWorkspaceView({ data, campaignId }: CreatorCampaignWorkspaceViewProps) {
  const router = useRouter();
  const { campaign, submission, creatives, allSubmissions, socialAccounts = [] } = data;
  const [submissionState, setSubmissionState] = useState(submission);

  useEffect(() => {
    setSubmissionState(submission);
  }, [submission]);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const docUrl = campaign.requirements?.google_doc_url || campaign.requirements?.brand_guide_url || campaign.requirements?.doc_url;
  const driveUrl = campaign.requirements?.google_drive_url || campaign.requirements?.asset_pack_url || campaign.requirements?.drive_url;

  // Extract mandatory tags from campaign requirements
  const hashtags: string[] = campaign.requirements?.hashtags || ['#KpugiCreator', `#${campaign.title.replace(/\s+/g, '')}`];
  const mentions: string[] = campaign.requirements?.mentions || [`@${campaign.company_name?.toLowerCase().replace(/\s+/g, '') || 'brand'}`];

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink font-sans">
      {/* ─────────────────────────────────────────────────────
         HERO HEADER CARD
      ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-kpugi-ink via-slate-900 to-kpugi-blue text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {campaign.company_logo ? (
              <img
                src={campaign.company_logo}
                alt={campaign.company_name || campaign.title}
                className="w-14 h-14 rounded-2xl object-cover border border-white/20 shrink-0 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-white/15 text-white font-bold text-xl flex items-center justify-center uppercase shrink-0 border border-white/20 shadow-md">
                {(campaign.company_name || campaign.title).charAt(0)}
              </div>
            )}

            <div className="space-y-2.5">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {campaign.title}
              </h1>

              <div className="flex items-center gap-2 flex-wrap font-sans">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {campaign.status || 'LIVE'}
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/15 font-mono text-[11px] font-bold backdrop-blur-md">
                  {campaign.campaign_code || `KPG-${campaign.id.slice(0, 8).toUpperCase()}`}
                </span>

                {campaign.cpm_rate > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] font-bold backdrop-blur-md">
                    {formatCompactCurrency(campaign.cpm_rate)} / 1k views
                  </span>
                )}
              </div>

              {campaign.channels && campaign.channels.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  {(Array.from(
                    new Set(
                      campaign.channels.map((ch: string) => {
                        const p = ch.toLowerCase();
                        if (p.includes('tiktok')) return 'tiktok';
                        if (p.includes('youtube') || p.includes('shorts')) return 'youtube';
                        if (p.includes('facebook') || p.includes('fb')) return 'facebook';
                        if (p.includes('twitter') || p.includes('x')) return 'x';
                        if (p.includes('insta')) return 'instagram';
                        return ch;
                      })
                    )
                  ) as string[]).map((platform: string) => (
                    <PlatformBadge key={platform} platform={platform} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-2.5 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
            {/* 1. View Briefing Button */}
            <button
              onClick={() => {
                const el = document.getElementById('content-brief-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              title="View Campaign Briefing"
              className="group h-10 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-bold transition-all duration-300 ease-out border border-white/15 backdrop-blur-md flex items-center overflow-hidden shadow-2xs"
            >
              <FileText className="w-4 h-4 text-white shrink-0 group-hover:text-blue-300 transition-colors" />
              <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-out whitespace-nowrap overflow-hidden">
                View Briefing
              </span>
            </button>

            {hasSubmittedLink ? (
              <div className="flex items-center gap-2">
                {/* 2. Submitted Link Indicator */}
                <div
                  title="Post link has been submitted and view verification is active"
                  className="group h-10 px-3 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-sans text-xs font-bold flex items-center backdrop-blur-md cursor-default overflow-hidden transition-all duration-300 ease-out shadow-2xs"
                >
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-out whitespace-nowrap overflow-hidden">
                    Post Link Active
                  </span>
                </div>

                {/* 3. Delete / Remove Post Link Button */}
                {submissionState?.status !== 'paid' && (
                  <button
                    onClick={() => setShowDeleteLinkConfirm(true)}
                    disabled={isDeletingLink}
                    title="Remove Post Link & Reset Stats"
                    className="group h-10 px-3 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-sans text-xs font-bold transition-all duration-300 ease-out backdrop-blur-md flex items-center overflow-hidden disabled:opacity-50 shadow-2xs"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-out whitespace-nowrap overflow-hidden">
                      {isDeletingLink ? 'Removing...' : 'Remove Link'}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* 3. Unjoin Button */}
                <button
                  onClick={() => setShowUnjoinConfirm(true)}
                  disabled={isUnjoining}
                  title="Unjoin Campaign & Release Slot"
                  className="group h-10 px-3 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-sans text-xs font-bold transition-all duration-300 ease-out backdrop-blur-md flex items-center overflow-hidden disabled:opacity-50 shadow-2xs"
                >
                  <X className="w-4 h-4 text-rose-400 shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-out whitespace-nowrap overflow-hidden">
                    {isUnjoining ? 'Leaving...' : 'Unjoin'}
                  </span>
                </button>

                {/* 4. Submit Post Link Button */}
                <button
                  onClick={() => setShowSubmitModal(true)}
                  title="Submit Published Post Link"
                  className="group h-10 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-kpugi-ink font-sans text-xs font-bold transition-all duration-300 ease-out shadow-md flex items-center overflow-hidden"
                >
                  <Plus className="w-4 h-4 text-kpugi-blue shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-out whitespace-nowrap overflow-hidden">
                    Submit Post Link
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-kpugi-blue/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${msg.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
          {msg}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
         TOP 3 ANALYTICS CARDS
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Verified Views */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-kpugi-slate uppercase tracking-wider">VERIFIED VIEWS</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-bold text-3xl sm:text-4xl text-kpugi-ink">
                {totalViews.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                +{viewsPct}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${viewsPct}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-kpugi-slate font-medium pt-1">
            <span>Goal: {targetThreshold.toLocaleString()} views</span>
            {isCapReached ? (
              <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Audits Complete</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-mono font-bold text-kpugi-blue bg-blue-50/80 px-2 py-0.5 rounded-md text-[10px] border border-blue-100">
                {hasSubmittedLink ? (
                  secondsToNextAudit > 0 ? (
                    <>
                      <Clock className="w-3 h-3 text-kpugi-blue animate-spin" />
                      <span>Next Audit: {formatTimer(secondsToNextAudit)}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Audit in progress...</span>
                    </>
                  )
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Awaiting Post Link</span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Earned So Far */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-kpugi-slate uppercase tracking-wider">EARNED SO FAR</span>
            <span className="font-mono font-black text-sm text-kpugi-blue leading-none">₦</span>
          </div>
          <div>
            <div className="font-mono font-bold text-3xl sm:text-4xl text-kpugi-blue flex items-baseline gap-2 flex-wrap">
              <span>{formatCompactCurrency(earnedAmount)}</span>
              {isCapReached && (
                <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>Pool Cap</span>
                </span>
              )}
              {!isReserveMet && !isCapReached && (
                <span className="text-[11px] font-mono font-medium text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg shrink-0">
                  (₦{baseReserve.toLocaleString()} reserved)
                </span>
              )}
            </div>
            <span className="text-[11px] text-kpugi-slate block mt-1">
              {isCapReached 
                ? 'Maximum creator pool limit achieved.' 
                : isReserveMet 
                ? 'Clears to your wallet balance 24 hours after verified run.'
                : 'Initial slot reserve held in escrow until threshold is reached.'
              }
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-kpugi-slate font-medium pt-1">
            <span>CPM: ₦{campaign.cpm_rate.toLocaleString()} / 1k</span>
            {maxCreatorPoolCap > 0 && (
              <span className="font-mono text-[10px] text-kpugi-slate bg-slate-100 px-2 py-0.5 rounded-md">
                Cap: {formatCompactCurrency(maxCreatorPoolCap)} (25% pool)
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Escrow Status */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-kpugi-slate uppercase tracking-wider">ESCROW STATUS</span>
            <Lock className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-2xl sm:text-3xl text-kpugi-ink">
                Secured
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold uppercase">
                LOCKED
              </span>
            </div>
            <span className="text-[11px] text-kpugi-slate block mt-1">
              Verified by Kpugi Smart Contract
            </span>
          </div>
          <span className="text-[11px] text-kpugi-slate font-medium">
            Budget Reserved: {formatCompactCurrency(campaign.total_budget || 0)}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         MIDDLE ROW: SUBMISSION TRACKER (LEFT) & CONTENT BRIEF (RIGHT)
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: SUBMISSION TRACKER */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-kpugi-border pb-4 mb-6">
              <h3 className="font-display font-bold text-xl text-kpugi-ink">Submission Tracker</h3>
              {hasSubmittedLink ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
                <div className="p-4 rounded-2xl border border-kpugi-border bg-slate-50/60 flex items-center justify-between gap-4">
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
                        className="font-mono text-xs font-bold text-kpugi-ink hover:text-kpugi-blue hover:underline truncate block"
                      >
                        {submissionState.post_url}
                      </a>
                      <span className="text-[11px] text-kpugi-slate font-sans block mt-0.5">
                        Submitted {new Date(submissionState.submitted_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-kpugi-ink block">
                        {formatCompactNumber(submissionState.final_view_count || 0)} VIEWS
                      </span>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase mt-1 ${
                          submissionState.status === 'verified_pass' || submissionState.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {submissionState.status === 'verified_pass' ? 'Verified' : submissionState.status}
                      </span>
                    </div>

                    <button
                      onClick={() => setShowDeleteLinkConfirm(true)}
                      disabled={isDeletingLink}
                      title="Remove Post Link & Start Afresh"
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-transparent hover:border-rose-200 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-kpugi-border rounded-3xl space-y-3">
                <FileText className="w-8 h-8 text-kpugi-slate mx-auto" />
                <h4 className="font-display font-bold text-base text-kpugi-ink">No post link submitted yet</h4>
                <p className="text-xs text-kpugi-slate max-w-xs mx-auto">
                  Paste your live post link (TikTok, Instagram, YouTube, X, Facebook, LinkedIn) to start real-time view auditing.
                </p>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-kpugi-blue text-white text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Post Link Now</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 5 COLS: CONTENT BRIEF */}
        <div id="content-brief-section" className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-kpugi-border pb-4">
            <FileText className="w-5 h-5 text-kpugi-blue" />
            <h3 className="font-display font-bold text-xl text-kpugi-ink">Content Brief</h3>
          </div>

          {/* Mandatory Assets */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate block">
              MANDATORY HASHTAGS & MENTIONS
            </span>
            <div className="flex flex-wrap gap-2">
              {[...hashtags, ...mentions].map((tag) => (
                <button
                  key={tag}
                  onClick={() => copyToClipboard(tag)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-kpugi-ink font-mono text-xs font-bold transition-colors border border-slate-200"
                  title="Click to copy"
                >
                  <span>{tag}</span>
                  {copiedHashtag === tag ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Hard-Cliff Rules Box */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-rose-800 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Hard-Cliff Rules</span>
            </div>
            <ul className="space-y-1.5 text-rose-900/80 text-[11px] list-disc list-inside font-medium leading-relaxed">
              <li>Payout starts only after reaching minimum verified views threshold ({targetThreshold.toLocaleString()}).</li>
              <li>Post must remain public for at least 30 days without deletion.</li>
              <li>Bots or artificial engagement leads to immediate disqualification.</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 pt-2 border-t border-kpugi-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate block">
              QUICK ASSET LINKS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {docUrl ? (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl border border-kpugi-border bg-slate-50 hover:bg-slate-100 text-xs font-bold text-kpugi-ink flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">📄</span>
                    <span className="truncate group-hover:text-kpugi-blue">Brand Guide (Google Doc)</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-kpugi-slate shrink-0 ml-2" />
                </a>
              ) : (
                <div className="p-3 rounded-xl border border-kpugi-border/60 bg-slate-50/50 text-xs text-kpugi-slate flex items-center justify-between opacity-70">
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
                  className="p-3 rounded-xl border border-kpugi-border bg-slate-50 hover:bg-slate-100 text-xs font-bold text-kpugi-ink flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">📁</span>
                    <span className="truncate group-hover:text-kpugi-blue">Asset Pack (Google Drive)</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-kpugi-slate shrink-0 ml-2" />
                </a>
              ) : (
                <div className="p-3 rounded-xl border border-kpugi-border/60 bg-slate-50/50 text-xs text-kpugi-slate flex items-center justify-between opacity-70">
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
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCapReached ? 'bg-emerald-500' : 'bg-kpugi-blue animate-pulse'}`} />
            <h3 className="font-display font-bold text-xl text-kpugi-ink">Live Audit Log</h3>
            <span className="text-xs text-kpugi-slate ml-2 font-medium hidden sm:inline">
              {isCapReached ? 'Audits Concluded • Maximum Cap Settled' : 'Live Metric Sync Active'}
            </span>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="text-xs font-bold text-kpugi-blue hover:underline flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Log</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-xs font-sans">
            <thead>
              <tr className="border-b border-kpugi-border text-kpugi-slate uppercase text-[10px] tracking-wider font-bold">
                <th>TIMESTAMP</th>
                <th>AUDIT CYCLE</th>
                <th>NET NEW VIEWS</th>
                <th>EARNED PAYOUT</th>
                <th className="text-right">SETTLEMENT STATUS</th>
              </tr>
            </thead>
            <tbody>
              {data.audits && data.audits.length > 0 ? (
                data.audits
                  .slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize)
                  .map((audit: any, idx: number) => {
                    const cycleIndex = data.audits!.length - ((auditPage - 1) * auditPageSize + idx);
                    return (
                      <tr key={audit.id || idx} className="border-b border-slate-100">
                        <td className="font-mono text-kpugi-slate whitespace-nowrap py-3">
                          <span className="font-bold text-kpugi-ink text-xs block">
                            {new Date(audit.settled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            {new Date(audit.settled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="font-bold text-kpugi-ink">
                          Cycle #{cycleIndex}
                        </td>
                        <td className="font-mono font-bold text-emerald-600">
                          +{formatCompactNumber(audit.views_delta)}
                        </td>
                        <td className="font-mono font-bold text-kpugi-blue">
                          {formatCompactCurrency(audit.payout_amount)}
                        </td>
                        <td className="text-right">
                          <span className={`px-2.5 py-0.5 rounded-md font-mono font-bold uppercase text-[10px] ${
                            audit.status === 'auto_approved'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : audit.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : audit.status === 'pending' || audit.status === 'accumulating'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
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
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-kpugi-slate mb-1">
                        <Clock className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-sm text-kpugi-ink">No Settled Audit Runs Yet</p>
                      <p className="text-xs text-kpugi-slate max-w-sm mx-auto leading-relaxed">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-kpugi-ink p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-kpugi-blue text-[11px] font-bold font-mono uppercase tracking-wider mb-2">
                Verification Pipeline
              </div>
              <h3 className="font-display font-bold text-2xl text-kpugi-ink">Submit Post Link</h3>
              <p className="text-xs text-kpugi-slate mt-1 leading-relaxed">
                Paste the public URL of your posted content (TikTok, Instagram, YouTube, X/Twitter, Facebook, LinkedIn).
              </p>
            </div>

            <form onSubmit={handleSubmitVideo} className="space-y-4 pt-1">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1.5 uppercase tracking-wider">
                  Public Post URL
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  placeholder="https://www.tiktok.com/@creator/video/... or https://x.com/..."
                  required
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white font-mono text-xs text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-kpugi-blue focus:ring-4 focus:ring-kpugi-blue/10 transition-all shadow-sm"
                />
              </div>

              {msg && (
                <div className={`p-3 rounded-xl text-xs font-bold ${msg.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                  {msg}
                </div>
              )}

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-kpugi-border bg-white text-kpugi-slate hover:text-kpugi-ink hover:bg-slate-50 font-sans text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-3 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20"
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
        theme="light"
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
    </div>
  );
}
