'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Clock,
  Layers,
} from 'lucide-react';

export default function AdvertiserCreatorsDirectoryView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 font-sans text-kpugi-ink">
      {/* Hero Coming Soon Card */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-slate-800 text-center">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-kpugi-blue/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-kpugi-blue/20 text-indigo-300 border border-kpugi-blue/30 text-xs font-mono font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>COMING SOON • PRIVATE BETA</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Creator Discovery Directory
          </h1>

          {/* Body */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Direct creator matchmaking, verified portfolio intelligence, and invite-only campaign targeting are launching soon for brand partners.
          </p>

          {/* Quick CTA back to campaigns */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/b/campaigns"
              className="px-6 py-3 bg-kpugi-blue hover:bg-kpugi-blue/90 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-kpugi-blue/25 hover:shadow-xl transition-all flex items-center gap-2"
            >
              <span>View Active Campaigns</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/b/dashboard"
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold rounded-2xl border border-slate-700 transition-all"
            >
              Back to Overview
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Teasers & Disabled Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Direct Creator Matching */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs space-y-3 relative overflow-hidden group">
          <div className="w-10 h-10 rounded-2xl bg-kpugi-blue/10 text-kpugi-blue flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-kpugi-ink">Direct Creator Hiring</h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              In Development
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Directly browse top-performing creators across TikTok, Instagram, and X to offer tailored bounties and exclusive briefs.
          </p>
        </div>

        {/* Card 2: AI Audience & Geo-Scraping */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs space-y-3 relative overflow-hidden group">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-kpugi-ink">Audience Intelligence</h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              In Development
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect real verified creator reach, historical view completion rates, and fraud-free engagement metrics.
          </p>
        </div>

        {/* Card 3: Invite-Only Campaigns */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs space-y-3 relative overflow-hidden group">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-kpugi-ink">Private Creator Tiers</h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              In Development
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Lock campaigns to specific vetted creator tiers (Rank 3+) or invite selected creators privately.
          </p>
        </div>
      </div>
    </div>
  );
}
