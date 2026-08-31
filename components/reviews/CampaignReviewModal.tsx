'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useId,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X,
  Sparkles,
  CheckCircle2,
  Send,
  MessageSquare,
  ShieldCheck,
  Star,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { submitCampaignReviewAction } from '@/app/actions/reviews';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Theme = 'light' | 'dark';

function readTheme(el: HTMLElement | null): Theme {
  if (typeof document === 'undefined') return 'dark';
  const card = el?.closest('[data-card-theme]');
  if (card) return card.classList.contains('dark') ? 'dark' : 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function useTheme(rootRef: React.RefObject<HTMLElement | null>): Theme {
  const [theme, setTheme] = useState<Theme>(() => readTheme(rootRef.current));
  useIsomorphicLayoutEffect(() => {
    const el = rootRef.current;
    setTheme(readTheme(el));
    if (typeof document === 'undefined') return;
    const update = () => setTheme(readTheme(el));
    const observer = new MutationObserver(update);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const card = el?.closest('[data-card-theme]');
    if (card) {
      observer.observe(card, {
        attributes: true,
        attributeFilter: ['class', 'data-card-theme'],
      });
    }
    return () => observer.disconnect();
  }, [rootRef]);
  return theme;
}

// ─── Color Math Helpers ──────────────────────────────────────────────────────
function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) =>
    Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function lerpHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex([
    ca[0] + (cb[0] - ca[0]) * t,
    ca[1] + (cb[1] - ca[1]) * t,
    ca[2] + (cb[2] - ca[2]) * t,
  ]);
}

function tintHex(hex: string, t: number): string {
  return lerpHex(hex, '#FFFFFF', t);
}

const DARK_NEUTRAL = '#1B1B22';

function shadeHex(hex: string, t: number): string {
  return lerpHex(hex, DARK_NEUTRAL, t);
}

function inkHex(hex: string): string {
  return lerpHex(hex, '#14140F', 0.82);
}

// ─── Expressive SVG Sentiment Character Faces ───────────────────────────────
interface FaceProps {
  size: number;
}

const STROKE_W = 2.6;

function PoorFace({ size }: FaceProps) {
  const ink = '#5A1E0E';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="8" width="48" height="48" rx="18" fill="#E4483C" />
      <path d="M18 24 L28 28" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" />
      <path d="M46 24 L36 28" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" />
      <circle cx="24" cy="33" r="3.4" fill={ink} />
      <circle cx="40" cy="33" r="3.4" fill={ink} />
      <path d="M22 46 Q32 38 42 46" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" fill="none" />
    </svg>
  );
}

function MediocreFace({ size }: FaceProps) {
  const ink = '#6B3F12';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="8" width="48" height="48" rx="18" fill="#E5A85E" />
      <circle cx="24" cy="30" r="3.4" fill={ink} />
      <circle cx="40" cy="30" r="3.4" fill={ink} />
      <path d="M20 25 L28 25" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M36 25 L44 25" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="24" y1="43" x2="40" y2="43" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" />
    </svg>
  );
}

function DecentFace({ size }: FaceProps) {
  const ink = '#3F551A';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="8" width="48" height="48" rx="18" fill="#A9C95E" />
      <circle cx="24" cy="30" r="3.4" fill={ink} />
      <circle cx="40" cy="30" r="3.4" fill={ink} />
      <path d="M20 25 Q24 23 28 25" stroke={ink} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M36 25 Q40 23 44 25" stroke={ink} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M24 41 Q32 47 40 41" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" fill="none" />
    </svg>
  );
}

function GreatFace({ size }: FaceProps) {
  const ink = '#0B1B66';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="8" width="48" height="48" rx="18" fill="#2F49E8" />
      <circle cx="18" cy="37" r="4.5" fill="#5B7CFF" opacity="0.6" />
      <circle cx="46" cy="37" r="4.5" fill="#5B7CFF" opacity="0.6" />
      <path d="M19 28 Q24 22 29 28" stroke="#FFFFFF" strokeWidth={STROKE_W} strokeLinecap="round" fill="none" />
      <path d="M35 28 Q40 22 45 28" stroke="#FFFFFF" strokeWidth={STROKE_W} strokeLinecap="round" fill="none" />
      <path d="M22 38 Q32 50 42 38 Z" fill="#FFFFFF" />
    </svg>
  );
}

function LegendaryFace({ size }: FaceProps) {
  const ink = '#063B1E';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="8" width="48" height="48" rx="18" fill="#17A75B" />
      <path d="M24 16 L25.5 20 L29.5 21.5 L25.5 23 L24 27 L22.5 23 L18.5 21.5 L22.5 20 Z" fill="#FFE600" />
      <path d="M42 16 L43.5 19 L46.5 20.5 L43.5 22 L42 25 L40.5 22 L37.5 20.5 L40.5 19 Z" fill="#FFE600" />
      <path d="M19 29 Q24 23 29 29" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M35 29 Q40 23 45 29" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M20 37 Q32 53 44 37 Z" fill="#FFFFFF" />
    </svg>
  );
}

