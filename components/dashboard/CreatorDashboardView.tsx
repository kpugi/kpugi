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
import { DashboardActionTodo } from '@/components/dashboard/DashboardActionTodo';
import OnboardingWelcomeModal from '@/components/onboarding/OnboardingWelcomeModal';
import OnboardingChecklistCard from '@/components/onboarding/OnboardingChecklistCard';
import { useKpugiTour } from '@/lib/tour/useKpugiTour';

interface CreatorDashboardProps {
  displayName: string;
  data: CreatorOverviewData;
}

export default function CreatorDashboardView({ displayName, data }: CreatorDashboardProps) {
  const { startTour, hasCompletedTour, isLoading: isTourLoading } = useKpugiTour({ role: 'creator' });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (!isTourLoading && !hasCompletedTour) {
      const dismissed = sessionStorage.getItem('kpugi_welcome_dismissed_creator');
      if (!dismissed) {
        setShowWelcomeModal(true);
      }
    }
  }, [isTourLoading, hasCompletedTour]);

  const handleStartTour = () => {
    setShowWelcomeModal(false);
    sessionStorage.setItem('kpugi_welcome_dismissed_creator', 'true');
    setTimeout(() => {
      startTour();
    }, 250);
  };

  const handleDismissWelcome = () => {
    setShowWelcomeModal(false);
    sessionStorage.setItem('kpugi_welcome_dismissed_creator', 'true');
  };

  const featuredSub = data.submissions.find((sub) => sub.status === 'pending' || sub.status === 'under_review') || data.submissions[0];
  const hasActiveCampaign = !!featuredSub;

  const pendingPostSubmissions = (data.submissions || [])
    .filter((s) => (!s.post_url || s.post_url.trim() === '') && (s.status === 'joined' || s.status === 'pending' || s.status === 'reserved'))
    .map((s) => ({
      id: s.id,
      campaignId: s.campaign?.id || '',
      campaignTitle: s.campaign?.title || 'Brand Campaign',
    }))
    .filter((s) => Boolean(s.campaignId));

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

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink dark:text-white font-sans pb-12 transition-colors duration-200">
      
      {/* Welcome Celebration Modal (First-time visit) */}
      <OnboardingWelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleDismissWelcome}
        onStartTour={handleStartTour}
        role="creator"
        displayName={displayName}
      />

      {/* ─────────────────────────────────────────────────────
         1. TOP GREETING BANNER
      ───────────────────────────────────────────────────── */}
      <div
        id="tour-creator-overview-greeting"
        className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-kpugi-ink via-slate-900 to-kpugi-blue text-white shadow-xl border border-slate-800"
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="space-y-2">
          
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {displayName}! 👋
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Track your live campaigns, watch your hourly view counts grow, and receive guaranteed Friday bank payouts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-end">
            <Link
              href="/browse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-kpugi-ink font-sans text-xs font-bold hover:bg-slate-100 transition-all shadow-md active:scale-95"
            >
              <Compass className="w-4 h-4 text-kpugi-blue" />
              <span>Browse Campaigns</span>
            </Link>
          </div>
        </div>

        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-kpugi-blue/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ─────────────────────────────────────────────────────
         ONBOARDING SETUP QUEST / CHECKLIST WIDGET
      ───────────────────────────────────────────────────── */}
      <OnboardingChecklistCard
        role="creator"
        onStartTour={handleStartTour}
        initialState={{
          creator_profile: true,
          creator_browse: (data.submissions?.length || 0) > 0,
          creator_first_submission: (data.submissions?.length || 0) > 0,
          creator_bank: (data.walletBalance || 0) > 0 || (data.totalEarned || 0) > 0,
        }}
      />

      {/* ─────────────────────────────────────────────────────
         2. ACTION CENTER (TO-DO WIDGET)
      ───────────────────────────────────────────────────── */}
      <DashboardActionTodo
        role="creator"
        kycStatus={data.kycStatus}
        unreviewedCampaigns={data.unreviewedCompletedCampaigns}
        pendingPostSubmissions={pendingPostSubmissions}
      />

      {/* ─────────────────────────────────────────────────────
         3. CREATOR LEVEL & RANK WIDGET
      ───────────────────────────────────────────────────── */}
      <CreatorLevelBadge totalEarned={data.totalEarned || 0} variant="widget" />

      {/* ─────────────────────────────────────────────────────
         4. TOP 4-COLUMN LIVE METRIC PULSE
      ───────────────────────────────────────────────────── */}
      <div id="tour-creator-hourly-timer" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Available Balance */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4 hover:border-kpugi-blue/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">Available Balance</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-kpugi-blue dark:text-blue-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono font-extrabold text-2xl sm:text-3xl text-kpugi-blue dark:text-blue-400">
              {formatCompactCurrency(data.walletBalance || 0)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-kpugi-border/60 dark:border-white/10">
              <span className="font-sans text-[11px] text-kpugi-slate dark:text-slate-400">Cleared creator funds</span>
              <Link
                href="/c/wallet"
                className="text-[11px] font-bold text-kpugi-blue dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                <span>Withdraw</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Active Post Audits */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">Active Post Audits</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="font-mono font-extrabold text-2xl sm:text-3xl text-kpugi-ink dark:text-white flex items-baseline gap-2">
              <span>{data.activeSubmissions}</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-kpugi-border/60 dark:border-white/10">
              <span className="font-sans text-[11px] text-kpugi-slate dark:text-slate-400">Posts in daily cycle</span>
              <Link
                href="/c/submissions"
                className="text-[11px] font-bold text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white hover:underline flex items-center gap-0.5"
              >
                <span>Details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Today's Audited Views */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">
              {Number(data.todayAccrual || 0) > 0 ? "Today's Views" : "Views"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono font-extrabold text-2xl sm:text-3xl text-kpugi-ink dark:text-white">
              {(Number(data.todayViews || 0) > 0 ? Number(data.todayViews) : Number(data.totalVerifiedViews || 0)).toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-kpugi-border/60 dark:border-white/10">
              <span className="font-sans text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {Number(data.todayAccrual || 0) > 0 ? "Live in today's cycle" : "Verified public reach"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Today's Earnings / Total Earnings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">
              {Number(data.todayAccrual || 0) > 0 ? "Today's Earnings" : "Total Earnings"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono font-extrabold text-2xl sm:text-3xl text-kpugi-ink dark:text-white">
              {Number(data.todayAccrual || 0) > 0
                ? `+₦${Number(data.todayAccrual).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
                : formatCompactCurrency(data.totalEarned || 0)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-kpugi-border/60 dark:border-white/10">
              <span className="font-sans text-[11px] text-kpugi-slate dark:text-slate-400 truncate max-w-[150px]">
                {Number(data.todayAccrual || 0) > 0 ? "24h escrow at midnight" : "Accumulated lifetime"}
              </span>
              <Link
                href="/c/wallet"
                className="text-[11px] font-bold text-kpugi-blue dark:text-blue-400 hover:underline flex items-center gap-0.5 shrink-0"
              >
                <span>Wallet</span>
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
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col justify-between gap-6">
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
                          className="w-14 h-14 rounded-2xl object-cover border border-kpugi-border dark:border-white/10 shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-kpugi-ink dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                          {(featuredSub.campaign.title || featuredSub.campaign.company_name || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-kpugi-blue dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-[10px] font-bold uppercase font-mono tracking-wider">
                            {featuredSub.campaign.ad_format || 'POST'}
                          </span>
                          <span className="font-sans text-xs text-kpugi-slate dark:text-slate-400 font-medium">
                            {featuredSub.campaign.company_name}
                          </span>
                        </div>

                        <h3 className="font-display font-extrabold text-xl sm:text-2xl text-kpugi-ink dark:text-white leading-snug">
                          {featuredSub.campaign.title}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-extrabold text-2xl sm:text-3xl text-kpugi-blue dark:text-blue-400">
                        {(() => {
                          const v = featuredSub.final_view_count || 0;
                          const thresh = featuredSub.campaign.min_view_threshold || 1000;
                          const cpm = featuredSub.campaign.cpm_rate || 0;
                          const totalBudget = Number(featuredSub.campaign.total_budget || 0);
                          const maxPoolCap = totalBudget > 0 ? totalBudget * 0.25 : Infinity;

                          // DB accrued amount (already verified and capped at 25% pool cap by settlement engine)
                          const dbAccrued = Number(featuredSub.payout_amount || 0) + Number(featuredSub.pending_payout_amount || 0);

                          // Fallback views-based calculation strictly capped at 25% pool max
                          const rawViewsAmt = v >= thresh && cpm > 0 ? Math.floor((v / 1000) * cpm) : 0;
                          const viewsAmt = Math.min(rawViewsAmt, maxPoolCap);

                          const totalAmt = dbAccrued > 0 
                            ? dbAccrued 
                            : Math.min(
                                Math.max(viewsAmt, Number(featuredSub.reserved_amount || 0)),
                                maxPoolCap
                              );

                          return formatCompactCurrency(totalAmt);
                        })()}
                      </div>
                      <span className="font-sans text-[10px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider block">
                        {featuredSub.status === 'paid' || featuredSub.status === 'completed' ? 'Cleared Payout' : 'Earned'}
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
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-4">
                        {/* View Progress Metric */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between font-sans text-xs font-bold">
                            <span className="text-kpugi-ink dark:text-white flex items-center gap-1.5">
                              <span>View Threshold</span>
                              {isGoalReached && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  Threshold Met
                                </span>
                              )}
                            </span>
                            <span className={`font-mono ${isGoalReached ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-kpugi-blue dark:text-blue-400 font-bold'}`}>
                              {currentViews.toLocaleString()} / {threshold.toLocaleString()} Views ({pct}%)
                            </span>
                          </div>

                          <div className="w-full bg-slate-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isGoalReached ? 'bg-emerald-500' : 'bg-kpugi-blue'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Metadata Footer: Submitted Link, Rate & 25% Cap */}
                        <div className="flex items-center justify-between font-sans text-[11px] font-medium text-kpugi-slate dark:text-slate-400 pt-1 flex-wrap gap-2">
                          <span>Rate: <strong className="text-kpugi-ink dark:text-white font-mono">{formatCompactCurrency(featuredSub.campaign.cpm_rate)} / 1k</strong></span>
                          
                          {maxPoolCap > 0 && (
                            <span className="text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-500/20 font-mono text-[10px]">
                              🛡️ 25% Pool Cap: {formatCompactCurrency(maxPoolCap)} max
                            </span>
                          )}

                          {featuredSub.post_url && (
                            <a
                              href={featuredSub.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-kpugi-blue dark:text-blue-400 hover:underline inline-flex items-center gap-1 ml-auto"
                            >
                              <span>View Post</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Social Platform Badges & Direct Workspace Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-kpugi-border dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider mr-1">Platforms:</span>
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
                      <span>{featuredSub.post_url ? 'Open Workspace' : 'Submit Post Link'}</span>
                    </Link>

                    <Link
                      href="/browse"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-kpugi-paper dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-kpugi-slate dark:text-slate-300 font-bold text-xs border border-kpugi-border dark:border-white/10 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>More Briefs</span>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 my-auto">
                <div className="w-14 h-14 rounded-3xl bg-blue-50 dark:bg-blue-500/10 text-kpugi-blue dark:text-blue-400 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-kpugi-ink dark:text-white">
                    No Active Post Audits Running
                  </h3>
                  <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
                    You don&apos;t have any active campaigns under view verification. Explore verified advertiser briefs to reserve your budget slot.
                  </p>
                </div>
                <Link
                  href="/browse"
                  target="_blank"
                  rel="noopener noreferrer"
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
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-sm text-kpugi-ink dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-kpugi-blue dark:text-blue-400" />
                Payout & Audit Protocol
              </h4>

              <div className="space-y-3 text-xs font-sans">
                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 space-y-1">
                  <span className="font-bold text-kpugi-blue dark:text-blue-400 block flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    1,000 Minimum View Threshold
                  </span>
                  <p className="text-kpugi-slate dark:text-slate-300 text-[11px] leading-relaxed">
                    Submissions require at least 1,000 verified public views to clear CPM earnings from escrow.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                  <span className="font-bold text-kpugi-ink dark:text-white block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    72-Hour Public Retention
                  </span>
                  <p className="text-kpugi-slate dark:text-slate-300 text-[11px] leading-relaxed">
                    Submitted posts (videos, images, or text) must remain active and publicly accessible for 72 hours.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 space-y-1">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Direct Bank Settlements
                  </span>
                  <p className="text-emerald-900/80 dark:text-slate-300 text-[11px] leading-relaxed">
                    Cleared earnings are transferred directly into your verified Nigerian bank account via Paystack.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>


      {/* ─────────────────────────────────────────────────────
         7. CURATED HIGH-CPM BRIEFS BENTO
      ───────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-kpugi-border/60 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-xl text-kpugi-ink dark:text-white">
              Recommended High-CPM Campaigns
            </h3>
            <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400 mt-0.5">
              Curated active campaigns with guaranteed escrow funding ready for placement.
            </p>
          </div>
          <Link href="/browse" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-kpugi-blue dark:text-blue-400 hover:underline flex items-center gap-1">
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recommendedCampaigns && data.recommendedCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.recommendedCampaigns.map((camp: any) => (
              <Link
                key={camp.id}
                href={`/browse/${camp.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-4 hover:border-kpugi-blue/40 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {camp.company_logo ? (
                      <img
                        src={camp.company_logo}
                        alt={camp.company_name || camp.title}
                        className="w-10 h-10 rounded-2xl object-cover border border-kpugi-border dark:border-white/10 shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-kpugi-ink dark:bg-white text-white dark:text-black font-bold text-sm flex items-center justify-center uppercase shrink-0">
                        {(camp.company_name || camp.title).charAt(0)}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-500/10 text-kpugi-blue dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{camp.match_score || (85 + (camp.title.length % 12))}% Match</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        {camp.ad_format || 'POST'}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-display font-bold text-base text-kpugi-ink dark:text-white mb-1 group-hover:text-kpugi-blue dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {camp.title}
                  </h4>
                  <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400 mb-3">
                    {camp.company_name || 'Brand Partner'}
                  </p>

                  <div className="flex items-center gap-1.5">
                    {(camp.channels || ['tiktok', 'instagram']).map((platform: string) => (
                      <PlatformBadge key={platform} platform={platform} />
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-kpugi-border dark:border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-sans text-[10px] font-bold uppercase text-kpugi-slate dark:text-slate-400 block">CPM RATE</span>
                    <span className="font-mono font-extrabold text-kpugi-blue dark:text-blue-400 text-sm">
                      {formatCompactCurrency(camp.cpm_rate || 0)} / 1k
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-sans text-[10px] font-bold uppercase text-kpugi-slate dark:text-slate-400 block">MIN THRESHOLD</span>
                    <span className="font-mono font-bold text-kpugi-ink dark:text-white">
                      {(camp.min_view_threshold || 1000).toLocaleString()} views
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 text-center space-y-3">
            <Layers className="w-8 h-8 text-kpugi-slate dark:text-slate-400 mx-auto" />
            <p className="font-sans text-sm text-kpugi-slate dark:text-slate-400">
              No new recommended briefs found right now. Check back soon or view all active campaigns.
            </p>
            <Link
              href="/browse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-kpugi-blue dark:text-blue-400 hover:underline"
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
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-xl text-kpugi-ink dark:text-white">
              Recent Runs
            </h3>
            <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400 mt-0.5">
              Direct payout clearances and automated view audits
            </p>
          </div>

          <Link
            href="/c/wallet"
            className="text-xs font-bold text-kpugi-blue dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View Runs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recentSettlements && data.recentSettlements.length > 0 ? (
          <div className="divide-y divide-kpugi-border/60 dark:divide-white/10">
            {data.recentSettlements.map((settlement: any) => (
              <div
                key={settlement.id}
                className="py-3.5 flex items-center justify-between gap-4 text-xs font-sans hover:bg-slate-50/60 dark:hover:bg-white/[0.03] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                    ⚡
                  </div>
                  <div>
                    <span className="font-bold text-kpugi-ink dark:text-white block">
                      {settlement.campaignTitle}
                    </span>
                    <span className="text-[11px] text-kpugi-slate dark:text-slate-400">
                      {settlement.viewsDelta > 0 ? `+${settlement.viewsDelta.toLocaleString()} verified views audited` : 'View audit milestone reached'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    +{formatCompactCurrency(settlement.payoutAmount || 0)}
                  </div>
                  <span className="text-[10px] text-kpugi-slate dark:text-slate-400 block">
                    {new Date(settlement.settledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
            <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400">
              No recent audit settlements recorded yet. Payouts clear automatically into your available balance hourly as verified view milestones are achieved.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
