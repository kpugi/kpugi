'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Music, ExternalLink, Plus, Search, Wifi, Battery, Signal, CheckCircle2 } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa6';
import { SubmissionMockupData } from './types';
import { formatCompactNumber } from '@/lib/utils/format';

interface Props {
  data: SubmissionMockupData;
  onInspect?: () => void;
}

export default function TikTokPostMockup({ data, onInspect }: Props) {
  const [imgError, setImgError] = useState(false);
  const cleanHandle = data.creatorHandle.replace(/^@/, '');

  return (
    <div
      onClick={onInspect}
      className="w-full h-full bg-black text-white relative flex flex-col justify-between overflow-hidden select-none"
    >
      {/* 1. Full-Bleed Media Canvas */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        {data.mediaUrl && !imgError ? (
          <img
            src={data.mediaUrl}
            alt="TikTok Video"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 via-[#0a0c16] to-black text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-rose-500 p-0.5 shadow-2xl mb-3">
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                <FaTiktok className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-white max-w-[200px] line-clamp-3 leading-relaxed">
              &ldquo;{data.caption || `Sponsored Campaign Drop with ${data.brandName || 'Kpugi'}`}&rdquo;
            </p>
            <span className="text-[10px] text-cyan-400 mt-2 font-mono">@{cleanHandle}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* 2. iOS Top Status Bar (Frames the Dynamic Island) */}
      <div className="relative z-20 pt-3 px-5 flex items-center justify-between text-white text-[11px] font-semibold tracking-tight">
        <span className="font-mono">9:41</span>
        {/* Dynamic Island Clearance Space (Island sits centered in SVG overlay) */}
        <div className="w-24 h-4" />
        <div className="flex items-center gap-1.5 opacity-90">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <Battery className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 3. TikTok App Header Tabs */}
      <div className="relative z-10 px-4 pt-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] font-semibold tracking-wide">
          <span className="text-white/60 hover:text-white">LIVE</span>
          <span className="text-white/60 hover:text-white">Following</span>
          <div className="flex flex-col items-center">
            <span className="text-white font-bold">For You</span>
            <span className="w-4 h-0.5 rounded-full bg-white mt-0.5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Views Counter Pill */}
          <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{formatCompactNumber(data.viewsCount)}</span>
          </div>
          <Search className="w-3.5 h-3.5 text-white/80" />
        </div>
      </div>

      {/* 4. Right Floating Action Stack */}
      <div className="relative z-10 mt-auto ml-auto pr-2.5 pb-2 flex flex-col items-center gap-2.5">
        {/* Profile Avatar with Plus Badge */}
        <div className="relative mb-0.5">
          {data.creatorAvatarUrl ? (
            <img
              src={data.creatorAvatarUrl}
              alt={cleanHandle}
              className="w-9 h-9 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-rose-500 flex items-center justify-center text-xs font-bold border-2 border-white">
              {cleanHandle[0]?.toUpperCase() || 'C'}
            </div>
          )}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow">
            <Plus className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        </div>

        {/* Like */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500" />
          </div>
          <span className="text-[9px] font-mono font-bold mt-0.5">{formatCompactNumber(data.likesCount)}</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <MessageCircle className="w-4.5 h-4.5 text-white fill-white/10" />
          </div>
          <span className="text-[9px] font-mono font-bold mt-0.5">{formatCompactNumber(data.commentsCount)}</span>
        </div>

        {/* Bookmark */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <Bookmark className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-[9px] font-mono font-bold mt-0.5">Save</span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <Share2 className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-[9px] font-mono font-bold mt-0.5">{formatCompactNumber(data.sharesCount)}</span>
        </div>

        {/* Spinning Music Disc */}
        <div
          className="w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-700 animate-spin flex items-center justify-center shadow-lg"
          style={{ animationDuration: '4s' }}
        >
          <div className="w-2 h-2 rounded-full bg-white/40" />
        </div>
      </div>

      {/* 5. Bottom Metadata & Caption Area */}
      <div className="relative z-10 px-3.5 pb-1 max-w-[80%] space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs tracking-wide text-white">@{cleanHandle}</span>
          <CheckCircle2 className="w-3 h-3 text-cyan-400 fill-cyan-400/20" />
          {data.rank && (
            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
              #{data.rank}
            </span>
          )}
        </div>

        <p className="text-[11px] text-white/90 line-clamp-2 leading-tight font-sans">
          {data.caption || `Excited to partner with ${data.brandName || 'our brand partner'}! Check out the details.`}
        </p>

        <div className="flex items-center gap-1 text-[9px] text-white/70 pt-0.5">
          <Music className="w-2.5 h-2.5 shrink-0 animate-pulse text-cyan-400" />
          <span className="truncate">Original Sound - @{cleanHandle}</span>
        </div>

        {data.postUrl && (
          <div className="pt-0.5">
            <a
              href={data.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-400 hover:text-cyan-300 underline"
            >
              <span>Live Post</span>
              <ExternalLink className="w-2 h-2" />
            </a>
          </div>
        )}
      </div>

      {/* 6. iOS Bottom Home Indicator Bar */}
      <div className="relative z-20 pb-1.5 pt-1 flex justify-center pointer-events-none">
        <div className="w-28 h-1 rounded-full bg-white/60" />
      </div>
    </div>
  );
}
