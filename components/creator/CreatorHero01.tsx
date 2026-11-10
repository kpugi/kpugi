'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Play, X } from 'lucide-react';

export type AvatarItem = {
  image?: string;
  src?: string;
  alt?: string;
};

export interface CreatorHero01Props {
  avatars?: AvatarItem[];
  title?: string;
  italicWord?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  showVideoDemo?: boolean;
}

const defaultAvatars: AvatarItem[] = [
  {
    image: 'https://images.shadcnspace.com/assets/profiles/user-1.jpg',
    src: 'https://images.shadcnspace.com/assets/profiles/user-1.jpg',
    alt: 'Verified Creator 1',
  },
  {
    image: 'https://images.shadcnspace.com/assets/profiles/user-2.jpg',
    src: 'https://images.shadcnspace.com/assets/profiles/user-2.jpg',
    alt: 'Verified Creator 2',
  },
  {
    image: 'https://images.shadcnspace.com/assets/profiles/user-3.jpg',
    src: 'https://images.shadcnspace.com/assets/profiles/user-3.jpg',
    alt: 'Verified Creator 3',
  },
  {
    image: 'https://images.shadcnspace.com/assets/profiles/user-5.jpg',
    src: 'https://images.shadcnspace.com/assets/profiles/user-5.jpg',
    alt: 'Verified Creator 4',
  },
];

export default function CreatorHero01({
  avatars = defaultAvatars,
  title = 'Turn Every 1,000 Views into',
  italicWord = 'direct cash',
  description = 'Pick a brand campaign drop. Post on TikTok, Instagram, YouTube, X, or Facebook. Watch your verified views stack up and receive guaranteed direct deposits into your Nigerian bank account every Friday.',
  ctaText = 'Start Earning Free',
  ctaHref = '/sign-up',
  showVideoDemo = true,
}: CreatorHero01Props) {
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
            // Autoplay policies
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

  const activeAvatars = avatars && avatars.length > 0 ? avatars : defaultAvatars;

  return (
    <>
      <section className="relative w-full overflow-hidden">
        <div className="w-full h-full relative">
          {/* Subtle gradient background blur from hero-01 */}
          <div className="relative w-full pt-8 md:pt-20 pb-12 md:pb-20 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-sky-100 before:via-white before:to-amber-100 before:rounded-full before:top-24 before:blur-3xl before:-z-10 dark:before:from-slate-800 dark:before:via-black dark:before:to-stone-700 dark:before:rounded-full dark:before:blur-3xl dark:before:-z-10">
            <div className="container mx-auto px-4 relative z-10">
              <div className="flex flex-col max-w-5xl mx-auto gap-8">
                {/* Headline & Description with Kpugi brand fonts */}
                <div className="relative flex flex-col text-center items-center sm:gap-6 gap-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    className="font-display font-bold lg:text-8xl md:text-7xl text-5xl tracking-tight leading-[1.08] text-slate-950 dark:text-white [text-wrap:balance]"
                  >
                    {title}{' '}
                    <span className="font-display italic text-[#2F49E8] dark:text-[#7B96FF]">
                      {italicWord}
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.1, ease: 'easeInOut' }}
                    className="font-sans text-base sm:text-lg font-normal max-w-2xl text-slate-600 dark:text-slate-300 leading-relaxed [text-wrap:pretty]"
                  >
                    {description}
                  </motion.p>
                </div>

                {/* Single Row: CTA Button + (Optional Video Trigger) + Avatar Social Proof */}
                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: 'easeInOut' }}
                  className="flex items-center flex-col md:flex-row justify-center gap-8"
                >
                  <div className="flex items-center gap-4 flex-wrap justify-center">
                    {/* The Sliding Animated Button from hero-01 with Kpugi font */}
                    <Button
                      asChild
                      className="relative font-sans text-sm font-bold rounded-full h-12 p-1 ps-6 pe-14 group transition-all duration-500 hover:ps-14 hover:pe-6 w-fit overflow-hidden cursor-pointer bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                    >
                      <Link href={ctaHref}>
                        <span className="relative z-10 transition-all duration-500 whitespace-nowrap">
                          {ctaText}
                        </span>
                        <span className="absolute right-1 w-10 h-10 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45 shadow-xs">
                          <ArrowUpRight size={16} />
                        </span>
                      </Link>
                    </Button>

                    {/* See how it works video button */}
                    {showVideoDemo && (
                      <button
                        type="button"
                        onClick={() => setIsVideoModalOpen(true)}
                        className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white px-3.5 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                        title="See how it works video demo"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                        </div>
                        <span>See how it works</span>
                      </button>
                    )}
                  </div>

                  {/* Tiny Overlapping 40px Avatars + 5-Star Rating */}
                  <div className="flex items-center sm:gap-7 gap-3">
                    <ul className="avatar flex flex-row items-center">
                      {activeAvatars.slice(0, 4).map((avatar, index) => (
                        <li key={index} className="-mr-2 z-1 hover:z-10 transition-transform">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={avatar.image || avatar.src}
                            alt={avatar.alt || 'Avatar'}
                            width={40}
                            height={40}
                            className="rounded-full border-2 border-white dark:border-slate-900 w-10 h-10 object-cover shadow-xs"
                          />
                        </li>
                      ))}
                    </ul>
                    <div className="gap-1 flex flex-col items-start text-left">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg
                            key={index}
                            className="h-4 w-4 fill-amber-400 text-amber-400"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="font-sans sm:text-sm text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Trusted by 2,000+ creators
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VIDEO PLAYER MODAL ────────────────────────────────────────────── */}
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
                  <span className="font-display font-semibold text-sm text-slate-900 dark:text-white">
                    Kpugi for Creators — See How It Works
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  aria-label="Close video modal"
                  className="bg-slate-200/70 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-slate-600 dark:text-white/80 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Video Player Display */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  src="/videos/kpugi-creator-video.mp4"
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
