'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Plus, Megaphone, ArrowRight, Eye, Users, ChevronRight } from 'lucide-react';
import { formatCompactCurrency } from '@/lib/utils/format';
import { AdvertiserCampaign } from '@/lib/supabase/advertiser';

interface AdvertiserCampaignsViewProps {
  campaigns: AdvertiserCampaign[];
}

export default function AdvertiserCampaignsView({ campaigns }: AdvertiserCampaignsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.campaign_code || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink">My Brand Campaigns</h1>
          <p className="font-sans text-xs sm:text-sm text-kpugi-slate mt-1">
            Manage your view-based creator campaigns, track budgets, and inspect video submission streams.
          </p>
        </div>
        <Link
          href="/b/campaigns/new"
          className="px-5 py-3 bg-kpugi-blue hover:bg-blue-600 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-kpugi-blue/20 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Campaign</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by title, code..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-kpugi-border bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'live', 'paused', 'completed', 'draft'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                statusFilter === st ? 'bg-kpugi-ink text-white shadow-sm' : 'bg-white border border-kpugi-border text-kpugi-slate hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((c) => {
            const progress = c.total_budget > 0 ? (Number(c.spent_budget || 0) / Number(c.total_budget)) * 100 : 0;
            return (
              <div key={c.id} className="bg-white border border-kpugi-border rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold font-sans uppercase rounded-full ${
                      c.status === 'live'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : c.status === 'paused'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {c.status}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {c.campaign_code && (
                        <span className="text-[10px] text-kpugi-blue font-mono font-bold uppercase tracking-wider bg-kpugi-blue/10 px-2 py-0.5 rounded-lg border border-kpugi-blue/20">
                          {c.campaign_code}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-lg">
                        {c.ad_format}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {c.company_logo ? (
                      <Image src={c.company_logo} alt="" width={40} height={40} className="rounded-xl object-cover border border-kpugi-border shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-kpugi-blue/10 text-kpugi-blue font-bold text-base flex items-center justify-center shrink-0 border border-kpugi-blue/20">
                        📢
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-base text-kpugi-ink leading-tight truncate">{c.title}</h3>
                      <p className="text-xs text-kpugi-slate font-sans mt-0.5 capitalize truncate">
                        {c.channels?.join(', ') || 'TikTok, Instagram'}
                      </p>
                    </div>
                  </div>

                  {/* Budget & Views Bar */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Spent: ₦{formatCompactCurrency(c.spent_budget || 0)}</span>
                      <span className="font-mono font-bold text-slate-900">Total: ₦{formatCompactCurrency(c.total_budget || 0)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, progress)}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>CPM: ₦{c.cpm_rate.toLocaleString()} / 1k</span>
                      <span className="font-bold text-emerald-600">{c.creators_count || 0} Submissions</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/b/campaigns/${c.id}`}
                  className="block w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-sans text-xs font-bold text-center rounded-xl transition-colors mt-2"
                >
                  Manage Command Center →
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-kpugi-border rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-kpugi-blue/10 text-kpugi-blue text-2xl flex items-center justify-center mx-auto">
            📢
          </div>
          <h3 className="font-display font-bold text-lg text-kpugi-ink">No Campaigns Found</h3>
          <p className="text-kpugi-slate text-xs max-w-sm mx-auto">
            Launch your first creator campaign to start generating user-generated video content and reaching audiences.
          </p>
          <Link
            href="/b/campaigns/new"
            className="inline-block px-5 py-2.5 bg-kpugi-blue text-white rounded-xl font-sans font-bold text-xs hover:bg-blue-600 transition-colors shadow-md shadow-kpugi-blue/10"
          >
            Create Your First Campaign
          </Link>
        </div>
      )}
    </div>
  );
}
