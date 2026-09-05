import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Eye,
  Server,
  Key,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Security & Escrow Safeguards — Bank-Grade Verification | Kpugi',
  description:
    'Learn about Kpugi security architecture: 100% automated escrow protection, anti-fraud AI view audits, official social API integrations, and secure Paystack payment settlement in Nigeria.',
  keywords: [
    'Kpugi security',
    'escrow protection Nigeria',
    'influencer marketing fraud prevention',
    'bot detection creator views',
    'safe creator payouts Nigeria',
  ],
  alternates: {
    canonical: '/security',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: `${siteUrl}/security`,
    siteName: 'Kpugi',
    title: 'Security & Escrow Safeguards — Bank-Grade Verification | Kpugi',
    description:
      'Bank-grade escrow vaults, automated anti-fraud scrapers, and end-to-end payment encryption.',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Kpugi Security & Trust Architecture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    title: 'Security & Escrow Safeguards | Kpugi',
    description: 'Bank-grade escrow vaults and automated anti-fraud view audits.',
    images: ['/kpugi_logo.png'],
  },
};

export default function SecurityPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${siteUrl}/security#webpage`,
      url: `${siteUrl}/security`,
      name: 'Security & Escrow Safeguards — Kpugi',
      description:
        'Technical security overview of Kpugi automated escrow, anti-fraud view auditing, and banking settlement architecture.',
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
            name: 'Security & Trust',
            item: `${siteUrl}/security`,
          },
        ],
      },
    },
  ];

  return (
    <div className="w-full text-slate-900 dark:text-white transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#17A75B] text-xs font-bold uppercase tracking-wider mb-6">
          <ShieldCheck className="size-3.5" />
          <span>Security & Trust Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] tracking-tight text-slate-900 dark:text-white">
          Bank-Grade Escrow & Automated Fraud Defense.
        </h1>

        <p className="mt-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Kpugi is engineered from the ground up to protect every single Naira. We eliminate non-human traffic for brands and guarantee on-time payment settlement for creators.
        </p>
      </section>

      {/* ─── 4 PILLARS OF SECURITY ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="size-12 rounded-2xl bg-[#17A75B]/10 text-[#17A75B] flex items-center justify-center">
              <Lock className="size-6" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              100% Automated Escrow Vaults
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              When a brand funds a campaign drop, 100% of the capital is locked in an isolated programmatic escrow balance. Funds are never paid upfront and cannot be prematurely drained. If a campaign finishes with unclaimed views, remaining funds return immediately to the brand wallet.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="size-12 rounded-2xl bg-blue-500/10 text-[#2F49E8] dark:text-blue-400 flex items-center justify-center">
              <Eye className="size-6" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Anti-Fraud AI View Auditing
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Our automated scraping pipeline continuously monitors post performance across official platform APIs (TikTok API, Meta Graph API, YouTube Data API). View velocity anomaly detectors detect artificial engagement spikes and bot-farm traffic, ensuring brands only pay for organic reach.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Server className="size-6" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Licensed Payment Infrastructure
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              All fiat transactions, deposits, and creator withdrawals are powered by PCI-DSS compliant payment processing infrastructure with 256-bit SSL encryption. Bank details are never stored in plaintext and payouts settle reliably into Nigerian commercial banks.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <FileCheck2 className="size-6" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Strict Creative & Platform Compliance
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every campaign drop undergoes verification to ensure compliance with Nigerian advertising standards. Fraudulent schemes, unlicenced crypto platforms, and deceptive financial offers are proactively rejected to protect both creators and consumers.
            </p>
          </div>

        </div>

        {/* Security Reporting Banner */}
        <div className="mt-12 p-8 rounded-3xl bg-slate-100/60 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Responsible Disclosure & Security Reports</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Found a security vulnerability or anomalous behavior? Report directly to our engineering desk at <span className="font-mono text-blue-600 dark:text-blue-400">security@kpugi.com</span>.
            </p>
          </div>
          <Link
            href="/escrow-policy"
            className="shrink-0 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold transition-all"
          >
            <span>Read Escrow Policy</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
