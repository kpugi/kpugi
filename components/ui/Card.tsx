import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-kpugi-border p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
