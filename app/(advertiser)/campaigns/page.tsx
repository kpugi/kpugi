import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { getAdvertiserDashboardData } from '@/lib/supabase/dashboard';
import { formatCompactCurrency } from '@/lib/utils/format';

export default async function AdvertiserCampaignsPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const dashboardData = await getAdvertiserDashboardData(userProfile.profile.id);
  const campaigns = dashboardData.campaigns || [];

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
                    <img 
                      src={c.company_logo} 
                      alt="Brand logo" 
                      className="w-10 h-10 rounded-full border border-kpugi-border object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-kpugi-paper border border-kpugi-border flex items-center justify-center font-bold text-xs uppercase text-kpugi-slate shrink-0">
                      B
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <h3 className="font-display font-bold text-base text-kpugi-ink leading-snug">
                      {c.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-kpugi-slate line-clamp-2">
                  {c.description}
                </p>

                <div className="pt-2 border-t border-kpugi-paper space-y-3">
                  <div className="flex items-center justify-between text-xs font-sans text-kpugi-slate">
                    <span>Joined Creators</span>
                    <span className="font-mono text-kpugi-ink font-bold">{c.creators_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-sans text-kpugi-slate">
                    <span>Total Budget</span>
                    <span className="font-mono text-kpugi-ink font-bold">{formatCompactCurrency(c.total_budget)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-sans text-kpugi-slate">
                    <span>Reserved</span>
                    <span className="font-mono text-kpugi-ink font-semibold">{formatCompactCurrency(c.reserved_budget)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-sans text-kpugi-slate">
                    <span>CPM Rate</span>
                    <span className="font-mono text-kpugi-blue font-bold">{formatCompactCurrency(c.cpm_rate)} / 1k</span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-kpugi-paper h-1.5 rounded-full overflow-hidden border border-kpugi-border">
                      <div
                        className="bg-kpugi-blue h-full rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-kpugi-slate">
                      <span>Spent: {formatCompactCurrency(c.spent_budget || 0)}</span>
                      <span>{Math.round(progress)}% Spent</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-kpugi-paper border border-kpugi-border rounded-2xl">
          <span className="text-4xl">📁</span>
          <h3 className="font-display font-bold text-base text-kpugi-ink mt-4">No Campaigns Created</h3>
          <p className="text-xs text-kpugi-slate mt-1 max-w-sm mx-auto">
            Get started by launching your first promotional creator campaign.
          </p>
          <Link
            href="/campaigns/new"
            className="inline-block mt-4 px-4 py-2 bg-kpugi-blue text-white rounded-xl font-sans font-bold text-xs hover:bg-blue-600 transition-colors"
          >
            Create Campaign
          </Link>
        </div>
      )}
    </div>
  );
}
