'use client';

import React from 'react';
import { Card, CardContent } from '@/components/base-ui/card';
import {
  HiLightBulb,
  HiShieldCheck,
  HiSupport,
  HiDatabase,
  HiSwitchHorizontal,
} from 'react-icons/hi';

export interface Features1Props {
  title?: string;
  subtitle?: string;
}

export default function Features1({
  title = 'A Concentrated, High-Intent Commercial Audience',
  subtitle = 'Unlike generic social feeds, every visitor on Kpugi is an active commercial actor: either an advertiser deploying marketing capital or a verified creator monetizing their content.',
}: Features1Props) {
  return (
    <div className="theme-injected flex w-full flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-12 max-w-3xl text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display leading-[1.05] tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1: Verified Creators */}
        <Card className="bg-muted/50 rounded-3xl ring-0 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-border">
          <CardContent className="p-6">
            <div className="bg-muted dark:bg-muted/10 mb-2 size-fit rounded-lg p-px">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_6px_0_rgba(0,0,0,0.07),0_2px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.05),0_0px_2px_0_rgba(0,0,0,0.2),0_1px_4px_0_rgba(0,0,0,0.05)]">
                <HiLightBulb className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Verified Creator Traffic</h3>
            <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
              Over 65% of visitors are verified Nigerian creators and influencers checking view telemetry, clocking in campaign posts, and receiving weekly earnings.
            </p>
            <div className="bg-muted dark:bg-muted/10 inline-flex rounded-lg p-0.5">
              <div className="text-muted-foreground inline-flex items-center rounded-md bg-white/80 px-2 py-1 text-[10px] font-medium shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_2px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.04),0_0px_2px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.05)]">
                65% Creator Demographic
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Brand Founders & Buyers */}
        <Card className="bg-muted/50 rounded-3xl ring-0 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-border">
          <CardContent className="p-6">
            <div className="bg-muted dark:bg-muted/10 mb-2 size-fit rounded-lg p-px">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_6px_0_rgba(0,0,0,0.07),0_2px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.05),0_0px_2px_0_rgba(0,0,0,0.2),0_1px_4px_0_rgba(0,0,0,0.05)]">
                <HiDatabase className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <h3 className="mb-1 text-lg font-medium text-foreground">Brand Founders & Buyers</h3>
            <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
              Founders, CMOs, and marketing teams deploying escrow budgets, reviewing creator portfolios, and purchasing B2B solutions.
            </p>
            <div className="bg-muted dark:bg-muted/10 inline-flex rounded-lg p-0.5">
              <div className="text-muted-foreground inline-flex items-center rounded-md bg-white/80 px-2 py-1 text-[10px] font-medium shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_2px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.04),0_0px_2px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.05)]">
                35% Brand & SME Buyers
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Tall Row-Span-2 Card */}
        <Card className="bg-muted/50 row-span-2 flex flex-col justify-between rounded-3xl ring-0 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)] border border-border">
          <CardContent className="p-6">
            <div className="bg-muted dark:bg-muted/10 mb-3 size-fit rounded-lg p-px">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_6px_0_rgba(0,0,0,0.07),0_2px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.05),0_0px_2px_0_rgba(0,0,0,0.2),0_1px_4px_0_rgba(0,0,0,0.05)]">
                <HiShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-medium text-foreground">
              Zero Impression Wastage
            </h3>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Every single session on Kpugi is tied to authenticated financial actions, scraper verification, or creator clock-ins. Zero passive feed scrollers.
            </p>

            <div className="space-y-3">
              <div className="bg-muted dark:bg-muted/10 flex items-center justify-between rounded-md px-3 py-2 text-xs border border-border/50">
                <span className="text-muted-foreground">Commercial Intent</span>
                <span className="font-semibold text-foreground">100% Verified</span>
              </div>
              <div className="bg-muted dark:bg-muted/10 flex items-center justify-between rounded-md px-3 py-2 text-xs border border-border/50">
                <span className="text-muted-foreground">Fraud Detection</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Automated Anti-Bot</span>
              </div>
              <div className="bg-muted dark:bg-muted/10 flex items-center justify-between rounded-md px-3 py-2 text-xs border border-border/50">
                <span className="text-muted-foreground">Traffic Cadence</span>
                <span className="font-semibold text-foreground">3–7x Weekly</span>
              </div>
            </div>
          </CardContent>

          <div className="px-6 pb-6">
            <div className="bg-muted dark:bg-muted/10 inline-flex rounded-lg p-0.5">
              <div className="text-muted-foreground inline-flex items-center rounded-md bg-white/80 px-2 py-1 text-[10px] font-medium shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_2px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.04),0_0px_2px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.05)]">
                Zero Inactive Impressions
              </div>
            </div>
          </div>
        </Card>

        {/* Card 4: High Repeat Cadence */}
        <Card className="bg-muted/50 rounded-3xl ring-0 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-border">
          <CardContent className="p-6">
            <div className="bg-muted dark:bg-muted/10 mb-2 size-fit rounded-lg p-px">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_6px_0_rgba(0,0,0,0.07),0_2px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.05),0_0px_2px_0_rgba(0,0,0,0.2),0_1px_4px_0_rgba(0,0,0,0.05)]">
                <HiSwitchHorizontal className="h-5 w-5 text-pink-500" />
              </div>
            </div>
            <h3 className="mb-1 text-lg font-medium text-foreground">High Repeat Cadence</h3>
            <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
              Users return repeatedly throughout the week to clock in live posts, inspect real-time scraper view counts, and collect payouts.
            </p>
            <div className="bg-muted dark:bg-muted/10 inline-flex rounded-lg p-0.5">
              <div className="text-muted-foreground inline-flex items-center rounded-md bg-white/80 px-2 py-1 text-[10px] font-medium shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_2px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.04),0_0px_2px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.05)]">
                Daily Active Workflows
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Direct Commercial Affinity */}
        <Card className="bg-muted/50 rounded-3xl ring-0 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-border">
          <CardContent className="p-6">
            <div className="bg-muted dark:bg-muted/10 mb-2 size-fit rounded-lg p-px">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_6px_0_rgba(0,0,0,0.07),0_2px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.05),0_0px_2px_0_rgba(0,0,0,0.2),0_1px_4px_0_rgba(0,0,0,0.05)]">
                <HiSupport className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <h3 className="mb-1 text-lg font-medium text-foreground">Direct Commercial Affinity</h3>
            <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
              Highly responsive audience for USD creator cards, cameras, ring lights, editing suites, CAC registration, and lifestyle tech.
            </p>
            <div className="bg-muted dark:bg-muted/10 inline-flex rounded-lg p-0.5">
              <div className="text-muted-foreground inline-flex items-center rounded-md bg-white/80 px-2 py-1 text-[10px] font-medium shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_2px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.04),0_0px_2px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.05)]">
                High Purchasing Intent
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
