'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen w-full bg-[#fdfdfc] text-[#1c1d1a] flex flex-col items-center justify-center px-6 py-12 selection:bg-amber-100">
      <div className="w-full max-w-[540px] flex flex-col items-center text-center space-y-7 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Watercolor Illustration */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 -my-4 transition-transform duration-300 hover:scale-[1.02]">
          <Image
            src="/images/404-tragedy.jpg"
            alt="Oh, the tragedy! Spilled chili 404 error illustration"
            fill
            priority
            sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
            className="object-contain drop-shadow-sm mix-blend-multiply"
          />
        </div>

        {/* Text Content */}
        <div className="space-y-3 max-w-md">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-[42px] tracking-tight text-[#141513] leading-tight">
            Oh, the tragedy!
          </h1>
          <p className="text-sm sm:text-base text-[#6b6d65] leading-relaxed font-sans font-normal">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-1">
          <Link
            href="/"
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#1e201d] hover:bg-[#2d302c] text-white text-sm font-bold tracking-tight transition-all duration-200 shadow-sm active:scale-[0.98] inline-flex items-center justify-center"
          >
            Go to homepage
          </Link>
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                window.location.reload();
              }
            }}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#f2f1ec] hover:bg-[#e7e5dc] text-[#1c1d1a] text-sm font-bold tracking-tight transition-all duration-200 active:scale-[0.98] inline-flex items-center justify-center cursor-pointer"
          >
            Try again
          </button>
        </div>

        {/* Helpful Direct Links */}
        <div className="pt-8 space-y-2">
          <p className="text-xs text-[#8c8e85] font-medium tracking-wide">
            You might be looking for:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-[#575952]">
            <Link href="/browse" className="hover:text-[#1c1d1a] hover:underline underline-offset-4 transition-colors">
              Browse Campaigns
            </Link>
            <Link href="/creators" className="hover:text-[#1c1d1a] hover:underline underline-offset-4 transition-colors">
              Creators
            </Link>
            <Link href="/support" className="hover:text-[#1c1d1a] hover:underline underline-offset-4 transition-colors">
              Support
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
