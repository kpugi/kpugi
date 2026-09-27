'use client';

import React, { useState, useTransition, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Gift,
  Flame,
  BadgePercent,
  Wrench,
  Package,
  Zap,
  Timer,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  Info,
  Send,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Bot,
  Eye,
  FileText,
  CheckCircle,
  ArrowUp,
  RefreshCw,
  Landmark,
  Upload,
  Link as LinkIcon,
  Tag,
  Wallet,
  Users,
  Trophy,
  Truck,
  BarChart3,
} from 'lucide-react';
import { PerkWithClaim, PerkType } from '@/lib/supabase/perks';
import { getCreatorLevel } from '@/lib/utils/levels';
import { submitPerkProofAction } from '@/app/actions/perks';
import { openFreshdeskWidget } from '@/lib/support/freshdesk';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS & METADATA
// ─────────────────────────────────────────────────────────────────────────────

// 3 Official Categories: Challenges, Coupons, Freebies
const TYPE_META: Record<
  PerkType,
  { label: string; badgeBg: string; badgeText: string; Icon: React.FC<{ className?: string }> }
> = {
  challenge: { label: 'Challenge Bounty', badgeBg: 'bg-kpugi-blue text-white',  badgeText: 'text-white', Icon: Flame },
  coupon:    { label: 'Coupon',  badgeBg: 'bg-indigo-600 text-white', badgeText: 'text-white', Icon: BadgePercent },
  freebie:   { label: 'Freebie',          badgeBg: 'bg-emerald-600 text-white',badgeText: 'text-white', Icon: Package },
};

function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function quotaPct(claimed: number, total?: number | null): number {
  if (!total) return 0;
  return Math.min(100, Math.round((claimed / total) * 100));
}

// ─────────────────────────────────────────────────────────────────────────────
// COPY BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-white/10 border border-kpugi-border dark:border-white/10 font-sans text-xs font-semibold text-kpugi-ink dark:text-white hover:bg-kpugi-blue hover:border-kpugi-blue hover:text-white transition-all shadow-sm shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-kpugi-naira" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : (label ?? 'Copy Code')}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DETAIL VIEW
// ─────────────────────────────────────────────────────────────────────────────

interface PerkDetailViewProps {
  perk: PerkWithClaim;
  creatorId: string;
  totalEarned: number;
}

