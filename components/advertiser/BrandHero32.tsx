'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { Play, ArrowRight, X } from 'lucide-react';
import TrustBoxWidget from '@/components/common/TrustBoxWidget';

export default function BrandHero32() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play when modal opens, pause when modal closes, and handle Escape key
  useEffect(() => {
    if (isVideoModalOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {
            // Autoplay with sound might be blocked by browser policy until user interacts
          });
        }
      }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsVideoModalOpen(false);
        }
      };
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isVideoModalOpen]);

  const handleCloseModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsVideoModalOpen(false);
  };

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
              type="button"
              onClick={() => setIsVideoModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 flex-1 min-h-[46px] bg-white/80 dark:bg-white/[0.06] text-slate-900 dark:text-white font-satoshi font-semibold text-[clamp(0.8125rem,2.5vw,0.9375rem)] px-4 rounded-full border border-slate-200 dark:border-white/[0.12] backdrop-blur-md cursor-pointer whitespace-nowrap shadow-sm transition-all duration-200 hover:scale-[1.03] hover:bg-white dark:hover:bg-white/10"
              aria-label="See how it works video demo"
            >
              <div className="w-[22px] h-[22px] rounded-full bg-[#2F49E8] text-white dark:bg-white dark:text-[#2F49E8] flex items-center justify-center flex-shrink-0 shadow-sm">
                <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
              </div>
              <span>See how it works</span>
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
              href="https://www.producthunt.com/products/kpugi?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-kpugi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform duration-200 hover:scale-105"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1305865&theme=light&t=1793956646894"
                alt="Kpugi - Performance-based advertising for brands and creators. | Product Hunt"
                width={250}
                height={54}
                className="h-[54px] w-[250px]"
              />
            </a>

            {/* Dynamic Trustpilot TrustBox Widget */}
            <TrustBoxWidget variant="brand-light" />
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
            className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[920px] bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-[#2F49E8]/40 rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080A12]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#17A75B] shadow-[0_0_10px_#17A75B]" />
                  <span className="font-clash font-semibold text-sm text-slate-900 dark:text-white">
                    Kpugi for Brands — See How It Works
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  aria-label="Close video modal"
                  className="bg-slate-200/70 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-slate-600 dark:text-white/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Video Player Display Container */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  src="/videos/kpugi-brand-video.mp4"
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="w-full h-full object-contain bg-black"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
