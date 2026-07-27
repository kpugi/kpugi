'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Megaphone, ArrowRight } from 'lucide-react';
import { CreatorCampaignItem } from '@/lib/supabase/creator';
import { formatCompactCurrency } from '@/lib/utils/format';

interface CreatorCampaignsViewProps {
  campaigns: CreatorCampaignItem[];
}

export default function CreatorCampaignsView({ campaigns }: CreatorCampaignsViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'auditing' | 'completed'>('all');

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === 'auditing') return c.status === 'pending' || c.status === 'auditing' || c.status === 'under_review' || c.status === 'reserved';
    if (activeTab === 'completed') return c.status === 'paid' || c.status === 'completed' || c.status === 'approved';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-kpugi-border pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-kpugi-ink">My Campaigns</h1>
          <p className="font-sans text-sm text-kpugi-slate mt-1">Track your joined campaigns, view audit status, and submit post links.</p>
        </div>
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-kpugi-blue-dark transition-colors shadow-sm"
        >
          <Search className="w-4 h-4" />
          <span>Browse New Campaigns</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-kpugi-border pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'all' ? 'bg-kpugi-blue/10 text-kpugi-blue' : 'text-kpugi-slate hover:bg-slate-100'
          }`}
        >
          All ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('auditing')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'auditing' ? 'bg-kpugi-blue/10 text-kpugi-blue' : 'text-kpugi-slate hover:bg-slate-100'
          }`}
        >
          Active / Auditing ({campaigns.filter((c) => c.status === 'pending' || c.status === 'auditing' || c.status === 'under_review' || c.status === 'reserved').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'completed' ? 'bg-kpugi-blue/10 text-kpugi-blue' : 'text-kpugi-slate hover:bg-slate-100'
          }`}
        >
          Completed / Paid ({campaigns.filter((c) => c.status === 'paid' || c.status === 'completed' || c.status === 'approved').length})
        </button>
      </div>

      {/* Campaigns List / Grid matching screenshot style */}
      {filteredCampaigns.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-kpugi-border shadow-sm space-y-4">
          <Megaphone className="w-10 h-10 text-kpugi-blue mx-auto" />
          <h3 className="font-display font-bold text-lg text-kpugi-ink">No campaigns found</h3>
          <p className="font-sans text-xs text-kpugi-slate max-w-sm mx-auto">
            You haven&apos;t joined any campaigns under this tab yet. Check out the browse page to find opportunities!
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-kpugi-ink text-white font-sans text-xs font-bold hover:bg-black transition-colors"
          >
            <span>Explore Campaigns</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCampaigns.map((item) => (
            <Link
              key={item.id}
              href={`/campaigns/${item.campaignId || item.id}`}
              className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-4 hover:border-kpugi-blue/40 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  {item.companyLogo ? (
                    <img
                      src={item.companyLogo}
                      alt={item.brandName || item.title}
                      className="w-10 h-10 rounded-2xl object-cover border border-kpugi-border shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-kpugi-ink text-white font-bold text-sm flex items-center justify-center uppercase shrink-0">
                      {(item.brandName || item.title).charAt(0)}
                    </div>
                  )}

                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    item.status === 'paid' || item.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    JOINED
                  </span>
                </div>

                <h4 className="font-display font-bold text-base text-kpugi-ink mb-1 group-hover:text-kpugi-blue transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <p className="font-sans text-xs text-kpugi-slate mb-4">
                  Min Threshold: {(item.minThreshold || 500).toLocaleString()} views
                </p>
              </div>

              <div className="pt-4 border-t border-kpugi-border flex items-center justify-between text-xs font-sans">
                <div>
                  <span className="text-[10px] font-bold uppercase text-kpugi-slate block tracking-wider">RESERVED</span>
                  <span className="font-mono font-bold text-kpugi-blue">
                    {formatCompactCurrency(item.reservedAmount || item.earnedAmount || 0)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-kpugi-slate block tracking-wider">SUBMITTED</span>
                  <span className="font-sans font-bold text-kpugi-ink">
                    {item.submittedAt
                      ? new Date(item.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Recently'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
