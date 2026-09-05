'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/base-ui/card';
import {
  IoShieldCheckmark,
  IoWallet,
  IoVideocam,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoArrowForward,
  IoDocumentText,
  IoScale,
  IoHelpCircle,
  IoMail,
  IoChevronForward,
} from 'react-icons/io5';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  number: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: 'section-1', number: '01', title: 'Welcome & Eligibility' },
  { id: 'section-2', number: '02', title: 'How Kpugi Works' },
  { id: 'section-3', number: '03', title: 'Brand & Advertiser Rules' },
  { id: 'section-4', number: '04', title: 'Creator & Content Rules' },
  { id: 'section-5', number: '05', title: 'The 1,000-View Milestone' },
  { id: 'section-6', number: '06', title: 'Fair Play & Anti-Bot Policy' },
  { id: 'section-7', number: '07', title: 'Fees, Escrow & Friday Settlements' },
  { id: 'section-8', number: '08', title: 'Content Rights & Ownership' },
  { id: 'section-9', number: '09', title: 'Prohibited Campaigns & Rules' },
  { id: 'section-10', number: '10', title: 'Independent Social Platforms' },
  { id: 'section-11', number: '11', title: 'Resolving Disputes & Contact' },
];

export default function TermsPageClient() {
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
            Terms of Service
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl">
            Clear, honest rules for brands and creators on Kpugi. Built on guaranteed escrow, verified views, and automated weekly bank payouts.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <IoDocumentText className="size-4 text-blue-600 dark:text-blue-400" />
              Effective Date: September 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <IoScale className="size-4 text-emerald-600 dark:text-emerald-400" />
              Governing Law: Federal Republic of Nigeria
            </span>
            <span>•</span>
            <span>Applies to both Brands and Creators</span>
          </div>
        </div>
      </section>

      {/* ─── 2. DUAL-SIDED "AT A GLANCE" CARDS (USER'S INSET STYLE) ─────────── */}
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
                <span><strong className="text-slate-900 dark:text-white font-semibold">100% Escrow Protection:</strong> Your campaign funds are held in secure escrow and only released when verified organic views are delivered.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Pay for Results Only:</strong> You never pay for unverified traffic or posts that fall short of our 1,000-view threshold.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Automatic Unspent Refunds:</strong> When your campaign window finishes, any remaining unused budget is credited back to your balance automatically.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Promotional License:</strong> You have full rights to re-share, embed, and showcase submitted creator videos across your official marketing channels.</span>
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
                <span><strong className="text-slate-900 dark:text-white font-semibold">Guaranteed Payouts:</strong> Reach 1,000 genuine views on your post and you unlock verified CPM earnings backed by locked escrow.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">No Follower Gates:</strong> Anyone with authentic content and real reach can earn. We judge views, not follower vanity metrics.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">Weekly Friday Bank Settlements:</strong> Once earnings clear into your Available Balance, place a withdrawal request anytime to have it processed and sent to your Nigerian bank on Friday.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white font-semibold">You Keep Your Copyright:</strong> You own your original video, your persona, and your creative work. Kpugi and brands only receive a promotional license.</span>
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
                Table of Contents
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
                <span className="text-slate-500 font-medium">Need immediate clarification?</span>
                <Link
                  href="/contact"
                  className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 transition-colors"
                >
                  <IoMail className="size-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Contact Legal Team</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Legal Clauses Body (8 Columns) */}
          <div className="lg:col-span-8 space-y-12 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            
            {/* Section 1 */}
            <article id="section-1" className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 01</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Welcome & Eligibility
              </h2>
              <p>
                These Terms of Service create a straightforward, binding agreement between you and <strong>Kpugi Technologies</strong> (registered under the laws of the Federal Republic of Nigeria, originating from Bonny Island, Rivers State). By creating an account, launching a campaign, or clocking in a promotional link, you agree to follow these rules.
              </p>
              <p>
                <strong>Who can join Kpugi?</strong>
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Age Requirement:</strong> You must be at least 18 years old to register or transact on Kpugi.</li>
                <li><strong>Creators:</strong> Any creator with authentic social accounts on supported platforms (Instagram, TikTok, X) and an active Nigerian bank account.</li>
                <li><strong>Brands:</strong> Legitimate business owners, registered companies, marketing agencies, and startups commissioning genuine promotional campaigns.</li>
              </ul>
              <p>
                Kpugi is an independent software marketplace connecting advertisers with creators. We are not an employer, talent agent, or creative management firm. Creators retain full editorial independence subject only to the brand's approved brief.
              </p>
            </article>

            {/* Section 2 */}
            <article id="section-2" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 02</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                How Kpugi Works
              </h2>
              <p>
                Kpugi replaces slow agency retainers and upfront guesswork with an automated performance workflow:
              </p>
              <ol className="list-decimal list-outside pl-5 space-y-2.5 text-slate-600 dark:text-slate-300">
                <li><strong>Brand Deposits into Escrow:</strong> The brand funds a campaign budget that is locked upfront in secure escrow.</li>
                <li><strong>Creators Pick Campaigns:</strong> Creators review briefs on the platform, create native content, and post it publicly on their social media.</li>
                <li><strong>Clocking In:</strong> Creators paste their live post link into Kpugi to begin automated view tracking.</li>
                <li><strong>Hourly View Verification:</strong> Our automated scrapers audit post view counts every 60 minutes (every hour) to track genuine milestone progress.</li>
                <li><strong>Clearance & Friday Bank Settlement:</strong> Once verified views pass pending clearance and settle into your Available Balance, place a withdrawal request. All submitted requests are processed and disbursed to your Nigerian bank account (NUBAN) every Friday.</li>
              </ol>
            </article>

            {/* Section 3 */}
            <article id="section-3" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 03</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Brand & Advertiser Rules
              </h2>
              <p>
                As an advertiser on Kpugi, you agree to:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Fund 100% Upfront:</strong> No campaign will be published to the public marketplace until your total budget is deposited into secure escrow.</li>
                <li><strong>Provide Clear Briefs:</strong> Campaign goals, key talking points, required hashtags, and approved links must be clearly stated in the brief before going live.</li>
                <li><strong>Fair Payment Allocation:</strong> Your escrow balance is automatically depleted strictly as verified views are delivered by creators according to your chosen rate (CPM).</li>
                <li><strong>Automatic Refund of Unspent Funds:</strong> If your campaign tracking period expires without consuming your full escrow budget, the unspent portion is returned to your account balance automatically.</li>
              </ul>
            </article>

            {/* Section 4 */}
            <article id="section-4" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 04</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Creator & Content Rules
              </h2>
              <p>
                As a creator on Kpugi, you agree to:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Clock In Promptly:</strong> Submit your live public video or post link before campaign submission limits are filled.</li>
                <li><strong>Follow the Brief:</strong> Include required hashtags, brand mentions, and designated landing links without altering them.</li>
                <li><strong>Indefinite Content Retention:</strong> Submitted campaign posts must remain live, active, and publicly accessible on your timeline indefinitely. Brands have purchased that promotional placement on your page; archiving, deleting, or making a post private at any time will forfeit all accumulated payouts and risk platform suspension.</li>
                <li><strong>Authentic Community:</strong> You are responsible for maintaining genuine audience engagement on your personal profiles.</li>
              </ul>
            </article>

            {/* Section 5 */}
            <article id="section-5" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 05</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                The 1,000-View Milestone
              </h2>
              <p>
                Kpugi operates on a verified view milestone rule:
              </p>
              <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 space-y-2 text-slate-800 dark:text-slate-200">
                <h4 className="font-bold font-display text-base text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <IoCheckmarkCircle className="size-4 text-blue-600 dark:text-blue-400" />
                  The 1,000-View Rule
                </h4>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Every submitted post must achieve at least <strong>1,000 verified organic views</strong> to qualify for payouts. Posts generating fewer than 1,000 views do not unlock escrow disbursements. Once the 1,000-view milestone is crossed, earnings are calculated on all verified views up to the campaign cap.
                </p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                This rule ensures brands receive genuine baseline reach and protects creators by guaranteeing that real performance is always paid out.
              </p>
            </article>

            {/* Section 6 */}
            <article id="section-6" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 06</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Fair Play & Anti-Bot Policy
              </h2>
              <p>
                We have a strict <strong>zero-tolerance policy</strong> for fake engagement. Our automated telemetry systems actively audit view velocity, viewer retention, and engagement anomalies:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Forbidden Actions:</strong> Using click farms, auto-refreshers, headless browsers, engagement pods, or purchasing views from third-party vendor panels.</li>
                <li><strong>Automated Detection:</strong> When unnatural spikes or suspicious viewer patterns are detected, the post is automatically flagged for review.</li>
                <li><strong>Consequences:</strong> Any confirmed attempt to inflate metrics results in immediate campaign disqualification, forfeiture of all unpaid earnings, and a permanent ban from the Kpugi platform.</li>
              </ul>
            </article>

            {/* Section 7 */}
            <article id="section-7" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 07</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Fees, Escrow & Friday Bank Settlements
              </h2>
              <p>
                Our fee structure is completely transparent with no hidden surprises:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Platform Fee:</strong> Kpugi retains a flat <strong>10% service fee</strong> on campaign transactions to maintain 60-minute scrapers, secure escrow, and customer support.</li>
                <li><strong>Escrow Security:</strong> All funds deposited by advertisers are held in automated escrow and released only as real views are verified.</li>
                <li><strong>Withdrawal Requests & Friday Settlements:</strong> Once funds pass pending clearance and enter Available Balance, creators place a withdrawal request. All requests are processed and transferred directly into registered Nigerian bank accounts (NUBAN) every Friday (e.g., a withdrawal requested on Monday lands in your bank account on Friday).</li>
                <li><strong>Tax Responsibility:</strong> Each party is responsible for their own applicable personal or business income taxes under Nigerian law.</li>
              </ul>
            </article>

            {/* Section 8 */}
            <article id="section-8" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 08</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Content Rights & Ownership
              </h2>
              <p>
                We believe in fair ownership boundaries:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Creators Own Their Work:</strong> You retain complete underlying copyright over your video, audio, and personal likeness.</li>
                <li><strong>Brand License:</strong> By accepting a campaign, the creator grants the brand a non-exclusive, worldwide, royalty-free license to re-share, embed, and quote the submitted post across their official marketing channels.</li>
                <li><strong>Kpugi Showcase:</strong> Kpugi may display public campaign posts inside our directory, case studies, and marketing materials to highlight marketplace activity.</li>
              </ul>
            </article>

            {/* Section 9 */}
            <article id="section-9" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 09</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Prohibited Campaigns & Rules
              </h2>
              <p>
                To protect our community, certain campaign categories are strictly banned from Kpugi. You may not create or promote campaigns involving:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <li>Illegal goods, unregulated pharmaceuticals, or counterfeit products.</li>
                <li>Unlicensed financial get-rich-quick schemes, pyramid programs, or deceptive forex/crypto doubling schemes.</li>
                <li>Adult entertainment, hate speech, or harassment targeting any individual or group.</li>
                <li>Defamatory or misleading advertising violating Nigerian advertising standards.</li>
              </ul>
              <p className="pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                For detailed content guidelines, please visit our dedicated <Link href="/rules" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Platform Rules</Link>.
              </p>
            </article>

            {/* Section 10 */}
            <article id="section-10" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 10</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Independent Social Platforms
              </h2>
              <p>
                Kpugi interacts with external social networks (such as Instagram, TikTok, and X) via public links and official APIs. However, Kpugi operates completely independently:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li>We are not affiliated with, endorsed by, or partnered with Meta, ByteDance, or X Corp.</li>
                <li>Creators must comply with the terms of service of each respective social network where they publish content.</li>
                <li>Kpugi is not responsible for external algorithm updates, shadowbans, or account actions imposed by external platforms on creator accounts.</li>
              </ul>
            </article>

            {/* Section 11 */}
            <article id="section-11" className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>Clause 11</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
                Resolving Disputes & Contact
              </h2>
              <p>
                We believe in resolving issues quickly and fairly:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Direct Negotiation First:</strong> If any dispute arises regarding an escrow release or campaign audit, both parties agree to first reach out to our team at <a href="mailto:legal@kpugi.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">legal@kpugi.com</a> for an amicable review.</li>
                <li><strong>Governing Law:</strong> These terms are governed exclusively by the laws of the Federal Republic of Nigeria.</li>
                <li><strong>Arbitration:</strong> Any unresolved controversy will be settled through binding arbitration in Nigeria under the Arbitration and Mediation Act, 2023.</li>
              </ul>
              
              <div className="mt-8 p-6 rounded-3xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
                <h4 className="text-base font-bold font-display text-slate-900 dark:text-white">
                  Questions about our terms?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Our compliance team is here to help. Contact us anytime or visit our 24/7 self-service help desk.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="mailto:legal@kpugi.com"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
                  >
                    <IoMail className="size-3.5" />
                    <span>Email legal@kpugi.com</span>
                  </a>
                  <Link
                    href="/contact"
                    className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-2"
                  >
                    <IoHelpCircle className="size-3.5" />
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
