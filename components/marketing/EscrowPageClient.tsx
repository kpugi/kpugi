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
  IoWalletOutline,
  IoRefreshOutline,
  IoLockClosedOutline,
  IoCashOutline,
  IoTimeOutline,
  IoWarningOutline,
} from 'react-icons/io5';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  number: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: 'section-1', number: '01', title: 'What Is Kpugi Escrow?' },
  { id: 'section-2', number: '02', title: 'How Escrow Works' },
  { id: 'section-3', number: '03', title: 'Brand Protections & Refunds' },
  { id: 'section-4', number: '04', title: 'Creator Guarantees' },
  { id: 'section-5', number: '05', title: 'The 1,000-View Milestone' },
  { id: 'section-6', number: '06', title: 'Withdrawal Requests & Friday Settlements' },
  { id: 'section-7', number: '07', title: 'Anti-Fraud & Quality Audits' },
  { id: 'section-8', number: '08', title: 'Disputes & Escrow Support' },
];

export default function EscrowPageClient() {
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
            Escrow & Settlement Policy
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl">
            How automated escrow protects brand budgets, guarantees creator earnings, and ensures friction-free Friday bank settlements.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <IoDocumentText className="size-4 text-blue-600 dark:text-blue-400" />
              Effective Date: September 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <IoShieldCheckmark className="size-4 text-emerald-600 dark:text-emerald-400" />
              100% Upfront Escrow Backing
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <IoCashOutline className="size-4 text-blue-600 dark:text-blue-400" />
              Weekly Friday Withdrawal Processing
            </span>
          </div>
        </div>
      </section>

      {/* ─── 2. DUAL-SIDED "AT A GLANCE" CARDS (REUSED INSET STYLE) ─────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: For Brands & Advertisers */}
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
                <span><strong className="text-slate-900 dark:text-white font-semibold">100% Escrow Protection:</strong> Your campaign budget stays locked safely in digital escrow. Creators cannot access funds until real views are verified.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Zero Budget Waste:</strong> You only pay for posts that surpass our 1,000-view quality threshold. You never pay for unverified or bot views.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Automatic Unspent Refunds:</strong> When your campaign flight ends, any unspent budget returns directly to your account balance automatically.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Flat 10% Fee:</strong> Completely transparent pricing with zero agency retainers, hidden subscription costs, or withdrawal penalties.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: For Creators & Publishers */}
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
                <span><strong className="text-slate-900 dark:text-white font-semibold">Guaranteed Funds Upfront:</strong> Every campaign on Kpugi is 100% pre-funded before it goes live. Brands can never ghost you or refuse payment after you post.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">1,000-View Milestone:</strong> Cross 1,000 genuine organic views on a post to unlock milestone earnings based on the campaign's CPM rate.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Weekly Friday Withdrawal Processing:</strong> Once earnings clear into your Available Balance, place a withdrawal request anytime. All requests are batched and disbursed to your Nigerian bank account (NUBAN) every Friday.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Keep Posts Up Indefinitely:</strong> Because brands pay for the promotional slot on your page, you contractually agree to keep the post live, active, and public on your timeline permanently. No deleting or privatizing.</span>
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
                Escrow Clauses
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
                <span className="text-slate-500 font-medium">Need escrow support?</span>
                <a
                  href="mailto:escrow@kpugi.com"
                  className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 transition-colors"
                >
                  <IoMail className="size-3.5 text-blue-600 dark:text-blue-400" />
                  <span>escrow@kpugi.com</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Clauses Body (8 Columns) */}
          <div className="lg:col-span-8 space-y-12 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            
            {/* Section 1 */}
            <article id="section-1" className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 01</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                What Is Kpugi Escrow?
              </h2>
              <p>
                In traditional influencer marketing, brands worry that creators will take their deposit and fail to deliver, while creators worry that brands will take their content and never pay.
              </p>
              <p>
                <strong>Kpugi Escrow solves this permanently.</strong> It acts as a neutral, automated digital vault. When a brand creates a campaign, the entire budget is locked in escrow before anyone posts. Funds are released automatically only when our telemetry systems verify that genuine organic views have been delivered.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1 text-xs sm:text-sm">
                <span className="font-bold text-slate-900 dark:text-white">The Core Rule:</span> Neither the brand nor the creator can unilaterally withdraw funds while a campaign is actively tracking. The code settles the money based strictly on verified performance.
              </div>
            </article>

            {/* Section 2 */}
            <article id="section-2" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 02</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                How Escrow Works (Step-by-Step)
              </h2>
              <p>
                Here is the simple, transparent lifecycle of every transaction on Kpugi:
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                    <IoLockClosedOutline className="size-4" />
                    <span>Step 1: Budget Lock</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Brand Funds Escrow</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    The brand deposits 100% of the planned campaign capital into escrow. Once confirmed, the campaign drops on the public directory.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <IoVideocam className="size-4" />
                    <span>Step 2: Post Clock-In</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Creator Publishes & Submits Link</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Creators create native content following the brief, post it publicly on their social media, and submit the link into Kpugi.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                    <IoRefreshOutline className="size-4" />
                    <span>Step 3: Hourly Telemetry Audits</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Scrapers Check Every 60 Minutes</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Once you submit your post link, our scrapers audit view counts every 60 minutes (every hour). As soon as the post crosses 1,000 verified views, earnings enter pending clearance and move into your Available Balance.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <IoCashOutline className="size-4" />
                    <span>Step 4: Clearance & Friday Settlement</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Withdrawal Request & Friday Bank Payout</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    From your settled Available Balance, submit a withdrawal request anytime during the week. All requests are processed and sent to your Nigerian bank account (NUBAN) every Friday.
                  </p>
                </div>
              </div>
            </article>

            {/* Section 3 */}
            <article id="section-3" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 03</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Brand Protections & The Unspent Refund Guarantee
              </h2>
              <p>
                When you fund a campaign on Kpugi, your capital is protected against underperformance:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>You Only Pay for Performance:</strong> If a creator’s post fails to reach the 1,000-view milestone, zero naira is deducted from your campaign budget.</li>
                <li><strong>No Inflated Invoicing:</strong> Escrow is drawn down strictly by audited organic views multiplied by your set CPM rate.</li>
              </ul>

              <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 space-y-2 text-slate-800 dark:text-slate-200">
                <h4 className="font-bold font-display text-base text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <IoRefreshOutline className="size-5 text-blue-600 dark:text-blue-400" />
                  The Unspent Refund Guarantee
                </h4>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Suppose you deposit <strong>₦500,000</strong> for a campaign flight. If participating creators generate <strong>₦320,000</strong> worth of verified views by the time the campaign tracking period closes, the remaining <strong>₦180,000</strong> is automatically returned to your account balance. You can withdraw it or use it for your next campaign. Zero cancellation fees.
                </p>
              </div>
            </article>

            {/* Section 4 */}
            <article id="section-4" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 04</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Creator Guarantees: End of Broken Promises
              </h2>
              <p>
                In the traditional Nigerian creator space, delayed payments, excuses, and ghosting are rampant. Kpugi completely eliminates this:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>No Fake Briefs:</strong> A brand cannot post an open campaign on Kpugi unless their funds are already in our escrow vault.</li>
                <li><strong>Guaranteed Payout Backing:</strong> Once your post delivers verified views, the brand has no ability to withhold your money. The escrow contract settles automatically.</li>
                <li><strong>Equal Access:</strong> Payouts are determined strictly by verified views, not by how many followers you have or who you know in the industry.</li>
                <li><strong>Indefinite Placement Commitment:</strong> Brands pay for the permanent promotional slot on your social feed. In return, you agree to keep the post live and public indefinitely.</li>
              </ul>
            </article>

            {/* Section 5 */}
            <article id="section-5" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 05</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                The 1,000-View Milestone & CPM Math
              </h2>
              <p>
                Every campaign on Kpugi operates with a transparent milestone structure:
              </p>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold pb-2 border-b border-slate-200 dark:border-white/10">
                  <span>View Count</span>
                  <span>Escrow Status</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-500">Under 1,000 Views</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">Locked / Milestone Pending (₦0)</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-slate-900 dark:text-white">1,000 Views Reached</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Milestone Unlocked</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-500">1,001 Views up to Cap</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">CPM Rate Paid Pro-Rata</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                For example, if a campaign pays ₦1,500 per 1,000 views (CPM) with a maximum cap of 50,000 views, a post that reaches 10,000 verified views earns ₦15,000 directly from the escrow pool.
              </p>
            </article>

            {/* Section 6 */}
            <article id="section-6" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 06</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Withdrawal Requests & Friday Bank Settlements
              </h2>
              <p>
                Payouts on Kpugi are orderly, transparent, and creator-initiated. We do not do same-day payments or surprise sweeps:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Stage 1</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Pending Clearance</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    When scrapers verify milestones on your post, earned funds move into Pending Clearance while traffic quality and anti-bot checks conclude.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Stage 2</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Available Balance</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Once clearance passes, the funds settle into your Available Balance. These funds are now officially cleared and ready for withdrawal.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Stage 3</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Friday Disbursement</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Place a withdrawal request from your Available Balance. All submitted requests are batched and disbursed directly to your bank every Friday.
                  </p>
                </div>
              </div>

              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300 pt-2">
                <li><strong>Creator-Initiated Requests:</strong> Creators must place a withdrawal request for funds settled in their Available Balance. Funds remain safely in your balance until you choose to request a withdrawal.</li>
                <li><strong>Weekly Friday Processing:</strong> All withdrawal requests placed during the week are batched and disbursed on Friday. For instance, if you place a withdrawal request on Monday, it will land in your bank account on Friday.</li>
                <li><strong>Direct NUBAN Transfer:</strong> Earnings transfer directly into your registered Nigerian bank account without third-party delay, gift cards, or crypto conversions.</li>
                <li><strong>Flat 10% Platform Fee:</strong> Kpugi deducts a flat 10% marketplace fee to maintain hourly scraping infrastructure, anti-bot security, and automated escrow. What displays in your Available Balance is what you withdraw to your bank account.</li>
              </ul>
            </article>

            {/* Section 7 */}
            <article id="section-7" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 07</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Anti-Fraud & Indefinite Content Retention
              </h2>
              <p>
                To protect escrow funds and brand investments, all tracked campaigns operate under strict quality and retention standards:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Hourly Scraping Audits:</strong> Once a creator submits a post, our scraping engine checks and audits the post every 60 minutes (every hour) to verify genuine view accumulation and engagement curves.</li>
                <li><strong>Bot Traffic Filtering:</strong> Views generated by synthetic bots, click farms, headless browsers, or auto-refresh scripts are detected and discarded. They never count toward escrow releases.</li>
                <li><strong>Immediate Disqualification:</strong> If deliberate metric manipulation is confirmed, the submission is disqualified, all pending and accumulated escrow earnings for that post are forfeited, and the creator’s account is permanently suspended.</li>
                <li><strong>Indefinite Content Retention:</strong> When you clock into a campaign, you contractually agree to keep the campaign brief and post live and public on your timeline indefinitely. The brand has paid for that promotional slot on your social media page. Deleting, archiving, or making the post private at any time forfeits all earnings and triggers platform suspension.</li>
              </ul>
            </article>

            {/* Section 8 */}
            <article id="section-8" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 08</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Disputes & Escrow Support
              </h2>
              <p>
                If any discrepancy occurs regarding a post’s view count, clock-in timestamp, or escrow disbursement:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>7-Day Review Window:</strong> Either party can request an audit review within 7 days of campaign closure by contacting <a href="mailto:escrow@kpugi.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">escrow@kpugi.com</a>.</li>
                <li><strong>Objective Log Verification:</strong> Our engineering team reviews server logs, scraper snapshots, and public platform data to resolve disputes fairly.</li>
                <li><strong>Final Settlement:</strong> If an error is verified, escrow adjustments are made immediately prior to the next Friday payout batch.</li>
              </ul>

              <div className="mt-6 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#0E111C] border border-slate-200/80 dark:border-white/5 space-y-4">
                <div>
                  <h4 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    Need Help With an Escrow Settlement?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Our dedicated settlement desk is available to assist brands and creators with any payment questions.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="mailto:escrow@kpugi.com"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
                  >
                    <IoMail className="size-4" />
                    <span>Email escrow@kpugi.com</span>
                  </a>
                  <Link
                    href="/contact"
                    className="px-5 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/10 transition-colors"
                  >
                    <span>Visit Help Desk</span>
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
