'use client';

import React, { useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  useKnockFeed,
  NotificationFeedPopover,
  NotificationIconButton,
} from '@knocklabs/react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

import '@knocklabs/react/dist/index.css';

interface DashboardHeaderProps {
  title?: string;
  role: 'creator' | 'advertiser';
  onMobileMenuToggle?: () => void;
}

function getHeaderTitle(pathname: string, passedTitle?: string, role: string = 'creator'): string {
  const cleanPath = (pathname || '').toLowerCase();

  // If an explicit, non-generic title was passed (e.g. specific campaign name), use it immediately
  if (
    passedTitle &&
    !['creator console', 'brand console', 'creator campaigns', 'brand campaigns'].includes(passedTitle.toLowerCase())
  ) {
    return passedTitle.toUpperCase();
  }

  // 1. Creator compact routes (/c/*)
  if (cleanPath.startsWith('/c') || role === 'creator') {
    if (cleanPath === '/c/dashboard' || cleanPath === '/c' || cleanPath === '/c/' || cleanPath === '/dashboard' || !cleanPath || cleanPath === '/') {
      return 'CREATOR OVERVIEW';
    }
    if (cleanPath.startsWith('/c/campaigns') || cleanPath.startsWith('/campaigns')) {
      if (cleanPath.includes('/new')) return 'CREATE CAMPAIGN';
      if (cleanPath.split('/').filter(Boolean).length > 2) return 'CAMPAIGN DETAILS';
      return 'CREATOR CAMPAIGNS';
    }
    if (cleanPath.startsWith('/c/wallet') || cleanPath.startsWith('/c/earnings') || cleanPath.startsWith('/wallet') || cleanPath.startsWith('/earnings')) {
      return 'WALLET & EARNINGS';
    }
    if (cleanPath.startsWith('/c/submissions') || cleanPath.startsWith('/c/audits') || cleanPath.startsWith('/submissions')) {
      return 'AUDITS & SUBMISSIONS';
    }
    if (cleanPath.startsWith('/c/accounts') || cleanPath.startsWith('/accounts')) {
      return 'CONNECTED ACCOUNTS';
    }
    if (cleanPath.startsWith('/c/settings') || cleanPath.startsWith('/settings')) {
      return 'ACCOUNT SETTINGS';
    }
    if (cleanPath.startsWith('/c/browse') || cleanPath.startsWith('/c/catalogue') || cleanPath.startsWith('/browse')) {
      return 'CAMPAIGNS CATALOGUE';
    }
  }

  // 2. Brand / Advertiser compact routes (/b/*)
  if (cleanPath.startsWith('/b') || role === 'advertiser') {
    if (cleanPath === '/b/dashboard' || cleanPath === '/b' || cleanPath === '/b/' || cleanPath === '/dashboard' || !cleanPath || cleanPath === '/') {
      return 'BRAND OVERVIEW';
    }
    if (cleanPath.startsWith('/b/campaigns') || cleanPath.startsWith('/campaigns')) {
      if (cleanPath.includes('/new')) return 'CREATE CAMPAIGN';
      if (cleanPath.split('/').filter(Boolean).length > 2) return 'CAMPAIGN MANAGEMENT';
      return 'BRAND CAMPAIGNS';
    }
    if (cleanPath.startsWith('/b/creators')) {
      return 'CREATOR DIRECTORY';
    }
    if (cleanPath.startsWith('/b/analytics')) {
      return 'ROI ANALYTICS';
    }
    if (cleanPath.startsWith('/b/wallet') || cleanPath.startsWith('/wallet')) {
      return 'BRAND WALLET';
    }
    if (cleanPath.startsWith('/b/settings') || cleanPath.startsWith('/settings')) {
      return 'BRAND SETTINGS';
    }
  }

  // 3. Fallback & Public Discovery Routes
  if (cleanPath.startsWith('/browse') || cleanPath.startsWith('/catalogue')) {
    if (cleanPath.split('/').filter(Boolean).length > 1) return 'CAMPAIGN DETAILS';
    return 'CAMPAIGNS CATALOGUE';
  }

  return role === 'creator' ? 'CREATOR OVERVIEW' : 'BRAND OVERVIEW';
}

