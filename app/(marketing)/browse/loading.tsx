import React from 'react';
import { FeaturedHeroSkeleton, CampaignGridSkeleton } from '@/components/ui/Skeletons';

export default function BrowseLoading() {
  return (
    <div className="min-h-screen bg-[#090A0F] font-sans pb-16">
      <FeaturedHeroSkeleton />
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-12 w-full md:w-[320px] bg-white/5 rounded-full animate-pulse" />
          <div className="h-12 w-64 bg-white/5 rounded-full animate-pulse" />
        </div>
        <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
        <CampaignGridSkeleton count={8} />
      </div>
    </div>
  );
}
