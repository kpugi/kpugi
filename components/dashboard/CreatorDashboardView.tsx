'use client';

import React from 'react';
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
  Bell,
  ArrowRight,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';
import { CreatorDashboardData } from '@/lib/supabase/dashboard';
import { PlatformBadge } from '@/components/ui/SocialIcons';
import { formatCompactCurrency } from '@/lib/utils/format';
import CreatorLevelBadge from '@/components/creator/CreatorLevelBadge';

interface CreatorDashboardProps {
  displayName: string;
  data: CreatorDashboardData;
}

export default function CreatorDashboardView({ displayName, data }: CreatorDashboardProps) {
  const featuredSub = data.submissions.find((sub) => sub.status === 'pending') || data.submissions[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink">
      {/* Top Greeting Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-kpugi-ink via-slate-900 to-kpugi-blue text-white shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {displayName}! 👋
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-300 max-w-xl">
              Track your joined campaigns, monitor view count payouts in real time, and manage your cleared earnings.
            </p>
          </div>

          <div className="flex items-center justify-end shrink-0 self-end sm:self-end">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-kpugi-ink font-sans text-xs font-bold hover:bg-slate-100 transition-all shadow-md"
            >
              <Compass className="w-4 h-4 text-kpugi-blue" />
              <span>Explore Campaigns</span>
            </Link>
          </div>
        </div>

        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-kpugi-blue/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KYC Verification Reminder Banner (Shown if kycStatus !== 'verified') */}
      {data.kycStatus !== 'verified' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              🛡️
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>ID Verification Required</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                  {data.kycStatus === 'pending' ? 'Verification Pending' : 'Action Needed'}
                </span>
              </h3>
              <p className="font-sans text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                To protect campaign payouts and comply with platform regulations, creators must verify their official government ID (NIN, Voter Card, or Passport) before requesting withdrawals.
              </p>
            </div>
          </div>

          <Link
            href="/settings"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 self-start sm:self-center"
          >
            <span>Complete Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Creator Level & Star Rank Widget */}
      <CreatorLevelBadge totalEarned={data.totalEarned || 0} variant="widget" />

      {/* At a Glance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Total Earnings */}
        <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider">Total Earnings</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="font-mono font-bold text-2xl sm:text-3xl text-kpugi-ink">
            {formatCompactCurrency(data.totalEarned || 0)}
          </div>
          <span className="font-sans text-[11px] text-kpugi-slate mt-1 block">Accumulated payout history</span>
        </div>

        {/* Card 2: Active Audits */}
        <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider">Active Audits</span>
            <Radio className="w-5 h-5 text-amber-500" />
          </div>
          <div className="font-mono font-bold text-2xl sm:text-3xl text-kpugi-ink">
            {data.activeSubmissions}
          </div>
          <span className="font-sans text-[11px] text-kpugi-slate mt-1 block">Posts currently being verified</span>
        </div>

        {/* Card 3: Available Balance */}
        <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider">Available Balance</span>
            <CreditCard className="w-5 h-5 text-kpugi-blue" />
          </div>
          <div className="font-mono font-bold text-2xl sm:text-3xl text-kpugi-blue">
            {formatCompactCurrency(data.walletBalance || 0)}
          </div>
          <span className="font-sans text-[11px] text-kpugi-slate mt-1 block">Cleared creator earnings</span>
        </div>
      </div>

      {/* Main Hero Card (Separated from top element by divider) */}
      <div className="pt-6 border-t border-kpugi-border/60">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between gap-6">
            {featuredSub ? (
              <>
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      {featuredSub.campaign.company_logo ? (
                        <img
                          src={featuredSub.campaign.company_logo}
                          alt={featuredSub.campaign.company_name || featuredSub.campaign.title}
                          className="w-12 h-12 rounded-2xl object-cover border border-kpugi-border shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-kpugi-ink text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                          {(featuredSub.campaign.company_name || featuredSub.campaign.title).charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h3 className="font-display font-bold text-xl sm:text-2xl text-kpugi-ink leading-tight">
                          {featuredSub.campaign.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="font-sans text-xs font-semibold text-kpugi-slate flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              featuredSub.status === 'paid' || featuredSub.status === 'completed'
                                ? 'bg-emerald-500'
                                : 'bg-kpugi-blue animate-pulse'
                            }`} />
                            {featuredSub.status === 'paid' || featuredSub.status === 'completed'
                              ? 'Campaign Completed'
                              : 'Auditing Milestones...'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-2xl sm:text-3xl text-kpugi-blue">
                        {formatCompactCurrency(Number(featuredSub.payout_amount || featuredSub.reserved_amount || 0))}
                      </div>
                      <span className="font-sans text-[10px] font-bold text-kpugi-slate uppercase tracking-wider block">
                        {featuredSub.status === 'paid' || featuredSub.status === 'completed' ? 'EARNED AMOUNT' : 'RESERVED PAYOUT'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar based on views / threshold */}
                  {(() => {
                    const currentViews = featuredSub.final_view_count || 0;
                    const threshold = featuredSub.campaign.min_view_threshold || 1;
                    const pct = Math.min(100, Math.round((currentViews / threshold) * 100));
                    const isGoalReached = pct >= 100;

                    return (
                      <div className="mt-6 p-4 rounded-2xl bg-kpugi-paper border border-kpugi-border space-y-3">
                        <div className="flex items-center justify-between font-sans text-xs font-bold">
                          <span className="text-kpugi-ink flex items-center gap-1.5">
                            <span> View Threshold</span>
                            {isGoalReached && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Goal Reached
                              </span>
                            )}
                          </span>
                          <span className={`font-mono ${isGoalReached ? 'text-emerald-600' : 'text-kpugi-blue'}`}>
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

                        <div className="flex items-center justify-between font-sans text-[11px] font-medium text-kpugi-slate pt-1 flex-wrap gap-2">
                          <span>Submitted: {new Date(featuredSub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          {featuredSub.post_url && (
                            <a
                              href={featuredSub.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-kpugi-blue hover:underline inline-flex items-center gap-1"
                            >
                              <span>View Submitted Post</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <span>Format: <span className="uppercase font-mono font-bold text-kpugi-ink">{featuredSub.campaign.ad_format}</span></span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Social Platform Badges & Submit Link CTA */}
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

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <Link
                      href={`/campaigns/${featuredSub.campaign.id}`}
                      className="font-sans flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-kpugi-blue hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-kpugi-blue/20 transition-all transform hover:-translate-y-0.5"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>{featuredSub.post_url ? 'Open Workspace' : 'Submit Video Link'}</span>
                    </Link>

                    <Link
                      href="/browse"
                      className="font-sans inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-kpugi-paper hover:bg-slate-200 text-kpugi-slate font-bold text-xs border border-kpugi-border transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Explore More</span>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 my-auto">
                <Sparkles className="w-10 h-10 text-kpugi-blue" />
                <div>
                  <h3 className="font-display font-bold text-xl text-kpugi-ink">
                    Welcome to Kpugi, {displayName}!
                  </h3>
                  <p className="font-sans text-sm text-kpugi-slate mt-1 max-w-sm">
                    You haven&apos;t submitted any campaign posts yet. Connect your accounts and find open sponsorships to start earning.
                  </p>
                </div>
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-kpugi-blue hover:bg-blue-700 text-white font-sans font-bold text-xs shadow-lg shadow-kpugi-blue/25 transition-all"
                >
                  <span>Find Campaigns</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar Payout & Submission Rules Guide */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
              <h4 className="font-display font-bold text-sm text-kpugi-ink uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-kpugi-blue" />
                Payout & Submission Rules
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                  <span className="font-bold text-kpugi-blue block flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    1,000 Minimum Views
                  </span>
                  <p className="text-kpugi-slate text-[11px] leading-relaxed">
                    Submissions require at least 1,000 verified public views to clear CPM earnings.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="font-bold text-kpugi-ink block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    72-Hour Public Retention
                  </span>
                  <p className="text-kpugi-slate text-[11px] leading-relaxed">
                    Submitted posts must remain active and public for a minimum of 72 hours.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                  <span className="font-bold text-emerald-700 block flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    Direct Bank Payouts
                  </span>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    Cleared earnings are transferred directly into your verified Nigerian bank account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         MIDDLE ROW: YOUR JOINED CAMPAIGN CARDS
      ───────────────────────────────────────────────────── */}
      <div className="pt-6 border-t border-kpugi-border/60 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xl text-kpugi-ink">Your Campaigns</h3>
          <Link href="/campaigns" className="text-xs font-bold text-kpugi-blue hover:underline flex items-center gap-1">
            <span>View All Campaigns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.submissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.submissions.slice(0, 3).map((sub) => (
              <Link
                key={sub.id}
                href={`/campaigns/${sub.campaign.id}`}
                className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-4 hover:border-kpugi-blue/40 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {sub.campaign.company_logo ? (
                      <img
                        src={sub.campaign.company_logo}
                        alt={sub.campaign.company_name || sub.campaign.title}
                        className="w-10 h-10 rounded-2xl object-cover border border-kpugi-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-kpugi-ink text-white font-bold text-sm flex items-center justify-center uppercase shrink-0">
                        {(sub.campaign.company_name || sub.campaign.title).charAt(0)}
                      </div>
                    )}

                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      sub.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {sub.status === 'pending' ? 'JOINED' : sub.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base text-kpugi-ink mb-1 group-hover:text-kpugi-blue transition-colors truncate">
                    {sub.campaign.title}
                  </h4>
                  <p className="font-sans text-xs text-kpugi-slate mb-4">
                    Min Threshold: {sub.campaign.min_view_threshold.toLocaleString()} views
                  </p>
                </div>

                <div className="pt-4 border-t border-kpugi-border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-sans text-[10px] font-bold uppercase text-kpugi-slate block">RESERVED</span>
                    <span className="font-mono font-bold text-kpugi-blue">
                      {formatCompactCurrency(sub.reserved_amount || 0)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-sans text-[10px] font-bold uppercase text-kpugi-slate block">SUBMITTED</span>
                    <span className="font-sans font-bold text-kpugi-ink">
                      {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-kpugi-border text-center">
            <p className="font-sans text-sm text-kpugi-slate">No campaigns joined yet.</p>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────
         BOTTOM ROW: MILESTONE AUDIT LOG TABLE
      ───────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xl text-kpugi-ink">
            Milestone Audit Log
          </h3>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 font-sans">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Scraper Active
          </span>
        </div>

        <div className="overflow-x-auto">
          {data.submissions.length > 0 ? (
            <table className="table table-zebra w-full text-xs font-sans">
              <thead>
                <tr className="border-b border-kpugi-border text-kpugi-slate uppercase text-[10px] tracking-wider font-bold">
                  <th>BRAND CAMPAIGN</th>
                  <th>VERIFIED VIEW VALUE</th>
                  <th>RESERVED PAYOUT</th>
                  <th>SUBMITTED DATE</th>
                  <th className="text-right">AUDIT STATUS</th>
                </tr>
              </thead>
              <tbody>
                {data.submissions.map((sub) => (
                  <tr key={sub.id} className="border-b border-kpugi-border/60">
                    <td className="font-bold text-kpugi-ink flex items-center gap-2.5 py-3.5">
                      {sub.campaign.company_logo ? (
                        <img
                          src={sub.campaign.company_logo}
                          alt={sub.campaign.company_name || sub.campaign.title}
                          className="w-7 h-7 rounded-full object-cover border border-kpugi-border shrink-0"
                        />
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-kpugi-ink text-white text-[10px] font-bold flex items-center justify-center uppercase shrink-0">
                          {(sub.campaign.company_name || sub.campaign.title).charAt(0)}
                        </span>
                      )}
                      <span>{sub.campaign.title}</span>
                    </td>
                    <td className="font-mono font-bold text-kpugi-ink">
                      {sub.final_view_count !== null ? `${sub.final_view_count.toLocaleString()} Views` : 'Audit Pending'}
                    </td>
                    <td className="font-mono font-bold text-kpugi-blue">
                      {formatCompactCurrency(sub.reserved_amount || 0)}
                    </td>
                    <td className="text-kpugi-slate">
                      {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="text-right">
                      <span className={`badge badge-sm font-bold gap-1 ${
                        sub.status === 'pending'
                          ? 'badge-warning text-white'
                          : sub.status === 'verified_pass' || sub.status === 'paid'
                          ? 'badge-success text-white'
                          : 'badge-error text-white'
                      }`}>
                        {sub.status === 'pending' ? '⏳ Audit Pending' : `✓ ${sub.status.replace(/_/g, ' ').toUpperCase()}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="font-sans text-sm text-kpugi-slate">Your submissions log is empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
