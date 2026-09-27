'use client';

import React from 'react';
import { Check, ChevronRight, Star, ShieldCheck, ExternalLink } from 'lucide-react';
import { useTrustpilot } from '@/lib/trustpilot/useTrustpilot';

interface TrustpilotShowcaseSectionProps {
  className?: string;
}

export default function TrustpilotShowcaseSection({
  className = '',
}: TrustpilotShowcaseSectionProps) {
  const { data, evaluateUrl, reviewsUrl } = useTrustpilot();

  const realReviews = data.reviews || [];
  const reviewCount = data.reviewCount || realReviews.length;
  const trustScoreFormatted = data.trustScore ? data.trustScore.toFixed(1) : '5.0';

  return (
    <section className={`w-full ${className}`}>
      <div className="bg-white dark:bg-[#0E121E] rounded-[28px] sm:rounded-[36px] border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-10 md:p-12 shadow-sm space-y-8">
        
        {/* Top Header Bar (Matching design) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-extrabold font-clash tracking-tight text-slate-900 dark:text-white">
                {data.statusLabel || 'Excellent'}
              </h2>

              {/* 5 Green Square Blocks */}
              <div className="flex items-center gap-1">
                {[...Array(data.stars || 5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 bg-[#00B67A] rounded-[3px] flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0"
                  >
                    ★
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-satoshi flex items-center gap-2 flex-wrap">
              <span>
                Based on{' '}
                <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                  {reviewCount} verified review{reviewCount !== 1 ? 's' : ''}
                </strong>
              </span>
              <span className="text-slate-300 dark:text-white/20">•</span>
              <span>
                TrustScore{' '}
                <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                  {trustScoreFormatted} out of 5
                </strong>
              </span>
            </p>
          </div>

          {/* Right Action Lockup: Official Trustpilot Pill + View All Link */}
          <div className="flex items-center gap-4 shrink-0">
            <a
              href={evaluateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] border border-slate-200/80 dark:border-white/10 transition group"
              title="Review Kpugi on Trustpilot"
            >
              <div className="w-5 h-5 bg-[#00B67A] rounded-[3px] flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-2xs">
                ★
              </div>
              <span className="font-clash font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                Trustpilot
              </span>
            </a>

            <a
              href={reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-semibold text-[#2952E3] dark:text-[#5B7CFF] hover:underline inline-flex items-center gap-0.5 transition"
            >
              <span>View all reviews</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </a>
          </div>
        </div>

        {/* 3 Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Render real verified reviews */}
          {realReviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="bg-[#F8FAFC] dark:bg-white/[0.02] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/[0.06] p-6 sm:p-7 flex flex-col justify-between hover:shadow-md dark:hover:border-white/15 transition-all duration-200 group"
            >
              <div className="space-y-4">
                {/* 5 Green Star Blocks & Relative Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 bg-[#00B67A] rounded-[2px] flex items-center justify-center text-white text-[10px] shadow-2xs shrink-0"
                      >
                        ★
                      </div>
                    ))}
                  </div>

                  {rev.relativeTime && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-satoshi font-medium">
                      {rev.relativeTime}
                    </span>
                  )}
                </div>

                {/* Review Title */}
                <h3 className="font-clash font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                  &ldquo;{rev.title}&rdquo;
                </h3>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-satoshi">
                  {rev.text}
                </p>
              </div>

              {/* Card Footer: Author & Verified Badge */}
              <div className="pt-5 mt-6 border-t border-slate-200/60 dark:border-white/[0.08] flex items-center justify-between gap-2">
                <div className="min-w-0 pr-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {rev.authorName}
                  </h4>
                  {rev.authorSubtitle && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-satoshi">
                      {rev.authorSubtitle}
                    </p>
                  )}
                </div>

                <a
                  href={rev.proofUrl || reviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00B67A] dark:text-[#00c987] bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0 hover:bg-emerald-100/90 transition"
                  title="Verified on Trustpilot"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Verified</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                </a>
              </div>
            </div>
          ))}

          {/* If under 2 reviews, render Invitation Card */}
          {realReviews.length < 2 && (
            <div className="bg-[#F8FAFC]/50 dark:bg-white/[0.01] rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between hover:border-[#00B67A]/50 transition group">
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-[#00B67A] flex items-center justify-center">
                  <Star className="w-5 h-5 fill-[#00B67A]" />
                </div>
                <h3 className="font-clash font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                  Have you earned or launched on Kpugi?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-satoshi">
                  Share your honest experience on Trustpilot. Your feedback directly shapes escrow and creator milestones across Nigeria.
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-slate-200/60 dark:border-white/[0.08]">
                <a
                  href={evaluateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B67A] hover:underline"
                >
                  <span>Write a review on Trustpilot</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* If under 3 reviews, render Trust & Escrow Guarantee Card */}
          {realReviews.length < 3 && (
            <div className="bg-[#F8FAFC]/50 dark:bg-white/[0.01] rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/20 transition group">
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-kpugi-blue dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-clash font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                  100% Escrow &amp; Automated Payouts
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-satoshi">
                  Brand budgets are deposited into institutional escrow before creative production. Nigerian creators receive direct bank releases with zero delay.
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-slate-200/60 dark:border-white/[0.08]">
                <a
                  href={reviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#00B67A] transition"
                >
                  <span>View official Trustpilot profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
