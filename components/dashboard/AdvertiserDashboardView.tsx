'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Wallet,
  Sliders,
  BarChart3,
  ShieldCheck,
  Eye,
  Zap,
  ExternalLink,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { AdvertiserDashboardData } from '@/lib/supabase/advertiser';
import { formatCompactNumber, formatCompactCurrency } from '@/lib/utils/format';

interface AdvertiserDashboardProps {
  companyName: string;
  data: AdvertiserDashboardData;
}

const ITEMS_PER_PAGE = 3;

export default function AdvertiserDashboardView({ companyName, data }: AdvertiserDashboardProps) {
  const [filterTab, setFilterTab] = useState<'active' | 'all'>('active');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter campaigns based on tab
  const activeCampaignsList = (data.campaigns || []).filter(
    (c) => c.status === 'live' || c.status === 'budget_committed'
  );
  const displayedCampaignsSource =
    filterTab === 'active' ? activeCampaignsList : data.campaigns || [];

  const totalPages = Math.max(1, Math.ceil(displayedCampaignsSource.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedCampaigns = displayedCampaignsSource.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Compute metrics
  const totalViews = data.totalViewsDelivered || 0;
  const activeCreators =
    data.activeCreatorsCount ||
    (data.campaigns || []).reduce((sum, c) => sum + (c.creators_count || 0), 0);
  const liveCount = activeCampaignsList.length;

  const avgCpm =
    activeCampaignsList.length > 0
      ? Math.round(
          activeCampaignsList.reduce((sum, c) => sum + Number(c.cpm_rate || 0), 0) /
            activeCampaignsList.length
        )
      : data.campaigns && data.campaigns.length > 0
      ? Math.round(
          data.campaigns.reduce((sum, c) => sum + Number(c.cpm_rate || 0), 0) /
            data.campaigns.length
        )
      : 2000;

  // Operational Action Queue evaluation
  const nearExhaustionCampaigns = (data.campaigns || []).filter(
    (c) =>
      (c.status === 'live' || c.status === 'budget_committed') &&
      c.total_budget > 0 &&
      c.spent_budget / c.total_budget >= 0.8
  );
  const fundingPendingCampaigns = (data.campaigns || []).filter(
    (c) => c.status === 'funding_pending'
  );
  const pendingSubmissionsCount = data.pendingSubmissions || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans text-kpugi-ink dark:text-white transition-colors duration-200">
      
      {/* ─────────────────────────────────────────────
          1. EXECUTIVE COMMAND HERO
      ───────────────────────────────────────────── */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-6 sm:p-10 overflow-hidden shadow-xl border border-slate-800">
        {/* Ambient background glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-kpugi-blue/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-6">
          <div className="space-y-3 max-w-xl">
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              Welcome back, {companyName}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg">
              Track real-time creator throughput, verify audience view velocity, and manage performance escrow across active briefs.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0 sm:self-end">
            <Link
              href="/campaigns/new"
              title="Create Campaign"
              className="group relative inline-flex items-center justify-center h-10 sm:h-11 px-3 sm:px-3.5 rounded-2xl bg-kpugi-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-kpugi-blue/30 hover:shadow-lg transition-all duration-300 ease-in-out flex-1 sm:flex-initial"
            >
              <Plus className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
              <span className="inline-block sm:max-w-0 sm:opacity-0 sm:group-hover:max-w-[140px] sm:group-hover:opacity-100 sm:group-hover:ml-2 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out">
                Create Campaign
              </span>
            </Link>

            <Link
              href="/b/wallet"
              title="Brand Wallet"
              className="group relative inline-flex items-center justify-center h-10 sm:h-11 px-3 sm:px-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700/80 transition-all duration-300 ease-in-out flex-1 sm:flex-initial"
            >
              <Wallet className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white transition-colors" />
              <span className="inline-block sm:max-w-0 sm:opacity-0 sm:group-hover:max-w-[120px] sm:group-hover:opacity-100 sm:group-hover:ml-2 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out">
                Brand Wallet
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          2. OPERATIONAL ACTION QUEUE / HEALTH BAR
      ───────────────────────────────────────────── */}
      {nearExhaustionCampaigns.length > 0 ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-xs sm:text-sm text-amber-950 dark:text-amber-200 font-display">
                Action Recommended: {nearExhaustionCampaigns.length} Campaign{nearExhaustionCampaigns.length > 1 ? 's' : ''} Nearing Budget Cap
              </h2>
              <p className="text-xs text-amber-800/90 dark:text-slate-300 mt-0.5">
                &ldquo;{nearExhaustionCampaigns[0].title}&rdquo; has utilized {Math.round((nearExhaustionCampaigns[0].spent_budget / nearExhaustionCampaigns[0].total_budget) * 100)}% of its allocated escrow.
              </p>
            </div>
          </div>
          <Link
            href={`/b/campaigns/${nearExhaustionCampaigns[0].id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-all shadow-xs"
          >
            <span>Review & Top Up</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : fundingPendingCampaigns.length > 0 ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 font-display">
                Campaign Pending Escrow Funding
              </h2>
              <p className="text-xs text-indigo-800/90 dark:text-slate-300 mt-0.5">
                &ldquo;{fundingPendingCampaigns[0].title}&rdquo; requires escrow funding to flip live and unlock creator submissions.
              </p>
            </div>
          </div>
          <Link
            href={`/b/campaigns/${fundingPendingCampaigns[0].id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-kpugi-blue hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-all shadow-xs"
          >
            <span>Fund Escrow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : pendingSubmissionsCount > 0 ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/10 dark:bg-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-xs sm:text-sm text-blue-950 dark:text-blue-200 font-display">
                {pendingSubmissionsCount} Creator Proof{pendingSubmissionsCount > 1 ? 's' : ''} in Verification Audit
              </h2>
              <p className="text-xs text-blue-800/90 dark:text-slate-300 mt-0.5">
                Automated view auditors are verifying live metrics across creator submissions.
              </p>
            </div>
          </div>
          <Link
            href="/b/campaigns"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 text-xs font-bold shrink-0 transition-all"
          >
            <span>View Submissions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200 font-display block">
                All Systems Operational
              </span>
              <span className="text-[11px] text-emerald-800/80 dark:text-slate-300 block">
                Escrow protected & real-time view verification active across all running briefs.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
            AUTO-AUDIT ACTIVE
          </span>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          3. REAL-TIME REACH & VIEW VELOCITY PULSE
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Verified Views */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">
              Verified Views
            </span>
            <div className="w-8 h-8 rounded-xl bg-kpugi-blue/10 text-kpugi-blue dark:text-blue-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono font-bold text-3xl sm:text-4xl text-kpugi-ink dark:text-white">
              {formatCompactNumber(totalViews)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Audited & Verified</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Creators */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">
              Active Creators
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono font-bold text-3xl sm:text-4xl text-kpugi-ink dark:text-white">
              {activeCreators}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-kpugi-slate dark:text-slate-400">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Participating in briefs</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Campaigns */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">
              Live Campaigns
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono font-bold text-3xl sm:text-4xl text-kpugi-ink dark:text-white">
              {liveCount}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-kpugi-slate dark:text-slate-400">
              <span>Budget committed & live</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Effective Average CPM */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">
              Effective CPM
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono font-bold text-3xl sm:text-4xl text-kpugi-ink dark:text-white">
              ₦{avgCpm.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-kpugi-slate dark:text-slate-400 font-mono">
              <span>Per 1,000 verified views</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          4. TWO-COLUMN MAIN SECTION:
             Left: Compact Paginated Campaign Monitor
             Right: Live Creator Proof Activity Feed & Quick Actions
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: COMPACT CAMPAIGN MONITOR (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs space-y-6">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-kpugi-border/60 dark:border-white/10 pb-5">
              <div>
                <h2 className="font-display text-xl font-bold text-kpugi-ink dark:text-white">
                  Live Campaign Monitor
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time budget consumption & view velocity.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold">
                  <button
                    onClick={() => {
                      setFilterTab('active');
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filterTab === 'active'
                        ? 'bg-white dark:bg-white/15 text-kpugi-ink dark:text-white shadow-2xs font-bold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Active ({activeCampaignsList.length})
                  </button>
                  <button
                    onClick={() => {
                      setFilterTab('all');
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filterTab === 'all'
                        ? 'bg-white dark:bg-white/15 text-kpugi-ink dark:text-white shadow-2xs font-bold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All ({data.campaigns ? data.campaigns.length : 0})
                  </button>
                </div>

                <Link
                  href="/b/campaigns"
                  className="text-xs font-bold text-kpugi-blue dark:text-blue-400 hover:underline hidden sm:inline-flex items-center gap-1 shrink-0 ml-1"
                >
                  <span>All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Campaign Cards List */}
            {paginatedCampaigns.length > 0 ? (
              <div className="space-y-4">
                {paginatedCampaigns.map((camp) => {
                  const percentSpent =
                    camp.total_budget > 0
                      ? Math.min(100, Math.round((camp.spent_budget / camp.total_budget) * 100))
                      : 0;

                  return (
                    <div
                      key={camp.id}
                      className="p-5 rounded-2xl border border-kpugi-border dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all space-y-4 group"
                    >
                      {/* Top row: Format, title, status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-kpugi-blue/10 dark:bg-blue-500/20 text-kpugi-blue dark:text-blue-400 font-mono font-bold text-[10px] uppercase">
                              {camp.ad_format}
                            </span>
                            {camp.campaign_code && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-mono font-bold text-[10px] uppercase">
                                {camp.campaign_code}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                camp.status === 'live'
                                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                  : camp.status === 'funding_pending'
                                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                  : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {camp.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-sm sm:text-base text-kpugi-ink dark:text-white truncate group-hover:text-kpugi-blue dark:group-hover:text-blue-400 transition-colors">
                            {camp.title}
                          </h3>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                            CPM Rate
                          </span>
                          <span className="font-mono font-bold text-xs text-kpugi-ink dark:text-white block">
                            ₦{camp.cpm_rate.toLocaleString()}/cpm
                          </span>
                        </div>
                      </div>

                      {/* Progress bar: Budget utilization */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-500 dark:text-slate-400">
                            Spent: <strong className="text-kpugi-ink dark:text-white">₦{camp.spent_budget.toLocaleString()}</strong>
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            Total: <strong className="text-kpugi-ink dark:text-white">₦{camp.total_budget.toLocaleString()}</strong> ({percentSpent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentSpent >= 90
                                ? 'bg-amber-500'
                                : 'bg-kpugi-blue'
                            }`}
                            style={{ width: `${percentSpent}%` }}
                          />
                        </div>
                      </div>

                      {/* Bottom stats and action button */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/10">
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <strong>{formatCompactNumber(camp.views_delivered || 0)}</strong> views
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <strong>{camp.creators_count || 0}</strong> creators
                          </span>
                        </div>

                        <Link
                          href={`/b/campaigns/${camp.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-kpugi-blue dark:text-blue-400 hover:underline"
                        >
                          <span>Manage Brief</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-kpugi-blue/10 text-kpugi-blue dark:text-blue-400 flex items-center justify-center mx-auto">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-kpugi-ink dark:text-white font-display">No campaigns to display</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                    {filterTab === 'active'
                      ? 'You currently have no active live campaigns.'
                      : 'Launch your first performance campaign brief to begin paying creators per verified view.'}
                  </p>
                </div>
                <Link
                  href="/campaigns/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-kpugi-blue hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Launch Brief Now</span>
                </Link>
              </div>
            )}

            {/* Pagination Controls */}
            {displayedCampaignsSource.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between pt-4 border-t border-kpugi-border/60 dark:border-white/10 text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">
                  Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, displayedCampaignsSource.length)} of {displayedCampaignsSource.length}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={safePage <= 1}
                    className="p-2 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-slate-700 dark:text-slate-300 font-bold">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={safePage >= totalPages}
                    className="p-2 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* View all footer link */}
            <div className="text-center pt-2">
              <Link
                href="/b/campaigns"
                className="text-xs font-bold text-kpugi-blue dark:text-blue-400 hover:underline inline-flex items-center gap-1.5"
              >
                <span>View Full Campaign Manager & Archives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE CREATOR ACTIVITY FEED & FAST ACTIONS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ③ Live Creator Proof Activity Feed */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="font-display text-base font-bold text-kpugi-ink dark:text-white">
                  Recent Creator Activity
                </h2>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Live Feed
              </span>
            </div>

            {data.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-3.5">
                {data.recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-slate-200 transition-all flex items-start gap-3"
                  >
                    {activity.creatorAvatarUrl ? (
                      <Image
                        src={activity.creatorAvatarUrl}
                        alt=""
                        width={36}
                        height={36}
                        className="rounded-xl object-cover shrink-0 border border-slate-200 dark:border-white/10"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-kpugi-blue/10 dark:bg-blue-500/20 text-kpugi-blue dark:text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {activity.creatorHandle.replace('@', '')[0]?.toUpperCase() || 'C'}
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-bold text-xs text-kpugi-ink dark:text-white truncate">
                          {activity.creatorHandle}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {activity.platform.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {activity.campaignTitle}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {formatCompactNumber(activity.viewsCount)} views verified
                        </span>
                        {activity.payoutAmount && activity.payoutAmount > 0 && (
                          <span className="font-mono font-bold text-kpugi-ink dark:text-white">
                            ₦{activity.payoutAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 space-y-2">
                <Users className="w-7 h-7 text-slate-300 dark:text-slate-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No recent submissions yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  When creators post your campaign briefs and view auditors verify their metrics, live submissions will appear here.
                </p>
              </div>
            )}
          </div>

          {/* ⑤ Fast Operations Command Bar */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs space-y-4">
            <h2 className="font-display text-base font-bold text-kpugi-ink dark:text-white">
              Quick Brand Operations
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Action 1: Create Brief */}
              <Link
                href="/campaigns/new"
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-kpugi-blue hover:text-white border border-kpugi-border dark:border-white/10 hover:border-kpugi-blue transition-all group flex flex-col justify-between space-y-2"
              >
                <div className="w-8 h-8 rounded-xl bg-kpugi-blue/10 dark:bg-blue-500/20 group-hover:bg-white/20 text-kpugi-blue dark:text-blue-400 group-hover:text-white flex items-center justify-center font-bold transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-kpugi-ink dark:text-white group-hover:text-white">
                    New Campaign Brief
                  </h3>
                  <p className="text-[10px] text-slate-400 group-hover:text-white/80 mt-0.5">
                    Upload creatives & set CPM
                  </p>
                </div>
              </Link>

              {/* Action 2: Brand Wallet */}
              <Link
                href="/b/wallet"
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-900 dark:hover:bg-white/15 hover:text-white border border-kpugi-border dark:border-white/10 transition-all group flex flex-col justify-between space-y-2"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 group-hover:bg-white/20 text-emerald-600 dark:text-emerald-400 group-hover:text-white flex items-center justify-center font-bold transition-colors">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-kpugi-ink dark:text-white group-hover:text-white">
                    Invoices & Escrow
                  </h3>
                  <p className="text-[10px] text-slate-400 group-hover:text-white/80 mt-0.5">
                    Download receipts & top up
                  </p>
                </div>
              </Link>

              {/* Action 3: Settings & Alerts */}
              <Link
                href="/b/settings"
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-900 dark:hover:bg-white/15 hover:text-white border border-kpugi-border dark:border-white/10 transition-all group flex flex-col justify-between space-y-2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 group-hover:bg-white/20 text-purple-600 dark:text-purple-400 group-hover:text-white flex items-center justify-center font-bold transition-colors">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-kpugi-ink dark:text-white group-hover:text-white">
                    Brand Settings
                  </h3>
                  <p className="text-[10px] text-slate-400 group-hover:text-white/80 mt-0.5">
                    Guardrails & notifications
                  </p>
                </div>
              </Link>

              {/* Action 4: Analytics */}
              <Link
                href="/b/analytics"
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-900 dark:hover:bg-white/15 hover:text-white border border-kpugi-border dark:border-white/10 transition-all group flex flex-col justify-between space-y-2"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 group-hover:bg-white/20 text-amber-600 dark:text-amber-400 group-hover:text-white flex items-center justify-center font-bold transition-colors">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-kpugi-ink dark:text-white group-hover:text-white">
                    ROI Analytics
                  </h3>
                  <p className="text-[10px] text-slate-400 group-hover:text-white/80 mt-0.5">
                    Historical view throughput
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
