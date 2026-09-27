'use client';

import React from 'react';
import { ExternalLink, Check, ShieldCheck, Zap, Activity, Clock } from 'lucide-react';
import { useTrustpilot } from '@/lib/trustpilot/useTrustpilot';

interface TrustpilotShowcaseSectionProps {
  className?: string;
}

export default function TrustpilotShowcaseSection({
  className = '',
}: TrustpilotShowcaseSectionProps) {
  const { data, evaluateUrl, reviewsUrl } = useTrustpilot();
  const hasReviews = data.hasReviews && data.reviews.length > 0 && data.trustScore !== null;

  return (
    <section className={`w-full ${className}`}>
      <div className="bg-white dark:bg-[#0E121E] rounded-3xl border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8 md:p-12 shadow-sm space-y-10">
        
        {/* Top Trust Score Summary Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-slate-100 dark:border-white/10 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black font-clash tracking-tight text-slate-900 dark:text-white">
                {hasReviews ? data.statusLabel || 'Excellent' : 'Trustpilot Reviews'}
              </span>

              {hasReviews ? (
                /* Dynamic Stars */
                <div className="flex items-center gap-1">
                  {[...Array(data.stars || 5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 bg-[#00b67a] flex items-center justify-center text-white text-xs font-bold rounded-sm shadow-sm"
                    >
                      ★
                    </div>
                  ))}
                </div>
              ) : (
                /* Trustpilot Pill */
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-[#00b67a] animate-pulse" />
                  Official Trustpilot Profile
                </span>
              )}
            </div>

            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap font-satoshi">
              {hasReviews ? (
                <>
                  <span>
                    Based on{' '}
                    <strong className="text-slate-800 dark:text-white font-semibold">
                      {data.reviewCount} verified review{data.reviewCount > 1 ? 's' : ''}
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    TrustScore {data.trustScore!.toFixed(1)} out of 5
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Official company profile on{' '}
                    <strong className="text-slate-800 dark:text-white font-semibold font-mono">
                      Trustpilot
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    100% Unedited Community Feedback
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Trustpilot Official Logo Lockup */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
              <div className="w-6 h-6 bg-[#00b67a] flex items-center justify-center text-white font-black text-sm rounded shadow-xs">
                ★
              </div>
              <span className="font-extrabold font-clash tracking-tight text-slate-900 dark:text-white text-sm">
                Trustpilot
              </span>
            </div>

            <a
              href={reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#2952E3] dark:text-[#5B7CFF] hover:underline flex items-center gap-1 transition"
            >
              <span>{hasReviews ? 'View all reviews' : 'View Trustpilot profile'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* ── CONDITIONAL SECTION: LIVE REVIEWS (WHEN RECEIVED) VS AUTHENTIC INVITATION ── */}
        {hasReviews ? (
          /* Live Dynamic Reviews Grid (Auto-updates with approved reviews) */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-[#F9FBFC] dark:bg-white/[0.02] p-6 flex flex-col justify-between hover:shadow-md dark:hover:border-white/15 transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 bg-[#00b67a] flex items-center justify-center text-white text-[10px] rounded-[2px]"
                        >
                          ★
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">
                      {new Date(rev.submittedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold font-clash text-slate-900 dark:text-white leading-snug">
                    &ldquo;{rev.title}&rdquo;
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-satoshi line-clamp-4">
                    {rev.text}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {rev.authorName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {rev.authorRole === 'advertiser' ? 'Verified Brand Account' : 'Verified Creator'}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Zero Mock Data: Authentic Invitation to Review Kpugi (Strictly No Incentives) */
          <div className="space-y-8">
            <div className="max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-bold font-clash text-slate-900 dark:text-white mb-2">
                Be Among the First to Review Kpugi on Trustpilot
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-satoshi">
                We believe in radical transparency. In an industry often clouded by delayed creator settlements and click fraud, Kpugi operates on audited institutional escrow and automated view verification. Share your honest experience to help establish Nigeria’s trusted standard.
              </p>
            </div>

            {/* 3 Authentic Trust Pillars (Product & Trust Values Only) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Pillar 1: Escrow */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-kpugi-blue dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold font-clash text-slate-900 dark:text-white">
                  100% Escrow Protection
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-satoshi">
                  Brand campaign budgets are locked securely in institutional escrow before creative production starts. Creators never chase delayed invoices.
                </p>
              </div>

              {/* Pillar 2: Direct Settlements */}
              <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10 p-5 sm:p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold font-clash text-slate-900 dark:text-white">
                  Fast Bank Settlements
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-satoshi">
                  Automatic disbursement directly to Nigerian bank accounts upon verified view delivery. Clean, predictable payouts with transparent accounting.
                </p>
              </div>

              {/* Pillar 3: Telemetry */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold font-clash text-slate-900 dark:text-white">
                  Automated View Auditing
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-satoshi">
                  Real-time scrapers read public views across TikTok, Instagram, and YouTube, eliminating bot inflation and manual log disputes.
                </p>
              </div>

            </div>

            {/* Public Action Bar: Strictly Compliant with Trustpilot Guidelines (No Incentives) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00b67a] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  ★
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Have you launched or earned on Kpugi?
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-satoshi">
                    Share your honest, unedited review on Trustpilot to help the community.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <a
                  href={evaluateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00b67a] hover:bg-[#009b67] text-white text-xs font-bold shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Write Review on Trustpilot</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={reviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold shadow-2xs transition"
                >
                  <span>View Trustpilot Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
