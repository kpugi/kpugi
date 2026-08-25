'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { Play, ArrowRight, X, Star, Building2, Users } from 'lucide-react';

export interface HomeHero32Props {
  backgroundImage?: string;
}

export default function HomeHero32({
  backgroundImage = 'https://assets.watermelon.sh/hero-32-bg.avif',
}: HomeHero32Props) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Title: rises up with a heavier mass — slow, majestic settling
  const titleVariants: Variants = {
    hidden: { opacity: 0, y: 36, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 28, stiffness: 80, mass: 1.4, delay: 0.15 },
    },
  };

  // Subtitle: lighter, quicker
  const subtitleVariants: Variants = {
    hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 22, stiffness: 110, delay: 0.35 },
    },
  };

  // CTA group: scale up from slightly small + fade
  const ctaVariants: Variants = {
    hidden: { opacity: 0, scale: 0.92, y: 12 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', damping: 20, stiffness: 140, delay: 0.55 },
    },
  };

  // Trust badges: fade in smoothly
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
      <section className="relative min-h-[85vh] sm:min-h-[90vh] w-full overflow-hidden flex flex-col items-center justify-center px-4 pt-12 pb-24 text-center selection:bg-white/25">
        {/* Background Image Container with Smooth Bottom Fade to Blend with Next Section */}
        <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
          <img
            className="absolute inset-0 h-full w-full object-cover object-center scale-105 transition-transform duration-1000"
            src={backgroundImage}
            alt="Kpugi Marketplace Background"
          />
          {/* Subtle darkening vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/60 dark:from-black/50 dark:via-[#08090D]/40 dark:to-[#08090D]" />
          {/* Seamless bottom fade mask */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#F8F9FD] dark:from-[#08090D] to-transparent pointer-events-none" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-[920px] mx-auto w-full flex flex-col items-center">
          
          {/* Dedicated Route Navigation Switch (Links to /brands and /creators) */}
          <motion.div
            initial={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ type: 'spring', damping: 22, stiffness: 120, delay: 0.05 }}
            className="inline-flex items-center p-1 rounded-full bg-white/20 dark:bg-white/10 border border-white/30 backdrop-blur-md shadow-lg mb-7 text-white"
          >
            <Link
              href="/brands"
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-satoshi font-bold text-white hover:bg-white/20 transition-all hover:scale-[1.02]"
            >
              <Building2 className="h-3.5 w-3.5 text-white" />
              <span>For Brands</span>
            </Link>
            <div className="w-[1px] h-4 bg-white/30" />
            <Link
              href="/creators"
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-satoshi font-bold text-white hover:bg-white/20 transition-all hover:scale-[1.02]"
            >
              <Users className="h-3.5 w-3.5 text-emerald-300" />
              <span>For Creators</span>
            </Link>
          </motion.div>

          {/* Title: Slow Majestic Rise */}
          <motion.h1
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="font-clash font-bold text-[clamp(2.5rem,6.5vw,5rem)] leading-[1.04] text-white tracking-[-0.03em] mb-5 [text-wrap:balance] drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
          >
            Where posts turn into payouts, <br />
            and brands get{' '}
            <span className="italic underline decoration-white/40 underline-offset-8">
              real reach.
            </span>
          </motion.h1>

          {/* Subtitle: Quicker Settling */}
          <motion.p
            variants={subtitleVariants}
            initial="hidden"
            animate="visible"
            className="font-satoshi text-[clamp(0.9375rem,2vw,1.1875rem)] text-white/90 leading-[1.65] max-w-[660px] mx-auto mb-9 px-2 [text-wrap:pretty] drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
          >
            Nigeria’s marketplace connecting advertisers with verified creators across TikTok, Instagram, YouTube, X, Facebook, and LinkedIn. Pay strictly for confirmed impressions. Earn per 1,000 views.
          </motion.p>

          {/* Action CTAs (Side-by-side on mobile) */}
          <motion.div
            variants={ctaVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-row items-center justify-center gap-3 w-full max-w-[480px] mx-auto"
          >
            <Link
              href="/brands"
              className="inline-flex items-center justify-center gap-1.5 flex-1 min-h-[50px] bg-white text-slate-950 font-satoshi font-bold text-[clamp(0.8125rem,2.5vw,0.9375rem)] px-5 rounded-full no-underline whitespace-nowrap shadow-[0_10px_35px_rgba(0,0,0,0.35)] transition-all duration-200 hover:scale-[1.03] hover:bg-slate-100 active:scale-[0.97]"
            >
              <span>Launch Campaign</span>
              <ArrowRight className="h-4 w-4 flex-shrink-0" />
            </Link>

            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 flex-1 min-h-[50px] bg-white/20 text-white font-satoshi font-semibold text-[clamp(0.8125rem,2.5vw,0.9375rem)] px-5 rounded-full border border-white/30 backdrop-blur-md cursor-pointer whitespace-nowrap shadow-lg transition-all duration-200 hover:scale-[1.03] hover:bg-white/30 active:scale-[0.97]"
            >
              <div className="w-[24px] h-[24px] rounded-full bg-white text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
              </div>
              <span>Watch Demo</span>
            </button>
          </motion.div>

          {/* Trust Badges: Product Hunt & Trustpilot */}
          <motion.div
            variants={trustVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-center gap-3 flex-wrap mt-10"
          >
            {/* Product Hunt Widget */}
            <a
              href="https://www.producthunt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-white/20 border border-white/30 backdrop-blur-md rounded-2xl px-3.5 py-2 no-underline text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/30"
            >
              <div className="w-6 h-6 rounded-full bg-[#FF6154] flex items-center justify-center font-black text-xs text-white flex-shrink-0 shadow-[0_2px_8px_rgba(255,97,84,0.4)]">
                P
              </div>
              <div className="text-left flex flex-col">
                <span className="text-[10px] font-satoshi font-bold text-white/70 uppercase tracking-wider leading-none">
                  Product Hunt
                </span>
                <span className="text-xs font-clash font-semibold text-white mt-0.5 leading-tight">
                  #1 Product of the Day
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 border border-white/30 rounded-md px-1.5 py-0.5 text-[11px] font-mono font-bold text-white ml-1">
                <span>▲</span>
                <span>348</span>
              </div>
            </a>

            {/* Trustpilot Widget */}
            <a
              href="https://www.trustpilot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-white/20 border border-white/30 backdrop-blur-md rounded-2xl px-3.5 py-2 no-underline text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/30"
            >
              <div className="w-6 h-6 rounded-md bg-[#00B67A] flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(0,182,122,0.4)]">
                <Star className="h-3.5 w-3.5 fill-white text-white" />
              </div>
              <div className="text-left flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-clash font-bold text-white leading-none">
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
                <span className="text-[11px] font-satoshi text-white/80 mt-1 leading-none">
                  Rated <strong className="text-emerald-300">4.9/5</strong> by 200+ brands
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
                    Kpugi Marketplace Walkthrough
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
                    How Kpugi Connects Brands & Creators in Nigeria
                  </p>
                  <p className="font-satoshi text-xs text-white/50 m-0">
                    Duration: 2 mins · Automated view audit & payout engine
                  </p>
                </div>

                {/* Player Bottom Control Bar Mockup */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-2 z-10">
                  <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer">
                    <div className="h-full w-[45%] bg-[#2F49E8] rounded-full" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/70 font-mono">
                    <span>0:54 / 2:00</span>
                    <span className="text-[#17A75B] font-bold">1080p HD</span>
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
