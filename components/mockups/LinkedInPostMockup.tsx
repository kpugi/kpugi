'use client';

import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Repeat2, Send, Globe, MoreHorizontal, ExternalLink } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa6';
import { SubmissionMockupData } from './types';
import { formatCompactNumber } from '@/lib/utils/format';

interface Props {
  data: SubmissionMockupData;
  onInspect?: () => void;
}

export default function LinkedInPostMockup({ data, onInspect }: Props) {
  const [imgError, setImgError] = useState(false);
  const cleanHandle = data.creatorHandle.replace(/^@/, '');
  const displayName = data.creatorName || cleanHandle;

  return (
    <div
      onClick={onInspect}
      className="bg-white dark:bg-[#12141A] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer text-slate-900 dark:text-white"
    >
      {/* 1. Header */}
      <div className="p-3.5 flex items-start justify-between">
        <div className="flex items-start gap-2.5 min-w-0">
          {data.creatorAvatarUrl ? (
            <img
              src={data.creatorAvatarUrl}
              alt={cleanHandle}
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#0A66C2] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {displayName[0]?.toUpperCase() || 'L'}
            </div>
          )}

          <div className="min-w-0">
            <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white">{displayName}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              Content Creator • Brand Ambassador
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
              <span>{data.submittedAt ? new Date(data.submittedAt).toLocaleDateString() : 'Recent'}</span>
              <span>•</span>
              <Globe className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>

        <FaLinkedin className="w-4 h-4 text-[#0A66C2] shrink-0" />
      </div>

      {/* 2. Caption Text */}
      <div className="px-3.5 pb-2.5 text-xs leading-relaxed text-slate-800 dark:text-slate-200 line-clamp-3">
        {data.caption || `Pleased to share our latest project spotlight with ${data.brandName || 'our brand partner'}.`}
      </div>

      {/* 3. Media Canvas */}
      {data.mediaUrl && !imgError && (
        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
          <img
            src={data.mediaUrl}
            alt="LinkedIn Post"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Views badge */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold">
            {formatCompactNumber(data.viewsCount)} views
          </div>
        </div>
      )}

      {/* 4. Reaction Stats */}
      <div className="px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#0A66C2] text-white text-[9px] flex items-center justify-center">👍</span>
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center">👏</span>
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center">💡</span>
          </div>
          <span className="font-mono font-semibold ml-1">{formatCompactNumber(data.likesCount)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span>{formatCompactNumber(data.commentsCount)} comments</span>
          <span>•</span>
          <span>{formatCompactNumber(data.sharesCount)} reposts</span>
        </div>
      </div>

      {/* 5. Action Buttons */}
      <div className="px-1 py-1.5 flex items-center justify-around text-xs text-slate-600 dark:text-slate-300 font-semibold">
        <button className="flex-1 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center gap-1 transition-colors">
          <ThumbsUp className="w-3.5 h-3.5 text-[#0A66C2]" />
          <span className="text-[11px]">Like</span>
        </button>
        <button className="flex-1 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center gap-1 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="text-[11px]">Comment</span>
        </button>
        <button className="flex-1 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center gap-1 transition-colors">
          <Repeat2 className="w-3.5 h-3.5" />
          <span className="text-[11px]">Repost</span>
        </button>
        <button className="flex-1 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center gap-1 transition-colors">
          <Send className="w-3.5 h-3.5" />
          <span className="text-[11px]">Send</span>
        </button>
      </div>

      {/* 6. Live Link Footer */}
      {data.postUrl && (
        <div className="p-2 px-3.5 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex justify-end">
          <a
            href={data.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#0A66C2] hover:underline"
          >
            <span>View on LinkedIn</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
