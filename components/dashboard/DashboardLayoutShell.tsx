'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';

interface DashboardLayoutShellProps {
  children: React.ReactNode;
  role: 'creator' | 'advertiser';
  title?: string;
}

export default function DashboardLayoutShell({ children, role, title }: DashboardLayoutShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const creatorNavItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: 'Campaigns',
      href: '/campaigns',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
    },
    {
      label: 'Earnings',
      href: '/earnings',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Audits',
      href: '/submissions',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      label: 'Accounts',
      href: '/accounts',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const advertiserNavItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: 'Campaigns',
      href: '/campaigns',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      label: 'Wallet & Escrow',
      href: '/wallet',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const navItems = role === 'creator' ? creatorNavItems : advertiserNavItems;

  const sidebarContent = (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r border-kpugi-border flex flex-col justify-between z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[72px]' : 'w-[248px]'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Brand Header — Logo / Favicon toggle */}
        <div className={`flex items-center border-b border-kpugi-border h-[60px] shrink-0 ${isCollapsed ? 'justify-center px-3' : 'justify-between px-5'}`}>
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            {isCollapsed ? (
              <Image
                src="/kpugi_favicon.png"
                alt="Kpugi"
                width={28}
                height={28}
                className="rounded-lg"
              />
            ) : (
              <>
                <Image
                  src="/kpugi_logo.png"
                  alt="Kpugi"
                  width={90}
                  height={28}
                  className="object-contain"
                />
              </>
            )}
          </Link>

          {/* Collapse toggle — only visible on desktop in expanded state */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden lg:flex w-7 h-7 rounded-lg bg-kpugi-paper hover:bg-kpugi-border items-center justify-center text-kpugi-slate hover:text-kpugi-ink transition-colors"
              title="Collapse sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className={`flex-1 overflow-y-auto py-3 space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl font-sans text-[13px] font-semibold transition-all duration-200 ${
                  isCollapsed
                    ? 'justify-center w-12 h-11 mx-auto'
                    : 'px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-kpugi-blue text-white shadow-sm shadow-kpugi-blue/25'
                    : 'text-kpugi-slate hover:text-kpugi-ink hover:bg-kpugi-paper'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-white' : ''}`}>{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className={`border-t border-kpugi-border shrink-0 ${isCollapsed ? 'p-3 flex flex-col items-center gap-3' : 'p-4 space-y-4'}`}>
          {/* Expand toggle when collapsed */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-10 h-10 rounded-xl bg-kpugi-paper hover:bg-kpugi-border flex items-center justify-center text-kpugi-slate hover:text-kpugi-ink transition-colors"
              title="Expand sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Trust / Escrow Banner */}
          {!isCollapsed ? (
            <div className="p-3.5 rounded-xl bg-kpugi-blue/[0.06] border border-kpugi-blue/15">
              <span className="font-sans font-bold text-xs text-kpugi-blue block mb-1">
                {role === 'creator' ? '✓ Top Creator Tier' : '✓ Verified Escrow'}
              </span>
              <p className="font-sans text-kpugi-slate leading-relaxed text-[11px]">
                {role === 'creator'
                  ? 'Your trust score is 10/10. Instant payout release active.'
                  : '100% campaign budgets ring-fenced upfront in escrow.'}
              </p>
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl bg-kpugi-naira/10 text-kpugi-naira border border-kpugi-naira/20 flex items-center justify-center font-mono text-xs font-bold"
              title="Trust Score: 10/10"
            >
              10
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-kpugi-paper text-kpugi-ink">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-kpugi-ink/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless isMobileOpen, always visible on desktop */}
      <div className={`hidden lg:block`}>
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Slide-over */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-screen z-50 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Override fixed positioning for mobile — use relative inside the slide-over */}
        <aside className="w-[248px] h-screen bg-white border-r border-kpugi-border flex flex-col justify-between">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-5 h-[60px] shrink-0 border-b border-kpugi-border">
              <Link href="/" className="flex items-center">
                <Image src="/kpugi_logo.png" alt="Kpugi" width={90} height={28} className="object-contain" />
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-7 h-7 rounded-lg bg-kpugi-paper hover:bg-kpugi-border flex items-center justify-center text-kpugi-slate"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-sans text-[13px] font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-kpugi-blue text-white shadow-sm shadow-kpugi-blue/25'
                        : 'text-kpugi-slate hover:text-kpugi-ink hover:bg-kpugi-paper'
                    }`}
                  >
                    <span className={`shrink-0 ${isActive ? 'text-white' : ''}`}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Banner */}
            <div className="border-t border-kpugi-border p-4">
              <div className="p-3.5 rounded-xl bg-kpugi-blue/[0.06] border border-kpugi-blue/15">
                <span className="font-sans font-bold text-xs text-kpugi-blue block mb-1">
                  {role === 'creator' ? '✓ Top Creator Tier' : '✓ Verified Escrow'}
                </span>
                <p className="font-sans text-kpugi-slate leading-relaxed text-[11px]">
                  {role === 'creator'
                    ? 'Your trust score is 10/10. Instant payout release active.'
                    : '100% campaign budgets ring-fenced upfront in escrow.'}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content — offset by sidebar width */}
      <div
        className={`transition-[margin-left] duration-300 ease-in-out min-h-screen flex flex-col ${
          isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[248px]'
        }`}
      >
        <DashboardHeader
          title={title}
          role={role}
          onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
