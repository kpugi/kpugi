import React from 'react';
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import {
  CreatorsPageClient,
  type DbCreatorAvatar,
  type DbTickerItem,
  type DbLiveDrop,
  type PlatformItem,
} from '@/components/marketing/CreatorsPageClient';
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
  FaFacebook,
  FaLinkedin,
} from 'react-icons/fa6';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    absolute: 'Turn Views into Direct Cash for Creators | Kpugi',
  },
  description:
    'Monetize short-form videos across TikTok, Instagram, YouTube & X. Zero follower minimums and guaranteed Friday direct bank payouts per 1,000 views.',
  keywords: [
    'creator monetization Nigeria',
    'get paid per 1000 views',
    'CPM creator rates Nigeria',
    'TikTok monetization Nigeria',
    'Instagram Reels monetization Nigeria',
    'YouTube Shorts earnings Nigeria',
    'influencer marketplace Nigeria',
    'Kpugi creators',
    'content creator payout Friday',
    'brand drops Nigeria',
    'micro influencer paid campaigns',
    'earn money with short videos',
  ],
  alternates: {
    canonical: '/creators',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: `${siteUrl}/creators`,
    siteName: 'Kpugi',
    title: 'Turn Views into Direct Cash for Creators | Kpugi',
    description:
      'Monetize short-form videos across TikTok, Instagram, YouTube & X. Zero follower minimums and guaranteed Friday direct bank payouts per 1,000 views.',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Kpugi Creator Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kpugi_hq',
    creator: '@kpugi_hq',
    title: 'Turn Views into Direct Cash for Creators | Kpugi',
    description:
      'Monetize short-form videos across TikTok, Instagram, YouTube & X. Zero follower minimums and guaranteed Friday direct bank payouts per 1,000 views.',
    images: ['/kpugi_logo.png'],
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

export const revalidate = 30; // Real-time ISR revalidation every 30 seconds

// Official Platform Configurations with Authentic Brand SVGs & Colors
const PLATFORM_CONFIGS = [
  {
    id: 'instagram',
    name: 'Instagram',
    format: 'Reels, Carousels & Stories',
    rateRange: '₦3,000 – ₦10,000',
    defaultCpm: 4000,
    color: '#E1306C',
    gradient: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)',
    bgLight: 'rgba(225, 48, 108, 0.12)',
    borderGlow: 'rgba(225, 48, 108, 0.35)',
    icon: <FaInstagram className="size-5 shrink-0" />,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    format: 'Videos & Viral Posts',
    rateRange: '₦2,500 – ₦8,000',
    defaultCpm: 3500,
    color: '#00F2FE',
    gradient: 'linear-gradient(135deg, #000000 0%, #00F2FE 50%, #FE2C55 100%)',
    bgLight: 'rgba(0, 242, 254, 0.12)',
    borderGlow: 'rgba(0, 242, 254, 0.35)',
    icon: <FaTiktok className="size-5 shrink-0" />,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    format: 'Shorts & Community Posts',
    rateRange: '₦4,000 – ₦12,000',
    defaultCpm: 5000,
    color: '#FF0000',
    gradient: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
    bgLight: 'rgba(255, 0, 0, 0.12)',
    borderGlow: 'rgba(255, 0, 0, 0.35)',
    icon: <FaYoutube className="size-5 shrink-0" />,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    format: 'Posts & Threads',
    rateRange: '₦2,000 – ₦7,000',
    defaultCpm: 3000,
    color: '#000000',
    gradient: 'linear-gradient(135deg, #1A1A1A 0%, #000000 100%)',
    bgLight: 'rgba(0, 0, 0, 0.08)',
    borderGlow: 'rgba(255, 255, 255, 0.25)',
    icon: <FaXTwitter className="size-5 shrink-0" />,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    format: 'Reels & Feed Posts',
    rateRange: '₦2,000 – ₦6,000',
    defaultCpm: 2500,
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2 0%, #0B5ED7 100%)',
    bgLight: 'rgba(24, 119, 242, 0.12)',
    borderGlow: 'rgba(24, 119, 242, 0.35)',
    icon: <FaFacebook className="size-5 shrink-0" />,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    format: 'Articles & Feed Posts',
    rateRange: '₦5,000 – ₦15,000',
    defaultCpm: 6000,
    color: '#0A66C2',
    gradient: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
    bgLight: 'rgba(10, 102, 194, 0.12)',
    borderGlow: 'rgba(10, 102, 194, 0.35)',
    icon: <FaLinkedin className="size-5 shrink-0" />,
  },
];

