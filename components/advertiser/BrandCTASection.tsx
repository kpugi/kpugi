'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';

export interface BrandItem {
  company_name: string;
  avatar_url?: string | null;
}

function AvatarStack({ brands }: { brands: BrandItem[] }) {
  const displayBrands = brands.slice(0, 4);

  return (
    <div className="flex items-center">
      {displayBrands.map((brand, i) => {
        const initial = brand.company_name.charAt(0).toUpperCase();
        const hue = (i * 53 + 210) % 360;

        return (
          <div
            key={`${brand.company_name}-${i}`}
            className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-[#F8F9FD] dark:border-[#08090D] shadow-sm flex items-center justify-center flex-shrink-0"
            style={{
              marginLeft: i !== 0 ? -8 : 0,
              background: `hsl(${hue}, 50%, 35%)`,
              zIndex: 4 - i,
            }}
          >
            {brand.avatar_url ? (
              <Image
                src={brand.avatar_url}
                alt={brand.company_name}
                fill
                sizes="28px"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <span className="text-[11px] font-clash font-bold text-white leading-none">
                {initial}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-3 w-3 fill-amber-400 text-amber-400"
        />
      ))}
    </div>
  );
}

export default function BrandCTASection({
  brands = [],
}: {
  brands?: BrandItem[];
}) {
  const brandCountText = brands.length > 0 ? `${brands.length}+` : '200+';

  const fallbackBrands: BrandItem[] = [
    { company_name: 'Chowdeck', avatar_url: null },
    { company_name: 'Piggyvest', avatar_url: null },
    { company_name: 'Zaron', avatar_url: null },
    { company_name: 'FastCart', avatar_url: null },
  ];

  const activeAvatarList = brands.length > 0 ? brands : fallbackBrands;

  return (
    <section className="relative w-full py-24 px-5 overflow-hidden bg-[#F8F9FD] dark:bg-[#08090D] flex items-center justify-center transition-colors duration-300">
      {/* Background Ambient Radial Glow */}
      <div
        aria-hidden
        className="absolute top-1/5 left-1/2 -translate-x-1/2 w-[70vw] max-w-[750px] h-[380px] pointer-events-none z-0
          bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,rgba(47,73,232,0.12)_0%,rgba(47,73,232,0.02)_50%,transparent_80%)]
          dark:bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,rgba(47,73,232,0.22)_0%,rgba(47,73,232,0.04)_50%,transparent_80%)]"
      />

      {/* Subtle Dot Grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-0 bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]
          [background-image:radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)]
          dark:[background-image:radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)]"
      />

      <div className="relative z-10 w-full max-w-[720px] text-center mx-auto">
        <h2 className="font-clash font-bold text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.08] text-[#0B1026] dark:text-white tracking-[-0.03em] mb-5 [text-wrap:balance]">
          Ready to scale? <br />
          Launch with{' '}
          <span className="bg-gradient-to-br from-[#4162FF] via-[#2F49E8] to-[#1A32D4] bg-clip-text text-transparent italic">
            confidence.
          </span>
        </h2>

        <p className="font-satoshi text-[clamp(0.9375rem,2vw,1.0625rem)] text-slate-600 dark:text-white/55 leading-[1.7] max-w-[520px] mx-auto mb-9 [text-wrap:pretty]">
          Set your campaign budget, distribute briefs across vetted Nigerian creators, and only pay when real people see your content. No contracts, no minimum spend.
        </p>

        {/* Buttons */}
        <div className="flex flex-row items-center justify-center gap-2.5 w-full max-w-[460px] mx-auto">
          <Link
            href="/b/campaigns/new"
            className="inline-flex items-center justify-center gap-1.5 flex-1 min-h-[48px] bg-[#2F49E8] text-white font-satoshi font-bold text-[clamp(0.8125rem,2.5vw,0.9375rem)] px-4 rounded-xl no-underline whitespace-nowrap shadow-[0_10px_30px_rgba(47,73,232,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform hover:scale-[1.03]"
          >
            <span>Launch a Campaign</span>
            <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" />
          </Link>

          <Link
            href="/browse"
            className="inline-flex items-center justify-center gap-1.5 flex-1 min-h-[48px] bg-white/80 dark:bg-white/[0.06] text-slate-800 dark:text-white font-satoshi font-semibold text-[clamp(0.8125rem,2.5vw,0.9375rem)] px-4 rounded-xl no-underline border border-slate-200 dark:border-white/[0.12] backdrop-blur-md whitespace-nowrap shadow-sm transition-all hover:bg-white dark:hover:bg-white/10 hover:scale-[1.03]"
          >
            <span>Explore Deals</span>
          </Link>
        </div>

        {/* Real Brand Photos & Dynamic Brand Count Row */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap mt-8 text-xs text-slate-600 dark:text-white/45 font-satoshi">
          <AvatarStack brands={activeAvatarList} />
          <StarRating rating={5} />
          <span className="font-medium">
            Trusted by {brandCountText} brands & agencies in Nigeria
          </span>
        </div>
      </div>
    </section>
  );
}
