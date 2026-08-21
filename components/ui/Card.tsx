import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#12141A] rounded-2xl border border-kpugi-border dark:border-white/10 p-6 shadow-sm text-kpugi-ink dark:text-white transition-colors duration-200 ${className}`}>
      {children}
    </div>
  );
}
