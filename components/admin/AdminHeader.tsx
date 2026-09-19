'use client';

import React from 'react';
import { ShieldCheck, Terminal, Server, Globe } from 'lucide-react';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({
  title = 'Platform Console',
  subtitle = 'Database-Enforced RBAC • Live Production Operator Control'
}: AdminHeaderProps) {
  const isDev = typeof window !== 'undefined' && window.location.hostname.includes('localhost');

  return (
    <header className="h-16 bg-[#080B11]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h1 className="text-sm font-semibold text-white tracking-tight">{title}</h1>
        </div>
        <span className="hidden sm:inline text-slate-600">/</span>
        <span className="hidden sm:inline text-xs text-slate-400 truncate max-w-md font-normal">
          {subtitle}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Environment Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0E1422] border border-slate-800 text-[11px] font-mono">
          <Server className="w-3 h-3 text-slate-400" />
          <span className="text-slate-400">ENV:</span>
          <span className={isDev ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
            {isDev ? 'LOCAL-DEV' : 'PROD-EDGE'}
          </span>
        </div>

        {/* Security Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PG-RLS:</span>
          <span className="font-semibold">is_admin()</span>
        </div>

        {/* Subdomain Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] font-mono text-indigo-300">
          <Globe className="w-3 h-3 text-indigo-400" />
          <span>admin.kpugi.com</span>
        </div>
      </div>
    </header>
  );
}
