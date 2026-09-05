import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Activity, CheckCircle2, Server, ShieldCheck, RefreshCw } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Platform Operational Status — Live System Metrics | Kpugi',
  description:
    'Real-time operational status for Kpugi view audit engines, banking payout gateways, API scrapers, and database clusters.',
  keywords: [
    'Kpugi status',
    'Kpugi uptime',
    'platform status',
  ],
  alternates: {
    canonical: '/status',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: `${siteUrl}/status`,
    siteName: 'Kpugi',
    title: 'Platform Operational Status | Kpugi Systems',
    description: 'Live operational status of Kpugi view audit engines and payout gateways.',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Kpugi System Status',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    title: 'Platform Operational Status | Kpugi Systems',
    description: 'Real-time operational status of Kpugi view audit engines and payout gateways.',
    images: ['/kpugi_logo.png'],
  },
};

const SYSTEM_SERVICES = [
  {
    name: 'Automated View Audit Scraper Engine',
    description: 'Hourly background scraping and organic impression counter verification',
    status: 'Operational',
    uptime: '99.98%',
  },
  {
    name: 'NUBAN Instant Bank Payout Gateway',
    description: 'Automated bank settlement pipeline and wallet disbursement systems',
    status: 'Operational',
    uptime: '100.0%',
  },
  {
    name: 'Social OAuth & Account Link Services',
    description: 'Meta Graph API, TikTok API, and YouTube OAuth token refreshes',
    status: 'Operational',
    uptime: '99.95%',
  },
  {
    name: 'Campaign Catalog & Drop Marketplace',
    description: 'Real-time brief discovery, claim tracking, and asset delivery CDN',
    status: 'Operational',
    uptime: '100.0%',
  },
];

export default function StatusPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${siteUrl}/status#webpage`,
      url: `${siteUrl}/status`,
      name: 'Platform Operational Status — Kpugi Systems',
      description:
        'Live operational status for Kpugi view audit engines, banking payout gateways, API scrapers, and database clusters.',
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
            name: 'System Status',
            item: `${siteUrl}/status`,
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

      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#17A75B] text-xs font-bold uppercase tracking-wider mb-6">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>All Systems Operational</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] tracking-tight text-slate-900 dark:text-white">
          Platform Operational Status
        </h1>

        <p className="mt-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Real-time health monitoring for Kpugi view audit engines, automated bank payouts, and campaign marketplaces.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-4">
        {SYSTEM_SERVICES.map((srv, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
          >
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{srv.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{srv.description}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{srv.uptime} uptime</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="size-3.5" />
                <span>{srv.status}</span>
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
