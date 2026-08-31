'use client';

import React, { useState, type ReactNode, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { FaArrowRight, FaChevronDown, FaXmark } from 'react-icons/fa6';
import LogoIcon from '@/assets/logo-icon';

export interface Hero9NavItem {
  label: string;
  href: string;
  hasMenu?: boolean;
}

export interface Hero9Avatar {
  src: string;
  alt: string;
}

export interface Hero9Props {
  logo?: ReactNode;
  logoText?: string;
  navItems?: Hero9NavItem[];
  ctaText?: string;
  ctaHref?: string;
  eyebrowText?: string;
  avatars?: Hero9Avatar[];
  title?: string;
  description?: string;
  emailPlaceholder?: string;
  formAction?: string;
  submitText?: string;
  backgroundImage?: string;
  showNav?: boolean;
}

const defaultNavItems: Hero9NavItem[] = [
  { label: 'Features', href: '#features' },
  { label: 'Platform CPMs', href: '#calculator' },
  { label: 'Live Drops', href: '#drops' },
  { label: 'FAQs', href: '#faqs' },
];

const defaultAvatars: Hero9Avatar[] = [
  {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    alt: 'Kpugi Creator Amina',
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    alt: 'Kpugi Creator Tobi',
  },
  {
    src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    alt: 'Kpugi Creator Grace',
  },
];

const defaultBackground = 'https://assets.watermelon.sh/hero-9-bg.avif';

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -18, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 0.68, bounce: 0, delay: 0.2 },
  },
};

const contentContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.1,
      delay: 0.15,
    },
  },
};

const contentItem: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 0.72, bounce: 0 },
  },
};

const backgroundVariants: Variants = {
  hidden: { opacity: 0, scale: 1.04, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 1.15, bounce: 0 },
  },
};

