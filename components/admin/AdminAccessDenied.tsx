'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';

interface AdminAccessDeniedProps {
  error?: string;
  userEmail?: string;
}

export default function AdminAccessDenied({ error, userEmail }: AdminAccessDeniedProps) {
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4 selection:bg-rose-500/30">
      <div className="max-w-md w-full bg-[#0E131F] border border-red-500/20 rounded-2xl p-8 shadow-2xl shadow-red-950/40 relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-5 text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
            403 • Restricted Operator Zone
          </span>

          <h1 className="text-2xl font-bold font-display text-white mb-2">
            Access Denied
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The Kpugi Admin Console is restricted to designated platform operators.
            Your current account does not have operator clearance in Postgres RLS.
          </p>

          {userEmail && (
            <div className="w-full bg-[#080B11] border border-slate-800 rounded-xl p-3 mb-6 flex flex-col items-start text-left text-xs font-mono">
              <span className="text-slate-500 text-[11px]">Authenticated Account:</span>
              <span className="text-slate-300 font-semibold truncate w-full mt-0.5">{userEmail}</span>
              {error && (
                <span className="text-rose-400/80 text-[11px] mt-1 break-all">
                  Reason: {error}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold tracking-wide transition-all border border-slate-700 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Main Dashboard
            </Link>

            <button
              onClick={() => signOut({ redirectUrl: '/sign-in' })}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold tracking-wide transition-all border border-rose-500/30 active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Switch Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
