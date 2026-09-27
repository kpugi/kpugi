'use client';

import React from 'react';
import TrustpilotShowcaseSection from '@/components/trustpilot/TrustpilotShowcaseSection';

export default function HomeWallOfLove() {
  return (
    <section className="relative w-full py-20 md:py-28 overflow-hidden bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[800px] h-[350px] pointer-events-none z-0
          bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(0,182,122,0.08)_0%,rgba(47,73,232,0.02)_50%,transparent_75%)]
          dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(0,182,122,0.12)_0%,rgba(47,73,232,0.04)_50%,transparent_75%)]"
      />

      <div className="container mx-auto max-w-6xl px-4 relative z-10 space-y-10">
        
        {/* Section Header */}
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00b67a] animate-pulse" />
            Verified Social Proof &amp; Escrow Transparency
          </div>
          <h2 className="font-clash font-bold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] [text-wrap:balance]">
            Trusted by growth leaders and Nigerian creators
          </h2>
          <p className="font-satoshi text-slate-600 dark:text-white/50 text-sm sm:text-base mt-3 max-w-lg">
            See how brands eliminate ad waste and creators build dependable income streams.
          </p>
        </div>

        {/* Public Marketing Trustpilot Showcase */}
        <TrustpilotShowcaseSection />

      </div>
    </section>
  );
}
