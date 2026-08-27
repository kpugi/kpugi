'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useUser } from '@clerk/nextjs';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/utils/format';
import { CampaignGridSkeleton, FeaturedHeroSkeleton } from '@/components/ui/Skeletons';

/* ─────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────── */
type Platform = 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook' | 'LinkedIn' | 'X';
type Category = 'Fashion' | 'Food & Drink' | 'Tech' | 'Lifestyle' | 'Finance' | 'Gaming' | 'Beauty' | 'Sports';

export type RankTier = 'trending' | 'hot' | 'popular';

interface Campaign {
  id: string;
  brand: string;
  brandLogo: string | null;
  thumbnailUrl: string | null;
  brief: string;
  platform: Platform[];
  category: Category;
  cpm: number;          
  slotsTotal: number;
  slotsFilled: number;
  budgetTotal: number;  
  budgetSpent: number;  
  minViews: number;     
  daysLeft: number;
  tone: string;         
  timePosted: string;
  is_featured: boolean;
  matchScore?: number;
  rankBadges: RankTier[];
  activityScores?: {
    score24h: number;
    score7d: number;
    score30d: number;
    views24h: number;
    views7d: number;
    totalViews: number;
  };
}

const PLATFORMS: Platform[] = ['TikTok', 'Instagram', 'YouTube', 'Facebook', 'LinkedIn', 'X'];

