'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Megaphone, ArrowRight, LayoutGrid, List, Eye, ShieldCheck, ChevronRight, Video, Receipt } from 'lucide-react';
import { CreatorCampaignItem } from '@/lib/supabase/creator';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/utils/format';

interface CreatorCampaignsViewProps {
  campaigns: CreatorCampaignItem[];
}

export default function CreatorCampaignsView({ campaigns }: CreatorCampaignsViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'auditing' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const saved = localStorage.getItem('creator_campaigns_view_mode') as 'grid' | 'list';
    if (saved && (saved === 'grid' || saved === 'list')) {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('creator_campaigns_view_mode', mode);
  };

  const isCompletedCampaign = (c: CreatorCampaignItem) => {
    const s = (c.status || c.submissionStatus || '').toLowerCase();
    const cs = (c.campaignStatus || '').toLowerCase();
    return s === 'paid' || s === 'completed' || s === 'approved' || s === 'forfeited' || s === 'verified_fail' || cs === 'completed' || cs === 'cancelled';
  };

  const isActiveCampaign = (c: CreatorCampaignItem) => {
    return !isCompletedCampaign(c);
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === 'auditing') return isActiveCampaign(c);
    if (activeTab === 'completed') return isCompletedCampaign(c);
    return true;
  });

  const getStatusBadge = (item: CreatorCampaignItem) => {
    const s = (item.status || item.submissionStatus || '').toLowerCase();
    const cs = (item.campaignStatus || '').toLowerCase();

    if (cs === 'completed' || cs === 'cancelled' || s === 'completed' || s === 'paid' || s === 'approved') {
      return { label: 'Completed', bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' };
    }
    if (s === 'verified_pass') {
      return { label: 'Audit Passed', bg: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/30' };
    }
    if (s === 'verified_fail' || s === 'forfeited') {
      return { label: 'Audit Failed', bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30' };
    }
    if (s === 'auditing' || s === 'under_review' || s === 'pending') {
      return { label: 'Auditing', bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' };
    }
    return { label: 'Slot Reserved', bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink dark:text-white font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-kpugi-border dark:border-white/10 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-kpugi-ink dark:text-white">My Campaigns</h1>
          <p className="font-sans text-sm text-kpugi-slate dark:text-slate-400 mt-1">Track your joined campaigns, view audit status, and submit post links.</p>
        </div>
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-kpugi-blue-dark transition-colors shadow-sm"
        >
          <Search className="w-4 h-4" />
          <span>Browse New Campaigns</span>
        </Link>
      </div>

      {/* Filter Tabs & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-kpugi-border dark:border-white/10 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'all' ? 'bg-kpugi-blue/10 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400' : 'text-kpugi-slate dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
            }`}
          >
            All ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('auditing')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'auditing' ? 'bg-kpugi-blue/10 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400' : 'text-kpugi-slate dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
            }`}
          >
            Active / Auditing ({campaigns.filter(isActiveCampaign).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'completed' ? 'bg-kpugi-blue/10 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400' : 'text-kpugi-slate dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
            }`}
          >
            Completed / Paid ({campaigns.filter(isCompletedCampaign).length})
          </button>
        </div>

        {/* View Mode Toggle (Grid / List) */}
        <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleViewModeChange('grid')}
            title="Grid View"
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-white/15 text-kpugi-ink dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange('list')}
            title="List View"
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
              viewMode === 'list'
                ? 'bg-white dark:bg-white/15 text-kpugi-ink dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Campaigns Content (Grid vs List) */}
      {filteredCampaigns.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#12141A] rounded-3xl border border-kpugi-border dark:border-white/10 shadow-sm space-y-4">
          <Megaphone className="w-10 h-10 text-kpugi-blue dark:text-blue-400 mx-auto" />
          <h3 className="font-display font-bold text-lg text-kpugi-ink dark:text-white">No campaigns found</h3>
          <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400 max-w-sm mx-auto">
            You haven&apos;t joined any campaigns under this tab yet. Check out the browse page to find opportunities!
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-kpugi-ink dark:bg-white text-white dark:text-slate-900 font-sans text-xs font-bold hover:bg-black dark:hover:bg-slate-100 transition-colors"
          >
            <span>Explore Campaigns</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCampaigns.map((item) => {
            const badge = getStatusBadge(item);
            const isCompleted = item.status === 'completed' || item.status === 'paid' || item.campaignStatus === 'completed';
            const isOnlyReserved = !isCompleted && (item.status === 'joined' || item.status === 'reserved' || !item.postUrl || (item.earnedAmount || 0) === 0);

            return (
              <Link
                key={item.id}
                href={`/c/campaigns/${item.campaignId || item.id}`}
                className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-4 hover:border-kpugi-blue/40 dark:hover:border-blue-500/40 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {item.coverImageUrl || item.companyLogo ? (
                      <img
                        src={item.coverImageUrl || item.companyLogo!}
                        alt={item.title || item.brandName}
                        className="w-10 h-10 rounded-2xl object-cover border border-kpugi-border dark:border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-kpugi-ink dark:bg-white/10 text-white font-bold text-sm flex items-center justify-center uppercase shrink-0">
                        {(item.title || item.brandName || 'C').charAt(0)}
                      </div>
                    )}

                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base text-kpugi-ink dark:text-white mb-1 group-hover:text-kpugi-blue dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400 mb-4">
                    Min Threshold: {(item.minThreshold || 1000).toLocaleString()} views
                  </p>
                </div>

                <div className="pt-4 border-t border-kpugi-border dark:border-white/10 flex items-center justify-between text-xs font-sans">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-kpugi-slate dark:text-slate-400 block tracking-wider">
                      {isOnlyReserved ? 'RESERVED' : 'EARNED'}
                    </span>
                    <span className="font-mono font-bold text-kpugi-blue dark:text-blue-400">
                      {formatCompactCurrency(isOnlyReserved ? (item.reservedAmount || 0) : (item.earnedAmount || 0))}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-kpugi-slate dark:text-slate-400 block tracking-wider">STATUS</span>
                    <span className="font-sans font-bold text-kpugi-ink dark:text-white flex items-center justify-end gap-1 group-hover:text-kpugi-blue dark:group-hover:text-blue-400 transition-colors">
                      <span>Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW (TABLE) */
        <div className="bg-white dark:bg-[#12141A] rounded-3xl border border-kpugi-border dark:border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-kpugi-border dark:border-white/10 bg-slate-50/70 dark:bg-[#161820] text-kpugi-slate dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-4 px-5">Campaign</th>
                  <th className="py-4 px-4">CPM</th>
                  <th className="py-4 px-4">Threshold</th>
                  <th className="py-4 px-4">Reserved / Earned</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredCampaigns.map((item) => {
                  const badge = getStatusBadge(item);
                  const isCompleted = item.status === 'completed' || item.status === 'paid' || item.campaignStatus === 'completed';
                  const isOnlyReserved = !isCompleted && (item.status === 'joined' || item.status === 'reserved' || !item.postUrl || (item.earnedAmount || 0) === 0);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Campaign & Brand */}
                      <td className="py-4 px-5">
                        <Link
                          href={`/c/campaigns/${item.campaignId || item.id}`}
                          className="flex items-center gap-3 min-w-[200px]"
                        >
                          {item.coverImageUrl || item.companyLogo ? (
                            <img
                              src={item.coverImageUrl || item.companyLogo!}
                              alt={item.title || item.brandName}
                              className="w-10 h-10 rounded-xl object-cover border border-kpugi-border dark:border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-kpugi-ink dark:bg-white/10 text-white font-bold text-sm flex items-center justify-center uppercase shrink-0">
                              {(item.title || item.brandName || 'C').charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-kpugi-ink dark:text-white group-hover:text-kpugi-blue dark:group-hover:text-blue-400 transition-colors truncate block">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-kpugi-slate dark:text-slate-400 block truncate">
                              {item.brandName || 'Brand Partner'}
                            </span>
                          </div>
                        </Link>
                      </td>

                      {/* CPM Rate */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                          {item.ratePer1k ? formatCompactCurrency(item.ratePer1k) : '₦2.5k'}
                        </span>
                        <span className="text-[10px] text-kpugi-slate dark:text-slate-400 block font-sans">/ 1k views</span>
                      </td>

                      {/* Min Threshold */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">
                        {formatCompactNumber(item.minThreshold || 1000)} views
                      </td>

                      {/* Reserved / Earned */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-kpugi-blue dark:text-blue-400 text-sm block">
                          {formatCompactCurrency(isOnlyReserved ? (item.reservedAmount || 0) : (item.earnedAmount || 0))}
                        </span>
                        <span className="text-[9px] text-kpugi-slate dark:text-slate-400 uppercase tracking-wider font-bold">
                          {isOnlyReserved ? 'Reserved' : 'Verified Payout'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        {isCompleted ? (
                          <Link
                            href={`/c/campaigns/${item.campaignId || item.id}?receipt=true`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-600 dark:hover:bg-purple-600 text-purple-700 dark:text-purple-300 hover:text-white dark:hover:text-white font-bold text-xs transition-all border border-purple-200 dark:border-purple-500/30 shadow-2xs"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/c/campaigns/${item.campaignId || item.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-kpugi-blue text-slate-700 dark:text-slate-200 hover:text-white font-bold text-xs transition-all shadow-2xs group-hover:bg-kpugi-blue group-hover:text-white"
                          >
                            <span>Workspace</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
