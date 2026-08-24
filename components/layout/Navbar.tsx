'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard,
  Sparkles,
  Layers,
  ArrowUpRight,
  Menu,
  Share2,
  Lock,
  Bot,
  Users,
} from 'lucide-react';

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
        'sticky top-0 z-50 w-full transition-all duration-300 pointer-events-none',
        isScrolled ? 'lg:pt-2.5' : 'lg:pt-0'
      )}
    >
      <div
        className={cn(
          'pointer-events-auto mx-auto flex items-center justify-between transition-all duration-300 ease-out',
          // Base mobile styles (always full-width top header)
          'w-full px-4 sm:px-6 h-16 bg-white/90 dark:bg-[#090A0F]/90 backdrop-blur-xl border-b border-black/[0.07] dark:border-white/[0.08] shadow-sm',
          // Desktop dynamic transition: Expands at top, Compacts when scrolled
          isScrolled
            ? 'lg:max-w-4xl lg:h-13 lg:rounded-full lg:px-5 lg:shadow-xl lg:shadow-black/10 dark:lg:shadow-black/60 lg:border lg:border-black/10 dark:lg:border-white/15 lg:bg-white/95 dark:lg:bg-[#090A0F]/95'
            : 'lg:max-w-7xl lg:h-16 lg:rounded-none lg:px-6 lg:border-b lg:border-t-0 lg:border-x-0'
        )}
      >
        
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

        {/* Center: Desktop Navigation Links (Evenly Spaced) */}
        <div className="hidden lg:flex items-center justify-center flex-initial">
          <NavigationMenu className="static">
            <NavigationMenuList className="gap-1 sm:gap-2">
              
              {/* For Brands */}
              <NavigationMenuItem>
                <Link href="/brands" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      'rounded-full bg-transparent px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 hover:text-kpugi-blue dark:hover:bg-white/10 dark:hover:text-white',
                      pathname === '/brands'
                        ? 'text-kpugi-blue dark:text-blue-400 font-bold bg-blue-50/70 dark:bg-blue-500/10'
                        : 'text-slate-800 dark:text-neutral-200'
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
                      'rounded-full bg-transparent px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 hover:text-kpugi-blue dark:hover:bg-white/10 dark:hover:text-white',
                      pathname === '/creators'
                        ? 'text-kpugi-blue dark:text-blue-400 font-bold bg-blue-50/70 dark:bg-blue-500/10'
                        : 'text-slate-800 dark:text-neutral-200'
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
                      'flex items-center gap-1.5 rounded-full bg-transparent px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 hover:text-kpugi-blue dark:hover:bg-white/10 dark:hover:text-white',
                      pathname === '/browse'
                        ? 'text-kpugi-blue dark:text-blue-400 font-bold bg-blue-50/70 dark:bg-blue-500/10'
                        : 'text-slate-800 dark:text-neutral-200'
                    )}
                  >
                    Browse
                    <Badge
                      variant="secondary"
                      className="h-4.5 rounded-full bg-blue-100 px-1.5 text-[9px] font-bold text-kpugi-blue hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400"
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
                      'rounded-full bg-transparent px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 hover:text-kpugi-blue dark:hover:bg-white/10 dark:hover:text-white',
                      pathname === '/how-it-works'
                        ? 'text-kpugi-blue dark:text-blue-400 font-bold bg-blue-50/70 dark:bg-blue-500/10'
                        : 'text-slate-800 dark:text-neutral-200'
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
        <div className="flex items-center justify-end flex-1 shrink-0 gap-3">
          
          <ThemeToggle />

          {/* Signed Out State */}
          <SignedOut>
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white hover:text-kpugi-blue dark:hover:text-blue-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 text-xs font-bold text-white bg-kpugi-blue hover:bg-blue-600 rounded-xl shadow-sm shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Get Started
            </Link>
          </SignedOut>

          {/* Signed In State */}
          <SignedIn>
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-white/90"
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
                  className="shrink-0 rounded-xl text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-[300px] sm:w-[380px] flex-col justify-between border-l border-neutral-200 bg-white p-6 text-neutral-900 dark:border-neutral-800 dark:bg-[#090A0F] dark:text-neutral-50 overflow-y-auto"
              >
                <div>
                  {/* Mobile Drawer Header */}
                  <div className="mb-6 flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
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
                        'block py-2.5 px-3 rounded-xl text-base font-bold transition-colors hover:bg-slate-100 hover:text-kpugi-blue dark:hover:bg-white/10 dark:hover:text-blue-400',
                        pathname === '/brands' ? 'text-kpugi-blue dark:text-blue-400 bg-blue-50/70 dark:bg-blue-500/10' : 'text-slate-900 dark:text-white'
                      )}
                    >
                      For Brands
                    </Link>

                    <Link
                      href="/creators"
                      className={cn(
                        'block py-2.5 px-3 rounded-xl text-base font-bold transition-colors hover:bg-slate-100 hover:text-kpugi-blue dark:hover:bg-white/10 dark:hover:text-blue-400',
                        pathname === '/creators' ? 'text-kpugi-blue dark:text-blue-400 bg-blue-50/70 dark:bg-blue-500/10' : 'text-slate-900 dark:text-white'
                      )}
                    >
                      Creators
                    </Link>

                    <Link
                      href="/browse"
                      className={cn(
                        'flex items-center justify-between py-2.5 px-3 rounded-xl text-base font-bold transition-colors hover:bg-slate-100 hover:text-kpugi-blue dark:hover:bg-white/10 dark:hover:text-blue-400',
                        pathname === '/browse' ? 'text-kpugi-blue dark:text-blue-400 bg-blue-50/70 dark:bg-blue-500/10' : 'text-slate-900 dark:text-white'
                      )}
                    >
                      <span>Browse Campaigns</span>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-kpugi-blue dark:bg-blue-500/20 dark:text-blue-400 font-bold"
                      >
                        LIVE
                      </Badge>
                    </Link>

                    <Link
                      href="/how-it-works"
                      className={cn(
                        'block py-2.5 px-3 rounded-xl text-base font-bold transition-colors hover:bg-slate-100 hover:text-kpugi-blue dark:hover:bg-white/10 dark:hover:text-blue-400',
                        pathname === '/how-it-works' ? 'text-kpugi-blue dark:text-blue-400 bg-blue-50/70 dark:bg-blue-500/10' : 'text-slate-900 dark:text-white'
                      )}
                    >
                      How It Works
                    </Link>
                  </div>
                </div>

                {/* Mobile Drawer Bottom Actions */}
                <div className="mt-6 flex flex-col gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
                  <SignedOut>
                    <Link href="/sign-in" className="w-full">
                      <Button variant="outline" className="w-full justify-center font-bold">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" className="w-full">
                      <Button className="w-full justify-center bg-kpugi-blue text-white hover:bg-blue-600 font-bold">
                        Get Started
                      </Button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="w-full">
                      <Button className="w-full justify-center bg-neutral-900 text-white dark:bg-white dark:text-black font-bold">
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
