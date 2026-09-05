import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/common/BackToTop';
import SplashCursor from '@/components/ui/SplashCursor';
import { Toaster } from '@/components/ui/toaster';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#05060A] text-slate-900 dark:text-white transition-colors duration-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-[#2F49E8] focus:text-white focus:font-bold focus:rounded-xl focus:shadow-2xl focus:outline-none"
      >
        Skip to main content
      </a>
      <SplashCursor />
      <Navbar />
      <main id="main-content" className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      <BackToTop />
      <Toaster />
    </div>
  );
}
