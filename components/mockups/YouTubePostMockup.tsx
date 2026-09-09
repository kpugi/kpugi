'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, ExternalLink, Play } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa6';
import { SubmissionMockupData } from './types';
import { formatCompactNumber } from '@/lib/utils/format';

interface Props {
  data: SubmissionMockupData;
  onInspect?: () => void;
}

export default function YouTubePostMockup({ data, onInspect }: Props) {
  const [imgError, setImgError] = useState(false);
  const cleanHandle = data.creatorHandle.replace(/^@/, '');

  return (
    <div
      onClick={onInspect}
      className="bg-white dark:bg-[#12141A] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer text-slate-900 dark:text-white"
    >
      {/* 1. Video Canvas */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
        {data.mediaUrl && !imgError ? (
          <img
            src={data.mediaUrl}
            alt="YouTube Video"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-red-950/40 via-slate-900 to-black text-slate-400 space-y-2">
            <FaYoutube className="w-12 h-12 text-red-600" />
            <p className="text-xs font-medium max-w-[200px] line-clamp-2 text-slate-300">
              {data.caption || 'YouTube Video / Shorts'}
            </p>
          </div>
        )}

        {/* Play Icon Badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 ml-0.5 fill-white" />
          </div>
        </div>

        {/* YouTube Badge */}
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold flex items-center gap-1 shadow">
          <FaYoutube className="w-3 h-3" />
          <span>YouTube</span>
        </div>

        {/* Views Counter Overlay */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{formatCompactNumber(data.viewsCount)} views</span>
        </div>

        {/* Video Duration */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold">
          {data.watchTimeSeconds ? `${Math.floor(data.watchTimeSeconds / 60)}:${String(Math.floor(data.watchTimeSeconds % 60)).padStart(2, '0')}` : '0:30'}
        </div>
      </div>

      {/* 2. Video Details */}
      <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="flex items-start gap-3">
          {/* Channel Avatar */}
          <div className="shrink-0">
            {data.creatorAvatarUrl ? (
              <img
                src={data.creatorAvatarUrl}
                alt={cleanHandle}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/10"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 font-bold text-xs flex items-center justify-center">
                {cleanHandle[0]?.toUpperCase() || 'Y'}
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs leading-snug line-clamp-2 text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
              {data.caption || `Sponsored video collaboration with ${data.brandName || 'Brand'}`}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{cleanHandle}</span>
              <span>•</span>
              <span>{formatCompactNumber(data.viewsCount)} views</span>
            </div>
          </div>
        </div>

        {/* 3. Action Buttons Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {/* Like Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 font-semibold text-slate-700 dark:text-slate-200">
              <ThumbsUp className="w-3.5 h-3.5 text-red-500" />
              <span className="font-mono text-[11px]">{formatCompactNumber(data.likesCount)}</span>
            </div>

            {/* Comments Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 font-semibold text-slate-700 dark:text-slate-200">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">{formatCompactNumber(data.commentsCount)}</span>
            </div>
          </div>

          {/* Direct Link */}
          {data.postUrl && (
            <a
              href={data.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:underline"
            >
              <span>Watch</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
