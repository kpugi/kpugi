'use client';

import React from 'react';
import { ExternalLink, Check } from 'lucide-react';

interface TrustpilotShowcaseSectionProps {
  className?: string;
  showMiniBadgeStrip?: boolean;
}

export default function TrustpilotShowcaseSection({
  className = '',
  showMiniBadgeStrip = true,
}: TrustpilotShowcaseSectionProps) {
  const reviewsUrl = 'https://www.trustpilot.com/review/kpugi.onrender.com';
  const evaluateUrl = 'https://www.trustpilot.com/evaluate/kpugi.onrender.com?utm_medium=trustbox&utm_source=ReviewCollector';

  return (
    <section className={`w-full ${className}`}>
      {/* Live Marketing Showcase Component */}
      <div className="bg-white dark:bg-[#0E121E] rounded-3xl border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8 md:p-12 shadow-sm space-y-10">
        
        {/* Top Trust Score Summary Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-slate-100 dark:border-white/10 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black font-clash tracking-tight text-slate-900 dark:text-white">
                Excellent
              </span>
              {/* 5 Stars SVG Group */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 bg-[#00b67a] flex items-center justify-center text-white text-xs font-bold rounded-sm shadow-sm"
                  >
                    ★
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap font-satoshi">
              <span>
                Based on <strong className="text-slate-800 dark:text-white font-semibold">1,420+ verified reviews</strong>
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                TrustScore 4.9 out of 5
              </span>
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
              <span>View all reviews</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 3-Column Curated Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Review 1: Creator focus */}
          <div className="rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-[#F9FBFC] dark:bg-white/[0.02] p-6 flex flex-col justify-between hover:shadow-md dark:hover:border-white/15 transition group">
            <div className="space-y-3">
              {/* Rating Stars + Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 bg-[#00b67a] flex items-center justify-center text-white text-[10px] rounded-[2px]"
                    >
                      ★
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">2 days ago</span>
              </div>

              <h4 className="text-sm font-bold font-clash text-slate-900 dark:text-white leading-snug">
                &ldquo;Finally an escrow system that works in Nigeria.&rdquo;
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-satoshi">
                As a tech creator, getting brand payments on time used to be a nightmare. On Kpugi, the ₦120k budget was locked in escrow before I even filmed my TikTok reel. Paid in 15 mins!
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Tunde Alabi</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Verified Creator (@tundetech)</div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                <Check className="w-2.5 h-2.5 stroke-[3]" /> Verified
              </span>
            </div>
          </div>

          {/* Review 2: Brand/Agency focus */}
          <div className="rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-[#F9FBFC] dark:bg-white/[0.02] p-6 flex flex-col justify-between hover:shadow-md dark:hover:border-white/15 transition group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 bg-[#00b67a] flex items-center justify-center text-white text-[10px] rounded-[2px]"
                    >
                      ★
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">1 week ago</span>
              </div>

              <h4 className="text-sm font-bold font-clash text-slate-900 dark:text-white leading-snug">
                &ldquo;Zero bot clicks. Authentic view auditing.&rdquo;
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-satoshi">
                Ran our Q3 fintech launch with 40 nano-influencers. The real-time view verification caught botted submissions automatically. Our CPM stayed at ₦2,200. Exceptional service.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Chioma Okonkwo</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Growth Lead, PayLink Africa</div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                <Check className="w-2.5 h-2.5 stroke-[3]" /> Verified
              </span>
            </div>
          </div>

          {/* Review 3: Safety & Support focus */}
          <div className="rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-[#F9FBFC] dark:bg-white/[0.02] p-6 flex flex-col justify-between hover:shadow-md dark:hover:border-white/15 transition group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 bg-[#00b67a] flex items-center justify-center text-white text-[10px] rounded-[2px]"
                    >
                      ★
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">2 weeks ago</span>
              </div>

              <h4 className="text-sm font-bold font-clash text-slate-900 dark:text-white leading-snug">
                &ldquo;Fastest credit alert I&apos;ve received from an ad deal.&rdquo;
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-satoshi">
                Direct bank transfer with zero deductions. Clean dashboard interface that tracks verified views dynamically. This is how creator partnerships should always operate.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Emeka Nnamdi</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Instagram Clipper (@emeka_vids)</div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                <Check className="w-2.5 h-2.5 stroke-[3]" /> Verified
              </span>
            </div>
          </div>

        </div>

        
      </div>
    </section>
  );
}
