'use client';

import React from 'react';
import Link from 'next/link';
import { AdvertiserDashboardData } from '@/lib/supabase/dashboard';

interface AdvertiserDashboardProps {
  companyName: string;
  data: AdvertiserDashboardData;
}

export default function AdvertiserDashboardView({ companyName, data }: AdvertiserDashboardProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-8 text-kpugi-ink">
      
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-kpugi-ink via-[#111936] to-[#0B1026] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="font-sans inline-block px-3 py-1 rounded-full bg-kpugi-blue/20 text-kpugi-blue text-xs font-bold uppercase tracking-wider mb-3">
            BRAND CONSOLE
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-4xl text-white mb-2">
            Welcome, {companyName} 👋
          </h1>
          <p className="font-sans text-white/70 text-sm max-w-lg">
            Create performance campaigns, upload ready-made video/image creative, and pay creators per verified 1,000 views.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Link
            href="/campaigns/new"
            className="font-sans inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-kpugi-blue hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-kpugi-blue/30 transition-all transform hover:-translate-y-0.5"
          >
            + Create New Campaign
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm">
          <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider block mb-2">Active Campaigns</span>
          <div className="font-mono font-bold text-3xl text-kpugi-ink">{data.activeCampaigns}</div>
          <span className="font-sans text-xs text-kpugi-slate mt-1 block">Live & budget-committed</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm">
          <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider block mb-2">Funding Balance</span>
          <div className="font-mono font-bold text-3xl text-kpugi-ink">
            ₦{data.walletBalance.toLocaleString('en-US')}
          </div>
          <span className="font-sans text-xs text-kpugi-slate mt-1 block">Held securely in Escrow</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm">
          <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider block mb-2">Total Budget Spent</span>
          <div className="font-mono font-bold text-3xl text-kpugi-ink">
            ₦{data.totalSpent.toLocaleString('en-US')}
          </div>
          <span className="font-sans text-xs text-kpugi-slate mt-1 block">For audited creator placements</span>
        </div>

      </div>

      {/* Campaigns Listing */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-kpugi-ink">
            Your Campaign History
          </h3>
          <Link
            href="/campaigns"
            className="font-sans text-xs font-bold text-kpugi-blue hover:text-blue-700"
          >
            View All Campaigns →
          </Link>
        </div>

        <div className="overflow-x-auto">
          {data.campaigns.length > 0 ? (
            <table className="table table-zebra w-full text-xs font-sans">
              <thead>
                <tr className="border-b border-kpugi-border text-kpugi-slate uppercase text-[10px] tracking-wider font-bold">
                  <th>CAMPAIGN TITLE</th>
                  <th>FORMAT</th>
                  <th>CPM RATE</th>
                  <th>TOTAL BUDGET</th>
                  <th>SPENT</th>
                  <th className="text-right">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {data.campaigns.map((camp) => (
                  <tr key={camp.id} className="border-b border-kpugi-border/60">
                    <td className="py-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-kpugi-ink">{camp.title}</span>
                        {camp.campaign_code && (
                          <span className="font-mono text-[9px] text-kpugi-blue font-bold tracking-wider uppercase mt-0.5">
                            {camp.campaign_code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="font-mono uppercase">{camp.ad_format}</td>
                    <td className="font-mono">₦{Number(camp.cpm_rate).toLocaleString()}/cpm</td>
                    <td className="font-mono font-bold">₦{Number(camp.total_budget).toLocaleString()}</td>
                    <td className="font-mono text-kpugi-slate">₦{Number(camp.spent_budget).toLocaleString()}</td>
                    <td className="text-right">
                      <span className={`badge badge-sm font-bold uppercase ${
                        camp.status === 'live'
                          ? 'badge-success text-white'
                          : camp.status === 'funding_pending'
                          ? 'badge-warning text-white'
                          : 'badge-neutral text-white'
                      }`}>
                        {camp.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="font-sans text-sm text-kpugi-slate">You haven&apos;t created any campaigns yet.</p>
              <Link href="/campaigns/new" className="font-sans text-xs text-kpugi-blue font-bold mt-2 inline-block hover:underline">
                Create your first brief now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm">
        <h3 className="font-display font-bold text-xl text-kpugi-ink mb-4">
          Quick Launch Workflow
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-kpugi-paper border border-kpugi-border">
            <div className="w-8 h-8 rounded-xl bg-kpugi-blue/10 text-kpugi-blue flex items-center justify-center font-bold text-sm mb-3">1</div>
            <h4 className="font-bold text-sm text-kpugi-ink mb-1 font-sans">Create Campaign Brief</h4>
            <p className="text-xs text-kpugi-slate font-sans">Upload ad copy, video/image media, and set target CPM rate.</p>
          </div>

          <div className="p-5 rounded-2xl bg-kpugi-paper border border-kpugi-border">
            <div className="w-8 h-8 rounded-xl bg-kpugi-blue/10 text-kpugi-blue flex items-center justify-center font-bold text-sm mb-3">2</div>
            <h4 className="font-bold text-sm text-kpugi-ink mb-1 font-sans">Fund Escrow</h4>
            <p className="text-xs text-kpugi-slate font-sans">Deposit campaign budget via Paystack so your campaign flips live.</p>
          </div>

          <div className="p-5 rounded-2xl bg-kpugi-paper border border-kpugi-border">
            <div className="w-8 h-8 rounded-xl bg-kpugi-blue/10 text-kpugi-blue flex items-center justify-center font-bold text-sm mb-3">3</div>
            <h4 className="font-bold text-sm text-kpugi-ink mb-1 font-sans">Automated View Verification</h4>
            <p className="text-xs text-kpugi-slate font-sans">Creators post your brief; views are verified automatically by scrapers.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
