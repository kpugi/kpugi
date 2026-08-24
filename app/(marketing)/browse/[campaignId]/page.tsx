import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { getCampaignDetailsForCreator } from '@/lib/supabase/dashboard';
import CreatorCampaignDetailsView from '@/components/dashboard/CreatorCampaignDetailsView';

interface PageProps {
  params: Promise<{ campaignId: string }>;
}

function resolveValidImageUrl(imgUrl: string | null | undefined, base: string): string {
  if (!imgUrl) return `${base}/images/kpugi_promo_banner.png`;
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
    if (imgUrl.includes('ngrok-free.dev') || imgUrl.includes('localhost:3000')) {
      return imgUrl.replace(/^https?:\/\/[^\/]+/, base);
    }
    return imgUrl;
  }
  if (imgUrl.startsWith('/')) {
    return `${base}${imgUrl}`;
  }
  return `${base}/${imgUrl}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { campaignId } = await params;
  const campaignData = await getCampaignDetailsForCreator(campaignId, null);
  const campaign = campaignData.campaign;

  if (!campaign) {
    return {
      title: 'Campaign Not Found',
      description: 'The requested creator campaign could not be found on Kpugi.',
      robots: { index: false, follow: true },
    };
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const pageUrl = `${appUrl}/browse/${campaignId}`;
  const cpmDisplay = `₦${Number(campaign.cpm_rate || 0).toLocaleString()}`;
  const brandName = campaign.company_name || 'Brand Partner';
  const channels = (campaign.channels && campaign.channels.length > 0)
    ? campaign.channels.slice(0, 3).join(', ')
    : 'TikTok, Instagram';

  // Title without trailing '| Kpugi' so template in layout.tsx adds it cleanly without duplication
  const pageTitle = `${campaign.title}`;

  // Concise description (<155 chars) for perfect Ahrefs/Google SEO score
  const fullDesc = `Join ${campaign.title} by ${brandName} on Kpugi. Earn ${cpmDisplay} CPM per 1,000 verified views on ${channels}. Escrow-backed creator payouts.`;
  const description = fullDesc.length > 155 ? fullDesc.slice(0, 152) + '...' : fullDesc;

  const rawImage = campaign.cover_image_url || campaign.company_logo;
  const coverImage = resolveValidImageUrl(rawImage, appUrl);

  return {
    title: pageTitle,
    description,
    keywords: [
      'Kpugi',
      'Creator CPM',
      'Nigeria Creator Campaign',
      'Influencer Marketing Nigeria',
      'Verified Views',
      'Paystack Payouts',
      campaign.title,
      brandName,
      campaign.ad_format,
      ...(campaign.channels || []),
    ],
    authors: [{ name: brandName }, { name: 'Kpugi' }],
    creator: 'Kpugi',
    publisher: 'Kpugi Technologies',
    alternates: {
      canonical: `/browse/${campaignId}`,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: pageUrl,
      siteName: 'Kpugi',
      locale: 'en_NG',
      type: 'article',
      publishedTime: campaign.created_at,
      authors: [brandName],
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: `${campaign.title} - ${brandName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      site: '@kpugi_hq',
      creator: '@kpugi_hq',
      images: [coverImage],
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
}

export default async function BrowseCampaignDetailPage({ params }: PageProps) {
  const userProfile = await getOrCreateUserProfile();
  const creatorId = userProfile?.profile?.id || null;

  // If user is logged in, check onboarding
  if (userProfile && userProfile.profile && !userProfile.onboardingComplete) {
    redirect('/onboarding/role');
  }

  const { campaignId } = await params;
  const campaignData = await getCampaignDetailsForCreator(campaignId, creatorId);

  if (!campaignData.campaign) {
    redirect('/browse');
  }

  const campaign = campaignData.campaign;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';
  const pageUrl = `${appUrl}/browse/${campaignId}`;
  const brandName = campaign.company_name || 'Brand Partner';
  const cpmRate = Number(campaign.cpm_rate || 0);
  const minViews = Number(campaign.min_view_threshold || 1000);
  const coverImage = campaign.cover_image_url || campaign.company_logo || `${appUrl}/images/kpugi_promo_banner.png`;

  // 1. Breadcrumb Structured Data
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
        item: `${appUrl}/browse`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: campaign.title,
        item: pageUrl,
      },
    ],
  };

  // 2. Product / Offer Opportunity Structured Data
  const productOfferJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: campaign.title,
    description: campaign.description,
    image: coverImage,
    sku: campaign.campaign_code || `KPG-${campaign.id.slice(0, 8).toUpperCase()}`,
    brand: {
      '@type': 'Brand',
      name: brandName,
      logo: campaign.company_logo || undefined,
    },
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'NGN',
      price: cpmRate,
      priceValidUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: campaign.status === 'live' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Kpugi Technologies',
        url: appUrl,
        logo: `${appUrl}/kpugi_logo.png`,
      },
    },
  };

  // 3. FAQ Schema for Rich Google Search SERP Snippets
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How much does the ${campaign.title} campaign pay creators?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `This campaign pays ₦${cpmRate.toLocaleString()} CPM per 1,000 verified views, requiring a minimum of ${minViews.toLocaleString()} views. All funds are secured in Kpugi escrow and paid directly to creator bank accounts via Paystack upon automated verification.`,
        },
      },
      {
        '@type': 'Question',
        name: `Which social networks are accepted for ${campaign.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Eligible social media platforms for this campaign include ${(campaign.channels || ['TikTok', 'Instagram', 'YouTube']).join(', ')}.`,
        },
      },
      {
        '@type': 'Question',
        name: 'How does automated view auditing work on Kpugi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `After joining the campaign and posting with the official creative assets and mandatory tags, creators submit their post link. Kpugi automated view auditor tracks real-time view counts hourly for ${campaign.required_live_duration_hours} hours. Once verified, escrow funds are cleared automatically with zero manual delays.`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productOfferJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <CreatorCampaignDetailsView
        data={campaignData}
        campaignId={campaignId}
        userRole={userProfile?.role || 'public'}
      />
    </>
  );
}
