'use client';

import React from 'react';
import {
  Check,
  Target,
  Users,
  Sparkles,
  Laptop,
  Shirt,
  Activity,
  Gamepad2,
  TrendingUp,
  Smile,
  Utensils,
} from 'lucide-react';
import {
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
  TwitterXIcon,
  LinkedInIcon,
  ThreadsIcon,
} from '@/components/ui/SocialIcons';

interface Step3Props {
  formData: any;
  updateFormData: (fields: Partial<any>) => void;
}

export function CampaignStep3Targeting({ formData, updateFormData }: Step3Props) {
  const platforms = [
    {
      id: 'TikTok',
      name: 'TikTok',
      desc: 'Short-form viral video posts.',
      icon: TikTokIcon,
    },
    {
      id: 'Instagram',
      name: 'Instagram',
      desc: 'Reels, Stories & photo posts.',
      icon: InstagramIcon,
    },
    {
      id: 'YouTube',
      name: 'YouTube Shorts',
      desc: 'Long-tail viral shorts stream.',
      icon: YouTubeIcon,
    },
    {
      id: 'Facebook',
      name: 'Facebook',
      desc: 'Feed videos & brand posts.',
      icon: FacebookIcon,
    },
    {
      id: 'X',
      name: 'X (Twitter)',
      desc: 'Text copy & video posts.',
      icon: TwitterXIcon,
    },
    {
      id: 'LinkedIn',
      name: 'LinkedIn',
      desc: 'Professional & B2B content.',
      icon: LinkedInIcon,
    },
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
    { id: 'Lifestyle', label: 'Lifestyle', icon: Sparkles },
    { id: 'Tech & Innovation', label: 'Tech & Innovation', icon: Laptop },
    { id: 'Beauty & Fashion', label: 'Beauty & Fashion', icon: Shirt },
    { id: 'Fitness & Health', label: 'Fitness & Health', icon: Activity },
    { id: 'Gaming & Esports', label: 'Gaming & Esports', icon: Gamepad2 },
    { id: 'Finance & Crypto', label: 'Finance & Crypto', icon: TrendingUp },
    { id: 'Comedy & Entertainment', label: 'Comedy & Skits', icon: Smile },
    { id: 'Food & Cooking', label: 'Food & Cooking', icon: Utensils },
  ];

  const selectedNiches: string[] = formData.requirements?.target_niche || [
    'Lifestyle',
    'Tech & Innovation',
  ];

  const toggleNiche = (nicheId: string) => {
    if (selectedNiches.includes(nicheId)) {
      updateFormData({
        requirements: {
          ...formData.requirements,
          target_niche: selectedNiches.filter((n) => n !== nicheId),
        },
      });
    } else {
      updateFormData({
        requirements: {
          ...formData.requirements,
          target_niche: [...selectedNiches, nicheId],
        },
      });
    }
  };

  const followerRanges = [
    { label: '1,000+ Followers (Micro Creators)', value: 1000 },
    { label: '5,000+ Followers (Mid-Tier Creators)', value: 5000 },
    { label: '25,000+ Followers (Macro Performers)', value: 25000 },
    { label: '100,000+ Followers (VIP Ambassadors)', value: 100000 },
  ];

  return (
    <div className="space-y-8 font-sans text-slate-900 dark:text-white">
      {/* Title & Subtitle Section - Step 1 & 2 Style */}
      <div className="text-center space-y-2">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Let's reach the right audience.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Select target social media platforms, creator niches, and follower qualification filters.
        </p>
      </div>

      {/* Target Platforms Grid (Official SVG Brand Icons) */}
      <div className="space-y-4 pt-2">
        <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white text-center">
          Select Target Platforms
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedChannels.includes(p.id);

            return (
              <div
                key={p.id}
                onClick={() => toggleChannel(p.id)}
                className={`p-4.5 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center space-y-2.5 min-h-[140px] justify-center ${
                  isSelected
                    ? 'bg-[#eeedfd] dark:bg-indigo-950/40 border-2 border-[#4338ca] dark:border-indigo-500 text-[#4338ca] dark:text-indigo-300 shadow-xs'
                    : 'bg-[#f8f7ff] dark:bg-white/[0.03] border border-[#e2e0fb] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#4338ca] dark:bg-indigo-600 text-white' : 'bg-[#e9e6fd] dark:bg-white/10 text-[#4338ca] dark:text-indigo-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Creator Niche & Categories Grid with Icons */}
      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Niche & Categories</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Select one or more niches.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#4338ca] dark:text-indigo-400 bg-[#eeedfd] dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-[#dcd8fc] dark:border-indigo-500/30">
            {selectedNiches.length} Selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {niches.map((niche) => {
            const Icon = niche.icon;
            const isSelected = selectedNiches.includes(niche.id);

            return (
              <div
                key={niche.id}
                onClick={() => toggleNiche(niche.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-[#eeedfd] dark:bg-indigo-950/40 border-2 border-[#4338ca] dark:border-indigo-500 text-[#4338ca] dark:text-indigo-300 shadow-xs'
                    : 'bg-[#f8f7ff] dark:bg-white/[0.03] border border-[#e2e0fb] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#4338ca] dark:bg-indigo-600 text-white' : 'bg-[#e9e6fd] dark:bg-white/10 text-[#4338ca] dark:text-indigo-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{niche.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Minimum Creator Follower Filter */}
      <div className="space-y-3 p-5 rounded-2xl bg-[#f8f7ff] dark:bg-white/[0.03] border border-[#e2e0fb] dark:border-white/10">
        <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Minimum Follower Requirement</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className={`p-3.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-indigo-950/40 border-2 border-[#4338ca] dark:border-indigo-500 text-[#4338ca] dark:text-indigo-300 shadow-xs'
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <span>{range.label}</span>
                {isSelected && <Check className="w-4 h-4 text-[#4338ca] dark:text-indigo-400" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
