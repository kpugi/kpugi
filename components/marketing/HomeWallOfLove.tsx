'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, CheckCircle2, Quote, Sparkles } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  companyOrHandle: string;
  avatar: string;
  side: 'brand' | 'creator';
  content: string;
  metricHighlight: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Fola Adebayo',
    role: 'Head of Growth',
    companyOrHandle: 'Chowdeck Ecosystem',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    side: 'brand',
    content:
      'We switched from paying unpredictable influencer flat-rates to setting fixed target CPMs on Kpugi. Our customer acquisition cost dropped by 42% while scaling reach across Lagos & Abuja.',
    metricHighlight: '42% CAC Reduction',
    rating: 5,
  },
  {
    name: 'Tobi Adeleke',
    role: 'Short-form Creator',
    companyOrHandle: '@tobi.lens (Lagos)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    side: 'creator',
    content:
      'I don’t have 100k followers, but my video for a brand brief hit 80,000 views. Kpugi settled ₦200,000 directly into my GTBank account within 24 hours without chasing any agency.',
    metricHighlight: '₦200k Earned in 24h',
    rating: 5,
  },
  {
    name: 'Chidi Okeke',
    role: 'Performance Marketing Lead',
    companyOrHandle: 'Infinix Mobile Campaign',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    side: 'brand',
    content:
      'The automated view audit engine is a massive game changer. We deployed budget across 40 creators simultaneously and tracked real-time impressions without checking spreadsheets.',
    metricHighlight: '40 Creators Distributed',
    rating: 5,
  },
  {
    name: 'Amina Bello',
    role: 'Lifestyle & Food Creator',
    companyOrHandle: '@amina_bello (Abuja)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    side: 'creator',
    content:
      'Picking live briefs directly from the marketplace is so seamless. Zero middleman taking half your pay or delaying settlements. My earnings unlock every 1,000 verified views.',
    metricHighlight: 'Weekly Bank Payouts',
    rating: 5,
  },
  {
    name: 'Simi Balogun',
    role: 'Brand Director',
    companyOrHandle: 'Zaron Cosmetics Group',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    side: 'brand',
    content:
      'No more begging influencers for metrics screenshots. We get audited human reach across TikTok, Instagram, and YouTube with 100% budget protection on unverified views.',
    metricHighlight: '100% Budget Protected',
    rating: 5,
  },
  {
    name: 'David Kalu',
    role: 'Tech & Gaming Creator',
    companyOrHandle: '@davidkalu.tech (Port Harcourt)',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    side: 'creator',
    content:
      'The most transparent creator platform in Nigeria. You see your exact views tracked by the hour and your wallet balance updating in real-time as your content gains traction.',
    metricHighlight: 'Real-time Telemetry',
    rating: 5,
  },
];

export default function HomeWallOfLove() {
  const [filter, setFilter] = useState<'all' | 'brand' | 'creator'>('all');

  const filteredTestimonials =
    filter === 'all'
      ? TESTIMONIALS
      : TESTIMONIALS.filter((t) => t.side === filter);

  return (
    <section className="relative w-full py-20 md:py-28 overflow-hidden bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[800px] h-[350px] pointer-events-none z-0
          bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(47,73,232,0.08)_0%,rgba(47,73,232,0.02)_50%,transparent_75%)]
          dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(47,73,232,0.18)_0%,rgba(47,73,232,0.03)_50%,transparent_75%)]"
      />

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        
        {/* Section Header */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
         
          <h2 className="font-clash font-bold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] [text-wrap:balance]">
            Trusted by growth leaders and Nigerian creators
          </h2>
          <p className="font-satoshi text-slate-600 dark:text-white/50 text-sm sm:text-base mt-3 max-w-lg">
            See how brands eliminate ad waste and creators build dependable income streams.
          </p>

          {/* Filter Pills */}
          <div className="mt-8 inline-flex items-center p-1 rounded-2xl bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-satoshi transition-all ${
                filter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Reviews
            </button>
            <button
              onClick={() => setFilter('brand')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-satoshi transition-all ${
                filter === 'brand'
                  ? 'bg-[#2F49E8] text-white shadow-sm'
                  : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Brands & CMOs
            </button>
            <button
              onClick={() => setFilter('creator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-satoshi transition-all ${
                filter === 'creator'
                  ? 'bg-[#17A75B] text-white shadow-sm'
                  : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Creators
            </button>
          </div>
        </div>

        {/* 3-Column Masonry/Grid of Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTestimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-white/20 transition-all group"
            >
              <div>
                {/* Rating Stars & Side Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider font-satoshi px-2.5 py-0.5 rounded-full border ${
                      t.side === 'brand'
                        ? 'bg-[#2F49E8]/10 text-[#2F49E8] dark:text-[#5B7CFF] border-[#2F49E8]/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {t.side === 'brand' ? 'Brand Leader' : 'Creator'}
                  </span>
                </div>

                {/* Content Quote */}
                <p className="font-satoshi text-slate-700 dark:text-white/80 text-sm leading-relaxed mb-6">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-clash font-semibold text-sm text-slate-900 dark:text-white">
                        {t.name}
                      </span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#2F49E8] dark:text-[#5B7CFF]" />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-white/50 block font-satoshi truncate max-w-[140px]">
                      {t.companyOrHandle}
                    </span>
                  </div>
                </div>

                <span className="font-clash font-bold text-xs text-slate-800 dark:text-white/90 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-lg shrink-0">
                  {t.metricHighlight}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
