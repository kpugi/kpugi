'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 transition-colors duration-300 backdrop-blur-xl bg-white/90 dark:bg-[#090A0F]/80 border-b border-kpugi-border dark:border-white/10 text-kpugi-ink dark:text-white">
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

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-kpugi-slate dark:text-slate-300">
          <Link 
            href="/how-it-works" 
            className="transition-colors hover:text-kpugi-blue dark:hover:text-white"
          >
            How it Works
          </Link>
          <Link 
            href="/pricing" 
            className="transition-colors hover:text-kpugi-blue dark:hover:text-white"
          >
            Pricing
          </Link>
          <Link 
            href="/browse" 
            className={`transition-colors ${
              pathname === '/browse'
                ? 'text-kpugi-blue dark:text-white font-bold'
                : 'hover:text-kpugi-blue dark:hover:text-white'
            }`}
          >
            Browse
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <SignedOut>
            <Link 
              href="/sign-in" 
              className="px-3.5 py-2 text-xs font-bold text-kpugi-ink dark:text-white/80 hover:text-kpugi-blue dark:hover:text-white transition-colors"
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
              className="px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all bg-kpugi-ink text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-white/90"
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
