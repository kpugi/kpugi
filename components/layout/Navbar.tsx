'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Menu, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-2xl backdrop-saturate-200 bg-white/80 dark:bg-[#050811]/85 border-b border-slate-200/80 dark:border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_12px_45px_rgba(0,0,0,0.6)] transition-all duration-300">
      {/* Specular glass top highlight line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300/60 dark:via-white/35 to-transparent pointer-events-none"
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* ─── LEFT: BRAND LOGO (UNTOUCHED) ────────────────────────────────── */}
        <div className="flex items-center justify-start shrink-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Image
              src="/kpugi_logo.png"
              alt="Kpugi Logo"
              width={115}
              height={32}
              className="h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              priority
            />
          </Link>
        </div>

        {/* ─── RIGHT: NAVIGATION LINKS & ACTIONS ───────────────────────────── */}
        <div className="hidden lg:flex items-center justify-end gap-6 flex-1">
          {/* Desktop Navigation Links */}
          <NavigationMenu className="static">
            <NavigationMenuList className="gap-1">

              {/* Brands */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/brands"
                    className={cn(
                      'px-3.5 py-2 text-sm font-semibold transition-colors duration-200 rounded-xl',
                      pathname === '/brands'
                        ? 'text-blue-600 dark:text-emerald-400 font-bold bg-blue-500/10 dark:bg-emerald-500/15'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10'
                    )}
                  >
                    Brands
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Creators */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/creators"
                    className={cn(
                      'px-3.5 py-2 text-sm font-semibold transition-colors duration-200 rounded-xl',
                      pathname === '/creators' || pathname === '/creator'
                        ? 'text-blue-600 dark:text-emerald-400 font-bold bg-blue-500/10 dark:bg-emerald-500/15'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10'
                    )}
                  >
                    Creators
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Browse Drops with LIVE Badge */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/browse"
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors duration-200 rounded-xl',
                      pathname === '/browse'
                        ? 'text-blue-600 dark:text-emerald-400 font-bold bg-blue-500/10 dark:bg-emerald-500/15'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10'
                    )}
                  >
                    Browse
                    <Badge
                      variant="secondary"
                      className="h-4.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 text-[9px] font-extrabold border border-emerald-500/30 animate-pulse"
                    >
                      LIVE
                    </Badge>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* How It Works */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/how-it-works"
                    className={cn(
                      'px-3.5 py-2 text-sm font-semibold transition-colors duration-200 rounded-xl',
                      pathname === '/how-it-works'
                        ? 'text-blue-600 dark:text-emerald-400 font-bold bg-blue-500/10 dark:bg-emerald-500/15'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10'
                    )}
                  >
                    How It Works
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>

          {/* Theme Toggle & Auth Action Buttons */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200/80 dark:border-white/10">
            {/* Futuristic Theme Switcher */}
            <ThemeToggle variant="futuristic" />

            {/* Signed Out State: Primary & Secondary Glass Buttons */}
            <SignedOut>
              {/* Secondary Glass Button */}
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-900/5 dark:bg-white/10 border border-slate-900/10 dark:border-white/20 backdrop-blur-md rounded-xl transition-all duration-200 hover:scale-[1.03] hover:bg-slate-900/10 dark:hover:bg-white/20 active:scale-[0.97]"
              >
                Sign In
              </Link>

              {/* Primary Glass Button (Exact "Watch Demo" Glass Container + White Icon Circle Badge) */}
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-slate-900/10 dark:bg-white/20 border border-slate-900/20 dark:border-white/30 backdrop-blur-md rounded-xl cursor-pointer whitespace-nowrap shadow-sm transition-all duration-200 hover:scale-[1.03] hover:bg-slate-900/15 dark:hover:bg-white/30 active:scale-[0.97]"
              >
                <div className="w-[20px] h-[20px] rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ArrowRight className="h-3 w-3" />
                </div>
                <span>Get Started</span>
              </Link>
            </SignedOut>

            {/* Signed In State: Direct Glass Dashboard CTA + UserButton Profile Avatar */}
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-slate-900/10 dark:bg-white/20 border border-slate-900/20 dark:border-white/30 backdrop-blur-md rounded-xl cursor-pointer whitespace-nowrap shadow-sm transition-all duration-200 hover:scale-[1.03] hover:bg-slate-900/15 dark:hover:bg-white/30 active:scale-[0.97]"
              >
                <div className="w-[20px] h-[20px] rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <LayoutDashboard className="h-3 w-3" />
                </div>
                <span>Dashboard</span>
              </Link>
              <div className="flex items-center justify-center p-1 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>

        {/* ─── MOBILE HAMBURGER & ACTIONS ─────────────────────────────────── */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <ThemeToggle variant="futuristic" />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 rounded-xl text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[300px] sm:w-[380px] flex-col justify-between border-l border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#050811]/95 backdrop-blur-3xl p-6 text-neutral-900 dark:text-neutral-50 overflow-y-auto shadow-2xl"
            >
              <div>
                {/* Mobile Drawer Header */}
                <div className="mb-6 flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
                  <Image
                    src="/kpugi_logo.png"
                    alt="Kpugi"
                    width={100}
                    height={28}
                    className="h-6 w-auto object-contain"
                  />
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-1.5">
                  <Link
                    href="/brands"
                    className={cn(
                      'block py-2.5 px-3.5 rounded-xl text-base font-bold transition-all',
                      pathname === '/brands'
                        ? 'text-blue-600 dark:text-emerald-400 bg-blue-500/10 dark:bg-emerald-500/15 shadow-sm'
                        : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                    )}
                  >
                    Brands
                  </Link>

                  <Link
                    href="/creators"
                    className={cn(
                      'block py-2.5 px-3.5 rounded-xl text-base font-bold transition-all',
                      pathname === '/creators' || pathname === '/creator'
                        ? 'text-blue-600 dark:text-emerald-400 bg-blue-500/10 dark:bg-emerald-500/15 shadow-sm'
                        : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                    )}
                  >
                    Creators
                  </Link>

                  <Link
                    href="/browse"
                    className={cn(
                      'flex items-center justify-between py-2.5 px-3.5 rounded-xl text-base font-bold transition-all',
                      pathname === '/browse'
                        ? 'text-blue-600 dark:text-emerald-400 bg-blue-500/10 dark:bg-emerald-500/15 shadow-sm'
                        : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                    )}
                  >
                    <span>Browse Campaigns</span>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/30"
                    >
                      LIVE
                    </Badge>
                  </Link>

                  <Link
                    href="/how-it-works"
                    className={cn(
                      'block py-2.5 px-3.5 rounded-xl text-base font-bold transition-all',
                      pathname === '/how-it-works'
                        ? 'text-blue-600 dark:text-emerald-400 bg-blue-500/10 dark:bg-emerald-500/15 shadow-sm'
                        : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                    )}
                  >
                    How It Works
                  </Link>
                </div>
              </div>

              {/* Mobile Drawer Bottom Actions */}
              <div className="mt-6 flex flex-col gap-3 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center justify-center w-full min-h-[46px] text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-900/5 dark:bg-white/10 border border-slate-900/10 dark:border-white/20 backdrop-blur-md rounded-xl transition-all duration-200 hover:bg-slate-900/10 dark:hover:bg-white/20 active:scale-[0.98]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center gap-2 w-full min-h-[46px] text-xs font-semibold text-slate-900 dark:text-white bg-slate-900/10 dark:bg-white/20 border border-slate-900/20 dark:border-white/30 backdrop-blur-md rounded-xl cursor-pointer whitespace-nowrap shadow-sm transition-all duration-200 hover:bg-slate-900/15 dark:hover:bg-white/30 active:scale-[0.97]"
                  >
                    <div className="w-[20px] h-[20px] rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                    <span>Get Started</span>
                  </Link>
                </SignedOut>

                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 w-full min-h-[46px] text-xs font-semibold text-slate-900 dark:text-white bg-slate-900/10 dark:bg-white/20 border border-slate-900/20 dark:border-white/30 backdrop-blur-md rounded-xl cursor-pointer whitespace-nowrap shadow-sm transition-all duration-200 hover:bg-slate-900/15 dark:hover:bg-white/30 active:scale-[0.97]"
                  >
                    <div className="w-[20px] h-[20px] rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <LayoutDashboard className="h-3 w-3" />
                    </div>
                    <span>Go to Dashboard</span>
                  </Link>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/60 dark:bg-white/10 border border-slate-200 dark:border-white/15">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Account Profile & Settings</span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </div>

            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