export default function PerkDetailView({ perk, creatorId, totalEarned }: PerkDetailViewProps) {
  const [submitted, setSubmitted] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [platform, setPlatform] = useState('TikTok Video');
  const [proofNotes, setProofNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const rankData = getCreatorLevel(totalEarned);
  const creatorLevel = rankData.currentLevelNumber;
  const isLocked = creatorLevel < perk.min_creator_level;
  const claim = perk.claim;
  const days = daysUntil(perk.end_at);
  const meta = TYPE_META[perk.perk_type] || TYPE_META.challenge;
  const TypeIcon = meta.Icon;

  const isApproved = claim?.status === 'approved';
  const isSubmitted = submitted || claim?.status === 'submitted';
  const isRejected = claim?.status === 'rejected';

  // Calculate progression percentage
  let progressPercent = 33;
  if (isLocked) {
    progressPercent = 0;
  } else if (perk.perk_type === 'coupon') {
    progressPercent = 100; // Coupon discounts are 100% accessible immediately
  } else if (isApproved) {
    progressPercent = 100;
  } else if (isSubmitted) {
    progressPercent = 66;
  } else {
    progressPercent = 33;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // DYNAMIC VALUE HIGHLIGHT CALCULATOR (MATCHES PERK TYPE)
  // ───────────────────────────────────────────────────────────────────────────
  function cleanDisplayValue(val?: string | null): string {
    if (!val) return '';
    return val.replace(/^(worth|saves\s*~?|valued\s*at|up\s*to)\s*/i, '').trim();
  }

  const getRewardValueDisplay = () => {
    if (perk.perk_type === 'challenge') {
      const rawVal = perk.reward_amount ? `₦${Number(perk.reward_amount).toLocaleString()}` : (perk.savings_value || 'Escrow Cash Bounty');
      return {
        label: 'CHALLENGE REWARD',
        main: cleanDisplayValue(rawVal),
        unit: perk.reward_amount ? 'NGN' : '',
        subtext: 'Direct Instant Wallet Credit',
        Icon: Wallet,
        accentClass: 'text-kpugi-blue dark:text-blue-400',
      };
    }
    if (perk.perk_type === 'coupon') {
      const rawVal = perk.savings_value || (perk.coupon_code ? 'Special Promo' : 'Exclusive Deal');
      return {
        label: 'COUPON DISCOUNT',
        main: cleanDisplayValue(rawVal),
        unit: '',
        subtext: perk.coupon_code ? `Promo Code: ${perk.coupon_code}` : 'Instant Partner Discount',
        Icon: BadgePercent,
        accentClass: 'text-indigo-600 dark:text-indigo-400',
      };
    }
    // freebie
    const rawVal = perk.savings_value || (perk.reward_amount ? `₦${Number(perk.reward_amount).toLocaleString()}` : 'Hardware Bundle');
    return {
      label: 'FREEBIE VALUE',
      main: cleanDisplayValue(rawVal),
      unit: '',
      subtext: 'Doorstep Courier Delivery (DHL Express)',
      Icon: Package,
      accentClass: 'text-emerald-600 dark:text-emerald-400',
    };
  };

  const rewardDisplay = getRewardValueDisplay();
  const RewardIcon = rewardDisplay.Icon;

  // ───────────────────────────────────────────────────────────────────────────
  // FORM SUBMISSION HANDLER
  // ───────────────────────────────────────────────────────────────────────────
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl.trim()) {
      setError('Please enter a valid live post or verification URL.');
      return;
    }
    setError('');
    startTransition(async () => {
      const fullNotes = proofNotes.trim()
        ? `[Platform: ${platform}] ${proofNotes.trim()}`
        : `[Platform: ${platform}]`;

      const res = await submitPerkProofAction({
        perkId: perk.id,
        proofUrl: proofUrl.trim(),
        proofNotes: fullNotes,
      });

      if (!res.success) {
        setError(res.error || 'Failed to submit verification link. Please try again.');
        return;
      }

      setSubmitted(true);
      setToastMessage('Verification proof submitted! Automated audit queued. Progress updated.');
      setTimeout(() => setToastMessage(null), 8000);
    });
  };

  const handleSupportClick = () => {
    try {
      openFreshdeskWidget();
    } catch {
      alert(`KpugiBot Support Assistant: Connected. Checking verification criteria for ${perk.title}...`);
    }
  };

  const scrollToSubmission = () => {
    const el = document.getElementById('submission-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        urlInputRef.current?.focus();
      }, 400);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto pb-16 font-sans">

      {/* ── TOP BACK NAVIGATION ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <Link
          href="/c/freebies"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-kpugi-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Perks &amp; Freebies</span>
        </Link>

        
      </div>

      {/* ── HERO HEADER BANNER (WITH HERO IMAGE & DYNAMIC VALUE) ─────────────── */}
      <div className="relative w-full rounded-2xl bg-white dark:bg-[#121827] p-6 lg:p-8 shadow-sm border border-kpugi-border dark:border-white/10 overflow-hidden mb-6">
        {/* Soft Ambient Radial Glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-kpugi-blue/10 dark:bg-kpugi-blue/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">

          {/* Left: Cover Image + Title & Description */}
          <div className="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
            {/* Perk Cover Image Card (Zero Badges - Pure Image) */}
            <div className="relative w-full sm:w-48 md:w-56 h-44 sm:h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-kpugi-border/80 dark:border-white/10 shrink-0 shadow-sm group">
              <img
                src={perk.cover_image_url}
                alt={perk.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Title, Badges & Description */}
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full ${meta.badgeBg} text-xs font-sans font-bold uppercase tracking-wider shadow-sm`}>
                  {meta.label}
                </span>

                {days !== null && days > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold border border-amber-200/60 dark:border-amber-800/40">
                    <Timer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{days}d</span>
                  </span>
                )}

                <span className="px-2 py-0.5 rounded-full bg-kpugi-paper dark:bg-white/10 text-kpugi-slate dark:text-slate-300 text-xs font-sans font-semibold">
                  Level {perk.min_creator_level}+
                </span>

                {perk.has_affiliate_disclaimer && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-kpugi-slate dark:text-slate-300 text-[11px] font-sans font-medium flex items-center gap-1">
                    <Info className="w-3 h-3 text-kpugi-blue" />
                    <span>Partner terms apply</span>
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-kpugi-ink dark:text-white tracking-tight leading-tight">
                {perk.title}
              </h1>
              <p className="font-sans text-sm md:text-base text-kpugi-slate dark:text-slate-400 leading-relaxed max-w-2xl">
                {perk.description}
              </p>
            </div>
          </div>

          {/* Right: Dynamic Reward Highlight Card by Perk Type (Vertical Container) */}
          <div className="flex flex-col items-center justify-between text-center p-6 rounded-2xl bg-kpugi-paper dark:bg-white/5 border border-kpugi-border/80 dark:border-white/10 w-full sm:w-56 md:w-60 xl:w-56 2xl:w-64 min-h-[195px] xl:min-h-[210px] gap-3 shadow-sm shrink-0">
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">
              {rewardDisplay.label}
            </span>

            <div className="flex flex-col items-center justify-center my-auto py-1">
              <div className="flex items-baseline justify-center gap-1.5 flex-wrap">
                <span className={`font-display text-3xl sm:text-4xl font-bold tracking-tight ${rewardDisplay.accentClass} leading-tight`}>
                  {rewardDisplay.main}
                </span>
                {rewardDisplay.unit && (
                  <span className="font-mono text-xs sm:text-sm font-bold text-kpugi-slate dark:text-slate-400">
                    {rewardDisplay.unit}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 font-sans text-xs text-kpugi-slate dark:text-slate-400 text-center leading-snug">
              <RewardIcon className="w-4 h-4 text-kpugi-blue dark:text-blue-400 shrink-0" />
              <span>{rewardDisplay.subtext}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN BENTO GRID (8 COLS LEFT, 4 COLS RIGHT) ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-start">

        {/* ── LEFT COLUMN (8 cols): Tracker & Submissions ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* ── CARD 1: STEPS FLOW & PROGRESS TRACKER ── */}
          <div className="rounded-2xl bg-white dark:bg-[#121827] p-6 lg:p-7 shadow-sm border border-kpugi-border dark:border-white/10 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-kpugi-ink dark:text-white">
                  {perk.perk_type === 'coupon'
                    ? '2-Step Instant Voucher Flow'
                    : perk.perk_type === 'challenge'
                    ? '3-Stage Cash Bounty Verification'
                    : '3-Stage Hardware Delivery Workflow'}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-kpugi-blue dark:text-blue-400">
                  {isLocked
                    ? '0% Completed'
                    : perk.perk_type === 'coupon'
                    ? '100% Unlocked'
                    : `${progressPercent}% Completed`}
                </span>
                <div className="w-32 h-2.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-kpugi-blue rounded-full transition-all duration-700"
                    style={{ width: `${isLocked ? 0 : perk.perk_type === 'coupon' ? 100 : progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ── DYNAMIC STEPS FLOW BY PERK TYPE ── */}
            {perk.perk_type === 'coupon' ? (
              /* ── COUPON STEPS FLOW (2 STEPS) ── */
              <div className="flex flex-col gap-4">
                {/* Step 1: Creator Rank Check (Auto-Tracked) */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-kpugi-paper/70 dark:bg-white/5 transition-colors border border-kpugi-border/60 dark:border-white/5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isLocked
                      ? 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {isLocked ? <Lock className="w-4 h-4" /> : <Check className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-display text-sm sm:text-base font-bold text-kpugi-ink dark:text-white">
                        Step 1: Rank Eligibility Check
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full font-sans text-xs font-semibold shadow-xs ${
                        isLocked
                          ? 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {isLocked ? `Requires Level ${perk.min_creator_level}` : `Level ${creatorLevel} Verified ✓`}
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 mt-1">
                      {isLocked
                        ? `This coupon requires Level ${perk.min_creator_level}. Reach Level ${perk.min_creator_level} to unlock exclusive voucher codes.`
                        : `Your creator rank qualifies for this exclusive partner perk. No manual application or review needed.`}
                    </p>
                  </div>
                </div>

                {/* Step 2: Instant Code Activation (Pure Steps Tracker - Actions in Card 2 below) */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-kpugi-paper/70 dark:bg-white/5 transition-colors border border-kpugi-border/60 dark:border-white/5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isLocked
                      ? 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {isLocked ? <Lock className="w-4 h-4" /> : <Check className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-display text-sm sm:text-base font-bold text-kpugi-ink dark:text-white">
                        Step 2: Copy Voucher &amp; Redeem at Checkout
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full font-sans text-xs font-semibold shadow-xs ${
                        isLocked
                          ? 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {isLocked ? 'Locked' : 'Unlocked & Ready ✓'}
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 mt-1">
                      {isLocked
                        ? 'Voucher codes unlock automatically once your creator rank eligibility is verified.'
                        : 'Zero proof submissions or administrative delays. Your exclusive promo code is unlocked in the action card below.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : perk.perk_type === 'challenge' ? (
              /* ── CHALLENGE STEPS FLOW (3 STEPS) ── */
              <div className="flex flex-col gap-4">
                {/* Step 1: Rank & Escrow Slot (Auto-Tracked) */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-kpugi-paper/70 dark:bg-white/5 transition-colors border border-kpugi-border/60 dark:border-white/5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isLocked
                      ? 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {isLocked ? <Lock className="w-4 h-4" /> : <Check className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-display text-sm sm:text-base font-bold text-kpugi-ink dark:text-white">
                        Step 1: Creator Rank &amp; Escrow Slot Reservation
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full font-sans text-xs font-semibold shadow-xs ${
                        isLocked
                          ? 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {isLocked ? `Requires Level ${perk.min_creator_level}` : `Level ${creatorLevel} Verified ✓`}
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 mt-1">
                      {isLocked
                        ? `Your current rank is Level ${creatorLevel} (${rankData.levelInfo.title}). Reach Level ${perk.min_creator_level} to participate in this challenge.`
                        : `Reserved 1 of ${perk.total_quota || 100} escrow spots. Bounty funds are locked in platform custody.`}
                    </p>
                  </div>
                </div>

                {/* Step 2: Content Creation & Proof Submission */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-kpugi-paper/70 dark:bg-white/5 transition-colors border border-kpugi-border/60 dark:border-white/5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm font-mono text-sm font-bold ${
                    isApproved
                      ? 'bg-kpugi-naira text-white'
                      : isSubmitted
                      ? 'bg-kpugi-blue text-white'
                      : isLocked
                      ? 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                      : 'bg-amber-600 text-white'
                  }`}>
                    {isApproved || isSubmitted ? <Check className="w-5 h-5" /> : isLocked ? <Lock className="w-4 h-4" /> : '2'}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-display text-sm sm:text-base font-bold text-kpugi-ink dark:text-white">
                        Step 2: Create Content &amp; Submit Video Proof Link
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full font-sans text-xs font-bold ${
                        isApproved
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : isSubmitted
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-kpugi-blue dark:text-blue-300'
                          : isLocked
                          ? 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                      }`}>
                        {isApproved ? 'Approved & Verified ✓' : isSubmitted ? 'Proof Submitted ✓' : isLocked ? 'Locked' : 'Action Required'}
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 mt-1">
                      {isApproved
                        ? 'Your video submission has been verified and confirmed by platform administrators.'
                        : isSubmitted
                        ? 'Your video proof link has been received and queued for milestone view audit.'
                        : 'Create and publish your content meeting the criteria, then submit the public link in the action card below.'}
                    </p>
                  </div>
                </div>

                {/* Step 3: Escrow Wallet Disbursement */}
                <div className={`flex items-start gap-4 p-4 rounded-xl transition-all border ${
                  isApproved
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                    : isSubmitted
                    ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/30'
                    : 'bg-kpugi-paper/50 dark:bg-white/5 opacity-80 border-kpugi-border/60 dark:border-white/5'
                }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isApproved
                      ? 'bg-kpugi-naira text-white'
                      : isSubmitted
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                  }`}>
                    {isApproved ? <Check className="w-5 h-5" /> : isSubmitted ? <Clock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-display text-sm sm:text-base font-bold text-kpugi-ink dark:text-white">
                        Step 3: Automated View Audit &amp; Escrow Release
                      </h3>
                      <span className="font-sans text-xs font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">
                        {isApproved ? 'Disbursed to Wallet ✓' : isSubmitted ? 'Auditing Views' : 'Direct Wallet Credit'}
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 mt-1">
                      {isApproved
                        ? `Your cash bounty of ₦${Number(perk.reward_amount || 0).toLocaleString()} has been credited into your Creator Wallet.`
                        : isSubmitted
                        ? 'Automated crawlers are auditing impression milestones. Escrow releases immediately upon validation.'
                        : `Upon automated verification of view milestones, ₦${Number(perk.reward_amount || 0).toLocaleString()} is credited directly into your wallet with 0% fees.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* ── FREEBIE STEPS FLOW (3 STEPS) ── */
              <div className="flex flex-col gap-4">
                {/* Step 1: Rank & Hardware Kit Allocation (Auto-Tracked) */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-kpugi-paper/70 dark:bg-white/5 transition-colors border border-kpugi-border/60 dark:border-white/5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isLocked
                      ? 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {isLocked ? <Lock className="w-4 h-4" /> : <Check className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-display text-sm sm:text-base font-bold text-kpugi-ink dark:text-white">
                        Step 1: Creator Rank &amp; Hardware Allocation
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full font-sans text-xs font-semibold shadow-xs ${
                        isLocked
                          ? 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {isLocked ? `Requires Level ${perk.min_creator_level}` : `Level ${creatorLevel} Verified ✓`}
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 mt-1">
                      {isLocked
                        ? `This physical freebie bundle requires Level ${perk.min_creator_level}. Keep creating to qualify.`
                        : `Allocated 1 of ${perk.total_quota || 50} hardware kits for verified creators in this delivery batch.`}
                    </p>
                  </div>
                </div>

                {/* Step 2: Proof & Address Details */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-kpugi-paper/70 dark:bg-white/5 transition-colors border border-kpugi-border/60 dark:border-white/5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm font-mono text-sm font-bold ${
                    isApproved
                      ? 'bg-kpugi-naira text-white'
                      : isSubmitted
                      ? 'bg-kpugi-blue text-white'
                      : isLocked
                      ? 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {isApproved || isSubmitted ? <Check className="w-5 h-5" /> : isLocked ? <Lock className="w-4 h-4" /> : '2'}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-display text-sm sm:text-base font-bold text-kpugi-ink dark:text-white">
                        Step 2: Submit Analytics Proof &amp; Shipping Details
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full font-sans text-xs font-bold ${
                        isApproved
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : isSubmitted
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-kpugi-blue dark:text-blue-300'
                          : isLocked
                          ? 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {isApproved ? 'Address Verified ✓' : isSubmitted ? 'Under Review' : isLocked ? 'Locked' : 'Action Required'}
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 mt-1">
                      {isApproved
                        ? 'Shipping details verified with courier partner.'
                        : isSubmitted
                        ? 'Your shipping details have been received and are undergoing verification.'
                        : 'Submit verification link or shipping details in the action card below.'}
                    </p>
                  </div>
                </div>

                {/* Step 3: Courier Dispatch */}
                <div className={`flex items-start gap-4 p-4 rounded-xl transition-all border ${
                  isApproved
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-kpugi-paper/50 dark:bg-white/5 opacity-80 border-kpugi-border/60 dark:border-white/5'
                }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isApproved ? 'bg-kpugi-naira text-white' : 'bg-slate-200 dark:bg-white/10 text-kpugi-slate'
                  }`}>
                    {isApproved ? <Check className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-display text-sm sm:text-base font-bold text-kpugi-ink dark:text-white">
                        Step 3: Courier Dispatch &amp; Doorstep Delivery
                      </h3>
                      <span className="font-sans text-xs font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">
                        {isApproved ? 'Dispatched ✓' : 'Dispatches Upon Verification'}
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 mt-1">
                      {isApproved
                        ? 'Your production kit has been packaged and handed over to DHL Express. Waybill tracking is available in your profile.'
                        : 'Once your submission is verified, your hardware bundle is dispatched to your doorstep at zero cost.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── CARD 2: CREATOR ACTION CARD (COPYING CODES, PASTING LINKS, SUBMITTING PROOF) ── */}
          <div
            id="submission-card"
            className="rounded-2xl bg-white dark:bg-[#121827] p-6 lg:p-7 shadow-sm border border-kpugi-border dark:border-white/10 flex flex-col gap-5"
          >
            {isLocked ? (
              /* Locked Action State */
              <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-kpugi-paper/60 dark:bg-white/5 border border-kpugi-border/60 dark:border-white/5 text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                  <h4 className="font-display text-base font-bold text-kpugi-ink dark:text-white">
                    Action Locked: Level {perk.min_creator_level} Required
                  </h4>
                  <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400">
                    Your current rank is Level {creatorLevel} ({rankData.levelInfo.title}). Complete creator campaigns and earn platform XP to level up and unlock this perk action.
                  </p>
                </div>
                <Link
                  href="/c/campaigns"
                  className="mt-2 px-5 py-2 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Explore Campaigns to Level Up</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : perk.perk_type === 'coupon' ? (
              /* Coupon Action: Copy Promo Code & Redeem on Partner Portal */
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <BadgePercent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-kpugi-ink dark:text-white">
                        Redeem Discount Voucher
                      </h3>
                      <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400">
                        Copy your exclusive partner voucher code and apply directly at checkout
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-sans text-xs font-bold">
                    Instant Zero-Wait
                  </span>
                </div>

                <div className="p-5 sm:p-6 rounded-xl bg-kpugi-paper dark:bg-white/5 border border-kpugi-border dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div className="flex flex-col gap-1 text-center sm:text-left">
                    <span className="font-sans text-xs font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">
                      Your Exclusive Promo Code
                    </span>
                    <span className="font-mono text-2xl sm:text-3xl font-extrabold text-kpugi-blue dark:text-blue-400 tracking-widest py-1">
                      {perk.coupon_code || 'KPUGIPARTNER'}
                    </span>
                    <span className="font-sans text-xs text-kpugi-slate dark:text-slate-400">
                      {perk.savings_value ? `${cleanDisplayValue(perk.savings_value)} • ` : ''}Apply directly at partner checkout
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
                    {perk.coupon_code && (
                      <CopyButton value={perk.coupon_code} label="Copy Promo Code" />
                    )}
                    {perk.affiliate_url && (
                      <a
                        href={perk.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-kpugi-blue text-white font-sans text-xs sm:text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shrink-0"
                      >
                        <span>Redeem on Partner Portal</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 font-sans text-xs text-kpugi-slate dark:text-slate-400">
                  <Info className="w-4 h-4 text-kpugi-blue shrink-0" />
                  <span>No verification proof or turnaround wait required for discount coupons. Enjoy your savings immediately!</span>
                </div>
              </div>
            ) : (
              /* Challenge & Freebie Action: Video Proof / Link Submission & Confirmation */
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-kpugi-blue/10 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 flex items-center justify-center">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-kpugi-ink dark:text-white">
                        {perk.requires_proof ? 'Submit Verification Link' : 'Redeem Perk Benefit'}
                      </h3>
                      <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400">
                        {perk.requires_proof
                          ? 'Paste your published live content link for automated metric audit'
                          : 'Claim your allocated platform perk'}
                      </p>
                    </div>
                  </div>
                  <span className="font-sans text-xs text-kpugi-slate dark:text-slate-400 font-semibold">
                    Instant Link Validation
                  </span>
                </div>

                {/* Submitted Proof Card (if already submitted) */}
                {claim?.proof_url && (
                  <div className="flex flex-col p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/30 gap-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-display text-xs sm:text-sm font-bold text-kpugi-ink dark:text-white">
                        Your Submitted Verification Link
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold uppercase ${
                        isApproved
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : isRejected
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                      }`}>
                        {isApproved ? 'Approved & Verified ✓' : isRejected ? 'Revision Requested' : 'Under Review & Audit'}
                      </span>
                    </div>
                    <a
                      href={claim.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs sm:text-sm text-kpugi-blue dark:text-blue-400 hover:underline flex items-center gap-1.5 truncate"
                    >
                      <span className="truncate">{claim.proof_url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                    {isRejected && claim.admin_notes && (
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 mt-1">
                        <strong>Admin Feedback:</strong> {claim.admin_notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Proof Requirements Callout */}
                {perk.proof_instructions && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-kpugi-paper/80 dark:bg-white/5 border border-kpugi-border/60 dark:border-white/5">
                    <Eye className="w-4 h-4 text-kpugi-blue shrink-0 mt-0.5" />
                    <div className="text-xs text-kpugi-slate dark:text-slate-300 leading-relaxed">
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Requirements:</strong>{' '}
                      {perk.proof_instructions}
                    </div>
                  </div>
                )}

                {perk.requires_proof ? (
                  <form id="clip-form" onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-xs font-bold text-kpugi-ink dark:text-slate-300 uppercase tracking-wider">
                          Platform
                        </label>
                        <select
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-kpugi-paper dark:bg-white/5 text-kpugi-ink dark:text-white border border-kpugi-border dark:border-white/10 font-sans text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kpugi-blue/30 cursor-pointer"
                        >
                          <option value="TikTok Video">TikTok Video</option>
                          <option value="Instagram Reel">Instagram Reel</option>
                          <option value="YouTube Shorts">YouTube Shorts / Video</option>
                          <option value="X (Twitter)">X / Twitter Post</option>
                          <option value="Other Verified Channel">Other Verified Channel</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-xs font-bold text-kpugi-ink dark:text-slate-300 uppercase tracking-wider">
                          Live Content URL *
                        </label>
                        <input
                          ref={urlInputRef}
                          type="url"
                          value={proofUrl}
                          onChange={(e) => setProofUrl(e.target.value)}
                          placeholder="https://www.tiktok.com/@yourhandle/video/..."
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-kpugi-paper dark:bg-white/5 text-kpugi-ink dark:text-white border border-kpugi-border dark:border-white/10 font-sans text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-kpugi-blue/30 placeholder:text-kpugi-slate/60"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-xs font-bold text-kpugi-ink dark:text-slate-300 uppercase tracking-wider">
                        Creator Notes / Context (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={proofNotes}
                        onChange={(e) => setProofNotes(e.target.value)}
                        placeholder="Provide any additional views, shipping address or context details..."
                        className="w-full px-4 py-2.5 rounded-xl bg-kpugi-paper dark:bg-white/5 text-kpugi-ink dark:text-white border border-kpugi-border dark:border-white/10 font-sans text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-kpugi-blue/30 placeholder:text-kpugi-slate/60 resize-none"
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-sans text-xs font-semibold border border-red-200 dark:border-red-900/50">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-2 font-sans text-xs text-kpugi-slate dark:text-slate-400">
                        <Info className="w-4 h-4 text-kpugi-blue shrink-0" />
                        <span>Our system audits submission metrics and releases escrow directly upon approval.</span>
                      </div>

                      <button
                        id="submit-btn"
                        type="submit"
                        disabled={isPending || isLocked}
                        className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-kpugi-blue text-white font-sans text-xs sm:text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        {isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifying Link...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>{isSubmitted ? 'Update & Re-Submit' : 'Verify & Submit Post'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Submit Toast */}
                    {toastMessage && (
                      <div
                        id="submit-toast"
                        className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-sans text-xs sm:text-sm font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/40"
                      >
                        <CheckCircle className="w-5 h-5 text-kpugi-naira shrink-0" />
                        <span>{toastMessage}</span>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 leading-relaxed">
                      This perk requires zero proof submissions. You are fully eligible as a verified Kpugi creator.
                    </p>
                    {perk.coupon_code && (
                      <div className="flex items-center gap-3">
                        <CopyButton value={perk.coupon_code} label={`Copy Code: ${perk.coupon_code}`} />
                        {perk.affiliate_url && (
                          <a
                            href={perk.affiliate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <span>Open Partner Portal</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (4 cols): Rules, Custody & Support ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Rules & Conditions Card (Matched to Perk Type, Zero PDF Button) */}
          <div className="rounded-2xl bg-white dark:bg-[#121827] p-6 shadow-sm border border-kpugi-border dark:border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-kpugi-ink dark:text-white">
                Rules &amp; Conditions
              </h3>
              <FileText className="w-4 h-4 text-kpugi-slate/60" />
            </div>

            <ul className="flex flex-col gap-3.5 font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400">
              {perk.perk_type === 'challenge' ? (
                <>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Creator Rank:</strong>{' '}
                      Requires Level {perk.min_creator_level}+ active verified creator status.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Content Criteria:</strong>{' '}
                      {perk.proof_instructions || 'Live post must remain public on your active creator feed for a minimum of 30 days.'}
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Zero Fee Payout:</strong>{' '}
                      ₦{Number(perk.reward_amount || 0).toLocaleString()} gross is credited 100% net into your Creator Wallet upon verification.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Anti-Fraud Audit:</strong>{' '}
                      Automated crawlers verify legitimate views, retention metrics, and creator account ownership.
                    </div>
                  </li>
                </>
              ) : perk.perk_type === 'coupon' ? (
                <>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Rank Eligibility:</strong>{' '}
                      Available immediately to Level {perk.min_creator_level}+ creators with zero waiting period or manual application.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <BadgePercent className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Voucher Redemption:</strong>{' '}
                      Apply promo code <span className="font-mono font-bold text-kpugi-blue dark:text-blue-400">{perk.coupon_code || 'KPUGIPARTNER'}</span> directly at checkout for {cleanDisplayValue(perk.savings_value) || 'instant savings'}.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Usage Policy:</strong>{' '}
                      Valid for single redemption per verified creator profile or registered creator team.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Direct Platform Rate:</strong>{' '}
                      Guaranteed institutional discount rate negotiated exclusively for the Kpugi creator network.
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Rank &amp; Allocation:</strong>{' '}
                      Requires Level {perk.min_creator_level}+ active status. Allocated to first {perk.total_quota || 50} verified creators.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Verification Criteria:</strong>{' '}
                      {perk.proof_instructions || 'Submit verification link or analytics screenshot confirming your monthly impression threshold.'}
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Free Doorstep Delivery:</strong>{' '}
                      Shipped via DHL Express nationwide across Nigeria with zero delivery or packaging charges.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-kpugi-ink dark:text-white font-semibold">Official Warranty:</strong>{' '}
                      100% brand-new genuine gear in retail packaging with official manufacturer warranty through {perk.partner_name || 'authorized partner'}.
                    </div>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Perk Metrics & Availability Card (Joined creators, slots left, live stats) */}
          <div className="rounded-2xl bg-white dark:bg-[#121827] p-6 shadow-sm border border-kpugi-border dark:border-white/10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-kpugi-blue/10 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display text-sm font-bold text-kpugi-ink dark:text-white truncate">
                  {perk.perk_type === 'freebie'
                    ? 'Freebie Metrics & Stock'
                    : perk.perk_type === 'challenge'
                    ? 'Challenge Escrow & Metrics'
                    : 'Coupon Metrics & Access'}
                </h4>
                <span className="font-sans text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate block">
                  {perk.partner_name ? `${perk.partner_name} • Verified Partner` : 'Kpugi Creator Network'}
                </span>
              </div>
            </div>

            {/* Slots Allocation Progress Box */}
            <div className="p-3.5 rounded-xl bg-kpugi-paper dark:bg-white/5 border border-kpugi-border/70 dark:border-white/5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between font-sans text-xs">
                <span className="font-bold text-kpugi-ink dark:text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-kpugi-blue dark:text-blue-400" />
                  <span>{perk.claimed_count} Creators Joined</span>
                </span>
                <span className="font-mono font-bold text-kpugi-slate dark:text-slate-400">
                  {perk.total_quota
                    ? `${Math.max(0, perk.total_quota - perk.claimed_count)} slots left`
                    : 'Unlimited Slots'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-kpugi-blue rounded-full transition-all duration-700"
                  style={{
                    width: perk.total_quota
                      ? `${quotaPct(perk.claimed_count, perk.total_quota)}%`
                      : '45%',
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-kpugi-slate dark:text-slate-400">
                <span>
                  {perk.total_quota
                    ? `${quotaPct(perk.claimed_count, perk.total_quota)}% Claimed`
                    : 'Open Enrollment'}
                </span>
                <span>Total Pool: {perk.total_quota || '∞'}</span>
              </div>
            </div>

            {/* Key Metric Rows */}
            <div className="flex flex-col gap-2.5 pt-1 text-xs font-sans">
              <div className="flex items-center justify-between py-1.5 border-b border-kpugi-border/50 dark:border-white/5">
                <span className="text-kpugi-slate dark:text-slate-400">Required Rank</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-kpugi-ink dark:text-white">
                    Level {perk.min_creator_level}+
                  </span>
                  {isLocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                      Locked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      Eligible ✓
                    </span>
                  )}
                </div>
              </div>

              {perk.perk_type === 'freebie' ? (
                <>
                  <div className="flex items-center justify-between py-1.5 border-b border-kpugi-border/50 dark:border-white/5">
                    <span className="text-kpugi-slate dark:text-slate-400">Hardware Value</span>
                    <span className="font-mono font-bold text-kpugi-ink dark:text-white">
                      {cleanDisplayValue(perk.savings_value) || (perk.reward_amount ? `₦${Number(perk.reward_amount).toLocaleString()}` : 'Production Bundle')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-kpugi-border/50 dark:border-white/5">
                    <span className="text-kpugi-slate dark:text-slate-400">Courier Shipping</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>DHL Express (Free)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-kpugi-border/50 dark:border-white/5">
                    <span className="text-kpugi-slate dark:text-slate-400">Fulfillment SLA</span>
                    <span className="font-semibold text-kpugi-ink dark:text-white">
                      3-5 Business Days
                    </span>
                  </div>
                </>
              ) : perk.perk_type === 'challenge' ? (
                <>
                  <div className="flex items-center justify-between py-1.5 border-b border-kpugi-border/50 dark:border-white/5">
                    <span className="text-kpugi-slate dark:text-slate-400">Total Escrow Vault</span>
                    <span className="font-mono font-bold text-kpugi-blue dark:text-blue-400">
                      ₦{Number((perk.reward_amount || 0) * (perk.total_quota || 50)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-kpugi-border/50 dark:border-white/5">
                    <span className="text-kpugi-slate dark:text-slate-400">Payout per Creator</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₦{Number(perk.reward_amount || 0).toLocaleString()} (Net)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-kpugi-border/50 dark:border-white/5">
                    <span className="text-kpugi-slate dark:text-slate-400">Audit System</span>
                    <span className="font-semibold text-kpugi-ink dark:text-white">
                      Automated Hourly Crawler
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between py-1.5 border-b border-kpugi-border/50 dark:border-white/5">
                    <span className="text-kpugi-slate dark:text-slate-400">Voucher Discount</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {cleanDisplayValue(perk.savings_value) || 'Exclusive Promo'}
                    </span>
                  </div>
                 
                  <div className="flex items-center justify-between py-1.5 border-b border-kpugi-border/50 dark:border-white/5">
                    <span className="text-kpugi-slate dark:text-slate-400">Code Access</span>
                    <span className="font-semibold text-kpugi-ink dark:text-white">
                      Online Partner Checkout
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Official Tracking Hash */}
           
          </div>

         
        </div>
      </div>

      {/* ── PERSISTENT STICKY BOTTOM ACTION DOCK ────────────────────────────── */}
      <div className="w-full rounded-2xl bg-white dark:bg-[#121827] p-4 sm:p-5 shadow-md border border-kpugi-border dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-bold text-kpugi-ink dark:text-white">
              {isApproved
                ? 'Perk Successfully Claimed'
                : isSubmitted
                ? 'Proof Under Verification'
                : isLocked
                ? `Rank Threshold: Level ${perk.min_creator_level} Required`
                : perk.requires_proof
                ? 'Final Step: Submit Live Verification Link'
                : 'Instant Access Ready to Redeem'}
            </span>
            <span className="font-sans text-xs text-kpugi-slate dark:text-slate-400">
              {isApproved
                ? 'Your benefit has been verified. Check your Creator Wallet or partner account.'
                : isSubmitted
                ? 'Submissions are reviewed within 48 hours with automated milestone updates.'
                : isLocked
                ? `Reach Level ${perk.min_creator_level} to participate in this perk.`
                : perk.requires_proof
                ? 'Submit your post URL before the turnaround window expires.'
                : 'Click below to copy your promo voucher code or activate access.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {isApproved ? (
            <Link
              href="/c/wallet"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-kpugi-naira text-white font-sans text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>View in Earnings Wallet</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : isLocked ? (
            <Link
              href="/c/campaigns"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Explore Campaigns to Level Up</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : perk.requires_proof ? (
            <button
              type="button"
              onClick={scrollToSubmission}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>{isSubmitted ? 'View Submission Form' : 'Submit Remaining Clip Link Now'}</span>
            </button>
          ) : perk.coupon_code ? (
            <CopyButton value={perk.coupon_code} label={`Copy Code: ${perk.coupon_code}`} />
          ) : perk.affiliate_url ? (
            <a
              href={perk.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Activate Partner Deal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              type="button"
              onClick={scrollToSubmission}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Claim Perk</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
