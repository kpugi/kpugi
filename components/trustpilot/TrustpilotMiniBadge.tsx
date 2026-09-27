'use client';

import React from 'react';

interface TrustpilotMiniBadgeProps {
  variant?: 'glass' | 'light' | 'strip';
  className?: string;
}

export default function TrustpilotMiniBadge({
  variant = 'glass',
  className = '',
}: TrustpilotMiniBadgeProps) {
  const targetReviewUrl =
    'https://www.trustpilot.com/evaluate/kpugi.onrender.com?utm_medium=trustbox&utm_source=ReviewCollector';

  // Strip variant for telemetry/trust signals strip
  if (variant === 'strip') {
    return (
      <a
        href={targetReviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Rated 4.9 / 5.0 on Trustpilot"
        className={`group hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1 text-xs sm:text-sm transition-colors duration-300 no-underline ${className}`}
      >
        <span className="w-4 h-4 bg-[#00b67a] text-white flex items-center justify-center text-[10px] rounded-sm font-bold shrink-0 shadow-2xs">
          ★
        </span>
        <span className="font-bold text-slate-900 dark:text-white">Trustpilot</span>
        <div className="flex items-center gap-0.5 text-[#00b67a] text-xs">
          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>
        <span className="text-slate-300 dark:text-white/20">|</span>
        <span className="text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold">
          4.9 / 5.0
        </span>
      </a>
    );
  }

  // Light variant for BrandHero or light sections
  if (variant === 'light') {
    return (
      <a
        href={targetReviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Rated 4.9 / 5.0 on Trustpilot"
        className={`inline-flex items-center gap-2.5 bg-white dark:bg-white/[0.03] px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-white/[0.08] backdrop-blur-md shadow-sm text-xs font-semibold text-slate-800 dark:text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00b67a]/50 group ${className}`}
      >
        <span className="w-4 h-4 bg-[#00b67a] text-white flex items-center justify-center text-[10px] rounded-sm font-bold shrink-0 shadow-2xs">
          ★
        </span>
        <span className="font-clash font-bold text-slate-900 dark:text-white tracking-tight">Trustpilot</span>
        <div className="flex items-center gap-0.5 text-[#00b67a] text-xs">
          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>
        <span className="text-slate-300 dark:text-white/20">|</span>
        <span className="text-slate-700 dark:text-slate-300 font-mono font-medium">4.9 / 5.0</span>
      </a>
    );
  }

  // Glass variant for HomeHero dark background
  return (
    <a
      href={targetReviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Rated 4.9 / 5.0 on Trustpilot"
      className={`inline-flex items-center gap-2.5 bg-white/20 border border-white/30 backdrop-blur-md rounded-2xl px-3.5 py-2 text-xs font-semibold text-white no-underline shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/30 group ${className}`}
    >
      <span className="w-4 h-4 bg-[#00b67a] text-white flex items-center justify-center text-[10px] rounded-sm font-bold shrink-0 shadow-2xs">
        ★
      </span>
      <span className="font-clash font-bold text-white tracking-tight">Trustpilot</span>
      <div className="flex items-center gap-0.5 text-emerald-300 text-xs">
        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
      </div>
      <span className="text-white/40">|</span>
      <span className="text-white/90 font-mono font-medium">4.9 / 5.0</span>
    </a>
  );
}
