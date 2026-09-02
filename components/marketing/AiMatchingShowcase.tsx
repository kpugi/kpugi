'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
  FaFacebook,
  FaLinkedin,
} from 'react-icons/fa6';

export function AiMatchingShowcase() {
  const [matchScore, setMatchScore] = useState<number>(75);
  const [activeNiche, setActiveNiche] = useState<string>('Lifestyle & Tech');

  const niches = [
    { label: 'Lifestyle & Tech', score: 75 },
    { label: 'Comedy & Skits', score: 92 },
    { label: 'Finance & Crypto', score: 86 },
    { label: 'Beauty & Fashion', score: 88 },
  ];

  const strokeDash = 263.89;
  const strokeOffset = strokeDash * (1 - matchScore / 100);

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-kpugi-blue dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vector Intelligence Engine</span>
        </div>

        <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight leading-tight">
          Smart AI Matching for Higher-Paying Drops
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          No more guessing which briefs will convert. Our vector engine connects your content niche and audience demographic with high-CPM brand drops.
        </p>
      </div>

      {/* Interactive Showcase Card (Matching User's Design) */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Subtle Ambient Light */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Heading, Description, Platforms */}
          <div className="md:col-span-7 space-y-5 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="space-y-2">
              <h3 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight leading-none">
                AI-Powered Sync
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
                Our vector engine has matched your creative profile with this brand's core demographic.
              </p>
            </div>

            {/* Social Platform Icon Tiles */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5 w-full">
              {[
                { name: 'TIKTOK', icon: <FaTiktok className="w-4 h-4 text-[#00F2FE]" />, bg: 'hover:border-cyan-500/50' },
                { name: 'IG', icon: <FaInstagram className="w-4 h-4 text-[#E1306C]" />, bg: 'hover:border-pink-500/50' },
                { name: 'YT', icon: <FaYoutube className="w-4 h-4 text-[#FF0000]" />, bg: 'hover:border-red-500/50' },
                { name: 'FB', icon: <FaFacebook className="w-4 h-4 text-[#1877F2]" />, bg: 'hover:border-blue-500/50' },
                { name: 'IN', icon: <FaLinkedin className="w-4 h-4 text-[#0A66C2]" />, bg: 'hover:border-sky-500/50' },
                { name: 'X', icon: <FaXTwitter className="w-4 h-4 text-slate-900 dark:text-white" />, bg: 'hover:border-slate-400' },
              ].map((p) => (
                <div key={p.name} className="flex flex-col items-center gap-1.5">
                  <div className={`w-11 h-11 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-xs transition-all ${p.bg}`}>
                    {p.icon}
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Interactive Niche Selector */}
            <div className="pt-2 w-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 text-center md:text-left">
                Test Vector Match by Niche:
              </span>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {niches.map((n) => (
                  <button
                    key={n.label}
                    onClick={() => {
                      setActiveNiche(n.label);
                      setMatchScore(n.score);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeNiche === n.label
                        ? 'bg-kpugi-blue text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Radial Compatibility Gauge */}
          <div className="md:col-span-5 flex items-center justify-center py-4">
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-white/10"
                  strokeWidth="6.5"
                  fill="none"
                />
                {/* Dynamic Progress Arc */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#3B82F6"
                  strokeWidth="6.5"
                  strokeDasharray={strokeDash}
                  animate={{ strokeDashoffset: strokeOffset }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Ring Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <div className="flex items-baseline gap-0.5">
                  <motion.span
                    key={matchScore}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-display font-black text-slate-900 dark:text-white text-5xl sm:text-6xl tracking-tight"
                  >
                    {matchScore}
                  </motion.span>
                  <span className="font-sans font-bold text-slate-900 dark:text-white text-2xl">%</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-1">
                  COMPATIBILITY
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillar Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-white/10 text-left">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-kpugi-blue dark:text-blue-400 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Audience Niche Vectors
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Matches your historical engagement style with brand demographic requirements.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Higher CPM Allocations
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                High-match creators receive priority access to premium drops paying up to ₦12,000/1k.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Instant Slot Claiming
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Skip tedious pitch decks. Lock campaign slots instantly with one click.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
