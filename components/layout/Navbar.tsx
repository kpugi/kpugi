'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  const pathname = usePathname();
  const isDarkPage = pathname?.startsWith('/browse') || pathname?.startsWith('/c/') || pathname?.startsWith('/dashboard');

  return (
    <header 
      className={`sticky top-0 z-50 transition-colors duration-500 backdrop-blur-xl ${
        isDarkPage 
          ? 'bg-[#090A0F]/80 border-b border-white/10 text-white' 
          : 'bg-white/90 border-b border-kpugi-border text-kpugi-ink'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <Image
            src="/kpugi_logo.png"
            alt="Kpugi"
            width={120}
            height={120}
            className="rounded-lg transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        <nav className={`hidden md:flex items-center gap-8 text-sm font-medium ${
          isDarkPage ? 'text-white/70' : 'text-kpugi-slate'
        }`}>
          <Link 
            href="/how-it-works" 
            className={`transition-colors ${isDarkPage ? 'hover:text-white' : 'hover:text-kpugi-blue'}`}
          >
            How it Works
          </Link>
          <Link 
            href="/pricing" 
            className={`transition-colors ${isDarkPage ? 'hover:text-white' : 'hover:text-kpugi-blue'}`}
          >
            Pricing
          </Link>
          <Link 
            href="/browse" 
            className={`transition-colors ${
              pathname === '/browse'
                ? isDarkPage 
                  ? 'text-white font-bold' 
                  : 'text-kpugi-blue font-bold'
                : isDarkPage 
                  ? 'hover:text-white' 
                  : 'hover:text-kpugi-blue'
            }`}
          >
            Browse
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <Link 
              href="/sign-in" 
              className={`px-4 py-2 text-xs font-bold transition-colors ${
                isDarkPage 
                  ? 'text-white/80 hover:text-white' 
                  : 'text-kpugi-ink hover:text-kpugi-blue'
              }`}
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="px-4 py-2.5 text-xs font-bold text-white bg-kpugi-blue hover:bg-blue-600 rounded-xl shadow-sm transition-all shadow-blue-500/20"
            >
              Get Started
            </Link>
          </SignedOut>

          <SignedIn>
            <Link 
              href="/dashboard" 
              className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all ${
                isDarkPage 
                  ? 'bg-white text-black hover:bg-white/90 shadow-white/10' 
                  : 'bg-kpugi-ink text-white hover:bg-black'
              }`}
            >
              Dashboard →
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

