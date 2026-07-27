'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, ArrowRight, Megaphone } from 'lucide-react';
import { CreatorCampaignItem } from '@/lib/supabase/creator';
import { PlatformBadge } from '@/components/ui/SocialIcons';

interface CreatorCampaignsViewProps {
  campaigns: CreatorCampaignItem[];
}

export default function CreatorCampaignsView({ campaigns }: CreatorCampaignsViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'auditing' | 'completed'>('all');

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === 'auditing') return c.status === 'pending' || c.status === 'auditing' || c.status === 'under_review';
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
          Active / Auditing ({campaigns.filter((c) => c.status === 'pending' || c.status === 'auditing' || c.status === 'under_review').length})
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

      {/* Campaigns List / Grid */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((item) => (
            <div key={item.id} className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between space-y-4 hover:border-kpugi-blue/30 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <PlatformBadge platform={item.platform || 'tiktok'} />
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'paid' || item.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-kpugi-ink line-clamp-1">{item.title}</h3>
                
                <div className="mt-3 flex items-center justify-between text-xs font-sans">
                  <span className="text-kpugi-slate">Rate Card</span>
                  <span className="font-mono font-bold text-kpugi-blue">₦{item.ratePer1k?.toLocaleString()} / 1k views</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs font-sans">
                  <span className="text-kpugi-slate">Verified Views</span>
                  <span className="font-mono font-bold text-kpugi-ink">{(item.viewsCount || 0).toLocaleString()}</span>
                </div>
              </div>

              <Link
                href={`/campaigns/${item.id}`}
                className="w-full py-2.5 rounded-xl bg-kpugi-paper hover:bg-kpugi-blue hover:text-white border border-kpugi-border text-kpugi-ink font-sans text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
