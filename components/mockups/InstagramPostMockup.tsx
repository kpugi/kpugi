'use client';

import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
  CheckCircle2,
  Signal,
  Wifi,
  Battery,
  Home,
  Search,
  PlusSquare,
  Film,
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa6';
import { SubmissionMockupData } from './types';
import { formatCompactNumber } from '@/lib/utils/format';

interface Props {
  data: SubmissionMockupData;
  onInspect?: () => void;
}

export default function InstagramPostMockup({ data, onInspect }: Props) {
  const [imgError, setImgError] = useState(false);
  const cleanHandle = data.creatorHandle.replace(/^@/, '');
  const brandDisplay = data.brandName || 'Brand Partner';

  return (
    <div
      onClick={onInspect}
      className="w-full h-full bg-white dark:bg-[#000000] text-slate-900 dark:text-white relative flex flex-col justify-between overflow-hidden select-none"
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

      {/* 2. Instagram App Header */}
      <div className="px-4 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <FaInstagram className="w-4 h-4 text-pink-500" />
          <span className="font-serif italic font-bold text-sm tracking-tight text-slate-900 dark:text-white">
            Instagram
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          <Heart className="w-4 h-4" />
          <div className="relative">
            <Send className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
          </div>
        </div>
      </div>

      {/* 3. Post Author Header */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
            {data.creatorAvatarUrl ? (
              <img
                src={data.creatorAvatarUrl}
                alt={cleanHandle}
                className="w-7 h-7 rounded-full object-cover border-2 border-white dark:border-black"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-black">
                {cleanHandle[0]?.toUpperCase() || 'C'}
              </div>
            )}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs truncate max-w-[110px]">{cleanHandle}</span>
              <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0 fill-blue-500/20" />
              {data.rank && (
                <span className="text-[8px] font-mono px-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold">
                  #{data.rank}
                </span>
              )}
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
              Paid partnership with <span className="font-semibold text-slate-700 dark:text-slate-300">{brandDisplay}</span>
            </p>
          </div>
        </div>

        <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
      </div>

      {/* 4. Media Canvas */}
      <div className="relative aspect-square w-full bg-slate-950 overflow-hidden flex items-center justify-center shrink-0">
        {data.mediaUrl && !imgError ? (
          <img
            src={data.mediaUrl}
            alt="Instagram Post"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#405DE6]/30 via-[#833AB4]/30 to-[#E1306C]/30 text-slate-300 space-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FaInstagram className="w-5 h-5 text-white" />
            </div>
            <div className="relative z-10 max-w-[200px]">
              <p className="text-[11px] font-semibold text-white line-clamp-3 leading-snug">
                &ldquo;{data.caption || `New drop with ${brandDisplay}`}&rdquo;
              </p>
              <span className="text-[9px] text-slate-300 mt-1 block">@{cleanHandle}</span>
            </div>
          </div>
        )}

        {/* Live Views Counter Pill Overlay */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{formatCompactNumber(data.viewsCount)} views</span>
        </div>
      </div>

      {/* 5. Action Row */}
      <div className="px-3 pt-2 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
          <div className="flex items-center gap-1">
            <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500/20" />
            <span className="font-mono text-[10px] font-semibold">{formatCompactNumber(data.likesCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4.5 h-4.5" />
            <span className="font-mono text-[10px] font-semibold">{formatCompactNumber(data.commentsCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Send className="w-4 h-4" />
            <span className="font-mono text-[10px] font-semibold">{formatCompactNumber(data.sharesCount)}</span>
          </div>
        </div>
        <Bookmark className="w-4.5 h-4.5 text-slate-500" />
      </div>

      {/* 6. Caption & Comments Snippet */}
      <div className="px-3 text-[10px] leading-snug space-y-0.5 flex-1 min-h-0">
        <p className="line-clamp-2 text-slate-800 dark:text-slate-200">
          <span className="font-bold text-slate-900 dark:text-white mr-1">@{cleanHandle}</span>
          {data.caption || `Excited to partner with ${brandDisplay} on this launch! Check out the details.`}
        </p>
        <p className="text-[9px] text-slate-400 dark:text-slate-500 pt-0.5">
          View all {formatCompactNumber(data.commentsCount)} comments
        </p>
      </div>

      {/* 7. Instagram App Tab Bar */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-slate-600 dark:text-slate-400">
        <Home className="w-4 h-4 text-slate-900 dark:text-white" />
        <Search className="w-4 h-4" />
        <PlusSquare className="w-4 h-4" />
        <Film className="w-4 h-4" />
        <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-white/20 overflow-hidden">
          {data.creatorAvatarUrl ? (
            <img src={data.creatorAvatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[7px] font-bold">U</div>
          )}
        </div>
      </div>

      {/* 8. iOS Bottom Home Indicator Bar */}
      <div className="relative z-20 pb-1.5 pt-0.5 flex justify-center pointer-events-none">
        <div className="w-28 h-1 rounded-full bg-black/50 dark:bg-white/50" />
      </div>
    </div>
  );
}
