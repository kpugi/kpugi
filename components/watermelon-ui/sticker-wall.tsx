'use client';

/**
 * Presents an interactive physics wall where creator wins, notes, and emoji stickers
 * fall into the scene, collide, bounce, and can be dragged with authentic physics.
 * 
 * Security & Performance:
 * - HTML/XSS immune Canvas rendering with input string sanitization & length limits
 * - Client-side rate limiting to prevent spam floods
 * - FIFO capacity cap (STICKER_CAP) with smooth fade-out and memory reclamation
 * - "Shake Wall" reset button to clean out full scenes
 */

import React, { useEffect, useLayoutEffect, useRef, useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import type { Engine, Runner, World, Body, MouseConstraint as MC, Mouse as MatterMouse } from 'matter-js';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Physics configuration (Snappy, natural gravity and movement)
const GRAVITY_SCALE = 0.0022; // Faster gravity drop
const RESTITUTION = 0.16; // Bounciness
const FRICTION = 0.55;
const FRICTION_AIR = 0.008; // Reduced air resistance for faster fall
const DENSITY = 0.0015;
const STICKER_CAP = 35; // Maximum active stickers in scene
const FADE_MS = 300;
const WALL_THICKNESS = 60;

const TEXT_FONT_PX = 14;
const TEXT_MAX_WIDTH = 200;
const TEXT_PAD_X = 16;
const TEXT_PAD_Y = 12;
const TEXT_LINE_H = 20;

const EMOJI_SIZE = 64;
const EMOJI_FONT_PX = 36;

const CARD_RADIUS = 24;
const BORDER_WIDTH = 2;

// High-contrast vibrant palettes
const PALETTE_DARK = ['#10B981', '#38BDF8', '#F472B6', '#A78BFA', '#FBBF24', '#34D399', '#818CF8'];
const PALETTE_LIGHT = ['#059669', '#0284C7', '#DB2777', '#7C3AED', '#D97706', '#10B981', '#4F46E5'];

const STICKER_TEXT_COLOR_DARK = '#050811';
const STICKER_TEXT_COLOR_LIGHT = '#FFFFFF';

// Creator wins and community seed quotes
const SEED_QUOTES = [
  'got paid on friday 🚀',
  'my reel hit 25k views! 💃',
  'no follower minimum is crazy 🔥',
  'switched from brand DMs to Kpugi 💰',
  'zenith alert landed at 4pm ⚡',
  'first ₦50k drop completed 🙌',
  'tiktok video went viral 📈',
  'direct bank cashout 💚',
  'monetizing my views 💬',
  'no agency delay is so refreshing ✨',
];

const SEED_EMOJIS = ['🔥', '💰', '🇳🇬', '⚡', '🚀', '💚', '💸', '🙌', '📈', '🎯', '✨', '⭐'];

// Fast emoji launcher presets
const QUICK_EMOJIS = ['🔥', '💰', '🇳🇬', '🚀', '💚'];

type StickerKind = 'text' | 'emoji';

interface Sticker {
  body: Body;
  kind: StickerKind;
  content: string;
  w: number;
  h: number;
  color: string;
  lines: string[];
  createdAt: number;
  fadeStart?: number;
}

type BodyWithPlugin = Body & { plugin: { sticker?: Sticker } };

// ─── SECURITY: INPUT SANITIZATION & STRIPPING ──────────────────────────────
function sanitizeInput(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  // 1. Remove dangerous script/HTML tags and angle brackets
  let clean = raw.replace(/<[^>]*>?/gm, '');
  // 2. Strip non-printable / control characters (protect canvas rendering)
  clean = clean.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  // 3. Normalize whitespace & trim
  clean = clean.replace(/\s+/g, ' ').trim();
  // 4. Hard length limit (max 50 chars)
  return clean.slice(0, 50);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = ctx.measureText(candidate).width;
    if (width <= maxWidth) {
      current = candidate;
    } else if (!current) {
      lines.push(word);
      current = '';
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

function measureTextCard(
  ctx: CanvasRenderingContext2D,
  text: string
): { lines: string[]; w: number; h: number } {
  ctx.save();
  ctx.font = `700 ${TEXT_FONT_PX}px 'Satoshi', system-ui, -apple-system, sans-serif`;
  const lines = wrapText(ctx, text, TEXT_MAX_WIDTH);
  let maxW = 0;
  for (const line of lines) {
    const lw = ctx.measureText(line).width;
    if (lw > maxW) maxW = lw;
  }
  ctx.restore();
  const w = Math.max(80, Math.round(maxW + TEXT_PAD_X * 2));
  const h = Math.max(44, Math.round(lines.length * TEXT_LINE_H + TEXT_PAD_Y * 2));
  return { lines, w, h };
}

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickPalette(isDark: boolean): string[] {
  return isDark ? PALETTE_DARK : PALETTE_LIGHT;
}

export interface StickerWallProps {
  badgeText?: string;
  title?: string;
  description?: string;
}

export function StickerWall({
  badgeText = 'Creator Community Wall',
  title = 'Creator Wins & Hype Wall 💬',
  description = 'Drop a win, toss an emoji, or drag stickers around. Real physics, no limits. Leave your mark on the wall.',
}: StickerWallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const engineRef = useRef<Engine | null>(null);
  const worldRef = useRef<World | null>(null);
  const stickersRef = useRef<Sticker[]>([]);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const measureCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const paletteRef = useRef<string[]>(PALETTE_DARK);
  const matterRef = useRef<typeof import('matter-js') | null>(null);
  const lastSubmitTimeRef = useRef<number>(0);

  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : true
  );
  const isDarkRef = useRef<boolean>(isDark);

  useIsomorphicLayoutEffect(() => {
    isDarkRef.current = isDark;
    paletteRef.current = pickPalette(isDark);
  }, [isDark]);

  useEffect(() => {
    const palette = pickPalette(isDark);
    stickersRef.current.forEach((sticker, i) => {
      sticker.color = palette[i % palette.length];
    });
  }, [isDark]);

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => {
      const dark = document.documentElement.classList.contains('dark');
      setIsDark(dark);
      isDarkRef.current = dark;
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  function populateSeeds(Matter: typeof import('matter-js'), w: number, h: number) {
    if (!worldRef.current) return;
    const palette = paletteRef.current;

    for (let i = 0; i < SEED_QUOTES.length; i++) {
      const quote = SEED_QUOTES[i];
      const color = palette[i % palette.length];
      const x = randBetween(80, Math.max(100, w - 80));
      const y = randBetween(60, Math.max(100, h - 120));
      const sticker = makeTextSticker(Matter, quote, x, y, color, false);
      Matter.Body.setAngularVelocity(sticker.body, randBetween(-0.04, 0.04));
      Matter.Body.setVelocity(sticker.body, { x: randBetween(-0.4, 0.4), y: randBetween(-0.4, 0.4) });
      Matter.Composite.add(worldRef.current, sticker.body);
      stickersRef.current.push(sticker);
    }

    for (let i = 0; i < SEED_EMOJIS.length; i++) {
      const emoji = SEED_EMOJIS[i];
      const color = palette[(i + 2) % palette.length];
      const x = randBetween(70, Math.max(90, w - 70));
      const y = randBetween(60, Math.max(100, h - 120));
      const sticker = makeEmojiSticker(Matter, emoji, x, y, color);
      Matter.Body.setAngularVelocity(sticker.body, randBetween(-0.04, 0.04));
      Matter.Body.setVelocity(sticker.body, { x: randBetween(-0.4, 0.4), y: randBetween(-0.4, 0.4) });
      Matter.Composite.add(worldRef.current, sticker.body);
      stickersRef.current.push(sticker);
    }
  }

  function makeTextSticker(
    Matter: typeof import('matter-js'),
    text: string,
    x: number,
    y: number,
    color: string,
    spawnMotion: boolean
  ): Sticker {
    const { lines, w, h } = measureTextCard(measureCtxRef.current!, text);
    const body = Matter.Bodies.rectangle(x, y, w, h, {
      restitution: RESTITUTION,
      friction: FRICTION,
      frictionAir: FRICTION_AIR,
      density: DENSITY,
      angle: randBetween(-0.2, 0.2),
      render: { visible: false },
    });
    if (spawnMotion) {
      Matter.Body.setAngularVelocity(body, randBetween(-0.05, 0.05));
      Matter.Body.setVelocity(body, { x: randBetween(-0.5, 0.5), y: 3.0 });
    }
    const sticker: Sticker = {
      body,
      kind: 'text',
      content: text,
      w,
      h,
      color,
      lines,
      createdAt: performance.now(),
    };
    (body as BodyWithPlugin).plugin = { sticker };
    return sticker;
  }

  function makeEmojiSticker(
    Matter: typeof import('matter-js'),
    emoji: string,
    x: number,
    y: number,
    color: string
  ): Sticker {
    const body = Matter.Bodies.rectangle(x, y, EMOJI_SIZE, EMOJI_SIZE, {
      restitution: RESTITUTION,
      friction: FRICTION,
      frictionAir: FRICTION_AIR,
      density: DENSITY,
      angle: randBetween(-0.2, 0.2),
      render: { visible: false },
    });
    const sticker: Sticker = {
      body,
      kind: 'emoji',
      content: emoji,
      w: EMOJI_SIZE,
      h: EMOJI_SIZE,
      color,
      lines: [],
      createdAt: performance.now(),
    };
    (body as BodyWithPlugin).plugin = { sticker };
    return sticker;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    measureCtxRef.current = ctx;

    let alive = true;
    let rafId = 0;

    let engine: Engine | null = null;
    let runner: Runner | null = null;
    let world: World | null = null;
    let walls: Body[] = [];
    let mouse: MatterMouse | null = null;
    let mouseConstraint: MC | null = null;
    let ro: ResizeObserver | null = null;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function buildWalls(Matter: typeof import('matter-js'), w: number, h: number): Body[] {
      const t = WALL_THICKNESS;
      const opts = { isStatic: true, render: { visible: false } };
      return [
        Matter.Bodies.rectangle(w / 2, -t / 2, w + t * 2, t, opts),
        Matter.Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, opts),
        Matter.Bodies.rectangle(-t / 2, h / 2, t, h + t * 2, opts),
        Matter.Bodies.rectangle(w + t / 2, h / 2, t, h + t * 2, opts),
      ];
    }

    function resize() {
      const Matter = matterRef.current;
      if (!Matter || !world) return;
      const w = container!.clientWidth || 480;
      const h = container!.clientHeight || 480;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (walls.length > 0) {
        for (const wall of walls) Matter.Composite.remove(world, wall);
      }
      walls = buildWalls(Matter, w, h);
      Matter.Composite.add(world, walls);

      for (const s of stickersRef.current) {
        const p = s.body.position;
        let nx = p.x;
        let ny = p.y;
        if (nx < 20) nx = 20;
        if (nx > w - 20) nx = w - 20;
        if (ny > h - 20) ny = h - 20;
        if (nx !== p.x || ny !== p.y) Matter.Body.setPosition(s.body, { x: nx, y: ny });
      }

      if (mouse) mouse.pixelRatio = dpr;
      sizeRef.current = { w, h };
    }

    function drawFrame(now: number) {
      if (!alive) return;
      const dark = isDarkRef.current;
      const { w: W, h: H } = sizeRef.current;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);

      const stickers = stickersRef.current;
      const Matter = matterRef.current;

      // ─── FIFO OVERFLOW & FADE-OUT REMOVAL ──────────────────────────────────
      if (Matter && world) {
        for (let i = stickers.length - 1; i >= 0; i--) {
          const s = stickers[i];
          if (s.fadeStart !== undefined) {
            const dt = now - s.fadeStart;
            if (dt >= FADE_MS) {
              Matter.Composite.remove(world, s.body);
              stickers.splice(i, 1);
            }
          }
        }
      }

      // Draw active stickers
      for (const s of stickers) {
        const { body, w, h, color, kind, lines, content } = s;

        let alpha = 1;
        if (s.fadeStart !== undefined) {
          const dt = now - s.fadeStart;
          alpha = Math.max(0, 1 - dt / FADE_MS);
        }

        ctx!.save();
        ctx!.globalAlpha = alpha;
        ctx!.translate(body.position.x, body.position.y);
        ctx!.rotate(body.angle);

        ctx!.fillStyle = color;
        roundedRect(ctx!, -w / 2, -h / 2, w, h, CARD_RADIUS);
        ctx!.fill();

        ctx!.strokeStyle = dark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.85)';
        ctx!.lineWidth = BORDER_WIDTH;
        const inset = BORDER_WIDTH;
        roundedRect(
          ctx!,
          -w / 2 + inset,
          -h / 2 + inset,
          w - inset * 2,
          h - inset * 2,
          Math.max(1, CARD_RADIUS - inset)
        );
        ctx!.stroke();

        if (kind === 'text') {
          ctx!.fillStyle = dark ? STICKER_TEXT_COLOR_DARK : STICKER_TEXT_COLOR_LIGHT;
          ctx!.font = `700 ${TEXT_FONT_PX}px 'Satoshi', system-ui, -apple-system, sans-serif`;
          ctx!.textAlign = 'center';
          ctx!.textBaseline = 'middle';
          const totalH = lines.length * TEXT_LINE_H;
          const startY = -totalH / 2 + TEXT_LINE_H / 2;
          for (let li = 0; li < lines.length; li++) {
            ctx!.fillText(lines[li], 0, startY + li * TEXT_LINE_H);
          }
        } else {
          ctx!.font = `${EMOJI_FONT_PX}px system-ui, -apple-system, sans-serif`;
          ctx!.textAlign = 'center';
          ctx!.textBaseline = 'middle';
          ctx!.fillText(content, 0, 2);
        }

        ctx!.restore();
      }

      rafId = requestAnimationFrame(drawFrame);
    }

    import('matter-js').then((Matter) => {
      if (!alive) return;
      matterRef.current = Matter;

      engine = Matter.Engine.create({ gravity: { x: 0, y: 1, scale: GRAVITY_SCALE } });
      engine.timing.timeScale = 1.0; // Normal, fluid real-time speed
      world = engine.world;
      engineRef.current = engine;
      worldRef.current = world;

      runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);

      resize();
      mouse = Matter.Mouse.create(canvas!);
      mouse.pixelRatio = dpr;
      mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.2,
          damping: 0.1,
          render: { visible: false },
        },
      });
      Matter.Composite.add(world, mouseConstraint);

      populateSeeds(Matter, sizeRef.current.w, sizeRef.current.h);

      ro = new ResizeObserver(resize);
      ro.observe(container!);

      rafId = requestAnimationFrame(drawFrame);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      const Matter = matterRef.current;
      if (Matter) {
        if (runner) Matter.Runner.stop(runner);
        if (world) Matter.Composite.clear(world, false, true);
        if (engine) Matter.Engine.clear(engine);
      }
      matterRef.current = null;
      engineRef.current = null;
      worldRef.current = null;
      stickersRef.current = [];
      measureCtxRef.current = null;
    };
  }, []);

  // ─── SHAKE & RESET SCENE (CLEAR OVERCROWDED WALL) ─────────────────────────
  function handleReset() {
    const Matter = matterRef.current;
    const world = worldRef.current;
    if (!Matter || !world) return;

    // Fade out all current stickers smoothly
    const now = performance.now();
    stickersRef.current.forEach((s) => {
      if (s.fadeStart === undefined) s.fadeStart = now;
    });

    // Re-seed after fade
    setTimeout(() => {
      if (matterRef.current && worldRef.current) {
        populateSeeds(matterRef.current, sizeRef.current.w, sizeRef.current.h);
      }
    }, FADE_MS + 50);
  }

  // ─── SAFE DROP EMOTION OR NOTE (WITH RATE LIMIT & SANITIZATION) ───────────
  function dropItem(content: string, kind: StickerKind = 'text') {
    const now = performance.now();
    // Rate limit: Max 1 item per 400ms to prevent spam bots or freezing
    if (now - lastSubmitTimeRef.current < 400) return;
    lastSubmitTimeRef.current = now;

    const cleaned = kind === 'text' ? sanitizeInput(content) : content.trim();
    if (!cleaned) return;

    const Matter = matterRef.current;
    const world = worldRef.current;
    const ctx = measureCtxRef.current;
    if (!Matter || !world || !ctx) return;

    const { w: W } = sizeRef.current;
    if (W === 0) return;

    const palette = paletteRef.current;
    const color = palette[Math.floor(Math.random() * palette.length)];
    const x = randBetween(80, Math.max(100, W - 80));
    const y = -30;

    let sticker: Sticker;
    if (kind === 'text') {
      sticker = makeTextSticker(Matter, cleaned, x, y, color, true);
    } else {
      sticker = makeEmojiSticker(Matter, cleaned, x, y, color);
      Matter.Body.setAngularVelocity(sticker.body, randBetween(-0.05, 0.05));
      Matter.Body.setVelocity(sticker.body, { x: randBetween(-0.5, 0.5), y: 3.0 });
    }

    Matter.Composite.add(world, sticker.body);
    stickersRef.current.push(sticker);

    // ─── FIFO OVERFLOW CLEANUP: FADE OLDEST ITEMS IF OVER STICKER_CAP ───────
    if (stickersRef.current.length > STICKER_CAP) {
      for (const s of stickersRef.current) {
        if (s.fadeStart === undefined) {
          s.fadeStart = performance.now();
          break;
        }
      }
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = inputRef.current;
    if (!input) return;
    const val = input.value;
    if (!val.trim()) return;

    dropItem(val, 'text');
    input.value = '';
  }

  return (
    <section className="relative w-full py-16 sm:py-24 px-2 sm:px-4 lg:px-6 overflow-hidden bg-transparent transition-colors duration-300">
      {/* Ambient background glowing aura */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[650px] bg-gradient-to-tr from-emerald-500/10 via-sky-500/10 to-indigo-500/10 dark:from-emerald-500/[0.08] dark:via-cyan-500/[0.06] dark:to-violet-500/[0.08] blur-[160px] rounded-full" />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto">
        {/* Main interactive physics box - Full Width & Height */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative h-[620px] sm:h-[700px] lg:h-[740px] w-full overflow-hidden rounded-3xl sm:rounded-[36px] border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#070b16]/75 shadow-2xl backdrop-blur-2xl"
          style={{ touchAction: 'none' }}
        >
          {/* Specular glass top highlight line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 dark:via-emerald-400/30 to-transparent"
          />

          {/* Reset / Shake Wall Button */}
          <button
            type="button"
            onClick={handleReset}
            title="Shake and Reset Wall"
            aria-label="Shake and Reset Wall"
            className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-slate-600 dark:text-slate-300 text-xs font-bold shadow-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="size-3 text-emerald-500" />
            <span className="hidden sm:inline">Reset Wall</span>
          </button>

          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />

          {/* Overlay Form & Title */}
          <form
            onSubmit={onSubmit}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-6 sm:p-9"
          >
            {/* Top Title */}
            <div className="pointer-events-none flex flex-col items-center text-center max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-xs backdrop-blur-md">
                <span>⚡ {badgeText}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 dark:text-white mb-2">
                {title}
              </h2>
              <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {description}
              </p>
            </div>

            {/* Bottom Controls: Quick Emoji Bar + Safe Input Pill */}
            <div className="pointer-events-auto flex flex-col items-center gap-3 w-full max-w-md">
              {/* Quick One-Click Emoji Launcher */}
              <div className="flex items-center gap-2 bg-white/80 dark:bg-[#0c1224]/80 p-1 px-2.5 rounded-full border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-md">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-1 uppercase tracking-wider">
                  Toss:
                </span>
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => dropItem(emoji, 'emoji')}
                    className="hover:scale-125 active:scale-95 transition-transform text-lg cursor-pointer p-0.5"
                    title={`Drop ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Text Input Pill */}
              <div className="flex w-full items-center gap-2 rounded-full p-1.5 bg-white/90 dark:bg-[#0c1224]/90 border border-slate-200/90 dark:border-white/15 shadow-xl backdrop-blur-xl transition-all focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Post a win or note (max 50 chars)…"
                  maxLength={50}
                  className="font-sans flex-1 bg-transparent px-4 py-2 text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                />
                <button
                  type="submit"
                  className="font-sans inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  Drop on Wall
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

export default StickerWall;
