'use client';

import React from 'react';
import {
  HiLightBulb,
  HiShieldCheck,
  HiSupport,
  HiDatabase,
  HiSwitchHorizontal,
} from 'react-icons/hi';

export interface Features1Props {
  badgeText?: string;
  title?: string;
  description?: string;
}

export function Features1({
  badgeText = 'Zero Hassle Workflow',
  title = 'From Signup to Direct Bank Pay in 5 Simple Steps',
  description = 'How Kpugi eliminates agency delays and guarantees automated payouts per 1,000 verified views.',
}: Features1Props) {
  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-transparent transition-colors duration-300">
      {/* Ambient Radial Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-tr from-emerald-500/10 via-sky-500/10 to-indigo-500/10 dark:from-emerald-500/[0.08] dark:via-cyan-500/[0.06] dark:to-violet-500/[0.08] blur-[120px] rounded-full" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-14 flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-xs backdrop-blur-md">
            <span>⚡ {badgeText}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 dark:text-white mb-4">
            {title}
          </h2>
          <p className="font-sans text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            {description}
          </p>
        </div>

        {/* ─── 5-CARD BENTO GRID ────────────────────────────────────────────── */}
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3 items-stretch">
          {/* Card 1: Step 1 */}
          <div className="group rounded-3xl p-6 sm:p-7 bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl flex flex-col justify-between">
            <div>
              <div className="mb-4 inline-flex rounded-xl p-1 bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-[#0c1224] shadow-xs">
                  <HiLightBulb className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-950 dark:text-white mb-1.5">
                1. Connect Your Socials
              </h3>
              <p className="font-sans text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Sign up and link your TikTok, Instagram, YouTube, X, Facebook, or LinkedIn in seconds. Zero follower gatekeeping.
              </p>
            </div>
            <div className="inline-flex">
              <span className="inline-flex items-center rounded-md bg-white/90 dark:bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 shadow-xs">
                Zero follower minimum
              </span>
            </div>
          </div>

          {/* Card 2: Step 2 */}
          <div className="group rounded-3xl p-6 sm:p-7 bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl flex flex-col justify-between">
            <div>
              <div className="mb-4 inline-flex rounded-xl p-1 bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-[#0c1224] shadow-xs">
                  <HiDatabase className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-950 dark:text-white mb-1.5">
                2. Claim Campaign Drops
              </h3>
              <p className="font-sans text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Browse verified brand briefs, download ready-made assets, and reserve your payout slot instantly with zero pitch decks.
              </p>
            </div>
            <div className="inline-flex">
              <span className="inline-flex items-center rounded-md bg-white/90 dark:bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 shadow-xs">
                Instant slot reservation
              </span>
            </div>
          </div>

          {/* Card 3: Middle Tall Step (Row Span 2 on Desktop) */}
          <div className="group md:row-span-2 rounded-3xl p-7 sm:p-8 bg-gradient-to-b from-white/90 via-white/70 to-slate-50 dark:from-[#0d1326] dark:via-[#070b16] dark:to-[#050811] border border-emerald-500/30 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-emerald-500/10 flex flex-col justify-between">
            <div>
              <div className="mb-5 inline-flex rounded-xl p-1 bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/20 dark:bg-emerald-500/10 shadow-xs">
                  <HiShieldCheck className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-950 dark:text-white mb-2">
                3. Guaranteed Payouts
              </h3>
              <p className="font-sans text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Brand budgets are locked in verified upfront. Once your post is published, your earned Naira is 100% protected and guaranteed.
              </p>

              <div className="space-y-2.5 mb-6">
                <div className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/50 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Campaign Funds</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Secured</span>
                </div>
                <div className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/50 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Bank Payout</span>
                  <span className="font-bold text-slate-800 dark:text-white">Every Friday</span>
                </div>
                <div className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/50 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Payout Floor</span>
                  <span className="font-bold text-slate-800 dark:text-white font-mono">1,000 views</span>
                </div>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                🔒 Zero agency delays
              </span>
            </div>
          </div>

          {/* Card 4: Step 4 */}
          <div className="group rounded-3xl p-6 sm:p-7 bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl flex flex-col justify-between">
            <div>
              <div className="mb-4 inline-flex rounded-xl p-1 bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-[#0c1224] shadow-xs">
                  <HiSwitchHorizontal className="h-5 w-5 text-pink-500" />
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-950 dark:text-white mb-1.5">
                4. Post & Paste Live Link
              </h3>
              <p className="font-sans text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Publish your post on your account, then drop the link on Kpugi for real-time automatic view counting.
              </p>
            </div>
            <div className="inline-flex">
              <span className="inline-flex items-center rounded-md bg-white/90 dark:bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 shadow-xs">
                Automatic view tracking
              </span>
            </div>
          </div>

          {/* Card 5: Step 5 */}
          <div className="group rounded-3xl p-6 sm:p-7 bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl flex flex-col justify-between">
            <div>
              <div className="mb-4 inline-flex rounded-xl p-1 bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-[#0c1224] shadow-xs">
                  <HiSupport className="h-5 w-5 text-sky-500" />
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-950 dark:text-white mb-1.5">
                5. Weekly Friday Bank Pay
              </h3>
              <p className="font-sans text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                As your views pass verification, earnings accumulate and transfer every single Friday directly to GTBank, Opay, Kuda, or any Nigerian bank.
              </p>
            </div>
            <div className="inline-flex">
              <span className="inline-flex items-center rounded-md bg-white/90 dark:bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 shadow-xs">
                Every Friday Direct Deposit
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features1;
