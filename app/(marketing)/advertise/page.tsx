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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
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
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Medium Rectangle MPU (300x250)',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Half-Page Skyscraper (300x600)',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Friday Payout Newsletter Sponsorship',
          },
        },
      ],
    },
  };

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
