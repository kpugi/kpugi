import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Layers,
  Lock,
  ArrowRight,
  CheckCircle2,
  Users,
  Eye,
  BarChart3,
  Bot,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'For Brands & Agencies — Pay Only for Verified Views',
  description:
    'Launch escrow-protected influencer campaigns in Nigeria. Pay only for verified views on TikTok, Instagram, and WhatsApp. Zero ad waste.',
  alternates: {
    canonical: '/brands',
  },
  openGraph: {
    title: 'For Brands & Agencies — Pay Only for Verified Views | Kpugi',
    description:
      'Launch escrow-protected influencer campaigns in Nigeria. Pay only for verified views on TikTok, Instagram, and WhatsApp. Zero ad waste.',
    url: 'https://kpugi.com/brands',
    siteName: 'Kpugi',
    type: 'website',
  },
};

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-kpugi-paper text-kpugi-ink dark:bg-[#090A0F] dark:text-white selection:bg-blue-500/20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/10 dark:bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-purple-600/10 dark:bg-purple-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/10 text-kpugi-blue dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Performance Influencer Marketing</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Stop paying for followers. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
                Pay only for verified views.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
              Kpugi is Nigeria&apos;s first escrow-backed creator marketplace. Launch CPM campaigns, distribute your creative briefs to hundreds of vetted creators, and only pay when our automated scrapers verify genuine impressions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/b/campaigns/new">
                <Button className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-kpugi-blue hover:bg-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all">
                  Launch a Campaign →
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-2xl border-slate-300 dark:border-white/15 font-bold text-sm hover:bg-slate-100 dark:hover:bg-white/10">
                  Explore Live Marketplace
                </Button>
              </Link>
            </div>

            {/* Micro Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>100% Escrow Protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-blue-500" />
                <span>Real-time Anti-Fraud Scraper</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Paystack Invoicing (NGN)</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4-Step How Brands Scale Section */}
      <section className="py-20 bg-slate-50/70 dark:bg-white/[0.02] border-y border-slate-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="secondary" className="font-bold text-xs">How Brands Work</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              From creative brief to viral reach in 4 steps
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Set your target CPM rate, deposit your budget into secure escrow, and watch vetted Nigerian creators distribute your message.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-kpugi-blue dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                01
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Create Campaign Brief
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload your video creative or banner, write talking points, select channels (Instagram, TikTok, WhatsApp Status, X), and set your budget.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                02
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Fund Escrow Vault
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Pay safely via Paystack. Your funds remain locked in escrow vault and are never released upfront.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                03
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Creators Post & Submit
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Didit KYC-verified creators accept your brief, post to their real audience, and submit the live link to your campaign portal.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                04
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Automated Audit & Payout
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Our AI scrapers track impressions continuously. Escrow releases Naira payouts strictly for verified views that meet your minimum threshold.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid: Why Nigerian Brands Choose Kpugi */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-kpugi-blue dark:text-blue-400 flex items-center justify-center">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Zero Bot & Fake View Fraud
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We inspect video post metrics via official Graph APIs and background scrapers. Fake screenshot tampering is automatically rejected by our vision verification engine.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Real-Time ROI Dashboard
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Monitor view velocity, top-performing creator posts, channel breakdowns, and remaining escrow budget in real-time with exportable PDF settlement reports.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Unspent Budget Refund
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                If your campaign ends with remaining budget that wasn&apos;t claimed by verified views, unspent funds are returned directly to your brand wallet or bank account.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Big CTA Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 sm:p-14 text-white text-center space-y-6 shadow-2xl">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                Ready to scale your brand with verified Nigerian creators?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                Set your CPM rate, upload your creative, and let thousands of verified creators drive authentic engagement today.
              </p>
              <div className="pt-2">
                <Link href="/b/campaigns/new">
                  <Button className="h-12 px-8 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm shadow-xl transition-all">
                    Create a Campaign Now →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
