import React from 'react';
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import AboutPageClient from '@/components/marketing/AboutPageClient';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'About Us — Nigeria’s Verified Creator Performance Network | Kpugi',
  description:
    'Discover Kpugi — the automated creator performance ad network and escrow protocol connecting Nigerian brands with verified creators on guaranteed CPM.',
  keywords: [
    'About Kpugi',
    'performance ad network Nigeria',
    'creator marketplace Nigeria',
    'influencer marketing escrow Nigeria',
    'verified view advertising',
    'CPM creator payouts Nigeria',
    'creator economy Africa',
    'pay per view Nigeria',
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: `${siteUrl}/about`,
    siteName: 'Kpugi',
    title: 'About Us — Nigeria’s Verified Creator Performance Network | Kpugi',
    description:
      'Where verified reach meets guaranteed payouts. Learn how Kpugi connects Nigerian brands and creators with automated Paystack escrow, audited view verification, and guaranteed Friday payouts.',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'About Kpugi — Verified Creator Performance Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    title: 'About Us — Nigeria’s Verified Creator Performance Network | Kpugi',
    description:
      'Where verified reach meets guaranteed payouts. The automated creator performance ad network and escrow protocol for Nigeria.',
    images: ['/kpugi_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 60; // Revalidate every 60 seconds

async function getAboutPageData() {
  try {
    const supabase = createAdminClient();

    // Query genuine counts and metrics
    const [creatorsRes, campaignsRes, submissionsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'creator'),
      supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('submissions').select('final_view_count, payout_amount'),
    ]);

    const totalViews = (submissionsRes.data || []).reduce(
      (acc, s) => acc + (Number(s.final_view_count) || 0),
      0
    );

    const totalEarnings = (submissionsRes.data || []).reduce(
      (acc, s) => acc + (Number(s.payout_amount) || 0),
      0
    );

    return {
      activeCreators: creatorsRes.count || 0,
      activeCampaigns: campaignsRes.count || 0,
      totalViews,
      totalEarnings,
    };
  } catch (err) {
    console.error('Error fetching about page telemetry:', err);
    return {
      activeCreators: 0,
      activeCampaigns: 0,
      totalViews: 0,
      totalEarnings: 0,
    };
  }
}

export default async function AboutPage() {
  const realStats = await getAboutPageData();

  // JSON-LD structured data for search engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Kpugi',
    url: `${siteUrl}/about`,
    description:
      'Kpugi is Nigeria’s premiere automated creator performance ad network connecting advertisers with verified creators with automated escrow and guaranteed Friday payouts.',
    publisher: {
      '@type': 'Organization',
      name: 'Kpugi Inc.',
      url: siteUrl,
      logo: `${siteUrl}/kpugi_logo.png`,
      foundingLocation: {
        '@type': 'Place',
        name: 'Bonny Island, Rivers State, Nigeria',
      },
      sameAs: [
        'https://x.com/kpugi_hq',
        'https://instagram.com/kpugi_hq',
        'https://facebook.com/kpugi_hq',
        'https://linkedin.com/company/kpugi_hq',
        'https://youtube.com/@kpugi_hq',
        'https://blog.kpugi.com',
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutPageClient realStats={realStats} />
    </>
  );
}
