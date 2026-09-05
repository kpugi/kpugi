import React from 'react';
import { Metadata } from 'next';
import ContactBlock from '@/components/marketing/ContactBlock';
import ContactInquirySection from '@/components/marketing/ContactInquirySection';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Contact Us — Fast Support & Brand Partnerships | Kpugi',
  description:
    'Get in touch with Kpugi. Dedicated support for Nigerian brands and creators. Fast responses for campaign planning, escrow funding, post verification, and Friday payouts.',
  keywords: [
    'Contact Kpugi',
    'Kpugi support',
    'brand partnerships Nigeria',
    'creator support Nigeria',
    'influencer marketing contact',
    'performance ad network help',
  ],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: `${siteUrl}/contact`,
    siteName: 'Kpugi',
    title: 'Contact Us — Fast Support & Brand Partnerships | Kpugi',
    description:
      'Get in touch with Kpugi. Dedicated support for Nigerian brands and creators with fast resolutions under 2 hours.',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Contact Kpugi Support & Partnerships',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    title: 'Contact Us — Fast Support & Brand Partnerships | Kpugi',
    description:
      'Get in touch with Kpugi. Dedicated channels for Nigerian brands and creators.',
    images: ['/kpugi_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Kpugi',
    url: `${siteUrl}/contact`,
    description:
      'Get in touch with the Kpugi team for brand partnerships, creator payouts, and technical support.',
    publisher: {
      '@type': 'Organization',
      name: 'Kpugi Inc.',
      url: siteUrl,
      logo: `${siteUrl}/kpugi_logo.png`,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          email: 'creators@kpugi.com',
          contactType: 'Creator Support',
          areaServed: 'NG',
          availableLanguage: ['English'],
        },
        {
          '@type': 'ContactPoint',
          email: 'brands@kpugi.com',
          contactType: 'Sales & Brand Partnerships',
          areaServed: 'NG',
          availableLanguage: ['English'],
        },
      ],
    },
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
          name: 'Contact',
          item: `${siteUrl}/contact`,
        },
      ],
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#05060A] text-slate-900 dark:text-white transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 1. Top Section: 4-Card Contact Block */}
      <ContactBlock />

      {/* 2. Main Section: Inquiry Form & Value Props */}
      <ContactInquirySection />

      {/* 3. Operational Transparency Footnote */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span className="font-bold text-slate-700 dark:text-slate-300 mr-2">Digital-First Operations:</span>
            <span>Kpugi operates as a remote-first platform across Nigeria. Registered origin: Kpugi Inc., Bonny Island, Rivers State, Nigeria.</span>
          </div>
          <div className="font-mono text-slate-400 dark:text-slate-500 shrink-0">
            Mon–Sat, 8:00 AM – 8:00 PM WAT
          </div>
        </div>
      </div>
    </div>
  );
}
