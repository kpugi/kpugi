import React from 'react';
import { Metadata } from 'next';
import BrowseCampaignsClientView from '@/components/browse/BrowseCampaignsClientView';

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
const pageUrl = `${appUrl}/browse`;

export const metadata: Metadata = {
  title: 'Browse Campaigns — Verified CPM Placements',
  description:
    'Browse verified live CPM campaigns from top brands in Nigeria. Get paid per 1,000 verified views on TikTok, Instagram, and YouTube via escrow.',
  keywords: [
    'Kpugi',
    'Browse Campaigns',
    'Creator CPM Nigeria',
    'Influencer Marketing Nigeria',
    'Monetize TikTok Nigeria',
    'Monetize Instagram Nigeria',
    'Monetize YouTube Nigeria',
    'Verified Views',
    'Paystack Creator Payouts',
    'Micro-influencer Campaigns',
    'UGC Creators Nigeria',
  ],
  authors: [{ name: 'Kpugi Technologies' }],
  creator: 'Kpugi',
  publisher: 'Kpugi Technologies',
  alternates: {
    canonical: '/browse',
  },
  openGraph: {
    title: 'Browse Campaigns — Verified CPM Placements | Kpugi',
    description:
      'Browse verified live CPM campaigns from top brands in Nigeria. Get paid per 1,000 verified views on TikTok, Instagram, and YouTube.',
    url: pageUrl,
    siteName: 'Kpugi',
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: `${appUrl}/images/kpugi_promo_banner.png`,
        width: 1200,
        height: 630,
        alt: 'Kpugi - Browse Verified Creator Campaigns',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Campaigns — Verified CPM Placements | Kpugi',
    description:
      'Browse verified live CPM campaigns from top brands in Nigeria. Get paid per 1,000 verified views on TikTok, Instagram, and YouTube.',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    images: [`${appUrl}/images/kpugi_promo_banner.png`],
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

export default function BrowsePage() {
  // 1. Breadcrumb Schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: appUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Browse Campaigns',
        item: pageUrl,
      },
    ],
  };

  // 2. CollectionPage & ItemList Schema
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Browse Creator Campaigns on Kpugi',
    description:
      'Verified performance-based creator campaigns in Nigeria across TikTok, Instagram, YouTube, and X.',
    url: pageUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Tech & SaaS Campaigns',
          description: 'Monetize tech product reviews, app launches, and software tutorials.',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Fintech & Finance Campaigns',
          description: 'Promote banking apps, savings tools, and investment platforms at competitive CPM rates.',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Lifestyle, Fashion & Beauty Campaigns',
          description: 'Partner with top consumer brands for video reviews and lifestyle placements.',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Food & FMCG Campaigns',
          description: 'Create engaging short-form video content for culinary and restaurant brands.',
        },
      ],
    },
  };

  // 3. WebSite with SearchAction Schema
  const websiteSearchJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: appUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${pageUrl}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // 4. FAQ Schema for Google Rich Snippets
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do creators earn money on Kpugi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Creators browse open brand campaigns, join with their connected social handles, publish creative posts following the campaign brief, and submit their link. Kpugi automated auditor verifies real-time view counts and releases escrow payments based on the agreed CPM rate directly to your bank account via Paystack.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is CPM and how is payout calculated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CPM stands for Cost Per Mille (cost per 1,000 views). For example, if a campaign offers a ₦2,500 CPM and your video earns 20,000 verified views, your payout is ₦50,000.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are payments guaranteed on Kpugi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Every brand on Kpugi pre-funds 100% of their campaign budget into escrow before launching. Once your post meets the campaign guidelines and view threshold, your funds are cleared automatically with zero risk of non-payment.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can micro-influencers join campaigns?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. Kpugi is performance-based. You do not need millions of followers—as long as your content drives real verified views that meet the minimum threshold, you earn.',
        },
      },
    ],
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────
         JSON-LD STRUCTURED DATA INJECTIONS (SEO Rich Snippets)
      ───────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSearchJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <BrowseCampaignsClientView />
    </>
  );
}
