'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Quote, Star } from 'lucide-react';

export interface BrandReviewItem {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar_url?: string | null;
  content: string;
  metric?: string | null;
  rating?: number;
}

const FALLBACK_REVIEWS: BrandReviewItem[] = [
  {
    id: '1',
    name: 'Femi Aluko',
    role: 'Head of Growth',
    company: 'Chowdeck',
    avatar_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&auto=format&fit=crop',
    content:
      'We coordinated 80+ Nigerian creators across Lagos and Abuja in a single weekend. Payouts were automatic and every single view was verified.',
    metric: '3.8x Campaign ROI',
    rating: 5,
  },
  {
    id: '2',
    name: 'Odunayo Eweniyi',
    role: 'Co-founder & COO',
    company: 'PiggyVest',
    avatar_url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=100&auto=format&fit=crop',
    content:
      'The pay-per-verified-view model completely transformed how we allocate our creator budget. Zero wasted spend, pure measurable distribution.',
    metric: '+140k App Signups',
    rating: 5,
  },
  {
    id: '3',
    name: 'Tara Fela-Durotoye',
    role: 'Brand Director',
    company: 'Zaron Cosmetics',
    avatar_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&auto=format&fit=crop',
    content:
      'Creators delivered genuine beauty tutorials across Instagram and TikTok. We only paid for human views with real engagement and zero bot inflation.',
    metric: '850k+ Verified Reach',
    rating: 5,
  },
  {
    id: '4',
    name: 'Tunde Bakare',
    role: 'Brand Manager',
    company: 'Infinix Mobile',
    avatar_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format&fit=crop',
    content:
      'Launching our smartphone series across 6 channels was effortless. Live dashboard telemetry gave our team full visibility into creator performance.',
    metric: '1.2M Total Impressions',
    rating: 5,
  },
  {
    id: '5',
    name: 'Nabom Clark',
    role: 'Lead Operator',
    company: 'Truveka',
    avatar_url: '/api/media/brand-logos/cmp-1787079828710-i56z5k.jpg',
    content:
      'The transparency is unmatched in Nigeria. We track verified impressions in real time without chasing creators for manual analytics screenshots.',
    metric: '99.4% Verification Rate',
    rating: 5,
  },
  {
    id: '6',
    name: 'Adeola Davies',
    role: 'Media Strategist',
    company: 'Kpugi Media',
    avatar_url: 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzNIeTRBZTNCOXJWakVLSGQ0WnMwT1FRN0h3biJ9',
    content:
      'Scaling viral campaigns across Nigerian digital audiences without fraud. Instant milestone verification keeps creators motivated to deliver top quality.',
    metric: '₦2.00 Effective CPM',
    rating: 5,
  },
];

export default function BrandTestimonialsVertical({
  reviews = [],
}: {
  reviews?: BrandReviewItem[];
}) {
  const [isPaused, setIsPaused] = useState(false);

  const activeReviews = reviews.length > 0 ? reviews : FALLBACK_REVIEWS;
  const scrollItems = [...activeReviews, ...activeReviews];

  return (
    <section className="relative w-full py-24 px-6 bg-[#F8F9FD] dark:bg-[#08090D] overflow-hidden transition-colors duration-300">
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 48,
          alignItems: 'center',
        }}
        className="testimonials-split-grid"
      >
        {/* Left Column: Heading & Value Prop */}
        <div>
          <h2 className="font-clash font-bold text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.08] text-[#0B1026] dark:text-white mb-5 tracking-[-0.025em]">
            Trusted by brands that scale with{' '}
            <span className="bg-gradient-to-br from-[#4162FF] via-[#2F49E8] to-[#1A32D4] bg-clip-text text-transparent">
              performance.
            </span>
          </h2>

          <p className="font-satoshi text-[1.0625rem] text-slate-600 dark:text-white/50 leading-[1.7] mb-8 max-w-[480px]">
            Reduce financial risk, gain transparent impression audits, and help your marketing team scale reach across Nigeria without paying for ghost followers.
          </p>

          <div className="flex gap-6 flex-wrap border-t border-slate-200 dark:border-white/10 pt-6">
            <div>
              <div className="font-clash font-bold text-3xl text-slate-900 dark:text-white leading-none">
                100%
              </div>
              <div className="font-satoshi text-[0.8125rem] text-slate-500 dark:text-white/40 mt-1">
                Audited impressions
              </div>
            </div>

            <div className="w-[1px] h-10 bg-slate-200 dark:bg-white/10" />

            <div>
              <div className="font-clash font-bold text-3xl text-[#17A75B] leading-none">
                ₦0
              </div>
              <div className="font-satoshi text-[0.8125rem] text-slate-500 dark:text-white/40 mt-1">
                Wasted ad spend
              </div>
            </div>

            <div className="w-[1px] h-10 bg-slate-200 dark:bg-white/10" />

            <div>
              <div className="font-clash font-bold text-3xl text-[#2F49E8] dark:text-[#5B7CFF] leading-none">
                6
              </div>
              <div className="font-satoshi text-[0.8125rem] text-slate-500 dark:text-white/40 mt-1">
                Supported platforms
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Vertical Scrolling Testimonial Feed */}
        <div
          className="relative h-[480px] overflow-hidden rounded-[28px] bg-slate-100/60 dark:bg-white/[0.015] border border-slate-200 dark:border-white/[0.06] p-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Top Gradient Fade Overlay */}
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-[70px] bg-gradient-to-b from-[#F8F9FD] dark:from-[#08090D] to-transparent z-10 pointer-events-none"
          />

          {/* Scrolling Items Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              animation: 'kpugi-vertical-scroll 32s linear infinite',
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {scrollItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-[22px] p-6 flex flex-col gap-3.5 shadow-sm dark:shadow-none transition-transform hover:scale-[1.01]"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#151A28] border border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                      {item.avatar_url ? (
                        <Image
                          src={item.avatar_url}
                          alt={item.company}
                          fill
                          sizes="40px"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <span className="font-clash font-bold text-sm text-slate-800 dark:text-white">
                          {item.company.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-clash font-semibold text-[0.9375rem] text-slate-900 dark:text-white leading-tight">
                        {item.name}
                      </div>
                      <div className="font-satoshi text-xs text-slate-500 dark:text-white/45 mt-0.5">
                        {item.role} · <span className="text-[#2F49E8] dark:text-[#5B7CFF] font-semibold">{item.company}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: item.rating ?? 5 }).map((_, starI) => (
                        <Star key={starI} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Quote className="h-4 w-4 text-blue-500/30" />
                  </div>
                </div>

                <p className="font-satoshi text-sm text-slate-700 dark:text-white/70 leading-relaxed m-0">
                  &ldquo;{item.content}&rdquo;
                </p>

                {item.metric && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#17A75B] shadow-[0_0_8px_#17A75B]" />
                    <span className="font-satoshi text-[0.6875rem] font-bold text-[#17A75B] tracking-wider">
                      {item.metric}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Gradient Fade Overlay */}
          <div
            aria-hidden
            className="absolute bottom-0 left-0 right-0 h-[70px] bg-gradient-to-t from-[#F8F9FD] dark:from-[#08090D] to-transparent z-10 pointer-events-none"
          />
        </div>
      </div>

      <style>{`
        @keyframes kpugi-vertical-scroll {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="kpugi-vertical-scroll"] { animation: none; }
        }
        @media (max-width: 900px) {
          .testimonials-split-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
