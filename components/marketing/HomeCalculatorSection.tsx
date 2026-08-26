'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Coins,
  Eye,
  UserPlus,
  HelpCircle,
  FileText,
  Plus,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Non-linear mapping for Creator Views (5k -> 100k -> 250k -> 500k)
function mapSliderToViews(val: number): number {
  if (val <= 100) {
    const raw = 5000 + (val / 100) * (100000 - 5000);
    return Math.round(raw / 5000) * 5000;
  } else if (val <= 200) {
    const raw = 100000 + ((val - 100) / 100) * (250000 - 100000);
    return Math.round(raw / 10000) * 10000;
  } else {
    const raw = 250000 + ((val - 200) / 100) * (500000 - 250000);
    return Math.round(raw / 25000) * 25000;
  }
}

function mapViewsToSlider(views: number): number {
  if (views <= 100000) {
    return ((views - 5000) / (100000 - 5000)) * 100;
  } else if (views <= 250000) {
    return 100 + ((views - 100000) / (250000 - 100000)) * 100;
  } else {
    return 200 + ((views - 250000) / (500000 - 250000)) * 100;
  }
}

// Non-linear mapping for Brand Budget (100k -> 2.5M -> 5M -> 10M)
function mapSliderToBudget(val: number): number {
  if (val <= 100) {
    const raw = 100000 + (val / 100) * (2500000 - 100000);
    return Math.round(raw / 100000) * 100000;
  } else if (val <= 200) {
    const raw = 2500000 + ((val - 100) / 100) * (5000000 - 2500000);
    return Math.round(raw / 250000) * 250000;
  } else {
    const raw = 5000000 + ((val - 200) / 100) * (10000000 - 5000000);
    return Math.round(raw / 500000) * 500000;
  }
}

function mapBudgetToSlider(budget: number): number {
  if (budget <= 2500000) {
    return ((budget - 100000) / (2500000 - 100000)) * 100;
  } else if (budget <= 5000000) {
    return 100 + ((budget - 2500000) / (5000000 - 2500000)) * 100;
  } else {
    return 200 + ((budget - 5000000) / (10000000 - 5000000)) * 100;
  }
}

