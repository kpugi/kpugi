'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IoMegaphone,
  IoPerson,
  IoMail,
  IoBusiness,
  IoWallet,
  IoTime,
  IoArrowForward,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoPhonePortrait,
  IoDesktop,
  IoApps,
  IoMailOpen,
  IoLayers,
  IoCheckmark,
  IoChevronForward,
} from 'react-icons/io5';
import {
  FaCreditCard,
  FaCamera,
  FaLaptopCode,
  FaBriefcase,
  FaTicket,
  FaStore,
} from 'react-icons/fa6';
import { submitBannerAdInquiryAction, BannerAdInquiryInput } from '@/app/actions/advertise';
import { Pricing2, type PricingTier } from '@/components/marketing/PricingTable';
import Features1 from '@/components/marketing/Features1';

interface AdPlacementSpec {
  id: string;
  name: string;
  dimensions: string;
  location: string;
  audienceFocus: string;
  viewability: string;
  supportedFormats: string;
  previewAspect: string;
  description: string;
}

const PLACEMENT_SPECS: AdPlacementSpec[] = [
  {
    id: 'billboard',
    name: 'Leaderboard & Billboard',
    dimensions: '970x250 / 728x90',
    location: 'Top of Campaign Catalogue (/browse) & Dashboard Headers',
    audienceFocus: 'Creators & Brand Founders',
    viewability: '98% Above the Fold',
    supportedFormats: 'PNG, JPG, WebP, Animated GIF (max 250KB)',
    previewAspect: 'aspect-[970/250]',
    description:
      'Our most prominent desktop display placement. Occupies prime real estate across the main campaign catalog and creator workspace where users start their daily session.',
  },
  {
    id: 'mpu',
    name: 'Medium Rectangle (MPU)',
    dimensions: '300x250 / 336x280',
    location: 'Campaign Feed Inline, Post Clock-In Screens & Right Panels',
    audienceFocus: 'High-Intent Creators & Advertisers',
    viewability: '94% In-Content Feed',
    supportedFormats: 'PNG, JPG, WebP, Animated GIF (max 150KB)',
    previewAspect: 'aspect-[300/250]',
    description:
      'The industry standard high-CTR unit. Natively embedded between campaign cards and verification status screens, capturing maximum reader focus during active tasks.',
  },
  {
    id: 'skyscraper',
    name: 'Half-Page / Skyscraper',
    dimensions: '300x600',
    location: 'Desktop Dashboard Sticky Sidebar & Creator Analytics Panel',
    audienceFocus: 'Active Dashboard Users',
    viewability: '100% Persistent Sticky',
    supportedFormats: 'PNG, JPG, WebP, Animated GIF (max 300KB)',
    previewAspect: 'aspect-[300/600]',
    description:
      'A towering vertical billboard that stays persistently in view as users scroll through campaigns, wallet analytics, and submission tables. Ideal for rich product visuals.',
  },
  {
    id: 'mobile',
    name: 'Mobile Anchor & Feed Banner',
    dimensions: '320x50 / 320x100',
    location: 'Mobile Sticky Bottom Bar & Drawer Navigation Divides',
    audienceFocus: 'Mobile-First Creators (70%+ traffic)',
    viewability: '100% Fixed Screen Retention',
    supportedFormats: 'PNG, JPG, WebP (max 100KB)',
    previewAspect: 'aspect-[320/100]',
    description:
      'Optimized specifically for mobile screens where the vast majority of creators browse and submit content links. Delivers high brand recall without obstructing navigation.',
  },
  {
    id: 'newsletter',
    name: 'Newsletter & Payout Alert Sponsorship',
    dimensions: '600x200 Header + 50-Word Dedicated Blurb',
    location: 'Direct to Inbox: Weekly Friday Payouts & Drop Notifications',
    audienceFocus: '100% Verified Account Holders',
    viewability: '45%+ Industry-Leading Open Rate',
    supportedFormats: 'PNG, JPG (max 200KB) + Custom UTM Link',
    previewAspect: 'aspect-[600/200]',
    description:
      'Direct sponsor placement inside the most anticipated email in the African creator economy: the Friday Payout summary and real-time live drop notifications.',
  },
];

