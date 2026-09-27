'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

interface TrustBoxWidgetProps {
  businessUnitId?: string;
  templateId?: string;
  token?: string;
  theme?: 'light' | 'dark';
  height?: string;
  width?: string;
  className?: string;
  variant?: 'hero-dark' | 'brand-light' | 'official' | 'compact';
}

/** Authentic Trustpilot Star SVG with official dual-shade star point */
export function TrustpilotStarIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2l2.9 6.8 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.7 7.1-.6L12 2z"
        fill="#00B67A"
      />
      <path
        d="M10.8 13.9l-4.6 4 1.3-5.7-4.4-3.8 5.8-.5 1.9-5.6v11.6z"
        fill="#005128"
      />
    </svg>
  );
}

/** 5 Authentic Green Square Blocks with White Star */
export function TrustpilotRatingStars({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const boxDim = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const starDim = size === 'md' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  return (
    <div className="flex items-center gap-[2px]">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`${boxDim} bg-[#00B67A] rounded-[2px] flex items-center justify-center shrink-0 shadow-[0_1px_3px_rgba(0,182,122,0.3)]`}
        >
          <svg className={`${starDim} fill-white text-white`} viewBox="0 0 24 24">
            <path d="M12 1.5l3.09 6.26 6.91 1-5 4.87 1.18 6.88L12 17.27l-6.18 3.24 1.18-6.88-5-4.87 6.91-1L12 1.5z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

export default function TrustBoxWidget({
  businessUnitId = process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_UNIT_ID || '6ab67cd5faa4339a08791f6e',
  templateId = process.env.NEXT_PUBLIC_TRUSTPILOT_TEMPLATE_ID || '56278e9abfbbba0bdcd568bc',
  token = process.env.NEXT_PUBLIC_TRUSTPILOT_TOKEN || '4cb400a7-9675-4254-a346-b700870fe3db',
  theme = 'dark',
  height = '52px',
  width = '100%',
  className = '',
  variant = 'hero-dark',
}: TrustBoxWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as unknown as { Trustpilot?: { loadFromElement: (el: HTMLElement | null, force?: boolean) => void } }).Trustpilot && ref.current) {
      (window as unknown as { Trustpilot: { loadFromElement: (el: HTMLElement | null, force?: boolean) => void } }).Trustpilot.loadFromElement(ref.current, true);
    }
  }, [businessUnitId, templateId, token]);

  const targetReviewUrl = 'https://www.trustpilot.com/evaluate/kpugi.onrender.com?utm_medium=trustbox&utm_source=ReviewCollector';

  // If official Review Collector TrustBox is requested, render Trustpilot's iframe container
  if (variant === 'official') {
    return (
      <div className={className}>
        <Script
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          strategy="lazyOnload"
          onLoad={() => {
            if (typeof window !== 'undefined' && (window as unknown as { Trustpilot?: { loadFromElement: (el: HTMLElement | null, force?: boolean) => void } }).Trustpilot && ref.current) {
              (window as unknown as { Trustpilot: { loadFromElement: (el: HTMLElement | null, force?: boolean) => void } }).Trustpilot.loadFromElement(ref.current, true);
            }
          }}
        />
        <div
          ref={ref}
          className="trustpilot-widget"
          data-locale="en-US"
          data-template-id={templateId}
          data-businessunit-id={businessUnitId}
          data-token={token}
          data-style-height={height}
          data-style-width={width}
          data-theme={theme}
        >
          <a
            href="https://www.trustpilot.com/review/kpugi.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Trustpilot
          </a>
        </div>
      </div>
    );
  }

  // Light Hero Variant: Mini Badge Variant for light & dark neutral backgrounds
  if (variant === 'brand-light') {
    return (
      <a
        href={targetReviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Rated 4.9 / 5.0 on Trustpilot"
        className={`inline-flex items-center gap-2 bg-white dark:bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/[0.1] backdrop-blur-md shadow-sm text-xs font-semibold text-slate-800 dark:text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00b67a]/50 group ${className}`}
      >
        <span className="w-4 h-4 bg-[#00b67a] text-white flex items-center justify-center text-[10px] rounded-sm font-bold shadow-2xs shrink-0">
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

  // Dark Hero Variant: Mini Badge Variant for dark glassmorphic backgrounds (HomeHero32)
  return (
    <a
      href={targetReviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Rated 4.9 / 5.0 on Trustpilot"
      className={`inline-flex items-center gap-2 bg-white/20 border border-white/30 backdrop-blur-md rounded-full px-3.5 py-1.5 text-xs font-semibold text-white no-underline shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/30 group ${className}`}
    >
      <span className="w-4 h-4 bg-[#00b67a] text-white flex items-center justify-center text-[10px] rounded-sm font-bold shadow-2xs shrink-0">
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
