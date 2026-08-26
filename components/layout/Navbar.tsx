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
import { Menu } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 pointer-events-none px-3 sm:px-6 pt-3 sm:pt-4'
      )}
    >
      <div
        className={cn(
          'pointer-events-auto relative mx-auto flex items-center justify-between transition-all duration-300 ease-out',
          // Apple-style liquid glass & mirror aesthetic
          'w-full rounded-full backdrop-blur-2xl backdrop-saturate-150',
          'bg-white/70 dark:bg-[#07090E]/70',
          'border border-white/60 dark:border-white/[0.12]',
          'shadow-[0_8px_30px_rgb(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.85)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.15)]',
          // Scroll-responsive capsule sizing
          isScrolled
            ? 'max-w-5xl h-13 sm:h-14 px-4 sm:px-6'
            : 'max-w-6xl h-15 sm:h-16 px-5 sm:px-7'
        )}
      >
        {/* Specular mirror glass top highlight edge */}
        <div
          aria-hidden
          className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/30 to-transparent pointer-events-none rounded-full"
        />

        {/* Ambient subtle mirror gloss reflection */}
        <div
          aria-hidden
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-64 h-8 bg-white/30 dark:bg-blue-500/10 blur-xl pointer-events-none rounded-full"
        />
        
        {/* Left Side: Logo */}
        <div className="flex items-center justify-start flex-1 shrink-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Image
              src="/kpugi_logo.png"
              alt="Kpugi Logo"
              width={115}
              height={32}
              className={cn(
                'w-auto object-contain transition-all duration-300 group-hover:scale-105',
                isScrolled ? 'h-6' : 'h-7'
              )}
              priority
            />
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden lg:flex items-center justify-center flex-initial">
          <NavigationMenu className="static">
            <NavigationMenuList className="gap-1 sm:gap-1.5">
              
              {/* For Brands */}
              <NavigationMenuItem>
                <Link href="/brands" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200',
                      pathname === '/brands'
                        ? 'text-kpugi-blue dark:text-blue-400 font-bold bg-kpugi-blue/10 dark:bg-blue-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                        : 'text-slate-700 dark:text-neutral-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                    )}
                  >
                    For Brands
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {/* Creators */}
              <NavigationMenuItem>
                <Link href="/creators" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200',
                      pathname === '/creators'
                        ? 'text-kpugi-blue dark:text-blue-400 font-bold bg-kpugi-blue/10 dark:bg-blue-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                        : 'text-slate-700 dark:text-neutral-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                    )}
                  >
                    Creators
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {/* Browse with LIVE Badge */}
              <NavigationMenuItem>
                <Link href="/browse" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200',
                      pathname === '/browse'
                        ? 'text-kpugi-blue dark:text-blue-400 font-bold bg-kpugi-blue/10 dark:bg-blue-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                        : 'text-slate-700 dark:text-neutral-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                    )}
                  >
                    Browse
                    <Badge
                      variant="secondary"
                      className="h-4.5 rounded-full bg-blue-100 text-kpugi-blue dark:bg-blue-500/20 dark:text-blue-400 px-1.5 text-[9px] font-bold border border-blue-500/20"
                    >
                      LIVE
                    </Badge>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {/* How It Works */}
              <NavigationMenuItem>
                <Link href="/how-it-works" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200',
                      pathname === '/how-it-works'
                        ? 'text-kpugi-blue dark:text-blue-400 font-bold bg-kpugi-blue/10 dark:bg-blue-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                        : 'text-slate-700 dark:text-neutral-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                    )}
                  >
                    How It Works
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Side: Theme Toggle, Auth Buttons, Mobile Drawer */}
        <div className="flex items-center justify-end flex-1 shrink-0 gap-2.5 sm:gap-3">
          
          <ThemeToggle />

          {/* Signed Out State */}
          <SignedOut>
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-neutral-300 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 text-xs font-bold text-white bg-[#2F49E8] hover:bg-blue-600 rounded-full shadow-[0_4px_14px_rgba(47,73,232,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </Link>
          </SignedOut>

          {/* Signed In State */}
          <SignedIn>
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex px-4 py-2 text-xs font-bold rounded-full shadow-sm transition-all bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-white/90 border border-white/20"
            >
              Dashboard →
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          {/* Mobile Sheet Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 rounded-full text-slate-900 hover:bg-white/40 dark:text-white dark:hover:bg-white/10"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-[300px] sm:w-[380px] flex-col justify-between border-l border-white/40 dark:border-white/10 bg-white/85 dark:bg-[#07090E]/90 backdrop-blur-2xl p-6 text-neutral-900 dark:text-neutral-50 overflow-y-auto shadow-2xl"
              >
                <div>
                  {/* Mobile Drawer Header */}
                  <div className="mb-6 flex items-center gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
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
                        'block py-2.5 px-3.5 rounded-2xl text-base font-bold transition-all',
                        pathname === '/brands'
                          ? 'text-kpugi-blue dark:text-blue-400 bg-blue-500/10 shadow-sm'
                          : 'text-slate-900 dark:text-white hover:bg-white/60 dark:hover:bg-white/10'
                      )}
                    >
                      For Brands
                    </Link>

                    <Link
                      href="/creators"
                      className={cn(
                        'block py-2.5 px-3.5 rounded-2xl text-base font-bold transition-all',
                        pathname === '/creators'
                          ? 'text-kpugi-blue dark:text-blue-400 bg-blue-500/10 shadow-sm'
                          : 'text-slate-900 dark:text-white hover:bg-white/60 dark:hover:bg-white/10'
                      )}
                    >
                      Creators
                    </Link>

                    <Link
                      href="/browse"
                      className={cn(
                        'flex items-center justify-between py-2.5 px-3.5 rounded-2xl text-base font-bold transition-all',
                        pathname === '/browse'
                          ? 'text-kpugi-blue dark:text-blue-400 bg-blue-500/10 shadow-sm'
                          : 'text-slate-900 dark:text-white hover:bg-white/60 dark:hover:bg-white/10'
                      )}
                    >
                      <span>Browse Campaigns</span>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-kpugi-blue dark:bg-blue-500/20 dark:text-blue-400 font-bold border border-blue-500/20"
                      >
                        LIVE
                      </Badge>
                    </Link>

                    <Link
                      href="/how-it-works"
                      className={cn(
                        'block py-2.5 px-3.5 rounded-2xl text-base font-bold transition-all',
                        pathname === '/how-it-works'
                          ? 'text-kpugi-blue dark:text-blue-400 bg-blue-500/10 shadow-sm'
                          : 'text-slate-900 dark:text-white hover:bg-white/60 dark:hover:bg-white/10'
                      )}
                    >
                      How It Works
                    </Link>
                  </div>
                </div>

                {/* Mobile Drawer Bottom Actions */}
                <div className="mt-6 flex flex-col gap-3 border-t border-black/[0.06] dark:border-white/[0.08] pt-6">
                  <SignedOut>
                    <Link href="/sign-in" className="w-full">
                      <Button variant="outline" className="w-full justify-center font-bold rounded-2xl border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" className="w-full">
                      <Button className="w-full justify-center bg-[#2F49E8] text-white hover:bg-blue-600 font-bold rounded-2xl shadow-lg shadow-blue-500/25">
                        Get Started
                      </Button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="w-full">
                      <Button className="w-full justify-center bg-neutral-900 text-white dark:bg-white dark:text-black font-bold rounded-2xl">
                        Go to Dashboard →
                      </Button>
                    </Link>
                  </SignedIn>
                </div>

              </SheetContent>
            </Sheet>
          </div>

        </div>

      </div>
    </header>
  );
}
