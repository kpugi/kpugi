'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Instrument_Serif } from 'next/font/google';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Play, X, Star } from 'lucide-react';
import { Marquee } from '@/components/ui/marquee';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
});

export interface CreatorAvatar {
  src: string;
  alt: string;
}

export interface CreatorHero01Props {
  avatars?: CreatorAvatar[];
  title?: string;
  italicWord?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

const defaultAvatars: CreatorAvatar[] = [
  {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    alt: 'Verified Creator Amina',
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    alt: 'Verified Creator Tobi',
  },
  {
    src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    alt: 'Verified Creator Grace',
  },
  {
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    alt: 'Verified Creator Emeka',
  },
];

const brandLogos = [
  { name: 'Chowdeck', logo: '/chowdeck_creative.png' },
  { name: 'Piggyvest', logo: '/piggyvest_creative.png' },
  { name: 'Infinix', logo: '/infinix_creative.png' },
  { name: 'Zaron Cosmetics', logo: '/zaron_creative.png' },
  { name: 'NovaBev', text: 'NovaBev' },
  { name: 'SkinGlow', text: 'SkinGlow' },
  { name: 'FastCart', text: 'FastCart' },
  { name: 'PulseFM', text: 'PulseFM' },
  { name: 'CityDrip', text: 'CityDrip' },
];

export default function CreatorHero01({
  avatars = defaultAvatars,
  title = 'Turn Every 1,000 Views with',
  italicWord = 'direct cash',
  description = 'Pick a campaign drop. Post on TikTok, Instagram, YouTube, X, or Facebook. Watch your verified views stack up and receive guaranteed direct deposits into your Nigerian bank account every Friday.',
  ctaText = 'Get Started',
  ctaHref = '/sign-up',
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
            // Browser autoplay restrictions
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
          {/* Ambient colorful blur background from hero-01 */}
          <div className="relative w-full pt-12 md:pt-24 pb-8 md:pb-14 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-sky-100 before:via-white before:to-amber-100 before:rounded-full before:top-24 before:blur-3xl before:-z-10 dark:before:from-slate-900 dark:before:via-black dark:before:to-stone-800 dark:before:rounded-full dark:before:blur-3xl dark:before:-z-10">
            <div className="container mx-auto px-4 relative z-10">
              <div className="flex flex-col max-w-5xl mx-auto gap-8 text-center items-center">
                {/* Eyebrow badge */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 shadow-xs backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Nigeria's #1 Performance Creator Network</span>
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-[#2F49E8] dark:text-[#7B96FF]">₦0 Follower Minimum</span>
                </motion.div>

                {/* Main Heading with Instrument Serif italic */}
                <div className="relative flex flex-col text-center items-center sm:gap-6 gap-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    className="lg:text-8xl md:text-7xl text-5xl font-medium leading-tight md:leading-tight lg:leading-tight text-slate-950 dark:text-white [text-wrap:balance]"
                  >
                    {title}{' '}
                    <span
                      className={`${instrumentSerif.className} tracking-tight italic bg-gradient-to-br from-[#4162FF] via-[#2F49E8] to-[#1A32D4] bg-clip-text text-transparent`}
                    >
                      {italicWord}
                    </span>
                  </motion.h1>

                  {/* Subtitle Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.1, ease: 'easeInOut' }}
                    className="text-base sm:text-lg font-normal max-w-2xl text-slate-600 dark:text-muted-foreground [text-wrap:pretty]"
                  >
                    {description}
                  </motion.p>
                </div>

                {/* CTA Action Group: Sliding Animated Button + Video Trigger */}
                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: 'easeInOut' }}
                  className="flex items-center flex-col sm:flex-row justify-center gap-4 sm:gap-6"
                >
                  {/* The requested Sliding Animated Button */}
                  <Link href={ctaHref}>
                    <button
                      type="button"
                      className="relative text-sm font-semibold rounded-full h-12 p-1 ps-6 pe-14 group transition-all duration-500 hover:ps-14 hover:pe-6 w-fit overflow-hidden cursor-pointer bg-[#2F49E8] hover:bg-[#2036b5] text-white shadow-[0_10px_30px_rgba(47,73,232,0.35)] flex items-center"
                    >
                      <span className="relative z-10 transition-all duration-500 whitespace-nowrap">
                        {ctaText}
                      </span>
                      <span className="absolute right-1 top-1 w-10 h-10 bg-white text-[#2F49E8] dark:bg-white dark:text-slate-900 rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45 shadow-sm">
                        <ArrowUpRight size={18} />
                      </span>
                    </button>
                  </Link>

                  {/* See how it works video button */}
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full bg-white/80 dark:bg-white/[0.06] text-slate-900 dark:text-white font-semibold text-sm border border-slate-200 dark:border-white/[0.12] backdrop-blur-md cursor-pointer whitespace-nowrap shadow-sm transition-all duration-300 hover:scale-[1.03] hover:bg-white dark:hover:bg-white/10"
                    aria-label="See how it works video demo"
                  >
                    <div className="w-[24px] h-[24px] rounded-full bg-[#2F49E8] text-white dark:bg-white dark:text-[#2F49E8] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Play className="h-3 w-3 fill-current ml-0.5" />
                    </div>
                    <span>See how it works</span>
                  </button>
                </motion.div>

                {/* Social Proof: Avatars + 5-Star Rating */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.35, ease: 'easeInOut' }}
                  className="flex items-center justify-center sm:gap-7 gap-4 pt-2"
                >
                  <ul className="avatar flex flex-row items-center">
                    {activeAvatars.slice(0, 4).map((avatar, index) => (
                      <li key={index} className="-mr-2.5 z-1 hover:z-10 transition-transform hover:scale-110">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatar.src}
                          alt={avatar.alt || 'Verified Creator'}
                          width={42}
                          height={42}
                          className="rounded-full border-2 border-white dark:border-slate-900 object-cover w-[42px] h-[42px] shadow-sm"
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="gap-1 flex flex-col items-start text-left">
                    <div className="flex gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="sm:text-sm text-xs font-medium text-slate-600 dark:text-muted-foreground">
                      Trusted by 2,000+ Nigerian creators
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── BRAND SLIDER / MARQUEE (FROM HERO-01) ─────────────────────────── */}
        <div className="py-6 md:py-10 border-t border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-transparent">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeInOut' }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-center gap-4 text-center">
                <div className="hidden md:block h-px w-28 bg-gradient-to-l from-slate-400 dark:from-white/20 to-transparent" />
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                  Campaign drops from top Nigerian brands every week
                </p>
                <div className="hidden md:block h-px w-28 bg-gradient-to-r from-slate-400 dark:from-white/20 to-transparent" />
              </div>

              <div className="py-2">
                <Marquee pauseOnHover className="[--duration:28s] p-0">
                  {brandLogos.map((brand, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center justify-center mx-6 px-4 py-2 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] shadow-2xs backdrop-blur-xs transition-all hover:scale-105"
                    >
                      {brand.logo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-7 w-auto object-contain max-w-[120px]"
                        />
                      ) : (
                        <span className="font-clash font-bold text-sm tracking-tight text-slate-800 dark:text-slate-200">
                          {brand.text}
                        </span>
                      )}
                    </div>
                  ))}
                </Marquee>
              </div>
            </motion.div>
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
                  <span className="font-clash font-semibold text-sm text-slate-900 dark:text-white">
                    Kpugi for Creators — See How It Works
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

