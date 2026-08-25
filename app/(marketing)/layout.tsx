import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SplashCursor from '@/components/ui/SplashCursor';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-kpugi-paper text-kpugi-ink">
      <SplashCursor />
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

