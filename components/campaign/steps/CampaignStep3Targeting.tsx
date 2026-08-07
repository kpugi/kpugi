'use client';

import React from 'react';
import { Globe, Users, Check, Target } from 'lucide-react';

interface Step3Props {
  formData: any;
  updateFormData: (fields: Partial<any>) => void;
}

export function CampaignStep3Targeting({ formData, updateFormData }: Step3Props) {
  const platforms = [
    { id: 'TikTok', name: 'TikTok', color: 'bg-cyan-50 text-cyan-800 border-cyan-300' },
    { id: 'Instagram', name: 'Instagram', color: 'bg-pink-50 text-pink-800 border-pink-300' },
    { id: 'YouTube', name: 'YouTube', color: 'bg-red-50 text-red-800 border-red-300' },
    { id: 'Facebook', name: 'Facebook', color: 'bg-blue-50 text-blue-800 border-blue-300' },
    { id: 'X', name: 'X (Twitter)', color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { id: 'LinkedIn', name: 'LinkedIn', color: 'bg-indigo-50 text-indigo-800 border-indigo-300' },
  ];

  const selectedChannels: string[] = formData.channels || ['TikTok', 'Instagram'];

  const toggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      if (selectedChannels.length > 1) {
        updateFormData({ channels: selectedChannels.filter((c) => c !== channelId) });
      }
    } else {
      updateFormData({ channels: [...selectedChannels, channelId] });
    }
  };

  const niches = [
    'Lifestyle',
    'Tech & Innovation',
    'Beauty & Fashion',
    'Fitness & Health',
    'Gaming & Esports',
    'Finance & Crypto',
    'Comedy & Entertainment',
    'Food & Cooking',
    'Education & Business',
  ];

  const selectedNiches: string[] = formData.requirements?.target_niche || ['Lifestyle', 'Tech & Innovation'];

  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      updateFormData({
        requirements: {
          ...formData.requirements,
          target_niche: selectedNiches.filter((n) => n !== niche),
        },
      });
    } else {
      updateFormData({
        requirements: {
          ...formData.requirements,
          target_niche: [...selectedNiches, niche],
        },
      });
    }
  };

  const followerRanges = [
    { label: '1,000+ Followers (Micro)', value: 1000 },
    { label: '5,000+ Followers (Mid-tier)', value: 5000 },
    { label: '25,000+ Followers (Macro)', value: 25000 },
    { label: '100,000+ Followers (VIP)', value: 100000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="font-display text-xl font-bold text-kpugi-ink">
          Step 3: Platform Channels & Creator Targeting
        </h2>
        <p className="text-xs text-kpugi-slate mt-0.5">
          Select target social media platforms, creator niches, and follower qualification filters.
        </p>
      </div>

      {/* Target Social Networks */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-kpugi-ink flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-kpugi-blue" />
          <span>Target Social Networks *</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {platforms.map((p) => {
            const isSelected = selectedChannels.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => toggleChannel(p.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-kpugi-blue/5 border-kpugi-blue ring-1 ring-kpugi-blue'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-bold text-kpugi-ink">{p.name}</span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-kpugi-blue text-white' : 'bg-slate-100 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Creator Niches */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-kpugi-ink flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-kpugi-blue" />
          <span>Creator Niche & Categories *</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {niches.map((niche) => {
            const isSelected = selectedNiches.includes(niche);
            return (
              <button
                key={niche}
                type="button"
                onClick={() => toggleNiche(niche)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-kpugi-blue text-white border-kpugi-blue shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {niche}
              </button>
            );
          })}
        </div>
      </div>

      {/* Creator Follower Filter */}
      <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <label className="text-xs font-bold text-kpugi-ink">
          Minimum Creator Follower Count
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {followerRanges.map((range) => {
            const isSelected = (formData.requirements?.min_followers || 1000) === range.value;
            return (
              <div
                key={range.value}
                onClick={() =>
                  updateFormData({
                    requirements: { ...formData.requirements, min_followers: range.value },
                  })
                }
                className={`p-3 rounded-xl border cursor-pointer text-xs font-bold flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-white border-kpugi-blue text-kpugi-blue shadow-sm'
                    : 'bg-slate-100/70 border-transparent text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{range.label}</span>
                {isSelected && <Check className="w-4 h-4 text-kpugi-blue" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