function formatMobileTitle(title: string): { mobile: string; desktop: string } {
  switch (title) {
    case 'CREATOR OVERVIEW': return { mobile: 'OVERVIEW', desktop: 'CREATOR OVERVIEW' };
    case 'BRAND OVERVIEW': return { mobile: 'OVERVIEW', desktop: 'BRAND OVERVIEW' };
    case 'CREATOR CAMPAIGNS': return { mobile: 'CAMPAIGNS', desktop: 'CREATOR CAMPAIGNS' };
    case 'BRAND CAMPAIGNS': return { mobile: 'CAMPAIGNS', desktop: 'BRAND CAMPAIGNS' };
    case 'CAMPAIGNS CATALOGUE': return { mobile: 'CATALOGUE', desktop: 'CAMPAIGNS CATALOGUE' };
    case 'WALLET & EARNINGS': return { mobile: 'WALLET', desktop: 'WALLET & EARNINGS' };
    case 'BRAND WALLET': return { mobile: 'WALLET', desktop: 'BRAND WALLET' };
    case 'AUDITS & SUBMISSIONS': return { mobile: 'AUDITS', desktop: 'AUDITS & SUBMISSIONS' };
    case 'CONNECTED ACCOUNTS': return { mobile: 'ACCOUNTS', desktop: 'CONNECTED ACCOUNTS' };
    case 'ACCOUNT SETTINGS': return { mobile: 'SETTINGS', desktop: 'ACCOUNT SETTINGS' };
    case 'BRAND SETTINGS': return { mobile: 'SETTINGS', desktop: 'BRAND SETTINGS' };
    case 'CREATOR DIRECTORY': return { mobile: 'CREATORS', desktop: 'CREATOR DIRECTORY' };
    case 'ROI ANALYTICS': return { mobile: 'ANALYTICS', desktop: 'ROI ANALYTICS' };
    default: return { mobile: title, desktop: title };
  }
}

function KnockNotificationBell() {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  let feedInstance;
  try {
    const knockFeed = useKnockFeed();
    feedInstance = knockFeed?.feedClient;
  } catch {
    feedInstance = null;
  }

  if (!feedInstance) {
    return (
      <button className="relative p-2 rounded-xl text-kpugi-slate hover:text-kpugi-ink dark:text-slate-300 dark:hover:text-white hover:bg-kpugi-paper dark:hover:bg-white/5 transition-colors">
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
    );
  }

  return (
    <div className="relative inline-block">
      <NotificationIconButton
        ref={buttonRef}
        badgeCountType="unread"
        onClick={() => setIsVisible(!isVisible)}
      />
      <NotificationFeedPopover
        buttonRef={buttonRef}
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        onNotificationClick={() => {}}
        onNotificationButtonClick={(item, action) => {
          setIsVisible(false);
          if (feedInstance && typeof (feedInstance as any).markAsRead === 'function') {
            (feedInstance as any).markAsRead(item);
          }
          const data = item.data as Record<string, any> | undefined;
          const actionUrl = (item as any).action_url || data?.action_url || action?.action;
          if (actionUrl && typeof actionUrl === 'string' && actionUrl.startsWith('/')) {
            router.push(actionUrl);
          } else if (data?.campaignId) {
            router.push(`/c/campaigns/${data.campaignId}`);
          } else {
            router.push('/c/dashboard');
          }
        }}
      />
    </div>
  );
}

export default function DashboardHeader({
  title,
  role,
  onMobileMenuToggle,
}: DashboardHeaderProps) {
  const pathname = usePathname() || '';
  const displayTitle = getHeaderTitle(pathname, title, role);
  const titleFormatted = formatMobileTitle(displayTitle);

  return (
    <header className="sticky top-0 z-30 border-b border-kpugi-border dark:border-white/10 bg-white/95 dark:bg-[#090A0F]/90 backdrop-blur-md transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-3">

        {/* Left: Mobile menu + Dynamic Header Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl text-kpugi-slate hover:text-kpugi-ink dark:text-slate-300 dark:hover:text-white hover:bg-kpugi-paper dark:hover:bg-white/5 transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="font-display font-extrabold uppercase tracking-wider text-kpugi-blue dark:text-blue-400 text-xs sm:text-base leading-none whitespace-nowrap truncate">
            <span className="sm:hidden">{titleFormatted.mobile}</span>
            <span className="hidden sm:inline">{titleFormatted.desktop}</span>
          </h1>
        </div>

        {/* Middle: Search */}
        <div className="hidden md:flex items-center max-w-sm w-full relative">
          <svg className="w-3.5 h-3.5 text-kpugi-slate dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-12 py-2 font-sans text-xs rounded-xl border border-kpugi-border dark:border-white/10 bg-kpugi-paper dark:bg-white/5 text-kpugi-ink dark:text-white placeholder:text-kpugi-slate/50 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#12141A] focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue/40 transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-kpugi-slate/40 dark:text-slate-400 border border-kpugi-border dark:border-white/10 rounded px-1.5 py-0.5 bg-white dark:bg-white/10">
            ⌘K
          </span>
        </div>

        {/* Right: Notifications + Theme Toggle + Help + User */}
        <div className="flex items-center gap-2 shrink-0">
          <KnockNotificationBell />

          <ThemeToggle />

          {/* Help */}
          <button className="hidden sm:flex p-2 rounded-xl text-kpugi-slate hover:text-kpugi-ink dark:text-slate-300 dark:hover:text-white hover:bg-kpugi-paper dark:hover:bg-white/5 transition-colors">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <div className="h-5 w-px bg-kpugi-border dark:bg-white/10 hidden sm:block" />

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
