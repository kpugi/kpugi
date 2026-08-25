'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Activity,
  Zap,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

function GlowingBorderCard({
  children,
  className,
  glowColor,
  repeatingGradient,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor: string;
  repeatingGradient: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative rounded-[20px] p-[2px] bg-slate-200/80 dark:bg-white/[0.08] transition-colors duration-300 ${className || ''}`}
    >
      {/* Interactive mouse-follow radial glow */}
      <div
        aria-hidden
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          opacity,
          transition: 'opacity 0.3s ease',
          background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
        }}
      />

      {/* Card Inner Container */}
      <div className="relative z-10 h-full overflow-hidden rounded-[18px] bg-white dark:bg-[#0E121E] shadow-sm dark:shadow-none transition-colors duration-300">
        {/* Subtle repeating pattern background */}
        <div
          aria-hidden
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            opacity: 0.35,
            background: repeatingGradient,
          }}
        />

        {/* Gradient overlay to keep text legible */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-white/90 dark:to-[#0E121E]/90"
        />

        <div className="relative z-20 flex h-full flex-col justify-between p-7">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BrandPricingSplitSection() {
  return (
    <section className="relative w-full py-24 px-6 bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 48,
            alignItems: 'center',
          }}
          className="pricing-split-grid"
        >
          {/* Left Column */}
          <div className="flex flex-col gap-6 max-w-[500px]">
            <h2 className="font-clash font-bold text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05] text-[#0B1026] dark:text-white m-0 tracking-[-0.025em]">
              Elevate your <br />
              campaign reach.
            </h2>

            <p className="font-satoshi text-[1.0625rem] text-slate-600 dark:text-white/50 leading-[1.7] m-0">
              Harness automated view tracking to scale brand distribution across Nigeria, eliminate ad fraud, and pay strictly for verified human impressions.
            </p>

            <div className="flex flex-row items-center gap-2.5 pt-2 w-full max-w-[440px]">
              <Link
                href="/b/campaigns/new"
                className="inline-flex items-center justify-center gap-1.5 flex-1 bg-[#2F49E8] text-white font-satoshi font-bold text-[clamp(0.8125rem,2.5vw,0.9375rem)] py-3 px-4 rounded-xl no-underline whitespace-nowrap tracking-[-0.01em] shadow-[0_10px_30px_rgba(47,73,232,0.35)] transition-transform hover:scale-[1.03]"
              >
                <span>Launch Campaign</span>
                <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0" />
              </Link>
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-1.5 flex-1 bg-white/80 dark:bg-white/[0.06] text-slate-800 dark:text-white/80 font-satoshi font-semibold text-[clamp(0.8125rem,2.5vw,0.9375rem)] py-3 px-4 rounded-xl no-underline border border-slate-200 dark:border-white/10 whitespace-nowrap tracking-[-0.01em] shadow-sm transition-all hover:bg-white dark:hover:bg-white/10 hover:scale-[1.03]"
              >
                <span>Explore Deals</span>
              </Link>
            </div>
          </div>

          {/* Right Column */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
            }}
            className="pricing-cards-grid"
          >
            {/* Card 1: ₦2,000 Standard CPM */}
            <GlowingBorderCard
              glowColor="rgba(47, 73, 232, 0.7)"
              repeatingGradient="repeating-linear-gradient(45deg, rgba(47, 73, 232, 0.08), rgba(47, 73, 232, 0.08) 15px, transparent 15px, transparent 30px)"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-blue-500/15 border border-blue-500/30 mb-5">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="font-clash font-bold text-4xl text-slate-900 dark:text-white leading-none tracking-[-0.03em] mb-2 font-tabular">
                  ₦2,000
                  <span className="font-satoshi text-sm font-semibold text-slate-500 dark:text-white/40 ml-1.5">
                    / 1k views
                  </span>
                </div>
                <h3 className="font-clash font-semibold text-base text-slate-900 dark:text-white mb-1.5">
                  Standard Verified CPM
                </h3>
              </div>
              <p className="font-satoshi text-[0.8125rem] text-slate-500 dark:text-white/45 leading-[1.6] mt-4 mb-0">
                The standard transparent rate for verified impressions across 6 major platforms in Nigeria.
              </p>
            </GlowingBorderCard>

            {/* Card 2: 10x Faster Distribution */}
            <GlowingBorderCard
              glowColor="rgba(168, 85, 247, 0.7)"
              repeatingGradient="repeating-linear-gradient(-45deg, rgba(168, 85, 247, 0.08), rgba(168, 85, 247, 0.08) 15px, transparent 15px, transparent 30px)"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-purple-500/15 border border-purple-500/30 mb-5">
                  <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="font-clash font-bold text-4xl text-slate-900 dark:text-white leading-none tracking-[-0.03em] mb-2">
                  10<span className="text-2xl text-slate-400 dark:text-white/40 ml-0.5">x</span>
                </div>
                <h3 className="font-clash font-semibold text-base text-slate-900 dark:text-white mb-1.5">
                  Rapid Brief Distribution
                </h3>
              </div>
              <p className="font-satoshi text-[0.8125rem] text-slate-500 dark:text-white/45 leading-[1.6] mt-4 mb-0">
                Broadcast your creative to hundreds of vetted Nigerian creators simultaneously without manual agency contracts.
              </p>
            </GlowingBorderCard>

            {/* Card 3: 0% Upfront Risk (Full Width Span) */}
            <GlowingBorderCard
              className="pricing-card-wide"
              glowColor="rgba(23, 167, 91, 0.7)"
              repeatingGradient="repeating-linear-gradient(90deg, rgba(23, 167, 91, 0.08), rgba(23, 167, 91, 0.08) 15px, transparent 15px, transparent 30px)"
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 28,
                  width: '100%',
                }}
                className="pricing-card-wide-content"
              >
                <div className="flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-500/15 border border-emerald-500/30 mb-4">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="font-clash font-bold text-5xl text-[#17A75B] leading-none tracking-[-0.03em] mb-1.5">
                    0%
                    <span className="font-satoshi text-base font-semibold text-slate-500 dark:text-white/45 ml-2">
                      Upfront Risk
                    </span>
                  </div>
                  <h3 className="font-clash font-semibold text-[1.0625rem] text-slate-900 dark:text-white m-0">
                    100% Protected Budget
                  </h3>
                </div>

                <div className="flex-[1.2]">
                  <p className="font-satoshi text-sm text-slate-600 dark:text-white/50 leading-[1.65] m-0">
                    Your campaign budget stays locked and protected in your wallet. Funds only release when our automated verification confirms genuine impressions. Any unspent balance returns immediately.
                  </p>

                  <Link
                    href="/browse"
                    className="inline-flex items-center gap-1.5 text-[#2F49E8] dark:text-[#5B7CFF] text-[0.8125rem] font-satoshi font-bold no-underline mt-3.5 hover:underline"
                  >
                    Explore active creator campaigns <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </GlowingBorderCard>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .pricing-split-grid {
            grid-template-columns: 5fr 7fr !important;
          }
        }
        @media (min-width: 640px) {
          .pricing-card-wide {
            grid-column: span 2 !important;
          }
        }
        @media (max-width: 640px) {
          .pricing-cards-grid {
            grid-template-columns: 1fr !important;
          }
          .pricing-card-wide-content {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </section>
  );
}
