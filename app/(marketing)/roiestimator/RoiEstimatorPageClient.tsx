'use client';

import React, { useState } from 'react';
import BrandRoiCalculator from '@/components/calculator/BrandRoiCalculator';
import { 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  UploadCloud, 
  Layers, 
  ChevronDown, 
  Target, 
  BarChart3, 
  Flame, 
  Users, 
  Check, 
  Lock
} from 'lucide-react';
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
  FaFacebook,
} from 'react-icons/fa6';
import Link from 'next/link';

export default function RoiEstimatorPageClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full bg-[#F8F9FD] dark:bg-[#05060A] text-slate-900 dark:text-white min-h-screen transition-colors duration-300">
      {/* Main Brand Calculator (No Badges in Hero) */}
      <div className="pt-8 md:pt-12">
        <BrandRoiCalculator />
      </div>

      {/* ─── FEATURE SECTION 1: HOW SYNDICATION WORKS ──────────────────────── */}
      <section className="py-20 px-4 md:px-16 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-white/5">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-[#2F49E8] mb-2 font-bold">
            THE KPUGI DROP ENGINE
          </p>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-normal text-slate-900 dark:text-white tracking-tight">
            How Brand Creative Drops Work
          </h3>
          <p className="text-sm md:text-base text-slate-600 dark:text-neutral-400 mt-3 max-w-2xl mx-auto">
            Stop wasting weeks on agency onboarding and manual influencer negotiations. Turn your marketing assets into viral syndication in 3 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="rounded-3xl p-8 bg-white dark:bg-gradient-to-b dark:from-[#0D111F] dark:to-[#08090D] border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-xl space-y-4 hover:border-[#2F49E8]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#2F49E8]/10 border border-[#2F49E8]/20 flex items-center justify-center text-[#2F49E8] font-mono font-bold text-lg">
              01
            </div>
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Upload Ready Creatives</h4>
            <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
              Upload your promo flyers, ad banners, graphic carousels, or official brand videos. Set your campaign budget, target demographics, and required hashtags.
            </p>
            <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-neutral-400">
              <span className="text-[#17A75B] font-semibold">Instant Launch:</span> Live in the creator pool within 60 minutes.
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-3xl p-8 bg-white dark:bg-gradient-to-b dark:from-[#0D111F] dark:to-[#08090D] border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-xl space-y-4 hover:border-[#17A75B]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#17A75B]/10 border border-[#17A75B]/20 flex items-center justify-center text-[#17A75B] font-mono font-bold text-lg">
              02
            </div>
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Creators Grab & Syndicate</h4>
            <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
              Hundreds of verified micro and nano creators claim your drop. They grab the assets and post simultaneously across Instagram Reels, TikTok, and X.
            </p>
            <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-neutral-400">
              <span className="text-[#17A75B] font-semibold">Massive Multiplier:</span> Organic algorithmic amplification across multiple social clusters.
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-3xl p-8 bg-white dark:bg-gradient-to-b dark:from-[#0D111F] dark:to-[#08090D] border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-xl space-y-4 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-mono font-bold text-lg">
              03
            </div>
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">100% Verified Escrow Audit</h4>
            <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
              Our AI auditing engine filters fake bot views and validates authentic reach. Budget is only disbursed from escrow as genuine verified impressions are delivered.
            </p>
            <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-neutral-400">
              <span className="text-[#17A75B] font-semibold">Zero Waste Guarantee:</span> Unspent budget is automatically returned to your brand wallet.
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE SECTION 2: 4 BRAND SAFEGUARDS ─────────────────────────── */}
      <section className="py-20 px-4 md:px-16 border-t border-b border-slate-200/80 dark:border-white/5 bg-slate-100/50 dark:bg-neutral-950/40 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-widest text-[#17A75B] mb-2 font-bold">
              ZERO-RISK ADVERTISING
            </p>
            <h3 className="text-3xl md:text-4xl font-normal text-slate-900 dark:text-white tracking-tight">
              Enterprise Safeguards Built for High-Growth Brands
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1026] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-3 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#2F49E8]/10 border border-[#2F49E8]/20 flex items-center justify-center text-[#2F49E8]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h5 className="text-base font-semibold text-slate-900 dark:text-white">Smart Escrow Protection</h5>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                Your budget is securely locked in platform escrow. Creators only receive payout when their views pass strict automated verification checks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1026] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-3 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#17A75B]/10 border border-[#17A75B]/20 flex items-center justify-center text-[#17A75B]">
                <Target className="w-6 h-6" />
              </div>
              <h5 className="text-base font-semibold text-slate-900 dark:text-white">AI Bot & Fraud Filtering</h5>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                Proprietary algorithms detect view velocity anomalies, engagement pods, and non-human traffic to ensure you only pay for real human attention.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1026] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-3 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <FaTiktok className="w-6 h-6" />
              </div>
              <h5 className="text-base font-semibold text-slate-900 dark:text-white">Viral Reels & TikTok Feeds</h5>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                Syndicate video drops and promo flyers natively across Instagram Reels, TikTok, and X feeds with verified organic algorithmic reach.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1026] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-3 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Lock className="w-6 h-6" />
              </div>
              <h5 className="text-base font-semibold text-slate-900 dark:text-white">Pre-Screening & Brand Safety</h5>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                Maintain complete brand control. Configure demographic criteria or review creator profiles before campaign drop activation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE SECTION 3: COST EFFICIENCY BENCHMARK ──────────────────── */}
      <section className="py-20 px-4 md:px-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-[#2F49E8] mb-2 font-bold">
            BUDGET EFFICIENCY AUDIT
          </p>
          <h3 className="text-3xl font-normal text-slate-900 dark:text-white tracking-tight">
            Compare Kpugi Against Traditional Marketing Channels
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden bg-white dark:bg-black/60 shadow-xl shadow-slate-200/30 transition-colors">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-[#0B1026]">
                <th className="p-4 md:p-6 text-slate-600 dark:text-neutral-400 font-medium">Channel</th>
                <th className="p-4 md:p-6 text-slate-600 dark:text-neutral-400 font-medium">Typical Cost</th>
                <th className="p-4 md:p-6 text-slate-600 dark:text-neutral-400 font-medium">View / Reach Guarantee</th>
                <th className="p-4 md:p-6 text-slate-900 dark:text-white font-semibold bg-[#2F49E8]/5 dark:bg-[#2F49E8]/10 border-l border-slate-200/80 dark:border-[#2F49E8]/30">
                  With Kpugi Brand Suite
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              <tr>
                <td className="p-4 md:p-6 text-slate-900 dark:text-neutral-300 font-medium">Traditional Ad Agency</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">₦4M - ₦8M+ retainers</td>
                <td className="p-4 md:p-6 text-red-500 font-medium">Zero view guarantees</td>
                <td className="p-4 md:p-6 text-[#17A75B] font-bold bg-[#2F49E8]/5 dark:bg-[#2F49E8]/5 border-l border-slate-200/80 dark:border-[#2F49E8]/20">
                  Fixed ₦2,000 CPM • Guaranteed views
                </td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 text-slate-900 dark:text-neutral-300 font-medium">Direct Influencer DMs</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">50+ hours lost to negotiation</td>
                <td className="p-4 md:p-6 text-red-500 font-medium">High ghosting & bot views</td>
                <td className="p-4 md:p-6 text-[#17A75B] font-bold bg-[#2F49E8]/5 dark:bg-[#2F49E8]/5 border-l border-slate-200/80 dark:border-[#2F49E8]/20">
                  100% automated • Escrow protected
                </td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 text-slate-900 dark:text-neutral-300 font-medium">Meta / Google Ads</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">₦6,000 - ₦15,000 CPM</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">Ad blindness & high banner decay</td>
                <td className="p-4 md:p-6 text-[#17A75B] font-bold bg-[#2F49E8]/5 dark:bg-[#2F49E8]/5 border-l border-slate-200/80 dark:border-[#2F49E8]/20">
                  Authentic organic social syndication
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── READY TO DESIGN ASSETS? LINK TO AD SPECS ON ADVERTISE PAGE ────── */}
      <section className="py-14 px-4 md:px-16 max-w-5xl mx-auto border-t border-slate-200/80 dark:border-white/5">
        <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-blue-500/5 via-emerald-500/5 to-purple-500/5 dark:from-[#0B1026] dark:via-[#0E1530] dark:to-[#0B1026] border border-blue-500/20 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Creative Guidelines & Ad Dimensions
            </span>
            <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Looking for Ad Dimensions & File Specs?
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              Check out all creative resolutions, safe zones, size limits, and interactive device mockups on our official Advertise page.
            </p>
          </div>
          <Link
            href="/advertise#ad-specs"
            className="shrink-0 px-6 py-3.5 rounded-full bg-[#2F49E8] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span>View Ad Specs on Advertise</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── FEATURE SECTION 4: BRAND FAQS (ACCORDION) ────────────────────── */}
      <section className="py-20 px-4 md:px-16 max-w-4xl mx-auto border-t border-slate-200/80 dark:border-white/5">
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-normal text-slate-900 dark:text-white tracking-tight mb-3">
            Frequently Asked Questions for Advertisers
          </h3>
          <p className="text-sm text-slate-600 dark:text-neutral-400">
            Learn how Kpugi guarantees campaign ROI, performance metrics, and verified impressions.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Can our marketing team upload our own ready creatives, flyers, and banners?',
              a: 'Yes! That is the core superpower of Kpugi. You can upload ready promotional graphics, discount flyers, product announcement banners, or official video ads. Creators in our network grab these assets directly from your drop and post them with your pre-approved caption and trackable links.',
            },
            {
              q: 'What happens if a creator fails to hit the expected view milestones?',
              a: 'With Kpugi’s automated performance escrow, you only pay for actual verified views delivered. If a drop falls short of its projected target within the flight window, unspent funds are automatically credited back to your brand wallet.',
            },
            {
              q: 'How does Kpugi prevent bot views and artificial engagement?',
              a: 'Every video and status submission undergoes automated algorithmic audit. We analyze audience geolocation, view velocity, completion rate, and comment authenticity to purge invalid bot traffic before views are credited.',
            },
            {
              q: 'Can we review and pre-screen creators before our drop is assigned?',
              a: 'Yes. You can configure audience criteria, minimum follower thresholds, and demographic filters, or choose to review creator handles and historical delivery metrics before assigning your campaign drop.',
            },
            {
              q: 'What is the minimum budget required to launch a campaign drop?',
              a: 'Campaign drops start as low as ₦100,000 (approx $70 USD), allowing you to test creator performance with guaranteed reach before scaling to multimillion-view deployments.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              onClick={() => toggleFaq(idx)}
              className="p-6 rounded-2xl bg-white dark:bg-[#0B1026]/60 border border-slate-200/80 dark:border-white/5 shadow-sm hover:border-[#2F49E8]/40 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-base font-medium text-slate-900 dark:text-white">{faq.q}</h4>
                <ChevronDown
                  className={`w-5 h-5 text-[#2F49E8] transition-transform duration-200 shrink-0 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {openFaq === idx && (
                <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURE SECTION 5: HIGH CONVERTING CTA BANNER ─────────────────── */}
      <section className="py-20 px-4 md:px-16 max-w-5xl mx-auto">
        <div className="rounded-3xl p-8 md:p-14 bg-gradient-to-r from-[#2F49E8]/10 via-[#3B59FF]/10 to-[#17A75B]/10 dark:from-[#2F49E8]/30 dark:via-[#3B59FF]/20 dark:to-[#17A75B]/20 border border-[#2F49E8]/30 text-center space-y-6 shadow-xl relative overflow-hidden transition-colors">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2F49E8]/10 dark:bg-white/10 text-[#2F49E8] dark:text-white text-xs font-semibold uppercase tracking-wider">
            <span>SCALE WITH VERIFIED VIEWS</span>
          </div>
          <h3 className="text-3xl md:text-5xl font-normal text-slate-900 dark:text-white tracking-tight">
            Ready to turn influencer marketing into guaranteed ROI?
          </h3>
          <p className="text-sm md:text-base text-slate-600 dark:text-neutral-300 max-w-xl mx-auto">
            Upload your campaign creative, set your target reach, and mobilize hundreds of verified creators within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#2F49E8] to-[#17A75B] text-white font-semibold hover:opacity-95 transition-all shadow-xl shadow-[#2F49E8]/30"
            >
              <span>Launch Your Brand Drop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium transition-all shadow-sm"
            >
              <span>Speak to an Ad Strategist</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
