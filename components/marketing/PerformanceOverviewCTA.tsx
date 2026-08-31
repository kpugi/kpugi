'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface PerformanceOverviewProps {
  title?: string;
  accentWord?: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

export function PerformanceOverview({
  title = 'Turn Views into Direct',
  accentWord = 'Cash',
  subtitle = "Nigeria's #1 automated performance ad network. Earn per 1,000 verified views or launch high-yield campaign drops with guaranteed Friday direct bank payouts.",
  ctaLabel = 'Get Started Now',
  onCtaClick,
}: PerformanceOverviewProps) {
  const router = useRouter();

  const handleCta = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      router.push('/sign-up');
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-transparent text-slate-900 dark:text-white py-16 sm:py-24">
      
      {/* ─── AMBIENT GLOWING RADIAL HIGHLIGHTS ──────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-3xl pointer-events-none opacity-25 dark:opacity-20"
      >
        <div
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
          className="aspect-[577/310] w-[46rem] bg-gradient-to-r from-[#2F49E8] via-indigo-500 to-emerald-500 opacity-35"
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute top-1/2 left-[max(35rem,calc(50%+10rem))] -z-10 -translate-y-1/2 transform-gpu blur-3xl pointer-events-none opacity-25 dark:opacity-20"
      >
        <div
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
          className="aspect-[577/310] w-[42rem] bg-gradient-to-r from-[#2F49E8] via-teal-500 to-emerald-400 opacity-35"
        />
      </div>

      {/* ─── FULL WIDTH EDGE-TO-EDGE INNER CONTAINER ──────────────────────── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* ─── LEFT: TITLE + SUBTITLE + CTA BUTTONS ─────────────────────── */}
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <h2 className="text-slate-900 dark:text-white text-3xl font-extrabold font-display tracking-tight sm:text-4xl md:text-5xl lg:text-6xl leading-[1.08]">
              {title} <span className="text-[#2F49E8] dark:text-[#5B7CFF]">{accentWord}</span>
            </h2>

            <p className="text-slate-600 dark:text-white/60 max-w-xl text-base sm:text-lg leading-relaxed">
              {subtitle}
            </p>

            <div className="mt-3 flex items-center gap-4 flex-wrap justify-center lg:justify-start">
              <button
                onClick={handleCta}
                className="h-12 sm:h-13 rounded-full bg-[#2F49E8] hover:bg-blue-600 text-white font-bold px-8 text-sm shadow-xl shadow-blue-500/25 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              >
                {ctaLabel}
              </button>
              <Link
                href="/browse"
                className="h-12 sm:h-13 inline-flex items-center justify-center rounded-full bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 font-bold px-6 text-sm transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                Browse Live Drops →
              </Link>
            </div>
          </div>

          {/* ─── RIGHT: REAL IPHONE DEVICE MOCKUP ──────────────────────────── */}
          <div className="flex justify-center items-center lg:justify-end">
            <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] flex justify-center items-center group">
              {/* Subtle ambient drop shadow / glow behind the phone */}
              <div className="absolute inset-0 bg-[#2F49E8]/20 dark:bg-[#2F49E8]/30 rounded-full blur-3xl pointer-events-none transform group-hover:scale-110 transition-transform duration-500" />
              
              <Image
                src="/kpugi_mobile_mockup.png"
                alt="Kpugi Mobile App on iPhone"
                width={400}
                height={800}
                className="relative z-10 w-full h-auto max-h-[560px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_25px_60px_rgba(0,0,0,0.85)] transition-transform duration-500 group-hover:scale-[1.03]"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default PerformanceOverview;
