'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';
import { Star, CheckCircle2 } from 'lucide-react';

interface TrustBoxWidgetProps {
  businessUnitId?: string;
  templateId?: string;
  token?: string;
  theme?: 'light' | 'dark';
  height?: string;
  width?: string;
  className?: string;
  variant?: 'hero-dark' | 'brand-light' | 'official';
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

  // Light Hero Variant: sleek pill badge that links directly to evaluate/review
  if (variant === 'brand-light') {
    return (
      <a
        href="https://www.trustpilot.com/evaluate/kpugi.onrender.com?utm_medium=trustbox&utm_source=ReviewCollector"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2.5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] backdrop-blur-md rounded-xl px-3.5 py-2 no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00B67A]/40 group ${className}`}
      >
        <div className="w-6 h-6 rounded-md bg-[#00B67A] flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(0,182,122,0.35)]">
          <Star className="h-3.5 w-3.5 fill-white text-white" />
        </div>
        <div className="text-left flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-clash font-bold text-slate-900 dark:text-white leading-none">
              Trustpilot
            </span>
            <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-300" />
              Claimed
            </span>
          </div>
          <span className="text-[11px] font-satoshi text-slate-500 dark:text-white/60 mt-1 leading-none group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            Review us on <strong className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2">Trustpilot</strong>
          </span>
        </div>
      </a>
    );
  }

  // Dark Hero Variant: sleek pill badge for dark backgrounds
  return (
    <a
      href="https://www.trustpilot.com/evaluate/kpugi.onrender.com?utm_medium=trustbox&utm_source=ReviewCollector"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 bg-white/20 border border-white/30 backdrop-blur-md rounded-2xl px-3.5 py-2 no-underline text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/30 group ${className}`}
    >
      <div className="w-6 h-6 rounded-md bg-[#00B67A] flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(0,182,122,0.4)]">
        <Star className="h-3.5 w-3.5 fill-white text-white" />
      </div>
      <div className="text-left flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-clash font-bold text-white leading-none">
            Trustpilot
          </span>
          <span className="inline-flex items-center gap-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-emerald-400/30">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" />
            Claimed
          </span>
        </div>
        <span className="text-[11px] font-satoshi text-white/80 mt-1 leading-none group-hover:text-white transition-colors">
          Review us on <strong className="text-emerald-300 underline underline-offset-2">Trustpilot</strong>
        </span>
      </div>
    </a>
  );
}
