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
  Percent,
  Zap,
  Building2,
  TrendingUp,
  Copy,
  Check,
  Users,
  KeyRound,
  Award,
  Flame,
  BarChart3,
  CheckCheck,
} from 'lucide-react';
import { submitWaitlistAction, verifyVipPasscodeAction } from '@/app/actions/waitlist';

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

  // ─── 2. Dual-Role Form State ──────────────────────────────────────────
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
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2F49E8] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2F49E8]" />
          </span>
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Early Access Waitlist Open • Launching November 20th
          </span>
          <CheckCircle2 className="h-4 w-4 text-[#2F49E8] ml-0.5 shrink-0" />
        </div>

        {/* ─── HERO HEADLINE ────────────────────────────────────────────── */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white max-w-4xl leading-[1.12] mb-5">
          Where Creators Get Paid to Post &amp; Brands Buy Verified Reach.
        </h1>

        {/* ─── VALUE PROPOSITION SUBTITLE ───────────────────────────────── */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-10">
          Automated view auditing for TikTok, Instagram Reels &amp; YouTube Shorts with guaranteed escrow protection and direct bank settlements. Reserve your spot for the early rollout on{' '}
          <span className="font-bold text-[#2F49E8] dark:text-blue-400">November 20th</span>.
        </p>

        {/* ─── INTERACTIVE COUNTDOWN UNIT ───────────────────────────────── */}
        <div className="w-full max-w-2xl bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 md:p-7 shadow-xl shadow-slate-200/40 dark:shadow-black/50 mb-12 flex flex-col items-center">
          
          <div className="flex flex-col sm:flex-row items-center justify-between w-full pb-4 border-b border-slate-100 dark:border-white/10 mb-6 gap-2">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
              <Timer className="h-4 w-4 text-[#2F49E8]" />
              <span>Public Launch Countdown</span>
            </div>
            <span className="font-mono text-xs font-bold text-[#2F49E8] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-2.5 py-1 rounded-md">
              Nov 20, 2026 • 09:00 WAT
            </span>
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

          {/* Escrow Protection Strip */}
          <div className="w-full mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                100% Guaranteed Escrow: <strong className="text-slate-900 dark:text-white font-bold">Campaign funds reserved before creators post</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#2F49E8] dark:text-blue-400 font-semibold">
              <Lock className="h-3.5 w-3.5" />
              <span>Automated Payout Protection</span>
            </div>
          </div>
        </div>

        {/* ─── DUAL-ROLE VIP WAITLIST FORM ──────────────────────────────── */}
        <div
          id="waitlist-form"
          className="w-full max-w-xl text-left bg-white dark:bg-[#0c0f1d] border border-slate-200/90 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative mb-16 scroll-mt-24"
        >
          {/* Priority Badge */}
          <div className="absolute -top-3.5 right-6 bg-[#2F49E8] text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
            VIP Early Access
          </div>

          <div className="flex flex-col gap-1.5 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
              Reserve Your Priority Waitlist Spot
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Receive your early access invitation on Nov 19th. Early members unlock fee waivers and exclusive founder privileges.
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
                  Email Address
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
                        Company Domain / Website
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
                        <option value="tier_b4">₦15,000,000+ (High Volume Scale)</option>
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
                      <option value="brand_reach">Viral Consumer Reach &amp; Conversions</option>
                      <option value="app_installs">Fintech App Installs &amp; Signups</option>
                      <option value="event_ticketing">Event Ticket Sales &amp; Hype</option>
                      <option value="ecom_sales">Direct E-commerce Product GMV</option>
                    </select>
                  </div>
                </div>
              )}

              {/* VIP Early Bird Platform Perks Callout */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-[#2F49E8]/10 border border-blue-200/60 dark:border-[#2F49E8]/20 flex items-start gap-3 text-left">
                <Sparkles className="h-5 w-5 text-[#2F49E8] dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Early Member Launch Advantage
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {role === 'creator'
                      ? '0% commission for 90 days (keep 100% of your earnings) + permanent Founding Creator profile badge.'
                      : '0% platform clearing fee on ad spend for 90 days + dedicated creator onboarding strategist.'}
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
                    ? 'Join VIP Waitlist — Claim Creator Perks'
                    : 'Join VIP Waitlist — Claim Brand Perks'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Trust statement */}
              <div className="flex items-center justify-center gap-1.5 pt-1 text-slate-500 dark:text-slate-400 text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-[#2F49E8]" />
                <span>Zero spam. Early access credentials sent Nov 19th. Direct bank settlements.</span>
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
                Your priority pass has been queued. We&apos;ve locked your VIP allocation and early access privileges for November 20th.
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

        {/* ─── PLATFORM-WISE BENEFITS SECTION (CREATORS & BRANDS) ─────────── */}
        <div className="w-full max-w-5xl text-left space-y-12 mb-16">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-black tracking-widest text-[#2F49E8] dark:text-blue-400 uppercase mb-1">
              Launch Member Privileges
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              Exclusive Platform Perks for Early Members
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mt-1">
              Platform-level advantages designed to empower creators and help brands scale high-performing campaigns.
            </p>
          </div>

          {/* ── ROW 1: FOR CREATORS & CLIPPERS ───────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-[#2F49E8] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                For Creators &amp; Clippers
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                (Early Access Benefits)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Creator Perk 1 */}
              <div className="p-5 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-[#2F49E8] mb-1">
                  <Percent className="h-5 w-5" />
                </div>
                <span className="text-base font-bold text-slate-950 dark:text-white">
                  0% Commission (Keep 100%)
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  All platform clearing fees waived for your first 90 days. Keep 100% of your earnings on every verified view milestone.
                </p>
                <div className="mt-auto pt-3 font-mono text-[11px] font-bold text-[#2F49E8] dark:text-blue-400">
                  90-Day Fee Holiday
                </div>
              </div>

              {/* Creator Perk 2 */}
              <div className="p-5 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                  <Award className="h-5 w-5" />
                </div>
                <span className="text-base font-bold text-slate-950 dark:text-white">
                  Founding Creator Badge
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Permanent &apos;Founding Creator&apos; badge displayed on your public media kit and prioritized ranking in creator discovery searches.
                </p>
                <div className="mt-auto pt-3 font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  Permanent VIP Profile Flair
                </div>
              </div>

              {/* Creator Perk 3 */}
              <div className="p-5 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-base font-bold text-slate-950 dark:text-white">
                  Priority Campaign Slots
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Early 24-hour notification window on brand campaign drops. Claim limited high-CPM slots before general creator allocation.
                </p>
                <div className="mt-auto pt-3 font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  First-Look Drop Access
                </div>
              </div>

              {/* Creator Perk 4 */}
              <div className="p-5 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                  <CheckCheck className="h-5 w-5" />
                </div>
                <span className="text-base font-bold text-slate-950 dark:text-white">
                  Fast-Track View Audits
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Priority telemetry queue for TikTok, Instagram Reels, and YouTube Shorts. Sub-30-minute verification on your submissions.
                </p>
                <div className="mt-auto pt-3 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Priority Scraper Queue
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 2: FOR BRANDS & ADVERTISERS ──────────────────────────── */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                For Brands &amp; Advertisers
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                (Early Access Benefits)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Brand Perk 1 */}
              <div className="p-5 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-[#2F49E8] mb-1">
                  <Percent className="h-5 w-5" />
                </div>
                <span className="text-base font-bold text-slate-950 dark:text-white">
                  0% Clearing Fees
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Zero platform transaction surcharges on your first ₦5,000,000 in campaign budget allocations. 100% of spend goes to creator reach.
                </p>
                <div className="mt-auto pt-3 font-mono text-[11px] font-bold text-[#2F49E8] dark:text-blue-400">
                  Zero Platform Surcharges
                </div>
              </div>

              {/* Brand Perk 2 */}
              <div className="p-5 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-base font-bold text-slate-950 dark:text-white">
                  Top 1% Creator Roster
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Exclusive first-look access to Nigeria&apos;s most consistent, verified clip creators with verified organic engagement track records.
                </p>
                <div className="mt-auto pt-3 font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  Pre-Vetted Creator Matching
                </div>
              </div>

              {/* Brand Perk 3 */}
              <div className="p-5 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-base font-bold text-slate-950 dark:text-white">
                  Dedicated Growth Strategist
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  1-on-1 creative brief optimization and campaign setup assistance from our performance marketing team for your first 3 drops.
                </p>
                <div className="mt-auto pt-3 font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  Personalized Onboarding
                </div>
              </div>

              {/* Brand Perk 4 */}
              <div className="p-5 bg-white dark:bg-[#0c0f1d] border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-sm hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="text-base font-bold text-slate-950 dark:text-white">
                  Automated Anti-Bot Audits
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Real-time algorithmic checks filter out bot traffic and inflated metrics. Pay only for authentic Nigerian viewers who watch your content.
                </p>
                <div className="mt-auto pt-3 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Bot-Proof View Guarantee
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
