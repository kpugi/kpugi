'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatCompactCurrency } from '@/lib/utils/format';

type Mode = 'creator' | 'brand';
type Platform = 'TikTok' | 'Instagram' | 'X';

/* ─────────────────────────────────────────────────────
   OFFICIAL SOCIAL MEDIA ICONS
───────────────────────────────────────────────────── */
function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12.525.025c-3.308 0-6.327 2.684-6.327 6.002V15.4c0 2.378-1.926 4.305-4.305 4.305S-.412 17.778-.412 15.4s1.926-4.305 4.305-4.305c.162 0 .32.012.474.035v3.136c-.154-.027-.311-.041-.474-.041-1.156 0-2.095.939-2.095 2.095s.939 2.095 2.095 2.095 2.095-.939 2.095-2.095V.025h3.21c.143 2.158 1.83 3.844 3.987 3.987v3.21c-1.396-.134-2.612-.862-3.33-1.95v10.128c0 3.774-3.056 6.83-6.83 6.83S0 19.174 0 15.4s3.056-6.83 6.83-6.83V6.002c-4.498 0-8.59 3.655-8.59 8.153s4.092 8.153 8.59 8.153c4.498 0 8.153-3.655 8.153-8.153V6.368c1.378 1.206 3.197 1.933 5.168 1.933V5.09c-1.968 0-3.766-.806-5.068-2.108-1.302-1.302-2.108-3.1-2.108-5.068H12.525z" 
        transform="translate(4 2) scale(0.8)" 
        fill="#FFFFFF" 
        style={{ filter: 'drop-shadow(1.5px 1.5px 0px #FE2C55) drop-shadow(-1.5px -1.5px 0px #25F4EE)' }}
      />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ig-grad-hp" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#feda75" />
          <stop offset="0.3" stopColor="#fa7e1e" />
          <stop offset="0.6" stopColor="#d62976" />
          <stop offset="0.9" stopColor="#962fbf" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <path 
        fill="url(#ig-grad-hp)" 
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#FFFFFF"/>
    </svg>
  );
}

function PlatformIcon({ platform, className }: { platform: Platform, className?: string }) {
  if (platform === 'TikTok') return <IconTikTok className={className} />;
  if (platform === 'Instagram') return <IconInstagram className={className} />;
  if (platform === 'X') return <IconX className={className} />;
  return null;
}