interface SentimentLevel {
  id: 'poor' | 'mediocre' | 'decent' | 'great' | 'legendary';
  label: string;
  sublabel: string;
  rating: number;
  color: string;
  Svg: (props: FaceProps) => React.ReactElement;
}

const SENTIMENTS: readonly SentimentLevel[] = [
  { id: 'poor', label: 'Poor', sublabel: 'Needs serious improvement', rating: 1, color: '#E4483C', Svg: PoorFace },
  { id: 'mediocre', label: 'Mediocre', sublabel: 'Met minimal expectations', rating: 2, color: '#E5A85E', Svg: MediocreFace },
  { id: 'decent', label: 'Decent', sublabel: 'Good overall experience', rating: 3, color: '#A9C95E', Svg: DecentFace },
  { id: 'great', label: 'Great!', sublabel: 'Smooth and rewarding', rating: 4, color: '#2F49E8', Svg: GreatFace },
  { id: 'legendary', label: 'Legendary! 🚀', sublabel: 'Top tier collaboration', rating: 5, color: '#17A75B', Svg: LegendaryFace },
];

const BLOBS = [
  { x: 24, y: 30, size: 72, tint: 'base', dx: 8, dy: 6, dur: 11 },
  { x: 76, y: 26, size: 66, tint: 'soft', dx: 7, dy: 8, dur: 13 },
  { x: 34, y: 76, size: 78, tint: 'soft', dx: 9, dy: 5, dur: 15 },
  { x: 80, y: 74, size: 60, tint: 'base', dx: 6, dy: 9, dur: 12 },
  { x: 52, y: 50, size: 54, tint: 'base', dx: 10, dy: 7, dur: 17 },
] as const;

// ─── Contextual Prefilled Pills ─────────────────────────────────────────────
const CREATOR_TAG_OPTIONS = [
  { id: 'fast_verify', label: '⚡ Fast Verification' },
  { id: 'great_cpm', label: '💰 Great CPM Rate' },
  { id: 'clear_brief', label: '📝 Clear Brief' },
  { id: 'respectful', label: '🤝 Respectful Brand' },
  { id: 'will_repeat', label: '🚀 Would Post Again' },
  { id: 'premium_assets', label: '💎 Premium Assets' },
  { id: 'friday_pay', label: '💸 Smooth Friday Pay' },
  { id: 'easy_rules', label: '💡 Easy Guidelines' },
];

const ADVERTISER_TAG_OPTIONS = [
  { id: 'high_velocity', label: '📈 High View Velocity' },
  { id: 'budget_protected', label: '🛡️ 100% Budget Protected' },
  { id: 'target_reached', label: '🎯 Target Audience Reached' },
  { id: 'rapid_turnaround', label: '⚡ Rapid Creator Turnaround' },
  { id: 'cost_effective', label: '💸 Cost-Effective CPM' },
  { id: 'realtime_analytics', label: '📊 Real-Time Analytics' },
  { id: 'authentic_posts', label: '🌟 Authentic Posts' },
];

export interface CampaignReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  brandName?: string;
  role?: 'creator' | 'advertiser';
  metricsHighlight?: string;
  onSubmitted?: () => void;
}

