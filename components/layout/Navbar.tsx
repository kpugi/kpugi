import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
          <Link href="/how-it-works" className="hover:text-kpugi-primary transition-colors">
            How it Works
          </Link>
          <Link href="/pricing" className="hover:text-kpugi-primary transition-colors">
            Pricing
          </Link>
          <Link href="/browse" className="hover:text-kpugi-primary transition-colors">
            Browse
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="btn btn-ghost btn-sm text-kpugi-ink font-semibold">
            Sign In
          </Link>
          <Link href="/sign-up" className="btn btn-primary btn-sm px-4 font-semibold shadow-sm">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
