'use client';

import React from 'react';
import { useTrustpilot } from '@/lib/trustpilot/useTrustpilot';

interface TrustpilotMiniBadgeProps {
  variant?: 'glass' | 'light' | 'strip';
  className?: string;
}

export default function TrustpilotMiniBadge({
  variant = 'glass',
  className = '',
}: TrustpilotMiniBadgeProps) {
  const { evaluateUrl } = useTrustpilot();

  // Strip variant for telemetry / trust signals strip
  if (variant === 'strip') {
    return (
      <a
        href={evaluateUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Review Kpugi on Trustpilot"
        className={`group hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1 text-xs sm:text-sm transition-colors duration-300 no-underline ${className}`}
        title="Review Kpugi on Trustpilot"
      >
        <span className="w-4 h-4 bg-[#00b67a] text-white flex items-center justify-center text-[10px] rounded-sm font-bold shrink-0 shadow-2xs">
          ★
        </span>
        <span className="font-bold text-slate-900 dark:text-white">Trustpilot</span>
        <span className="text-slate-300 dark:text-white/20">|</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1">
          Review us
        </span>
      </a>
    );
  }

  // Light variant for BrandHero or light sections
  if (variant === 'light') {
    return (
      <a
        href={evaluateUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Review Kpugi on Trustpilot"
        className={`inline-flex items-center gap-2.5 bg-white dark:bg-white/[0.03] px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-white/[0.08] backdrop-blur-md shadow-sm text-xs font-semibold text-slate-800 dark:text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00b67a]/50 group ${className}`}
        title="Review Kpugi on Trustpilot"
      >
        <span className="w-4 h-4 bg-[#00b67a] text-white flex items-center justify-center text-[10px] rounded-sm font-bold shrink-0 shadow-2xs">
          ★
        </span>
        <span className="font-clash font-bold text-slate-900 dark:text-white tracking-tight">Trustpilot</span>
        <span className="text-slate-300 dark:text-white/20">|</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-medium">Review us</span>
      </a>
    );
  }

  // Glass variant for dark hero sections
  return (
    <a
      href={evaluateUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Review Kpugi on Trustpilot"
      className={`inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md rounded-2xl px-4 py-2 text-xs font-semibold text-white no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 group ${className}`}
      title="Review Kpugi on Trustpilot"
    >
      <span className="w-4 h-4 bg-[#00b67a] text-white flex items-center justify-center text-[10px] rounded-sm font-bold shrink-0 shadow-2xs">
        ★
      </span>
      <span className="font-clash font-bold tracking-tight">Trustpilot</span>
      <span className="text-white/40">|</span>
      <span className="text-emerald-300 font-medium">Review us</span>
    </a>
  );
}
