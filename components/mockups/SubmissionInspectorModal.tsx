'use client';

import React, { useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Eye, Heart, MessageSquare, Share2, Clock, CheckCircle2 } from 'lucide-react';
import { SubmissionMockupData } from './types';
import SocialPostMockup from './SocialPostMockup';
import { formatCompactNumber } from '@/lib/utils/format';

interface Props {
  submission: SubmissionMockupData | null;
  onClose: () => void;
}

export default function SubmissionInspectorModal({ submission, onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!submission) return null;

  const cleanHandle = submission.creatorHandle.replace(/^@/, '');

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all overflow-y-auto min-h-screen w-screen"
    >
      <div className="bg-white dark:bg-[#0B1026] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto text-slate-900 dark:text-white flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Mockup Preview Display */}
        <div className="md:w-1/2 p-6 bg-slate-50 dark:bg-[#070B1A] border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 flex items-center justify-center">
          <div className="w-full max-w-sm pointer-events-none">
            <SocialPostMockup submission={submission} />
          </div>
        </div>

        {/* Right Column: Detailed Audit & Performance Metrics */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div>
            {/* Status & Network Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                {submission.platform}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                submission.status === 'verified_pass' || submission.status === 'paid'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
              }`}>
                {submission.status.replace('_', ' ')}
              </span>
              {submission.rank && (
                <span className="px-2 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                  Rank #{submission.rank}
                </span>
              )}
            </div>

            {/* Creator Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
              {submission.creatorAvatarUrl ? (
                <img
                  src={submission.creatorAvatarUrl}
                  alt={cleanHandle}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-white/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-base">
                  {cleanHandle[0]?.toUpperCase() || 'C'}
                </div>
              )}
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{submission.creatorName || cleanHandle}</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">@{cleanHandle}</p>
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>Verified Views</span>
                </div>
                <div className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
                  {submission.viewsCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Likes</span>
                </div>
                <div className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
                  {submission.likesCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Comments</span>
                </div>
                <div className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
                  {submission.commentsCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                  <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Shares</span>
                </div>
                <div className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
                  {submission.sharesCount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Payout & Settlement Info */}
            {submission.payoutAmount !== undefined && submission.payoutAmount !== null && (
              <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block">
                    Escrow Settlement Amount
                  </span>
                  <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-300 text-base">
                    ₦{submission.payoutAmount.toLocaleString()}
                  </span>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
            )}
          </div>

          {/* Action Links */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Close
            </button>

            {submission.postUrl && (
              <a
                href={submission.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-kpugi-blue hover:bg-blue-600 text-white font-sans text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Open Live Post on {submission.platform}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
