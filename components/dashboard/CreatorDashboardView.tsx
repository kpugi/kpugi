'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Radio,
  CreditCard,
  Compass,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Eye,
  PlusCircle,
  Clock,
  Send,
  Layers,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { CreatorOverviewData } from '@/lib/supabase/creator';
import { PlatformBadge } from '@/components/ui/SocialIcons';
import { formatCompactCurrency } from '@/lib/utils/format';
import CreatorLevelBadge from '@/components/creator/CreatorLevelBadge';

interface CreatorDashboardProps {
  displayName: string;
  data: CreatorOverviewData;
}

export default function CreatorDashboardView({ displayName, data }: CreatorDashboardProps) {
  const featuredSub = data.submissions.find((sub) => sub.status === 'pending' || sub.status === 'under_review') || data.submissions[0];
  const hasActiveCampaign = !!featuredSub;

  // 60-Minute Automated View Sync Countdown Timer
  const computeRemainingSeconds = () => {
    if (!featuredSub) return 3600;
    const baseDateStr = (featuredSub as any)?.last_scraped_at || featuredSub.submitted_at;
    const baseTimestamp = baseDateStr ? new Date(baseDateStr).getTime() : Date.now();
    const nextAuditTime = baseTimestamp + 60 * 60 * 1000;
    const diffSeconds = Math.floor((nextAuditTime - Date.now()) / 1000);
    return Math.max(0, diffSeconds);
  };

  const [secondsToNextAudit, setSecondsToNextAudit] = useState<number>(3600);

  useEffect(() => {
    if (!featuredSub) return;
    setSecondsToNextAudit(computeRemainingSeconds());

    const timer = setInterval(() => {
      setSecondsToNextAudit(computeRemainingSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, [featuredSub]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink font-sans pb-12">
      
      {/* ─────────────────────────────────────────────────────
         1. TOP GREETING BANNER
      ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-kpugi-ink via-slate-900 to-kpugi-blue text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/15 text-[11px] font-bold font-mono uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Creator Command Center
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {displayName}! 👋
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Track your active post audits, monitor automated hourly view counts, and claim cleared campaign payouts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-end">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-kpugi-ink font-sans text-xs font-bold hover:bg-slate-100 transition-all shadow-md active:scale-95"
            >
              <Compass className="w-4 h-4 text-kpugi-blue" />
              <span>Browse Briefs</span>
            </Link>
          </div>
        </div>

        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-kpugi-blue/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ─────────────────────────────────────────────────────
         2. KYC VERIFICATION REMINDER BANNER (Conditional)
      ───────────────────────────────────────────────────── */}
      {data.kycStatus !== 'verified' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              🛡️
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>ID Verification Required</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                  {data.kycStatus === 'pending' ? 'Verification Pending' : 'Action Needed'}
                </span>
              </h3>
              <p className="font-sans text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                To protect campaign payouts and comply with platform regulations, creators must verify their official government ID (NIN, Voter Card, or Passport) before requesting withdrawals.
              </p>
            </div>
          </div>

          <Link
            href="/c/settings"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 self-start sm:self-center"
          >
            <span>Complete Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
         3. CREATOR LEVEL & RANK WIDGET
      ───────────────────────────────────────────────────── */}
      <CreatorLevelBadge totalEarned={data.totalEarned || 0} variant="widget" />

      {/* ─────────────────────────────────────────────────────
         4. TOP 4-COLUMN LIVE METRIC PULSE
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Available Balance */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between space-y-4 hover:border-kpugi-blue/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider">Available Balance</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-kpugi-blue">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono font-extrabold text-2xl sm:text-3xl text-kpugi-blue">
              {formatCompactCurrency(data.walletBalance || 0)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-kpugi-border/60">
              <span className="font-sans text-[11px] text-kpugi-slate">Cleared creator funds</span>
              <Link
                href="/c/wallet"
                className="text-[11px] font-bold text-kpugi-blue hover:underline flex items-center gap-0.5"
              >
                <span>Withdraw</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Active Post Audits */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider">Active Post Audits</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="font-mono font-extrabold text-2xl sm:text-3xl text-kpugi-ink flex items-baseline gap-2">
              <span>{data.activeSubmissions}</span>
              {data.activeSubmissions > 0 && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase font-sans">
                  Auditing
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-kpugi-border/60">
              <span className="font-sans text-[11px] text-kpugi-slate">Posts in hourly sync</span>
              <Link
                href="/c/submissions"
                className="text-[11px] font-bold text-kpugi-slate hover:text-kpugi-ink hover:underline flex items-center gap-0.5"
              >
                <span>Details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Verified Views Audited */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider">Audited Views</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono font-extrabold text-2xl sm:text-3xl text-kpugi-ink">
              {(data.totalVerifiedViews || 0).toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-kpugi-border/60">
              <span className="font-sans text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified public reach
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Cleared Earnings */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider">Total Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono font-extrabold text-2xl sm:text-3xl text-kpugi-ink">
              {formatCompactCurrency(data.totalEarned || 0)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-kpugi-border/60">
              <span className="font-sans text-[11px] text-kpugi-slate">Accumulated lifetime</span>
              <Link
                href="/c/wallet"
                className="text-[11px] font-bold text-kpugi-slate hover:text-kpugi-ink hover:underline flex items-center gap-0.5"
              >
                <span>Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────
         5. HERO: ACTIVE CAMPAIGN LIVE VIEW VELOCITY & AUDIT PULSE
      ───────────────────────────────────────────────────── */}
      <div className="pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Campaign Hero Widget (Col Span 2) */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between gap-6">
            {hasActiveCampaign && featuredSub ? (
              <>
                <div className="space-y-5">
                  
                  {/* Top Bar: Brand, Title, Status & Payout */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {featuredSub.campaign.company_logo || (featuredSub.campaign as any).cover_image_url ? (
                        <img
                          src={featuredSub.campaign.company_logo || (featuredSub.campaign as any).cover_image_url}
                          alt={featuredSub.campaign.title || featuredSub.campaign.company_name || 'Campaign'}
                          className="w-14 h-14 rounded-2xl object-cover border border-kpugi-border shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-kpugi-ink text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                          {(featuredSub.campaign.title || featuredSub.campaign.company_name || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-kpugi-blue border border-blue-200 text-[10px] font-bold uppercase font-mono tracking-wider">
                            {featuredSub.campaign.ad_format || 'POST'}
                          </span>
                          <span className="font-sans text-xs text-kpugi-slate font-medium">
                            {featuredSub.campaign.company_name}
                          </span>
                        </div>

                        <h3 className="font-display font-extrabold text-xl sm:text-2xl text-kpugi-ink leading-snug">
                          {featuredSub.campaign.title}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-extrabold text-2xl sm:text-3xl text-kpugi-blue">
                        {formatCompactCurrency(Number(featuredSub.payout_amount || featuredSub.reserved_amount || 0))}
                      </div>
                      <span className="font-sans text-[10px] font-bold text-kpugi-slate uppercase tracking-wider block">
                        {featuredSub.status === 'paid' || featuredSub.status === 'completed' ? 'Cleared Payout' : 'Reserved Escrow'}
                      </span>
                    </div>
                  </div>

                  {/* Real-time View Milestone & Countdown Progress Card */}
                  {(() => {
                    const currentViews = featuredSub.final_view_count || 0;
                    const threshold = featuredSub.campaign.min_view_threshold || 1000;
                    const pct = Math.min(100, Math.round((currentViews / threshold) * 100));
                    const isGoalReached = pct >= 100;
                    const totalBudget = featuredSub.campaign.total_budget || 0;
                    const maxPoolCap = totalBudget * 0.25;

                    return (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                        
                        {/* Live Sync Status & Countdown Ticker */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="font-sans text-xs font-bold text-kpugi-ink">
                              Automated View Auditor Active
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-kpugi-slate bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-kpugi-blue" />
                            <span>Next Sync in {formatTimer(secondsToNextAudit)}</span>
                          </div>
                        </div>

                        {/* View Progress Metric */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between font-sans text-xs font-bold">
                            <span className="text-kpugi-ink flex items-center gap-1.5">
                              <span>Milestone View Threshold</span>
                              {isGoalReached && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Threshold Met
                                </span>
                              )}
                            </span>
                            <span className={`font-mono ${isGoalReached ? 'text-emerald-600 font-extrabold' : 'text-kpugi-blue font-bold'}`}>
                              {currentViews.toLocaleString()} / {threshold.toLocaleString()} Views ({pct}%)
                            </span>
                          </div>

                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isGoalReached ? 'bg-emerald-500' : 'bg-kpugi-blue'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Metadata Footer: Submitted Link, Rate & 25% Cap */}
                        <div className="flex items-center justify-between font-sans text-[11px] font-medium text-kpugi-slate pt-1 flex-wrap gap-2">
                          <span>Rate: <strong className="text-kpugi-ink font-mono">{formatCompactCurrency(featuredSub.campaign.cpm_rate)} / 1k</strong></span>
                          
                          {maxPoolCap > 0 && (
                            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 font-mono text-[10px]">
                              🛡️ 25% Pool Cap: {formatCompactCurrency(maxPoolCap)} max
                            </span>
                          )}

                          {featuredSub.post_url && (
                            <a
                              href={featuredSub.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-kpugi-blue hover:underline inline-flex items-center gap-1 ml-auto"
                            >
                              <span>View Public Post</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Social Platform Badges & Direct Workspace Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-kpugi-border">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider mr-1">Platforms:</span>
                    {Array.from(
                      new Set(
                        (featuredSub.campaign.channels && featuredSub.campaign.channels.length > 0
                          ? featuredSub.campaign.channels
                          : ['tiktok', 'instagram']
                        ).map((ch: string) => {
                          const p = ch.toLowerCase();
                          if (p.includes('tiktok')) return 'tiktok';
                          if (p.includes('youtube') || p.includes('shorts')) return 'youtube';
                          if (p.includes('facebook') || p.includes('fb')) return 'facebook';
                          if (p.includes('twitter') || p.includes('x')) return 'x';
                          if (p.includes('insta')) return 'instagram';
                          return ch;
                        })
                      )
                    ).map((platform: string) => (
                      <PlatformBadge key={platform} platform={platform} />
                    ))}
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                    <Link
                      href={`/campaigns/${featuredSub.campaign.id}`}
                      className="font-sans flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-kpugi-blue hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-kpugi-blue/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>{featuredSub.post_url ? 'Open Campaign Workspace' : 'Submit Post Link'}</span>
                    </Link>

                    <Link
                      href="/browse"
                      className="font-sans inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-kpugi-paper hover:bg-slate-200 text-kpugi-slate font-bold text-xs border border-kpugi-border transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>More Briefs</span>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 my-auto">
                <div className="w-14 h-14 rounded-3xl bg-blue-50 text-kpugi-blue flex items-center justify-center shadow-sm">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-kpugi-ink">
                    No Active Post Audits Running
                  </h3>
                  <p className="font-sans text-xs text-kpugi-slate mt-1 max-w-sm leading-relaxed">
                    You don&apos;t have any active campaigns under view verification. Explore verified advertiser briefs to reserve your budget slot.
                  </p>
                </div>
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-kpugi-blue hover:bg-blue-700 text-white font-sans font-bold text-xs shadow-lg shadow-kpugi-blue/25 transition-all"
                >
                  <span>Browse Available Briefs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Sidebar: Rules & Creator Protection */}
          <div className="space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
              <h4 className="font-display font-bold text-sm text-kpugi-ink uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-kpugi-blue" />
                Payout & Audit Protocol
              </h4>

              <div className="space-y-3 text-xs font-sans">
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                  <span className="font-bold text-kpugi-blue block flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    1,000 Minimum View Threshold
                  </span>
                  <p className="text-kpugi-slate text-[11px] leading-relaxed">
                    Submissions require at least 1,000 verified public views to clear CPM earnings from escrow.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="font-bold text-kpugi-ink block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    72-Hour Public Retention
                  </span>
                  <p className="text-kpugi-slate text-[11px] leading-relaxed">
                    Submitted posts (videos, images, or text) must remain active and publicly accessible for 72 hours.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                  <span className="font-bold text-emerald-800 block flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    Direct Bank Settlements
                  </span>
                  <p className="text-emerald-900/80 text-[11px] leading-relaxed">
                    Cleared earnings are transferred directly into your verified Nigerian bank account via Paystack.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         6. FAST CREATOR COMMAND BAR
      ───────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-kpugi-ink to-slate-900 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="uppercase tracking-wider">Quick Actions</span>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/c/submissions"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center justify-center gap-1.5 text-center"
            >
              <Send className="w-3.5 h-3.5 text-kpugi-blue" />
              <span>Submit Post Link</span>
            </Link>

            <Link
              href="/c/wallet"
              className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 text-center"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Withdraw Funds</span>
            </Link>

            <Link
              href="/c/settings"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center justify-center gap-1.5 text-center"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Connect Channels</span>
            </Link>

            <Link
              href="/browse"
              className="px-4 py-2.5 rounded-xl bg-white text-kpugi-ink hover:bg-slate-100 font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5 text-center"
            >
              <Compass className="w-3.5 h-3.5 text-kpugi-blue" />
              <span>Browse Briefs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         7. CURATED HIGH-CPM BRIEFS BENTO
      ───────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-kpugi-border/60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-xl text-kpugi-ink">
              Recommended High-CPM Opportunities
            </h3>
            <p className="font-sans text-xs text-kpugi-slate mt-0.5">
              Curated active briefs with guaranteed escrow funding ready for placement.
            </p>
          </div>
          <Link href="/browse" className="text-xs font-bold text-kpugi-blue hover:underline flex items-center gap-1">
            <span>Explore All Briefs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recommendedCampaigns && data.recommendedCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.recommendedCampaigns.map((camp: any) => (
              <Link
                key={camp.id}
                href={`/browse/${camp.id}`}
                className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-4 hover:border-kpugi-blue/40 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {camp.company_logo ? (
                      <img
                        src={camp.company_logo}
                        alt={camp.company_name || camp.title}
                        className="w-10 h-10 rounded-2xl object-cover border border-kpugi-border shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-kpugi-ink text-white font-bold text-sm flex items-center justify-center uppercase shrink-0">
                        {(camp.company_name || camp.title).charAt(0)}
                      </div>
                    )}

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {camp.ad_format || 'POST'}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base text-kpugi-ink mb-1 group-hover:text-kpugi-blue transition-colors line-clamp-1">
                    {camp.title}
                  </h4>
                  <p className="font-sans text-xs text-kpugi-slate mb-3">
                    {camp.company_name || 'Brand Partner'}
                  </p>

                  <div className="flex items-center gap-1.5">
                    {(camp.channels || ['tiktok', 'instagram']).map((platform: string) => (
                      <PlatformBadge key={platform} platform={platform} />
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-kpugi-border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-sans text-[10px] font-bold uppercase text-kpugi-slate block">CPM RATE</span>
                    <span className="font-mono font-extrabold text-kpugi-blue text-sm">
                      {formatCompactCurrency(camp.cpm_rate || 0)} / 1k
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-sans text-[10px] font-bold uppercase text-kpugi-slate block">MIN THRESHOLD</span>
                    <span className="font-mono font-bold text-kpugi-ink">
                      {(camp.min_view_threshold || 1000).toLocaleString()} views
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-kpugi-border text-center space-y-3">
            <Layers className="w-8 h-8 text-kpugi-slate mx-auto" />
            <p className="font-sans text-sm text-kpugi-slate">
              No new recommended briefs found right now. Check back soon or view all active campaigns.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-kpugi-blue hover:underline"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────
         8. COMPACT RECENT FINANCIAL SETTLEMENTS FEED
      ───────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-xl text-kpugi-ink">
              Recent Financial Settlements
            </h3>
            <p className="font-sans text-xs text-kpugi-slate mt-0.5">
              Direct escrow clearances and automated view audit payouts.
            </p>
          </div>

          <Link
            href="/c/wallet"
            className="text-xs font-bold text-kpugi-blue hover:underline flex items-center gap-1"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recentSettlements && data.recentSettlements.length > 0 ? (
          <div className="divide-y divide-kpugi-border/60">
            {data.recentSettlements.map((settlement: any) => (
              <div
                key={settlement.id}
                className="py-3.5 flex items-center justify-between gap-4 text-xs font-sans hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                    ⚡
                  </div>
                  <div>
                    <span className="font-bold text-kpugi-ink block">
                      {settlement.campaignTitle}
                    </span>
                    <span className="text-[11px] text-kpugi-slate">
                      {settlement.viewsDelta > 0 ? `+${settlement.viewsDelta.toLocaleString()} verified views audited` : 'View audit milestone reached'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-extrabold text-emerald-600 text-sm">
                    +{formatCompactCurrency(settlement.payoutAmount || 0)}
                  </div>
                  <span className="text-[10px] text-kpugi-slate block">
                    {new Date(settlement.settledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-100">
            <p className="font-sans text-xs text-kpugi-slate">
              No recent audit settlements recorded yet. Payouts clear automatically into your available balance hourly as verified view milestones are achieved.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
