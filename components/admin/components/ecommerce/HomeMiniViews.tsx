"use client";

import React from "react";
import Link from "next/link";
import {
  Megaphone,
  Layers,
  Users,
  ShieldCheck,
  Radio,
  ArrowRight,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle2,
  ExternalLink,
  Bot,
  Sliders,
  DollarSign,
  Share2,
  AlertTriangle,
  Play,
  Activity,
  Zap,
} from "lucide-react";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { BroadcastItem } from "@/lib/admin/platform-broadcasts-types";

// =========================================================================
// 1. EXECUTIVE KPI STRIP (4 Canonical Non-Duplicative Metrics on One Line)
// =========================================================================
interface ExecutiveKpiStripProps {
  totalCampaigns: number;
  liveCampaigns: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  automatedPassRate: number;
  totalSocialAccounts: number;
  totalAudienceReach: number;
  totalLiquidity: number;
  campaignPool: number;
}

export const ExecutiveKpiStrip: React.FC<ExecutiveKpiStripProps> = ({
  totalCampaigns,
  liveCampaigns,
  totalSubmissions,
  pendingSubmissions,
  automatedPassRate,
  totalSocialAccounts,
  totalAudienceReach,
  totalLiquidity,
  campaignPool,
}) => {
  const formatCompact = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  const formatNaira = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 font-sans">
      {/* Metric 1: Live Campaigns */}
      <Link
        href="/admin/campaigns"
        className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-500/30 dark:border-gray-800 dark:bg-gray-900/60"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400">
            <Megaphone className="h-5 w-5" />
          </div>
          <Badge color={liveCampaigns > 0 ? "success" : "light"}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
            {liveCampaigns} Live
          </Badge>
        </div>
        <div className="mt-4">
          <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Active Campaigns
          </span>
          <h3 className="mt-1 text-2xl font-bold font-display text-gray-900 dark:text-white">
            {liveCampaigns}{" "}
            <span className="text-sm font-sans font-normal text-gray-400">
              / {totalCampaigns} total
            </span>
          </h3>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800/80 pt-2.5">
          <span>CPM Escrow Backed</span>
          <span className="font-semibold text-brand-500 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Manage <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>

      {/* Metric 2: Submissions Queue */}
      <Link
        href="/admin/submissions"
        className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-amber-500/30 dark:border-gray-800 dark:bg-gray-900/60"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400">
            <Layers className="h-5 w-5" />
          </div>
          <Badge color={pendingSubmissions > 0 ? "warning" : "success"}>
            {pendingSubmissions > 0 ? `${pendingSubmissions} In Review` : "Clear"}
          </Badge>
        </div>
        <div className="mt-4">
          <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Verification Queue
          </span>
          <h3 className="mt-1 text-2xl font-bold font-display text-gray-900 dark:text-white">
            {pendingSubmissions}{" "}
            <span className="text-sm font-sans font-normal text-gray-400">
              ({totalSubmissions} submitted)
            </span>
          </h3>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800/80 pt-2.5">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {automatedPassRate}% auto-pass rate
          </span>
          <span className="font-semibold text-amber-500 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Audit <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>

      {/* Metric 3: Connected Social Reach */}
      <Link
        href="/admin/accounts"
        className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-purple-500/30 dark:border-gray-800 dark:bg-gray-900/60"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400">
            <Share2 className="h-5 w-5" />
          </div>
          <Badge color="primary">
            {totalSocialAccounts} Accounts
          </Badge>
        </div>
        <div className="mt-4">
          <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Audience Reach
          </span>
          <h3 className="mt-1 text-2xl font-bold font-display text-gray-900 dark:text-white">
            {formatCompact(totalAudienceReach)}{" "}
            <span className="text-sm font-sans font-normal text-gray-400">
              followers
            </span>
          </h3>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800/80 pt-2.5">
          <span>TikTok • IG • YT • X</span>
          <span className="font-semibold text-purple-500 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Registry <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>

      {/* Metric 4: Platform Custodial Treasury */}
      <Link
        href="/admin/finances"
        className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-500/30 dark:border-gray-800 dark:bg-gray-900/60"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <Badge color="success">
            Double-Entry
          </Badge>
        </div>
        <div className="mt-4">
          <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Custodial Liquidity
          </span>
          <h3 className="mt-1 text-2xl font-bold font-display text-gray-900 dark:text-white">
            {formatNaira(totalLiquidity)}
          </h3>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800/80 pt-2.5">
          <span>Pool: {formatNaira(campaignPool)}</span>
          <span className="font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Treasury <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>
    </div>
  );
};

