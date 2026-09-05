import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Briefcase, Code, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Careers — Build the Infrastructure for African Creator Commerce | Kpugi',
  description:
    'Join Kpugi. We are engineering high-throughput audit pipelines, automated fraud detection, and instant bank settlement for millions of creators and brands across Africa.',
  keywords: [
    'Kpugi careers',
    'tech jobs Nigeria',
    'software engineering jobs Nigeria',
    'creator economy startups Africa',
  ],
  alternates: {
    canonical: '/careers',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: `${siteUrl}/careers`,
    siteName: 'Kpugi',
    title: 'Careers — Build the Infrastructure for African Creator Commerce | Kpugi',
    description:
      'We are engineering high-throughput audit pipelines, automated fraud detection, and instant bank settlement for millions of creators across Africa.',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Careers at Kpugi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    title: 'Careers at Kpugi',
    description: 'Build the infrastructure for African creator commerce.',
    images: ['/kpugi_logo.png'],
  },
};

export default function CareersPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': `${siteUrl}/careers#webpage`,
      url: `${siteUrl}/careers`,
      name: 'Careers at Kpugi',
      description:
        'Engineering high-throughput audit pipelines, automated fraud detection, and instant bank settlement for African creators.',
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
            name: 'Careers',
            item: `${siteUrl}/careers`,
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-6">
          <Briefcase className="size-3.5" />
          <span>Careers at Kpugi</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] tracking-tight text-slate-900 dark:text-white">
          Build the Infrastructure for Creator Commerce.
        </h1>

        <p className="mt-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          We’re engineering high-throughput audit pipelines, automated fraud detection, and instant payment settlement for millions of creators and brands across Africa.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0B1021] border border-slate-200/80 dark:border-white/10 shadow-sm text-center space-y-4">
          <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <Code className="size-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            No Open Positions Right Now
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            We operate lean, but we are always eager to connect with exceptional distributed systems engineers, scrapers, and growth strategists.
          </p>
          <div className="pt-2">
            <a
              href="mailto:careers@kpugi.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2F49E8] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all"
            >
              <span>Send Your Portfolio to careers@kpugi.com</span>
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