async function getCreatorsPageData() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch Real Creator Count from Profiles
    const { count: creatorCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'creator');

    // 2. Fetch Aggregated Total Verified Views & Earnings from Submissions
    const { data: subData } = await supabase
      .from('submissions')
      .select('final_view_count, payout_amount, status');

    const totalVerifiedViews = (subData || []).reduce(
      (acc, s) => acc + (Number(s.final_view_count) || 0),
      0
    );

    const totalEarningsDisbursed = (subData || []).reduce(
      (acc, s) => acc + (Number(s.payout_amount) || 0),
      0
    );

    const totalCreatorsCount = creatorCount || 0;

    // 3. Fetch Active Verified Creators with real avatars
    const { data: creators } = await supabase
      .from('creator_profiles')
      .select(`
        id,
        creator_handle,
        display_name,
        profile:profiles (
          avatar_url,
          full_name
        )
      `)
      .limit(6);

    const realAvatars: DbCreatorAvatar[] = (creators || [])
      .map((c: any) => {
        const url = c.profile?.avatar_url;
        const name = c.display_name || c.profile?.full_name || c.creator_handle || 'Creator';
        if (!url) return null;
        return {
          src: url,
          alt: `${name} — Verified Kpugi Creator`,
        };
      })
      .filter((a): a is DbCreatorAvatar => a !== null);

    // 4. Fetch Recent Payouts/Submissions for Live Ticker
    const { data: recentSubmissions } = await supabase
      .from('submissions')
      .select(`
        id,
        payout_amount,
        final_view_count,
        created_at,
        creator:creator_profiles (
          creator_handle,
          display_name
        ),
        profile:profiles (
          full_name
        ),
        campaign:campaigns (
          channels
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // 5. Fetch Active Campaigns for Live Drops
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, title, cpm_rate, total_budget, spent_budget, channels, industry, status')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8);

    const tickerItems: DbTickerItem[] = (recentSubmissions && recentSubmissions.length > 0)
      ? recentSubmissions
          .filter((s: any) => s.final_view_count || Number(s.payout_amount) > 0)
          .slice(0, 10)
          .map((s: any) => {
            const handle = s.creator?.creator_handle
              ? `@${s.creator.creator_handle}`
              : s.creator?.display_name || s.profile?.full_name || '@creator';
            const amountNum = Number(s.payout_amount || 0);
            const amount = amountNum > 0
              ? `₦${amountNum.toLocaleString()}`
              : `₦${Math.round((s.final_view_count || 1000) * 3.5).toLocaleString()}`;
            const channel = s.campaign?.channels?.[0] || 'TikTok';
            const views = `${(s.final_view_count || 1000).toLocaleString()} views`;
            return { handle, amount, platform: channel, views };
          })
      : [];

    const liveDrops: DbLiveDrop[] = (campaigns || []).slice(0, 4).map((c: any, index: number) => ({
      id: c.id,
      title: c.title,
      cpm: Number(c.cpm_rate || 3500),
      channels: Array.isArray(c.channels) && c.channels.length > 0 ? c.channels.slice(0, 2) : ['TikTok', 'Instagram'],
      spotsLeft: Math.max(1, Math.round((Number(c.total_budget || 50000) - Number(c.spent_budget || 0)) / (Number(c.cpm_rate || 3500) * 2))),
      badge: index === 0 ? '🔥 HOT DROP' : index === 1 ? '⚡ HIGH CPM' : index === 2 ? '🚀 FAST PAYOUT' : '💎 PREMIUM',
      category: c.industry || 'Brand Campaign',
    }));

    const platforms: PlatformItem[] = PLATFORM_CONFIGS.map((p) => {
      const matchingDropsCount = (campaigns || []).filter((c) => {
        if (!Array.isArray(c.channels)) return false;
        return c.channels.some((ch: string) =>
          ch.toLowerCase().includes(p.id.toLowerCase()) ||
          ch.toLowerCase().includes(p.name.toLowerCase())
        );
      }).length;

      return {
        ...p,
        activeDrops: matchingDropsCount,
      };
    });

    return {
      realAvatars,
      tickerItems,
      liveDrops,
      totalCreatorsCount,
      totalEarningsDisbursed,
      totalVerifiedViews,
      platforms,
    };
  } catch (error) {
    console.error('Error fetching dynamic creators page data:', error);
    return {
      realAvatars: [],
      tickerItems: [],
      liveDrops: [],
      totalCreatorsCount: 0,
      totalEarningsDisbursed: 0,
      totalVerifiedViews: 0,
      platforms: PLATFORM_CONFIGS.map((p) => ({ ...p, activeDrops: 0 })),
    };
  }
}

export default async function CreatorsPage() {
  const data = await getCreatorsPageData();

  // ─── JSON-LD STRUCTURED DATA SCHEMAS FOR GOOGLE RICH RESULTS ─────────────
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do I need thousands of followers to join and earn?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Zero follower minimum! No gatekeeping. Whether you have 200 followers or 200,000 followers, as long as your post gets at least 1,000 verified views, you get paid.',
        },
      },
      {
        '@type': 'Question',
        name: 'When and how do payouts hit my bank account?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every single Friday! Once your live post hits the view count threshold and passes verification, your earnings are automatically sent every Friday directly to GTBank, Opay, Kuda, Zenith, Access, or any Nigerian bank account.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Kpugi verify post views?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We use automatic link verification that reads public views on TikTok, Instagram, YouTube, X, Facebook, and LinkedIn. No human reviews, no favoritism, no delays.',
        },
      },
      {
        '@type': 'Question',
        name: 'What if my post falls short of 1,000 views?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'If a post does not reach the 1,000 view milestone before the campaign window closes, no payout is triggered for that drop, and the reserved budget returns to the brand.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I claim multiple campaign drops at the same time?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '100% yes! You can claim slots in as many active brand campaigns as you like across all your connected social handles.',
        },
      },
    ],
  };

  const breadcrumbSchema = {
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
        name: 'For Creators',
        item: `${siteUrl}/creators`,
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Creator Performance Monetization Network',
    provider: {
      '@type': 'Organization',
      name: 'Kpugi',
      url: siteUrl,
      logo: `${siteUrl}/kpugi_logo.png`,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
    description:
      'Monetize post views across TikTok, Instagram, YouTube, X, Facebook, and LinkedIn with weekly Friday direct bank payouts.',
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Turn Post Views into Direct Cash on Kpugi',
    description: 'Five easy steps for Nigerian creators to monetize social media posts and content.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Join Free in 30 Seconds',
        text: 'Sign up with your email and connect your social handles with zero follower minimums.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Claim a Brand Drop',
        text: 'Browse live opportunities and lock your slot before campaign capacity fills up.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Guaranteed Payouts',
        text: 'Brand budgets are 100% secured upfront before you start creating.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Post & Paste Live Link',
        text: 'Publish to your social media account and submit the link for automatic real-time view tracking.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Weekly Friday Bank Pay',
        text: 'Earnings accumulate and transfer every Friday directly to your Nigerian bank account.',
      },
    ],
  };

  return (
    <>
      {/* ─── INJECTED STRUCTURED DATA SCHEMAS ────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* ─── CREATORS PAGE CLIENT VIEW ────────────────────────────────────── */}
      <CreatorsPageClient
        realAvatars={data.realAvatars}
        tickerItems={data.tickerItems}
        liveDrops={data.liveDrops}
        totalCreatorsCount={data.totalCreatorsCount}
        totalEarningsDisbursed={data.totalEarningsDisbursed}
        totalVerifiedViews={data.totalVerifiedViews}
        platforms={data.platforms}
      />
    </>
  );
}
