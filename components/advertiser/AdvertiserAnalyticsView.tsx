'use client';

import React from 'react';
import { BarChart3, TrendingUp, Eye, DollarSign, Award, Target, Sparkles } from 'lucide-react';
import { AdvertiserDashboardData } from '@/lib/supabase/advertiser';

interface AdvertiserAnalyticsViewProps {
  data: AdvertiserDashboardData;
}

export default function AdvertiserAnalyticsView({ data }: AdvertiserAnalyticsViewProps) {
  const { totalSpent, totalViewsDelivered, activeCampaigns, campaigns } = data;

  const cpv = totalViewsDelivered > 0 ? (totalSpent / totalViewsDelivered) : 0;
  const avgCpm = totalViewsDelivered > 0 ? (totalSpent / totalViewsDelivered) * 1000 : 0;

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink">Brand ROI Analytics</h1>
          <p className="font-sans text-xs sm:text-sm text-kpugi-slate mt-1">
            Aggregate cross-campaign view throughput, Cost Per View (CPV), and platform distribution performance.
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-kpugi-border shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-kpugi-slate block">Total Views Delivered</span>
          <p className="font-display text-xl sm:text-2xl font-black text-kpugi-ink">{totalViewsDelivered.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-medium block">Across All Campaigns</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-kpugi-border shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-kpugi-slate block">Effective CPV</span>
          <p className="font-display text-xl sm:text-2xl font-black text-kpugi-ink">₦{cpv.toFixed(2)}</p>
          <span className="text-[10px] text-slate-500 font-medium block">Cost Per Single View</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-kpugi-border shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-kpugi-slate block">Average Blended CPM</span>
          <p className="font-display text-xl sm:text-2xl font-black text-kpugi-ink">₦{Math.round(avgCpm).toLocaleString()}</p>
          <span className="text-[10px] text-indigo-600 font-medium block">per 1,000 Views</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-kpugi-border shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-kpugi-slate block">Total Capital Spent</span>
          <p className="font-display text-xl sm:text-2xl font-black text-kpugi-ink">₦{totalSpent.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-medium block">Verified Creator Payouts</span>
        </div>
      </div>

      {/* Campaign Efficiency Breakdown */}
      <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-kpugi-ink">Campaign Performance Breakdown</h3>

        {campaigns.length === 0 ? (
          <p className="text-xs text-kpugi-slate py-4">No campaign data available for ROI analytics.</p>
        ) : (
          <div className="space-y-3">
            {campaigns.map((camp) => {
              const campCpv = camp.views_delivered > 0 ? (camp.spent_budget / camp.views_delivered) : 0;

              return (
                <div key={camp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{camp.title}</span>
                    <span className="text-[11px] text-slate-500">
                      Format: {camp.ad_format} • Rate: ₦{camp.cpm_rate.toLocaleString()}/1k views
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Views</span>
                      <span className="font-mono font-bold text-slate-900">{camp.views_delivered.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Spent</span>
                      <span className="font-mono font-bold text-emerald-600">₦{camp.spent_budget.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Effective CPV</span>
                      <span className="font-mono font-bold text-indigo-600">₦{campCpv.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
