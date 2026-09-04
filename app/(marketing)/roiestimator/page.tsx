import React from 'react';
import { Metadata } from 'next';
import RoiEstimatorPageClient from './RoiEstimatorPageClient';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    absolute: 'Brand Campaign ROI Estimator | Kpugi',
  },
  description:
    'Estimate your influencer campaign reach, guaranteed verified views, and expected ROI. Upload ready brand creatives, flyers, or video clips and syndicate across hundreds of creators with automated escrow.',
  keywords: [
    'influencer marketing ROI calculator',
    'brand campaign budget estimator',
    'guaranteed views calculator',
    'syndicate brand creatives',
    'WhatsApp advertising Nigeria',
    'influencer CPM rates Nigeria',
    'cost per thousand views TikTok',
    'Instagram ad ROI estimator',
    'performance influencer marketing',
    'anti-fraud influencer views',
    'Kpugi brand ROI estimator',
    'social media ad drop',
  ],
  alternates: {
    canonical: '/roiestimator',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: `${siteUrl}/roiestimator`,
    siteName: 'Kpugi',
    title: 'Brand Campaign ROI Estimator | Kpugi',
    description:
      'Estimate your influencer campaign reach, guaranteed verified views, and expected ROI. Upload ready brand creatives and syndicate across hundreds of verified creators with automated escrow.',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Kpugi Brand Campaign ROI Estimator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brand Campaign ROI Estimator | Kpugi',
    description:
      'Estimate your influencer marketing reach, guaranteed views, and expected ROI. Upload ready creatives and syndicate across verified creators with automated escrow.',
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

export default function RoiEstimatorPage() {
  const jsonLdWebapp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kpugi Brand Campaign ROI Estimator',
    url: `${siteUrl}/roiestimator`,
    description:
      'Interactive campaign ROI and reach estimator for brands and advertisers. Calculate guaranteed verified impressions, cost savings vs agencies, and ready creative syndication.',
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
        name: 'Can our marketing team upload our own ready creatives, flyers, and banners?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! That is the core superpower of Kpugi. You can upload ready promotional graphics, discount flyers, product announcement banners, or official video ads. Creators in our network grab these assets directly from your drop and post them with your pre-approved caption and trackable links.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens if a creator fails to hit the expected view milestones?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'With Kpugi’s automated performance escrow, you only pay for actual verified views delivered. If a drop falls short of its projected target within the flight window, unspent funds are automatically credited back to your brand wallet.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Kpugi prevent bot views and artificial engagement?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every video and status submission undergoes automated algorithmic audit. We analyze audience geolocation, view velocity, completion rate, and comment authenticity to purge invalid bot traffic before views are credited.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the minimum budget required to launch a campaign drop?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Campaign drops start as low as ₦100,000 (approx $70 USD), allowing you to test creator performance with guaranteed reach before scaling to multimillion-view deployments.',
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
        item: `${siteUrl}/roiestimator`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Brand Campaign ROI Estimator',
        item: `${siteUrl}/roiestimator`,
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
      <RoiEstimatorPageClient />
    </>
  );
}
