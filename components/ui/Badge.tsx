import React from 'react';

export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}) {
  const variantStyles = {
    default: 'bg-kpugi-paper text-kpugi-slate border-kpugi-border',
    success: 'bg-emerald-50 text-kpugi-naira border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-kpugi-cliff border-red-200',
    info: 'bg-blue-50 text-kpugi-primary border-blue-200',
  };

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}
