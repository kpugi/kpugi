'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/utils/format';
import { CampaignGridSkeleton } from '@/components/ui/Skeletons';

/* ─────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────── */
type Platform = 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook' | 'LinkedIn' | 'X';
type Category = 'Fashion' | 'Food & Drink' | 'Tech' | 'Lifestyle' | 'Finance' | 'Gaming' | 'Beauty' | 'Sports';

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

  if (items.length === 0) return null;

  const current = items[currentIndex];

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
    <div className="relative w-full h-[420px] sm:h-[500px] overflow-hidden group cursor-pointer mb-10 select-none bg-[#090A0F]">
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
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-12 pb-10 sm:pb-14 flex items-end justify-between">
          <div className="pointer-events-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#E4A12C] flex items-center justify-center text-[10px] font-bold text-black">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <span className="text-sm font-semibold text-white/90">{current.badge}</span>
            </div>
            
            <h1 className="font-display font-bold text-white text-3xl sm:text-6xl mb-4 tracking-tight max-w-4xl leading-tight">
              {current.title}
            </h1>
            
            <div className="flex items-center gap-2 text-sm text-white/60 font-medium mb-8">
              <span>{current.category}</span>
              <span>·</span>
              <span className="text-white">
                {formatCompactCurrency(current.cpm)}
                <span className="text-white/60">/1K views</span>
              </span>
              <span>·</span>
              <span>{formatCompactCurrency(current.budget)} Budget</span>
            </div>
            
            <div>
              <Link href={`/browse/${current.id}`}>
                <button className="bg-white text-black px-8 py-3.5 rounded-full font-bold text-sm hover:bg-white/90 transition-transform hover:scale-105 active:scale-95">
                  View Program
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
function CampaignCard({ c, index }: { c: Campaign, index: number }) {
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
    <article className="group relative flex flex-col bg-[#12141A] rounded-2xl overflow-hidden hover:bg-[#161820] transition-all duration-300 hover:scale-[1.01] border border-white/5 hover:border-white/10 cursor-pointer">
      {/* Thumbnail Area */}
      <div className="h-[180px] w-full relative overflow-hidden bg-slate-900">
        {/* AI Match Score Badge Overlay */}
        <div className="absolute top-3 right-3 z-20">
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-md border backdrop-blur-md ${
            (c.matchScore || 88) >= 85
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-emerald-500/20'
              : (c.matchScore || 88) >= 65
              ? 'bg-blue-950/80 border-blue-500/50 text-blue-300'
              : 'bg-slate-900/80 border-white/20 text-slate-300'
          }`}>
            <span>✨</span>
            <span>{c.matchScore || 88}% Match</span>
          </div>
        </div>

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
                className="w-5 h-5 rounded-full object-cover border border-white/10 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {c.brand.charAt(0)}
              </div>
            )}
            <span className="text-[13px] font-semibold text-white/90 truncate max-w-[90px]">{c.brand}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#E4A12C] shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span className="text-[13px] text-white/40 shrink-0">·</span>
            <span className="text-[13px] text-white/40 shrink-0">{c.timePosted}</span>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            {c.platform.map(p => (
              <div key={p} className="w-5 h-5 rounded-full bg-black flex items-center justify-center border border-white/10">
                <PlatformIcon platform={p} className="w-[11px] h-[11px]" />
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-white text-[15px] leading-snug mb-2 line-clamp-2">
          {c.brief}
        </h3>
        
        {/* Tone/Audience */}
        <p className="text-[12px] text-white/40 mb-6 italic line-clamp-2">
          {c.tone}
        </p>

        {/* Bottom Stats */}
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-semibold flex items-center gap-0.5">
              <span className="text-white">{formatCompactCurrency(c.budgetSpent)}</span>
              <span className="text-white/40">/{formatCompactCurrency(c.budgetTotal)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md" title="Creators Joined">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span className="text-[11px] font-bold text-white/90">{c.slotsFilled}</span>
              </div>
              <div className="bg-[#2F49E8] px-2 py-1 rounded-md text-[11px] font-bold text-white shadow-sm">
                {formatCompactCurrency(c.cpm)}/1K
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
  )
}

/* ─────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────── */
export default function BrowsePage() {
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('/api/campaigns');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch campaigns');
        setDbCampaigns(data.campaigns || []);
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

      // Map dynamic categories based on brand names for various niches
      let category: Category = 'Tech';
      if (brandName === 'PiggyVest') category = 'Finance';
      else if (brandName === 'Chowdeck') category = 'Food & Drink';
      else if (brandName === 'Zaron Cosmetics') category = 'Beauty';
      else if (brandName === 'Kpugi') category = 'Lifestyle';

      return {
        id: c.id,
        brand: brandName,
        brandLogo: brandLogo,
        thumbnailUrl: thumbnailUrl,
        brief: c.title,
        platform: (c.channels || []) as Platform[],
        category: category,
        cpm: Number(c.cpm_rate),
        slotsTotal: 100,
        slotsFilled: creatorsCount,
        budgetTotal: Number(c.total_budget),
        budgetSpent: Number(c.spent_budget || 0),
        minViews: c.min_view_threshold,
        daysLeft: 14,
        tone: c.description.slice(0, 100) + '...',
        timePosted: '1d',
        is_featured: !!c.is_featured,
        matchScore: c.match_score || 88,
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
      badge: c.brand === 'Kpugi' ? 'Kpugi Launch Special' : `${c.brand} Campaign`,
      imageUrl: c.thumbnailUrl,
    }));
  }, [mappedCampaigns]);

  const filtered = useMemo(() => {
    let list = [...mappedCampaigns];
    if (activePlatform) list = list.filter((c) => c.platform.includes(activePlatform));
    return list;
  }, [mappedCampaigns, activePlatform]);

  return (
    <div className="min-h-screen bg-[#090A0F] font-sans pb-16">
      
      {/* Full width hero - dynamically powered */}
      <FeaturedHero items={featuredItems} />

      <div className="max-w-7xl mx-auto px-6">

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          
          {/* Search */}
          <div className="relative w-full md:w-[320px]">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Campaigns and creators" 
              className="w-full bg-[#13151A] border border-white/5 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors" 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/30 font-mono border border-white/10 rounded px-1.5 py-0.5">⌘K</span>
          </div>
          
          {/* Platform Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            <button className="w-11 h-11 shrink-0 rounded-full bg-[#13151A] border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
            </button>
            <button 
              onClick={() => setActivePlatform(null)}
              className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors text-sm font-semibold
                ${!activePlatform ? 'bg-white text-black' : 'bg-[#13151A] border border-white/5 text-white/70 hover:text-white hover:bg-white/10'}
              `}
            >
              All
            </button>
            {PLATFORMS.map(p => (
              <button 
                key={p} 
                onClick={() => setActivePlatform(p)}
                className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors
                  ${activePlatform === p ? 'bg-white text-black' : 'bg-[#13151A] border border-white/5 text-white/70 hover:text-white hover:bg-white/10'}
                `}
              >
                <PlatformIcon platform={p} className="w-5 h-5" />
              </button>
            ))}
          </div>

          {/* Dropdowns */}
          <div className="md:ml-auto flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['Status', 'Category', 'Content'].map(label => (
              <div key={label} className="relative shrink-0">
                <select className="bg-[#13151A] border border-white/5 rounded-full pl-5 pr-10 py-3 text-sm text-white/80 appearance-none hover:bg-white/10 transition-colors cursor-pointer outline-none">
                  <option>{label}</option>
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Section Title */}
        <h2 className="font-display font-bold text-white text-xl mb-6 tracking-tight">Featured</h2>

        {/* Campaign Grid */}
        {isLoading ? (
          <CampaignGridSkeleton count={8} />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((c, i) => (
              <Link key={c.id} href={`/browse/${c.id}`}>
                <CampaignCard c={c} index={i} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#12141A] rounded-2xl border border-white/5 text-slate-400">
            No live campaigns found.
          </div>
        )}

      </div>
    </div>
  );
}
