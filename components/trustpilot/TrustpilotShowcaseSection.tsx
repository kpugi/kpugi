'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import {
  TRUSTPILOT_DOMAIN,
  TRUSTPILOT_EVALUATE_URL,
  TRUSTPILOT_REVIEWS_URL,
} from '@/lib/trustpilot/trustpilotService';

interface TrustpilotShowcaseSectionProps {
  className?: string;
}

const BUSINESS_UNIT_ID =
  process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_UNIT_ID || '6abeaa6fd048c519cb01996a';
const TEMPLATE_ID =
  process.env.NEXT_PUBLIC_TRUSTPILOT_TEMPLATE_ID || '56278e9abfbbba0bdcd568bc';
const TOKEN =
  process.env.NEXT_PUBLIC_TRUSTPILOT_TOKEN || 'd8a81077-6dbe-473e-a337-f85b9619ab84';

export default function TrustpilotShowcaseSection({
  className = '',
}: TrustpilotShowcaseSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Re-trigger Trustpilot widget loading whenever mounted
  const initWidget = () => {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { Trustpilot?: { loadFromElement: (el: HTMLElement | null, force?: boolean) => void } }).Trustpilot &&
      ref.current
    ) {
      (window as unknown as { Trustpilot: { loadFromElement: (el: HTMLElement | null, force?: boolean) => void } }).Trustpilot.loadFromElement(
        ref.current,
        true
      );
    }
  };

  useEffect(() => {
    initWidget();
    const t1 = setTimeout(initWidget, 500);
    const t2 = setTimeout(initWidget, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <section className={`w-full ${className}`}>
      {/* Official Trustpilot Bootstrap Script */}
      <Script
        src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="lazyOnload"
        onLoad={initWidget}
      />

      <div className="bg-white dark:bg-[#0E121E] rounded-[28px] sm:rounded-[36px] border border-slate-200/80 dark:border-white/[0.08] p-8 sm:p-12 shadow-sm max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00b67a]" />
            Official Trustpilot Verification
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-clash tracking-tight text-slate-900 dark:text-white">
            Customer Reviews on Trustpilot
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-satoshi">
            Verified creator and brand reviews for <strong className="text-slate-800 dark:text-white font-mono">{TRUSTPILOT_DOMAIN}</strong>.
          </p>
        </div>

        {/* Official TrustBox Widget (Review Collector - 100% Trustpilot Brand Compliant) */}
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/10 flex items-center justify-center min-h-[70px]">
          <div
            ref={ref}
            className="trustpilot-widget w-full"
            data-locale="en-US"
            data-template-id={TEMPLATE_ID}
            data-businessunit-id={BUSINESS_UNIT_ID}
            data-style-height="52px"
            data-style-width="100%"
            data-token={TOKEN}
            data-theme="light"
          >
            <a
              href={TRUSTPILOT_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#00b67a] hover:underline"
            >
              Trustpilot
            </a>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-satoshi">
          <span className="text-slate-500 dark:text-slate-400">
            Have you worked with Kpugi? Share your experience to help the community.
          </span>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={TRUSTPILOT_EVALUATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00b67a] hover:bg-[#009b67] text-white text-xs font-bold transition shadow-xs"
            >
              <span>Write a Review</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>

            <a
              href={TRUSTPILOT_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
