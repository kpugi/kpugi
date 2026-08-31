'use client';

import React from 'react';
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
  FaSnapchat,
  FaThreads,
  FaTelegram,
} from 'react-icons/fa6';

// ─── PLATFORMS: 6 LIVE SUPPORTED & 4 SUBTLY COMING SOON ────────────────────
const CREATOR_NETWORKS = [
  {
    title: 'TikTok',
    description: 'Viral creator drops, trends, and content challenges.',
    color: '#00F2FE',
    isComingSoon: false,
    icon: (props: any) => <FaTiktok {...props} className="size-8 sm:size-9 text-[#00F2FE]" />,
  },
  {
    title: 'Instagram',
    description: 'Reels, stories, and high-converting lifestyle posts.',
    color: '#E1306C',
    isComingSoon: false,
    icon: (props: any) => <FaInstagram {...props} className="size-8 sm:size-9 text-[#E1306C]" />,
  },
  {
    title: 'YouTube',
    description: 'YouTube Shorts, review clips, and high-CPM briefs.',
    color: '#FF0000',
    isComingSoon: false,
    icon: (props: any) => <FaYoutube {...props} className="size-8 sm:size-9 text-[#FF0000]" />,
  },
  {
    title: 'X (Twitter)',
    description: 'Viral threads, product launches, and meme commentary.',
    color: '#38BDF8',
    isComingSoon: false,
    icon: (props: any) => <FaXTwitter {...props} className="size-8 sm:size-9 text-slate-900 dark:text-white" />,
  },
  {
    title: 'Facebook',
    description: 'Reels and community distribution across top audiences.',
    color: '#1877F2',
    isComingSoon: false,
    icon: (props: any) => <FaFacebook {...props} className="size-8 sm:size-9 text-[#1877F2]" />,
  },
  {
    title: 'LinkedIn',
    description: 'B2B thought leadership, tech briefs, and professional posts.',
    color: '#0A66C2',
    isComingSoon: false,
    icon: (props: any) => <FaLinkedin {...props} className="size-8 sm:size-9 text-[#0A66C2]" />,
  },
  {
    title: 'Snapchat',
    description: 'Spotlight views and exclusive behind-the-scenes stories.',
    color: '#EAB308',
    isComingSoon: true,
    icon: (props: any) => <FaSnapchat {...props} className="size-8 sm:size-9 text-[#EAB308] opacity-80" />,
  },
  {
    title: 'WhatsApp',
    description: 'Status updates and direct audience community broadcast.',
    color: '#25D366',
    isComingSoon: true,
    icon: (props: any) => <FaWhatsapp {...props} className="size-8 sm:size-9 text-[#25D366] opacity-80" />,
  },
  {
    title: 'Threads',
    description: 'Conversational posts, quick reactions, and viral quotes.',
    color: '#000000',
    isComingSoon: true,
    icon: (props: any) => <FaThreads {...props} className="size-8 sm:size-9 text-slate-700 dark:text-slate-300 opacity-80" />,
  },
  {
    title: 'Telegram',
    description: 'Creator channels and broadcast community distribution.',
    color: '#229ED9',
    isComingSoon: true,
    icon: (props: any) => <FaTelegram {...props} className="size-8 sm:size-9 text-[#229ED9] opacity-80" />,
  },
];

export interface Integrations5Props {
  title?: string;
  description?: string;
  badgeText?: string;
}

export function Integrations5({
  badgeText = 'Supported Networks & Ecosystem',
  title = 'Every Social Network. Endless Drops.',
  description = 'Distribute brand campaign drops across 6 major live social platforms with automatic view counting and direct Friday bank payouts.',
}: Integrations5Props) {
  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-transparent transition-colors duration-300">
      {/* Ambient background glow behind the mosaic */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-500/10 via-sky-500/10 to-indigo-500/10 dark:from-emerald-500/[0.08] dark:via-cyan-500/[0.06] dark:to-violet-500/[0.08] blur-[120px] rounded-full" />

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

        {/* ─── MOSAIC CHECKERED GRID WITH FROSTED GLASS & HATCHING ─────────────── */}
        <div className="rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-slate-200/60 dark:bg-white/10 shadow-xl backdrop-blur-xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-[1px]">
          {Array.from({ length: 18 }).map((_, i) => {
            const isDesktopFilled = (Math.floor(i / 6) + (i % 6)) % 2 === 0;
            const isMobileFilled = (Math.floor(i / 2) + (i % 2)) % 2 === 0;
            const item = CREATOR_NETWORKS[i % CREATOR_NETWORKS.length];
            const Icon = item.icon;

            return (
              <div
                key={i}
                className="group relative bg-white/90 dark:bg-[#070b16]/90 flex h-28 sm:h-32 md:h-36 items-center justify-center transition-all duration-200 hover:bg-white dark:hover:bg-[#0c1224] hover:z-10"
              >
                {/* Active Icon Cell */}
                <div
                  className={`flex flex-col items-center justify-center gap-1.5 transition-transform duration-200 group-hover:scale-105 ${
                    isDesktopFilled ? 'md:flex' : 'md:hidden'
                  } ${isMobileFilled ? 'flex' : 'hidden'}`}
                >
                  <Icon />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.title}
                    </span>
                    {item.isComingSoon && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10 border border-slate-200/60 dark:border-white/10 leading-tight">
                        Soon
                      </span>
                    )}
                  </div>
                </div>

                {/* Striped Checkered Empty Cell */}
                <div
                  className={`size-full bg-slate-100/70 dark:bg-white/[0.02] bg-[repeating-linear-gradient(135deg,rgba(148,163,184,0.15)_0px,rgba(148,163,184,0.15)_1px,transparent_1px,transparent_14px)] dark:bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.04)_0px,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_14px)] ${
                    !isDesktopFilled ? 'md:block' : 'md:hidden'
                  } ${!isMobileFilled ? 'block' : 'hidden'}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Integrations5;
