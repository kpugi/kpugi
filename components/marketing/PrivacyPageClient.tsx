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
  IoKeyOutline,
  IoLockClosedOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  number: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: 'section-1', number: '01', title: 'Information We Collect' },
  { id: 'section-2', number: '02', title: 'How We Use Your Data' },
  { id: 'section-3', number: '03', title: 'Social Permissions & OAuth' },
  { id: 'section-4', number: '04', title: 'We Never Sell Your Data' },
  { id: 'section-5', number: '05', title: 'Data Security & Storage' },
  { id: 'section-6', number: '06', title: 'Your Rights & Deletion' },
  { id: 'section-7', number: '07', title: 'Cookies & Local Storage' },
  { id: 'section-8', number: '08', title: 'Contact Privacy Team' },
];

export default function PrivacyPageClient() {
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
            Privacy Policy
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl">
            How we protect your personal information, handle social media permissions, and safeguard your payment details on Kpugi.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <IoDocumentText className="size-4 text-blue-600 dark:text-blue-400" />
              Last Updated: September 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <IoScale className="size-4 text-emerald-600 dark:text-emerald-400" />
              Compliant with the Nigeria Data Protection Act (NDPA)
            </span>
            <span>•</span>
            <span>Applies to both Creators and Brands</span>
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
                <span><strong className="text-slate-900 dark:text-white font-semibold">Read-Only Social Access:</strong> When you connect Instagram, TikTok, or X, we only read public post view metrics. We can never post, edit, or message on your behalf.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Protected Bank Details:</strong> Your Nigerian bank account details (NUBAN) are encrypted and used solely to send your automated Friday earnings.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Zero Password Access:</strong> We use official secure OAuth login tokens. We never see, ask for, or store your social account passwords.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Total Control:</strong> Disconnect your social accounts anytime or request total account deletion with a single tap.</span>
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
                <span><strong className="text-slate-900 dark:text-white font-semibold">Brief Confidentiality:</strong> Your draft campaigns, creative assets, and target budgets remain private until you choose to publish them.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Encrypted Billing Data:</strong> Corporate invoicing details and transaction histories are protected with bank-grade encryption.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Clean Analytics:</strong> View telemetry and impression data are calculated cleanly without exposing personal creator profiles to unsolicited contact.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Zero Data Selling:</strong> We never sell your company data, marketing plans, or transaction metrics to third parties.</span>
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
                Privacy Sections
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
                <span className="text-slate-500 font-medium">Have a privacy question?</span>
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

          {/* Privacy Clauses Body (8 Columns) */}
          <div className="lg:col-span-8 space-y-12 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            
            {/* Section 1 */}
            <article id="section-1" className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 01</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Information We Collect
              </h2>
              <p>
                We only collect information that is strictly necessary to run our creator marketing marketplace, verify organic views, and pay creators reliably. Here is what we collect:
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Account Information</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Your full name, email address, chosen handle, and profile picture created during registration.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Connected Social Account Data</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    When you link your Instagram, TikTok, or X accounts, we collect public handles, follower figures, and authorized read-only OAuth tokens to verify post submissions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Payout & Financial Information</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    For creators, your verified Nigerian bank account number (NUBAN), bank name, and account holder name. For brands, your billing contact and transaction receipts.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Verification & Telemetry Data</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    When you clock in a campaign post link, our automated scrapers monitor view counts, timestamps, and public engagement metrics to compute verified CPM milestones.
                  </p>
                </div>
              </div>
            </article>

            {/* Section 2 */}
            <article id="section-2" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 02</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                How We Use Your Data
              </h2>
              <p>
                We use collected information solely to operate the platform smoothly and fulfill our agreements:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Tracking Campaign Views:</strong> Checking live post links through official APIs and scrapers to calculate view performance against the 1,000-view milestone.</li>
                <li><strong>Processing Friday Payouts:</strong> Automatically sending approved earnings to your bank account every Friday.</li>
                <li><strong>Preventing Fraud:</strong> Detecting bot traffic, click farms, and inorganic view spikes to protect brand budgets.</li>
                <li><strong>Communicating Updates:</strong> Sending important notifications about campaign approvals, clock-in deadlines, and payout receipts.</li>
              </ul>
            </article>

            {/* Section 3 */}
            <article id="section-3" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 03</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Social Permissions & OAuth
              </h2>
              <p>
                Connecting your social media profiles on Kpugi is safe, fast, and transparent:
              </p>

              <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 space-y-3 text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold font-display text-base">
                  <IoKeyOutline className="size-5 text-blue-600 dark:text-blue-400" />
                  <span>Our Strict Social Privacy Guarantees</span>
                </div>
                <ul className="text-xs sm:text-sm space-y-2 list-disc list-outside pl-5 text-slate-700 dark:text-slate-300">
                  <li><strong>Read-Only Access:</strong> We only request basic read permissions (<code className="text-xs bg-white dark:bg-black/40 px-1 py-0.5 rounded">user_profile</code>, <code className="text-xs bg-white dark:bg-black/40 px-1 py-0.5 rounded">user_media</code>).</li>
                  <li><strong>We Cannot Post:</strong> Kpugi has zero ability to publish posts, stories, reels, or tweets on your accounts.</li>
                  <li><strong>No Direct Message Access:</strong> We cannot see, read, or send private messages from your social profiles.</li>
                  <li><strong>Zero Password Knowledge:</strong> We authenticate via official OAuth protocols provided by Instagram, TikTok, and X. Your passwords never touch our servers.</li>
                </ul>
              </div>
            </article>

            {/* Section 4 */}
            <article id="section-4" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 04</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                We Never Sell Your Data
              </h2>
              <p>
                Our business model is clear: we facilitate creator marketing campaigns and take a flat 10% platform fee on transactions. <strong>We do not sell, rent, or trade your personal information to advertisers, data brokers, or marketing firms. Ever.</strong>
              </p>
              <p>
                We only share data with essential infrastructure partners that keep Kpugi running:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <li><strong>Banking & Escrow Partners:</strong> To securely process brand deposits and deliver creator payouts to Nigerian banks.</li>
                <li><strong>Cloud Infrastructure:</strong> Secure cloud servers (Supabase, Vercel) with encrypted databases located in hardened data centers.</li>
                <li><strong>Identity & Anti-Fraud Providers:</strong> Tools to verify legitimate business accounts and prevent financial crime.</li>
              </ul>
            </article>

            {/* Section 5 */}
            <article id="section-5" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 05</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Data Security & Storage
              </h2>
              <p>
                We use industry-standard technical measures to keep your data safe:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Encryption in Transit:</strong> All communications between your browser and our servers are encrypted using modern TLS 1.3 encryption.</li>
                <li><strong>Encryption at Rest:</strong> Bank account numbers and sensitive tokens are encrypted in our databases using AES-256 standards.</li>
                <li><strong>Row-Level Security:</strong> Strict database isolation ensures that creators can never view other creators' bank details, and brands cannot view other brands' private campaign budgets.</li>
              </ul>
            </article>

            {/* Section 6 */}
            <article id="section-6" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 06</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Your Rights & Data Deletion
              </h2>
              <p>
                Under the <strong>Nigeria Data Protection Act (NDPA)</strong>, you retain complete ownership of your personal data. You have the right to:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Disconnect Social Accounts:</strong> You can un-link any connected social account at any time from your <Link href="/accounts" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Accounts Settings</Link>. Once disconnected, we immediately stop fetching any post data from that profile.</li>
                <li><strong>Access & Export:</strong> Request a copy of all personal data, submission records, and payout histories associated with your account.</li>
                <li><strong>Correct Information:</strong> Update your name, contact email, or bank account details directly from your dashboard.</li>
                <li><strong>Complete Account Deletion:</strong> You can permanently delete your Kpugi account and remove all personal information by visiting our <Link href="/delete" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Data Deletion Guide</Link> or by sending an email to <a href="mailto:privacy@kpugi.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">privacy@kpugi.com</a>.</li>
              </ul>
            </article>

            {/* Section 7 */}
            <article id="section-7" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 07</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Cookies & Local Storage
              </h2>
              <p>
                We believe in minimal, purposeful cookie usage. We only use cookies for:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <li><strong>Essential Authentication:</strong> Keeping you logged in securely as you navigate between campaigns, wallets, and analytics.</li>
                <li><strong>Theme Preferences:</strong> Remembering whether you prefer Light mode or Dark mode.</li>
                <li><strong>Anonymous Performance Analytics:</strong> Measuring page load speeds to keep the marketplace fast and responsive.</li>
              </ul>
              <p className="pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                For complete technical details on our cookie practices, please read our dedicated <Link href="/cookies" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Cookie Policy</Link>.
              </p>
            </article>

            {/* Section 8 */}
            <article id="section-8" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Section 08</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Contacting Our Privacy Team
              </h2>
              <p>
                If you have any questions, requests, or concerns regarding your privacy or how your data is handled on Kpugi, please contact our Data Protection Officer directly:
              </p>

              <div className="mt-6 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#0E111C] border border-slate-200/80 dark:border-white/5 space-y-4">
                <div>
                  <h4 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    Kpugi Data Protection Officer
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Kpugi Technologies • Registered under the laws of the Federal Republic of Nigeria (Bonny Island, Rivers State registry).
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
                    href="/contact"
                    className="px-5 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/10 transition-colors"
                  >
                    <span>General Inquiries</span>
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
