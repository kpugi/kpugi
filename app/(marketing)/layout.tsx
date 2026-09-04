import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/common/BackToTop';
import SplashCursor from '@/components/ui/SplashCursor';
import { Toaster } from '@/components/ui/toaster';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#05060A] text-slate-900 dark:text-white transition-colors duration-300">
      <SplashCursor />
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <BackToTop />
      <Toaster />
    </div>
  );
}
