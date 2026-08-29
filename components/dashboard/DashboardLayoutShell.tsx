'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  SidebarBody,
  SidebarLink,
  SidebarLinkItem,
} from '@/components/ui/sidebar';
import {
  IconLayoutDashboard,
  IconSpeakerphone,
  IconWallet,
  IconFileCheck,
  IconLink,
  IconSettings,
  IconChartBar,
  IconUsers,
} from '@tabler/icons-react';
import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';
import KpugiBotChat from '../support/KpugiBotChat';

interface DashboardLayoutShellProps {
  children: React.ReactNode;
  role: 'creator' | 'advertiser';
  title?: string;
}

export default function DashboardLayoutShell({
  children,
  role,
  title,
}: DashboardLayoutShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const creatorNavItems: SidebarLinkItem[] = [
    {
      label: 'Overview',
      href: '/c/dashboard',
      icon: <IconLayoutDashboard className="w-5 h-5 shrink-0" />,
      active: pathname === '/c/dashboard',
    },
    {
      label: 'Campaigns',
      href: '/c/campaigns',
      icon: <IconSpeakerphone className="w-5 h-5 shrink-0" />,
      active: pathname.startsWith('/c/campaigns'),
    },
    {
      label: 'Wallet & Earnings',
      href: '/c/wallet',
      icon: <IconWallet className="w-5 h-5 shrink-0" />,
      active: pathname.startsWith('/c/wallet'),
    },
    {
      label: 'Audits & Submissions',
      href: '/c/submissions',
      icon: <IconFileCheck className="w-5 h-5 shrink-0" />,
      active: pathname.startsWith('/c/submissions'),
    },
    {
      label: 'Connected Accounts',
      href: '/c/accounts',
      icon: <IconLink className="w-5 h-5 shrink-0" />,
      active: pathname.startsWith('/c/accounts'),
    },
    {
      label: 'Settings',
      href: '/c/settings',
      icon: <IconSettings className="w-5 h-5 shrink-0" />,
      active: pathname.startsWith('/c/settings'),
    },
  ];

  const advertiserNavItems: SidebarLinkItem[] = [
    {
      label: 'Overview',
      href: '/b/dashboard',
      icon: <IconLayoutDashboard className="w-5 h-5 shrink-0" />,
      active: pathname === '/b/dashboard',
    },
    {
      label: 'Campaigns',
      href: '/b/campaigns',
      icon: <IconSpeakerphone className="w-5 h-5 shrink-0" />,
      active: pathname.startsWith('/b/campaigns'),
    },
    {
      label: 'Creators Directory',
      href: '/b/creators',
      icon: <IconUsers className="w-5 h-5 shrink-0" />,
      active: pathname.startsWith('/b/creators'),
      disabled: true,
      badge: 'Soon',
    },
    {
      label: 'ROI Analytics',
      href: '/b/analytics',
      icon: <IconChartBar className="w-5 h-5 shrink-0" />,
      active: pathname.startsWith('/b/analytics'),
    },
    {
      label: 'Wallet & Escrow',
      href: '/b/wallet',
      icon: <IconWallet className="w-5 h-5 shrink-0" />,
      active: pathname.startsWith('/b/wallet'),
    },
    {
      label: 'Settings',
      href: '/b/settings',
      icon: <IconSettings className="w-5 h-5 shrink-0" />,
      active: pathname.startsWith('/b/settings'),
    },
  ];

  const navItems = role === 'creator' ? creatorNavItems : advertiserNavItems;

  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={true}>
      <div className="min-h-screen bg-kpugi-paper dark:bg-transparent text-kpugi-ink dark:text-white flex flex-col md:flex-row w-full transition-colors duration-300 relative">
        {/* ─────────────────────────────────────────────────────
           ACETERNITY ANIMATED SIDEBAR (Desktop Sticky)
        ───────────────────────────────────────────────────── */}
        <div className="hidden md:block sticky top-0 h-screen shrink-0 z-30">
          <SidebarBody className="justify-between gap-6 h-full py-5 px-3">
            {/* Top Section: Brand Logo & Navigation Links */}
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {/* Brand Header: Logo on open, Icon/wordmark on close */}
              <div className="flex items-center h-10 px-2 mb-6 shrink-0">
                <Link href="/" className="flex items-center">
                  {open ? (
                    <Image
                      src="/kpugi_logo.png"
                      alt="Kpugi"
                      width={96}
                      height={28}
                      className="h-7 w-auto object-contain"
                      priority
                    />
                  ) : (
                    <Image
                      src="/kpugi_favicon.png"
                      alt="Kpugi"
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-lg object-contain"
                      priority
                    />
                  )}
                </Link>
              </div>

              {/* Navigation Items */}
              <div className="flex flex-col gap-1.5">
                {navItems.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>

            {/* Bottom Section: KpugiBot AI Support Card / Trigger */}
            <div className="pt-3 border-t border-kpugi-border/70 dark:border-white/10 shrink-0">
              {open ? (
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white hover:shadow-lg hover:shadow-slate-900/20 transition-all border border-slate-700/60 group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-sans font-bold text-xs text-white flex items-center gap-2">
                      <Image
                        src="/kpugi_bot_avatar.png"
                        alt="KpugiBot"
                        width={22}
                        height={22}
                        className="w-5.5 h-5.5 rounded-md object-contain shrink-0"
                      />
                      <span>KpugiBot</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="font-sans text-slate-300 leading-snug text-[11px]">
                    {role === 'creator'
                      ? 'Ask about 1k floors, cycles, or payouts.'
                      : 'Ask about escrow, CPMs, or live metrics.'}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-kpugi-blue group-hover:translate-x-1 transition-transform">
                    <span>Start chat</span>
                    <span className="text-xs">→</span>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="w-11 h-11 mx-auto rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-white shadow-sm shadow-kpugi-blue/20 transition-all group overflow-hidden border border-slate-700/60 p-1"
                  title="Open KpugiBot AI Support"
                >
                  <Image
                    src="/kpugi_bot_avatar.png"
                    alt="KpugiBot"
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-lg object-contain group-hover:scale-110 transition-transform shrink-0"
                  />
                </button>
              )}
            </div>
          </SidebarBody>
        </div>

        {/* ─────────────────────────────────────────────────────
           MAIN CONTENT AREA (Natural flex-1 fluid resize)
        ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <DashboardHeader
            title={title}
            role={role}
            onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          <DashboardFooter />
        </div>

        {/* ─────────────────────────────────────────────────────
           MOBILE SIDEBAR SLIDE-OVER
        ───────────────────────────────────────────────────── */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-kpugi-ink/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <div
              className="w-[280px] h-full bg-white dark:bg-[#0D111D] p-5 flex flex-col justify-between shadow-2xl border-r border-kpugi-border dark:border-white/10 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-5">
                {/* Mobile Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-kpugi-border dark:border-white/10">
                  <Link href="/" className="flex items-center">
                    <Image
                      src="/kpugi_logo.png"
                      alt="Kpugi"
                      width={90}
                      height={28}
                      className="h-7 w-auto object-contain"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Mobile Nav Links (Explicit with full text labels) */}
                <div className="flex flex-col gap-1">
                  {navItems.map((item, idx) => {
                    if (item.disabled) {
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl font-sans text-xs font-semibold select-none opacity-40 cursor-not-allowed text-kpugi-slate dark:text-slate-500"
                        >
                          <div className="flex items-center gap-3">
                            <span className="shrink-0">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl font-sans text-xs font-semibold transition-colors ${
                          item.active
                            ? 'bg-kpugi-blue text-white shadow-sm shadow-kpugi-blue/25 font-bold'
                            : 'text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`shrink-0 ${item.active ? 'text-white' : 'text-kpugi-slate dark:text-slate-400'}`}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Promo Banner Card (Mobile Only) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white relative overflow-hidden shadow-xs">
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  <div className="relative z-10 space-y-1.5">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold uppercase tracking-wider">
                      <span>{role === 'creator' ? '⚡ 1k View Floors' : '🔒 100% Escrow'}</span>
                    </div>
                    <h4 className="font-display font-bold text-xs leading-snug">
                      {role === 'creator' ? 'Earn for Verified Traffic' : 'Scale Reach with Creators'}
                    </h4>
                    <p className="text-[10px] text-blue-100 leading-tight">
                      {role === 'creator'
                        ? 'Submit your post link, pass automated audits, and unlock daily payouts.'
                        : 'Launch CPM campaigns and only pay for verified organic creator views.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile KpugiBot Trigger */}
              <div className="pt-4 mt-4 border-t border-kpugi-border dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    setIsChatOpen(true);
                  }}
                  className="w-full p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs font-bold shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src="/kpugi_bot_avatar.png"
                      alt="KpugiBot"
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-md object-contain shrink-0"
                    />
                    <span>KpugiBot AI Support</span>
                  </div>
                  <span className="text-[11px] text-kpugi-blue font-semibold">Chat →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KpugiBot AI Support Chat Drawer */}
        <KpugiBotChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          role={role}
        />
      </div>
    </SidebarProvider>
  );
}
