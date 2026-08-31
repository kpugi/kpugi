'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ShieldAlert,
  Star,
  Video,
  Zap,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ListTodo,
  ExternalLink,
} from 'lucide-react';

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  badge: {
    text: string;
    variant: 'danger' | 'warning' | 'info' | 'success' | 'purple';
  };
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  actionUrl: string;
  actionLabel: string;
}

interface DashboardActionTodoProps {
  role: 'creator' | 'advertiser';
  kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  unreviewedCampaigns?: {
    campaignId: string;
    title: string;
    companyName?: string;
  }[];
  pendingPostSubmissions?: {
    id: string;
    campaignId: string;
    campaignTitle: string;
  }[];
  draftCampaigns?: {
    id: string;
    title: string;
  }[];
  walletBalance?: number;
  activeCampaignsCount?: number;
  className?: string;
}

export function DashboardActionTodo({
  role,
  kycStatus,
  unreviewedCampaigns = [],
  pendingPostSubmissions = [],
  draftCampaigns = [],
  walletBalance = 0,
  activeCampaignsCount = 0,
  className = '',
}: DashboardActionTodoProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Compile active todo items based on platform state
  const items: ActionItem[] = [];

  if (role === 'creator') {
    // 1. KYC Verification
    if (kycStatus && kycStatus !== 'verified') {
      items.push({
        id: 'creator-kyc',
        title: kycStatus === 'rejected' ? 'KYC Verification Needs Attention' : 'Complete ID Verification (KYC)',
        description: 'Verify your official identity to unlock uncapped Friday direct bank deposits.',
        badge: {
          text: kycStatus === 'pending' ? 'Verification In Review' : 'Required for Payouts',
          variant: kycStatus === 'rejected' ? 'danger' : 'warning',
        },
        icon: ShieldAlert,
        iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        actionUrl: '/c/settings',
        actionLabel: kycStatus === 'pending' ? 'Check Status' : 'Verify ID',
      });
    }

    // 2. Pending Campaign Reviews
    if (unreviewedCampaigns.length > 0) {
      const firstCamp = unreviewedCampaigns[0];
      const campCount = unreviewedCampaigns.length;
      items.push({
        id: 'creator-reviews',
        title: `Leave Campaign ${campCount === 1 ? 'Review' : `Reviews (${campCount})`}`,
        description: `Share quick 20-second feedback on ${campCount === 1 ? `"${firstCamp.title}"` : `${campCount} completed campaigns`} to boost transparency.`,
        badge: {
          text: `${campCount} ${campCount === 1 ? 'Campaign' : 'Campaigns'}`,
          variant: 'success',
        },
        icon: Star,
        iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        actionUrl: `/c/campaigns/${firstCamp.campaignId}?review=true`,
        actionLabel: 'Leave Review',
      });
    }

    // 3. Pending Post Links
    if (pendingPostSubmissions.length > 0) {
      const firstSub = pendingPostSubmissions[0];
      const subCount = pendingPostSubmissions.length;
      items.push({
        id: 'creator-post-link',
        title: `Submit Live Post Link ${subCount > 1 ? `(${subCount})` : ''}`,
        description: `Submit your published post URL for "${firstSub.campaignTitle}" to begin automatic view tracking.`,
        badge: {
          text: 'Post Link Needed',
          variant: 'info',
        },
        icon: Video,
        iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        actionUrl: `/c/campaigns/${firstSub.campaignId}`,
        actionLabel: 'Submit Link',
      });
    }
  } else {
    // ─── BRAND / ADVERTISER ──────────────────────────────────────────────────
    // 1. Pending Campaign Reviews
    if (unreviewedCampaigns.length > 0) {
      const firstCamp = unreviewedCampaigns[0];
      const campCount = unreviewedCampaigns.length;
      items.push({
        id: 'brand-reviews',
        title: `Rate Completed Campaign ${campCount > 1 ? `(${campCount})` : ''}`,
        description: `Rate view velocity and creator delivery for ${campCount === 1 ? `"${firstCamp.title}"` : `${campCount} completed campaigns`}.`,
        badge: {
          text: `${campCount} ${campCount === 1 ? 'Campaign' : 'Campaigns'}`,
          variant: 'success',
        },
        icon: Star,
        iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        actionUrl: `/b/campaigns/${firstCamp.campaignId}?review=true`,
        actionLabel: 'Rate Experience',
      });
    }

    // 2. Draft / Unfunded Campaigns
    if (draftCampaigns.length > 0) {
      const firstDraft = draftCampaigns[0];
      const draftCount = draftCampaigns.length;
      items.push({
        id: 'brand-drafts',
        title: `Fund & Launch Campaign ${draftCount > 1 ? `(${draftCount})` : ''}`,
        description: `Complete budget funding for "${firstDraft.title}" to open creator participation slots.`,
        badge: {
          text: 'Draft Pending',
          variant: 'warning',
        },
        icon: Zap,
        iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        actionUrl: `/b/campaigns/${firstDraft.id}`,
        actionLabel: 'Launch Campaign',
      });
    }

    // 3. Low Wallet Balance
    if (walletBalance < 15000 && activeCampaignsCount > 0) {
      items.push({
        id: 'brand-low-balance',
        title: 'Top Up Brand Balance',
        description: `Your available balance is ₦${walletBalance.toLocaleString()}. Top up to ensure uninterrupted creator performance.`,
        badge: {
          text: 'Low Balance',
          variant: 'warning',
        },
        icon: CreditCard,
        iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        actionUrl: '/b/wallet',
        actionLabel: 'Top Up Wallet',
      });
    }
  }

  // Badge variant style mapper
  const getBadgeClass = (variant: ActionItem['badge']['variant']) => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      case 'info':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
      case 'success':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      case 'purple':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
    }
  };

  // If there are 0 actionable items, show subtle all-clear message
  if (items.length === 0) {
    return (
      <div className={`p-4 rounded-2xl bg-white/60 dark:bg-[#12141A]/60 backdrop-blur-xs border border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-3.5" />
          </div>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            All caught up! No pending actions require your attention right now.
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          All Clear ✨
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl bg-white dark:bg-[#12141A] border border-slate-200/90 dark:border-white/10 shadow-xs overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:px-6 sm:py-4 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-xl bg-[#2F49E8]/10 text-[#2F49E8] dark:text-blue-400 flex items-center justify-center shrink-0">
            <ListTodo className="size-4" />
          </div>
          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Action Center</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2F49E8] text-white">
              {items.length} Pending
            </span>
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
        >
          <span>{isCollapsed ? 'Show' : 'Hide'}</span>
          {isCollapsed ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
        </button>
      </div>

      {/* Action Items List */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="divide-y divide-slate-100 dark:divide-white/5"
          >
            {items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`size-9 rounded-2xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <ItemIcon className="size-4.5" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h3>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getBadgeClass(
                            item.badge.variant
                          )}`}
                        >
                          {item.badge.text}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={item.actionUrl}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-[#2F49E8] hover:text-white dark:hover:bg-[#2F49E8] dark:hover:text-white text-slate-800 dark:text-slate-200 font-display text-xs font-bold transition-all flex items-center gap-1.5 self-end sm:self-center shadow-2xs hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DashboardActionTodo;
