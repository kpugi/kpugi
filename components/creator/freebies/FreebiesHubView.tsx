'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Gift,
  Sparkles,
  Copy,
  Check,
  Timer,
  Trophy,
  Zap,
  ShieldCheck,
  ExternalLink,
  Lock,
  CheckCircle2,
  Clock,
  ChevronRight,
  Star,
  Search,
  SortAsc,
  LayoutGrid,
  LayoutList,
  History,
  Package,
  BadgePercent,
  Flame,
  Wrench,
  ArrowUpRight,
  Info,
  X,
} from 'lucide-react';
import { getCreatorLevel } from '@/lib/utils/levels';
import type { PerkWithClaim } from '@/lib/supabase/perks';
import TrustpilotCollectorCard from '@/components/trustpilot/TrustpilotCollectorCard';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type PerkType = 'challenge' | 'coupon' | 'freebie';
export type RewardType = 'cash_wallet' | 'coupon_discount' | 'free_license' | 'merch_gift' | 'custom';
export type ClaimStatus = 'unlocked' | 'submitted' | 'approved' | 'rejected' | 'locked';

export interface SeedPerk {
  id: string;
  slug?: string;
  title: string;
  description: string;
  perk_type: PerkType;
  category: string;
  cover_image_url: string;
  reward_type: RewardType;
  reward_amount?: number;
  coupon_code?: string;
  affiliate_url?: string;
  has_affiliate_disclaimer?: boolean;
  min_creator_level: number;
  requires_proof: boolean;
  proof_instructions?: string;
  total_quota?: number;
  claimed_count: number;
  status: 'active' | 'draft' | 'paused' | 'expired';
  end_at?: string;
  partner_name?: string;
  claim_status?: ClaimStatus;
  progress_current?: number;
  progress_target?: number;
  savings_value?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA — 10 perks covering all types
// ─────────────────────────────────────────────────────────────────────────────

const SEED_PERKS: SeedPerk[] = [
  // CHALLENGES
  {
    id: 'ch-001',
    title: 'Post 3 Viral Reels with Sound X',
    description: 'Create 3 original short-form videos using the Kpugi campaign audio. Reach a combined 15,000 views across all posts to unlock direct wallet credit.',
    perk_type: 'challenge',
    category: 'cash_bounty',
    cover_image_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=900&auto=format&fit=crop&q=80',
    reward_type: 'cash_wallet',
    reward_amount: 20000,
    min_creator_level: 2,
    requires_proof: true,
    proof_instructions: 'Submit the live TikTok or Instagram Reel URL(s). Make sure your profile is public and the post is not archived.',
    total_quota: 100,
    claimed_count: 38,
    status: 'active',
    end_at: '2026-10-15',
    claim_status: 'unlocked',
  },
  {
    id: 'ch-002',
    title: 'First 3 Brand Campaign Submissions',
    description: 'Complete 3 verified brand video submissions with at least 5,000 views each. Payout is automatically added to your next escrow release cycle.',
    perk_type: 'challenge',
    category: 'cash_bounty',
    cover_image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&auto=format&fit=crop&q=80',
    reward_type: 'cash_wallet',
    reward_amount: 15000,
    min_creator_level: 1,
    requires_proof: false,
    total_quota: 500,
    claimed_count: 214,
    status: 'active',
    end_at: '2026-12-31',
    claim_status: 'submitted',
    progress_current: 2,
    progress_target: 3,
  },
  {
    id: 'ch-003',
    title: 'Galaxy Creator Boost — ₦50k Extra CPM',
    description: 'Hit the top 5 leaderboard in Nigeria covering Samsung Galaxy Z series. Earn an extra ₦50,000 per 100k verified views on top of standard CPM rates.',
    perk_type: 'challenge',
    category: 'cash_bounty',
    cover_image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&auto=format&fit=crop&q=80',
    reward_type: 'cash_wallet',
    reward_amount: 50000,
    min_creator_level: 5,
    requires_proof: false,
    total_quota: 10,
    claimed_count: 6,
    status: 'active',
    end_at: '2026-10-05',
    partner_name: 'Samsung West Africa',
    claim_status: 'locked',
  },
  // COUPONS
  {
    id: 'cp-001',
    title: '50% OFF CapCut Pro Annual Plan',
    description: 'Unlock unlimited cloud storage, 4K exports, desktop multi-track timeline, and AI auto-caption for high-velocity reels. Negotiated exclusively for Kpugi creators.',
    perk_type: 'coupon',
    category: 'editing_tools',
    cover_image_url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=900&auto=format&fit=crop&q=80',
    reward_type: 'coupon_discount',
    coupon_code: 'KPUGI50',
    affiliate_url: 'https://capcut.com',
    has_affiliate_disclaimer: true,
    min_creator_level: 1,
    requires_proof: false,
    claimed_count: 892,
    status: 'active',
    end_at: '2026-10-08',
    partner_name: 'ByteDance / CapCut',
    claim_status: 'unlocked',
    savings_value: '₦36,000/yr',
  },
  {
    id: 'cp-002',
    title: '0% Storefront Transaction Fee (6 Months)',
    description: 'Monetize your creator merchandise or digital products. Complete exemption from gateway checkout processing fees for your first 6 months of Paystack store operation.',
    perk_type: 'coupon',
    category: 'fintech',
    cover_image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&auto=format&fit=crop&q=80',
    reward_type: 'coupon_discount',
    coupon_code: 'KPUGIZERO',
    affiliate_url: 'https://paystack.com',
    has_affiliate_disclaimer: true,
    min_creator_level: 3,
    requires_proof: false,
    claimed_count: 134,
    status: 'active',
    partner_name: 'Paystack & Shopify Africa',
    claim_status: 'unlocked',
    savings_value: '₦250,000 volume',
  },
  // SOFTWARE DEALS
  {
    id: 'sw-001',
    title: 'Epidemic Sound — 60 Days Free Access',
    description: 'Royalty-free music library with 40,000+ tracks. No Content ID strikes. Monetize every post without fear. Direct institutional license, no credit card required.',
    perk_type: 'coupon',
    category: 'music',
    cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&auto=format&fit=crop&q=80',
    reward_type: 'free_license',
    affiliate_url: 'https://epidemicsound.com',
    has_affiliate_disclaimer: true,
    min_creator_level: 2,
    requires_proof: false,
    claimed_count: 412,
    status: 'active',
    partner_name: 'Epidemic Sound',
    claim_status: 'approved',
    savings_value: '₦29,000',
  },
  {
    id: 'sw-002',
    title: 'Adobe Premiere Pro — 3 Month VIP Access',
    description: 'Full Creative Cloud suite with Adobe Firefly generative AI credits. Zero credit card required; direct institutional redemption via Kpugi partner license.',
    perk_type: 'coupon',
    category: 'editing_tools',
    cover_image_url: 'https://images.unsplash.com/photo-1536240478700-b869ad10e2ab?w=900&auto=format&fit=crop&q=80',
    reward_type: 'free_license',
    affiliate_url: 'https://adobe.com',
    has_affiliate_disclaimer: true,
    min_creator_level: 4,
    requires_proof: false,
    claimed_count: 67,
    status: 'active',
    partner_name: 'Adobe Creative Cloud',
    claim_status: 'locked',
    savings_value: '₦65,000',
  },
  // FREEBIES
  {
    id: 'fb-001',
    title: 'Rode VideoMic Pro + Ring Light Production Kit',
    description: 'Premium physical hardware bundle shipped to your doorstep via DHL Express at zero cost. For verified creators who hit 10,000+ monthly view impressions.',
    perk_type: 'freebie',
    category: 'gear',
    cover_image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=900&auto=format&fit=crop&q=80',
    reward_type: 'merch_gift',
    min_creator_level: 5,
    requires_proof: true,
    proof_instructions: 'Share your Kpugi analytics screenshot showing 10,000+ monthly views. Shipping address collected upon approval.',
    total_quota: 50,
    claimed_count: 32,
    status: 'active',
    end_at: '2026-10-02',
    partner_name: 'Audio Tech Africa',
    claim_status: 'locked',
    savings_value: '₦240,000',
  },
  {
    id: 'fb-002',
    title: 'Kpugi Creator Starter Pack (Digital)',
    description: 'Exclusive digital bundle: 200 video transitions, 50 LUT color grades, 30 logo stings, and a Kpugi Verified Creator certificate. Instant download after claim.',
    perk_type: 'freebie',
    category: 'digital_assets',
    cover_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80',
    reward_type: 'free_license',
    min_creator_level: 1,
    requires_proof: false,
    claimed_count: 1840,
    status: 'active',
    claim_status: 'approved',
    savings_value: '₦18,000',
  },
  // CHALLENGES (MILESTONE CASH BONUSES)
  {
    id: 'bn-001',
    title: '₦10,000 Instant Escrow Payout Accelerator',
    description: 'Skip standard 48-hour escrow review cycles. Instantly liquidate milestone payments up to ₦500,000 directly to your bank with zero transfer fees. Single-use voucher.',
    perk_type: 'challenge',
    category: 'fintech',
    cover_image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=900&auto=format&fit=crop&q=80',
    reward_type: 'cash_wallet',
    reward_amount: 10000,
    min_creator_level: 3,
    requires_proof: false,
    total_quota: 200,
    claimed_count: 199,
    status: 'active',
    claim_status: 'unlocked',
  },
  {
    id: 'bn-002',
    title: 'Referral Bonus — ₦5,000 per Creator Invite',
    description: 'Earn ₦5,000 wallet credit for every new creator you refer who completes their first approved campaign submission. No cap — unlimited referrals.',
    perk_type: 'challenge',
    category: 'referral',
    cover_image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&auto=format&fit=crop&q=80',
    reward_type: 'cash_wallet',
    reward_amount: 5000,
    min_creator_level: 1,
    requires_proof: false,
    claimed_count: 703,
    status: 'active',
    claim_status: 'unlocked',
    progress_current: 3,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_META: Record<
  PerkType,
  { label: string; color: string; textColor: string; Icon: React.FC<{ className?: string }> }
> = {
  challenge: { label: 'Challenge', color: 'bg-amber-100 dark:bg-amber-900/30',   textColor: 'text-amber-800 dark:text-amber-300',   Icon: Flame       },
  coupon:    { label: 'Coupon',    color: 'bg-blue-100 dark:bg-blue-900/30',     textColor: 'text-blue-800 dark:text-blue-300',     Icon: BadgePercent },
  freebie:   { label: 'Freebie',   color: 'bg-emerald-100 dark:bg-emerald-900/30',textColor:'text-emerald-800 dark:text-emerald-300',Icon: Package     },
};

const CLAIM_META: Record<ClaimStatus, { label: string; color: string }> = {
  unlocked:  { label: 'Available',     color: 'text-emerald-600 dark:text-emerald-400' },
  submitted: { label: 'Under Review',  color: 'text-amber-600 dark:text-amber-400'     },
  approved:  { label: 'Claimed ✓',     color: 'text-blue-600 dark:text-blue-400'       },
  rejected:  { label: 'Rejected',      color: 'text-red-600 dark:text-red-400'         },
  locked:    { label: 'Locked',        color: 'text-slate-400 dark:text-slate-500'     },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function quotaPct(claimed: number, total?: number): number {
  if (!total) return 0;
  return Math.min(100, Math.round((claimed / total) * 100));
}

// ─────────────────────────────────────────────────────────────────────────────
// CopyCodeButton
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// PerkCard (Grid View)
// ─────────────────────────────────────────────────────────────────────────────

function PerkCard({ perk, creatorLevel }: { perk: SeedPerk; creatorLevel: number }) {
  const meta = TYPE_META[perk.perk_type];
  const TypeIcon = meta.Icon;
  const isLocked = creatorLevel < perk.min_creator_level;
  const effectiveStatus: ClaimStatus = isLocked ? 'locked' : (perk.claim_status ?? 'unlocked');
  const pct = quotaPct(perk.claimed_count, perk.total_quota);
  const detailHref = `/c/freebies/${perk.slug || perk.id}`;

  return (
    <div
      className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-white dark:bg-[#121827] ${
        isLocked
          ? 'border-slate-200 dark:border-white/5 opacity-75 grayscale-[15%]'
          : 'border-slate-200 dark:border-white/10 hover:border-kpugi-blue/40'
      }`}
    >
      {/* ── COVER IMAGE (ONLY ONE BADGE: TYPE) ── */}
      <Link href={detailHref} className="block relative h-44 overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0">
        <img
          src={perk.cover_image_url}
          alt={perk.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top-left: ONLY the single type badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.color} ${meta.textColor} shadow-sm backdrop-blur-md`}>
            <TypeIcon className="w-2.5 h-2.5" />
            {meta.label}
          </span>
        </div>
      </Link>

      {/* ── CARD BODY ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {perk.partner_name && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {perk.partner_name}
          </p>
        )}

        <div>
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-snug mb-1 line-clamp-2 group-hover:text-kpugi-blue dark:group-hover:text-blue-400 transition-colors">
            <Link href={detailHref}>
              {perk.title}
            </Link>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 font-sans">
            {perk.description}
          </p>
        </div>

        {/* Milestone progress */}
        {perk.progress_target && !isLocked && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
              <span className="font-mono font-bold text-kpugi-blue dark:text-blue-400">
                {perk.progress_current} / {perk.progress_target}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-kpugi-blue dark:bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${((perk.progress_current ?? 0) / perk.progress_target) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Quota bar */}
        {perk.total_quota && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>Availability</span>
              <span className="font-medium text-slate-600 dark:text-slate-300">
                <span className="font-mono font-semibold">{perk.total_quota - perk.claimed_count}</span> / <span className="font-mono font-semibold">{perk.total_quota}</span> slots left
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1 overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-white/5">
          <span className={`text-[11px] font-semibold flex items-center gap-1 ${CLAIM_META[effectiveStatus].color}`}>
            {effectiveStatus === 'submitted' && <Clock className="w-3 h-3" />}
            {effectiveStatus === 'approved' && <CheckCircle2 className="w-3 h-3" />}
            {effectiveStatus === 'locked' && <Lock className="w-3 h-3" />}
            {CLAIM_META[effectiveStatus].label}
          </span>

          <Link
            href={detailHref}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isLocked
                ? 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
                : 'bg-kpugi-blue text-white hover:bg-blue-700'
            }`}
          >
            <span>View</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PerkListItem (Polished Horizontal Row for List View)
// ─────────────────────────────────────────────────────────────────────────────

function PerkListItem({ perk, creatorLevel }: { perk: SeedPerk; creatorLevel: number }) {
  const meta = TYPE_META[perk.perk_type];
  const TypeIcon = meta.Icon;
  const isLocked = creatorLevel < perk.min_creator_level;
  const effectiveStatus: ClaimStatus = isLocked ? 'locked' : (perk.claim_status ?? 'unlocked');
  const pct = quotaPct(perk.claimed_count, perk.total_quota);
  const detailHref = `/c/freebies/${perk.slug || perk.id}`;

  return (
    <div
      className={`group flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all duration-200 hover:shadow-md bg-white dark:bg-[#121827] gap-4 ${
        isLocked
          ? 'border-slate-200 dark:border-white/5 opacity-75 grayscale-[15%]'
          : 'border-slate-200 dark:border-white/10 hover:border-kpugi-blue/40'
      }`}
    >
      {/* ── LEFT: THUMBNAIL (ONLY ONE BADGE: TYPE) ── */}
      <Link
        href={detailHref}
        className="relative w-full sm:w-44 md:w-52 h-40 sm:h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0"
      >
        <img
          src={perk.cover_image_url}
          alt={perk.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top-left: ONLY the single type badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.color} ${meta.textColor} shadow-sm backdrop-blur-md`}>
            <TypeIcon className="w-2.5 h-2.5" />
            {meta.label}
          </span>
        </div>
      </Link>

      {/* ── MIDDLE: DETAILS & METRICS ── */}
      <div className="flex flex-col flex-1 min-w-0 gap-1 sm:gap-1.5 justify-center">
        {perk.partner_name && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {perk.partner_name}
          </span>
        )}

        <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-kpugi-blue dark:group-hover:text-blue-400 transition-colors">
          <Link href={detailHref}>{perk.title}</Link>
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 font-sans">
          {perk.description}
        </p>

        {/* Quota / availability indicator if present */}
        {perk.total_quota && (
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{perk.total_quota - perk.claimed_count}</span> of <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{perk.total_quota}</span> slots left
            </span>
            <div className="w-24 bg-slate-100 dark:bg-white/10 rounded-full h-1 overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: STATUS & UNIFIED CTA ── */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-3 shrink-0 sm:pl-4 sm:border-l sm:border-slate-100 sm:dark:border-white/5 sm:min-w-[130px] pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
        <span className={`text-xs font-semibold flex items-center gap-1 ${CLAIM_META[effectiveStatus].color}`}>
          {effectiveStatus === 'submitted' && <Clock className="w-3.5 h-3.5" />}
          {effectiveStatus === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {effectiveStatus === 'locked' && <Lock className="w-3.5 h-3.5" />}
          {CLAIM_META[effectiveStatus].label}
        </span>

        <Link
          href={detailHref}
          className={`flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isLocked
              ? 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
              : 'bg-kpugi-blue text-white hover:bg-blue-700'
          }`}
        >
          <span>View</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER TABS CONFIG
// ─────────────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | PerkType;
type SortOption = 'value' | 'ending' | 'newest' | 'unlocked';

const FILTER_TABS: { key: FilterTab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: 'all',       label: 'All Perks',  Icon: Gift         },
  { key: 'challenge', label: 'Challenges', Icon: Flame        },
  { key: 'coupon',    label: 'Coupons',    Icon: BadgePercent },
  { key: 'freebie',   label: 'Freebies',   Icon: Package      },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface FreebiesHubViewProps {
  displayName: string;
  totalEarned: number;
  totalBonusClaimed?: number;
  initialPerks?: PerkWithClaim[];
}

export default function FreebiesHubView({
  displayName,
  totalEarned,
  totalBonusClaimed = 145000,
  initialPerks,
}: FreebiesHubViewProps) {
  const [activeTab, setActiveTab]               = useState<FilterTab>('all');
  const [sortBy, setSortBy]                     = useState<SortOption>('value');
  const [search, setSearch]                     = useState('');
  const [gridView, setGridView]                 = useState(true);
  const [showOnlyMyClaims, setShowOnlyMyClaims] = useState(false);

  const rankData     = getCreatorLevel(totalEarned);
  const creatorLevel = rankData.currentLevelNumber;

  // Normalize initial perks or fallback to SEED_PERKS
  const perksList: SeedPerk[] = useMemo(() => {
    if (initialPerks && initialPerks.length > 0) {
      return initialPerks.map((p) => {
        const isLocked = creatorLevel < p.min_creator_level;
        const claimStatus: ClaimStatus = p.claim?.status ?? (isLocked ? 'locked' : 'unlocked');
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          description: p.description,
          perk_type: p.perk_type,
          category: p.category,
          cover_image_url: p.cover_image_url,
          reward_type: p.reward_type,
          reward_amount: p.reward_amount,
          coupon_code: p.coupon_code ?? undefined,
          affiliate_url: p.affiliate_url ?? undefined,
          has_affiliate_disclaimer: p.has_affiliate_disclaimer,
          min_creator_level: p.min_creator_level,
          requires_proof: p.requires_proof,
          proof_instructions: p.proof_instructions ?? undefined,
          total_quota: p.total_quota ?? undefined,
          claimed_count: p.claimed_count,
          savings_value: p.savings_value ?? undefined,
          partner_name: p.partner_name ?? undefined,
          status: p.status,
          end_at: p.end_at ?? undefined,
          claim_status: claimStatus,
        };
      });
    }
    return SEED_PERKS;
  }, [initialPerks, creatorLevel]);

  // Hero spotlight: first freebie creator can't claim due to rank (to show a goal),
  // fallback to highest-value challenge that isn't already approved
  const spotlight =
    perksList.find((p) => p.perk_type === 'freebie' && creatorLevel < p.min_creator_level) ??
    perksList.find((p) => (p.reward_amount ?? 0) >= 15000 && p.claim_status !== 'approved') ??
    perksList[0];

  const unlockedCount     = perksList.filter((p) => creatorLevel >= p.min_creator_level).length;
  const activeClaimsCount = perksList.filter((p) => p.claim_status === 'submitted' || p.claim_status === 'approved').length;

  // Dynamic live cash incentive pool calculated from active challenge bounties
  const totalCashPool = useMemo(() => {
    return perksList.reduce((acc, p) => {
      if (p.perk_type === 'challenge' && p.reward_amount) {
        const poolForPerk = p.total_quota ? p.reward_amount * p.total_quota : p.reward_amount;
        return acc + poolForPerk;
      }
      return acc;
    }, 0);
  }, [perksList]);

  const filtered = useMemo(() => {
    let list = perksList.filter((p) => {
      if (showOnlyMyClaims) {
        if (p.claim_status !== 'submitted' && p.claim_status !== 'approved') return false;
      }
      if (activeTab !== 'all' && p.perk_type !== activeTab) return false;
      if (
        search &&
        !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !(p.partner_name ?? '').toLowerCase().includes(search.toLowerCase()) &&
        !p.description.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });

    if (sortBy === 'value')    list = [...list].sort((a, b) => (b.reward_amount ?? 0) - (a.reward_amount ?? 0));
    if (sortBy === 'ending')   list = [...list].sort((a, b) => (!a.end_at ? 1 : !b.end_at ? -1 : new Date(a.end_at).getTime() - new Date(b.end_at).getTime()));
    if (sortBy === 'unlocked') list = [...list].sort((a) => (creatorLevel >= a.min_creator_level ? -1 : 1));

    return list;
  }, [perksList, activeTab, sortBy, search, creatorLevel, showOnlyMyClaims]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
         
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Creator Perks, Freebies &amp; Rewards
          </h1>
          <p className="font-sans text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Unlock partner coupons, escrow-backed cash incentives, hardware equipment kits, and tier-based performance bonuses — curated by Kpugi exclusively for creators.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-kpugi-blue" />
            <span>Escrow Secured</span>
          </div>
          <button
            onClick={() => setShowOnlyMyClaims((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              showOnlyMyClaims
                ? 'bg-kpugi-blue text-white shadow-blue-500/20'
                : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Claim History</span>
            {activeClaimsCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  showOnlyMyClaims
                    ? 'bg-white/20 text-white'
                    : 'bg-kpugi-blue/10 text-kpugi-blue dark:bg-blue-900/40 dark:text-blue-300'
                }`}
              >
                {activeClaimsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rank */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#121827] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Creator Rank</p>
              <p className="font-display text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                {rankData.levelInfo.icon} Lvl {creatorLevel}: {rankData.levelInfo.title}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-kpugi-blue/10 dark:bg-blue-900/30 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-kpugi-blue dark:text-blue-400" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 dark:text-slate-500">Next: {rankData.nextLevelInfo?.title ?? 'Max'}</span>
              <span className="font-mono font-bold text-kpugi-blue dark:text-blue-400">{rankData.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${rankData.levelInfo.gradient}`}
                style={{ width: `${rankData.progressPercent}%` }}
              />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-kpugi-blue to-transparent opacity-60" />
        </div>

        {/* Bonuses Earned */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#121827] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between gap-3 group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Bonuses Earned</p>
              <p className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white">₦{totalBonusClaimed.toLocaleString()}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">from challenges &amp; platform incentives</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent opacity-60" />
        </div>

        {/* Perks Unlocked */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#121827] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between gap-3 group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Perks Unlocked</p>
              <div className="flex items-baseline gap-2">
                <p className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white">{unlockedCount}</p>
                <p className="text-sm text-kpugi-blue dark:text-blue-400 font-semibold font-sans">Available</p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-kpugi-blue transition-colors">
              <Gift className="w-4 h-4 text-kpugi-blue dark:text-blue-400 group-hover:text-white transition-colors" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">{activeClaimsCount} in progress or claimed</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-transparent opacity-60" />
        </div>

        {/* Cash Pool */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#121827] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between gap-3 group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Cash Incentive Pool</p>
              <p className="font-mono text-2xl font-extrabold text-kpugi-blue dark:text-blue-400">
                ₦{totalCashPool > 0 ? totalCashPool.toLocaleString() : '2,500,000'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-kpugi-blue transition-colors">
              <Star className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-kpugi-blue animate-pulse" />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">
              Escrow across {perksList.filter((p) => p.perk_type === 'challenge').length} active challenges
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-kpugi-blue via-purple-500 to-transparent opacity-60" />
        </div>
      </div>

      {/* ── HERO SPOTLIGHT ───────────────────────────────────────────────────── */}
      {spotlight && (() => {
        const days = daysUntil(spotlight.end_at);
        const isSpotlightLocked = creatorLevel < spotlight.min_creator_level;
        return (
          <div className="relative w-full rounded-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#121827]">
            {/* Image side */}
            <div className="relative lg:w-5/12 min-h-[240px] lg:min-h-full overflow-hidden shrink-0">
              <img src={spotlight.cover_image_url} alt={spotlight.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${TYPE_META[spotlight.perk_type].color} ${TYPE_META[spotlight.perk_type].textColor}`}>
                  <Gift className="w-3 h-3" />
                  {TYPE_META[spotlight.perk_type].label.toUpperCase()}
                </span>
                {spotlight.savings_value && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/15 backdrop-blur-md text-white">{spotlight.savings_value}</span>
                )}
              </div>

              {spotlight.total_quota && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md text-white">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>Claim Slots: <strong>{spotlight.total_quota - spotlight.claimed_count} / {spotlight.total_quota} left</strong></span>
                  </div>
                  <div className="w-20 bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${quotaPct(spotlight.claimed_count, spotlight.total_quota)}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Content side */}
            <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  {spotlight.partner_name && (
                    <span className="text-xs font-bold text-kpugi-blue dark:text-blue-400 uppercase tracking-widest">{spotlight.partner_name}</span>
                  )}
                  {days !== null && days > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[11px] font-bold">
                      <Timer className="w-3 h-3" />
                      Ends in {days} days
                    </span>
                  )}
                </div>

                <h2 className="font-display text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">{spotlight.title}</h2>
                <p className="font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">{spotlight.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Min. Rank</span>
                    <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">Level {spotlight.min_creator_level}+</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Your Status</span>
                    <span className={`text-sm font-bold flex items-center gap-1 ${isSpotlightLocked ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {isSpotlightLocked
                        ? <><Lock className="w-3.5 h-3.5" /> Needs Lvl {spotlight.min_creator_level}</>
                        : <><CheckCircle2 className="w-3.5 h-3.5" /> Eligible</>}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Verification</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{spotlight.requires_proof ? 'Manual Proof' : 'Instant'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 sm:flex-1 font-sans">
                  <ShieldCheck className="w-3.5 h-3.5 text-kpugi-blue shrink-0" />
                  Verified claimable for {displayName}
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/c/freebies/${(spotlight as any).slug || spotlight.id}`}
                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md w-full sm:w-auto ${
                      isSpotlightLocked
                        ? 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/20'
                        : 'bg-kpugi-blue text-white hover:bg-blue-700 shadow-blue-500/20'
                    }`}
                  >
                    {isSpotlightLocked ? <Lock className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                    <span>View Perk</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── FILTER BAR ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTER_TABS.map(({ key, label, Icon }) => {
            const count = key === 'all' ? perksList.length : perksList.filter((p) => p.perk_type === key).length;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === key
                    ? 'bg-kpugi-blue text-white shadow-sm'
                    : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search + Sort + View toggle */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-[#121827] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search perks by brand, keyword, or incentive..."
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/30 transition-all font-sans"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <SortAsc className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold py-1.5 px-2 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="value">Highest Value</option>
              <option value="ending">Ending Soonest</option>
              <option value="newest">Newly Added</option>
              <option value="unlocked">Unlocked First</option>
            </select>
          </div>

          <button
            onClick={() => setGridView(!gridView)}
            title="Toggle layout"
            className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {gridView ? <LayoutList className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
        </div>

        {/* Active Claim History Filter Banner */}
        {showOnlyMyClaims && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-medium font-sans">
              <History className="w-4 h-4 text-kpugi-blue shrink-0" />
              <span>
                Showing <strong>{filtered.length}</strong> perks you’ve submitted or claimed.
              </span>
            </div>
            <button
              onClick={() => setShowOnlyMyClaims(false)}
              className="text-xs font-bold text-kpugi-blue dark:text-blue-400 hover:underline cursor-pointer"
            >
              Show all perks
            </button>
          </div>
        )}
      </div>

      {/* ── PERKS GRID / LIST ────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-white dark:bg-[#121827] border border-slate-200 dark:border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
            {showOnlyMyClaims ? (
              <History className="w-6 h-6 text-kpugi-blue dark:text-blue-400" />
            ) : search ? (
              <Search className="w-6 h-6 text-kpugi-blue dark:text-blue-400" />
            ) : (
              <Gift className="w-6 h-6 text-kpugi-blue dark:text-blue-400" />
            )}
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">
            {showOnlyMyClaims
              ? 'No claim history yet'
              : search
              ? `No results for "${search}"`
              : `No ${FILTER_TABS.find((t) => t.key === activeTab)?.label ?? 'perks'} found`}
          </h3>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
            {showOnlyMyClaims
              ? 'You have not submitted or claimed any perks yet. Explore available challenges and coupons to get started!'
              : search
              ? 'We could not find any perks matching your search term. Try checking for typos or searching by brand name.'
              : 'There are no active perks in this category right now. Check back soon for new additions.'}
          </p>
          <button
            onClick={() => {
              setSearch('');
              setActiveTab('all');
              setShowOnlyMyClaims(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-kpugi-blue text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
          >
            <span>Reset all filters</span>
          </button>
        </div>
      ) : gridView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((perk) => (
            <PerkCard key={perk.id} perk={perk} creatorLevel={creatorLevel} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((perk) => (
            <PerkListItem key={perk.id} perk={perk} creatorLevel={creatorLevel} />
          ))}
        </div>
      )}

      {/* ── TRUSTPILOT IN-APP RATE CARD (VARIANT A) ────────────────────────── */}
      <div className="w-full">
        <TrustpilotCollectorCard />
      </div>

      {/* ── TRUST FOOTER ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-kpugi-blue/10 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-kpugi-blue dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">Institutional Escrow Guarantee</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Every cash perk, hardware voucher, and CPM booster on Kpugi is backed by verified brand funds locked in institutional trust before launch. All payouts are audited and traceable.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/20 transition-all shadow-sm">
            Partner With Kpugi
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-kpugi-blue text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm">
            Audit Terms <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
