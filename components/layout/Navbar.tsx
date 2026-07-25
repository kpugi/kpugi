import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  return (
    <header className="border-b border-kpugi-border bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <Image
            src="/kpugi_logo.png"
            alt="Kpugi"
            width={120}
            height={120}
            className="rounded-lg transition-transform group-hover:scale-105"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-kpugi-slate">
          <Link href="/how-it-works" className="hover:text-kpugi-blue transition-colors">
            How it Works
          </Link>
          <Link href="/pricing" className="hover:text-kpugi-blue transition-colors">
            Pricing
          </Link>
          <Link href="/browse" className="hover:text-kpugi-blue transition-colors">
            Browse
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <Link href="/sign-in" className="px-4 py-2 text-xs font-bold text-kpugi-ink hover:text-kpugi-blue transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="px-4 py-2.5 text-xs font-bold text-white bg-kpugi-blue hover:bg-blue-700 rounded-xl shadow-sm transition-all">
              Get Started
            </Link>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard" className="px-4 py-2.5 text-xs font-bold text-white bg-kpugi-ink hover:bg-black rounded-xl shadow-sm transition-all">
              Dashboard →
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

