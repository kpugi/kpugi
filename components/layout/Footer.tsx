'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { subscribeToNewsletterAction } from '@/app/actions/newsletter';
import {
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { FRESHDESK_LINKS } from '@/lib/support/freshdesk';

export interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

export interface Footer2Props {
  logo?: React.ReactNode;
  brandName?: string;
  tagline?: string;
  socialLinks?: SocialLink[];
  socialText?: string;
  linkGroups?: FooterLinkGroup[];
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  newsletterPlaceholder?: string;
  newsletterButtonText?: string;
  copyright?: string;
  floatingIcon?: React.ReactNode;
}

export function Footer2({
  logo,
  brandName = 'Kpugi',
  tagline = 'Elevating creator marketing to unprecedented heights.',
  socialLinks,
  socialText = 'Follow @Kpugi_hq',
  linkGroups,
  newsletterTitle = 'Join the Kpugi platform.',
  newsletterSubtitle = 'The future of performance ads is here.',
  newsletterPlaceholder = 'Enter email address',
  newsletterButtonText = 'Subscribe',
  copyright = `© ${new Date().getFullYear()} Kpugi Technologies. All rights reserved.`,
  floatingIcon,
}: Footer2Props) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Social Links updated to @Kpugi_hq across X, Instagram, Facebook, LinkedIn, YouTube
  const defaultSocialLinks: SocialLink[] = socialLinks || [
    {
      label: 'Twitter / X (@Kpugi_hq)',
      href: 'https://x.com/Kpugi_hq',
      icon: <Twitter className="h-4 w-4" />,
    },
    {
      label: 'Instagram (@Kpugi_hq)',
      href: 'https://instagram.com/Kpugi_hq',
      icon: <Instagram className="h-4 w-4" />,
    },
    {
      label: 'Facebook (@Kpugi_hq)',
      href: 'https://facebook.com/Kpugi_hq',
      icon: <Facebook className="h-4 w-4" />,
    },
    {
      label: 'LinkedIn (@Kpugi_hq)',
      href: 'https://linkedin.com/company/Kpugi_hq',
      icon: <Linkedin className="h-4 w-4" />,
    },
    {
      label: 'YouTube (@Kpugi_hq)',
      href: 'https://youtube.com/@Kpugi_hq',
      icon: <Youtube className="h-4 w-4" />,
    },
  ];

  // Industry Standard Link Groups: Explore, Resources & Tools, Company, Legal
  const defaultLinkGroups: FooterLinkGroup[] = linkGroups || [
    {
      title: 'Explore',
      links: [
        { label: 'For Brands', href: '/brands' },
        { label: 'For Creators', href: '/creators' },
        { label: 'Browse Campaigns', href: '/browse' },
        { label: 'How It Works', href: '/how-it-works' },
      ],
    },
    {
      title: 'Resources & Tools',
      links: [
        { label: 'CPM Calculator', href: '/calculator' },
        { label: 'ROI Estimator', href: '/roiestimator' },
        { label: 'Help & Support', href: 'https://support.kpugi.com' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Advertise', href: '/advertise' },
        { label: 'Blog', href: 'https://blog.kpugi.com'}
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Creator Rules', href: FRESHDESK_LINKS.rules, isExternal: true },
        { label: 'Brand & Advertiser Rules', href: FRESHDESK_LINKS.brandRules, isExternal: true },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Escrow Policy', href: '/escrow-policy' },
      ],
    },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubmitting(true);
    try {
      const res = await subscribeToNewsletterAction(email);
      if (res.success) {
        setIsSubscribed(true);
        setEmail('');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setIsSubscribed(true);
      setEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-[#F8F9FD] dark:bg-[#08090D] px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6 lg:flex-row">
        
        {/* ─── LEFT KPUGI ELECTRIC BLUE CARD ─────────────────────────────── */}
        <div className="bg-[#2F49E8] text-white flex min-h-[440px] shrink-0 flex-col justify-between rounded-[2.2rem] p-9 sm:p-11 lg:w-[400px] xl:w-[420px] shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top Logo / Wordmark */}
            <div className="flex items-center gap-2.5">
              {logo ? (
                <div className="text-white">{logo}</div>
              ) : (
                <Link href="/" className="inline-flex items-center gap-2">
                  <Image
                    src="/kpugi_logo.png"
                    alt="Kpugi Logo"
                    width={130}
                    height={34}
                    className="h-8 w-auto object-contain brightness-0 invert"
                    priority
                  />
                </Link>
              )}
            </div>

            {/* Main Tagline */}
            <div className="mt-20 sm:mt-24">
              <h2 className="text-2xl sm:text-3xl lg:text-[2.2rem] font-extrabold font-display leading-[1.12] text-white tracking-tight">
                {tagline}
              </h2>
            </div>
          </div>

          {/* Social Row at Bottom (@Kpugi_hq) */}
          <div className="relative z-10 mt-12 flex items-center justify-between gap-4 flex-wrap">
            <span className="text-xs font-bold text-white/90 tracking-wide">{socialText}</span>
            <div className="flex items-center gap-1.5">
              {defaultSocialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black/25 hover:bg-black/40 text-white rounded-full p-2.5 transition-all hover:scale-105"
                  aria-label={social.label}
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT DUAL-THEME CONTAINER CARD ────────────────────────────── */}
        <div className="bg-white dark:bg-[#0B0D14] text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/10 relative flex flex-1 flex-col justify-between overflow-hidden rounded-[2.2rem] p-9 sm:p-11 shadow-xl transition-colors duration-300">
          
          {/* Top Right Watermark Pattern */}
          <div className="text-slate-900/[0.03] dark:text-white/[0.04] pointer-events-none absolute -top-10 -right-10 h-80 w-80 rotate-12 select-none">
            {floatingIcon || (
              <Image
                src="/kpugi_favicon.png"
                alt="Kpugi Watermark"
                width={300}
                height={300}
                className="w-full h-full object-contain opacity-20 dark:opacity-25 grayscale brightness-200"
              />
            )}
          </div>

          {/* Link Groups */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">
            {defaultLinkGroups.map((group, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm tracking-tight uppercase tracking-wider">{group.title}</h3>
                <ul className="space-y-3">
                  {group.links.map((link, lIdx) => {
                    const isExternal = link.isExternal || link.href.startsWith('http');
                    if (isExternal) {
                      return (
                        <li key={lIdx}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-xs sm:text-sm font-bold transition-colors block"
                          >
                            {link.label}
                          </a>
                        </li>
                      );
                    }
                    return (
                      <li key={lIdx}>
                        <Link
                          href={link.href}
                          className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-xs sm:text-sm font-bold transition-colors block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Copyright & Newsletter Block */}
          <div className="relative z-10 mt-14 flex flex-col items-start justify-between gap-8 xl:flex-row xl:items-end pt-8 border-t border-slate-100 dark:border-white/10">
            {/* Copyright */}
            <div className="text-slate-500 dark:text-slate-400 order-2 text-xs leading-relaxed xl:order-1 font-medium">
              {copyright}
            </div>

            {/* Newsletter Input Block */}
            <div className="order-1 w-full space-y-3 sm:max-w-md xl:order-2">
              <div className="space-y-1">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                  {newsletterSubtitle}
                </p>
                <h3 className="text-slate-900 dark:text-white text-base sm:text-lg font-bold font-display">
                  {newsletterTitle}
                </h3>
              </div>

              {isSubscribed ? (
                <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Subscribed! Check your inbox for updates ⚡</span>
                </div>
              ) : (
                <form
                  className="relative flex items-center"
                  onSubmit={handleSubscribe}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={newsletterPlaceholder}
                    className="w-full rounded-full bg-slate-100 dark:bg-[#141724] border border-slate-200 dark:border-white/10 py-3.5 pr-36 pl-5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="absolute right-1.5 h-9 rounded-full bg-[#2F49E8] hover:bg-blue-600 text-white px-5 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 shadow-md shrink-0"
                  >
                    <span>{isSubmitting ? '...' : newsletterButtonText}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default function Footer() {
  return <Footer2 />;
}
