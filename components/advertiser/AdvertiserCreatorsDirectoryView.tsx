'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, ShieldCheck, Users, Eye, Star, Filter, ArrowUpRight } from 'lucide-react';
import { DirectoryCreator } from '@/lib/supabase/advertiser';

interface AdvertiserCreatorsDirectoryViewProps {
  creators: DirectoryCreator[];
}

export default function AdvertiserCreatorsDirectoryView({
  creators,
}: AdvertiserCreatorsDirectoryViewProps) {
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const filteredCreators = creators.filter((c) => {
    const matchesSearch = c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    
    const matchesPlatform = selectedPlatform === 'all' ||
      c.verifiedAccounts.some((a) => a.platform.toLowerCase() === selectedPlatform.toLowerCase());

    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink">Creator Discovery</h1>
          <p className="font-sans text-xs sm:text-sm text-kpugi-slate mt-1">
            Discover verified Kpugi creators, inspect social throughput, and target top performers for campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% ID Verified Creators</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creator by handle, category..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-kpugi-border bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
          />
        </div>

        {/* Platform Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'tiktok', 'instagram', 'youtube', 'x'].map((plt) => (
            <button
              key={plt}
              onClick={() => setSelectedPlatform(plt)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                selectedPlatform === plt ? 'bg-kpugi-blue text-white shadow-sm' : 'bg-white border border-kpugi-border text-kpugi-slate hover:bg-slate-50'
              }`}
            >
              {plt}
            </button>
          ))}
        </div>
      </div>

      {/* Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCreators.length === 0 ? (
          <div className="col-span-full py-12 text-center text-kpugi-slate bg-white rounded-3xl border border-kpugi-border">
            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold">No creators match your filter criteria.</p>
          </div>
        ) : (
          filteredCreators.map((creator) => (
            <div key={creator.profileId} className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {creator.avatarUrl ? (
                    <Image src={creator.avatarUrl} alt="" width={48} height={48} className="rounded-2xl object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-kpugi-blue/10 text-kpugi-blue font-bold text-sm flex items-center justify-center shrink-0">
                      {creator.displayName[1]?.toUpperCase() || 'C'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900 truncate">{creator.displayName}</span>
                      {creator.kycStatus === 'verified' && (
                        <span title="Verified ID">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-kpugi-slate font-medium block truncate">{creator.category}</span>
                  </div>
                </div>

                {creator.bio && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{creator.bio}</p>
                )}

                {/* Verified Accounts */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {creator.verifiedAccounts.map((acc, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      {acc.platform.toUpperCase()} • {acc.handle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Metrics */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Views Generated</span>
                  <span className="font-mono font-bold text-slate-900">{creator.totalViewsGenerated.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Campaigns</span>
                  <span className="font-mono font-bold text-emerald-600">{creator.campaignsCompleted} Completed</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
