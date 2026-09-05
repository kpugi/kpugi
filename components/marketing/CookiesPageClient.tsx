'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IoShieldCheckmark,
  IoVideocam,
  IoCheckmarkCircle,
  IoDocumentText,
  IoScale,
  IoMail,
  IoChevronForward,
  IoLockClosedOutline,
  IoColorPaletteOutline,
  IoSpeedometerOutline,
  IoBanOutline,
  IoSettingsOutline,
} from 'react-icons/io5';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  number: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: 'section-1', number: '01', title: 'What Are Cookies?' },
  { id: 'section-2', number: '02', title: 'The Cookies We Use' },
  { id: 'section-3', number: '03', title: 'What We Strictly Never Do' },
  { id: 'section-4', number: '04', title: 'Managing Your Cookies' },
  { id: 'section-5', number: '05', title: 'Policy Updates' },
  { id: 'section-6', number: '06', title: 'Questions & Privacy Contact' },
];

export default function CookiesPageClient() {
  const [activeSection, setActiveSection] = useState<string>('section-1');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ─── 1. HERO HEADER (NO BADGES) ────────────────────────────────────── */}
      <section className="relative pt-32 pb-14 sm:pt-40 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            Cookie Policy
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl">
            How we use cookies and browser storage to keep your account secure, remember your preferences, and keep Kpugi fast.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <IoDocumentText className="size-4 text-blue-600 dark:text-blue-400" />
              Last Updated: September 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <IoBanOutline className="size-4 text-emerald-600 dark:text-emerald-400" />
              Zero Third-Party Advertising Trackers
            </span>
            <span>•</span>
            <span>Plain English Guide</span>
          </div>
        </div>
      </section>

      {/* ─── 2. DUAL-SIDED "AT A GLANCE" CARDS (REUSED INSET STYLE) ─────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: For Creators */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#0E111C] border border-slate-200/80 dark:border-white/5 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <IoVideocam className="size-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">At a Glance</span>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">For Creators & Publishers</h3>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Keeps You Signed In:</strong> Session cookies keep you authenticated so you don’t have to enter passwords every time you inspect live scraper metrics or clock in post links.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Remembers Your Theme:</strong> Browser storage safely saves whether you prefer Dark mode or Light mode across visits.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Zero Cross-Site Tracking:</strong> We never drop cookies that follow your browsing habits onto other websites or social media platforms.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: For Brands & Businesses */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#0E111C] border border-slate-200/80 dark:border-white/5 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <IoShieldCheckmark className="size-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">At a Glance</span>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">For Brands & Advertisers</h3>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Secure Escrow Sessions:</strong> Security tokens protect your campaign funding and balance management against unauthorized cross-site requests.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Fast Dashboard Views:</strong> Caches non-sensitive UI settings so campaign directories and creator rosters load immediately.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Zero Commercial Dossiers:</strong> We do not sell, license, or share your cookie identifiers with external marketing agencies or ad networks.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* ─── 3. MAIN CONTENT WITH STICKY SIDEBAR NAVIGATION ────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24 border-t border-slate-200/80 dark:border-white/5 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Sticky Navigation Sidebar (4 Columns) */}
          <aside className="lg:col-span-4 sticky top-28 hidden lg:block space-y-4">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#0B0D14] border border-slate-200/80 dark:border-white/10 space-y-4 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cookie Policy Sections
              </div>
              <nav className="space-y-1">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group',
                      activeSection === sec.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[10px] opacity-75">{sec.number}</span>
                      <span className="truncate">{sec.title}</span>
                    </span>
                    <IoChevronForward className={cn('size-3 transition-transform', activeSection === sec.id && 'translate-x-0.5')} />
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-xs space-y-2">
                <span className="text-slate-500 font-medium">Have questions?</span>
                <a
                  href="mailto:privacy@kpugi.com"
                  className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 transition-colors"
                >
                  <IoMail className="size-3.5 text-blue-600 dark:text-blue-400" />
                  <span>privacy@kpugi.com</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Clauses Body (8 Columns) */}
          <div className="lg:col-span-8 space-y-12 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            
            {/* Section 1 */}
            <article id="section-1" className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 01</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                What Are Cookies & Browser Storage?
              </h2>
              <p>
                Cookies are small text files stored on your computer, tablet, or mobile phone by your web browser when you visit a website. Similar technologies include <strong>Local Storage</strong> and <strong>Session Storage</strong>, which allow web apps to remember small bits of state directly on your device.
              </p>
              <p>
                Think of them simply as <strong>digital memory</strong>. Without cookies, Kpugi would forget who you are every time you clicked to a new campaign, forcing you to log in repeatedly on every single page.
              </p>
            </article>

            {/* Section 2 */}
            <article id="section-2" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 02</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                The Cookies We Use
              </h2>
              <p>
                We believe in minimal, purposeful cookie usage. We only use cookies that serve a practical, direct purpose for operating your account:
              </p>

              <div className="space-y-4 pt-2">
                
                {/* 1. Essential Authentication */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    <IoLockClosedOutline className="size-4" />
                    <span>1. Essential Authentication Cookies</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Managed securely via our authentication infrastructure (Clerk). These cookies identify your active logged-in session, ensuring that only you can access your campaign submissions, escrow wallet, and bank account settings.
                  </p>
                  <div className="text-[11px] font-mono text-slate-500">Duration: Session / Up to 30 days active</div>
                </div>

                {/* 2. Theme & UI Preferences */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <IoColorPaletteOutline className="size-4" />
                    <span>2. Preferences & Theme Storage (Local Storage)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Saved directly in your browser’s local storage. Remembers whether you have set your interface to Dark mode or Light mode so your eyes don’t get blinded on page reload.
                  </p>
                  <div className="text-[11px] font-mono text-slate-500">Duration: Persistent on your local device</div>
                </div>

                {/* 3. Security & Anti-Fraud */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                    <IoShieldCheckmark className="size-4" />
                    <span>3. Security & Anti-CSRF Tokens</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Protective cryptographic tokens that verify form submissions come directly from you, preventing cross-site forgery and protecting your escrow balance from malicious third-party scripts.
                  </p>
                  <div className="text-[11px] font-mono text-slate-500">Duration: Temporary per transaction</div>
                </div>

                {/* 4. Anonymous Speed Telemetry */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <IoSpeedometerOutline className="size-4" />
                    <span>4. Anonymous Speed & Performance Telemetry</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    We measure anonymous page load times and error rates (e.g. PostHog, Clarity) to spot broken links and keep the platform running fast. This data is strictly aggregated and never linked to your personal identity.
                  </p>
                  <div className="text-[11px] font-mono text-slate-500">Duration: Anonymized aggregation</div>
                </div>

              </div>
            </article>

            {/* Section 3 */}
            <article id="section-3" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 03</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                What We Strictly Never Do
              </h2>
              <p>
                Our privacy ethos is simple: your attention and data are not our inventory. We make money only through legitimate marketplace fees, not surveillance.
              </p>

              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-3 text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold font-display text-base">
                  <IoBanOutline className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Our Anti-Tracking Guarantees</span>
                </div>
                <ul className="text-xs sm:text-sm space-y-2 list-disc list-outside pl-5 text-slate-700 dark:text-slate-300">
                  <li><strong>No Third-Party Ad Trackers:</strong> We do not allow external advertising networks to plant tracking pixels or follow you around the web.</li>
                  <li><strong>No Cross-Site Stalking:</strong> We do not track what you do on other websites before or after visiting Kpugi.</li>
                  <li><strong>Zero Data Selling:</strong> We never sell, lease, or license cookie identifiers, user demographics, or behavioral data to data brokers.</li>
                </ul>
              </div>
            </article>

            {/* Section 4 */}
            <article id="section-4" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 04</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Managing Your Cookies
              </h2>
              <p>
                You have full control over the cookies stored on your device. Most web browsers allow you to view, manage, and delete cookies through their settings:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">Google Chrome</h4>
                  <p className="text-slate-500 dark:text-slate-400">Settings → Privacy and security → Cookies and other site data</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">Apple Safari</h4>
                  <p className="text-slate-500 dark:text-slate-400">Preferences → Privacy → Block all cookies / Manage Website Data</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">Mozilla Firefox</h4>
                  <p className="text-slate-500 dark:text-slate-400">Settings → Privacy & Security → Cookies and Site Data</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">Microsoft Edge</h4>
                  <p className="text-slate-500 dark:text-slate-400">Settings → Cookies and site permissions → Manage cookies</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-1">
                <strong>Please Note:</strong> Disabling essential authentication cookies will prevent you from signing in to your Kpugi dashboard, clocking in post links, or managing your campaign budgets.
              </div>
            </article>

            {/* Section 5 */}
            <article id="section-5" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 05</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Policy Updates
              </h2>
              <p>
                If we introduce new features or integrate updated tools that modify our cookie usage, we will update this document immediately. The "Last Updated" date at the top will always reflect the most recent version.
              </p>
            </article>

            {/* Section 6 */}
            <article id="section-6" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 06</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Questions & Privacy Contact
              </h2>
              <p>
                Have questions regarding our cookie practices or your data rights on Kpugi? Our compliance and privacy team is available to assist:
              </p>

              <div className="mt-6 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#0E111C] border border-slate-200/80 dark:border-white/5 space-y-4">
                <div>
                  <h4 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    Kpugi Privacy & Compliance
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Kpugi Technologies • Registered in Nigeria (Bonny Island, Rivers State registry).
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="mailto:privacy@kpugi.com"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
                  >
                    <IoMail className="size-4" />
                    <span>Email privacy@kpugi.com</span>
                  </a>
                  <Link
                    href="/privacy"
                    className="px-5 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/10 transition-colors"
                  >
                    <span>Read Full Privacy Policy</span>
                  </Link>
                </div>
              </div>
            </article>

          </div>

        </div>
      </section>

      {/* End of Clauses */}
    </div>
  );
}
