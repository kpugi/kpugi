'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Star,
  CheckCircle2,
  ArrowRight,
  Building2,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function HomeEcosystemSection() {
  const cards = [
    {
      id: 'brands',
      tag: 'Brands & Agencies',
      highlight: '₦0 Upfront',
      description:
        'Launch briefs, set your target CPM rate, and only release payments when real human views are audited.',
      buttonText: 'Explore Brand Solutions',
      buttonHref: '/brands',
      isPopular: false,
      features: [
        'Zero spend before verified results arrive',
        'Automated view audits across 6 social networks',
        'Instant unspent budget return to your wallet',
        'Real-time campaign telemetry & fraud prevention',
      ],
      colorAccent: 'text-[#2F49E8] dark:text-[#5B7CFF]',
      cardBadge: 'border-[#2F49E8]/30 bg-[#2F49E8]/10 text-[#2F49E8] dark:text-[#5B7CFF]',
    },
    {
      id: 'creators',
      tag: 'Creators and Influencers',
      highlight: 'Weekly Payouts',
      description:
        'Pick live brand briefs, share with your audience, and receive automated milestone payouts into your bank.',
      buttonText: 'Start Earning as Creator',
      buttonHref: '/creators',
      isPopular: true,
      popularBadgeText: 'Instant Settlement',
      features: [
        'Ready-to-post briefs from verified Nigerian brands',
        'Earn on TikTok, Instagram, YouTube, X, Facebook & LinkedIn',
        'Automated milestone payouts directly to your local bank',
        'Open to active accounts with zero follower gatekeeping',
      ],
      colorAccent: 'text-[#17A75B] dark:text-emerald-400',
      cardBadge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <section className="relative w-full py-16 md:py-24 bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        
        {/* Top Header Split Layout */}
        <div className="mb-16 flex flex-col items-start justify-between gap-10 lg:flex-row lg:gap-8">
          
          {/* Left Column: Title & Subtitle */}
          <div className="flex max-w-2xl flex-col items-start gap-4">
          

            <h2 className="font-clash font-bold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] [text-wrap:balance]">
              Built for both sides of the creator economy
            </h2>

            <p className="font-satoshi text-slate-600 dark:text-white/55 text-base sm:text-lg leading-relaxed [text-wrap:pretty]">
              A frictionless marketplace connecting verified Nigerian creators with brands that demand real, measurable reach with automated settlement.
            </p>
          </div>

          {/* Right Column: Custom Solutions / Enterprise Box */}
          <div className="flex w-full flex-col gap-3.5 pt-2 lg:w-1/3 bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm dark:shadow-none">
            <div className="text-slate-800 dark:text-white/90 flex items-center gap-2 text-xs font-bold font-satoshi tracking-wider uppercase">
              <span>Agency & Enterprise Scale</span>
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            </div>

            <p className="font-satoshi text-slate-600 dark:text-white/50 text-sm leading-relaxed">
              Managing large campaign budgets or need custom multi-creator briefs with dedicated campaign management?
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 text-xs font-bold font-satoshi hover:bg-[#2F49E8] dark:hover:bg-slate-200 transition-all"
              >
                <span>Talk to Sales</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>

              <span className="text-slate-500 dark:text-white/40 flex items-center gap-1.5 text-xs font-satoshi">
                <span className="bg-emerald-500 h-1.5 w-1.5 rounded-full" />
                Dedicated Support & SLAs
              </span>
            </div>
          </div>

        </div>

        {/* Main 2-Column Split Cards */}
        <div className="grid grid-cols-1 gap-8 md:gap-8 lg:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`relative flex flex-col gap-8 rounded-[32px] border p-6 transition-all duration-300 sm:flex-row sm:p-8 md:p-9 shadow-sm dark:shadow-none bg-white dark:bg-[#0E121E] ${
                card.isPopular
                  ? 'border-emerald-500/40 dark:border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-white/[0.08] hover:border-[#2F49E8]/40'
              }`}
            >
              {/* Popular Pill Top-Left */}
              {card.isPopular && card.popularBadgeText && (
                <div className="absolute -top-3 left-6 rounded-full bg-[#17A75B] text-white px-3.5 py-0.5 text-[11px] font-bold font-satoshi shadow-md sm:left-8 flex items-center gap-1">
                  <Zap className="h-3 w-3 fill-current" />
                  <span>{card.popularBadgeText}</span>
                </div>
              )}

              {/* Left Sub-Column: Tag, Giant Highlight, Description & Action Button */}
              <div className="flex flex-1 flex-col items-start border-b border-slate-200 dark:border-white/[0.08] pb-6 sm:border-r sm:border-b-0 sm:pr-8 sm:pb-0">
                <div
                  className={`inline-flex items-center gap-1.5 mb-4 rounded-full px-3 py-1 text-xs font-bold font-satoshi border ${card.cardBadge}`}
                >
                  {card.id === 'brands' ? (
                    <Building2 className="h-3.5 w-3.5" />
                  ) : (
                    <Users className="h-3.5 w-3.5" />
                  )}
                  <span>{card.tag}</span>
                </div>

                <div
                  className={`font-clash font-bold mb-3 text-4xl sm:text-5xl tracking-tight ${card.colorAccent}`}
                >
                  {card.highlight}
                </div>

                <p className="font-satoshi text-slate-600 dark:text-white/50 mb-8 text-sm leading-relaxed">
                  {card.description}
                </p>

                <div className="mt-auto w-full">
                  <Link
                    href={card.buttonHref}
                    className={`group inline-flex items-center justify-center gap-2 h-11 w-full rounded-full px-5 text-xs font-bold font-satoshi no-underline transition-all sm:w-auto shadow-sm ${
                      card.id === 'brands'
                        ? 'bg-[#2F49E8] text-white hover:bg-blue-700 shadow-[#2F49E8]/20'
                        : 'bg-[#17A75B] text-white hover:bg-emerald-600 shadow-emerald-500/20'
                    }`}
                  >
                    <span>{card.buttonText}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Right Sub-Column: Feature Checklist */}
              <div className="flex flex-1 flex-col justify-center sm:pl-2">
                <ul className="space-y-4">
                  {card.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          card.id === 'brands'
                            ? 'text-[#2F49E8] dark:text-[#5B7CFF]'
                            : 'text-[#17A75B] dark:text-emerald-400'
                        }`}
                      />
                      <span className="font-satoshi text-slate-800 dark:text-white/80 text-xs sm:text-sm font-medium leading-normal">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>

        {/* Footer Guarantee Note */}
        <div className="mx-auto mt-14 max-w-3xl text-center">
          <p className="font-satoshi text-slate-500 dark:text-white/40 text-xs sm:text-sm leading-relaxed">
            Every impression and payout on Kpugi is tracked continuously by automated scrapers. No manual reviews, no disputes, no guesswork.
          </p>
        </div>

      </div>
    </section>
  );
}
