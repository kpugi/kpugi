'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BrandSettingsData } from '@/lib/supabase/advertiser';
import BrandIdentityTab from './settings/BrandIdentityTab';
import BrandBillingContactTab from './settings/BrandBillingContactTab';
import BrandFinancialControlsTab from './settings/BrandFinancialControlsTab';
import BrandCampaignDefaultsTab from './settings/BrandCampaignDefaultsTab';
import BrandNotificationsTab from './settings/BrandNotificationsTab';
import BrandSecurityClerkTab from './settings/BrandSecurityClerkTab';
import {
  Building2,
  Receipt,
  Wallet,
  Sliders,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Camera,
  Coins,
  ArrowUpRight,
  User,
  Globe,
  Tag,
  KeyRound,
} from 'lucide-react';

interface AdvertiserSettingsViewProps {
  initialData: BrandSettingsData;
}

type TabKey = 'identity' | 'billing' | 'financial' | 'defaults' | 'notifications' | 'security';

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { key: 'identity', label: 'Brand Identity', icon: Building2 },
  { key: 'billing', label: 'Contact & Billing', icon: Receipt },
  { key: 'financial', label: 'Financial Controls', icon: Wallet },
  { key: 'defaults', label: 'Campaign Governance', icon: Sliders },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Account & Security', icon: ShieldCheck },
];

export default function AdvertiserSettingsView({ initialData }: AdvertiserSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('identity');
  const [data, setData] = useState<BrandSettingsData>(initialData);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(
    data.advertiser.companyLogoUrl || data.profile.avatarUrl || null
  );
  const [currentName, setCurrentName] = useState<string>(
    data.advertiser.companyName || data.profile.fullName || 'Brand Partner'
  );

  const handleIdentityUpdate = (newLogoUrl?: string | null) => {
    if (newLogoUrl) {
      setCurrentLogoUrl(newLogoUrl);
    }
  };

  const handleClerkSyncSuccess = (clerkData: { imageUrl?: string | null; name?: string | null }) => {
    if (clerkData.imageUrl) setCurrentLogoUrl(clerkData.imageUrl);
    if (clerkData.name) setCurrentName(clerkData.name);
  };

  // Compute Brand Profile Completeness Score and Checklist
  const completeness = useMemo(() => {
    const steps = [
      {
        id: 'logo',
        label: 'Brand Logo',
        isComplete: Boolean(currentLogoUrl),
        tab: 'identity' as TabKey,
        icon: Camera,
      },
      {
        id: 'company',
        label: 'Company Profile',
        isComplete: Boolean(data.advertiser.companyName && data.advertiser.companyWebsite),
        tab: 'identity' as TabKey,
        icon: Building2,
      },
      {
        id: 'billing',
        label: 'Billing & Invoicing Email',
        isComplete: Boolean(data.advertiser.billingEmail),
        tab: 'billing' as TabKey,
        icon: Receipt,
      },
      {
        id: 'alerts',
        label: 'Low Balance Guardrail',
        isComplete: Boolean(data.advertiser.lowBalanceAlertEnabled),
        tab: 'financial' as TabKey,
        icon: Wallet,
      },
      {
        id: 'defaults',
        label: 'Campaign Defaults',
        isComplete: Boolean(data.advertiser.campaignDefaults.defaultGraceHours),
        tab: 'defaults' as TabKey,
        icon: Sliders,
      },
      {
        id: 'security',
        label: 'Account Security',
        isComplete: Boolean(data.profile.clerkId),
        tab: 'security' as TabKey,
        icon: ShieldCheck,
      },
    ];

    const completedCount = steps.filter((s) => s.isComplete).length;
    const score = Math.round((completedCount / steps.length) * 100);

    return { score, steps };
  }, [currentLogoUrl, data]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 font-sans text-kpugi-ink">
      {/* Top Hero Command Banner */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-kpugi-blue/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Brand Logo Avatar */}
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-slate-800 shrink-0 flex items-center justify-center">
              {currentLogoUrl ? (
                <Image
                  src={currentLogoUrl}
                  alt={currentName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {currentName}
                </h1>

                {/* Badges */}
                <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-kpugi-blue/20 text-indigo-300 border border-kpugi-blue/30 flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Brand Partner</span>
                </div>
              </div>

              <p className="text-slate-400 text-xs mt-1.5 max-w-xl leading-relaxed">
                {data.advertiser.tagline || `${data.advertiser.industry} • Central control panel for brand identity, billing, wallet guardrails & campaign governance.`}
              </p>
            </div>
          </div>

          {/* Live Financial Summary */}
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 shrink-0">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Available Wallet</p>
              <p className="font-mono text-xl font-extrabold text-kpugi-naira">₦{data.wallet.balance.toLocaleString()}</p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Escrow Locked</p>
              <p className="font-mono text-base font-bold text-slate-300">₦{data.wallet.escrowLocked.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Brand Control Panel Completeness Meter & Quick Checklist Grid */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-kpugi-blue" />
              <span>Brand Control Panel Setup</span>
            </span>
            <span className="font-bold text-kpugi-blue font-mono text-sm">{completeness.score}% Complete</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-kpugi-blue via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completeness.score}%` }}
            />
          </div>

          {/* Quick Checklist Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {completeness.steps.map((step) => {
              const IconComponent = step.icon;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveTab(step.tab)}
                  className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between space-y-2 cursor-pointer hover:scale-[1.02] ${
                    step.isComplete
                      ? 'bg-slate-900/90 border-emerald-500/30 text-white shadow-xs'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                        step.isComplete
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono ${
                        step.isComplete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {step.isComplete ? '✓ Done' : '○ Edit'}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-white leading-tight truncate">
                    {step.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Segmented Pill Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-kpugi-border shadow-2xs overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-kpugi-blue text-white shadow-sm'
                  : 'text-slate-600 hover:text-kpugi-ink hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[500px]">
        {activeTab === 'identity' && (
          <BrandIdentityTab data={data} onUpdateSuccess={handleIdentityUpdate} />
        )}
        {activeTab === 'billing' && (
          <BrandBillingContactTab data={data} />
        )}
        {activeTab === 'financial' && (
          <BrandFinancialControlsTab data={data} />
        )}
        {activeTab === 'defaults' && (
          <BrandCampaignDefaultsTab data={data} />
        )}
        {activeTab === 'notifications' && (
          <BrandNotificationsTab data={data} />
        )}
        {activeTab === 'security' && (
          <BrandSecurityClerkTab data={data} onSyncSuccess={handleClerkSyncSuccess} />
        )}
      </div>
    </div>
  );
}
