'use client';

import React, { useTransition } from 'react';
import { toggleCampaignHeroPinned, toggleCampaignFeatured } from '@/app/actions/admin';
import { Sparkles, Pin, Loader2 } from 'lucide-react';

interface CampaignRowTogglesProps {
  campaignId: string;
  isHeroPinned: boolean;
  isFeatured: boolean;
}

export default function CampaignRowToggles({
  campaignId,
  isHeroPinned,
  isFeatured,
}: CampaignRowTogglesProps) {
  const [isPendingHero, startTransitionHero] = useTransition();
  const [isPendingFeatured, startTransitionFeatured] = useTransition();

  const handleToggleHero = () => {
    startTransitionHero(async () => {
      try {
        await toggleCampaignHeroPinned(campaignId, isHeroPinned);
      } catch (err: any) {
        alert(err?.message || 'Failed to toggle hero pin');
      }
    });
  };

  const handleToggleFeatured = () => {
    startTransitionFeatured(async () => {
      try {
        await toggleCampaignFeatured(campaignId, isFeatured);
      } catch (err: any) {
        alert(err?.message || 'Failed to toggle featured status');
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hero Pin Toggle */}
      <button
        onClick={handleToggleHero}
        disabled={isPendingHero}
        title={isHeroPinned ? 'Remove from Hero Slider' : 'Pin to Top Hero Slider (Max 5)'}
        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
          isHeroPinned
            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
            : 'bg-[#0E1422] text-slate-500 hover:text-slate-300 border border-slate-800'
        }`}
      >
        {isPendingHero ? (
          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
        ) : (
          <Pin className={`w-3 h-3 ${isHeroPinned ? 'text-indigo-400 fill-indigo-400' : ''}`} />
        )}
        <span>Hero Pin</span>
      </button>

      {/* Featured Toggle */}
      <button
        onClick={handleToggleFeatured}
        disabled={isPendingFeatured}
        title={isFeatured ? 'Remove Featured Badge' : 'Feature on Floor Grid'}
        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
          isFeatured
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
            : 'bg-[#0E1422] text-slate-500 hover:text-slate-300 border border-slate-800'
        }`}
      >
        {isPendingFeatured ? (
          <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
        ) : (
          <Sparkles className={`w-3 h-3 ${isFeatured ? 'text-amber-400 fill-amber-400' : ''}`} />
        )}
        <span>Featured</span>
      </button>
    </div>
  );
}
