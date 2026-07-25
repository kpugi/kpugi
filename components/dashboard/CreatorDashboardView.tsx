'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreatorDashboardData } from '@/lib/supabase/dashboard';

interface CreatorDashboardProps {
  displayName: string;
  data: CreatorDashboardData;
}

export default function CreatorDashboardView({ displayName, data }: CreatorDashboardProps) {
  // Determine primary active submission to feature in the Hero Card
  const featuredSub = data.submissions.find((sub) => sub.status === 'pending') || data.submissions[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink">
      
      {/* At a Glance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Total Earnings */}
        <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider">Total Earnings</span>
            <span className="text-lg">💰</span>
          </div>
          <div className="font-mono font-bold text-2xl sm:text-3xl text-kpugi-ink">
            ₦{data.totalEarned.toLocaleString('en-US')}
          </div>
          <span className="font-sans text-[11px] text-kpugi-slate mt-1 block">Accumulated payout history</span>
        </div>

        {/* Card 2: Active Audits */}
        <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider">Active Audits</span>
            <span className="text-lg">📡</span>
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
            <span className="text-lg">💳</span>
          </div>
          <div className="font-mono font-bold text-2xl sm:text-3xl text-kpugi-blue">
            ₦{data.walletBalance.toLocaleString('en-US')}
          </div>
          <span className="font-sans text-[11px] text-kpugi-slate mt-1 block">Cleared creator earnings</span>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────
         TOP ROW: MAIN HERO CARD & ESCROW BALANCE
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Hero Card (2 Cols) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between gap-6">
          {featuredSub ? (
            <>
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-kpugi-ink text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                      📢
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl sm:text-2xl text-kpugi-ink leading-tight">
                        {featuredSub.campaign.title}
                      </h3>
                      <span className="font-sans text-xs font-semibold text-kpugi-slate flex items-center gap-1.5 mt-1">
                        <span className={`w-2 h-2 rounded-full ${featuredSub.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                        {featuredSub.status === 'pending' ? 'Auditing Milestones...' : 'Campaign Completed'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-2xl sm:text-3xl text-kpugi-blue">
                      ₦{Number(featuredSub.payout_amount || featuredSub.reserved_amount).toLocaleString('en-US')}
                    </div>
                    <span className="font-sans text-[10px] font-bold text-kpugi-slate uppercase tracking-wider block">
                      {featuredSub.status === 'pending' ? 'RESERVED PAYOUT' : 'EARNED AMOUNT'}
                    </span>
                  </div>
                </div>

                {/* Progress bar based on views / threshold */}
                <div className="mt-6 p-4 rounded-2xl bg-kpugi-paper border border-kpugi-border space-y-3">
                  <div className="flex items-center justify-between font-sans text-xs font-bold">
                    <span className="text-kpugi-ink">Verification View Threshold</span>
                    <span className="text-kpugi-blue font-mono">
                      {featuredSub.final_view_count?.toLocaleString() || '0'} / {featuredSub.campaign.min_view_threshold.toLocaleString()} Views
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-kpugi-blue h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          ((featuredSub.final_view_count || 0) / featuredSub.campaign.min_view_threshold) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between font-sans text-[11px] font-medium text-kpugi-slate pt-1">
                    <span>Submitted: {new Date(featuredSub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>Format: <span className="uppercase font-mono">{featuredSub.campaign.ad_format}</span></span>
                  </div>
                </div>
              </div>

              {/* Social Platform Badges & Submit Link CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-kpugi-border">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider mr-1">Platforms:</span>
                  <span className="w-7 h-7 rounded-full bg-kpugi-paper border border-kpugi-border flex items-center justify-center font-sans text-[10px] font-bold text-kpugi-ink uppercase">
                    {featuredSub.campaign.ad_format === 'video' ? 'YT' : 'IG'}
                  </span>
                </div>

                <Link
                  href="/browse"
                  className="font-sans inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-kpugi-blue hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-kpugi-blue/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>🔥</span> Browse More Campaigns
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 my-auto">
              <span className="text-4xl">🚀</span>
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
                className="font-sans btn btn-primary btn-sm px-6 font-bold shadow-md shadow-kpugi-blue/20"
              >
                Find Campaigns
              </Link>
            </div>
          )}
        </div>

        {/* Escrow Balance Card & Recent Alerts (1 Col) */}
        <div className="space-y-6">
          
          {/* Escrow Card */}
          <div className="p-7 rounded-3xl bg-gradient-to-br from-kpugi-blue to-[#1e32ba] text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute right-4 top-4 opacity-15 text-white">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8s0 0 0 0z"/>
              </svg>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-sans text-[11px] font-bold text-white/80 uppercase tracking-widest">
                  ESCROW BALANCE
                </span>
                <span className="font-sans text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                  🛡️ SECURED
                </span>
              </div>

              <div className="font-mono font-bold text-3xl sm:text-4xl text-white mb-3 tracking-tight">
                ₦{data.walletBalance.toLocaleString('en-US')}
              </div>
            </div>

            <p className="font-sans text-xs text-white/80 leading-relaxed pt-3 border-t border-white/20">
              Funds are securely held in Kpugi Escrow until audit milestones are verified by scrapers.
            </p>
          </div>

          {/* Recent Alerts Box */}
          <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm">
            <h4 className="font-display font-bold text-sm text-kpugi-ink uppercase tracking-wider mb-4">
              Recent Alerts
            </h4>

            {data.recentNotifications.length > 0 ? (
              <div className="space-y-3 text-xs">
                {data.recentNotifications.map((notif) => (
                  <div key={notif.id} className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                    <span className="text-base text-kpugi-blue shrink-0">ℹ️</span>
                    <div>
                      <span className="font-sans font-bold text-kpugi-ink block capitalize">
                        {notif.knock_workflow_key.replace(/-/g, ' ')}
                      </span>
                      <p className="font-sans text-kpugi-slate mt-0.5">
                        {typeof notif.payload?.message === 'string' ? notif.payload.message : 'Notification received.'}
                      </p>
                      <span className="font-mono text-[9px] text-kpugi-slate/60 block mt-1">
                        {new Date(notif.sent_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="text-xl">🔔</span>
                <p className="font-sans text-xs text-kpugi-slate mt-1">No alerts or updates yet.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ─────────────────────────────────────────────────────
         MIDDLE ROW: 3 CAMPAIGN CARDS
      ───────────────────────────────────────────────────── */}
      <div>
        <h3 className="font-display font-bold text-lg text-kpugi-ink mb-5">Your Campaigns</h3>
        
        {data.submissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.submissions.slice(0, 3).map((sub) => (
              <div
                key={sub.id}
                className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-kpugi-blue flex items-center justify-center font-bold text-lg">
                      📡
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      sub.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {sub.status === 'pending' ? 'UNDER REVIEW' : sub.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-lg text-kpugi-ink mb-1 truncate">
                    {sub.campaign.title}
                  </h4>
                  <p className="font-sans text-xs text-kpugi-slate italic mb-6">
                    Min Threshold: {sub.campaign.min_view_threshold.toLocaleString()} views
                  </p>
                </div>

                <div className="pt-4 border-t border-kpugi-border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-sans text-[10px] font-bold uppercase text-kpugi-slate block">RESERVED</span>
                    <span className="font-mono font-bold text-kpugi-ink">
                      ₦{sub.reserved_amount.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-sans text-[10px] font-bold uppercase text-kpugi-slate block">SUBMITTED</span>
                    <span className="font-sans font-bold text-kpugi-ink">
                      {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
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
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm">
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-lg text-kpugi-ink">
            Milestone Audit Log
          </h3>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Scraper Active
          </span>
        </div>

        {/* DaisyUI Table */}
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
                    <td className="font-bold text-kpugi-ink flex items-center gap-2 py-3.5">
                      <span className="w-6 h-6 rounded-full bg-kpugi-ink text-white text-[10px] font-bold flex items-center justify-center uppercase">
                        {sub.campaign.title.slice(0, 1)}
                      </span>
                      {sub.campaign.title}
                    </td>
                    <td className="font-mono font-bold text-kpugi-ink">
                      {sub.final_view_count !== null ? `${sub.final_view_count.toLocaleString()} Views` : 'Audit Pending'}
                    </td>
                    <td className="font-mono font-bold text-kpugi-blue">
                      ₦{sub.reserved_amount.toLocaleString()}
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
