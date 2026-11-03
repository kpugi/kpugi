'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Timer,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Percent,
  Truck,
  Zap,
  Building2,
  TrendingUp,
  Copy,
  Check,
  Users,
  KeyRound,
  FileCheck,
} from 'lucide-react';
import { submitWaitlistAction, verifyVipPasscodeAction } from '@/app/actions/waitlist';

const TICKER_EVENTS = [
  { name: 'Chioma A.', text: 'joined 3 mins ago from Lagos' },
  { name: 'FitLife NG', text: 'secured ₦3.5M brand escrow spot 5 mins ago' },
  { name: 'Emeka Clips', text: 'claimed +₦15k early creator bonus from Abuja' },
  { name: 'PayZen Africa', text: 'registered ad account 8 mins ago' },
  { name: 'Tunde_Viral', text: 'verified TikTok handle from Ibadan' },
];

export default function PrelaunchCountdownView() {
  const router = useRouter();

  // ─── 1. Countdown State (Target: Nov 20, 2026 09:00:00 WAT) ─────────────
  const [timeLeft, setTimeLeft] = useState({
    days: '17',
    hours: '14',
    minutes: '32',
    seconds: '49',
  });

  useEffect(() => {
    // Nov 20, 2026 09:00:00 GMT+0100 (WAT)
    const targetDate = new Date('2026-11-20T09:00:00+01:00').getTime();

    function updateTimer() {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      });
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── 2. Social Proof Ticker Rotation ──────────────────────────────────
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerFade, setTickerFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerFade(false);
      setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % TICKER_EVENTS.length);
        setTickerFade(true);
      }, 300);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // ─── 3. Dual-Role Form State ──────────────────────────────────────────
  const [role, setRole] = useState<'creator' | 'brand'>('creator');
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');

  // Creator fields
  const [creatorHandle, setCreatorHandle] = useState('');
  const [primaryPlatform, setPrimaryPlatform] = useState('tiktok');
  const [monthlyReach, setMonthlyReach] = useState('tier2');

  // Brand fields
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [adBudget, setAdBudget] = useState('tier_b1');
  const [campaignGoals, setCampaignGoals] = useState('brand_reach');

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passcode, setPasscode] = useState('KPUGI-VIP-20NOV');
  const [spotNumber, setSpotNumber] = useState(2842);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // VIP Passcode Unlock Dialog / Input
  const [showCodeUnlock, setShowCodeUnlock] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [unlockStatus, setUnlockStatus] = useState<{ loading: boolean; error?: string }>({
    loading: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await submitWaitlistAction({
        role,
        fullName,
        workEmail,
        creatorHandle: role === 'creator' ? creatorHandle : undefined,
        primaryPlatform: role === 'creator' ? primaryPlatform : undefined,
        monthlyReach: role === 'creator' ? monthlyReach : undefined,
        companyWebsite: role === 'brand' ? companyWebsite : undefined,
        adBudget: role === 'brand' ? adBudget : undefined,
        campaignGoals: role === 'brand' ? campaignGoals : undefined,
      });

      if (res.success) {
        setIsSuccess(true);
        if (res.passcode) setPasscode(res.passcode);
        if (res.spotNumber) setSpotNumber(res.spotNumber);
      } else {
        setErrorMessage(res.error || 'Failed to submit registration. Please check your details.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setFullName('');
    setWorkEmail('');
    setCreatorHandle('');
    setCompanyWebsite('');
    setIsSuccess(false);
    setErrorMessage('');
  }

  function handleCopyPasscode() {
    navigator.clipboard.writeText(passcode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  async function handleUnlockWithCode(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    setUnlockStatus({ loading: true });
    try {
      const res = await verifyVipPasscodeAction(inviteCodeInput.trim());
      if (res.success) {
        router.push('/browse');
      } else {
        setUnlockStatus({ loading: false, error: res.error || 'Invalid code.' });
      }
    } catch (err: any) {
      setUnlockStatus({ loading: false, error: err.message || 'Failed to verify code.' });
    }
  }

  return (
    <div className="relative w-full overflow-hidden bg-slate-50 dark:bg-[#070913] text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Ambient Gradient Background Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-[#2F49E8]/15 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 -right-24 w-80 h-80 bg-blue-500/10 dark:bg-[#2F49E8]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col items-center text-center">
        
        {/* ─── TOP ANNOUNCEMENT CHIP ─────────────────────────────────────── */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 shadow-sm mb-6 hover:border-[#2F49E8]/40 transition-colors">
         
        </div>

        {/* ─── HERO HEADLINE ────────────────────────────────────────────── */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white max-w-4xl leading-[1.12] mb-5">
          The High-Trust Ad Marketplace for Nigerian Creators & Brands.
        </h1>

        {/* ─── VALUE PROPOSITION SUBTITLE ───────────────────────────────── */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-10">
          Guaranteed Stanbic IBTC custodial payouts, automated view auditing for TikTok & Instagram Reels, and zero bank delays. Reserve your early access spot before public launch on{' '}
          <span className="font-bold text-[#2F49E8] dark:text-blue-400">November 20th</span>.
        </p>

        {/* ─── INTERACTIVE COUNTDOWN UNIT ───────────────────────────────── */}
        <div className="w-full max-w-2xl bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 md:p-7 shadow-xl shadow-slate-200/40 dark:shadow-black/50 mb-12 flex flex-col items-center">
          
          <div className="flex flex-col sm:flex-row items-center justify-between w-full pb-4 border-b border-slate-100 dark:border-white/10 mb-6 gap-2">
            
          </div>

          {/* 4-Box Countdown Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full">
            {/* Days */}
            <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] rounded-xl shadow-inner">
              <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {timeLeft.days}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] rounded-xl shadow-inner">
              <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {timeLeft.hours}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                Hours
              </span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] rounded-xl shadow-inner">
              <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {timeLeft.minutes}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                Minutes
              </span>
            </div>

            {/* Seconds (Accent highlight) */}
            <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-blue-50/60 dark:bg-[#2F49E8]/10 border border-blue-200/70 dark:border-[#2F49E8]/30 rounded-xl shadow-inner">
              <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-black text-[#2F49E8] dark:text-blue-400 tracking-tight">
                {timeLeft.seconds}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#2F49E8] dark:text-blue-400 mt-1">
                Seconds
              </span>
            </div>
          </div>

         
        </div>

        {/* ─── DUAL-ROLE VIP WAITLIST FORM ──────────────────────────────── */}
        <div
          id="waitlist-form"
          className="w-full max-w-xl text-left bg-white dark:bg-[#0c0f1d] border border-slate-200/90 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative mb-12 scroll-mt-24"
        >
         

          <div className="flex flex-col gap-1.5 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
              Reserve Your VIP Waitlist Spot
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Receive early invite credentials via SMS & email on Nov 19th. First 100 verified creators claim guaranteed bonuses.
            </p>
          </div>

          {/* Role Toggle Switch */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-white/[0.06] rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('creator')}
              className={`py-2.5 text-center text-xs sm:text-sm font-bold rounded-lg transition-all ${
                role === 'creator'
                  ? 'bg-white dark:bg-[#151928] text-[#2F49E8] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              I am a Creator / Clipper
            </button>
            <button
              type="button"
              onClick={() => setRole('brand')}
              className={`py-2.5 text-center text-xs sm:text-sm font-bold rounded-lg transition-all ${
                role === 'brand'
                  ? 'bg-white dark:bg-[#151928] text-[#2F49E8] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              I am a Brand / Advertiser
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {role === 'creator' ? 'Full Legal Name' : 'Brand / Company Name'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'creator' ? 'e.g. Oluwaseun Adeleke' : 'e.g. Flutterwave, PiggyVest, or Brand LLC'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F49E8] focus:bg-white dark:focus:bg-[#121626] transition-all"
                />
              </div>

              {/* Work Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F49E8] focus:bg-white dark:focus:bg-[#121626] transition-all"
                />
              </div>

              {/* Creator-Specific Fields */}
              {role === 'creator' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        TikTok / IG Handle
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-slate-400 font-mono text-sm">@</span>
                        <input
                          type="text"
                          value={creatorHandle}
                          onChange={(e) => setCreatorHandle(e.target.value)}
                          placeholder="clipper_hub_ng"
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F49E8] transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Primary Media Channel
                      </label>
                      <select
                        value={primaryPlatform}
                        onChange={(e) => setPrimaryPlatform(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151928] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2F49E8] transition-all"
                      >
                        <option value="tiktok">TikTok Nigeria</option>
                        <option value="reels">Instagram Reels</option>
                        <option value="shorts">YouTube Shorts</option>
                        <option value="x">X (Twitter Video)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Average Monthly Video Views
                    </label>
                    <select
                      value={monthlyReach}
                      onChange={(e) => setMonthlyReach(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151928] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2F49E8] transition-all"
                    >
                      <option value="tier1">10,000 – 50,000 views</option>
                      <option value="tier2">50,000 – 250,000 views</option>
                      <option value="tier3">250,000 – 1,000,000+ views</option>
                      <option value="tier4">1,000,000+ views (Power Clipper)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Brand-Specific Fields */}
              {role === 'brand' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Company Domain
                      </label>
                      <input
                        type="text"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="payco.ng or brand.africa"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F49E8] transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Monthly Campaign Budget
                      </label>
                      <select
                        value={adBudget}
                        onChange={(e) => setAdBudget(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151928] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2F49E8] transition-all"
                      >
                        <option value="tier_b1">₦500,000 – ₦2,000,000</option>
                        <option value="tier_b2">₦2,000,000 – ₦5,000,000</option>
                        <option value="tier_b3">₦5,000,000 – ₦15,000,000</option>
                        <option value="tier_b4">₦15,000,000+ (Enterprise Escrow)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Primary Campaign Goal
                    </label>
                    <select
                      value={campaignGoals}
                      onChange={(e) => setCampaignGoals(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151928] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2F49E8] transition-all"
                    >
                      <option value="brand_reach">Viral Consumer Reach & Conversions</option>
                      <option value="app_installs">Fintech App Installs & KYC</option>
                      <option value="event_ticketing">Event Ticket Sales & Hype</option>
                      <option value="ecom_sales">Direct E-commerce Product GMV</option>
                    </select>
                  </div>
                </div>
              )}

              {/* VIP Early Bird Incentive Callout */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-[#2F49E8]/10 border border-blue-200/60 dark:border-[#2F49E8]/20 flex items-start gap-3 text-left">
                <Sparkles className="h-5 w-5 text-[#2F49E8] dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    VIP Early Bird Incentive Applied
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {role === 'creator'
                      ? 'Guaranteed +₦15,000 Escrow Payout Bounty on your first audited video submission.'
                      : 'Zero platform transaction fees on first ₦5M advertising spend + dedicated account strategist.'}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#2F49E8] hover:bg-blue-700 active:scale-[0.99] transition-all text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? 'Securing Your Priority Spot...'
                    : role === 'creator'
                    ? 'Join VIP Waitlist — Claim Creator Bounty'
                    : 'Join VIP Waitlist — Claim 0% Fee Tier'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Trust statement */}
              <div className="flex items-center justify-center gap-1.5 pt-1 text-slate-500 dark:text-slate-400 text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-[#2F49E8]" />
                <span>Zero spam. Early access link sent Nov 19th. Held under Stanbic IBTC Trustees.</span>
              </div>
            </form>
          ) : (
            /* ─── DYNAMIC SUCCESS CARD ──────────────────────────────────── */
            <div className="py-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400 shadow-lg">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <span className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                Spot Reserved #{spotNumber}!
              </span>

              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mb-6 leading-relaxed">
                Your verification pass has been queued. We've locked your VIP allocation and early payout bonus for November 20th.
              </p>

              {/* VIP Passcode Pill */}
              <div className="bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 px-5 py-3 rounded-xl flex items-center gap-3 mb-6">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                  Passcode:
                </span>
                <span className="font-mono text-base font-black text-[#2F49E8] dark:text-blue-400 tracking-wider">
                  {passcode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPasscode}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-300"
                  title="Copy Passcode"
                >
                  {copiedCode ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/browse?code=${passcode}`}
                  className="px-5 py-2.5 rounded-xl bg-[#2F49E8] text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-md"
                >
                  Preview Platform with VIP Passcode →
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Register another profile
                </button>
              </div>
            </div>
          )}

          {/* Tester Code Unlock Link */}
          {!isSuccess && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowCodeUnlock(!showCodeUnlock)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F49E8] dark:text-blue-400 hover:underline"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Already have a VIP invite passcode? Unlock preview</span>
              </button>
            </div>
          )}

          {/* Tester Unlock Input Drawer */}
          {showCodeUnlock && !isSuccess && (
            <form onSubmit={handleUnlockWithCode} className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Enter your VIP Passcode to unlock preview:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  placeholder="e.g. KPUGI-VIP-20NOV"
                  className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-[#121626] border border-slate-200 dark:border-white/10 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#2F49E8]"
                />
                <button
                  type="submit"
                  disabled={unlockStatus.loading}
                  className="px-4 py-2 rounded-lg bg-[#2F49E8] text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  {unlockStatus.loading ? 'Checking...' : 'Unlock'}
                </button>
              </div>
              {unlockStatus.error && (
                <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold">
                  {unlockStatus.error}
                </span>
              )}
            </form>
          )}
        </div>

        {/* ─── SOCIAL MOMENTUM TICKER & AVATARS ──────────────────────────── */}
        <div className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm mb-16">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                alt="Creator avatar"
                className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-[#0c0f1d] object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                alt="Creator avatar"
                className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-[#0c0f1d] object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces"
                alt="Creator avatar"
                className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-[#0c0f1d] object-cover"
              />
              <div className="h-10 w-10 rounded-full bg-[#2F49E8] text-white flex items-center justify-center text-xs font-black ring-2 ring-white dark:ring-[#0c0f1d]">
                +2.8k
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                2,840+ creators and 110+ Nigerian brands
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                already secured VIP access allocations
              </span>
            </div>
          </div>

          {/* Rotating Live Ticker */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] text-xs text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#2F49E8] animate-pulse shrink-0" />
            <span
              className={`font-medium transition-opacity duration-300 ${
                tickerFade ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <strong className="text-slate-950 dark:text-white font-bold">
                {TICKER_EVENTS[tickerIndex].name}
              </strong>{' '}
              {TICKER_EVENTS[tickerIndex].text}
            </span>
          </div>
        </div>

        {/* ─── VIP WAITLIST PERKS GRID ───────────────────────────────────── */}
        <div className="w-full max-w-5xl text-left mb-16">
          <div className="flex flex-col items-center text-center mb-8">
            <span className="text-xs font-black tracking-widest text-[#2F49E8] dark:text-blue-400 uppercase mb-1">
              Launch Member Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              Exclusive VIP Waitlist Perks
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mt-1">
              Built specifically to solve payment delays, view inflation, and agency middleman fees in Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="p-5 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-sm hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-[#2F49E8] mb-1">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-slate-950 dark:text-white">
                +₦15,000 Escrow Bonus
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Awarded directly into your wallet upon approval of your first verified 5k-view TikTok or Reels clipping submission.
              </p>
              <div className="mt-auto pt-3 font-mono text-[11px] font-bold text-[#2F49E8] dark:text-blue-400">
                First 500 Qualified Creators
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-5 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-sm hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                <Percent className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-slate-950 dark:text-white">
                0% Platform Clearing Fee
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Advertisers and creators keep 100% of their campaign budget and gross payouts for the entire first 90 days.
              </p>
              <div className="mt-auto pt-3 font-mono text-[11px] font-bold text-[#2F49E8] dark:text-blue-400">
                90-Day Fee Holiday
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-5 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-sm hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-slate-950 dark:text-white">
                GIG Creator Kit Delivery
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Priority free logistics delivery across Nigeria for studio ring lights and Rode wireless clip mic kits to top 100 waitlisters.
              </p>
              <div className="mt-auto pt-3 font-mono text-[11px] font-bold text-[#2F49E8] dark:text-blue-400">
                Nationwide Fulfillment
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-5 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-sm hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-slate-950 dark:text-white">
                Instant Direct Settlements
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time bank credit alerts direct to all Nigerian banks. Zero Sunday maintenance lockups or delayed net-30 agency invoices.
              </p>
              <div className="mt-auto pt-3 font-mono text-[11px] font-bold text-[#2F49E8] dark:text-blue-400">
                Sub-2-Minute Bank Rails
              </div>
            </div>
          </div>
        </div>

        {/* ─── TRUST INFRASTRUCTURE & REGULATORY STRIP ───────────────────── */}
        <div className="w-full max-w-5xl rounded-2xl bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-white/10">
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nigeria Financial Trust Standard
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Institutional Grade Advertising Settlement Infrastructure
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/10 text-[#2F49E8] text-xs font-semibold">
              <Building2 className="h-4 w-4" />
              <span>Stanbic IBTC Trustees Limited</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-[#2F49E8] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Tripartite Custody
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                  Client funds segregated in trustee bank vaults.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <FileCheck className="h-5 w-5 text-[#2F49E8] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  NDPR & BVN Compliant
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                  Automated Nigerian data privacy protocols.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <TrendingUp className="h-5 w-5 text-[#2F49E8] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Automated View Audit
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                  Anti-bot crawler verifies genuine engagement.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Zap className="h-5 w-5 text-[#2F49E8] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Direct Bank Clearing
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                  Instant direct clearing to all Nigerian banks.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