export function CampaignReviewModal({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  brandName,
  role = 'creator',
  metricsHighlight,
  onSubmitted,
}: CampaignReviewModalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const theme = useTheme(rootRef);
  const isDark = theme === 'dark';
  const reduced = useReducedMotion() ?? false;
  const uid = useId();

  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(3); // Default to Great!
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sentiment = SENTIMENTS[index];
  const tagOptions = role === 'creator' ? CREATOR_TAG_OPTIONS : ADVERTISER_TAG_OPTIONS;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tints for fluid blobs
  const baseTint = useMemo(
    () => (isDark ? shadeHex(sentiment.color, 0.5) : tintHex(sentiment.color, 0.5)),
    [sentiment.color, isDark]
  );
  const softTint = useMemo(
    () => (isDark ? shadeHex(sentiment.color, 0.44) : tintHex(sentiment.color, 0.66)),
    [sentiment.color, isDark]
  );
  const panelWash = useMemo(
    () => (isDark ? shadeHex(sentiment.color, 0.56) : tintHex(sentiment.color, 0.62)),
    [sentiment.color, isDark]
  );
  const panelInk = useMemo(
    () => (isDark ? tintHex(sentiment.color, 0.88) : inkHex(sentiment.color)),
    [sentiment.color, isDark]
  );
  const deepAccent = useMemo(
    () => lerpHex(sentiment.color, '#000000', 0.18),
    [sentiment.color]
  );

  const setSentimentIndex = useCallback((i: number) => {
    setIndex(clamp(i, 0, SENTIMENTS.length - 1));
  }, []);

  const toggleTag = (label: string) => {
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await submitCampaignReviewAction({
        campaignId,
        sentimentId: sentiment.id,
        rating: sentiment.rating,
        tags: selectedTags,
        comment,
        metricsHighlight,
      });

      if (res.success) {
        setIsSubmitted(true);
        if (onSubmitted) onSubmitted();
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePct = ((index + 0.5) / SENTIMENTS.length) * 100;
  const BigSvg = sentiment.Svg;

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full max-w-[480px] my-auto rounded-[32px] overflow-hidden bg-white dark:bg-[#0E121E] border border-slate-200/90 dark:border-white/10 shadow-2xl p-6 sm:p-7 text-slate-900 dark:text-white font-sans"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 z-20 size-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <X className="size-4" />
        </button>

        {isSubmitted ? (
          /* ─── SUCCESS CELEBRATION STATE ──────────────────────────────────── */
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="size-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20"
            >
              <CheckCircle2 className="size-10" />
            </motion.div>
            <h3 className="font-display text-2xl font-bold text-slate-950 dark:text-white mb-2">
              Review Submitted! 🎉
            </h3>
            <p className="font-sans text-sm text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
              Thank you for your feedback. Your review helps strengthen verified transparency across Kpugi.
            </p>
          </div>
        ) : (
          /* ─── INTERACTIVE REVIEW FLOW ─────────────────────────────────────── */
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                ⭐ Campaign Feedback
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-950 dark:text-white leading-tight">
                {role === 'creator' ? `Review ${brandName || 'Brand Campaign'}` : 'Rate Platform Experience'}
              </h2>
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {campaignTitle}
              </p>
            </div>

            {/* ─── ANIMATED FLUID BLOB CANVAS & SENTIMENT FACE ─────────────────── */}
            <div
              className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl p-5"
              style={{
                background: panelWash,
                minHeight: 180,
                transition: 'background 0.45s ease',
              }}
            >
              {/* Drifting Fluid Blobs */}
              <div aria-hidden="true" className="absolute inset-0" style={{ filter: 'blur(24px)' }}>
                {BLOBS.map((blob, i) => {
                  const color = blob.tint === 'base' ? baseTint : softTint;
                  const driftAnim = reduced
                    ? { x: 0, y: 0 }
                    : {
                        x: [0, blob.dx, -blob.dx * 0.6, 0],
                        y: [0, -blob.dy, blob.dy * 0.7, 0],
                      };
                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        left: `${blob.x}%`,
                        top: `${blob.y}%`,
                        width: `${blob.size}%`,
                        aspectRatio: '1 / 1',
                        translateX: '-50%',
                        translateY: '-50%',
                        background: `radial-gradient(circle at 50% 50%, ${color}, ${color}00 70%)`,
                        opacity: isDark ? 0.85 : 0.7,
                        transition: 'background 0.45s ease',
                      }}
                      animate={driftAnim}
                      transition={{
                        duration: blob.dur,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatType: 'loop',
                      }}
                    />
                  );
                })}
              </div>

              {/* Expressive Face & Text */}
              <div className="relative z-10 flex flex-col items-center gap-2.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={sentiment.id}
                    initial={{ opacity: 0, scale: 0.75, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.75, y: -8 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                    className="flex items-center justify-center drop-shadow-md"
                  >
                    <BigSvg size={90} />
                  </motion.div>
                </AnimatePresence>

                <div className="text-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={sentiment.label}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="font-display text-xl font-extrabold"
                      style={{ color: panelInk }}
                    >
                      {sentiment.label}
                    </motion.div>
                  </AnimatePresence>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {sentiment.sublabel}
                  </span>
                </div>
              </div>
            </div>

            {/* ─── QUICK SELECT & SLIDER ────────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Select rating</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {sentiment.rating} / 5 Stars
                </span>
              </div>

              {/* Quick Icon Selector Buttons */}
              <div className="grid grid-cols-5 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/5">
                {SENTIMENTS.map((s, i) => {
                  const active = i === index;
                  const SmallFace = s.Svg;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSentimentIndex(i)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                        active
                          ? 'bg-white dark:bg-[#1A2035] shadow-md scale-105 border border-slate-200 dark:border-white/10'
                          : 'opacity-60 hover:opacity-100 hover:bg-white/50 dark:hover:bg-white/5'
                      }`}
                    >
                      <SmallFace size={28} />
                      <span className="text-[10px] font-bold mt-1 leading-none">{s.rating}★</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── CONTEXTUAL PREFILLED PILLS ─────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                What stood out? (Tap all that apply)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tagOptions.map((tag) => {
                  const selected = selectedTags.includes(tag.label);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.label)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
                        selected
                          ? 'bg-[#2F49E8] text-white shadow-md shadow-[#2F49E8]/20 scale-102'
                          : 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── OPTIONAL COMMENTS TEXTAREA ──────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Additional Comments (Optional)
              </span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this campaign or brand..."
                rows={2}
                maxLength={300}
                className="w-full rounded-2xl p-3 text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#2F49E8] focus:ring-1 focus:ring-[#2F49E8] resize-none"
              />
              <div className="text-right text-[10px] text-slate-400">
                {comment.length}/300
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* ─── SUBMIT BUTTON ──────────────────────────────────────────────── */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-display font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Review</span>
                  <ChevronRight className="size-4" />
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

export default CampaignReviewModal;
