import React from 'react';
import { Metadata } from 'next';
import CalculatorPageClient from './CalculatorPageClient';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    absolute: 'Creator Payout & CPM Calculator | Kpugi',
  },
  description:
    'Calculate your creator earnings per 1,000 verified views on Instagram Reels, TikTok, and X. Grab ready brand creatives, post to socials, and get paid 90% direct bank payouts.',
  keywords: [
    'creator earnings calculator',
    'CPM calculator Nigeria',
    'TikTok payout calculator',
    'Instagram Reels earnings estimator',
    'brand drops for creators',
    'creator economy Nigeria',
    'influencer payout rates',
    'earn money posting brand flyers',
    'how much does TikTok pay per 1000 views',
    'Kpugi creator calculator',
    'micro influencer paid campaigns',
  ],
  alternates: {
    canonical: '/calculator',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: `${siteUrl}/calculator`,
    siteName: 'Kpugi',
    title: 'Creator Payout & CPM Calculator | Kpugi',
    description:
      'Calculate your creator earnings per 1,000 verified views on Instagram Reels, TikTok, and X. Grab ready brand creatives, post to socials, and get paid 90% direct bank payouts.',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Kpugi Creator Earnings Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creator Payout & CPM Calculator | Kpugi',
    description:
      'Calculate your creator earnings per 1,000 verified views on Instagram Reels, TikTok, and X. Transparent 10% platform fee.',
    images: ['/kpugi_logo.png'],
    creator: '@kpugi_hq',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function CalculatorPage() {
  const jsonLdWebapp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kpugi Creator Earnings & CPM Calculator',
    url: `${siteUrl}/calculator`,
    description:
      'Free interactive calculator to estimate creator earnings across Instagram Reels, TikTok, and X based on verified views and ready brand creative drops.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'Kpugi',
      url: siteUrl,
    },
  };

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do I have to film or edit videos to earn on Kpugi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No! Brands supply 100% of the ad creatives — including ready flyers, banners, and official promo clips. You simply grab the asset, copy the caption, post it to your Instagram Reels, TikTok, or X feed, and get paid for verified views without filming or editing.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Kpugi calculate creator CPM payouts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Creator payouts are calculated based on verified views delivered. Default ready creative CPM starts at ₦2,000 per 1,000 verified views, with official video clips at ₦3,500 and multi-platform omnichannel campaigns scaling up to ₦5,000+ CPM.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Kpugi’s platform commission?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Kpugi charges a transparent 10% platform fee on campaign drops. Creators retain 90% of gross funds directly into their verified Nigerian bank account (NUBAN).',
        },
      },
      {
        '@type': 'Question',
        name: 'When do I get paid for my verified views?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Views are audited hourly (every 60 minutes). Once verified views pass pending clearance and enter your Available Balance, you can place a withdrawal request to be paid into your Nigerian bank account every Friday.',
        },
      },
    ],
  };

  const jsonLdBreadcrumbs = {
    '@context': 'https://schema.org',
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
        name: 'Resources & Tools',
        item: `${siteUrl}/calculator`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Creator CPM Calculator',
        item: `${siteUrl}/calculator`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebapp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <CalculatorPageClient />
    </>
  );
}
