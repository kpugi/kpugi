import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  HelpCircle,
  ShieldCheck,
  Zap,
  Coins,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Frequently Asked Questions (FAQ) — Advertiser & Creator Guide | Kpugi',
  description:
    'Got questions about Kpugi? Find answers on escrow protection, CPM rates, automated view auditing, creator bank payouts, and advertising formats in Nigeria.',
  keywords: [
    'Kpugi FAQ',
    'influencer marketing FAQ Nigeria',
    'creator payouts Nigeria FAQ',
    'how Kpugi escrow works',
    'CPM advertising Nigeria FAQ',
    'verified views guarantee',
  ],
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: `${siteUrl}/faq`,
    siteName: 'Kpugi',
    title: 'Frequently Asked Questions (FAQ) — Advertiser & Creator Guide | Kpugi',
    description:
      'Everything you need to know about launching drops, verifying views, and withdrawing earnings on Kpugi.',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Kpugi Help & Frequently Asked Questions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    title: 'Frequently Asked Questions (FAQ) | Kpugi Support',
    description: 'Find answers on escrow protection, CPM pricing, and creator bank payouts.',
    images: ['/kpugi_logo.png'],
  },
};

const FAQ_ITEMS = [
  {
    category: 'For Brands & Advertisers',
    icon: Building2,
    id: 'advertisers',
    questions: [
      {
        q: 'How does Kpugi protect our campaign budget?',
        a: '100% of your campaign budget is held securely in platform escrow. Funds are never disbursed to creators upfront. As creators post your ready creative assets and their live post accumulates audited organic views, money is released proportionally. Any unspent budget upon campaign expiry is automatically returned to your brand wallet.',
      },
      {
        q: 'What types of creative assets can our brand upload?',
        a: 'You can upload ready-to-post promotional flyers (1:1 square or 4:5 vertical portrait), high-resolution discount graphics, or official vertical video drops (9:16 aspect ratio up to 60 seconds). Creators download your exact asset and post it directly to their feeds without modification.',
      },
      {
        q: 'How do you prevent fake views and bot traffic?',
        a: 'Kpugi runs proprietary view auditing algorithms that connect to official social platform APIs. Our system detects unnatural velocity spikes, engagement pods, and non-human traffic anomalies, filtering out fraudulent views so you only pay for real human attention.',
      },
      {
        q: 'Can we track campaign links and UTM parameters?',
        a: 'Yes. You can attach custom tracking links with standard UTM parameters for Google Analytics, Mixpanel, or PostHog. You will also receive real-time impression, click, and viewability analytics in your brand dashboard.',
      },
    ],
  },
  {
    category: 'For Content Creators',
    icon: Coins,
    id: 'creators',
    questions: [
      {
        q: 'Do I need a minimum number of followers to join Kpugi?',
        a: 'No! Kpugi has zero minimum follower requirements. If you have an active account on TikTok, Instagram, X (Twitter), or YouTube Shorts and can generate organic views, you can earn. Payouts begin unlocking once your post achieves its first 1,000 verified views.',
      },
      {
        q: 'How do I earn money on Kpugi?',
        a: 'Browse active brand drops in the campaign catalog, claim a drop that fits your audience, post the provided brand video or flyer to your account, and submit your live post URL. Our system audits your views hourly and credits your wallet based on the agreed CPM rate.',
      },
      {
        q: 'How and when can I withdraw my earnings?',
        a: 'Once your views pass automated verification, earnings credit to your Kpugi wallet. You can withdraw directly to any Nigerian commercial bank or fintech account (OPay, Kuda, GTBank, Zenith, Access Bank, etc.) anytime with zero withdrawal penalties.',
      },
      {
        q: 'Can I delete my post after getting paid?',
        a: 'No. Campaign rules require posts to remain live for a minimum of 72 hours (or the duration specified in the brand brief). Removing posts prematurely results in forfeiture of pending earnings and suspension from future drops.',
      },
    ],
  },
  {
    category: 'Payments & Escrow',
    icon: ShieldCheck,
    id: 'escrow',
    questions: [
      {
        q: 'What payment processor powers Kpugi transactions?',
        a: 'All deposits, card payments, bank transfers, and payouts on Kpugi are processed securely through licensed Nigerian payment infrastructure, ensuring bank-grade encryption and automated instant settlements.',
      },
      {
        q: 'What fees does Kpugi charge?',
        a: 'Pricing is completely transparent. For brand drops, advertisers set their target CPM (starting at ₦2,000 per 1,000 verified views) with zero hidden fees. Kpugi retains a standard 10% platform facilitation fee on creator earnings upon successful view delivery.',
      },
      {
        q: 'How are refunds handled if a campaign does not reach its view goal?',
        a: 'If a brand drop expires before delivering 100% of its target views, the unallocated escrow balance is credited immediately back to the brand wallet, available for your next campaign or instant withdrawal.',
      },
    ],
  },
];

export default function FAQPage() {
  const allQuestions = FAQ_ITEMS.flatMap((c) => c.questions);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${siteUrl}/faq#webpage`,
      url: `${siteUrl}/faq`,
      name: 'Frequently Asked Questions (FAQ) | Kpugi Support',
      description:
        'Official FAQ guide for advertisers and creators on Kpugi. Escrow protection, CPM rates, view auditing, and creator payouts.',
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
            name: 'Help & FAQ',
            item: `${siteUrl}/faq`,
          },
        ],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${siteUrl}/faq#faq`,
      mainEntity: allQuestions.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
  ];

  return (
    <div className="w-full text-slate-900 dark:text-white transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#2F49E8] dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
          <HelpCircle className="size-3.5" />
          <span>Help & Knowledge Base</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] tracking-tight text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h1>

        <p className="mt-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about launching brand drops, automated view auditing, escrow protection, and creator bank payouts.
        </p>

        {/* Category Navigation Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {FAQ_ITEMS.map((cat) => {
            const Icon = cat.icon;
            return (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-white transition-all shadow-sm"
              >
                <Icon className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span>{cat.category}</span>
              </a>
            );
          })}
        </div>
      </section>

      {/* ─── FAQ CATEGORIES ───────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16">
        {FAQ_ITEMS.map((category) => {
          const Icon = category.icon;
          return (
            <section key={category.id} id={category.id} className="scroll-mt-28 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-white/10 pb-4">
                <div className="size-10 rounded-xl bg-blue-500/10 text-[#2F49E8] dark:text-blue-400 flex items-center justify-center">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                    {category.category}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Common questions & operational policies
                  </p>
                </div>
              </div>

              <dl className="space-y-4">
                {category.questions.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2.5 transition-colors"
                  >
                    <dt className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-start gap-3">
                      <span className="text-[#2F49E8] dark:text-blue-400 font-mono text-sm mt-0.5 font-extrabold">
                        Q.
                      </span>
                      <span>{faq.q}</span>
                    </dt>
                    <dd className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                      {faq.a}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}

        {/* ─── STILL HAVE QUESTIONS? CTA ───────────────────────────────────── */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-500/10 via-emerald-500/5 to-purple-500/10 dark:from-[#0B1026] dark:via-[#0E1530] dark:to-[#0B1026] border border-blue-500/20 dark:border-white/10 text-center space-y-4">
          <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Still have questions? We're here to help.
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Our support desk is available daily to assist brand marketing teams and creators with campaign setup, tracking, and settlements.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-[#2F49E8] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>Contact Support Desk</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/how-it-works"
              className="px-6 py-3 rounded-xl bg-white dark:bg-white/10 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-all"
            >
              <span>Explore How It Works</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
