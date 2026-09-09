'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  Share,
  CheckCircle2,
  ExternalLink,
  MoreHorizontal,
  Signal,
  Wifi,
  Battery,
  Home,
  Search,
  Bell,
  Mail,
  Feather,
} from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { SubmissionMockupData } from './types';
import { formatCompactNumber } from '@/lib/utils/format';

interface Props {
  data: SubmissionMockupData;
  onInspect?: () => void;
}

export default function TwitterPostMockup({ data, onInspect }: Props) {
  const [imgError, setImgError] = useState(false);
  const cleanHandle = data.creatorHandle.replace(/^@/, '');
  const displayName = data.creatorName || cleanHandle;

  return (
    <div
      onClick={onInspect}
      className="w-full h-full bg-white dark:bg-black text-slate-900 dark:text-white relative flex flex-col justify-between overflow-hidden select-none"
    >
      {/* 1. iOS Top Status Bar (Frames the Dynamic Island) */}
      <div className="relative z-20 pt-3 px-5 flex items-center justify-between text-[11px] font-semibold tracking-tight text-slate-900 dark:text-white">
        <span className="font-mono">9:41</span>
        {/* Dynamic Island Clearance Space (Island sits centered in SVG overlay) */}
        <div className="w-24 h-4" />
        <div className="flex items-center gap-1.5 opacity-90">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <Battery className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 2. X App Top Bar */}
      <div className="px-4 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden shrink-0">
          {data.creatorAvatarUrl ? (
            <img src={data.creatorAvatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] font-bold">
              {cleanHandle[0]?.toUpperCase() || 'X'}
            </div>
          )}
        </div>

        <FaXTwitter className="w-4 h-4 text-slate-900 dark:text-white" />

        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="px-2.5 py-0.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-bold"
        >
          Upgrade
        </button>
      </div>

      {/* 3. Feed Navigation Tabs */}
      <div className="flex border-b border-slate-100 dark:border-white/10 text-xs font-semibold">
        <div className="flex-1 text-center py-2 relative text-slate-900 dark:text-white">
          <span>For you</span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-blue-500" />
        </div>
        <div className="flex-1 text-center py-2 text-slate-400">
          <span>Following</span>
        </div>
      </div>

      {/* 4. Post Content Section */}
      <div className="p-3.5 flex-1 min-h-0 overflow-hidden flex flex-col space-y-2">
        {/* Author Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {data.creatorAvatarUrl ? (
              <img
                src={data.creatorAvatarUrl}
                alt={cleanHandle}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {cleanHandle[0]?.toUpperCase() || 'X'}
              </div>
            )}

            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs truncate max-w-[100px]">{displayName}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20 shrink-0" />
                {data.rank && (
                  <span className="text-[8px] font-mono px-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold">
                    #{data.rank}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                @{cleanHandle} · 2h
              </p>
            </div>
          </div>

          <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Tweet Body */}
        <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 line-clamp-3">
          {data.caption || `Delighted to announce our brand collaboration with ${data.brandName || 'partner'}! Check it out below 👇 #Kpugi #Partnership`}
        </p>

        {/* Media Attachment Canvas */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950 shrink-0">
          {data.mediaUrl && !imgError ? (
            <img
              src={data.mediaUrl}
              alt="X Post"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full p-3 bg-gradient-to-br from-blue-950/30 via-slate-900 to-black flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <FaXTwitter className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-left">
                <p className="font-bold text-xs text-white truncate">{data.brandName || 'Kpugi Campaign'}</p>
                <p className="text-[10px] text-slate-400 truncate">Verified Creator Syndication</p>
              </div>
            </div>
          )}

          {/* Live Views Pill */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{formatCompactNumber(data.viewsCount)} views</span>
          </div>
        </div>

        {/* Tweet Timestamp */}
        <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
          <span>9:41 AM · Sep 8, 2026</span>
          <span className="font-semibold text-blue-400">Ad Campaign Drop</span>
        </div>

        {/* Action Counters Row */}
        <div className="pt-1 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-mono">{formatCompactNumber(data.commentsCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Repeat2 className="w-3.5 h-3.5" />
            <span className="font-mono">{formatCompactNumber(data.sharesCount)}</span>
          </div>
          <div className="flex items-center gap-1 text-rose-500">
            <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
            <span className="font-mono">{formatCompactNumber(data.likesCount)}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400">
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="font-mono font-bold">{formatCompactNumber(data.viewsCount)}</span>
          </div>
          <Bookmark className="w-3.5 h-3.5" />
          <Share className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 5. Floating Compose Feather Button */}
      <div className="absolute bottom-12 right-4 z-20 pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg">
          <Feather className="w-4 h-4 ml-0.5" />
        </div>
      </div>

      {/* 6. X App Bottom Navigation Bar */}
      <div className="px-5 py-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <Home className="w-4 h-4 text-slate-900 dark:text-white" />
        <Search className="w-4 h-4" />
        <Bell className="w-4 h-4" />
        <Mail className="w-4 h-4" />
      </div>

      {/* 7. iOS Bottom Home Indicator Bar */}
      <div className="relative z-20 pb-1.5 pt-0.5 flex justify-center pointer-events-none">
        <div className="w-28 h-1 rounded-full bg-black/50 dark:bg-white/50" />
      </div>
    </div>
  );
}