/* ─────────────────────────────────────────────────────
   PLATFORM ICON HELPER
───────────────────────────────────────────────────── */
function PlatformIcon({ platform, className = "w-4 h-4" }: { platform: string, className?: string }) {
  const p = platform.toLowerCase();
  if (p === 'tiktok') {
    return (
      <svg className={`${className} text-cyan-400`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.22V8.19a6.34 6.34 0 0 0-5.46 6.25 6.34 6.34 0 1 0 11.8-3.41V9.04a8.3 8.3 0 0 0 5.25 1.83V7.42a4.85 4.85 0 0 1-1.48-.73z"/>
      </svg>
    );
  }
  if (p === 'instagram') {
    return (
      <svg className={`${className} text-pink-500`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    );
  }
  if (p === 'youtube') {
    return (
      <svg className={`${className} text-red-500`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  if (p === 'facebook') {
    return (
      <svg className={`${className} text-blue-600`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  if (p === 'linkedin') {
    return (
      <svg className={`${className} text-blue-500`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
      </svg>
    );
  }
  return (
    <svg className={`${className} text-white`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────
   FEATURED HERO SLIDESHOW (Connected dynamically)
───────────────────────────────────────────────────── */
interface FeaturedItem {
  id: string;
  brand: string;
  title: string;
  category: string;
  cpm: number;
  budget: number;
  badge: string;
  imageUrl: string | null;
}

function FeaturedHero({ items }: { items: FeaturedItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const current = items[currentIndex];

  // Dynamic ambient theme-color synchronization for phone status bar / header
  useEffect(() => {
    if (!current) return;
    
    // Pick tailored ambient color based on category/brand
    let ambientColor = '#090A0F';
    const cat = (current.category || '').toLowerCase();
    if (cat.includes('tech') || current.brand === 'Kpugi') ambientColor = '#0B1026';
    else if (cat.includes('finance')) ambientColor = '#081814';
    else if (cat.includes('beauty') || cat.includes('fashion')) ambientColor = '#190C18';
    else if (cat.includes('gaming')) ambientColor = '#100E26';
    else if (cat.includes('food') || cat.includes('drink')) ambientColor = '#1A1208';
    else ambientColor = '#0E1322';

    // Update <meta name="theme-color"> dynamically for iOS Safari / Android Chrome status bar
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', ambientColor);

    return () => {
      // Revert on unmount
      metaThemeColor?.setAttribute('content', '#090A0F');
    };
  }, [current]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Deterministic fallback gradients if no background image is set
  const gradients = [
    'from-[#1a1c2e] via-[#0d1326] to-[#0a0a0f]',
    'from-[#0d2218] via-[#0a1820] to-[#0a0a0f]',
    'from-[#2e1810] via-[#1a0d18] to-[#0a0a0f]',
  ];

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] overflow-hidden group cursor-pointer mb-10 select-none bg-[#090A0F]">
      {/* Dynamic top ambient glow bleeding upwards toward navbar & status bar */}
      <div 
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-44 rounded-full blur-[100px] opacity-50 transition-colors duration-1000 pointer-events-none z-10"
        style={{
          backgroundColor:
            (current?.category || '').toLowerCase().includes('tech') || current?.brand === 'Kpugi'
              ? '#2F49E8'
              : (current?.category || '').toLowerCase().includes('finance')
              ? '#10B981'
              : (current?.category || '').toLowerCase().includes('beauty')
              ? '#EC4899'
              : (current?.category || '').toLowerCase().includes('food')
              ? '#F59E0B'
              : '#6366F1'
        }}
      />

      {/* Background Slides */}
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % gradients.length]}`} />
          )}
          {/* Soft overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f]/80 via-[#090a0f]/20 to-[#090a0f]/30 z-10" />
          <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-700 z-0"></div>
        </div>
      ))}

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end z-20 pointer-events-none">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-12 pb-8 sm:pb-12 pt-16 flex items-end justify-between">
          <div className="pointer-events-auto max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-[#E4A12C] flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white/90 truncate">{current.badge}</span>
            </div>
            
            <h1 className="font-display font-bold text-white text-2xl sm:text-4xl md:text-5xl mb-3 tracking-tight leading-tight line-clamp-2">
              {current.title}
            </h1>
            
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60 font-medium mb-6 flex-wrap">
              <span>{current.category}</span>
              <span>·</span>
              <span className="text-white font-semibold">
                {formatCompactCurrency(current.cpm)}
                <span className="text-white/60 font-normal">/1K views</span>
              </span>
              <span>·</span>
              <span>{formatCompactCurrency(current.budget)} Budget</span>
            </div>
            
            <div>
              <Link href={`/browse/${current.id}`}>
                <button className="bg-white text-black px-6 py-3 sm:px-8 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm hover:bg-white/90 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-white/10">
                  View Campaign
                </button>
              </Link>
            </div>
          </div>

          {/* Navigation Arrows */}
          {items.length > 1 && (
            <div className="hidden sm:flex items-center gap-3 pointer-events-auto">
              <button 
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button 
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          )}
        </div>

        {/* Slide Indicator Dashes */}
        {items.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto z-30">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   CAMPAIGN CARD
───────────────────────────────────────────────────── */
function CampaignCard({ c, index, userRole = 'public' }: { c: Campaign, index: number, userRole?: string }) {
  const progress = c.budgetTotal > 0 ? (c.budgetSpent / c.budgetTotal) * 100 : 0;
  
  // Deterministic gradient fallback if no thumbnail exists
  const gradients = [
    'from-[#1a103c] to-[#0B1026]',
    'from-[#0f1f1a] to-[#0B1026]',
    'from-[#2a1310] to-[#0B1026]',
    'from-[#0e1b2e] to-[#0B1026]',
  ];
  const bgClass = gradients[index % gradients.length];

  return (
    <article className="group relative flex flex-col bg-white dark:bg-[#12141A] rounded-2xl overflow-hidden hover:bg-slate-50 dark:hover:bg-[#161820] transition-all duration-300 hover:scale-[1.01] border border-kpugi-border dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 cursor-pointer shadow-xs">
      {/* Thumbnail Area */}
      <div className="h-[180px] w-full relative overflow-hidden bg-slate-900">
        {/* Ranking Badges Overlay or Completed Badge */}
        {c.status === 'completed' ? (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-slate-300 border border-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
              🏁 Completed
            </span>
          </div>
        ) : (
          c.rankBadges && c.rankBadges.length > 0 && (
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
              {c.rankBadges.map((tier) => {
                if (tier === 'trending') {
                  return (
                    <div
                      key="trending"
                      className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow-md border backdrop-blur-md bg-emerald-950/85 border-emerald-500/50 text-emerald-300 shadow-emerald-500/20 cursor-help"
                      title="📈 Trending: High velocity in the past 24 hours"
                    >
                      <span>📈</span>
                    </div>
                  );
                }
                if (tier === 'hot') {
                  return (
                    <div
                      key="hot"
                      className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow-md border backdrop-blur-md bg-amber-950/85 border-amber-500/50 text-amber-300 shadow-amber-500/20 cursor-help"
                      title="🔥 Hot: High activity in the last 7 days"
                    >
                      <span>🔥</span>
                    </div>
                  );
                }
                if (tier === 'popular') {
                  return (
                    <div
                      key="popular"
                      className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow-md border backdrop-blur-md bg-purple-950/85 border-purple-500/50 text-purple-300 shadow-purple-500/20 cursor-help"
                      title="👑 Popular: High verified reach in the last 30 days"
                    >
                      <span>👑</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )
        )}

        {/* AI Match Score Badge Overlay (Only for creators & guests, hidden for advertisers) */}
        {userRole !== 'advertiser' && (
          <div className="absolute top-3 right-3 z-20">
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-md border backdrop-blur-md ${
              (c.matchScore || 88) >= 85
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-emerald-500/20'
                : (c.matchScore || 88) >= 65
                ? 'bg-blue-950/80 border-blue-500/50 text-blue-300'
                : 'bg-slate-900/80 border-white/20 text-slate-300'
            }`}>
              <span>{c.matchScore || 88}%</span>
            </div>
          </div>
        )}

        {c.thumbnailUrl ? (
          <img 
            src={c.thumbnailUrl} 
            alt={c.brief} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${bgClass} relative p-5 flex flex-col justify-between`}>
             <div className="w-full h-full flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                 <div className="w-24 h-24 rounded-full border border-white/20 blur-[2px]"></div>
                 <div className="absolute w-16 h-16 rounded-full border border-white/10 blur-[1px]"></div>
             </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Brand & Platform Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {c.brandLogo ? (
              <img 
                src={c.brandLogo} 
                alt={c.brand} 
                className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-kpugi-ink dark:text-white shrink-0">
                {c.brand.charAt(0)}
              </div>
            )}
            <span className="text-[13px] font-semibold text-kpugi-ink dark:text-white/90 truncate max-w-[90px]">{c.brand}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#E4A12C] shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span className="text-[13px] text-kpugi-slate dark:text-white/40 shrink-0">·</span>
            <span className="text-[13px] text-kpugi-slate dark:text-white/40 shrink-0">{c.timePosted}</span>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            {c.platform.map(p => (
              <div key={p} className="w-5 h-5 rounded-full bg-slate-100 dark:bg-black flex items-center justify-center border border-slate-200 dark:border-white/10 text-kpugi-ink dark:text-white">
                <PlatformIcon platform={p} className="w-[11px] h-[11px]" />
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-kpugi-ink dark:text-white text-[15px] leading-snug mb-2 line-clamp-2">
          {c.brief}
        </h3>
        
        {/* Tone/Audience */}
        <p className="text-[12px] text-kpugi-slate dark:text-white/40 mb-6 italic line-clamp-2">
          {c.tone}
        </p>

        {/* Bottom Stats & Pool Budget Progress Slider */}
        <div className="mt-auto flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-semibold flex items-center gap-1">
              <span className="text-kpugi-ink dark:text-white font-mono">{formatCompactCurrency(c.budgetSpent)}</span>
              <span className="text-kpugi-slate dark:text-white/40 font-mono">/{formatCompactCurrency(c.budgetTotal)}</span>
              <span className="text-[10px] font-bold text-kpugi-blue dark:text-blue-400 ml-0.5 font-mono">
                {Math.round(progress)}%
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md" title="Creators Joined">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-kpugi-slate dark:text-white/60"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span className="text-[11px] font-bold text-kpugi-ink dark:text-white/90">{c.slotsFilled}</span>
              </div>
              <div className="bg-[#2F49E8] px-2 py-1 rounded-md text-[11px] font-bold text-white shadow-sm">
                {formatCompactCurrency(c.cpm)}/1K
              </div>
            </div>
          </div>

          {/* Dedicated Pool Budget Progress Slider Bar */}
          <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden relative" title={`Budget Pool: ${Math.round(progress)}% spent`}>
            <div 
              className="h-full bg-gradient-to-r from-[#2F49E8] via-indigo-500 to-emerald-400 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} 
            />
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────
   SPONSORED AD CARD (Blends seamlessly with Campaign Cards)
───────────────────────────────────────────────────── */
function SponsoredAdCard({ index }: { index: number }) {
  return (
    <Link href="/onboarding/advertiser" className="group">
      <article className="relative flex flex-col bg-gradient-to-b from-[#161B2E] to-[#12141A] rounded-2xl overflow-hidden hover:bg-[#1A2038] transition-all duration-300 hover:scale-[1.01] border border-blue-500/30 hover:border-blue-500/60 shadow-lg shadow-blue-500/5 cursor-pointer h-full">
        {/* Thumbnail Area */}
        <div className="h-[180px] w-full relative overflow-hidden bg-slate-900">
          {/* Sponsored Badge Overlay */}
          <div className="absolute top-3 right-3 z-20">
            <div className="px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-md border backdrop-blur-md bg-amber-500/20 border-amber-400/40 text-amber-300">
              <span>⚡</span>
              <span>Sponsored</span>
            </div>
          </div>

          <img 
            src="/images/kpugi_promo_banner.png" 
            alt="Launch Brand Campaign on Kpugi" 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141A] via-[#12141A]/30 to-transparent" />
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col flex-1">
          {/* Brand & Platform Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-kpugi-blue flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                K
              </div>
              <span className="text-[13px] font-semibold text-white/90 truncate">Kpugi Official</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#E4A12C] shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span className="text-[13px] text-white/40 shrink-0">·</span>
              <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">Promoted</span>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              {['TikTok', 'Instagram', 'X'].map(p => (
                <div key={p} className="w-5 h-5 rounded-full bg-black flex items-center justify-center border border-white/10">
                  <PlatformIcon platform={p} className="w-[11px] h-[11px]" />
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-white text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
            Scale Your Brand Reach
          </h3>
          
          {/* Tone/Audience */}
          <p className="text-[12px] text-white/50 mb-6 italic line-clamp-2">
            Reach 100k+ viral video views in 48 hours
          </p>

          {/* Bottom Stats */}
          <div className="mt-auto flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-semibold flex items-center gap-1 text-emerald-400">
              
              </div>
              
              <div className="flex items-center gap-2">
           
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1 rounded-md text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                  <span>Launch Now</span>
                  <span>➔</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar at bottom edge */}
        <div className="w-full h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400" />
      </article>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────
   SPONSORED AD ROW (For List View / Table Mode)
───────────────────────────────────────────────────── */
function SponsoredAdRow() {
  return (
    <tr className="bg-gradient-to-r from-blue-950/30 via-[#13151A] to-[#13151A] hover:bg-blue-950/50 transition-colors border-b border-blue-500/20 group">
      {/* Campaign & Brand */}
      <td className="py-4 px-5">
        <Link href="/onboarding/advertiser" className="flex items-center gap-3 min-w-[220px]">
          <div className="w-10 h-10 rounded-xl bg-kpugi-blue flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md">
            K
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors truncate block">
                Scale Your Brand on Kpugi
              </span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Ad
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block truncate">
              Kpugi Verified Escrow Platform
            </span>
          </div>
        </Link>
      </td>

      {/* Platforms */}
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          {['TikTok', 'Instagram', 'X'].map(p => (
            <div key={p} className="w-5 h-5 rounded-full bg-black flex items-center justify-center border border-white/10">
              <PlatformIcon platform={p} className="w-3 h-3" />
            </div>
          ))}
        </div>
      </td>

      {/* CPM Rate */}
      <td className="py-4 px-4 whitespace-nowrap font-mono text-emerald-400 font-bold text-xs">
        100% Escrow
      </td>

      {/* Min Threshold */}
      <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-300 text-xs">
        Instant Setup
      </td>

      {/* Budget / Slots */}
      <td className="py-4 px-4 whitespace-nowrap text-xs text-white/70">
        Unlimited Reach
      </td>

      {/* Action */}
      <td className="py-4 px-5 text-right whitespace-nowrap">
        <Link
          href="/onboarding/advertiser"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-kpugi-blue hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
        >
          <span>Launch Campaign</span>
          <span>➔</span>
        </Link>
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────
   CLIENT VIEW COMPONENT
───────────────────────────────────────────────────── */
export default function BrowseCampaignsClientView() {
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedRank, setSelectedRank] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedContent, setSelectedContent] = useState<string>('All');
  const [minCpm, setMinCpm] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [sortColumn, setSortColumn] = useState<string>('featured');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection(column === 'title' || column === 'category' ? 'asc' : 'desc');
    }
  };

  // Restore saved view mode preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kpugi_browse_view_mode');
      if (saved === 'grid' || saved === 'list') {
        setViewMode(saved);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('kpugi_browse_view_mode', mode);
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  // Keyboard shortcut: ⌘K or Ctrl+K to focus search input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { user } = useUser();
  const [currentUserRole, setCurrentUserRole] = useState<string>('public');

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const queryUrl = user?.id ? `/api/campaigns?creatorClerkId=${user.id}` : '/api/campaigns';
        const res = await fetch(queryUrl);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch campaigns');
        setDbCampaigns(data.campaigns || []);
        if (data.userRole) {
          setCurrentUserRole(data.userRole);
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCampaigns();
  }, [user?.id]);

  const mappedCampaigns = useMemo(() => {
    return dbCampaigns.map((c) => {
      const brandName = c.advertiser?.company_name || 'Brand Partner';
      const brandLogo = c.advertiser?.profile?.avatar_url || null;
      const thumbnailUrl = c.cover_image_url || c.creatives?.[0]?.file_url || null;
      const creatorsCount = c.submissions ? c.submissions.length : 0;

      // Extract or map dynamic category
      let category: Category = 'Tech';
      const reqCat = c.requirements?.category || '';
      if (reqCat) {
        if (reqCat.toLowerCase().includes('finance')) category = 'Finance';
        else if (reqCat.toLowerCase().includes('food')) category = 'Food & Drink';
        else if (reqCat.toLowerCase().includes('beauty')) category = 'Beauty';
        else if (reqCat.toLowerCase().includes('fashion')) category = 'Fashion';
        else if (reqCat.toLowerCase().includes('gaming')) category = 'Gaming';
        else if (reqCat.toLowerCase().includes('lifestyle')) category = 'Lifestyle';
        else if (reqCat.toLowerCase().includes('sport')) category = 'Sports';
      } else {
        if (brandName === 'PiggyVest' || brandName.toLowerCase().includes('bank') || brandName.toLowerCase().includes('pay')) category = 'Finance';
        else if (brandName === 'Chowdeck' || brandName.toLowerCase().includes('food') || brandName.toLowerCase().includes('drink')) category = 'Food & Drink';
        else if (brandName === 'Zaron Cosmetics' || brandName.toLowerCase().includes('beauty')) category = 'Beauty';
        else if (brandName === 'Kpugi' || brandName.toLowerCase().includes('style')) category = 'Lifestyle';
      }

      // Extract content format
      const adFormat = (c.ad_format || c.requirements?.ad_format || 'video').toLowerCase();

      return {
        id: c.id,
        brand: brandName,
        brandLogo: brandLogo,
        thumbnailUrl: thumbnailUrl,
        brief: c.title,
        description: c.description || '',
        platform: (c.channels || []) as Platform[],
        category: category,
        adFormat: adFormat,
        cpm: Number(c.cpm_rate || 2000),
        slotsTotal: 100,
        slotsFilled: creatorsCount,
        budgetTotal: Number(c.total_budget || 0),
        budgetSpent: Number(c.spent_budget || 0),
        minViews: c.min_view_threshold || 1000,
        daysLeft: 14,
        tone: (c.description || '').slice(0, 100) + '...',
        createdAt: c.created_at,
        timePosted: (() => {
          const diff = Math.floor((Date.now() - new Date(c.created_at).getTime()) / 1000);
          if (diff < 60) return `${diff}s`;
          if (diff < 3600) return `${Math.floor(diff / 60)}m`;
          if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
          return `${Math.floor(diff / 86400)}d`;
        })(),
        is_featured: !!c.is_featured,
        matchScore: c.match_score || 94,
        status: c.status || 'live',
        rankBadges: (c.rank_badges || []) as RankTier[],
        activityScores: c.activity_scores || {
          score24h: 0,
          score7d: 0,
          score30d: 0,
          views24h: 0,
          views7d: 0,
          totalViews: 0,
        },
      };
    });
  }, [dbCampaigns]);

  const featuredItems = useMemo(() => {
    const list = mappedCampaigns.filter((c) => c.is_featured);
    const targets = list.length > 0 ? list : mappedCampaigns.slice(0, 3);

    return targets.map((c) => ({
      id: c.id,
      brand: c.brand,
      title: c.brief,
      category: c.category,
      cpm: c.cpm,
      budget: c.budgetTotal,
      badge: c.brand === 'Kpugi' ? 'Kpugi Official' : c.brand,
      imageUrl: c.thumbnailUrl,
    }));
  }, [mappedCampaigns]);

  // Comprehensive Filter & Search Pipeline
  const filtered = useMemo(() => {
    let list = [...mappedCampaigns];

    // 1. Ranking Filter Tabs (Trending, Hot, Popular)
    if (selectedRank !== 'All') {
      list = list.filter((c) => c.rankBadges && c.rankBadges.includes(selectedRank as RankTier));
    }

    // 2. Platform Filter
    if (activePlatform) {
      list = list.filter((c) => c.platform.some(p => p.toLowerCase() === activePlatform.toLowerCase()));
    }

    // 3. Search Query (Ajax-style local search & prepared for Google Custom Search Engine)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => 
        c.brief.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.platform.some(p => p.toLowerCase().includes(q))
      );
    }

    // 4. Status Filter Dropdown
    if (selectedStatus !== 'All') {
      if (selectedStatus === 'Open') {
        list = list.filter((c) => c.status !== 'completed' && c.budgetSpent < c.budgetTotal);
      } else if (selectedStatus === 'Filling Fast') {
        list = list.filter((c) => c.status !== 'completed' && ((c.budgetSpent / (c.budgetTotal || 1)) >= 0.5 || c.slotsFilled >= 10));
      } else if (selectedStatus === 'High CPM') {
        list = list.filter((c) => c.cpm >= 3500);
      } else if (selectedStatus === 'Completed') {
        list = list.filter((c) => c.status === 'completed');
      }
    }

    // 5. Category Filter Dropdown
    if (selectedCategory !== 'All') {
      list = list.filter((c) => c.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 6. Content Format Filter Dropdown
    if (selectedContent !== 'All') {
      const target = selectedContent.toLowerCase();
      if (target === 'video') {
        list = list.filter((c) => c.adFormat.includes('video') || c.adFormat.includes('reel') || c.adFormat.includes('ugc'));
      } else if (target === 'image') {
        list = list.filter((c) => c.adFormat.includes('image') || c.adFormat.includes('post') || c.adFormat.includes('graphic'));
      } else if (target === 'story') {
        list = list.filter((c) => c.adFormat.includes('story') || c.adFormat.includes('carousel'));
      } else if (target === 'text') {
        list = list.filter((c) => c.adFormat.includes('text') || c.adFormat.includes('tweet') || c.adFormat.includes('x'));
      }
    }

    // 7. Minimum CPM Filter
    if (minCpm > 0) {
      list = list.filter((c) => c.cpm >= minCpm);
    }

    // 8. Sorting Pipeline (Syncs with both dropdown and table column headers)
    if (sortBy === 'trending') {
      list.sort((a, b) => (b.activityScores?.score24h || 0) - (a.activityScores?.score24h || 0));
    } else if (sortBy === 'hot') {
      list.sort((a, b) => (b.activityScores?.score7d || 0) - (a.activityScores?.score7d || 0));
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.activityScores?.score30d || 0) - (a.activityScores?.score30d || 0));
    } else if (sortColumn === 'cpm' || sortBy === 'cpm_high' || sortBy === 'cpm_low') {
      const dir = sortColumn === 'cpm' ? sortDirection : sortBy === 'cpm_low' ? 'asc' : 'desc';
      list.sort((a, b) => dir === 'asc' ? a.cpm - b.cpm : b.cpm - a.cpm);
    } else if (sortColumn === 'minViews') {
      list.sort((a, b) => sortDirection === 'asc' ? a.minViews - b.minViews : b.minViews - a.minViews);
    } else if (sortColumn === 'budget') {
      list.sort((a, b) => sortDirection === 'asc' ? a.budgetTotal - b.budgetTotal : b.budgetTotal - a.budgetTotal);
    } else if (sortColumn === 'title') {
      list.sort((a, b) => sortDirection === 'asc' ? a.brief.localeCompare(b.brief) : b.brief.localeCompare(a.brief));
    } else if (sortColumn === 'category') {
      list.sort((a, b) => sortDirection === 'asc' ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category));
    } else if (sortColumn === 'newest' || sortBy === 'newest') {
      const dir = sortColumn === 'newest' ? sortDirection : 'desc';
      list.sort((a, b) => dir === 'asc' ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'match') {
      list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else {
      // Default: Featured first
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return list;
  }, [mappedCampaigns, selectedRank, activePlatform, searchQuery, selectedStatus, selectedCategory, selectedContent, minCpm, sortBy, sortColumn, sortDirection]);

  // Active filters count for badge
  const activeFiltersCount = (activePlatform ? 1 : 0) +
    (selectedRank !== 'All' ? 1 : 0) +
    (selectedStatus !== 'All' ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedContent !== 'All' ? 1 : 0) +
    (minCpm > 0 ? 1 : 0) +
    (sortBy !== 'featured' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetAllFilters = () => {
    setActivePlatform(null);
    setSelectedRank('All');
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedCategory('All');
    setSelectedContent('All');
    setMinCpm(0);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-kpugi-paper dark:bg-[#090A0F] text-kpugi-ink dark:text-white font-sans pb-16">
      {/* Load Google Programmable Search Engine Script */}
      <Script 
        src="https://cse.google.com/cse.js?cx=b1dd03166a4a6402e" 
        strategy="afterInteractive" 
      />

      {/* Global CSS Overrides for Google Custom Search Dark Theme */}
      <style jsx global>{`
        .gsc-control-cse {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
          font-family: inherit !important;
        }
        .gsc-search-box {
          margin-bottom: 12px !important;
        }
        .gsc-input-box {
          background: #13151A !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 9999px !important;
        }
        .gsc-input {
          background: transparent !important;
          color: #ffffff !important;
        }
        .gsc-search-button-v2 {
          background-color: #2F49E8 !important;
          border-color: #2F49E8 !important;
          border-radius: 9999px !important;
          padding: 8px 16px !important;
        }
        .gsc-results-wrapper-overlay {
          background-color: rgba(9, 10, 15, 0.95) !important;
          backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 24px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7) !important;
        }
        .gsc-resultsbox-invisible {
          display: none !important;
        }
        .gsc-webResult.gsc-result {
          background-color: #13151A !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 16px !important;
          margin-bottom: 12px !important;
          padding: 16px !important;
        }
        .gs-title, .gs-title * {
          color: #60a5fa !important;
          text-decoration: none !important;
        }
        .gs-snippet {
          color: #94a3b8 !important;
        }
        .gsc-url-top, .gsc-url-bottom {
          color: #34d399 !important;
        }
        .gsc-modal-background-image {
          background-color: rgba(0, 0, 0, 0.7) !important;
          backdrop-filter: blur(8px) !important;
        }
      `}</style>
      
      {/* Full width hero - dynamically powered */}
      {isLoading || featuredItems.length === 0 ? (
        <FeaturedHeroSkeleton />
      ) : (
        <FeaturedHero items={featuredItems} />
      )}

      <div className="max-w-7xl mx-auto px-6">

        {/* Toolbar (Responsive Mobile & Desktop Layout) */}
        <div className="flex flex-col gap-3 mb-8">
          {/* Quick Ranking Segment Tabs (Trending 📈, Hot 🔥, Popular 👑) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedRank('All')}
              className={`h-8 sm:h-9 px-3.5 sm:px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                selectedRank === 'All'
                  ? 'bg-kpugi-ink text-white dark:bg-white dark:text-black shadow-sm'
                  : 'bg-white dark:bg-[#13151A] border border-kpugi-border dark:border-white/10 text-kpugi-slate dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <span>All Campaigns</span>
            </button>
            <button
              onClick={() => setSelectedRank(selectedRank === 'trending' ? 'All' : 'trending')}
              className={`h-8 sm:h-9 px-3.5 sm:px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                selectedRank === 'trending'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 border border-emerald-500'
                  : 'bg-white dark:bg-[#13151A] border border-kpugi-border dark:border-white/10 text-kpugi-slate dark:text-white/70 hover:border-emerald-500/40 hover:text-emerald-500 dark:hover:text-emerald-400'
              }`}
            >
              <span>📈</span>
              <span>Trending (24h)</span>
            </button>
            <button
              onClick={() => setSelectedRank(selectedRank === 'hot' ? 'All' : 'hot')}
              className={`h-8 sm:h-9 px-3.5 sm:px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                selectedRank === 'hot'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/25 border border-amber-500'
                  : 'bg-white dark:bg-[#13151A] border border-kpugi-border dark:border-white/10 text-kpugi-slate dark:text-white/70 hover:border-amber-500/40 hover:text-amber-500 dark:hover:text-amber-400'
              }`}
            >
              <span>🔥</span>
              <span>Hot (7d)</span>
            </button>
            <button
              onClick={() => setSelectedRank(selectedRank === 'popular' ? 'All' : 'popular')}
              className={`h-8 sm:h-9 px-3.5 sm:px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                selectedRank === 'popular'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 border border-purple-500'
                  : 'bg-white dark:bg-[#13151A] border border-kpugi-border dark:border-white/10 text-kpugi-slate dark:text-white/70 hover:border-purple-500/40 hover:text-purple-500 dark:hover:text-purple-400'
              }`}
            >
              <span>👑</span>
              <span>Popular (30d)</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full">
            
            {/* Top / Left Group: Search Bar + Filter Toggle Button */}
            <div className="flex items-center gap-2.5 w-full md:w-auto flex-1 min-w-0">
              <div className="relative flex-1 md:max-w-[320px]">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-kpugi-slate dark:text-white/40" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  ref={searchInputRef}
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns, brands..." 
                  className="w-full bg-white dark:bg-[#13151A] border border-kpugi-border dark:border-white/10 rounded-full pl-9 pr-10 py-2.5 text-xs sm:text-sm text-kpugi-ink dark:text-white placeholder-kpugi-slate dark:placeholder-white/40 focus:outline-none focus:border-kpugi-blue focus:ring-1 focus:ring-kpugi-blue transition-all shadow-xs" 
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-kpugi-slate dark:text-white/40 hover:text-kpugi-ink dark:hover:text-white text-xs font-bold bg-slate-100 dark:bg-white/10 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                ) : (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-kpugi-slate dark:text-white/30 font-mono border border-slate-200 dark:border-white/10 rounded px-1.5 py-0.5">⌘K</span>
                )}
              </div>

              {/* Filter Drawer Toggle Button */}
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                title="Toggle Advanced Filters"
                className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full border flex items-center justify-center transition-all relative ${
                  showAdvancedFilters || activeFiltersCount > 0 
                    ? 'bg-kpugi-blue border-kpugi-blue text-white shadow-md shadow-blue-500/20' 
                    : 'bg-white dark:bg-[#13151A] border-kpugi-border dark:border-white/10 text-kpugi-slate dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-kpugi-ink dark:hover:text-white'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Platform Filter Pills & Dropdowns */}
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-0.5 w-full md:w-auto shrink-0">
              {/* Platform Pills */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button 
                  onClick={() => setActivePlatform(null)}
                  className={`h-9 px-3.5 shrink-0 rounded-full flex items-center justify-center transition-colors text-xs font-semibold
                    ${!activePlatform ? 'bg-kpugi-ink text-white dark:bg-white dark:text-black font-bold' : 'bg-white dark:bg-[#13151A] border border-kpugi-border dark:border-white/10 text-kpugi-slate dark:text-white/70 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'}
                  `}
                >
                  All
                </button>
                {PLATFORMS.map(p => (
                  <button 
                    key={p} 
                    onClick={() => setActivePlatform(activePlatform === p ? null : p)}
                    className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors
                    ${activePlatform === p ? 'bg-kpugi-ink text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-[#13151A] border border-kpugi-border dark:border-white/10 text-kpugi-slate dark:text-white/70 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'}
                  `}
                >
                  <PlatformIcon platform={p} className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Separator on desktop */}
            <div className="w-[1px] h-6 bg-kpugi-border dark:bg-white/10 shrink-0 mx-1 hidden md:block" />

            {/* Dropdowns (Status, Category, Content) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Status Filter */}
              <div className="relative shrink-0">
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-white dark:bg-[#13151A] border border-kpugi-border dark:border-white/10 rounded-full pl-3.5 pr-8 py-2 text-xs text-kpugi-ink dark:text-white appearance-none hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer outline-none font-medium focus:border-kpugi-blue shadow-xs"
                >
                  <option value="All" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">Status: All</option>
                  <option value="Open" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">🟢 Open & Active</option>
                  <option value="Filling Fast" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">🔥 Filling Fast</option>
                  <option value="High CPM" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">💰 High CPM (₦3.5k+)</option>
                  <option value="Completed" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">🏁 Completed Drops</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-kpugi-slate dark:text-white/40 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>

              {/* Category Filter */}
              <div className="relative shrink-0">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white dark:bg-[#13151A] border border-kpugi-border dark:border-white/10 rounded-full pl-3.5 pr-8 py-2 text-xs text-kpugi-ink dark:text-white appearance-none hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer outline-none font-medium focus:border-kpugi-blue shadow-xs"
                >
                  <option value="All" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">Category: All</option>
                  <option value="Tech" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">💻 Tech & SaaS</option>
                  <option value="Finance" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">💳 Finance & Fintech</option>
                  <option value="Food & Drink" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">🍔 Food & Drink</option>
                  <option value="Fashion" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">👗 Fashion & Apparel</option>
                  <option value="Beauty" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">💄 Beauty & Wellness</option>
                  <option value="Lifestyle" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">✨ Lifestyle</option>
                  <option value="Gaming" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">🎮 Gaming</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-kpugi-slate dark:text-white/40 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>

              {/* Content Format Filter */}
              <div className="relative shrink-0">
                <select 
                  value={selectedContent}
                  onChange={(e) => setSelectedContent(e.target.value)}
                  className="bg-white dark:bg-[#13151A] border border-kpugi-border dark:border-white/10 rounded-full pl-3.5 pr-8 py-2 text-xs text-kpugi-ink dark:text-white appearance-none hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer outline-none font-medium focus:border-kpugi-blue shadow-xs"
                >
                  <option value="All" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">Content: All</option>
                  <option value="video" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">🎬 Short-form Video</option>
                  <option value="image" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">📸 Static Post</option>
                  <option value="story" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">📱 Story / Carousel</option>
                  <option value="text" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">✍️ Text / Tweet</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-kpugi-slate dark:text-white/40 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>

        </div>

        {/* Expandable Advanced Filter Drawer */}
        {showAdvancedFilters && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#13151A] border border-kpugi-border dark:border-white/10 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            
            {/* Sort By Option */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-kpugi-slate dark:text-white/60 block mb-2">
                Sort Campaigns By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#1A1D24] border border-kpugi-border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-kpugi-ink dark:text-white focus:outline-none focus:border-kpugi-blue"
              >
                <option value="featured" className="bg-white dark:bg-[#1A1D24] text-kpugi-ink dark:text-white">✨ Featured & AI Recommended</option>
                <option value="trending" className="bg-white dark:bg-[#1A1D24] text-kpugi-ink dark:text-white">📈 Trending (Past 24h Activity)</option>
                <option value="hot" className="bg-white dark:bg-[#1A1D24] text-kpugi-ink dark:text-white">🔥 Hot (Last 7d Velocity)</option>
                <option value="popular" className="bg-white dark:bg-[#1A1D24] text-kpugi-ink dark:text-white">👑 Popular (Last 30d Reach)</option>
                <option value="cpm_high" className="bg-white dark:bg-[#1A1D24] text-kpugi-ink dark:text-white">💰 Highest Rate (CPM)</option>
                <option value="cpm_low" className="bg-white dark:bg-[#1A1D24] text-kpugi-ink dark:text-white">📉 Lowest Rate (CPM)</option>
                <option value="newest" className="bg-white dark:bg-[#1A1D24] text-kpugi-ink dark:text-white">🕒 Recently Published</option>
                <option value="match" className="bg-white dark:bg-[#1A1D24] text-kpugi-ink dark:text-white">🎯 Highest Audience Match</option>
              </select>
            </div>

            {/* Min CPM Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-kpugi-slate dark:text-white/60">
                  Minimum CPM Rate
                </label>
                <span className="font-mono text-xs font-bold text-kpugi-blue dark:text-blue-400">
                  {minCpm === 0 ? 'Any' : `₦${minCpm.toLocaleString()}+`}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {[0, 2000, 3000, 5000].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setMinCpm(rate)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      minCpm === rate
                        ? 'bg-kpugi-blue text-white'
                        : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-kpugi-ink dark:text-white/70'
                    }`}
                  >
                    {rate === 0 ? 'All' : `₦${rate / 1000}k+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Action */}
            <div className="flex flex-col justify-end">
              <button
                onClick={resetAllFilters}
                className="w-full py-2.5 rounded-xl border border-kpugi-border dark:border-white/10 hover:border-red-500/40 text-kpugi-slate dark:text-white/70 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                <span>Reset All Filters</span>
              </button>
            </div>

          </div>
        )}

        {/* Active Filter Badges */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="text-xs text-kpugi-slate dark:text-white/40">Active Filters:</span>
            {selectedRank !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-white/10 text-kpugi-ink dark:text-white border border-kpugi-border dark:border-white/10">
                <span>Rank: {selectedRank === 'trending' ? '📈 Trending' : selectedRank === 'hot' ? '🔥 Hot' : '👑 Popular'}</span>
                <button onClick={() => setSelectedRank('All')} className="hover:text-red-500 dark:hover:text-red-400 font-bold">✕</button>
              </span>
            )}
            {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-white/10 text-kpugi-ink dark:text-white border border-kpugi-border dark:border-white/10">
                  <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-red-500 dark:hover:text-red-400 font-bold">✕</button>
                </span>
              )}
              {activePlatform && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-white/10 text-kpugi-ink dark:text-white border border-kpugi-border dark:border-white/10">
                  <span>Platform: {activePlatform}</span>
                  <button onClick={() => setActivePlatform(null)} className="hover:text-red-500 dark:hover:text-red-400 font-bold">✕</button>
                </span>
              )}
              {selectedStatus !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-white/10 text-kpugi-ink dark:text-white border border-kpugi-border dark:border-white/10">
                  <span>Status: {selectedStatus}</span>
                  <button onClick={() => setSelectedStatus('All')} className="hover:text-red-500 dark:hover:text-red-400 font-bold">✕</button>
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-white/10 text-kpugi-ink dark:text-white border border-kpugi-border dark:border-white/10">
                  <span>Category: {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('All')} className="hover:text-red-500 dark:hover:text-red-400 font-bold">✕</button>
                </span>
              )}
              {selectedContent !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-white/10 text-kpugi-ink dark:text-white border border-kpugi-border dark:border-white/10">
                  <span>Content: {selectedContent}</span>
                  <button onClick={() => setSelectedContent('All')} className="hover:text-red-500 dark:hover:text-red-400 font-bold">✕</button>
                </span>
              )}
              {minCpm > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-white/10 text-kpugi-ink dark:text-white border border-kpugi-border dark:border-white/10">
                  <span>Min CPM: ₦{minCpm.toLocaleString()}</span>
                  <button onClick={() => setMinCpm(0)} className="hover:text-red-500 dark:hover:text-red-400 font-bold">✕</button>
                </span>
              )}
              <button
                onClick={resetAllFilters}
                className="text-xs text-kpugi-blue hover:underline font-bold ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Featured Section Title & Result Count + Grid/List Switcher */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="font-display font-bold text-kpugi-ink dark:text-white text-lg sm:text-xl tracking-tight truncate">
              {searchQuery || activeFiltersCount > 0 ? 'Filtered Campaigns' : 'Featured Campaigns'}
            </h2>
            <span className="text-xs text-kpugi-slate dark:text-white/50 font-medium shrink-0">
              ({filtered.length})
            </span>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#13151A] p-1 rounded-xl border border-kpugi-border dark:border-white/10 shrink-0">
            <button
              onClick={() => handleViewModeChange('grid')}
              title="Grid View"
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold ${
                viewMode === 'grid' ? 'bg-white dark:bg-white/15 text-kpugi-ink dark:text-white shadow-sm' : 'text-kpugi-slate dark:text-white/40 hover:text-kpugi-ink dark:hover:text-white'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              title="List View"
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold ${
                viewMode === 'list' ? 'bg-white dark:bg-white/15 text-kpugi-ink dark:text-white shadow-sm' : 'text-kpugi-slate dark:text-white/40 hover:text-kpugi-ink dark:hover:text-white'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {/* Campaign Listings (Grid vs List View) */}
        {isLoading ? (
          <CampaignGridSkeleton count={8} />
        ) : filtered.length > 0 ? (
          viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((c, i) => (
                <React.Fragment key={c.id}>
                  {i === 2 && <SponsoredAdCard index={99} />}
                  <Link href={`/browse/${c.id}`}>
                    <CampaignCard c={c} index={i} userRole={currentUserRole} />
                  </Link>
                </React.Fragment>
              ))}
              {filtered.length < 2 && <SponsoredAdCard index={99} />}
            </div>
          ) : (
            /* LIST VIEW (TABLE) */
            <div className="bg-white dark:bg-[#12141A] rounded-2xl border border-kpugi-border dark:border-white/10 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-kpugi-border dark:border-white/10 bg-slate-50 dark:bg-[#161820] text-kpugi-slate dark:text-white/50 uppercase text-[10px] tracking-wider font-bold">
                      {/* Campaign & Brand */}
                      <th 
                        onClick={() => handleSort('title')}
                        className="py-4 px-5 cursor-pointer hover:text-kpugi-ink dark:hover:text-white transition-colors select-none group/th"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={sortColumn === 'title' ? 'text-kpugi-ink dark:text-white font-extrabold' : 'group-hover/th:text-kpugi-ink dark:group-hover/th:text-white'}>Campaign & Brand</span>
                          <span className={`text-[10px] ${sortColumn === 'title' ? 'text-kpugi-blue font-black' : 'text-slate-300 dark:text-white/20 group-hover/th:text-slate-600 dark:group-hover/th:text-white/60'}`}>
                            {sortColumn === 'title' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                          </span>
                        </div>
                      </th>

                      {/* Platforms */}
                      <th className="py-4 px-4">Platforms</th>

                      {/* CPM Rate */}
                      <th 
                        onClick={() => handleSort('cpm')}
                        className="py-4 px-4 cursor-pointer hover:text-kpugi-ink dark:hover:text-white transition-colors select-none group/th"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={sortColumn === 'cpm' ? 'text-kpugi-ink dark:text-white font-extrabold' : 'group-hover/th:text-kpugi-ink dark:group-hover/th:text-white'}>CPM Rate</span>
                          <span className={`text-[10px] ${sortColumn === 'cpm' ? 'text-kpugi-blue font-black' : 'text-slate-300 dark:text-white/20 group-hover/th:text-slate-600 dark:group-hover/th:text-white/60'}`}>
                            {sortColumn === 'cpm' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                          </span>
                        </div>
                      </th>

                      {/* Min Views */}
                      <th 
                        onClick={() => handleSort('minViews')}
                        className="py-4 px-4 cursor-pointer hover:text-kpugi-ink dark:hover:text-white transition-colors select-none group/th"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={sortColumn === 'minViews' ? 'text-kpugi-ink dark:text-white font-extrabold' : 'group-hover/th:text-kpugi-ink dark:group-hover/th:text-white'}>Min Views</span>
                          <span className={`text-[10px] ${sortColumn === 'minViews' ? 'text-kpugi-blue font-black' : 'text-slate-300 dark:text-white/20 group-hover/th:text-slate-600 dark:group-hover/th:text-white/60'}`}>
                            {sortColumn === 'minViews' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                          </span>
                        </div>
                      </th>

                      {/* Spent / Budget */}
                      <th 
                        onClick={() => handleSort('budget')}
                        className="py-4 px-4 cursor-pointer hover:text-kpugi-ink dark:hover:text-white transition-colors select-none group/th"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={sortColumn === 'budget' ? 'text-kpugi-ink dark:text-white font-extrabold' : 'group-hover/th:text-kpugi-ink dark:group-hover/th:text-white'}>Spent / Budget</span>
                          <span className={`text-[10px] ${sortColumn === 'budget' ? 'text-kpugi-blue font-black' : 'text-slate-300 dark:text-white/20 group-hover/th:text-slate-600 dark:group-hover/th:text-white/60'}`}>
                            {sortColumn === 'budget' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                          </span>
                        </div>
                      </th>

                      {/* Action */}
                      <th className="py-4 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kpugi-border/60 dark:divide-white/5">
                    {filtered.map((c, i) => (
                      <React.Fragment key={c.id}>
                        {i === 2 && <SponsoredAdRow />}
                        <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors group">
                          {/* Campaign & Brand */}
                          <td className="py-4 px-5">
                            <Link href={`/browse/${c.id}`} className="flex items-center gap-3 min-w-[220px]">
                              {c.thumbnailUrl ? (
                                <img src={c.thumbnailUrl} alt={c.brief} className="w-10 h-10 rounded-xl object-cover border border-kpugi-border dark:border-white/10 shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-kpugi-ink dark:text-white font-bold text-sm shrink-0">
                                  {c.brand.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-sm text-kpugi-ink dark:text-white group-hover:text-kpugi-blue transition-colors truncate block">
                                    {c.brief}
                                  </span>
                                  {c.status === 'completed' ? (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/15 text-[9px] font-bold uppercase tracking-wider">
                                      🏁 Completed
                                    </span>
                                  ) : (
                                    c.rankBadges?.map((tier) => (
                                      <span
                                        key={tier}
                                        title={tier === 'trending' ? '📈 Trending (24h)' : tier === 'hot' ? '🔥 Hot (7d)' : '👑 Popular (30d)'}
                                        className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] border cursor-help ${
                                          tier === 'trending'
                                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                            : tier === 'hot'
                                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                            : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                                        }`}
                                      >
                                        {tier === 'trending' ? '📈' : tier === 'hot' ? '🔥' : '👑'}
                                      </span>
                                    ))
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-kpugi-slate dark:text-white/40">
                                  <span className="truncate">{c.brand}</span>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#E4A12C] shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                  <span>·</span>
                                  <span>{c.timePosted}</span>
                                </div>
                              </div>
                            </Link>
                          </td>

                          {/* Platforms */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {c.platform.map((p) => (
                                <div key={p} className="w-5 h-5 rounded-full bg-slate-100 dark:bg-black flex items-center justify-center border border-slate-200 dark:border-white/10 text-kpugi-ink dark:text-white">
                                  <PlatformIcon platform={p} className="w-3 h-3" />
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* CPM Rate */}
                          <td className="py-4 px-4 whitespace-nowrap font-mono text-kpugi-ink dark:text-white font-bold text-xs">
                            {formatCompactCurrency(c.cpm)}
                            <span className="text-[10px] text-kpugi-slate dark:text-white/40 block font-sans">/ 1k views</span>
                          </td>

                          {/* Min Threshold */}
                          <td className="py-4 px-4 whitespace-nowrap font-mono text-kpugi-slate dark:text-white/80 text-xs">
                            {formatCompactNumber(c.minViews)} views
                          </td>

                          {/* Budget / Slots with Progress Slider Bar */}
                          <td className="py-4 px-4 whitespace-nowrap min-w-[150px]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-xs font-semibold text-kpugi-ink dark:text-white block">
                                {formatCompactCurrency(c.budgetSpent)} / {formatCompactCurrency(c.budgetTotal)}
                              </span>
                              <span className="text-[10px] font-bold text-kpugi-blue dark:text-blue-400 font-mono">
                                {Math.round(c.budgetTotal > 0 ? (c.budgetSpent / c.budgetTotal) * 100 : 0)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-1">
                              <div
                                className="h-full bg-gradient-to-r from-kpugi-blue to-emerald-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, c.budgetTotal > 0 ? (c.budgetSpent / c.budgetTotal) * 100 : 0))}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-kpugi-slate dark:text-white/40 block">
                              {c.slotsFilled} creators joined
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <Link
                              href={`/browse/${c.id}`}
                              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-kpugi-blue text-kpugi-ink dark:text-white hover:text-white font-bold text-xs transition-all shadow-sm group-hover:bg-kpugi-blue group-hover:text-white"
                            >
                              <span>View Campaign</span>
                            </Link>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                    {filtered.length < 2 && <SponsoredAdRow />}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#12141A] rounded-3xl border border-kpugi-border dark:border-white/5 text-kpugi-slate dark:text-slate-400 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-xl">
              🔍
            </div>
            <div>
              <p className="text-kpugi-ink dark:text-white font-bold text-base">No matching campaigns found</p>
              <p className="text-xs text-kpugi-slate dark:text-white/40 mt-1">Try adjusting your filters or search keywords.</p>
            </div>
            <button
              onClick={resetAllFilters}
              className="px-5 py-2.5 bg-kpugi-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Large Kpugi Advert Promotional Banner */}
        <div className="relative w-full rounded-3xl overflow-hidden my-12 border border-blue-500/20 bg-[#0B1026] shadow-2xl">
          {/* Background Graphic Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
            style={{ backgroundImage: "url('/images/kpugi_promo_banner.png')" }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#090A0F] via-[#090A0F]/90 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-transparent to-blue-900/20 z-10" />

          {/* Content Layer */}
          <div className="relative z-20 p-8 sm:p-12 lg:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            {/* Left Column: Brand Wordmark, Tagline & Bullets */}
            <div className="space-y-6 max-w-2xl">
              {/* Badge & Wordmark Pill */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2.5 bg-[#121833] border border-blue-500/30 px-4 py-2 rounded-full shadow-inner">
                  <img src="/kpugi_logo.png" alt="Kpugi Logo" className="h-6 w-auto object-contain" />
                </div>
              </div>

              {/* Headline */}
              <h3 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                Where Every Post Turns Into an <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">Instant Payout</span>.
              </h3>

              {/* Subtext */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans max-w-xl">
                Whether you&apos;re a creator monetizing high-reach viral posts or a brand scaling CPM campaigns across Nigeria, Kpugi automates verified view payouts with zero escrow delay.
              </p>

              {/* Key Feature Stats Bar */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 max-w-lg">
                <div>
                  <div className="font-display font-extrabold text-2xl text-white">₦2k</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Base CPM Rate</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-2xl text-white">72 Hrs</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Live Audit Window</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-2xl text-emerald-400">100%</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Escrow Protected</div>
                </div>
              </div>
            </div>

            {/* Right Column: Dual CTAs for Creators & Brands */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto shrink-0 z-20">
              <Link
                href="/sign-in"
                className="px-8 py-4 bg-kpugi-blue hover:bg-blue-600 text-white font-sans font-bold text-sm rounded-2xl shadow-xl shadow-kpugi-blue/25 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>🚀 Start Earning as a Creator</span>
              </Link>
              <Link
                href="/onboarding/advertiser"
                className="px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-sans font-bold text-sm rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>📢 Launch a Brand Campaign</span>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
