import React from 'react';

export function FeaturedHeroSkeleton() {
  return (
    <div className="relative w-full h-[420px] sm:h-[500px] overflow-hidden mb-10 bg-[#090A0F] border-b border-white/5 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/80 to-transparent z-10" />
      <div className="max-w-7xl mx-auto w-full h-full px-6 sm:px-12 pb-10 sm:pb-14 flex items-end justify-between relative z-20">
        <div className="space-y-4 max-w-xl w-full">
          <div className="h-6 w-36 bg-white/10 rounded-full" />
          <div className="h-12 w-3/4 bg-white/10 rounded-2xl" />
          <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
          <div className="h-12 w-40 bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CampaignCardSkeleton() {
  return (
    <div className="flex flex-col bg-[#12141A] rounded-2xl overflow-hidden border border-white/5 animate-pulse h-[360px]">
      <div className="h-[180px] w-full bg-white/5 relative" />
      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/10" />
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-white/10" />
            <div className="w-5 h-5 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-2/3 bg-white/10 rounded" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-3 w-20 bg-white/5 rounded" />
          <div className="h-6 w-16 bg-white/10 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function CampaignGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CampaignDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B1026] text-white flex flex-col font-sans animate-pulse">
      {/* Header */}
      <div className="h-16 border-b border-white/5 bg-[#0B1026] px-6 flex items-center justify-between">
        <div className="h-6 w-24 bg-white/10 rounded" />
        <div className="h-8 w-28 bg-white/10 rounded-full" />
      </div>

      {/* Hero Banner */}
      <div className="w-full h-[320px] bg-white/5 px-6 py-12 flex flex-col justify-end">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-end">
          <div className="space-y-4 max-w-xl w-full">
            <div className="h-8 w-44 bg-white/10 rounded-full" />
            <div className="h-10 w-3/4 bg-white/10 rounded-2xl" />
            <div className="h-4 w-1/3 bg-white/5 rounded" />
          </div>
          <div className="h-12 w-36 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-8 flex-1">
        <div className="flex gap-6 border-b border-white/5 pb-3">
          <div className="h-4 w-20 bg-white/10 rounded" />
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-[#0B1021] border border-white/5 rounded-3xl p-6" />
            <div className="h-32 bg-white/5 rounded-2xl" />
          </div>
          <div className="h-64 bg-white/5 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