const TARGET_VERTICALS = [
  {
    icon: FaCreditCard,
    title: 'Fintech & Neobanks',
    description:
      'Creator USD cards, POS terminals, micro-finance, gig worker accounts, and business banking solutions.',
  },
  {
    icon: FaCamera,
    title: 'Gear & Electronics',
    description:
      'Smartphones, ring lights, professional microphones, DSLR cameras, monitors, and production tech.',
  },
  {
    icon: FaLaptopCode,
    title: 'Creative Software & AI Tools',
    description:
      'Video editing suites, AI scriptwriters, cloud storage, VPNs, sound design software, and digital assets.',
  },
  {
    icon: FaBriefcase,
    title: 'B2B & Growth Services',
    description:
      'CAC registration, corporate tax, accounting software, payment APIs, legal compliance, and office tools.',
  },
  {
    icon: FaTicket,
    title: 'Events, Summits & Conferences',
    description:
      'Creator masterclasses, music festivals, tech summits, awards, hackathons, and brand activations.',
  },
  {
    icon: FaStore,
    title: 'Consumer & Lifestyle Brands',
    description:
      'Telecoms, food & beverage, fashion, footwear, streaming platforms, and youth culture products.',
  },
];

export default function AdvertisePageClient() {
  const [selectedPlacement, setSelectedPlacement] = useState<AdPlacementSpec>(PLACEMENT_SPECS[0]);
  const [formData, setFormData] = useState<BannerAdInquiryInput>({
    fullName: '',
    email: '',
    company: '',
    placementFormat: 'Leaderboard / Billboard (970x250 / 728x90)',
    targetAudience: 'Both Audiences (Full Platform)',
    duration: '2 Weeks',
    budgetRange: '₦500,000 – ₦1,500,000',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const updateField = (field: keyof BannerAdInquiryInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await submitBannerAdInquiryAction(formData);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setFormData({
          fullName: '',
          email: '',
          company: '',
          placementFormat: 'Leaderboard / Billboard (970x250 / 728x90)',
          targetAudience: 'Both Audiences (Full Platform)',
          duration: '2 Weeks',
          budgetRange: '₦500,000 – ₦1,500,000',
          message: '',
        });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ─── 1. HERO SECTION (NO BADGES) ────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display leading-[1.08] tracking-tight text-slate-900 dark:text-white">
            Put Your Brand in Front of Nigeria’s Most Active{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              Creators & Businesses.
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-lg sm:text-xl sm:leading-relaxed max-w-3xl font-medium">
            Run direct on-platform display banners, dashboard takeovers, and newsletter sponsorships inside Kpugi. 
            Reach thousands of verified Nigerian influencers, founders, and media buyers with zero impression waste.
          </p>

          {/* Quick Action Navigation */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="#placements"
              className="px-6 py-3.5 rounded-full bg-[#2F49E8] hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center gap-2 group"
            >
              <IoDesktop className="size-4" />
              <span>Explore Ad Placements</span>
              <IoArrowForward className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href="#book"
              className="px-6 py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <IoMegaphone className="size-4 text-emerald-500" />
              <span>Book an Ad Flight</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 2. AUDIENCE DEMOGRAPHICS (FEATURES1 BENTO GRID) ────────────────── */}
      <section className="bg-white dark:bg-[#08090D] border-y border-slate-200/80 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Features1 />

          {/* Prime Verticals That Convert on Kpugi */}
          <div className="pb-16 sm:pb-24 border-t border-slate-200/60 dark:border-white/5 pt-12">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Target Verticals</span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
                Highest-Converting Categories on the Kpugi Network
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TARGET_VERTICALS.map((vertical, idx) => {
                const Icon = vertical.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-slate-50 dark:bg-[#0E111C] border border-slate-200/80 dark:border-white/5 space-y-3 shadow-sm hover:border-blue-500/30 transition-all"
                  >
                    <div className="size-12 rounded-2xl bg-blue-500/10 text-[#2F49E8] dark:text-blue-400 flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                      {vertical.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {vertical.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ─── 3. INTERACTIVE BANNER VISUALIZER & IAB SPECIFICATIONS ───────────── */}
      <section id="placements" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            Standard Display Placements & Ad Formats
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg">
            Choose from standard IAB sizes integrated natively into high-traffic pages across the Kpugi ecosystem.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {PLACEMENT_SPECS.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedPlacement(spec)}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                selectedPlacement.id === spec.id
                  ? 'bg-[#2F49E8] text-white border-[#2F49E8] shadow-md'
                  : 'bg-white dark:bg-[#0E111C] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-500/50'
              }`}
            >
              <span>{spec.name}</span>
              <span className="text-[11px] opacity-75 font-mono">({spec.dimensions.split(' ')[0]})</span>
            </button>
          ))}
        </div>

        {/* Visualizer Display Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Visual Canvas (7 Columns) */}
          <div className="lg:col-span-7 bg-slate-100 dark:bg-[#07090F] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[380px] shadow-inner relative overflow-hidden">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-4">
              Live Mock Simulation • {selectedPlacement.dimensions}
            </div>

            {/* Banner Canvas Container */}
            <div className="w-full max-w-xl flex items-center justify-center p-4 border border-dashed border-slate-300 dark:border-white/20 rounded-2xl bg-white/50 dark:bg-white/[0.02]">
              <div
                className={`w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 relative overflow-hidden group ${
                  selectedPlacement.id === 'billboard'
                    ? 'h-36 sm:h-44'
                    : selectedPlacement.id === 'mpu'
                    ? 'h-64 sm:h-72 max-w-[300px]'
                    : selectedPlacement.id === 'skyscraper'
                    ? 'h-80 sm:h-96 max-w-[280px]'
                    : selectedPlacement.id === 'mobile'
                    ? 'h-24 max-w-md'
                    : 'h-40 sm:h-48'
                }`}
              >
                {/* Visual grid watermark */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                
                <span className="px-2 py-0.5 rounded bg-black/30 text-[10px] font-mono uppercase tracking-widest text-white/90 mb-2">
                  Sponsored • {selectedPlacement.dimensions.split(' ')[0]}
                </span>
                <h4 className="text-base sm:text-xl font-bold font-display tracking-tight text-white mb-1">
                  Your High-Impact Ad Banner Here
                </h4>
                <p className="text-xs text-white/80 max-w-xs line-clamp-2">
                  Target verified creators & business owners across Nigeria.
                </p>
                <div className="mt-3 px-3 py-1 rounded-full bg-white text-[#2F49E8] text-xs font-bold shadow">
                  Click to Learn More →
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500 font-medium">
              Location: {selectedPlacement.location}
            </div>
          </div>

          {/* Specs Details Card (5 Columns) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Unit Specifications</span>
              <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
                {selectedPlacement.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {selectedPlacement.description}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/10 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Standard Dimensions:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedPlacement.dimensions}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Target Audience Focus:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedPlacement.audienceFocus}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Expected Viewability:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedPlacement.viewability}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Accepted Assets:</span>
                <span className="text-right text-slate-700 dark:text-slate-300">{selectedPlacement.supportedFormats}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="#book"
                onClick={() => updateField('placementFormat', selectedPlacement.name)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#2F49E8] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),inset_0_-1px_0_0_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2"
              >
                <span>Request {selectedPlacement.name} Flight</span>
                <IoArrowForward className="size-3.5" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 4. SPONSORSHIP PACKAGES (PRICING2 COMPONENT) ──────────────────── */}
      <div id="pricing">
        <Pricing2
          title="Placement Flight Packages"
          subtitle="Transparent pricing for display banners, takeovers, and email sponsorships. No hidden platform markups."
          yearlyLabel="Pay Quarterly (Save 20%)"
          monthlyLabel="Pay Monthly"
          discountText="Save 20%"
          tiers={[
            {
              id: 'tier-essential',
              name: 'Starter Drop',
              monthlyPrice: '₦150k',
              yearlyPrice: '₦120k',
              priceUnit: 'Week',
              buttonText: 'Select Starter Drop',
              features: [
                { name: '1x Medium Rectangle (300x250)' },
                { name: 'Native in-feed placement on /browse' },
                { name: 'Real-time impression & click analytics' },
                { name: 'Standard UTM link attribution' },
              ],
              onSelect: () => {
                updateField('placementFormat', 'Medium Rectangle (MPU)');
                updateField('duration', '1 Week');
                updateField('budgetRange', 'Under ₦500,000');
                const el = document.getElementById('book');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              },
            },
            {
              id: 'tier-professional',
              name: 'Billboard Flight',
              monthlyPrice: '₦500k',
              yearlyPrice: '₦400k',
              priceUnit: '2 Weeks',
              buttonText: 'Select Billboard Drop',
              features: [
                { name: '1x Leaderboard (970x250 / 728x90)' },
                { name: '1x Mobile Sticky Banner (320x50)' },
                { name: '50%+ Above-the-fold Share of Voice' },
                { name: 'Weekly verified analytics breakdown' },
              ],
              onSelect: () => {
                updateField('placementFormat', 'Leaderboard / Billboard (970x250 / 728x90)');
                updateField('duration', '2 Weeks');
                updateField('budgetRange', '₦500,000 – ₦1,500,000');
                const el = document.getElementById('book');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              },
            },
            {
              id: 'tier-business',
              name: 'Complete Takeover',
              monthlyPrice: '₦1.5M',
              yearlyPrice: '₦1.2M',
              priceUnit: 'Month',
              buttonText: 'Select Complete Takeover',
              isHighlighted: true,
              features: [
                { name: 'Full Display Bundle (Billboard + MPU + Skyscraper)' },
                { name: 'Dedicated Friday Payout newsletter sponsorship' },
                { name: '1x Pinned "Featured Sponsor" in catalogue' },
                { name: '100% Category Share of Voice' },
                { name: 'Priority Ad Operations support' },
              ],
              onSelect: () => {
                updateField('placementFormat', 'Full Platform Takeover');
                updateField('duration', '1 Month');
                updateField('budgetRange', '₦1,500,000 – ₦5,000,000');
                const el = document.getElementById('book');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              },
            },
            {
              id: 'tier-enterprise',
              name: 'Enterprise Network',
              monthlyPrice: 'Custom',
              yearlyPrice: 'Custom',
              priceUnit: '',
              buttonText: 'Contact Ad Sales Team',
              features: [
                { name: 'Custom multi-channel banner & email campaigns' },
                { name: 'Instant Drop Alert email blast sponsor' },
                { name: 'Custom A/B creative testing & 3rd-party tags' },
                { name: 'Dedicated Ad Operations account director' },
                { name: 'Custom SLA & invoicing agreements' },
              ],
              onSelect: () => {
                updateField('placementFormat', 'Custom Enterprise Package');
                updateField('duration', 'Ongoing Flight');
                updateField('budgetRange', '₦5,000,000+');
                const el = document.getElementById('book');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              },
            },
          ]}
        />
      </div>

      {/* ─── 5. DIRECT BOOKING & PLACEMENT INQUIRY FORM (USER'S 5-COL LAYOUT) ─ */}
      <section id="book" className="w-full py-16 sm:py-24 text-slate-900 dark:text-white transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12 max-w-2xl">
            <h2 className="text-slate-900 dark:text-white text-3xl font-extrabold font-display tracking-tight sm:text-4xl md:text-5xl">
              Book an On-Platform Ad Flight
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
              Tell us about your brand, target timeline, and preferred banner placements. Our ad operations team will review inventory availability and respond within 24 hours.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            
            {/* Left Form (3 Columns) */}
            <div className="lg:col-span-3">
              {statusMessage && (
                <div
                  className={`mb-8 p-5 rounded-2xl border flex items-start gap-3.5 text-sm ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <IoCheckmarkCircle className="size-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <IoAlertCircle className="size-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  )}
                  <div>
                    <strong className="font-bold block mb-0.5">
                      {statusMessage.type === 'success' ? 'Placement Request Submitted' : 'Notice'}
                    </strong>
                    <span>{statusMessage.text}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="adFullName" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Contact Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <IoPerson className="text-slate-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                      <input
                        id="adFullName"
                        required
                        placeholder="Emeka Nwosu"
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="adEmail" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Work Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <IoMail className="text-slate-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                      <input
                        id="adEmail"
                        type="email"
                        required
                        placeholder="emeka@company.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all"
                      />
                    </div>
                  </div>

                  {/* Company / Brand Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="adCompany" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Company / Brand Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <IoBusiness className="text-slate-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                      <input
                        id="adCompany"
                        required
                        placeholder="FinTech Pro or CreativeGear Ltd"
                        value={formData.company}
                        onChange={(e) => updateField('company', e.target.value)}
                        className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all"
                      />
                    </div>
                  </div>

                  {/* Placement Format */}
                  <div className="space-y-1.5">
                    <label htmlFor="placementFormat" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Requested Placement Format
                    </label>
                    <div className="relative">
                      <IoMegaphone className="text-slate-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 pointer-events-none" />
                      <select
                        id="placementFormat"
                        value={formData.placementFormat}
                        onChange={(e) => updateField('placementFormat', e.target.value)}
                        className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
                      >
                        <option value="Leaderboard / Billboard (970x250 / 728x90)">Leaderboard & Billboard (970x250 / 728x90)</option>
                        <option value="Medium Rectangle MPU (300x250)">Medium Rectangle MPU (300x250)</option>
                        <option value="Half-Page / Skyscraper (300x600)">Half-Page / Skyscraper (300x600)</option>
                        <option value="Mobile Sticky Banner (320x50)">Mobile Sticky Banner (320x50)</option>
                        <option value="Newsletter & Payout Alert Sponsorship">Newsletter & Payout Alert Sponsorship</option>
                        <option value="Full Platform Takeover Bundle">Full Platform Takeover Bundle</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-1.5">
                    <label htmlFor="targetAudience" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Primary Target Audience
                    </label>
                    <select
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => updateField('targetAudience', e.target.value)}
                      className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
                    >
                      <option value="Creators & Influencers (65%)">Creators & Influencers (65%)</option>
                      <option value="Brands & Founders (35%)">Brands & Founders (35%)</option>
                      <option value="Both Audiences (Full Platform)">Both Audiences (Full Platform)</option>
                    </select>
                  </div>

                  {/* Flight Duration */}
                  <div className="space-y-1.5">
                    <label htmlFor="duration" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Campaign Flight Duration
                    </label>
                    <div className="relative">
                      <IoTime className="text-slate-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 pointer-events-none" />
                      <select
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => updateField('duration', e.target.value)}
                        className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
                      >
                        <option value="1 Week Trial">1 Week Trial Flight</option>
                        <option value="2 Weeks">2 Weeks</option>
                        <option value="1 Month">1 Month</option>
                        <option value="Quarterly Sponsor (3 Months)">Quarterly Sponsor (3 Months)</option>
                      </select>
                    </div>
                  </div>

                  {/* Budget Tier */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="budgetRange" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Planned Budget Range
                    </label>
                    <div className="relative">
                      <IoWallet className="text-slate-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 pointer-events-none" />
                      <select
                        id="budgetRange"
                        value={formData.budgetRange}
                        onChange={(e) => updateField('budgetRange', e.target.value)}
                        className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
                      >
                        <option value="₦150,000 – ₦500,000">₦150,000 – ₦500,000 (Starter Drop)</option>
                        <option value="₦500,000 – ₦1,500,000">₦500,000 – ₦1,500,000 (Growth Billboard)</option>
                        <option value="₦1,500,000 – ₦3,000,000">₦1,500,000 – ₦3,000,000 (Multi-Placement Bundle)</option>
                        <option value="₦3,000,000+ (Institutional Takeover)">₦3,000,000+ (Full Platform Takeover)</option>
                      </select>
                    </div>
                  </div>

                  {/* Creative Notes */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="adMessage" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Campaign Goals & Creative Asset Notes
                    </label>
                    <textarea
                      id="adMessage"
                      rows={5}
                      placeholder="Tell us about the product or service you are promoting, your preferred start date, target landing page URL, or any specific requirements..."
                      value={formData.message}
                      onChange={(e) => updateField('message', e.target.value)}
                      className="w-full bg-slate-100/90 dark:bg-[#121624] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 p-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-32 resize-none shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-xl bg-[#2F49E8] hover:bg-blue-600 disabled:opacity-60 text-white font-bold text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),inset_0_-1px_0_0_rgba(0,0,0,0.2)] transition-all flex items-center gap-2 group"
                >
                  <span>{isSubmitting ? 'Submitting Request...' : 'Submit Placement Request'}</span>
                  <IoArrowForward className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            {/* Right Sticky Sidebar (2 Columns) */}
            <div className="lg:col-span-2">
              <div className="sticky top-28 space-y-6">
                {/* Card 1 */}
                <div className="bg-white dark:bg-[#0B0D14] rounded-3xl border border-slate-200/80 dark:border-white/10 p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)]">
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-4">
                    Why advertise on Kpugi?
                  </h3>
                  <ul className="space-y-4">
                    {[
                      '100% Verified Commercial Audience',
                      'High-frequency daily returning creators',
                      'Zero bot waste & authentic viewability',
                      'Dedicated click & UTM analytics reports',
                    ].map((item, index) => (
                      <li key={index} className="text-slate-600 dark:text-slate-400 text-sm flex items-start gap-3">
                        <span className="bg-[#2F49E8] mt-2 h-2 w-2 shrink-0 rounded-full" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 2 */}
                <div className="bg-[#2F49E8] text-white rounded-3xl p-7 relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),inset_0_-1px_0_0_rgba(0,0,0,0.3)] shadow-xl">
                  <div className="bg-white/10 absolute -top-8 -right-8 h-32 w-32 rounded-full blur-xl pointer-events-none" />
                  <div className="bg-white/10 absolute -bottom-8 -left-8 h-24 w-24 rounded-full blur-xl pointer-events-none" />
                  
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                    Turnaround SLA
                  </h4>
                  <p className="text-3xl font-extrabold font-display">Within 24 hours</p>
                  <p className="mt-3 text-xs sm:text-sm text-white/85 leading-relaxed">
                    Our ad operations desk reviews creative assets, sets up tracking tags, and coordinates flight launch dates directly with your team.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 6. TECHNICAL GUIDELINES & SPECIFICATION SHEET ──────────────────── */}
      <section className="py-16 bg-slate-50 dark:bg-[#07090F] border-t border-slate-200/80 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
              Creative Guidelines & Ad Ops Standards
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-xs sm:text-sm">
              We ensure all on-platform ads maintain high visual aesthetics and preserve rapid page load times for our users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Asset Delivery</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Provide static or animated files in PNG, JPG, or WebP. HTML5 safe bundles accepted with prior ad ops review. Max file size: 250KB for billboards, 150KB for MPU banners.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Tracking & Attribution</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Standard UTM tagging supported for Google Analytics, Mixpanel, and PostHog. Secure 3rd-party impression and click redirect tags supported upon request.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Content & Integrity</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                All advertising must comply with standard Nigerian advertising laws. Deceptive claims, unverified get-rich-quick schemes, and unlicenced financial scams are strictly rejected.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