/* ─────────────────────────────────────────────────────
   SINGLE WORD TYPEWRITER EFFECT
───────────────────────────────────────────────────── */
function TypewriterWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  // Find maximum length word to lock container width
  const maxWord = words.reduce((max, w) => (w.length > max.length ? w : max), words[0] || '');

  useEffect(() => {
    setIndex(0);
    setSubIndex(0);
    setReverse(false);
  }, [words]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  useEffect(() => {
    if (!words || words.length === 0) return;
    if (index >= words.length) setIndex(0);

    const currentWord = words[index] || words[0];

    // Word completed, pause before deleting
    if (subIndex === currentWord.length + 1 && !reverse) {
      const timeout = setTimeout(() => {
        setReverse(true);
      }, 2200);
      return () => clearTimeout(timeout);
    }

    // Word deleted, move to next word
    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    // Normal typing human speed simulation
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 45 : 100);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  const currentWordText = words[index] ? words[index].substring(0, subIndex) : '';

  return (
    <span className="inline-inline-flex items-center justify-center px-3.5 sm:px-4 py-1 mx-1.5 bg-kpugi-blue/10 border border-kpugi-blue/25 rounded-2xl align-baseline text-kpugi-blue shadow-sm font-extrabold transition-all duration-300">
      <span className="inline-grid grid-cols-1 grid-rows-1 align-baseline text-left font-extrabold text-kpugi-blue">
        {/* Invisible phantom word that reserves the exact maximum width */}
        <span className="col-start-1 row-start-1 invisible opacity-0 pointer-events-none select-none font-extrabold px-0.5" aria-hidden="true">
          {maxWord}&nbsp;|
        </span>
        {/* Visible typing word */}
        <span className="col-start-1 row-start-1 whitespace-nowrap font-extrabold text-kpugi-blue px-0.5">
          {currentWordText}
          <span className={`${blink ? 'opacity-100' : 'opacity-0'} transition-opacity font-mono text-kpugi-blue ml-0.5`}>|</span>
        </span>
      </span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────
   MODE TOGGLE (UX Friendly Segmented Switch)
───────────────────────────────────────────────────── */
function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="inline-flex p-1.5 rounded-full bg-[#EBF0FF] border border-kpugi-border shadow-inner mb-8">
      <button
        onClick={() => onChange('creator')}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
          mode === 'creator'
            ? 'bg-kpugi-blue text-white shadow-md scale-105'
            : 'text-kpugi-slate hover:text-kpugi-ink'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#3EBF74]" />
        For Creators
      </button>
      <button
        onClick={() => onChange('brand')}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
          mode === 'brand'
            ? 'bg-kpugi-ink text-white shadow-md scale-105'
            : 'text-kpugi-slate hover:text-kpugi-ink'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-kpugi-blue" />
        For Brands & Agencies
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   FAQ ITEM
───────────────────────────────────────────────────── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-kpugi-border rounded-2xl bg-white overflow-hidden transition-all duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left font-display font-semibold text-kpugi-ink hover:text-kpugi-blue transition-colors"
      >
        <span className="text-base sm:text-lg">{question}</span>
        <span className={`ml-4 w-8 h-8 rounded-full bg-kpugi-paper flex items-center justify-center shrink-0 transition-transform duration-300 ${open ? 'rotate-45 bg-kpugi-blue/10 text-kpugi-blue' : 'text-kpugi-slate'}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 1v12M1 7h12"/></svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 text-kpugi-slate text-sm leading-relaxed border-t border-kpugi-border/50 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   SHARED COOL BROWSE CAMPAIGN CARD
───────────────────────────────────────────────────── */
function PopularCampaignCard({
  brand,
  brandLogo,
  thumbnailUrl,
  title,
  category,
  cpm,
  spent,
  total,
  slots,
  time,
  platforms,
  index,
}: {
  brand: string;
  brandLogo: string | null;
  thumbnailUrl: string | null;
  title: string;
  category: string;
  cpm: number;
  spent: number;
  total: number;
  slots: number;
  time: string;
  platforms: Platform[];
  index: number;
}) {
  const progress = total > 0 ? (spent / total) * 100 : 0;
  const gradients = [
    'from-[#1a103c] to-[#0B1026]',
    'from-[#0f1f1a] to-[#0B1026]',
    'from-[#2a1310] to-[#0B1026]',
    'from-[#0e1b2e] to-[#0B1026]',
  ];
  const bgClass = gradients[index % gradients.length];

  return (
    <article className="group relative flex flex-col bg-[#12141A] rounded-2xl overflow-hidden hover:bg-[#161820] transition-all duration-300 hover:scale-[1.01] border border-white/5 hover:border-white/20 cursor-pointer shadow-xl">
      {/* Thumbnail Area */}
      <div className="h-[160px] w-full relative overflow-hidden bg-slate-900">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${bgClass} relative p-5 flex flex-col justify-between`}>
            <div className="w-full h-full flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity duration-500">
              <div className="w-20 h-20 rounded-full border border-white/20 blur-[2px]" />
              <div className="absolute w-12 h-12 rounded-full border border-white/10 blur-[1px]" />
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        {/* Brand Row with Gold Checkmark & Official SM Icons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {brandLogo ? (
              <img 
                src={brandLogo} 
                alt={brand} 
                className="w-5 h-5 rounded-full object-cover border border-white/10 shadow-sm shrink-0" 
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {brand.charAt(0)}
              </div>
            )}
            <span className="text-[13px] font-semibold text-white/90 truncate max-w-[90px]">{brand}</span>
            {/* Gold Verified Checkmark Badge */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#E4A12C] shrink-0">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-[13px] text-white/40 shrink-0">·</span>
            <span className="text-[13px] text-white/40 shrink-0">{time}</span>
          </div>

          {/* Official Social Media Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {platforms.map((p) => (
              <div key={p} className="w-5 h-5 rounded-full bg-black flex items-center justify-center border border-white/10">
                <PlatformIcon platform={p} className="w-[14px] h-[14px]" />
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-white text-[15px] leading-snug mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Audience / Category */}
        <p className="text-[12px] text-white/40 mb-6 italic">{category}</p>

        {/* Bottom Stats */}
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-semibold flex items-center gap-0.5">
              <span className="text-white">{formatCompactCurrency(spent)}</span>
              <span className="text-white/40">/{formatCompactCurrency(total)}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-[11px] font-bold text-white/90">{slots}</span>
              </div>
              <div className="bg-kpugi-blue px-2 py-1 rounded-md text-[11px] font-bold text-white shadow-sm">
                {formatCompactCurrency(cpm)}/1K
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar at bottom edge */}
      <div className="w-full h-[2px] bg-white/5">
        <div className="h-full bg-white transition-all duration-500 rounded-r-full" style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────
   HERO CARD STACK (INTERACTIVE & MICRO-ANIMATED)
───────────────────────────────────────────────────── */
function HeroCardStack() {
  const [activeCard, setActiveCard] = useState(0);

  // Auto rotate floating cards
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const cards = [
    {
      id: 0,
      brand: 'Chivita Active',
      avatar: 'Chi',
      tag: 'Food & Drink · TikTok & IG',
      cpm: '₦1,800',
      totalPool: '₦2,400,000',
      slots: '31 / 80 slots',
      progress: 38,
      status: 'Active',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      id: 1,
      brand: 'Paystack One Tap',
      avatar: 'PS',
      tag: 'Fintech · X & Instagram',
      cpm: '₦2,600',
      totalPool: '₦3,200,000',
      slots: '18 / 50 slots',
      progress: 36,
      status: 'Trending',
      color: 'bg-kpugi-blue/10 text-kpugi-blue border-kpugi-blue/20',
    },
    {
      id: 2,
      brand: 'Bumpa Store',
      avatar: 'BM',
      tag: 'E-commerce · TikTok & Reels',
      cpm: '₦2,200',
      totalPool: '₦1,800,000',
      slots: '9 / 30 slots',
      progress: 30,
      status: 'Hot',
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
  ];

  return (
    <div className="relative max-w-4xl mx-auto pt-8 pb-12 select-none">
      
      {/* Ambient Pulsing Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[250px] bg-gradient-to-r from-kpugi-blue/20 via-emerald-500/10 to-kpugi-blue/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

      {/* Cards Container */}
      <div className="relative h-[280px] sm:h-[300px] flex justify-center items-center">
        {cards.map((card, idx) => {
          // Calculate relative position based on activeCard
          const isCenter = idx === activeCard;
          const isLeft = idx === (activeCard + 2) % 3;
          const isRight = idx === (activeCard + 1) % 3;

          let transformClasses = '';
          if (isCenter) {
            transformClasses = 'z-20 scale-100 opacity-100 shadow-[0_20px_50px_rgba(47,73,232,0.15)] border-kpugi-blue/20 translate-y-0';
          } else if (isLeft) {
            transformClasses = 'z-10 scale-90 opacity-60 -translate-x-[140px] sm:-translate-x-[200px] -rotate-6 shadow-md hover:opacity-90 cursor-pointer hover:-translate-y-2';
          } else if (isRight) {
            transformClasses = 'z-10 scale-90 opacity-60 translate-x-[140px] sm:translate-x-[200px] rotate-6 shadow-md hover:opacity-90 cursor-pointer hover:-translate-y-2';
          }

          return (
            <div
              key={card.id}
              onClick={() => setActiveCard(idx)}
              className={`absolute top-0 w-full max-w-[340px] sm:max-w-[420px] bg-white p-6 sm:p-8 rounded-3xl border border-kpugi-border transition-all duration-700 ease-out text-left ${transformClasses}`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-kpugi-blue/10 flex items-center justify-center text-kpugi-blue font-bold text-sm shadow-inner">
                    {card.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-display font-bold text-sm sm:text-base text-kpugi-ink">{card.brand}</h4>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#E4A12C]">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <p className="text-xs text-kpugi-slate">{card.tag}</p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${card.color}`}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                  </span>
                  {card.status}
                </span>
              </div>

              {/* Stats Box */}
              <div className="p-4 rounded-2xl bg-[#F6F8FD] border border-kpugi-border flex items-center justify-between mb-4 shadow-inner">
                <div>
                  <span className="block text-[11px] text-kpugi-slate mb-0.5">Rate per 1k Views</span>
                  <span className="font-display font-extrabold text-lg text-kpugi-ink">{card.cpm}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] text-kpugi-slate mb-0.5">Total Campaign Pool</span>
                  <span className="font-display font-extrabold text-lg text-emerald-600">{card.totalPool}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-kpugi-slate">
                  <span>Slots Claimed</span>
                  <span className="font-semibold text-kpugi-ink">{card.slots}</span>
                </div>
                <div className="h-2 bg-kpugi-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-kpugi-blue to-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Card Switcher Dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {cards.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCard(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === activeCard ? 'w-8 bg-kpugi-blue' : 'w-2 bg-kpugi-slate/30 hover:bg-kpugi-slate/60'
            }`}
          />
        ))}
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN HOMEPAGE
───────────────────────────────────────────────────── */
export default function HomePage() {
  const [mode, setMode] = useState<Mode>('creator');
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('/api/campaigns');
        const data = await res.json();
        if (res.ok) {
          setDbCampaigns(data.campaigns || []);
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const mappedCampaigns = useMemo(() => {
    return dbCampaigns.map((c) => {
      const brandName = c.advertiser?.company_name || 'Brand Partner';
      const brandLogo = c.advertiser?.profile?.avatar_url || null;
      const thumbnailUrl = c.creatives?.[0]?.file_url || null;
      const creatorsCount = c.submissions ? c.submissions.length : 0;

      // Map Dynamic Categories
      let category = 'Tech';
      if (brandName === 'PiggyVest') category = 'Audience: Finance';
      else if (brandName === 'Chowdeck') category = 'Audience: Food & Drink';
      else if (brandName === 'Zaron Cosmetics') category = 'Audience: Beauty';
      else if (brandName === 'Kpugi') category = 'Audience: Lifestyle';

      return {
        id: c.id,
        brand: brandName,
        brandLogo: brandLogo,
        thumbnailUrl: thumbnailUrl,
        title: c.title,
        platform: (c.channels || []) as Platform[],
        category: category,
        cpm: Number(c.cpm_rate),
        slotsFilled: creatorsCount,
        budgetTotal: Number(c.total_budget),
        budgetSpent: Number(c.spent_budget || 0),
        minViews: c.min_view_threshold,
        daysLeft: 14,
        tone: c.description.slice(0, 100) + '...',
        timePosted: '1d',
        is_featured: !!c.is_featured,
      };
    });
  }, [dbCampaigns]);

  // Get featured campaigns for displaying on HP
  const featuredCampaigns = useMemo(() => {
    const list = mappedCampaigns.filter((c) => c.is_featured);
    return list.length > 0 ? list.slice(0, 3) : mappedCampaigns.slice(0, 3);
  }, [mappedCampaigns]);

  // Single word typewriter arrays
  const CREATOR_SINGLE_WORDS = [
    'TikTok',
    'Instagram',
    'X / Twitter',
    'Reels',
    'Shorts',
    'Feeds',
    'Stories',
  ];

  const BRAND_SINGLE_WORDS = [
    'Verified',
    'Real',
    'Active',
    'Targeted',
    'Organic',
    'Authentic',
    'Massive',
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-kpugi-ink font-sans selection:bg-kpugi-blue/20 selection:text-kpugi-blue">
      
      {/* ─────────────────────────────────────────────────────
         HERO SECTION
      ───────────────────────────────────────────────────── */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 px-6 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-kpugi-blue/10 via-kpugi-blue/3 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto text-center">
          
          {/* Segmented Mode Switch */}
          <ModeToggle mode={mode} onChange={setMode} />

          {/* Hero Headline with Single Word Typewriter Effect */}
          <h1 className="font-display font-extrabold text-kpugi-ink text-4xl sm:text-6xl lg:text-7xl leading-[1.12] tracking-tight mb-6 max-w-5xl mx-auto">
            {mode === 'creator' ? (
              <>
                Get Paid for Posting on Your <TypewriterWord words={CREATOR_SINGLE_WORDS} />Pages/Profiles
              </>
            ) : (
              <>
                Get Virality & Reach from <TypewriterWord words={BRAND_SINGLE_WORDS} />Audiences
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-kpugi-slate text-base sm:text-lg lg:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            {mode === 'creator'
              ? 'Brands upload ready-made campaign videos — you just post to your TikTok, Instagram, or X audience and get paid per 1,000 verified views.'
              : 'Distribute your commercial brief across thousands of real social accounts. Track verified view metrics in real time and only pay for authentic impressions.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-white rounded-2xl bg-kpugi-blue hover:bg-blue-700 shadow-lg shadow-kpugi-blue/25 transition-all transform hover:-translate-y-0.5"
            >
              {mode === 'creator' ? 'Start Earning Now' : 'Launch a Campaign'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.333 8h9.334M8.667 3.333L13.333 8l-4.666 4.667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/browse"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-kpugi-ink bg-white border border-kpugi-border rounded-2xl hover:bg-kpugi-paper transition-colors shadow-sm"
            >
              {mode === 'creator' ? 'Explore Campaigns' : 'View CPM Pricing'}
            </Link>
          </div>

          {/* STACKED FLOATING CARDS MOCKUP (INTERACTIVE & MICRO-ANIMATED) */}
          <HeroCardStack />

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
         SECTION 1: 3 SIMPLE STEPS
      ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-y border-kpugi-border">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-kpugi-paper text-kpugi-slate text-xs font-bold uppercase tracking-wider mb-4 border border-kpugi-border">
              {mode === 'creator' ? 'HOW IT WORKS FOR CREATORS' : 'HOW IT WORKS FOR BRANDS'}
            </span>
            <h2 className="font-display font-extrabold text-kpugi-ink text-3xl sm:text-5xl tracking-tight mb-4">
              {mode === 'creator' ? 'Get Paid in 3 Simple Steps' : 'Launch Campaigns in 3 Simple Steps'}
            </h2>
            <p className="text-kpugi-slate text-base">
              {mode === 'creator'
                ? 'No pitch decks. No back-and-forth emails. Just pick, post, and collect.'
                : 'Set up your budget, upload your official creative asset, and let verified creators spread the word.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="rounded-3xl bg-white border border-kpugi-border hover:border-kpugi-blue/40 transition-all duration-500 group flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2">
              {/* Graphic Banner with Ambient Radial Glow */}
              <div className="relative h-[240px] bg-gradient-to-br from-[#0B1026] via-[#12141A] to-[#0B1026] p-4 flex items-center justify-center overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-kpugi-blue/30 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <img 
                  src="/images/steps/step1.png" 
                  alt="Pick a Campaign"
                  className="w-full h-full object-cover rounded-2xl shadow-xl transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-700 relative z-10"
                />
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-kpugi-blue/10 text-kpugi-blue text-xs font-bold uppercase tracking-wider mb-4 border border-kpugi-blue/20 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kpugi-blue opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-kpugi-blue" />
                    </span>
                    Step 1
                  </div>
                  <h3 className="font-display font-bold text-2xl text-kpugi-ink mb-3 group-hover:text-kpugi-blue transition-colors">
                    {mode === 'creator' ? 'Pick a Campaign' : 'Set Budget & CPM'}
                  </h3>
                  <p className="text-kpugi-slate text-sm leading-relaxed mb-6">
                    {mode === 'creator'
                      ? 'Browse live campaigns from top brands. Choose campaigns that match your audience niche.'
                      : 'Define your total campaign pool budget and set your payout rate per 1,000 verified views.'}
                  </p>
                </div>

                {/* Step UI Preview Footer */}
                <div className="p-4 rounded-2xl bg-[#F6F8FD] border border-kpugi-border group-hover:border-kpugi-blue/20 transition-colors shadow-inner">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-kpugi-ink">Chivita Active</span>
                    <span className="text-emerald-600 font-bold">₦1.8k / 1k</span>
                  </div>
                  <div className="w-full py-2.5 bg-kpugi-blue text-white rounded-xl text-xs font-bold text-center shadow-md group-hover:shadow-[0_4px_20px_rgba(47,73,232,0.4)] group-hover:bg-blue-600 transition-all duration-300">
                    Claim Campaign Slot
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl bg-white border border-kpugi-border hover:border-kpugi-blue/40 transition-all duration-500 group flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2">
              {/* Graphic Banner with Ambient Radial Glow */}
              <div className="relative h-[240px] bg-gradient-to-br from-[#0B1026] via-[#12141A] to-[#0B1026] p-4 flex items-center justify-center overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <img 
                  src="/images/steps/step2.png" 
                  alt="Post & Submit Link"
                  className="w-full h-full object-cover rounded-2xl shadow-xl transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-700 relative z-10"
                />
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-kpugi-blue/10 text-kpugi-blue text-xs font-bold uppercase tracking-wider mb-4 border border-kpugi-blue/20 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kpugi-blue opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-kpugi-blue" />
                    </span>
                    Step 2
                  </div>
                  <h3 className="font-display font-bold text-2xl text-kpugi-ink mb-3 group-hover:text-kpugi-blue transition-colors">
                    {mode === 'creator' ? 'Post & Submit Link' : 'Upload Creative Brief'}
                  </h3>
                  <p className="text-kpugi-slate text-sm leading-relaxed mb-6">
                    {mode === 'creator'
                      ? 'Share the brand’s video on Facebook, TikTok, Instagram, or X. Submit your post link to lock your slot.'
                      : 'Provide the official video or graphics. Creators download and repost without editing.'}
                  </p>
                </div>

                {/* Link Input Preview Footer */}
                <div className="p-4 rounded-2xl bg-[#F6F8FD] border border-kpugi-border group-hover:border-kpugi-blue/20 transition-colors space-y-2 shadow-inner">
                  <div className="px-3 py-2 rounded-xl bg-white text-kpugi-ink border border-kpugi-border text-xs font-mono truncate shadow-inner flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                      facebook.com/posts/839102...
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                      Verified
                    </span>
                  </div>
                  <div className="w-full py-2.5 bg-kpugi-ink text-white rounded-xl text-xs font-bold text-center shadow-md group-hover:bg-black transition-colors">
                    Submit Post Link
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl bg-white border border-kpugi-border hover:border-emerald-500/40 transition-all duration-500 group flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2">
              {/* Graphic Banner with Ambient Radial Glow */}
              <div className="relative h-[240px] bg-gradient-to-br from-[#0B1026] via-[#12141A] to-[#0B1026] p-4 flex items-center justify-center overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/30 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <img 
                  src="/images/steps/step3.png" 
                  alt="Get Direct Payouts"
                  className="w-full h-full object-cover rounded-2xl shadow-xl transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-700 relative z-10"
                />
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    Step 3
                  </div>
                  <h3 className="font-display font-bold text-2xl text-kpugi-ink mb-3 group-hover:text-emerald-600 transition-colors">
                    {mode === 'creator' ? 'Get Direct Payouts' : 'Automated Verification'}
                  </h3>
                  <p className="text-kpugi-slate text-sm leading-relaxed mb-6">
                    {mode === 'creator'
                      ? 'Our engine automatically audits your view counts. As views pass 1k thresholds, credit alerts hit your wallet.'
                      : 'Our scraper system validates authentic view metrics. You only pay for real performance.'}
                  </p>
                </div>

                {/* Credit Alert Preview Footer */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between shadow-sm group-hover:shadow-[0_4px_20px_rgba(16,185,129,0.2)] group-hover:scale-[1.02] transition-all duration-300">
                  <div>
                    <span className="block text-[10px] text-emerald-700 font-bold uppercase">Credit Alert · Instant Escrow</span>
                    <span className="font-display font-extrabold text-xl text-emerald-800">+ ₦45,000</span>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-md transform group-hover:scale-110 transition-transform">✓</span>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-14 text-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white rounded-2xl bg-kpugi-blue hover:bg-blue-700 shadow-lg shadow-kpugi-blue/20 transition-all transform hover:-translate-y-0.5"
            >
              {mode === 'creator' ? 'Start Earning Today' : 'Launch Your First Campaign'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.333 8h9.334M8.667 3.333L13.333 8l-4.666 4.667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
         SECTION 2: BENTO TRUST SCORE & VERIFICATION (PREMIUM DARK GLASS DESIGN)
      ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 relative">
        {/* Ambient section glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[600px] bg-gradient-to-r from-kpugi-blue/10 via-emerald-500/5 to-kpugi-blue/10 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0B1026] border border-kpugi-blue/30 text-kpugi-blue text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              TRUST & SAFETY INFRASTRUCTURE
            </span>
            <h2 className="font-display font-extrabold text-kpugi-ink text-3xl sm:text-5xl tracking-tight mb-4">
              {mode === 'creator' ? 'Build Your Creator Trust Score' : 'Bank-Grade Anti-Fraud Infrastructure'}
            </h2>
            <p className="text-kpugi-slate text-base sm:text-lg">
              {mode === 'creator'
                ? 'Higher trust scores unlock premium high-CPM brand campaigns and instant automated payouts.'
                : 'Every view is audited through automated scrapers to ensure zero bot traffic or inflated numbers.'}
            </p>
          </div>

          {/* Bento Grid Container - Deep Dark Luxury Palette */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1: Score Gauge Meter (Dark Premium Glassmorphism) */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0D152D] via-[#0B1026] to-[#121B3A] border border-white/15 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
              {/* Corner Glow Overlay */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    VERIFICATION TIER
                  </span>
                  <span className="text-xs text-white/50 font-mono">TOP CREATOR</span>
                </div>
                <h4 className="font-display font-bold text-2xl text-white mb-1">Trust Score: 10 / 10</h4>
                <p className="text-xs text-white/60 mb-6">Complete 3 verified payouts to reach Top Creator tier.</p>
              </div>

              {/* Enhanced Gauge Meter Visual with Neon Dark Theme */}
              <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-[#070A18]/80 border border-white/10 backdrop-blur-md shadow-inner">
                {/* Neon Glow behind arc */}
                <div className="absolute w-24 h-12 bg-emerald-500/20 rounded-t-full blur-lg pointer-events-none" />

                <div className="w-32 h-16 relative flex items-end justify-center">
                  {/* Gauge Arc SVG with gradient stroke */}
                  <svg className="w-32 h-16 overflow-visible" viewBox="0 0 100 50">
                    <defs>
                      <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="50%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                    {/* Background Arc */}
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" strokeLinecap="round" />
                    {/* Active Gradient Arc */}
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gauge-grad)" strokeWidth="10" strokeLinecap="round" strokeDasharray="126" strokeDashoffset="0" />
                  </svg>

                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                    <span className="font-display font-extrabold text-3xl text-white drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                      10
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-400 mt-5 bg-emerald-500/15 px-3.5 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ✓ Verified Creator
                </span>
              </div>
            </div>

            {/* Bento Card 2: Guaranteed Escrow Shield (Rich Luxury Dark Gradient) */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0F1838] via-[#0B1026] to-[#0A0D1F] border border-kpugi-blue/40 text-white flex flex-col justify-between md:col-span-2 shadow-2xl relative overflow-hidden group hover:border-kpugi-blue/70 transition-all duration-300">
              {/* Background Glow */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-kpugi-blue/20 rounded-full blur-3xl pointer-events-none group-hover:bg-kpugi-blue/30 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-kpugi-blue uppercase tracking-wider px-3 py-1 rounded-full bg-kpugi-blue/15 border border-kpugi-blue/30">
                    GUARANTEED ESCROW
                  </span>
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    LIVE AUDIT ACTIVE
                  </span>
                </div>
                <h4 className="font-display font-bold text-3xl sm:text-4xl mb-3 text-white">100% Payout Security</h4>
                <p className="text-white/75 text-base max-w-lg mb-8 leading-relaxed">
                  Brand budgets are ring-fenced upfront in platform escrow before any campaign goes live. Once your views are verified, payment is guaranteed.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-5 border-t border-white/10 text-xs sm:text-sm text-white/80">
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-emerald-400 font-bold">✓</span> No Manual Gatekeepers
                </span>
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-emerald-400 font-bold">✓</span> Automated Scraper Audit
                </span>
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-emerald-400 font-bold">✓</span> Instant Payout Engine
                </span>
              </div>
            </div>

          </div>

          {/* Social Platforms Bar */}
          <div className="mt-16 pt-12 border-t border-kpugi-border flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-kpugi-slate/60 mb-8 font-semibold">
              Supported Platforms
            </span>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              
              {/* TikTok */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-kpugi-border shadow-sm hover:shadow-md hover:border-black/30 transition-all">
                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center border border-white/10 shrink-0">
                  <IconTikTok className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm text-kpugi-ink">TikTok</span>
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-kpugi-border shadow-sm hover:shadow-md hover:border-[#d62976]/30 transition-all">
                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center border border-white/10 shrink-0">
                  <IconInstagram className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm bg-gradient-to-r from-[#fa7e1e] via-[#d62976] to-[#962fbf] bg-clip-text text-transparent">
                  Instagram
                </span>
              </div>

              {/* X (Twitter) */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-kpugi-border shadow-sm hover:shadow-md hover:border-black/30 transition-all">
                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center border border-white/10 shrink-0">
                  <IconX className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm text-kpugi-ink">X (Twitter)</span>
              </div>

              {/* YouTube Shorts */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-kpugi-border shadow-sm hover:shadow-md hover:border-red-500/30 transition-all">
                <div className="w-6 h-6 rounded-full bg-[#FF0000] flex items-center justify-center text-white shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <span className="font-display font-bold text-sm text-kpugi-ink">YouTube</span>
              </div>

              {/* Facebook */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-kpugi-border shadow-sm hover:shadow-md hover:border-[#1877F2]/30 transition-all">
                <div className="w-6 h-6 rounded-full bg-[#1877F2] flex items-center justify-center text-white shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="font-display font-bold text-sm text-[#1877F2]">Facebook</span>
              </div>

              {/* LinkedIn */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-kpugi-border shadow-sm hover:shadow-md hover:border-[#0A66C2]/30 transition-all">
                <div className="w-6 h-6 rounded-full bg-[#0A66C2] flex items-center justify-center text-white shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <span className="font-display font-bold text-sm text-[#0A66C2]">LinkedIn</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
         SECTION 3: DISCOVER POPULAR CAMPAIGNS (Official Shared Cards)
      ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-kpugi-border">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200">
                LIVE CAMPAIGNS
              </span>
              <h2 className="font-display font-extrabold text-kpugi-ink text-3xl sm:text-5xl tracking-tight">
                Discover Popular Campaigns
              </h2>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 text-sm font-bold text-kpugi-blue hover:underline shrink-0"
            >
              Browse All Campaigns
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* SHARED COOL BROWSE-STYLE CAMPAIGN CARDS WITH OFFICIAL SM ICONS & GOLD CHECKMARKS */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12 w-full">
              <span className="loading loading-spinner loading-lg text-kpugi-blue"></span>
            </div>
          ) : featuredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCampaigns.map((c, idx) => (
                <Link key={c.id} href={`/browse/${c.id}`}>
                  <PopularCampaignCard
                    brand={c.brand}
                    brandLogo={c.brandLogo}
                    thumbnailUrl={c.thumbnailUrl}
                    title={c.title}
                    category={c.category}
                    cpm={c.cpm}
                    spent={c.budgetSpent}
                    total={c.budgetTotal}
                    slots={c.slotsFilled}
                    time={c.timePosted}
                    platforms={c.platform}
                    index={idx}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#12141A]/5 rounded-2xl border border-[#12141A]/10 text-slate-500 w-full">
              No live campaigns found.
            </div>
          )}

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
         SECTION 4: SEE HOW CREATORS ARE WINNING
      ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#FAFAFC] border-t border-kpugi-border">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-kpugi-paper text-kpugi-slate text-xs font-bold uppercase tracking-wider mb-4 border border-kpugi-border">
              PROVEN RESULTS
            </span>
            <h2 className="font-display font-extrabold text-kpugi-ink text-3xl sm:text-5xl tracking-tight mb-4">
              See How Creators Are Winning
            </h2>
            <p className="text-kpugi-slate text-base">
              Real creators posting brand videos and earning predictable payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Reel Testimonial 1 */}
            <div className="relative rounded-3xl overflow-hidden bg-kpugi-ink text-white p-8 h-[380px] flex flex-col justify-end group shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
              <div className="relative z-20">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold inline-block mb-3 border border-emerald-500/30">
                  Earned ₦450,000 this month
                </span>
                <p className="font-display font-bold text-lg mb-2 text-white">
                  "I don't need to pitch brands anymore. I just pick campaigns and post."
                </p>
                <p className="text-xs text-white/60">Tunde A. · Tech & Finance Creator</p>
              </div>
            </div>

            {/* Reel Testimonial 2 */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 to-kpugi-ink text-white p-8 h-[380px] flex flex-col justify-end group shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
              <div className="relative z-20">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold inline-block mb-3 border border-emerald-500/30">
                  Earned ₦620,000 in 3 weeks
                </span>
                <p className="font-display font-bold text-lg mb-2 text-white">
                  "The scraper audit verifies views within minutes. Payouts hit my bank smoothly."
                </p>
                <p className="text-xs text-white/60">Blessing O. · Lifestyle & Beauty</p>
              </div>
            </div>

            {/* Reel Testimonial 3 */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-kpugi-ink text-white p-8 h-[380px] flex flex-col justify-end group shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
              <div className="relative z-20">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold inline-block mb-3 border border-emerald-500/30">
                  Earned ₦310,000 first campaign
                </span>
                <p className="font-display font-bold text-lg mb-2 text-white">
                  "Brands provide the videos. I just share with my audience on TikTok."
                </p>
                <p className="text-xs text-white/60">David K. · Gaming & Entertainment</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
         SECTION 5: FAQS
      ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-kpugi-border">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-kpugi-paper text-kpugi-slate text-xs font-bold uppercase tracking-wider mb-4 border border-kpugi-border">
              FAQS
            </span>
            <h2 className="font-display font-extrabold text-kpugi-ink text-3xl sm:text-5xl tracking-tight mb-4">
              Your Questions, Answered
            </h2>
          </div>

          <div className="space-y-4">
            <FaqItem
              question="Do creators need to record original videos?"
              answer="No! On Kpugi, brands provide their official commercial video or graphics. Your job as a creator is to post and amplify the content to your audience on TikTok, Instagram, or X."
            />
            <FaqItem
              question="How do payouts work?"
              answer="Payouts are calculated per 1,000 verified views based on the campaign’s CPM rate. Our automated scraper verifies view counts on your submitted link and releases funds directly."
            />
            <FaqItem
              question="How do brands ensure real views and no bot traffic?"
              answer="Our verification engine runs automated scraper audits inspecting engagement metrics, view velocity, and audience signals to guarantee 100% authentic human reach."
            />
            <FaqItem
              question="Are there minimum follower requirements?"
              answer="No follower minimums are required to get started. Anyone with an active social account on TikTok, Instagram, or X can pick an open campaign slot."
            />
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
         PRE-FOOTER CTA BANNER
      ───────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-kpugi-blue text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight mb-6">
            {mode === 'creator' ? 'Ready to Turn Posts into Payouts?' : 'Ready to Launch Your Campaign?'}
          </h2>
          <p className="text-white/90 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            {mode === 'creator'
              ? 'Join thousands of creators earning per verified view. Account creation takes under 2 minutes.'
              : 'Connect with verified creators and scale your viral reach across social platforms today.'}
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-10 py-4 text-base font-bold text-kpugi-blue bg-white rounded-2xl shadow-xl hover:bg-slate-50 transition-all transform hover:scale-105"
          >
            Get Started Now
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.333 8h9.334M8.667 3.333L13.333 8l-4.666 4.667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

    </div>
  );
}
