'use client';

import React, { useRef, useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// ─── KPUGI CREATOR FEATURE SLIDES ──────────────────────────────────────────
export interface CreatorSlide {
  id: number;
  num: string;
  label: string;
  title: string;
  description: string;
  accent: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  shape: 'circle' | 'square' | 'line' | 'triangle';
}

const SLIDES: CreatorSlide[] = [
  {
    id: 0,
    num: '01',
    label: 'Open to All',
    title: 'Zero Follower\nMinimums',
    description: 'Whether you have 200 or 200,000 followers, as long as your post gets 1,000 verified views, you get paid directly.',
    accent: '#10B981', // Emerald
    bgLight: '#0f172a',
    bgDark: '#080d1a',
    textLight: '#ffffff',
    textDark: '#ffffff',
    shape: 'circle',
  },
  {
    id: 1,
    num: '02',
    label: 'Real-Time Count',
    title: 'Instant View\nVerification',
    description: 'Your post views are counted and verified automatically across TikTok, Instagram, YouTube, X, and Facebook. Zero manual delays.',
    accent: '#00F2FE', // Cyan/TikTok
    bgLight: '#ffffff',
    bgDark: '#0d1326',
    textLight: '#090d1a',
    textDark: '#f8fafc',
    shape: 'square',
  },
  {
    id: 2,
    num: '03',
    label: 'Guaranteed Funds',
    title: '100% Guaranteed\nBrand Budgets',
    description: 'Brands fund campaign budgets upfront before briefs go live. Your earned money is 100% safe and guaranteed to pay out.',
    accent: '#2F49E8', // Kpugi Blue
    bgLight: '#1e1b4b',
    bgDark: '#0c0e24',
    textLight: '#ffffff',
    textDark: '#ffffff',
    shape: 'line',
  },
  {
    id: 3,
    num: '04',
    label: 'Weekly Direct Pay',
    title: 'Friday Direct\nBank Deposits',
    description: 'Your earnings stack up throughout the week and land straight in your Nigerian bank account every Friday.',
    accent: '#10B981', // Emerald
    bgLight: '#064e3b',
    bgDark: '#062d24',
    textLight: '#ecfdf5',
    textDark: '#ecfdf5',
    shape: 'triangle',
  },
  {
    id: 4,
    num: '05',
    label: 'AI Vector Matching',
    title: 'Smart AI\nCompatibility Sync',
    description: 'Our vector engine analyzes your creative style and matches you directly with high-paying brand campaigns tailored to your audience demographic.',
    accent: '#3B82F6', // Blue
    bgLight: '#0f172a',
    bgDark: '#080d1a',
    textLight: '#ffffff',
    textDark: '#ffffff',
    shape: 'circle',
  },
];

// Larger, taller dimensions for immersive viewing
const CARD_W = 380;
const CARD_H = 460;

const STACK = [
  { x: 0, y: 0, scale: 1.0, opacity: 1 },
  { x: 0, y: 16, scale: 0.95, opacity: 0.88 },
  { x: 0, y: 30, scale: 0.90, opacity: 0.72 },
];

const OFFSCREEN = { x: 0, y: 44, scale: 0.85, opacity: 0 };

export interface SlideDeckProps {
  badgeText?: string;
  title?: string;
  description?: string;
}

export function SlideDeck({
  badgeText = 'Creator Superpowers',
  title = 'Engineered for Creators. Zero Friction.',
  description = 'Swipe through how Kpugi transforms post views into predictable weekly earnings.',
}: SlideDeckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : true
  );

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [exitInfo, setExitInfo] = useState<{ slideId: number; xTarget: number } | null>(null);
  const [enterFromRight, setEnterFromRight] = useState<number | null>(null);

  const goTo = useCallback(
    (newIdx: number, dir: 1 | -1) => {
      if (dir > 0) {
        setExitInfo({ slideId: SLIDES[current].id, xTarget: -520 });
        setEnterFromRight(null);
      } else {
        setExitInfo(null);
        setEnterFromRight(SLIDES[newIdx].id);
      }
      setDirection(dir);
      setCurrent(newIdx);
    },
    [current]
  );

  const navigate = useCallback(
    (dir: 1 | -1) => {
      goTo((current + dir + SLIDES.length) % SLIDES.length, dir);
    },
    [current, goTo]
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-transparent transition-colors duration-300"
    >
      {/* Ambient background glowing aura */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[520px] bg-gradient-to-tr from-emerald-500/15 via-sky-500/10 to-indigo-500/15 dark:from-emerald-500/[0.1] dark:via-cyan-500/[0.08] dark:to-violet-500/[0.1] blur-[140px] rounded-full" />

      <div className="relative z-10 mx-auto max-w-5xl flex flex-col items-center">
        {/* Header */}
        <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-xs backdrop-blur-md">
            <Sparkles className="size-3.5" />
            <span>{badgeText}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 dark:text-white mb-4">
            {title}
          </h2>
          <p className="font-sans text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl">
            {description}
          </p>
        </div>

        {/* ─── 3D SWIPEABLE CARDS DECK (TALL & LARGE) ───────────────────────── */}
        <div
          className="relative select-none max-w-full"
          style={{
            width: CARD_W,
            height: CARD_H,
            overflow: 'visible',
          }}
        >
          {SLIDES.map((slide) => {
            const offset = (slide.id - current + SLIDES.length) % SLIDES.length;
            const isExiting = exitInfo?.slideId === slide.id && offset === SLIDES.length - 1;
            const isEnteringFromRight = enterFromRight === slide.id && offset === 0;

            const animTarget = isExiting
              ? { x: exitInfo!.xTarget, y: 0, scale: 0.88, opacity: 0 }
              : offset <= 2
              ? STACK[offset]
              : OFFSCREEN;

            const zIndex = isEnteringFromRight
              ? 20
              : isExiting
              ? 15
              : offset === 0
              ? 10
              : offset === 1
              ? 6
              : offset === 2
              ? 2
              : 0;

            const bg = isDark ? slide.bgDark : slide.bgLight;
            const textPrimary = isDark ? slide.textDark : slide.textLight;

            return (
              <motion.div
                key={isEnteringFromRight ? `${slide.id}-right` : slide.id}
                initial={isEnteringFromRight ? { x: 520, opacity: 0, scale: 0.88, y: 0 } : false}
                animate={animTarget}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                onAnimationComplete={() => {
                  setExitInfo((prev) => (prev?.slideId === slide.id ? null : prev));
                  setEnterFromRight((prev) => (prev === slide.id ? null : prev));
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 28,
                  background: bg,
                  overflow: 'hidden',
                  zIndex,
                  cursor: offset === 0 ? 'grab' : 'default',
                  boxShadow:
                    offset === 0
                      ? isDark
                        ? '0 28px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.18)'
                        : '0 24px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.85)'
                      : '0 10px 30px rgba(0,0,0,0.12)',
                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
                  pointerEvents: offset === 0 ? 'auto' : 'none',
                }}
                drag={offset === 0 ? 'x' : false}
                dragConstraints={offset === 0 ? { left: 0, right: 0 } : undefined}
                dragElastic={offset === 0 ? 0.5 : undefined}
                onDragEnd={
                  offset === 0
                    ? (_, info) => {
                        if (info.offset.x < -60 || info.velocity.x < -400) navigate(1);
                        else if (info.offset.x > 60 || info.velocity.x > 400) navigate(-1);
                      }
                    : undefined
                }
              >
                {/* Visual Geometry Accent */}
                <ShapeDecor type={slide.shape} accent={slide.accent} primary={textPrimary} />

                {/* Card Internal Content */}
                <div className="absolute inset-0 p-8 sm:p-9 flex flex-col justify-between">
                  {/* Top Bar */}
                  <div className="flex justify-between items-center">
                    <span
                      className="font-sans text-xs font-extrabold uppercase tracking-wider"
                      style={{ color: slide.accent }}
                    >
                      {slide.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-white/50 dark:text-white/40">
                      {slide.num} / 04
                    </span>
                  </div>

                  {/* Body Content */}
                  <div>
                    <div
                      className="font-display font-black text-7xl sm:text-8xl leading-none mb-4 tracking-tighter"
                      style={{ color: slide.accent }}
                    >
                      {slide.num}
                    </div>
                    <h3
                      className="font-display text-2xl sm:text-3xl font-bold leading-tight tracking-tight whitespace-pre-line mb-3"
                      style={{ color: textPrimary }}
                    >
                      {slide.title}
                    </h3>
                    <p className="font-sans text-sm sm:text-base text-white/75 dark:text-white/70 leading-relaxed">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ─── NAVIGATION CONTROLS & INDICATOR DOTS ──────────────────────────── */}
        <div className="flex items-center gap-4 mt-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Previous Slide"
            className="size-10 rounded-full bg-white/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer backdrop-blur-md"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="flex items-center gap-2">
            {SLIDES.map((s, i) => (
              <motion.button
                key={s.id}
                onClick={() => {
                  if (i !== current) goTo(i, i > current ? 1 : -1);
                }}
                className="h-2.5 rounded-full border-none cursor-pointer p-0 transition-colors"
                style={{
                  background:
                    i === current
                      ? '#10B981'
                      : isDark
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(0,0,0,0.15)',
                }}
                animate={{ width: i === current ? 32 : 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Next Slide"
            className="size-10 rounded-full bg-white/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer backdrop-blur-md"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ShapeDecor({
  type,
  accent,
  primary,
}: {
  type: string;
  accent: string;
  primary: string;
}) {
  if (type === 'circle') {
    return (
      <div
        className="absolute -right-10 -top-10 size-48 rounded-full border-2 opacity-20 pointer-events-none"
        style={{ borderColor: accent }}
      />
    );
  }
  if (type === 'square') {
    return (
      <div
        className="absolute right-6 top-10 size-20 border-2 rotate-12 opacity-25 pointer-events-none"
        style={{ borderColor: accent }}
      />
    );
  }
  if (type === 'line') {
    return (
      <>
        <div
          className="absolute right-8 inset-y-0 w-1 opacity-15 pointer-events-none"
          style={{ background: primary }}
        />
        <div
          className="absolute right-12 inset-y-0 w-0.5 opacity-10 pointer-events-none"
          style={{ background: primary }}
        />
      </>
    );
  }
  if (type === 'triangle') {
    return (
      <svg
        className="absolute -right-8 -top-6 w-40 h-36 opacity-20 pointer-events-none"
        viewBox="0 0 180 160"
        fill="none"
      >
        <polygon
          points="90,12 172,148 8,148"
          stroke={primary}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return null;
}

export default SlideDeck;
