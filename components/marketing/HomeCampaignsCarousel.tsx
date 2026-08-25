'use client';

import React from 'react';
import Link from 'next/link';
import { Carousel, Card, type CardType } from '@/components/ui/apple-cards-carousel';
import { ArrowRight } from 'lucide-react';

function getFallbackImage(title: string, industry?: string) {
  const text = `${title} ${industry || ''}`.toLowerCase();
  if (text.includes('food') || text.includes('chowdeck') || text.includes('crav')) {
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop';
  }
  if (text.includes('piggy') || text.includes('sav') || text.includes('fintech') || text.includes('paystack') || text.includes('wealth')) {
    return 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop';
  }
  if (text.includes('phone') || text.includes('infinix') || text.includes('tech') || text.includes('mobile') || text.includes('device')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop';
  }
  if (text.includes('dragon') || text.includes('game') || text.includes('warrior')) {
    return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop';
  }
  if (text.includes('beauty') || text.includes('glow') || text.includes('zaron') || text.includes('makeup')) {
    return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop';
  }
  if (text.includes('launch') || text.includes('kpugi') || text.includes('media')) {
    return 'https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80&w=1200&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop';
}

export default function HomeCampaignsCarousel({
  campaigns = [],
}: {
  campaigns?: any[];
}) {
  // Map real database FEATURED campaigns into Apple Cards with direct links
  const cards: CardType[] =
    campaigns && campaigns.length > 0
      ? campaigns.map((c: any) => {
          const brandName = c.advertiser?.company_name || 'Verified Brand';
          const category = c.advertiser?.industry || c.ad_format || 'Featured Brief';
          const cpmRateNum = Number(c.cpm_rate || 2000);
          const cpmFormatted = `₦${cpmRateNum.toLocaleString()}`;
          
          const imageSrc =
            c.cover_image_url ||
            c.creatives?.[0]?.file_url ||
            getFallbackImage(c.title, c.advertiser?.industry);

          return {
            category,
            title: c.title,
            cpm: cpmFormatted,
            brand: brandName,
            src: imageSrc,
            href: `/browse/${c.id}`,
            campaignId: c.id,
          };
        })
      : [
          {
            category: 'Food & Delivery',
            title: 'Chowdeck Late Night Cravings Challenge',
            cpm: '₦2,000',
            brand: 'Chowdeck',
            src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop',
            href: '/browse',
          },
          {
            category: 'Fintech & Wealth',
            title: 'PiggyVest 10% Savings Challenge',
            cpm: '₦2,000',
            brand: 'PiggyVest',
            src: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
            href: '/browse',
          },
          {
            category: 'Consumer Electronics',
            title: 'Infinix Hot 50 Pro Review & Gaming Spotlight',
            cpm: '₦2,000',
            brand: 'Infinix Mobile',
            src: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
            href: '/browse',
          },
        ];

  const cardElements = cards.map((card, index) => (
    <Card key={card.title + index} card={card} index={index} />
  ));

  return (
    <section className="relative w-full py-16 md:py-24 overflow-hidden bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
      
      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-clash font-bold text-3xl sm:text-4xl md:text-5xl text-slate-900 dark:text-white tracking-tight leading-[1.1] [text-wrap:balance]">
            Featured campaigns
          </h2>
          <p className="font-satoshi text-slate-600 dark:text-white/50 text-sm sm:text-base mt-2 max-w-xl">
            Pick a verified brief, publish branded content across 6 social networks, and get settled for verified views.
          </p>
        </div>

        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-sm font-bold font-satoshi text-[#2F49E8] dark:text-[#5B7CFF] hover:underline shrink-0 group"
        >
          <span>Explore All Briefs</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Apple Cards Carousel */}
      <div className="w-full">
        <Carousel items={cardElements} />
      </div>

    </section>
  );
}
