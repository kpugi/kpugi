'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { Play, ArrowRight, X, Volume2, Maximize2, Star } from 'lucide-react';

export default function BrandHero32() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: 36, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 28, stiffness: 80, mass: 1.4, delay: 0.15 },
    },
  };

  const subtitleVariants: Variants = {
    hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 22, stiffness: 110, delay: 0.35 },
    },
  };

  const ctaVariants: Variants = {
    hidden: { opacity: 0, scale: 0.92, y: 12 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', damping: 20, stiffness: 140, delay: 0.55 },
    },
  };

  const trustVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.75 },
    },
  };

  return (
    <>
      <section className="relative min-h-[70vh] w-full overflow-hidden bg-[#F8F9FD] dark:bg-[#08090D] flex flex-col items-center justify-center px-4 py-16 text-center transition-colors duration-300">
        {/* Background Atmosphere & Ambient Glow */}
        <div
          aria-hidden
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[85vw] max-w-[1000px] h-[520px] pointer-events-none z-0
            bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,rgba(47,73,232,0.15)_0%,rgba(47,73,232,0.02)_55%,transparent_80%)]
            dark:bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,rgba(47,73,232,0.28)_0%,rgba(47,73,232,0.05)_55%,transparent_80%)]"
        />

        {/* Subtle Dot Grid */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none z-0 bg-[size:32px_32px]
            [background-image:radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)]
            dark:[background-image:radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)]"
        />

        {/* Seamless bottom fade mask */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#F8F9FD] dark:from-[#08090D] to-transparent pointer-events-none z-[1]" />

        <div className="relative z-10 max-w-[880px] mx-auto w-full">
          {/* Title */}
          <motion.h1
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="font-clash font-bold text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.05] text-[#0B1026] dark:text-white tracking-[-0.03em] mb-5 [text-wrap:balance]"
          >
            Turn content into <br />
            <span className="bg-gradient-to-br from-[#4162FF] via-[#2F49E8] to-[#1A32D4] bg-clip-text text-transparent italic">
              measurable
            </span>{' '}
            viral reach.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={subtitleVariants}
            initial="hidden"
            animate="visible"
            className="font-satoshi text-[clamp(0.9375rem,2vw,1.125rem)] text-slate-600 dark:text-white/60 leading-[1.65] max-w-[620px] mx-auto mb-8 px-2 [text-wrap:pretty]"
          >
            Brief vetted creators across Nigeria. They distribute your creative posts, videos, banners, and stories to real audiences across TikTok, Instagram, YouTube, X, Facebook, and LinkedIn. You only pay for verified impressions.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            variants={ctaVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-row items-center justify-center gap-2.5 w-full max-w-[480px] mx-auto"
          >
            <Link
              href="/b/campaigns/new"
              className="inline-flex items-center justify-center gap-1.5 flex-1 min-h-[46px] bg-[#2F49E8] text-white font-satoshi font-bold text-[clamp(0.8125rem,2.5vw,0.9375rem)] px-4 rounded-full no-underline whitespace-nowrap shadow-[0_10px_30px_rgba(47,73,232,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-200 hover:scale-[1.03]"
            >
              <span>Launch Campaign</span>
              <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" />
            </Link>

            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 flex-1 min-h-[46px] bg-white/80 dark:bg-white/[0.06] text-slate-900 dark:text-white font-satoshi font-semibold text-[clamp(0.8125rem,2.5vw,0.9375rem)] px-4 rounded-full border border-slate-200 dark:border-white/[0.12] backdrop-blur-md cursor-pointer whitespace-nowrap shadow-sm transition-all duration-200 hover:scale-[1.03] hover:bg-white dark:hover:bg-white/10"
            >
              <div className="w-[22px] h-[22px] rounded-full bg-[#2F49E8] text-white dark:bg-white dark:text-[#2F49E8] flex items-center justify-center flex-shrink-0 shadow-sm">
                <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
              </div>
              <span>Watch Demo</span>
            </button>
          </motion.div>

          {/* Product Hunt & Trustpilot Badges */}
          <motion.div
            variants={trustVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-center gap-3 flex-wrap mt-9"
          >
            {/* Product Hunt Widget */}
            <a
              href="https://www.producthunt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] backdrop-blur-md rounded-xl px-3.5 py-2 no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6154]/40"
            >
              <div className="w-6 h-6 rounded-full bg-[#FF6154] flex items-center justify-center font-black text-xs text-white flex-shrink-0 shadow-[0_2px_8px_rgba(255,97,84,0.35)]">
                P
              </div>
              <div className="text-left flex flex-col">
                <span className="text-[10px] font-satoshi font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider leading-none">
                  Product Hunt
                </span>
                <span className="text-xs font-clash font-semibold text-slate-900 dark:text-white mt-0.5 leading-tight">
                  #1 Product of the Day
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#FF6154]/10 dark:bg-[#FF6154]/15 border border-[#FF6154]/25 rounded-md px-1.5 py-0.5 text-[11px] font-mono font-bold text-[#E03A2A] dark:text-[#FF7B70] ml-1">
                <span>▲</span>
                <span>348</span>
              </div>
            </a>

            {/* Trustpilot Widget */}
            <a
              href="https://www.trustpilot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] backdrop-blur-md rounded-xl px-3.5 py-2 no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00B67A]/40"
            >
              <div className="w-6 h-6 rounded-md bg-[#00B67A] flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(0,182,122,0.35)]">
                <Star className="h-3.5 w-3.5 fill-white text-white" />
              </div>
              <div className="text-left flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-clash font-bold text-slate-900 dark:text-white leading-none">
                    Trustpilot
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 bg-[#00B67A] flex items-center justify-center rounded-[1.5px]"
                      >
                        <Star className="h-2 w-2 fill-white text-white" />
                      </div>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] font-satoshi text-slate-500 dark:text-white/50 mt-1 leading-none">
                  Rated <strong className="text-[#00B67A]">4.9/5</strong> by 200+ brands
                </span>
              </div>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Video Player Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[840px] bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-[#2F49E8]/35 rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080A12]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#17A75B] shadow-[0_0_10px_#17A75B]" />
                  <span className="font-clash font-semibold text-sm text-slate-900 dark:text-white">
                    Kpugi Platform Walkthrough
                  </span>
                </div>

                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-slate-600 dark:text-white/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Video Player Display Container */}
              <div className="relative w-full aspect-video bg-slate-900 dark:bg-[#04060A] flex flex-col items-center justify-center">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(circle,rgba(47,73,232,0.15)_1px,transparent_1px)] bg-[size:24px_24px]"
                />

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="relative z-10 w-[72px] h-[72px] rounded-full bg-[#2F49E8] border-[3px] border-white/20 flex items-center justify-center text-white shadow-[0_0_35px_rgba(47,73,232,0.7)] cursor-pointer transition-transform duration-200 hover:scale-110"
                >
                  <Play className="h-7 w-7 fill-current ml-1" />
                </button>

                <div className="relative z-10 mt-4 text-center px-5">
                  <p className="font-clash font-semibold text-lg text-white mb-1.5">
                    How Brands Launch & Verify Campaigns on Kpugi
                  </p>
                  <p className="font-satoshi text-xs text-white/50 m-0">
                    Duration: 2 mins · Automated view audit demonstration
                  </p>
                </div>

                {/* Player Bottom Control Bar Mockup */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-2 z-10">
                  <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer">
                    <div className="h-full w-[38%] bg-[#2F49E8] rounded-full" />
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono text-white/60">
                    <span>00:48 / 02:14</span>
                    <div className="flex items-center gap-3 text-white/60">
                      <span className="text-[10px] font-satoshi font-bold bg-white/10 px-1.5 py-0.5 rounded text-[#5B7CFF]">
                        1080p HD
                      </span>
                      <Volume2 className="h-4 w-4 cursor-pointer hover:text-white" />
                      <Maximize2 className="h-4 w-4 cursor-pointer hover:text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