export default function HomeCalculatorSection() {
  const [activeTab, setActiveTab] = useState<'creator' | 'brand'>('creator');

  // Creator state
  const [creatorViews, setCreatorViews] = useState<number>(100000); // 100k aligned default
  const [creatorCpm, setCreatorCpm] = useState<number>(2000);

  // Brand state
  const [brandBudget, setBrandBudget] = useState<number>(2500000); // 2.5M aligned default
  const [brandCpm, setBrandCpm] = useState<number>(2000);

  // Calculations
  const creatorEarnings = Math.round((creatorViews / 1000) * creatorCpm);
  const brandGuaranteedViews = Math.round((brandBudget / brandCpm) * 1000);
  const estimatedCreators = Math.max(5, Math.round(brandBudget / 60000));

  // Action configurations based on active tab
  const creatorActions = [
    { label: 'Register', icon: UserPlus, href: '/sign-up' },
    { label: 'How it Works', icon: HelpCircle, href: '#how-it-works' },
    { label: 'Creator Specs', icon: FileText, href: '/creators' },
  ];

  const brandActions = [
    { label: 'Launch Ad', icon: Plus, href: '/brands' },
    { label: 'Case Studies', icon: TrendingUp, href: '#case-studies' },
    { label: 'Guarantees', icon: ShieldCheck, href: '/brands' },
  ];

  const currentActions = activeTab === 'creator' ? creatorActions : brandActions;

  return (
    <section className="relative w-full py-20 md:py-28 overflow-hidden bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
      
      {/* Animated Ambient Lighting Orbs */}
      <div
        aria-hidden
        className={`absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full filter blur-[100px] pointer-events-none opacity-50 dark:opacity-40 animate-ambient-glow transition-colors duration-500 ${
          activeTab === 'creator' ? 'bg-[#17A75B]/20' : 'bg-[#2F49E8]/20'
        }`}
      />
      <div
        aria-hidden
        className={`absolute top-1/3 left-3/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full filter blur-[80px] pointer-events-none opacity-40 dark:opacity-30 animate-ambient-glow [animation-delay:2s] transition-colors duration-500 ${
          activeTab === 'creator' ? 'bg-[#17A75B]/15' : 'bg-[#2F49E8]/15'
        }`}
      />

      <div className="container mx-auto max-w-5xl px-4 relative z-10">
        
        {/* Header */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          <h2 className="font-display font-bold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] [text-wrap:balance]">
            Calculate your payouts or campaign reach
          </h2>
          <p className="font-sans text-slate-600 dark:text-white/50 text-sm sm:text-base mt-3 max-w-lg">
            See exactly how performance economics work on Kpugi with zero guesswork.
          </p>

          {/* Dual Tab Switcher */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-white/70 dark:bg-[#0E121E]/70 backdrop-blur-md border border-slate-200/50 dark:border-white/[0.08] shadow-sm">
            <button
              onClick={() => setActiveTab('creator')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-sans transition-all duration-200 ${
                activeTab === 'creator'
                  ? 'bg-[#17A75B] text-white shadow-md shadow-[#17A75B]/25'
                  : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              For Creators (Earnings)
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-sans transition-all duration-200 ${
                activeTab === 'brand'
                  ? 'bg-[#2F49E8] text-white shadow-md shadow-[#2F49E8]/25'
                  : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              For Brands (Reach & Budget)
            </button>
          </div>
        </div>

        {/* Calculator Interactive Box */}
        <div
          className={`backdrop-blur-xl bg-white/60 dark:bg-[#0c0e17]/50 border border-slate-200/60 dark:border-white/[0.08] rounded-[2.5rem] p-6 sm:p-10 md:p-12 transition-all duration-500 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch ${
            activeTab === 'creator' ? 'animate-card-breathe-creator' : 'animate-card-breathe-brand'
          }`}
        >
          
          {/* Left Column: Sliders & Controls */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            
            {activeTab === 'creator' ? (
              <>
                {/* Views Slider */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="font-display font-semibold text-slate-800 dark:text-white text-sm sm:text-base flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#17A75B]" />
                      Estimated Video Views
                    </label>
                    <span className="font-mono font-bold text-lg sm:text-xl text-[#17A75B] dark:text-emerald-400 tabular-nums">
                      {creatorViews.toLocaleString()} views
                    </span>
                  </div>
                  <div className="relative py-2">
                    <input
                      type="range"
                      min={0}
                      max={300}
                      step={1}
                      value={mapViewsToSlider(creatorViews)}
                      onChange={(e) => setCreatorViews(mapSliderToViews(Number(e.target.value)))}
                      className="w-full h-2 bg-slate-200/70 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#17A75B] transition-all"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 dark:text-white/30 font-sans mt-2 px-1">
                    <span className={creatorViews === 5000 ? "text-[#17A75B] font-bold" : ""}>5k views</span>
                    <span className={creatorViews === 100000 ? "text-[#17A75B] font-bold" : ""}>100k</span>
                    <span className={creatorViews === 250000 ? "text-[#17A75B] font-bold" : ""}>250k</span>
                    <span className={creatorViews === 500000 ? "text-[#17A75B] font-bold" : ""}>500k+ views</span>
                  </div>
                </div>

                {/* CPM Preset Selectors */}
                <div>
                  <label className="font-display font-semibold text-slate-800 dark:text-white text-sm sm:text-base block mb-4">
                    Campaign Target CPM Rate
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[2000, 2500, 3500].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setCreatorCpm(rate)}
                        className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-bold font-sans border transition-all duration-200 ${
                          creatorCpm === rate
                            ? 'bg-[#17A75B]/10 border-[#17A75B] text-[#17A75B] dark:text-emerald-400 shadow-sm scale-[1.02]'
                            : 'bg-white/40 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/[0.06] text-slate-700 dark:text-white/70 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        ₦{rate.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Creator Perks List */}
                <div className="space-y-3 pt-6 border-t border-slate-200/50 dark:border-white/5 text-xs text-slate-600 dark:text-white/60">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Automated milestone releases every 1,000 verified views.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Direct payouts to any Nigerian commercial bank account.</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Brand Budget Slider */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="font-display font-semibold text-slate-800 dark:text-white text-sm sm:text-base flex items-center gap-2">
                      <Coins className="h-4 w-4 text-[#2F49E8]" />
                      Campaign Budget
                    </label>
                    <span className="font-mono font-bold text-lg sm:text-xl text-[#2F49E8] dark:text-[#5B7CFF] tabular-nums">
                      ₦{brandBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative py-2">
                    <input
                      type="range"
                      min={0}
                      max={300}
                      step={1}
                      value={mapBudgetToSlider(brandBudget)}
                      onChange={(e) => setBrandBudget(mapSliderToBudget(Number(e.target.value)))}
                      className="w-full h-2 bg-slate-200/70 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2F49E8] transition-all"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 dark:text-white/30 font-sans mt-2 px-1">
                    <span className={brandBudget === 100000 ? "text-[#2F49E8] font-bold" : ""}>₦100k</span>
                    <span className={brandBudget === 2500000 ? "text-[#2F49E8] font-bold" : ""}>₦2.5M</span>
                    <span className={brandBudget === 5000000 ? "text-[#2F49E8] font-bold" : ""}>₦5M</span>
                    <span className={brandBudget === 10000000 ? "text-[#2F49E8] font-bold" : ""}>₦10M+</span>
                  </div>
                </div>

                {/* Brand CPM Preset Selectors */}
                <div>
                  <label className="font-display font-semibold text-slate-800 dark:text-white text-sm sm:text-base block mb-4">
                    Target CPM Cap Rate
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[2000, 2500, 3000].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setBrandCpm(rate)}
                        className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-bold font-sans border transition-all duration-200 ${
                          brandCpm === rate
                            ? 'bg-[#2F49E8]/10 border-[#2F49E8] text-[#2F49E8] dark:text-[#5B7CFF] shadow-sm scale-[1.02]'
                            : 'bg-white/40 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/[0.06] text-slate-700 dark:text-white/70 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        ₦{rate.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Perks List */}
                <div className="space-y-3 pt-6 border-t border-slate-200/50 dark:border-white/5 text-xs text-slate-600 dark:text-white/60">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-[#2F49E8] shrink-0" />
                    <span>Zero upfront risk — only pay for audited human view impressions.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-[#2F49E8] shrink-0" />
                    <span>Unspent campaign budget automatically returned to your balance.</span>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Right Column: Dynamic Glass Result Card Widget */}
          <div className="lg:col-span-5 bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.06] w-full rounded-[3rem] p-2.5 shadow-sm flex flex-col justify-between">
            
            {/* Top White Card */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-white dark:bg-[#121624] border border-slate-200/50 dark:border-white/[0.08] rounded-[2.5rem] p-8 pb-10 shadow-sm overflow-hidden relative flex-1 flex flex-col justify-between"
            >
              {/* Internal decorative highlight */}
              <div
                aria-hidden
                className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
                  activeTab === 'creator' ? 'bg-emerald-500/10' : 'bg-[#2F49E8]/15'
                }`}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="h-full flex flex-col justify-between flex-1"
                >
                  <div>
                    <div className="mb-8 flex items-center justify-between">
                      <span className="text-slate-500 dark:text-white/40 text-[13px] font-bold uppercase tracking-widest animate-fade-in">
                        {activeTab === 'creator' ? 'Estimated Payout' : 'Guaranteed Delivery'}
                      </span>
                     
                    </div>

                    <div className="flex items-end justify-between mb-4">
                      <div className="flex flex-col">
                        <div className="text-slate-900 dark:text-white text-4xl sm:text-5xl font-bold tracking-tight">
                          {activeTab === 'creator' ? (
                            <>
                              <span className="text-2xl font-sans font-bold text-slate-500 mr-0.5">₦</span>
                              <span className="font-mono tabular-nums">{creatorEarnings.toLocaleString()}</span>
                            </>
                          ) : (
                            <span className="font-mono tabular-nums">{brandGuaranteedViews.toLocaleString()}</span>
                          )}
                        </div>
                        {activeTab === 'brand' && (
                          <span className="flex items-center gap-1 text-[11px] font-sans font-semibold text-slate-400 dark:text-white/40 mt-1.5 uppercase tracking-widest">
                            <Eye className="h-3 w-3" />
                            Impressions
                          </span>
                        )}
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <ArrowUpRight className="h-7 w-7" strokeWidth={2.5} />
                      </button>
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-white/60 leading-relaxed pt-2">
                      {activeTab === 'creator'
                        ? `Based on ${creatorViews.toLocaleString()} verified views at ₦${creatorCpm.toLocaleString()} CPM rate across your social channels.`
                        : `Delivering ~${brandGuaranteedViews.toLocaleString()} audited impressions with ~${estimatedCreators} creators amplifying across 6 channels.`}
                    </p>

                    {/* Sub-Metrics Grid (Brand Only - Creator Payout/Settlement removed as requested) */}
                    {activeTab === 'brand' && (
                      <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-200/50 dark:border-white/10">
                        <div>
                          <span className="text-[11px] text-slate-400 dark:text-white/40 block">
                            Channel Breadth
                          </span>
                          <span className="font-display font-bold text-xs text-slate-800 dark:text-white">
                            6 Social Networks
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 dark:text-white/40 block">
                            Budget Protection
                          </span>
                          <span className="font-display font-bold text-xs text-slate-800 dark:text-white">
                            100% Verified Only
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary CTA button inside top card */}
                  <div className="mt-8">
                    {activeTab === 'creator' ? (
                      <Link
                        href="/creators"
                        className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#17A75B] text-white font-sans font-bold text-sm shadow-lg shadow-[#17A75B]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      >
                        <span>Start Earning</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <Link
                        href="/brands"
                        className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#2F49E8] text-white font-sans font-bold text-sm shadow-lg shadow-[#2F49E8]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      >
                        <span>Launch Campaign</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2 py-4">
              {['creator', 'brand'].map((tab, idx) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'creator' | 'brand')}
                  className="relative flex h-4 cursor-pointer items-center justify-center"
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <motion.div
                    layout
                    className={`rounded-full ${
                      (activeTab === 'creator' && idx === 0) || (activeTab === 'brand' && idx === 1)
                        ? 'bg-slate-900/50 dark:bg-white/40 h-1.5 w-5'
                        : 'bg-slate-900/20 dark:bg-white/20 h-1.5 w-1.5'
                    }`}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </button>
              ))}
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-3 gap-2 px-2 pt-1 pb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="col-span-3 grid grid-cols-3 gap-2"
                >
                  {currentActions.map((action, i) => (
                    <Link
                      href={action.href}
                      key={i}
                      className="group flex flex-col items-center gap-2 cursor-pointer"
                    >
                      <motion.div
                        whileTap={{ scale: 0.92 }}
                        className="bg-white dark:bg-[#121624] border border-slate-200/50 dark:border-white/[0.08] text-slate-800 dark:text-white group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#0c0e17] flex h-14 w-14 items-center justify-center rounded-full border shadow-sm transition-all duration-300"
                      >
                        <action.icon className="h-6 w-6" strokeWidth={2} />
                      </motion.div>
                      <span className="text-slate-500 dark:text-white/60 group-hover:text-slate-900 dark:group-hover:text-white text-[12px] font-medium transition-colors text-center truncate w-full px-1">
                        {action.label}
                      </span>
                    </Link>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
