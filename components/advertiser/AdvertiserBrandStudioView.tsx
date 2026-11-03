'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Palette,
  Wand2,
  Video,
} from 'lucide-react';

export default function AdvertiserBrandStudioView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 font-sans text-kpugi-ink dark:text-white">
      {/* Hero Coming Soon Card */}
      <div className="relative rounded-3xl bg-slate-900 dark:bg-[#12141A] text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-slate-800 dark:border-white/10 text-center">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-64 h-64 rounded-full bg-kpugi-blue/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>COMING SOON • PRIVATE BETA</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Brand Studio
          </h1>

          {/* Body */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            AI-powered campaign briefings, multi-format creative assets, and brand voice co-pilots are launching soon for verified brands.
          </p>

          {/* Quick CTA */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/b/campaigns/new"
              className="px-6 py-3 bg-kpugi-blue hover:bg-kpugi-blue/90 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-kpugi-blue/25 hover:shadow-xl transition-all flex items-center gap-2"
            >
              <span>Create Campaign</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/b/dashboard"
              className="px-5 py-3 bg-slate-800 dark:bg-white/10 hover:bg-slate-700 dark:hover:bg-white/20 text-slate-300 dark:text-white text-xs sm:text-sm font-bold rounded-2xl border border-slate-700 dark:border-white/10 transition-all"
            >
              Back to Overview
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Teasers & Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: AI Brief Generation */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs space-y-3 relative overflow-hidden group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Wand2 className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-kpugi-ink dark:text-white">AI Brief Generator</h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
              In Development
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Turn your product goals into clear, actionable creator briefs with pre-tested hooks, angles, and call-to-actions.
          </p>
        </div>

        {/* Card 2: Brand Kit Management */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs space-y-3 relative overflow-hidden group">
          <div className="w-10 h-10 rounded-2xl bg-kpugi-blue/10 text-kpugi-blue dark:text-blue-400 flex items-center justify-center font-bold">
            <Palette className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-kpugi-ink dark:text-white">Brand Asset Vault</h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
              In Development
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Upload official brand logos, sound bites, tone-of-voice rules, and product photography directly for creators to use.
          </p>
        </div>

        {/* Card 3: Multi-Platform Script Studio */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs space-y-3 relative overflow-hidden group">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Video className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-kpugi-ink dark:text-white">Script Storyboard</h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
              In Development
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Craft short-form video storyboards tailored for TikTok, Instagram Reels, and YouTube Shorts algorithms.
          </p>
        </div>
      </div>
    </div>
  );
}
