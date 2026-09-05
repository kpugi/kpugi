import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Lock,
  ArrowRight,
  Bot,
  Zap,
  CheckCircle2,
  HelpCircle,
  Smartphone,
  Eye,
  FileCheck2,
  Building2,
  Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'How It Works — The Escrow Verified Creator Protocol | Kpugi',
  description:
    'Learn how Kpugi connects Nigerian advertisers and creators through 100% escrow protection and automated view verification. Distribute content across TikTok, Instagram, and X with guaranteed ROI.',
  keywords: [
    'how Kpugi works',
    'influencer marketing process Nigeria',
    'escrow creator payments',
    'automated view verification',
    'pay per view influencer ads',
    'TikTok creator earnings Nigeria',
    'Instagram reels marketing Nigeria',
  ],
  alternates: {
    canonical: '/how-it-works',
  },
  openGraph: {
    title: 'How It Works — The Escrow Verified Creator Protocol | Kpugi',
    description:
      'Learn how Kpugi connects Nigerian advertisers and creators through 100% escrow protection and automated view verification.',
    url: `${siteUrl}/how-it-works`,
    siteName: 'Kpugi',
    type: 'website',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'How Kpugi Works — The Escrow Verified Creator Protocol',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    title: 'How It Works — The Escrow Verified Creator Protocol | Kpugi',
    description: '100% Escrow Protection and Automated View Auditing for Brands and Creators in Nigeria.',
    images: ['/kpugi_logo.png'],
  },
};

export default function HowItWorksPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${siteUrl}/how-it-works#webpage`,
      url: `${siteUrl}/how-it-works`,
      name: 'How Kpugi Works — The Escrow Verified Creator Protocol',
      description:
        'A transparent marketplace engineered to eliminate fake influencer metrics for brands and guarantee on-time Naira payouts for creators.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'How It Works',
            item: `${siteUrl}/how-it-works`,
          },
        ],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How Kpugi Campaign Escrow & View Verification Works',
      description:
        'Step-by-step process of launching a brand drop and receiving verified creator earnings on Kpugi.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Set Your Budget & CPM',
          text: 'Brands set their exact payment per 1,000 verified views (starting at ₦2,000 CPM) and upload ready flyers, banners, or video assets.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Escrow Holds Funds Safely',
          text: 'Budget is locked securely in Kpugi Escrow. No funds are released to creators until verified authentic views are delivered.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Creators Publish to Active Channels',
          text: 'Vetted creators grab the brand asset, post it directly to Instagram Reels, TikTok, or X feeds, and submit their live post link.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Automated View Auditing & Instant Payouts',
          text: 'Kpugi automated scrapers query official APIs hourly to audit organic views and release earnings directly to creator bank accounts.',
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does Kpugi track verified views?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We connect directly with official platform APIs (Meta Graph API, TikTok API, YouTube Data API) and run automated background workers that audit live video counters hourly, filtering bot farms and velocity spikes.',
          },
        },
        {
          '@type': 'Question',
          name: 'When do creators get paid?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Earnings are credited to creator wallets as soon as campaign view audit thresholds are met. Creators can withdraw funds to any Nigerian bank account anytime.',
          },
        },
        {
          '@type': 'Question',
          name: 'What happens to unused brand budget?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Your money is 100% escrow protected. If a campaign expires before the entire view budget is claimed, all remaining unspent funds are automatically returned to your brand wallet.',
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-kpugi-paper text-kpugi-ink dark:bg-[#090A0F] dark:text-white selection:bg-blue-500/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Header / Hero */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-blue-600/10 dark:bg-blue-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          <Badge variant="secondary" className="font-bold text-xs">Platform Architecture</Badge>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How Kpugi Works
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A transparent marketplace engineered to eliminate fake influencer metrics for brands and guarantee on-time Naira payouts for creators.
          </p>
        </div>
      </section>

      {/* Dual Column: Advertisers vs Creators */}
      <section className="py-16 bg-slate-50/70 dark:bg-white/[0.02] border-y border-slate-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Advertiser Journey */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-kpugi-blue dark:text-blue-400 flex items-center justify-center font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">For Advertisers & Brands</h2>
                  <p className="text-xs text-slate-500">Pay only for actual impressions</p>
                </div>
              </div>

              <div className="space-y-6 text-sm">
                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 text-kpugi-blue dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Set Your Budget & CPM</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Specify how much you are paying per 1,000 verified views (e.g. ₦2,500 CPM) and upload your creative assets.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 text-kpugi-blue dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Escrow Holds Funds Safely</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Budget is locked in Kpugi Escrow. No money is paid to creators upfront until real results are delivered.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 text-kpugi-blue dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Automated Verification</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Our scrapers verify post links, view milestones, and detect fake bot traffic automatically.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/b/campaigns/new">
                  <Button className="w-full h-11 rounded-xl bg-kpugi-blue hover:bg-blue-600 font-bold text-xs">
                    Start a Brand Campaign →
                  </Button>
                </Link>
              </div>
            </div>

            {/* Creator Journey */}
            <div id="creator-workflow" className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">For Creators</h2>
                  <p className="text-xs text-slate-500">Monetize every post effortlessly</p>
                </div>
              </div>

              <div className="space-y-6 text-sm">
                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Pick Brand Campaigns</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Browse live marketplace offers. See exact payout CPM rates before posting anything.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Post to Your Socials</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Publish to TikTok, Instagram Reels, X feeds, or YouTube Shorts following the simple campaign brief.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Instant NUBAN Bank Payouts</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">As verified views accumulate, earnings credit to your wallet for instant daily transfer to any Nigerian bank.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/sign-up">
                  <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white">
                    Join as a Creator →
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="secondary" className="font-bold text-xs">Got Questions?</Badge>
          <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 space-y-2">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">How does Kpugi track verified views?</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We connect with official platform APIs (Meta Graph API, TikTok API, YouTube Data API) and run automated background workers that audit live video counters, detect velocity anomalies, and filter bot farms.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 space-y-2">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">When do creators get paid?</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Earnings are credited to creator wallets as soon as the campaign view audit threshold is met. You can withdraw funds to any Nigerian bank (OPay, Kuda, GTBank, Zenith, Access) anytime.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 space-y-2">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">What happens to unused brand budget?</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your money is 100% protected. If a campaign expires before the entire view budget is claimed, all remaining funds are returned to your balance.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