// =========================================================================
// 2. ACTIVE BROADCAST ANNOUNCEMENT BANNER (/admin/broadcasts mini-view)
// =========================================================================
interface ActiveBroadcastAlertProps {
  activeBroadcast?: BroadcastItem | null;
}

export const ActiveBroadcastAlert: React.FC<ActiveBroadcastAlertProps> = ({
  activeBroadcast,
}) => {
  if (!activeBroadcast) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 p-3.5 sm:p-4 flex items-center justify-between font-sans">
        <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
          <Radio className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>No active platform announcements currently broadcast to user dashboards.</span>
        </div>
        <Link
          href="/admin/broadcasts"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors"
        >
          <span>Send Broadcast</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case "new_feature":
        return <Badge color="primary">✨ New Feature</Badge>;
      case "action_required":
        return <Badge color="warning">⚡ Action Required</Badge>;
      case "maintenance":
        return <Badge color="error">🛠️ Maintenance</Badge>;
      case "alert":
        return <Badge color="error">🚨 System Alert</Badge>;
      default:
        return <Badge color="info">📢 Platform Update</Badge>;
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/70 p-4 sm:p-5 shadow-xs dark:border-indigo-950/60 dark:bg-gradient-to-r dark:from-indigo-950/20 dark:via-gray-900/60 dark:to-purple-950/20 font-sans transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm shadow-indigo-600/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {getTagBadge(activeBroadcast.tag)}
              <span className="text-[11px] font-mono uppercase font-semibold text-gray-400 dark:text-gray-500">
                Audience: <strong className="text-gray-700 dark:text-gray-300">{activeBroadcast.target_audience}</strong>
              </span>
              <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                • {activeBroadcast.sent_count || 0} impressions • {activeBroadcast.click_count || 0} clicks
              </span>
            </div>
            <h4 className="text-sm font-bold font-display text-gray-900 dark:text-white mt-1">
              {activeBroadcast.title}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 mt-0.5">
              {activeBroadcast.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Link
            href="/admin/broadcasts"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white text-gray-800 border border-gray-200 shadow-2xs hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 transition-colors"
          >
            <span>Manage Broadcasts</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. TREASURY & PAYOUTS SNAPSHOT (/admin/finances mini-card)
// =========================================================================
interface TreasuryMiniCardProps {
  platformPurse: number;
  totalSettledPayouts: number;
  totalPendingPayouts: number;
  pendingPayoutsCount: number;
}

export const TreasuryMiniCard: React.FC<TreasuryMiniCardProps> = ({
  platformPurse,
  totalSettledPayouts,
  totalPendingPayouts,
  pendingPayoutsCount,
}) => {
  const formatNaira = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900/50 font-sans flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                Platform Earnings &amp; Payouts
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                10% marketplace cut &amp; creator withdrawals
              </p>
            </div>
          </div>
          <Link
            href="/admin/finances"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-0.5"
          >
            Ledger <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
            <span className="text-[11px] text-gray-400 dark:text-gray-500 block">Platform Purse</span>
            <span className="text-base font-bold font-display text-gray-900 dark:text-white">
              {formatNaira(platformPurse)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
            <span className="text-[11px] text-gray-400 dark:text-gray-500 block">Settled to Banks</span>
            <span className="text-base font-bold font-display text-emerald-600 dark:text-emerald-400">
              {formatNaira(totalSettledPayouts)}
            </span>
          </div>
        </div>

        {/* Pending Payout Queue Alert */}
        <div className="mt-3.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                {pendingPayoutsCount} Pending Payout Request{pendingPayoutsCount === 1 ? "" : "s"}
              </span>
              <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-mono">
                {formatNaira(totalPendingPayouts)} awaiting clearance
              </span>
            </div>
          </div>
          <Link
            href="/admin/finances"
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-2xs transition-colors shrink-0"
          >
            Review
          </Link>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 4. CONNECTED SOCIAL CHANNELS MINI-VIEW (/admin/accounts mini-view)
// =========================================================================
interface SocialAccountsMiniViewProps {
  totalAccounts: number;
  verifiedAccounts: number;
  platformBreakdown: {
    tiktok: number;
    instagram: number;
    youtube: number;
    x: number;
    facebook: number;
  };
}

export const SocialAccountsMiniView: React.FC<SocialAccountsMiniViewProps> = ({
  totalAccounts,
  verifiedAccounts,
  platformBreakdown,
}) => {
  const platforms = [
    {
      name: "TikTok",
      key: "tiktok",
      count: platformBreakdown.tiktok || 0,
      color: "text-rose-500",
      hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700/60",
    },
    {
      name: "Instagram",
      key: "instagram",
      count: platformBreakdown.instagram || 0,
      color: "text-pink-500",
      hoverBorder: "hover:border-pink-300 dark:hover:border-pink-700/60",
    },
    {
      name: "YouTube",
      key: "youtube",
      count: platformBreakdown.youtube || 0,
      color: "text-red-500",
      hoverBorder: "hover:border-red-300 dark:hover:border-red-700/60",
    },
    {
      name: "X",
      key: "x",
      count: platformBreakdown.x || 0,
      color: "text-sky-500",
      hoverBorder: "hover:border-sky-300 dark:hover:border-sky-700/60",
    },
    {
      name: "Facebook",
      key: "facebook",
      count: platformBreakdown.facebook || 0,
      color: "text-blue-500",
      hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700/60",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900/50 font-sans flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                Social Creator Channels
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Connected TikTok, Reels, Shorts &amp; X profiles
              </p>
            </div>
          </div>
          <Link
            href="/admin/accounts"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-0.5 group"
          >
            Accounts <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Platform Pills */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {platforms.map((p) => (
            <Link
              key={p.name}
              href={`/admin/accounts?platform=${p.key}`}
              className={`p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 text-center transition-all hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:shadow-2xs ${p.hoverBorder}`}
              title={`View all ${p.name} accounts (${p.count})`}
            >
              <span className={`text-[11px] font-bold block ${p.color}`}>{p.name}</span>
              <span className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5 block">
                {p.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Verification Summary Footnote */}
        <div className="mt-3.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>
              <strong>{verifiedAccounts}</strong> of {totalAccounts} profiles verified
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            {totalAccounts > 0 ? Math.round((verifiedAccounts / totalAccounts) * 100) : 0}% clearance
          </span>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 5. SCRAPER & GOVERNANCE PULSE (/admin/scraper and /admin/settings mini-view)
// =========================================================================
interface EngineAndGovernanceProps {
  liveCampaignsCount: number;
  maintenanceMode: boolean;
}

export const EngineAndGovernanceMini: React.FC<EngineAndGovernanceProps> = ({
  liveCampaignsCount,
  maintenanceMode,
}) => {
  return (
    <div className="flex flex-col gap-4 md:gap-6 h-full font-sans justify-between">
      {/* 1. Scraper Engine Status Card (Top) */}
      <div className="flex-1 rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900/50 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-display uppercase tracking-wider text-gray-900 dark:text-white">
                  Scraper Telemetry
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Apify actors &amp; automated verification engines
                </p>
              </div>
            </div>
            <Link
              href="/admin/scraper"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-0.5 group"
            >
              Console <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
            Multi-platform verification pipeline crawling TikTok, Reels, Shorts &amp; X profiles with automated anti-fraud checks.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Engines Operational
          </span>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
              Run: Every 30m
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">
              {liveCampaignsCount} Active Tasks
            </span>
          </div>
        </div>
      </div>

      {/* 2. Platform Governance & API Vault Status Card (Bottom) */}
      <div className="flex-1 rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900/50 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-display uppercase tracking-wider text-gray-900 dark:text-white">
                  Platform Governance
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Dynamic fees, parameters &amp; 14-service API vault
                </p>
              </div>
            </div>
            <Link
              href="/admin/settings"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-0.5 group"
            >
              Cockpit <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
            Custodial escrow policies, marketplace parameters, and active service credentials for Paystack, Redis, Apify &amp; LLMs.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
          <span className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                maintenanceMode ? "bg-rose-500" : "bg-emerald-500"
              }`}
            />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {maintenanceMode ? "Maintenance Active" : "Public Market Live"}
            </span>
          </span>
          <Badge color="light">
            14 APIs Vaulted
          </Badge>
        </div>
      </div>
    </div>
  );
};
