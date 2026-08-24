import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  Sparkles,
  Share2,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Flame,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'For Creators — Turn Posts into Verified Daily Payouts',
  description:
    'Monetize your WhatsApp Status, TikTok, and Instagram views in Nigeria. Earn guaranteed CPM payouts deposited directly to your bank account.',
  alternates: {
    canonical: '/creators',
  },
  openGraph: {
    title: 'For Creators — Turn Posts into Verified Daily Payouts | Kpugi',
    description:
      'Monetize your WhatsApp Status, TikTok, and Instagram views in Nigeria. Earn guaranteed CPM payouts deposited directly to your bank account.',
    url: 'https://kpugi.com/creators',
    siteName: 'Kpugi',
    type: 'website',
  },
};

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-kpugi-paper text-kpugi-ink dark:bg-[#090A0F] dark:text-white selection:bg-emerald-500/20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-600/10 dark:bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-blue-600/10 dark:bg-blue-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="h-3.5 w-3.5" />
              <span>Where a Post Turns into a Payout</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Get paid in Naira for every <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 dark:from-emerald-400 dark:via-teal-300 dark:to-blue-400">
                1,000 verified views you generate.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
              You don&apos;t need 100k followers to make serious money. Connect your WhatsApp, TikTok, or Instagram, browse ready-to-post brand campaigns, and receive instant bank transfers for your verified reach.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/sign-up">
                <Button className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all">
                  Join as a Creator →
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-2xl border-slate-300 dark:border-white/15 font-bold text-sm hover:bg-slate-100 dark:hover:bg-white/10">
                  Browse Live Campaigns
                </Button>
              </Link>
            </div>

            {/* Quick Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                <span>Paystack Instant NGN Payouts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-blue-500" />
                <span>WhatsApp, TikTok & IG Supported</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-purple-500" />
                <span>100% Escrow Guaranteed</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Monetization Channels Grid */}
      <section className="py-20 bg-slate-50/70 dark:bg-white/[0.02] border-y border-slate-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="secondary" className="font-bold text-xs">Supported Platforms</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Monetize the apps you use every single day
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Whether you have an active WhatsApp contact list or high-velocity TikTok videos, Kpugi matches you with top Nigerian brand campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* WhatsApp Status */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
                💬
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                WhatsApp Status
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Post sponsored banners and broadcast promos to your status. Submit your 24-hour viewer count screenshots for OCR view audit validation and instant payout.
              </p>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Avg. CPM: ₦1,500 – ₦4,000 / 1k views
              </div>
            </div>

            {/* TikTok Videos */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-xl">
                🎵
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                TikTok Videos
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Use campaign audio sounds or showcase sponsored brand clips. Our automated scrapers sync your view counter in real-time as your video goes viral.
              </p>
              <div className="text-xs font-bold text-pink-600 dark:text-pink-400">
                Avg. CPM: ₦2,500 – ₦8,000 / 1k views
              </div>
            </div>

            {/* Instagram Reels & Stories */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl">
                📸
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Instagram Reels & Stories
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Connect your professional Instagram creator account via official Meta Login. Track reel plays, story interactions, and claim escrow payouts automatically.
              </p>
              <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
                Avg. CPM: ₦3,000 – ₦10,000 / 1k views
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Creator How-To Flow */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="secondary" className="font-bold text-xs">Simple Payout Flow</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              How creators earn on Kpugi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 space-y-3">
              <div className="text-emerald-500 font-mono text-sm font-bold">STEP 01</div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">Browse Live Deals</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Explore active brand campaigns with locked escrow budgets and transparent CPM rates.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 space-y-3">
              <div className="text-emerald-500 font-mono text-sm font-bold">STEP 02</div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">Post Creative</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Download high-res brand creatives or record your video following the clear submission brief.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 space-y-3">
              <div className="text-emerald-500 font-mono text-sm font-bold">STEP 03</div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">Submit Post URL</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Paste your live post link into Kpugi. Our automated background workers start counting verified views.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 space-y-3">
              <div className="text-emerald-500 font-mono text-sm font-bold">STEP 04</div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">Withdraw Naira</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Withdraw earnings anytime to your NUBAN bank account (OPay, Kuda, GTBank, Zenith, Access).
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-blue-800 p-8 sm:p-14 text-white text-center space-y-6 shadow-2xl">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                Turn your views into daily income today.
              </h2>
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                Join over 2,500+ verified Nigerian creators already earning guaranteed payouts on Kpugi.
              </p>
              <div className="pt-2">
                <Link href="/sign-up">
                  <Button className="h-12 px-8 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm shadow-xl transition-all">
                    Create Free Creator Account →
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