export function Hero9({
  logo,
  logoText = 'Kpugi',
  navItems = defaultNavItems,
  ctaText = 'Browse Drops',
  ctaHref = '/browse',
  eyebrowText = 'Over 12,400+ Verified Creators',
  avatars = defaultAvatars,
  title = 'Turn Every 1,000 Views\nInto Direct Cash.',
  description = 'Pick a brand campaign drop. Post on TikTok, Instagram, YouTube, X, or LinkedIn.\nWatch your verified views stack up and withdraw Naira straight to your bank anytime.',
  emailPlaceholder = 'Enter your email to start earning',
  formAction = '/sign-up',
  submitText = 'Start for Free',
  backgroundImage = defaultBackground,
  showNav = false,
}: Hero9Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    const targetUrl = `${formAction}?email=${encodeURIComponent(email.trim())}&role=creator`;
    router.push(targetUrl);
  };

  return (
    <section className="relative isolate w-full overflow-hidden bg-[#F0F4FD] dark:bg-[#050811] font-sans text-slate-900 dark:text-white antialiased min-h-[90vh] sm:min-h-screen flex flex-col justify-center transition-colors duration-300">
      {/* ─── AMBIENT BACKGROUND & MESH ────────────────────────────────────── */}
      <motion.div
        variants={backgroundVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        className="absolute inset-0 pointer-events-none select-none will-change-transform z-0"
        aria-hidden="true"
      >
        <img
          src={backgroundImage}
          alt="Creators Hero Background"
          className="h-full w-full object-cover object-center opacity-60 dark:opacity-40 filter saturate-125 dark:brightness-75"
        />

        {/* Ambient atmospheric gradients for Light & Dark mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200/40 via-[#F0F4FD]/70 to-[#F0F4FD] dark:from-black/60 dark:via-[#050811]/70 dark:to-[#050811]" />
        
        {/* Luminous radial glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-emerald-500/20 via-sky-400/20 to-indigo-500/20 dark:from-emerald-500/15 dark:via-cyan-500/15 dark:to-violet-600/15 blur-[120px] rounded-full" />
      </motion.div>

      {/* ─── SIGNATURE SEAMLESS BOTTOM BLEND MASK (NO VISIBLE DIVIDER LINES) ── */}
      <div 
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#F0F4FD] via-[#F0F4FD]/80 to-transparent dark:from-[#050811] dark:via-[#050811]/85 dark:to-transparent pointer-events-none z-20"
      />

      {/* ─── CONTENT CONTAINER ────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex min-h-[760px] w-full max-w-[1440px] flex-col justify-between px-5 py-6 sm:min-h-screen sm:px-9 lg:px-[58px]">
        {showNav && (
          <motion.header
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.8 }}
            className="flex h-14 items-center justify-between"
          >
            <a
              href="/"
              className="inline-flex min-h-10 items-center gap-2.5 text-slate-950 dark:text-white transition-[opacity,transform] duration-200 ease-out hover:opacity-85 active:scale-[0.97]"
            >
              {logo ?? <LogoIcon className="size-8 text-emerald-500" />}
              <span className="text-xl font-bold tracking-tight">
                {logoText}
              </span>
            </a>

            <nav className="hidden items-center gap-8 lg:flex">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors duration-200 ease-out hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <span>{item.label}</span>
                  {item.hasMenu ? (
                    <FaChevronDown className="size-2.5 transition-transform duration-200 group-hover:translate-y-0.5" />
                  ) : null}
                </a>
              ))}
            </nav>

            <motion.a
              href={ctaHref}
              whileTap={{ scale: 0.96 }}
              className="group hidden min-h-10 items-center gap-2 rounded-full bg-slate-900 dark:bg-white/10 text-white px-5 text-sm font-semibold shadow-md dark:shadow-[0_2px_20px_rgba(255,255,255,0.1)] border border-slate-800 dark:border-white/20 backdrop-blur-md transition-all duration-200 hover:bg-slate-800 dark:hover:bg-white/20 sm:inline-flex"
            >
              <span>{ctaText}</span>
              <FaArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-1" />
            </motion.a>

            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-full bg-white/80 dark:bg-white/10 text-slate-950 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/15 backdrop-blur-md transition-all duration-200 hover:bg-white dark:hover:bg-white/20 active:scale-[0.96] lg:hidden"
            >
              <span className="h-3.5 w-4 bg-[linear-gradient(to_bottom,currentColor_0_2px,transparent_2px_6px,currentColor_6px_8px,transparent_8px_12px,currentColor_12px_14px)]" />
            </button>
          </motion.header>
        )}

        <AnimatePresence initial={false}>
          {showNav && mobileOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(5px)' }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
              className="fixed inset-x-4 top-4 z-50 rounded-[28px] bg-white/95 dark:bg-[#0c1021]/95 p-5 text-slate-950 dark:text-white shadow-2xl border border-slate-200/80 dark:border-white/15 backdrop-blur-2xl lg:hidden"
            >
              <div className="flex items-center justify-between pl-2">
                <a href="/" className="inline-flex items-center gap-2.5">
                  {logo ?? <LogoIcon className="size-8 text-emerald-500" />}
                  <span className="text-lg font-bold tracking-tight">
                    {logoText}
                  </span>
                </a>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex size-10 items-center justify-center rounded-full text-slate-950 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <FaXmark className="size-4" />
                </button>
              </div>

              <nav className="mt-5 grid gap-1">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <span>{item.label}</span>
                    {item.hasMenu ? <FaChevronDown className="size-3" /> : null}
                  </a>
                ))}
              </nav>

              <motion.a
                href={ctaHref}
                whileTap={{ scale: 0.96 }}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 dark:bg-emerald-500 px-5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 dark:hover:bg-emerald-400 shadow-lg"
              >
                {ctaText}
                <FaArrowRight className="size-3" />
              </motion.a>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ─── MAIN HERO CONTENT ────────────────────────────────────────────── */}
        <motion.div
          variants={contentContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.42 }}
          className="mx-auto flex w-full max-w-[820px] flex-1 flex-col items-center justify-center pt-[72px] pb-[60px] text-center sm:pt-[92px] lg:pt-[80px]"
        >
          {/* ─── REAL & LIVE CREATORS PILL BADGE ────────────────────────────── */}
          <motion.div
            variants={contentItem}
            className="group inline-flex min-h-9 items-center gap-3 rounded-full bg-white/80 dark:bg-[#0d1226]/80 px-2 py-1 pr-4 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] border border-slate-200/80 dark:border-white/15 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/40 cursor-default"
          >
            {/* Real Avatar Stack */}
            {avatars && avatars.length > 0 ? (
              <span className="flex -space-x-2 items-center">
                {avatars.map((avatar, idx) => (
                  <img
                    key={idx}
                    src={avatar.src}
                    alt={avatar.alt}
                    className="size-7 rounded-full object-cover ring-2 ring-white dark:ring-[#08090D] shadow-sm transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                ))}
                <span className="grid size-7 -rotate-45 place-items-center rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-sm ring-2 ring-white dark:ring-[#08090D]">
                  <FaArrowRight className="size-2.5" />
                </span>
              </span>
            ) : null}

            {/* Live Indicator + Eyebrow Copy */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="tracking-tight">{eyebrowText}</span>
            </div>
          </motion.div>

          {/* ─── HEADLINE (CLASH DISPLAY) ────────────────────────────────────── */}
          <motion.h1
            variants={contentItem}
            className="mt-6 max-w-[800px] font-display text-[clamp(2.75rem,5.8vw,4.75rem)] leading-[0.98] font-bold tracking-tight text-balance whitespace-pre-line text-slate-950 dark:text-white"
          >
            {title}
          </motion.h1>

          {/* ─── DESCRIPTION (SATOSHI) ───────────────────────────────────────── */}
          <motion.p
            variants={contentItem}
            className="mt-5 max-w-[560px] font-sans text-[clamp(1rem,1.4vw,1.15rem)] leading-[1.6] font-normal text-pretty whitespace-pre-line text-slate-600 dark:text-slate-300"
          >
            {description}
          </motion.p>

          {/* ─── LIVE WORKING EMAIL CTA FORM ─────────────────────────────────── */}
          <motion.form
            variants={contentItem}
            onSubmit={handleSubmit}
            className="mt-8 flex w-full max-w-md flex-col gap-2 rounded-[28px] bg-white/90 dark:bg-white/[0.08] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_12px_45px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] border border-slate-200/80 dark:border-white/15 backdrop-blur-2xl min-[430px]:flex-row min-[430px]:rounded-full transition-all duration-300 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20"
          >
            <label htmlFor="hero9-email" className="sr-only">
              Email Address
            </label>
            <input
              id="hero9-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={emailPlaceholder}
              className="min-h-11 w-full min-w-0 flex-1 bg-transparent px-5 text-center text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 min-[430px]:text-left"
            />
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.96 }}
              className="group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 px-5 text-sm font-bold text-white dark:text-slate-950 shadow-md shadow-emerald-500/20 transition-[background-color,box-shadow,transform] duration-200 ease-out min-[430px]:w-auto cursor-pointer disabled:opacity-75"
            >
              <span>{isSubmitting ? 'Joining...' : submitText}</span>
              <FaArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </motion.button>
          </motion.form>

          {/* Quick Sub-CTA link */}
          <motion.div variants={contentItem} className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>⚡ Zero Follower Minimum</span>
            <span>•</span>
            <span>💰 Automated Naira Payouts</span>
            <span>•</span>
            <a href="/browse" className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold">
              Browse drops <FaArrowRight className="size-2.5" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero9;
