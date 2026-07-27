'use client';

import React from 'react';
import Link from 'next/link';
import { formatCompactCurrency } from '@/lib/utils/format';

interface AdvertiserCampaignsViewProps {
  campaigns: any[];
}

export default function AdvertiserCampaignsView({ campaigns }: AdvertiserCampaignsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-kpugi-border pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl text-kpugi-ink">My Campaigns</h1>
          <p className="text-kpugi-slate text-sm">View and manage your active brand campaigns.</p>
        </div>
        <Link
          href="/campaigns/new"
          className="px-4 py-2.5 bg-kpugi-blue text-white rounded-xl font-sans font-bold text-xs hover:bg-blue-600 transition-colors shadow-md shadow-kpugi-blue/10"
        >
          + Create New Campaign
        </Link>
      </div>

      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => {
            const progress = c.total_budget > 0 ? (Number(c.spent_budget || 0) / Number(c.total_budget)) * 100 : 0;
            return (
              <div key={c.id} className="bg-white border border-kpugi-border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                <div className="flex items-start justify-between">
                  <span className={`px-2.5 py-1 text-[10px] font-bold font-sans uppercase rounded-full ${
                    c.status === 'live'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-kpugi-slate/10 text-kpugi-slate border border-kpugi-border'
                  }`}>
                    {c.status}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {c.campaign_code && (
                      <span className="text-[10px] text-kpugi-blue font-mono font-bold uppercase tracking-wider bg-kpugi-blue/10 px-2 py-0.5 rounded border border-kpugi-blue/20">
                        {c.campaign_code}
                      </span>
                    )}
                    <span className="text-[10px] text-kpugi-slate font-mono uppercase tracking-wider bg-kpugi-paper px-2 py-0.5 rounded border border-kpugi-border">
                      {c.ad_format}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {c.company_logo ? (
                    <img src={c.company_logo} alt={c.title} className="w-10 h-10 rounded-xl object-cover border border-kpugi-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-kpugi-blue/10 text-kpugi-blue font-bold text-lg flex items-center justify-center border border-kpugi-blue/20">
                      📢
                    </div>
                  )}
                  <div>
                    <h3 className="font-display font-bold text-base text-kpugi-ink leading-tight line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-kpugi-slate font-sans mt-0.5">{c.channels?.join(', ') || 'TikTok'}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 font-sans text-xs">
                  <div className="flex items-center justify-between text-kpugi-slate">
                    <span>Budget Spent</span>
                    <span className="font-mono font-bold text-kpugi-ink">
                      ₦{formatCompactCurrency(c.spent_budget || 0)} / ₦{formatCompactCurrency(c.total_budget || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-kpugi-blue h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, progress)}%` }} />
                  </div>
                </div>

                <Link
                  href={`/campaigns/${c.id}`}
                  className="block w-full py-2 bg-kpugi-paper hover:bg-slate-200 text-kpugi-ink font-sans text-xs font-bold text-center rounded-xl border border-kpugi-border transition-colors"
                >
                  Manage Campaign →
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-kpugi-border rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-kpugi-blue/10 text-kpugi-blue text-2xl flex items-center justify-center mx-auto">
            📣
          </div>
          <h3 className="font-display font-bold text-lg text-kpugi-ink">No Campaigns Created Yet</h3>
          <p className="text-kpugi-slate text-xs max-w-sm mx-auto">
            Launch your first creator campaign to start generating user-generated video content and reaching audiences.
          </p>
          <Link
            href="/campaigns/new"
            className="inline-block px-5 py-2.5 bg-kpugi-blue text-white rounded-xl font-sans font-bold text-xs hover:bg-blue-600 transition-colors shadow-md shadow-kpugi-blue/10"
          >
            Create Your First Campaign
          </Link>
        </div>
      )}
    </div>
  );
}
