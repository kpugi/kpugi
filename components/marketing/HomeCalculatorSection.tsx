'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Coins,
  Eye,
  Users,
} from 'lucide-react';

export default function HomeCalculatorSection() {
  const [activeTab, setActiveTab] = useState<'creator' | 'brand'>('creator');

  // Creator state
  const [creatorViews, setCreatorViews] = useState<number>(50000);
  const [creatorCpm, setCreatorCpm] = useState<number>(2500);

  // Brand state
  const [brandBudget, setBrandBudget] = useState<number>(1000000);
  const [brandCpm, setBrandCpm] = useState<number>(2000);

  // Calculations
  const creatorEarnings = Math.round((creatorViews / 1000) * creatorCpm);
  const brandGuaranteedViews = Math.round((brandBudget / brandCpm) * 1000);
  const estimatedCreators = Math.max(5, Math.round(brandBudget / 60000));

  return (
    <section className="relative w-full py-20 md:py-28 overflow-hidden bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-[800px] h-[400px] pointer-events-none z-0
          bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(47,73,232,0.08)_0%,rgba(23,167,91,0.04)_50%,transparent_75%)]
          dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(47,73,232,0.18)_0%,rgba(23,167,91,0.08)_50%,transparent_75%)]"
      />

      <div className="container mx-auto max-w-5xl px-4 relative z-10">
        
        {/* Header */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          
          <h2 className="font-clash font-bold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] [text-wrap:balance]">
            Calculate your payouts or campaign reach
          </h2>
          <p className="font-satoshi text-slate-600 dark:text-white/50 text-sm sm:text-base mt-3 max-w-lg">
            See exactly how performance economics work on Kpugi with zero guesswork.
          </p>

          {/* Dual Tab Switcher */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <button
              onClick={() => setActiveTab('creator')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-satoshi transition-all duration-200 ${
                activeTab === 'creator'
                  ? 'bg-[#17A75B] text-white shadow-md shadow-[#17A75B]/25'
                  : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              For Creators (Earnings)
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-satoshi transition-all duration-200 ${
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
        <div className="bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl dark:shadow-none grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Sliders & Controls */}
          <div className="lg:col-span-7 space-y-8">
            
            {activeTab === 'creator' ? (
              <>
                {/* Views Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-clash font-semibold text-slate-800 dark:text-white text-sm sm:text-base flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#17A75B]" />
                      Estimated Video Views
                    </label>
                    <span className="font-clash font-bold text-lg sm:text-xl text-[#17A75B] dark:text-emerald-400">
                      {creatorViews.toLocaleString()} views
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={500000}
                    step={5000}
                    value={creatorViews}
                    onChange={(e) => setCreatorViews(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#17A75B]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 dark:text-white/30 font-satoshi mt-1.5">
                    <span>5k views</span>
                    <span>100k</span>
                    <span>250k</span>
                    <span>500k+ views</span>
                  </div>
                </div>

                {/* CPM Preset Selectors */}
                <div>
                  <label className="font-clash font-semibold text-slate-800 dark:text-white text-sm sm:text-base block mb-3">
                    Campaign Target CPM Rate
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {[1500, 2000, 2500, 3500].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setCreatorCpm(rate)}
                        className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold font-satoshi border transition-all ${
                          creatorCpm === rate
                            ? 'bg-[#17A75B]/10 border-[#17A75B] text-[#17A75B] dark:text-emerald-400 shadow-sm'
                            : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-white/70 hover:border-slate-300'
                        }`}
                      >
                        ₦{rate.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Creator Perks List */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-white/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Automated milestone releases every 1,000 verified views.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Direct payouts to any Nigerian commercial bank account.</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Brand Budget Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-clash font-semibold text-slate-800 dark:text-white text-sm sm:text-base flex items-center gap-2">
                      <Coins className="h-4 w-4 text-[#2F49E8]" />
                      Campaign Budget
                    </label>
                    <span className="font-clash font-bold text-lg sm:text-xl text-[#2F49E8] dark:text-[#5B7CFF]">
                      ₦{brandBudget.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={10000000}
                    step={100000}
                    value={brandBudget}
                    onChange={(e) => setBrandBudget(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2F49E8]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 dark:text-white/30 font-satoshi mt-1.5">
                    <span>₦100k</span>
                    <span>₦2.5M</span>
                    <span>₦5M</span>
                    <span>₦10M+</span>
                  </div>
                </div>

                {/* Brand CPM Preset Selectors */}
                <div>
                  <label className="font-clash font-semibold text-slate-800 dark:text-white text-sm sm:text-base block mb-3">
                    Target CPM Cap Rate
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {[1500, 2000, 2500, 3000].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setBrandCpm(rate)}
                        className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold font-satoshi border transition-all ${
                          brandCpm === rate
                            ? 'bg-[#2F49E8]/10 border-[#2F49E8] text-[#2F49E8] dark:text-[#5B7CFF] shadow-sm'
                            : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-white/70 hover:border-slate-300'
                        }`}
                      >
                        ₦{rate.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Perks List */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-white/60">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#2F49E8] shrink-0" />
                    <span>Zero upfront risk — only pay for audited human view impressions.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#2F49E8] shrink-0" />
                    <span>Unspent campaign budget automatically returned to your balance.</span>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Right Column: Dynamic Result Card */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-[#121726] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full relative overflow-hidden">
            
            {/* Ambient accent highlight */}
            <div
              aria-hidden
              className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
                activeTab === 'creator' ? 'bg-emerald-500/20' : 'bg-[#2F49E8]/25'
              }`}
            />

            <div>
              <span className="text-xs uppercase tracking-widest font-bold font-satoshi text-slate-500 dark:text-white/40 block mb-2">
                {activeTab === 'creator' ? 'Estimated Payout' : 'Guaranteed Delivery'}
              </span>

              <div className="font-clash font-extrabold text-3xl sm:text-4xl md:text-5xl text-slate-900 dark:text-white tracking-tight">
                {activeTab === 'creator'
                  ? `₦${creatorEarnings.toLocaleString()}`
                  : `${brandGuaranteedViews.toLocaleString()} Views`}
              </div>

              <p className="font-satoshi text-xs sm:text-sm text-slate-600 dark:text-white/60 mt-3 leading-relaxed">
                {activeTab === 'creator'
                  ? `Based on ${creatorViews.toLocaleString()} verified views at ₦${creatorCpm.toLocaleString()} CPM rate across your social channels.`
                  : `Delivering ~${brandGuaranteedViews.toLocaleString()} audited impressions with ~${estimatedCreators} creators amplifying across 6 channels.`}
              </p>

              {/* Sub-Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-white/40 block">
                    {activeTab === 'creator' ? 'Payout Frequency' : 'Channel Breadth'}
                  </span>
                  <span className="font-clash font-bold text-sm text-slate-800 dark:text-white">
                    {activeTab === 'creator' ? 'Instant / Milestone' : '6 Social Networks'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-white/40 block">
                    {activeTab === 'creator' ? 'Settlement Type' : 'Budget Protection'}
                  </span>
                  <span className="font-clash font-bold text-sm text-slate-800 dark:text-white">
                    {activeTab === 'creator' ? 'Direct Bank Alert' : '100% Verified Only'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8">
              {activeTab === 'creator' ? (
                <Link
                  href="/creators"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#17A75B] text-white font-satoshi font-bold text-sm shadow-lg shadow-[#17A75B]/25 hover:scale-[1.02] transition-transform"
                >
                  <span>Start Earning as a Creator</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/brands"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#2F49E8] text-white font-satoshi font-bold text-sm shadow-lg shadow-[#2F49E8]/25 hover:scale-[1.02] transition-transform"
                >
                  <span>Launch a Performance Campaign</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
