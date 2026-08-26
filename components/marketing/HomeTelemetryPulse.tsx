'use client';

import React from 'react';
import { FaStar, FaBolt, FaRocket, FaShieldAlt } from 'react-icons/fa';
import { SiProducthunt } from 'react-icons/si';

interface StatsProps {
  stats?: {
    totalEarnings?: number;
    totalViews?: number;
  };
}

function formatCompactStat(num: number | undefined, isCurrency = false): string {
  if (num === undefined || num === null) {
    return isCurrency ? '₦52.8M+' : '18.4M+';
  }
  if (num >= 1_000_000) {
    return `${isCurrency ? '₦' : ''}${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M+`;
  }
  if (num >= 1_000) {
    return `${isCurrency ? '₦' : ''}${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K+`;
  }
  return `${isCurrency ? '₦' : ''}${num.toLocaleString()}`;
}

const endorsements = [
  {
    icon: SiProducthunt,
    iconClass: 'text-orange-500',
    score: '#1',
    name: 'Product of the Day',
  },
  {
    icon: FaStar,
    iconClass: 'text-emerald-500',
    score: '4.9 ★',
    name: 'Trustpilot Rated',
  },
  {
    icon: FaShieldAlt,
    iconClass: 'text-[#2F49E8] dark:text-[#5B7CFF]',
    score: '100%',
    name: 'Budget Protection SLA',
  },
  {
    icon: FaBolt,
    iconClass: 'text-amber-400',
    score: '24h',
    name: 'Automated Bank Settlements',
  },
];

export default function HomeTelemetryPulse({ stats }: StatsProps) {
  const earningsDisplay = formatCompactStat(stats?.totalEarnings, true);
  const viewsDisplay = formatCompactStat(stats?.totalViews, false);

  const metrics = [
    {
      icon: FaBolt,
      iconColor: 'text-emerald-500',
      value: earningsDisplay,
      label: 'Earned',
    },
    {
      icon: FaRocket,
      iconColor: 'text-[#2F49E8] dark:text-[#5B7CFF]',
      value: viewsDisplay,
      label: 'Verified Views',
    },
    {
      icon: FaShieldAlt,
      iconColor: 'text-amber-500',
      value: '99.9%',
      label: 'bot & fraud filtered',
    },
  ];

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
      <section className="group/section w-full px-4 py-16 md:py-24 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          
          <h2 className="text-slate-900 dark:text-white font-clash mt-4 text-3xl sm:text-4xl md:text-5xl leading-[1.1] font-bold tracking-tight [text-wrap:balance]">
            Infrastructure that{' '}
            <span className="relative z-10 inline font-bold after:absolute after:bottom-1 after:left-0 after:z-0 after:h-2 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-[#2F49E8]/30 after:to-emerald-500/30 after:transition-transform after:duration-500 after:ease-out group-hover/section:after:scale-x-100 dark:after:from-[#2F49E8]/50 dark:after:to-emerald-500/50">
              scales creator reach
            </span>
          </h2>

          <p className="font-satoshi text-slate-600 dark:text-white/50 mx-auto mt-3 max-w-lg text-sm sm:text-base leading-relaxed">
            Battle-tested automated view verification delivering real human impressions to millions of consumers across Nigeria.
          </p>

          {/* Metric Badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-3.5">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="group relative flex cursor-default items-center gap-3 overflow-hidden rounded-2xl bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] px-7 py-4 shadow-sm dark:shadow-none transition-all duration-300 ease-out hover:scale-105"
              >
                <div className="absolute inset-0 -translate-x-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1500 group-hover:translate-x-[200%] dark:via-white/10" />
                <m.icon
                  className={`size-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${m.iconColor}`}
                />
                <span className="font-clash text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-all duration-500 ease-out group-hover:tracking-normal md:text-3xl">
                  {m.value}
                </span>
                <span className="font-satoshi text-slate-500 dark:text-white/50 text-xs sm:text-sm font-medium">
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          {/* Endorsements / Trust Signals */}
          <div className="font-satoshi text-slate-600 dark:text-white/50 mt-8 flex flex-wrap items-center justify-center gap-2">
            {endorsements.map((e, index) => (
              <div key={e.name} className="flex items-center">
                <div className="group hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm transition-colors duration-300">
                  <e.icon
                    className={`size-4 shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6 ${e.iconClass}`}
                  />
                  <span className="font-bold text-slate-900 dark:text-white">{e.score}</span>
                  <span>{e.name}</span>
                </div>
                {index < endorsements.length - 1 && (
                  <div className="bg-slate-200 dark:bg-white/10 mx-1 h-3.5 w-px" />
                )}
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
