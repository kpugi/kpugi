'use client';

import React from 'react';
import Image from 'next/image';
import {
  Star,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Award,
  ShieldCheck,
  Clock,
  Pencil,
} from 'lucide-react';
import { CampaignReviewDisplayItem, CampaignReviewsSummary } from '@/app/actions/reviews';

interface CampaignReviewsDisplayProps {
  summary: CampaignReviewsSummary;
  variant?: 'all' | 'single';
  ownReview?: CampaignReviewDisplayItem | null;
  title?: string;
  subtitle?: string;
  className?: string;
}

// Sentiment Emoji & Color helper
function getSentimentBadge(sentimentId: string) {
  switch (sentimentId) {
    case 'legendary':
      return {
        label: 'Legendary! 🚀',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      };
    case 'great':
      return {
        label: 'Great 😄',
        bg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/20',
      };
    case 'decent':
      return {
        label: 'Decent 🙂',
        bg: 'bg-lime-500/10 dark:bg-lime-500/20 text-lime-700 dark:text-lime-300 border-lime-500/20',
      };
    case 'mediocre':
      return {
        label: 'Mediocre 😕',
        bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/20',
      };
    case 'poor':
      return {
        label: 'Poor 😫',
        bg: 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/20',
      };
    default:
      return {
        label: 'Great 😄',
        bg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/20',
      };
  }
}

function formatRelativeTime(dateString?: string | null) {
  if (!dateString) return 'Recently';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recently';
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - d.getTime());
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears}y ago`;
  } catch {
    return 'Recently';
  }
}

export function CampaignReviewsDisplay({
  summary,
  variant = 'all',
  ownReview,
  title,
  subtitle,
  className = '',
}: CampaignReviewsDisplayProps) {
  const { averageRating, totalReviews, topTags, reviews } = summary;

  // ─── 1. CREATOR'S OWN REVIEW CARD (SINGLE VARIANT) ─────────────────────────
  if (variant === 'single') {
    if (!ownReview) return null;
    const rawReview = ownReview as any;
    const sentimentId = ownReview.sentimentId || rawReview.sentiment_id || 'great';
    const rating = ownReview.rating ?? rawReview.rating ?? 5;
    const createdAt = ownReview.createdAt || rawReview.created_at || rawReview.updated_at || null;
    const tags = (ownReview.tags && ownReview.tags.length > 0) ? ownReview.tags : (rawReview.tags || []);
    const comment = ownReview.comment || rawReview.comment || null;
    const metricsHighlight = ownReview.metricsHighlight || rawReview.metrics_highlight || null;

    const sentiment = getSentimentBadge(sentimentId);

    return (
      <div
        className={`p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-4 ${className}`}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-kpugi-border dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              <Star className="size-5 fill-current text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-kpugi-ink dark:text-white">
                  Your Verified Review
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  {rating}.0 ★ Verified
                </span>
              </div>
              <span className="text-xs text-kpugi-slate dark:text-slate-400">
                Submitted {formatRelativeTime(createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Sentiment & Highlight */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${sentiment.bg}`}
          >
            {sentiment.label}
          </span>

          {metricsHighlight && (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10">
              📊 {metricsHighlight}
            </span>
          )}
        </div>

        {/* Tag pills */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Comment */}
        {comment && (
          <p className="font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/60 dark:border-white/5">
            &ldquo;{comment}&rdquo;
          </p>
        )}
      </div>
    );
  }

  // ─── 2. ALL PARTICIPANTS' REVIEWS (PUBLIC & BRAND DASHBOARD) ────────────────
  if (totalReviews === 0) {
    return (
      <div
        className={`p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm text-center space-y-3 ${className}`}
      >
        <div className="size-12 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
          <MessageSquare className="size-6" />
        </div>
        <h3 className="font-display font-bold text-base text-kpugi-ink dark:text-white">
          No Reviews Yet
        </h3>
        <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Participant reviews and sentiment ratings will appear here once campaign creators finish their verification and leave feedback.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-6 ${className}`}
    >
      {/* Header & Aggregate Score */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-kpugi-border dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              ⭐ Verified Participant Feedback
            </span>
          </div>
          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-kpugi-ink dark:text-white">
            {title || 'Campaign Reviews & Experiences'}
          </h3>
          <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400 max-w-lg">
            {subtitle || 'Real feedback from creators who claimed slots and delivered verified views for this campaign.'}
          </p>
        </div>

        {/* Scorecard Hero */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shrink-0">
          <div className="text-center pr-3 border-r border-slate-200 dark:border-white/10">
            <div className="font-display text-3xl font-black text-kpugi-ink dark:text-white flex items-center justify-center gap-1">
              <span>{averageRating.toFixed(1)}</span>
              <Star className="size-6 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
              Out of 5.0
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="font-display font-bold text-xs text-slate-900 dark:text-white">
              {totalReviews} Verified {totalReviews === 1 ? 'Review' : 'Reviews'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              <span>100% Verified Payouts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Praise Tag Cloud */}
      {topTags.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            What creators highlighted most:
          </span>
          <div className="flex flex-wrap gap-2">
            {topTags.map((t) => (
              <span
                key={t.tag}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#2F49E8]/10 dark:bg-[#2F49E8]/20 text-[#2F49E8] dark:text-blue-300 border border-[#2F49E8]/20 flex items-center gap-1.5"
              >
                <span>{t.tag}</span>
                <span className="size-4 rounded-full bg-[#2F49E8] text-white text-[9px] font-extrabold flex items-center justify-center">
                  {t.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {reviews.map((review) => {
          const sentiment = getSentimentBadge(review.sentimentId);

          return (
            <div
              key={review.id}
              className="p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-3.5 flex flex-col justify-between hover:border-kpugi-blue/30 transition-all shadow-2xs"
            >
              <div className="space-y-3">
                {/* Author Info & Rating */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {review.reviewerAvatar ? (
                      <img
                        src={review.reviewerAvatar}
                        alt={review.reviewerName}
                        className="size-9 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="size-9 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center uppercase shrink-0">
                        {review.reviewerName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-display font-bold text-xs sm:text-sm text-slate-950 dark:text-white truncate">
                        {review.reviewerName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>{review.reviewerHandle}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Star Rating Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20 shrink-0">
                    <Star className="size-3 fill-current" />
                    <span>{review.rating}.0</span>
                  </div>
                </div>

                {/* Sentiment Pill & Highlight */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sentiment.bg}`}>
                    {sentiment.label}
                  </span>

                  {review.metricsHighlight && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10">
                      📊 {review.metricsHighlight}
                    </span>
                  )}
                </div>

                {/* Selected Tag Pills */}
                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comment Text */}
                {review.comment && (
                  <p className="font-sans text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                )}
              </div>

              {/* Timestamp footer */}
              <div className="pt-2 border-t border-slate-200/40 dark:border-white/5 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Completed drop</span>
                <span>{formatRelativeTime(review.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CampaignReviewsDisplay;
