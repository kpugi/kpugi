import React from 'react';
import { Metadata } from 'next';
import AdvertisePageClient from '@/components/marketing/AdvertisePageClient';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Advertise on Kpugi — Display Banners & On-Platform Sponsorships',
  description:
    'Put your brand in front of thousands of active Nigerian creators, influencers, and business owners. Run high-impact leaderboard banners, MPU units, skyscrapers, and newsletter sponsorships on Kpugi.',
  keywords: [
    'Advertise on Kpugi',
    'Kpugi banner ads',
    'display advertising Nigeria',
    'sponsor creator newsletter Nigeria',
    'leaderboard ad placements',
    'reach Nigerian creators',
    'reach Nigerian brands',
    'fintech advertising Nigeria',
    'b2b ads Nigeria',
  ],
  alternates: {
    canonical: '/advertise',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: `${siteUrl}/advertise`,
    siteName: 'Kpugi',
    title: 'Advertise on Kpugi — Display Banners & On-Platform Sponsorships',
    description:
      'Put your brand in front of thousands of active Nigerian creators, influencers, and business owners. Run high-impact display banners and sponsorships on Kpugi.',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Advertise on Kpugi — Display Banners & Sponsorships',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    title: 'Advertise on Kpugi — Display Banners & On-Platform Sponsorships',
    description:
      'Reach thousands of active Nigerian creators and business owners directly on Kpugi.',
    images: ['/kpugi_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AdvertisePage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${siteUrl}/advertise#webpage`,
      url: `${siteUrl}/advertise`,
      name: 'Advertise on Kpugi — Display Banners & On-Platform Sponsorships',
      description:
        'Put your brand in front of thousands of active Nigerian creators, influencers, and business owners with leaderboard banners, MPU units, skyscrapers, and newsletter sponsorships.',
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
            name: 'Advertise',
            item: `${siteUrl}/advertise`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Ad Specifications',
            item: `${siteUrl}/advertise#ad-specs`,
          },
        ],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${siteUrl}/advertise#service`,
      name: 'Kpugi On-Platform Advertising & Sponsorships',
      provider: {
        '@type': 'Organization',
        name: 'Kpugi Inc.',
        url: siteUrl,
        logo: `${siteUrl}/kpugi_logo.png`,
      },
      description:
        'Display banner advertising, billboard placements, and newsletter sponsorships reaching verified Nigerian creators and marketing decision-makers.',
      areaServed: 'NG',
      offers: {
        '@type': 'OfferCatalog',
        name: 'Kpugi Display Advertising Formats',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Leaderboard & Billboard Banner (970x250 / 728x90)',
              description: 'Top-of-page prime display banner across the campaign catalog and dashboard headers.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Medium Rectangle MPU (300x250)',
              description: 'In-feed native banner placed directly between campaign cards and verification screens.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Half-Page Skyscraper (300x600)',
              description: 'Towering persistent vertical banner on desktop sidebars and analytics views.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Mobile Anchor Banner (320x50 / 320x100)',
              description: 'Fixed bottom screen banner for mobile creators and active smartphone browsers.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Friday Payout Newsletter Sponsorship',
              description: 'Dedicated sponsor placement inside verified creator payout notification emails.',
            },
          },
        ],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${siteUrl}/advertise#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What ad formats are available on Kpugi?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Kpugi supports standard IAB display placements including Billboard/Leaderboard (970x250 / 728x90), Medium Rectangle MPU (300x250), Half-Page Skyscraper (300x600), Mobile Anchor Banner (320x50), and dedicated Friday Payout newsletter sponsorships.',
          },
        },
        {
          '@type': 'Question',
          name: 'What file formats and file sizes are supported for banners?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We accept static and animated PNG, JPG, and WebP files. Max file size is 250KB for billboards, 150KB for MPU banners, and 100KB for mobile anchor units.',
          },
        },
        {
          '@type': 'Question',
          name: 'How quickly can an advertising campaign go live?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our dedicated ad operations team reviews creative assets, sets up tracking tags, and coordinates flight launch within 24 hours of booking submission.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can we track clicks and conversions with custom UTM parameters?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. All placements support custom destination URLs with UTM tags for Google Analytics, Mixpanel, and PostHog tracking, plus weekly impression and click reporting.',
          },
        },
        {
          '@type': 'Question',
          name: 'What audience will see our ad banners on Kpugi?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Your ads reach verified Nigerian content creators, influencers, digital marketers, startup founders, and brand media buyers who actively use Kpugi daily to discover drops and track campaign payouts.',
          },
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AdvertisePageClient />
    </>
  );
}
