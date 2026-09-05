'use client';

import React, { useState } from 'react';
import CreatorEarningsCalculator from '@/components/calculator/CreatorEarningsCalculator';
import { 
  ArrowRight,
  UploadCloud,
  Check,
  ChevronDown,
  Layers,
  Video,
} from 'lucide-react';
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
  FaFacebook,
} from 'react-icons/fa6';
import Link from 'next/link';

export default function CalculatorPageClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full bg-[#F8F9FD] dark:bg-[#05060A] text-slate-900 dark:text-white min-h-screen transition-colors duration-300">
      {/* Main Creator Calculator (No Badges in Hero) */}
      <div className="pt-8 md:pt-12">
        <CreatorEarningsCalculator />
      </div>

      {/* ─── FEATURE SECTION 1: 3 WAYS TO MONETIZE ────────────────────────── */}
      <section className="py-20 px-4 md:px-16 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-white/5">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-[#17A75B] mb-2 font-bold">
            ZERO EDITING HEADACHE • FLEXIBLE DROPS
          </p>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-normal text-slate-900 dark:text-white tracking-tight">
            Three Ways to Earn on Kpugi
          </h3>
          <p className="text-sm md:text-base text-slate-600 dark:text-neutral-400 mt-3 max-w-2xl mx-auto">
            You don't need a camera or video editing skills. Brands provide 100% of the ad creatives — you simply grab, post, and amplify to your audience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Brand Flyer & Graphic Drops */}
          <div className="relative rounded-3xl p-8 bg-white dark:bg-gradient-to-b dark:from-[#0D111F] dark:to-[#08090D] border border-slate-200/80 dark:border-[#2F49E8]/30 shadow-xl shadow-slate-200/40 dark:shadow-xl flex flex-col justify-between group hover:border-[#2F49E8]/60 transition-all duration-300">
            <div className="absolute -top-3.5 left-8 px-3.5 py-1 rounded-full bg-[#2F49E8] text-white text-xs font-bold uppercase tracking-wider shadow-md">
              Most Popular • Instant
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#2F49E8]/10 border border-[#2F49E8]/20 flex items-center justify-center text-[#2F49E8] mb-6 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Brand Flyer & Graphic Drops</h4>
              <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed mb-6">
                Brands upload high-converting flyers, promo banners, and official announcement graphics. Simply download the asset, copy the caption, and post to your story or status.
              </p>
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-[#17A75B]" />
                  <span>Zero video editing required</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-[#17A75B]" />
                  <span>Perfect for Stories & Feed Posts</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-[#17A75B]" />
                  <span>Grab and post in under 60 seconds</span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-neutral-400">Baseline Rate</span>
              <span className="text-lg font-bold text-[#17A75B]">₦2,000 / 1k views</span>
            </div>
          </div>

          {/* Card 2: Official Brand Video Drops */}
          <div className="relative rounded-3xl p-8 bg-white dark:bg-gradient-to-b dark:from-[#0D111F] dark:to-[#08090D] border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-xl flex flex-col justify-between group hover:border-[#17A75B]/50 transition-all duration-300">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#17A75B]/10 border border-[#17A75B]/20 flex items-center justify-center text-[#17A75B] mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Official Brand Video Drops</h4>
              <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed mb-6">
                Brands provide finished promo clips, commercial reels, and motion product videos. You simply syndicate directly to TikTok, Reels, or Shorts with 0 filming.
              </p>
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-[#17A75B]" />
                  <span>100% Brand-Supplied Videos</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-[#17A75B]" />
                  <span>Optimized for TikTok, Reels & Shorts</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-[#17A75B]" />
                  <span>Higher CPM than static graphics</span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-neutral-400">Baseline Rate</span>
              <span className="text-lg font-bold text-[#17A75B]">₦3,500 / 1k views</span>
            </div>
          </div>

          {/* Card 3: Omnichannel Syndicate */}
          <div className="relative rounded-3xl p-8 bg-white dark:bg-gradient-to-b dark:from-[#0D111F] dark:to-[#08090D] border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-xl flex flex-col justify-between group hover:border-purple-500/50 transition-all duration-300">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Omnichannel Syndicate</h4>
              <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed mb-6">
                Amplify campaign reach across multiple profiles. Cross-post brand flyers on Instagram Stories/Feed + official video clips on TikTok & Reels + post on X simultaneously.
              </p>
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-[#17A75B]" />
                  <span>Multiply views across 2+ platforms</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-[#17A75B]" />
                  <span>Unlocks higher campaign payout caps</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-[#17A75B]" />
                  <span>Highest total earnings potential</span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-neutral-400">Baseline Rate</span>
              <span className="text-lg font-bold text-[#17A75B]">₦5,000+ / 1k views</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE SECTION 2: 3 STEP WORKFLOW ────────────────────────────── */}
      <section className="py-20 px-4 md:px-16 max-w-6xl mx-auto">
        <div className="rounded-3xl p-8 md:p-14 bg-white dark:bg-gradient-to-br dark:from-[#0B1026] dark:via-[#0D111F] dark:to-[#05060A] border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-200/30 dark:shadow-2xl relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2F49E8]/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="text-center mb-12 relative z-10">
            <span className="text-xs font-mono font-bold text-[#2F49E8] uppercase tracking-widest">
              HOW IT WORKS FOR CREATORS
            </span>
            <h3 className="text-3xl md:text-4xl font-normal text-slate-900 dark:text-white tracking-tight mt-2">
              From Claiming a Drop to Cash in Your Bank
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#2F49E8] text-white flex items-center justify-center font-mono font-bold text-sm">
                01
              </div>
              <h5 className="text-lg font-semibold text-slate-900 dark:text-white">Claim Active Brand Drops</h5>
              <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                Log into Kpugi and browse drops in your niche. View brand guidelines, download ready graphics, or grab the official promo clip. Claim in 1 click.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#17A75B] text-white flex items-center justify-center font-mono font-bold text-sm">
                02
              </div>
              <h5 className="text-lg font-semibold text-slate-900 dark:text-white">Post to Your Channels</h5>
              <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                Post the brand's ready graphic flyer or official video on Instagram, TikTok, X, or YouTube Shorts. Include the provided tracking link or campaign hashtags.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2F49E8] to-[#17A75B] text-white flex items-center justify-center font-mono font-bold text-sm">
                03
              </div>
              <h5 className="text-lg font-semibold text-slate-900 dark:text-white">Auto-Verify & Get Paid</h5>
              <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                Our automated scrapers audit your verified view count every 60 minutes. Cleared funds settle into your Available Balance for weekly Friday bank payouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE SECTION 3: SUPPORTED CHANNELS ─────────────────────────── */}
      <section className="py-16 px-4 md:px-16 border-t border-b border-slate-200/80 dark:border-white/5 bg-slate-100/50 dark:bg-neutral-950/40 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h4 className="text-sm font-mono text-slate-500 dark:text-neutral-400 uppercase tracking-widest font-semibold">
              SUPPORTED NETWORKS & DISTRIBUTION PLATFORMS
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: 'Instagram Reels', icon: FaInstagram, color: 'text-pink-500', badge: 'High Reach' },
              { name: 'TikTok', icon: FaTiktok, color: 'text-slate-900 dark:text-neutral-200', badge: 'Viral Potential' },
              { name: 'X / Twitter', icon: FaXTwitter, color: 'text-slate-900 dark:text-white', badge: 'Fast Drops' },
              { name: 'YouTube Shorts', icon: FaYoutube, color: 'text-red-500', badge: 'Top CPM' },
              { name: 'Facebook Feed', icon: FaFacebook, color: 'text-blue-600', badge: 'Mass Audience' },
            ].map((channel, i) => {
              const Icon = channel.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white dark:bg-neutral-900/40 border border-slate-200/80 dark:border-white/5 shadow-sm hover:border-[#2F49E8]/40 flex flex-col items-center text-center transition-all group"
                >
                  <Icon className={`w-8 h-8 ${channel.color} mb-2.5 group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-medium text-slate-900 dark:text-white mb-1">{channel.name}</span>
                  <span className="text-[10px] text-[#17A75B] font-mono font-medium">{channel.badge}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURE SECTION 4: TRANSPARENCY COMPARISON ────────────────────── */}
      <section className="py-20 px-4 md:px-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-[#2F49E8] mb-2 font-bold">
            TRANSPARENCY BENCHMARK
          </p>
          <h3 className="text-3xl font-normal text-slate-900 dark:text-white tracking-tight">
            How Kpugi Compares to Traditional Talent Agencies
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden bg-white dark:bg-black/60 shadow-xl shadow-slate-200/30 transition-colors">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-[#0B1026]">
                <th className="p-4 md:p-6 text-slate-600 dark:text-neutral-400 font-medium">Platform Feature</th>
                <th className="p-4 md:p-6 text-slate-600 dark:text-neutral-400 font-medium">Legacy Talent Agency</th>
                <th className="p-4 md:p-6 text-slate-600 dark:text-neutral-400 font-medium">Generic Influencer App</th>
                <th className="p-4 md:p-6 text-slate-900 dark:text-white font-semibold bg-[#2F49E8]/5 dark:bg-[#2F49E8]/10 border-l border-slate-200/80 dark:border-[#2F49E8]/30">
                  With Kpugi Network
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              <tr>
                <td className="p-4 md:p-6 text-slate-900 dark:text-neutral-300 font-medium">Platform / Management Cut</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">40% to 50% commission</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">25% to 35% cut</td>
                <td className="p-4 md:p-6 text-[#17A75B] font-bold bg-[#2F49E8]/5 dark:bg-[#2F49E8]/5 border-l border-slate-200/80 dark:border-[#2F49E8]/20">
                  Flat 10% only (You keep 90%)
                </td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 text-slate-900 dark:text-neutral-300 font-medium">Payout Timeline</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">Net-60 or Net-90 days</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">14-30 day hold period</td>
                <td className="p-4 md:p-6 text-[#17A75B] font-bold bg-[#2F49E8]/5 dark:bg-[#2F49E8]/5 border-l border-slate-200/80 dark:border-[#2F49E8]/20">
                  Weekly Friday settlements (direct to NUBAN bank)
                </td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 text-slate-900 dark:text-neutral-300 font-medium">Follower Minimum</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">Strict 50k–100k minimum</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">5k–10k minimum</td>
                <td className="p-4 md:p-6 text-[#17A75B] font-bold bg-[#2F49E8]/5 dark:bg-[#2F49E8]/5 border-l border-slate-200/80 dark:border-[#2F49E8]/20">
                  0 followers required (Views-based)
                </td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 text-slate-900 dark:text-neutral-300 font-medium">Creative Burden</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">Must produce elaborate video</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">Must film custom video</td>
                <td className="p-4 md:p-6 text-[#17A75B] font-bold bg-[#2F49E8]/5 dark:bg-[#2F49E8]/5 border-l border-slate-200/80 dark:border-[#2F49E8]/20">
                  100% Brand-supplied creatives (0 filming or editing)
                </td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 text-slate-900 dark:text-neutral-300 font-medium">Payment Protection</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">High risk of brand default</td>
                <td className="p-4 md:p-6 text-slate-600 dark:text-neutral-400">Partial escrow</td>
                <td className="p-4 md:p-6 text-[#17A75B] font-bold bg-[#2F49E8]/5 dark:bg-[#2F49E8]/5 border-l border-slate-200/80 dark:border-[#2F49E8]/20">
                  100% Upfront Escrow Guarantee
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── FEATURE SECTION 5: CREATOR FAQS (ACCORDION) ──────────────────── */}
      <section className="py-20 px-4 md:px-16 max-w-4xl mx-auto border-t border-slate-200/80 dark:border-white/5">
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-normal text-slate-900 dark:text-white tracking-tight mb-3">
            Frequently Asked Questions for Creators
          </h3>
          <p className="text-sm text-slate-600 dark:text-neutral-400">
            Everything you need to know about claiming brand drops and cashing out your earnings.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Do I have to film or edit videos to earn on Kpugi?',
              a: 'No! Kpugi does not require creators to shoot UGC, unboxing videos, or testimonials. Brands supply 100% of the ad creatives — including ready-made flyers, banners, and official promo video clips. All you do is grab the asset, copy the caption, post it to your social media, and get paid for verified views.',
            },
            {
              q: 'How does Kpugi track and verify views?',
              a: 'Kpugi uses automated scrapers that audit view counts every 60 minutes. Once you clock in your live post link, our engine verifies genuine reach, audience engagement, and view milestones while filtering out bots.',
            },
            {
              q: 'Which social platforms can I monetize on Kpugi?',
              a: 'You can monetize across Instagram Reels & Stories, TikTok videos, X (Twitter) posts, and YouTube Shorts. As long as your post adheres to brand guidelines and delivers verified organic reach, you get paid directly per 1,000 views.',
            },
            {
              q: 'How much does Kpugi take from my earnings?',
              a: 'Kpugi charges a flat 10% platform fee. You keep 90% of the entire gross campaign budget allocated to your verified views. There are zero hidden agent markups or management cuts.',
            },
            {
              q: 'When and how do I withdraw my earnings?',
              a: 'Once your views cross the 1,000-view milestone and pass pending clearance, funds settle into your Available Balance. You can place a withdrawal request anytime, and all requests are processed and disbursed directly to your Nigerian bank account (NUBAN) every Friday.',
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

      {/* ─── FEATURE SECTION 6: HIGH CONVERTING CTA BANNER ─────────────────── */}
      <section className="py-20 px-4 md:px-16 max-w-5xl mx-auto">
        <div className="rounded-3xl p-8 md:p-14 bg-gradient-to-r from-[#2F49E8]/10 via-[#3B59FF]/10 to-[#17A75B]/10 dark:from-[#2F49E8]/30 dark:via-[#3B59FF]/20 dark:to-[#17A75B]/20 border border-[#2F49E8]/30 text-center space-y-6 shadow-xl relative overflow-hidden transition-colors">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2F49E8]/10 dark:bg-white/10 text-[#2F49E8] dark:text-white text-xs font-semibold uppercase tracking-wider">
            <span>START MONETIZING TODAY</span>
          </div>
          <h3 className="text-3xl md:text-5xl font-normal text-slate-900 dark:text-white tracking-tight">
            Ready to monetize every view you create?
          </h3>
          <p className="text-sm md:text-base text-slate-600 dark:text-neutral-300 max-w-xl mx-auto">
            Join thousands of creators turning their Instagram, TikTok, and X feeds into predictable weekly income with zero follower minimums.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#2F49E8] to-[#17A75B] text-white font-semibold hover:opacity-95 transition-all shadow-xl shadow-[#2F49E8]/30"
            >
              <span>Claim Creator Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium transition-all shadow-sm"
            >
              <span>Explore How Drops Work</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
