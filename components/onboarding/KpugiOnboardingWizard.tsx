'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  User,
  Building2,
  Rocket,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  ShieldCheck,
  Percent,
  Zap,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Target,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FALLBACK_NIGERIAN_BANKS } from '@/lib/paystack/banks';
import BankLogo from '@/components/ui/BankLogo';
import {
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  TwitterXIcon,
  FacebookIcon,
  LinkedInIcon,
} from '@/components/ui/SocialIcons';

// ─── Constants & Options ───────────────────────────────────────────────────────
const ALL_NICHES = [
  'Comedy & Memes',
  'Lifestyle & Vlog',
  'Tech & Gadgets',
  'Fashion & Beauty',
  'Gaming & Esports',
  'Entertainment & Movies',
  'Education & Career',
  'Finance & Crypto',
  'Fitness & Health',
  'Food & Travel',
];

const INDUSTRY_OPTIONS = [
  'E-commerce & Retail',
  'Fintech & Web3',
  'SaaS & Software',
  'Fashion & Consumer Goods',
  'Gaming & Mobile Apps',
  'Media & Entertainment',
  'Food & FMCG',
  'Health & Wellness',
  'Education & EdTech',
  'Travel & Hospitality',
  'Agency & Marketing',
  'Other',
];

const SOCIAL_CHANNELS = [
  { id: 'tiktok', label: 'TikTok', icon: TikTokIcon },
  { id: 'instagram', label: 'Instagram', icon: InstagramIcon },
  { id: 'youtube', label: 'YouTube', icon: YouTubeIcon },
  { id: 'x', label: 'X (Twitter)', icon: TwitterXIcon },
  { id: 'facebook', label: 'Facebook', icon: FacebookIcon },
  { id: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon },
];

const CAMPAIGN_GOALS = [
  { id: 'brand_reach', label: 'Brand Awareness & Reach', desc: 'Maximize viral impressions across Nigeria' },
  { id: 'sales_conversions', label: 'Sales & Conversions', desc: 'Drive qualified buyers to product pages' },
  { id: 'app_installs', label: 'App Downloads & Growth', desc: 'Boost app store rankings and registrations' },
  { id: 'community_buzz', label: 'Community Buzz & Hype', desc: 'Ignite discussions and user reactions' },
];

const BUDGET_TIERS = [
  { id: 'tier_1', label: '₦100,000 – ₦500,000', desc: 'Starter test flight' },
  { id: 'tier_2', label: '₦500,000 – ₦2,000,000', desc: 'Growth campaigns' },
  { id: 'tier_3', label: '₦2,000,000 – ₦10,000,000', desc: 'Nationwide viral scale' },
  { id: 'tier_4', label: '₦10,000,000+', desc: 'Enterprise allocation' },
];

const BRAND_PERKS = [
  { icon: '📣', text: 'Targeted reach' },
  { icon: '💰', text: 'CPM budgeting' },
  { icon: '✅', text: 'Verified views' },
  { icon: '📊', text: 'Live analytics' },
  { icon: '🎯', text: 'Multi-platform' },
  { icon: '⚡', text: 'Instant launch' },
];

const CREATOR_PERKS = [
  { icon: '💸', text: 'Auto payouts' },
  { icon: '🚀', text: 'TikTok & Insta' },
  { icon: '📱', text: 'Easy uploads' },
  { icon: '📈', text: 'Per-1K earnings' },
  { icon: '🔥', text: 'X / Twitter' },
  { icon: '🏆', text: 'Creator ranks' },
];

interface InitialUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  role?: string;
}

interface KpugiOnboardingWizardProps {
  initialUser: InitialUser;
}

export default function KpugiOnboardingWizard({ initialUser }: KpugiOnboardingWizardProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Wizard Step State (0 to 3) ──────────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0);

  // ─── Step 1: Role ────────────────────────────────────────────────────────────
  const [role, setRole] = useState<'creator' | 'advertiser'>(
    initialUser.role === 'advertiser' ? 'advertiser' : 'creator'
  );

  // ─── Step 2: Profile & Identity ──────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(initialUser.fullName || '');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['tiktok', 'instagram']);

  // Brand-specific
  const [companyName, setCompanyName] = useState(initialUser.fullName || '');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [industry, setIndustry] = useState('E-commerce & Retail');

  // ─── Step 3: Questionnaires & Financials ─────────────────────────────────────
  // Creator: Niches & Bank
  const [selectedNiches, setSelectedNiches] = useState<string[]>([
    'Lifestyle & Vlog',
    'Tech & Gadgets',
  ]);
  const [selectedBankCode, setSelectedBankCode] = useState('058'); // Default GTBank
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(null);
  const [isResolvingBank, setIsResolvingBank] = useState(false);
  const [bankResolveError, setBankResolveError] = useState<string | null>(null);

  // Brand: Objectives & Budget & Escrow
  const [selectedGoal, setSelectedGoal] = useState('brand_reach');
  const [selectedBudget, setSelectedBudget] = useState('tier_2');
  const [agreedEscrowRules, setAgreedEscrowRules] = useState(true);

  // ─── Submission & Status State ───────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Auto-trigger confetti on reaching Step 4 (Launch)
  useEffect(() => {
    if (activeStep === 3) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#2F49E8', '#17A75B', '#7B96FF', '#FFB800'],
      });
    }
  }, [activeStep]);

  // Dynamic Stepper Configuration
  const steps = [
    { title: 'Role', icon: UsersIconWrapper, label: 'Account Type' },
    { title: 'Identity', icon: role === 'advertiser' ? Building2 : User, label: 'Profile & Brand' },
    { title: 'Financials', icon: role === 'advertiser' ? Target : CreditCard, label: role === 'advertiser' ? 'Goals & Escrow' : 'Payouts & Niches' },
    { title: 'Launch', icon: Rocket, label: 'Ready to Earn' },
  ];

  function UsersIconWrapper(props: any) {
    return <Sparkles {...props} />;
  }

  // ─── Bank Account Resolver ───────────────────────────────────────────────────
  const handleVerifyBank = async (numOverride?: string, bankOverride?: string) => {
    const num = numOverride || accountNumber;
    const bank = bankOverride || selectedBankCode;

    if (!num || num.length !== 10) {
      setBankResolveError('Please enter a complete 10-digit account number.');
      return;
    }

    setIsResolvingBank(true);
    setBankResolveError(null);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve-bank',
          bank_code: bank,
          account_number: num,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not verify account name.');
      }
      setResolvedAccountName(data.account_name);
    } catch (err: any) {
      setResolvedAccountName(null);
      setBankResolveError(err.message || 'Verification failed. Please check digits.');
    } finally {
      setIsResolvingBank(false);
    }
  };

  // ─── Avatar Upload Handler ───────────────────────────────────────────────────
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);

    setIsUploadingAvatar(true);
    setStepError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'covers');

      const res = await fetch('/api/campaigns/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Avatar upload failed.');
      }
      setAvatarUrl(data.url);
    } catch (err: any) {
      console.error('[Avatar Upload error]:', err);
      // Keep local preview as fallback
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ─── Channel & Niche Toggles ─────────────────────────────────────────────────
  const toggleChannel = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId) ? prev.filter((c) => c !== channelId) : [...prev, channelId]
    );
  };

  const toggleNiche = (niche: string) => {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  };

  // ─── Step Navigation & Validation ────────────────────────────────────────────
  const handleNext = () => {
    setStepError(null);

    // Validation for Step 1 -> Step 2
    if (activeStep === 0) {
      if (!role) {
        setStepError('Please select a role to continue.');
        return;
      }
    }

    // Validation for Step 2 -> Step 3
    if (activeStep === 1) {
      if (role === 'creator') {
        if (!displayName.trim()) {
          setStepError('Please enter your creator display name.');
          return;
        }
      } else {
        if (!companyName.trim()) {
          setStepError('Please enter your company or brand name.');
          return;
        }
      }
    }

    // Validation for Step 3 -> Step 4
    if (activeStep === 2) {
      if (role === 'creator') {
        if (selectedNiches.length === 0) {
          setStepError('Please select at least one content niche.');
          return;
        }
      } else {
        if (!agreedEscrowRules) {
          setStepError('You must agree to the platform escrow rules to proceed.');
          return;
        }
      }
    }

    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStepError(null);
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  // ─── Final Submission (Step 4 Launch) ────────────────────────────────────────
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setStepError(null);

    try {
      const selectedBankObj = FALLBACK_NIGERIAN_BANKS.find((b) => b.code === selectedBankCode);

      if (role === 'creator') {
        const payload = {
          action: 'complete-creator',
          display_name: displayName.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl,
          niche_categories: selectedNiches,
          channels: selectedChannels,
          bank_details:
            accountNumber.length === 10
              ? {
                  bank_code: selectedBankCode,
                  bank_name: selectedBankObj?.name || 'Bank',
                  account_number: accountNumber,
                  account_name: resolvedAccountName || displayName,
                }
              : null,
        };

        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to complete creator onboarding.');
        }

        router.push(data.redirect || '/c/dashboard');
      } else {
        const payload = {
          action: 'complete-advertiser',
          company_name: companyName.trim(),
          company_website: companyWebsite.trim(),
          industry: industry,
          company_logo_url: avatarUrl,
          agreed_global_rules: agreedEscrowRules,
          campaign_goals: selectedGoal,
          estimated_budget: selectedBudget,
        };

        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to complete brand onboarding.');
        }

        router.push(data.redirect || '/b/dashboard');
      }
    } catch (err: any) {
      console.error('[Onboarding Submission error]:', err);
      setStepError(err.message || 'Something went wrong while launching your account.');
      setIsSubmitting(false);
    }
  };

  const progress = activeStep / (steps.length - 1);

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#070913] text-slate-900 dark:text-white font-satoshi flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-x-hidden selection:bg-[#2F49E8]/20 selection:text-[#2F49E8]">
      {/* Ambient background glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-[#2F49E8]/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ─── TOP BRAND BAR ─────────────────────────────────────────────────── */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center bg-white dark:bg-[#0c0f1d]">
            <Image
              src="/kpugi_favicon.png"
              alt="Kpugi Logo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-clash font-extrabold text-xl tracking-tight text-slate-950 dark:text-white">
              Kpugi
            </span>
            <span className="text-[10px] font-bold text-[#2F49E8] dark:text-blue-400 uppercase tracking-wider block leading-none">
              Onboarding
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Verified Session</span>
        </div>
      </header>

      {/* ─── MAIN WIZARD CARD ──────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center mb-8">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0f1d] p-6 sm:p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-black/60 flex flex-col gap-8 transition-colors">
          
          {/* ── STEPPER PROGRESS BAR ─────────────────────────────────────── */}
          <div className="relative pt-2">
            {/* Background track line */}
            <div
              className="absolute top-5 h-0.5 bg-slate-200 dark:bg-white/10"
              style={{ left: '12.5%', right: '12.5%' }}
            />
            {/* Animated primary track line */}
            <motion.div
              className="absolute top-5 h-0.5 bg-[#2F49E8] origin-left"
              style={{ left: '12.5%', right: '12.5%' }}
              initial={false}
              animate={{ scaleX: progress }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
            {/* Glowing tracer dot */}
            <motion.span
              className="absolute size-2.5 rounded-full bg-[#2F49E8] shadow-[0_0_8px_#2F49E8]"
              style={{ top: 21, x: '-50%', y: '-50%' }}
              initial={{ left: '12.5%' }}
              animate={{ left: `${12.5 + progress * 75}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 24 }}
            />

            {/* Steps icons & titles */}
            <div className="relative flex items-start justify-between">
              {steps.map((step, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                const IconComponent = step.icon;

                return (
                  <div key={step.title} className="flex flex-1 flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => index < activeStep && setActiveStep(index)}
                      disabled={index > activeStep}
                      aria-current={isActive ? 'step' : undefined}
                      aria-label={`${step.title} step`}
                      className={cn(
                        'group relative z-10 flex size-10 items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F49E8] focus-visible:ring-offset-2',
                        index < activeStep ? 'cursor-pointer' : 'cursor-default'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute inset-0 rounded-full transition-colors duration-300',
                          isCompleted || isActive
                            ? 'bg-[#2F49E8]'
                            : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:bg-slate-200/60'
                        )}
                      />

                      {/* Active pulse ring */}
                      {isActive && !prefersReducedMotion && (
                        <motion.span
                          className="absolute inset-0 rounded-full ring-2 ring-[#2F49E8]/50"
                          initial={{ scale: 1, opacity: 1 }}
                          animate={{
                            scale: [1, 1.45, 1],
                            opacity: [1, 0.2, 1],
                          }}
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            repeatType: 'mirror',
                            ease: 'easeInOut',
                          }}
                        />
                      )}

                      <motion.div
                        className="relative flex items-center justify-center"
                        animate={{ scale: isActive ? 1.1 : 1 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {isCompleted ? (
                            <motion.span
                              key="check"
                              initial={{ scale: 0, rotate: -90, opacity: 0 }}
                              animate={{ scale: 1, rotate: 0, opacity: 1 }}
                              exit={{ scale: 0, rotate: 90, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                              className="flex items-center justify-center text-white"
                            >
                              <Check className="size-4" strokeWidth={3} />
                            </motion.span>
                          ) : (
                            <motion.span
                              key="icon"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                              className="flex items-center justify-center"
                            >
                              <IconComponent
                                className={cn(
                                  'size-4',
                                  isActive
                                    ? 'text-white'
                                    : 'text-slate-400 dark:text-slate-500'
                                )}
                              />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </button>

                    <div className="text-center">
                      <span
                        className={cn(
                          'text-xs font-bold transition-colors duration-300 block',
                          isActive || isCompleted
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-400 dark:text-slate-500'
                        )}
                      >
                        {step.title}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                        {step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className="bg-slate-100 dark:bg-white/10" />

          {/* ── STEP CONTENT AREA ────────────────────────────────────────── */}
          <div className="min-h-[380px]">
            <AnimatePresence mode="wait">
              
              {/* ════════════════════════════════════════════════════════════
                  STEP 1: ROLE SELECTION ("Who are you?")
                 ════════════════════════════════════════════════════════════ */}
              {activeStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2F49E8] dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Step 1 of 4 — Account Type
                    </span>
                    <h2 className="font-clash font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-950 dark:text-white">
                      Who are{' '}
                      <span className="bg-gradient-to-r from-[#2F49E8] via-blue-500 to-[#17A75B] bg-clip-text text-transparent">
                        you?
                      </span>
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                      Choose how you want to operate on Kpugi. You can explore or switch roles anytime later.
                    </p>
                  </div>

                  {/* 2 Big Interactive Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Brand Card */}
                    <div
                      onClick={() => setRole('advertiser')}
                      className={cn(
                        'cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 relative flex flex-col justify-between text-left',
                        role === 'advertiser'
                          ? 'border-[#2F49E8] bg-blue-50/50 dark:bg-blue-950/20 shadow-lg shadow-blue-500/10'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/40 dark:bg-white/[0.02]'
                      )}
                    >
                      {role === 'advertiser' && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#2F49E8] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </div>
                      )}
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#2F49E8] dark:text-blue-400 flex items-center justify-center text-2xl mb-4">
                          📣
                        </div>
                        <span className="text-[10px] font-bold text-[#2F49E8] dark:text-blue-400 uppercase tracking-wider block mb-1">
                          FOR BRANDS &amp; AGENCIES
                        </span>
                        <h3 className="font-clash font-bold text-xl text-slate-950 dark:text-white mb-2">
                          Brand
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                          Launch targeted campaigns. Set your CPM, upload creative, and watch verified views pour in across every platform.
                        </p>
                      </div>

                      {/* Perk pills */}
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
                        {BRAND_PERKS.map((p) => (
                          <span
                            key={p.text}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                          >
                            <span>{p.icon}</span>
                            <span>{p.text}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Creator Card */}
                    <div
                      onClick={() => setRole('creator')}
                      className={cn(
                        'cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 relative flex flex-col justify-between text-left',
                        role === 'creator'
                          ? 'border-[#17A75B] bg-emerald-50/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/40 dark:bg-white/[0.02]'
                      )}
                    >
                      {role === 'creator' && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#17A75B] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </div>
                      )}
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-[#17A75B] dark:text-emerald-400 flex items-center justify-center text-2xl mb-4">
                          🚀
                        </div>
                        <span className="text-[10px] font-bold text-[#17A75B] dark:text-emerald-400 uppercase tracking-wider block mb-1">
                          FOR CREATORS &amp; INFLUENCERS
                        </span>
                        <h3 className="font-clash font-bold text-xl text-slate-950 dark:text-white mb-2">
                          Creator
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                          Post campaign briefs to TikTok, Instagram &amp; X. Earn automated payouts per 1,000 verified views.
                        </p>
                      </div>

                      {/* Perk pills */}
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
                        {CREATOR_PERKS.map((p) => (
                          <span
                            key={p.text}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                          >
                            <span>{p.icon}</span>
                            <span>{p.text}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  STEP 2: PROFILE & IDENTITY
                 ════════════════════════════════════════════════════════════ */}
              {activeStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2F49E8] dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                      Step 2 of 4 — {role === 'creator' ? 'Creator Identity' : 'Brand Identity'}
                    </span>
                    <h2 className="font-clash font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-950 dark:text-white">
                      {role === 'creator' ? 'Set Up Your Creator Profile' : 'Brand & Organization Details'}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                      Your public profile is what {role === 'creator' ? 'brands see when reviewing submissions.' : 'creators see when browsing campaign drops.'}
                    </p>
                  </div>

                  {/* Profile Picture / Logo Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10 border-2 border-[#2F49E8]/30 flex items-center justify-center relative shadow-md">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt="Profile"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <User className="w-8 h-8 text-slate-400" />
                        )}
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#2F49E8] text-white shadow-md hover:bg-blue-700 transition-colors"
                        title="Upload new image"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-center sm:text-left flex-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {role === 'creator' ? 'Profile Picture' : 'Brand Logo'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Upload a PNG, JPG, or WEBP up to 5MB. Pre-filled from your verified sign-up.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-[#2F49E8] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Change Photo</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Form fields based on role */}
                  <div className="space-y-4">
                    {role === 'creator' ? (
                      <>
                        {/* Creator Display Name */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Creator Display Name / Handle <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="e.g. Alex Rivera or @alex_clips"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2F49E8]"
                          />
                        </div>

                        {/* Short Bio */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Creator Bio / Style <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <textarea
                            rows={3}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell brands about your audience, viral video format, or vibe..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2F49E8] resize-none"
                          />
                        </div>

                        {/* Primary Platforms */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                            Where do you post? (Select all that apply)
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {SOCIAL_CHANNELS.map((ch) => {
                              const isSelected = selectedChannels.includes(ch.id);
                              const Icon = ch.icon;
                              return (
                                <button
                                  key={ch.id}
                                  type="button"
                                  onClick={() => toggleChannel(ch.id)}
                                  className={cn(
                                    'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-left',
                                    isSelected
                                      ? 'border-[#2F49E8] bg-blue-50 dark:bg-blue-950/40 text-[#2F49E8] dark:text-blue-300'
                                      : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                  )}
                                >
                                  <Icon className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate flex-1">{ch.label}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#2F49E8]" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Brand Name */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Brand or Company Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Acme Brands or FinStudio"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2F49E8]"
                          />
                        </div>

                        {/* Website URL */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Company Website / Landing Page
                          </label>
                          <input
                            type="url"
                            value={companyWebsite}
                            onChange={(e) => setCompanyWebsite(e.target.value)}
                            placeholder="https://yourbrand.com"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2F49E8]"
                          />
                        </div>

                        {/* Industry */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Industry Category
                          </label>
                          <select
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2F49E8]"
                          >
                            {INDUSTRY_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="bg-white dark:bg-[#0c0f1d]">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  STEP 3: QUESTIONNAIRES & FINANCIALS
                 ════════════════════════════════════════════════════════════ */}
              {activeStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#17A75B] dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                      Step 3 of 4 — {role === 'creator' ? 'Payouts & Niches' : 'Goals & Escrow Protection'}
                    </span>
                    <h2 className="font-clash font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-950 dark:text-white">
                      {role === 'creator' ? 'Direct Bank Settlements' : 'Campaign Objectives & Escrow'}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                      {role === 'creator'
                        ? 'Automated view earnings settle directly to your Nigerian commercial bank account every Friday.'
                        : 'Define your growth targets and activate our automated anti-bot escrow engine.'}
                    </p>
                  </div>

                  {role === 'creator' ? (
                    <div className="space-y-6">
                      {/* Content Niches */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Select Content Niches ({selectedNiches.length})
                          </label>
                          <span className="text-[11px] text-slate-500">Pick at least one</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ALL_NICHES.map((niche) => {
                            const isSelected = selectedNiches.includes(niche);
                            return (
                              <button
                                key={niche}
                                type="button"
                                onClick={() => toggleNiche(niche)}
                                className={cn(
                                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border',
                                  isSelected
                                    ? 'bg-[#2F49E8] text-white border-[#2F49E8] shadow-sm'
                                    : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300'
                                )}
                              >
                                {niche} {isSelected && '✓'}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bank Details Container */}
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-[#17A75B]" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Nigerian Bank Account (NUBAN)
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Bank selector */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Bank Name
                            </label>
                            <div className="relative">
                              <select
                                value={selectedBankCode}
                                onChange={(e) => {
                                  setSelectedBankCode(e.target.value);
                                  if (accountNumber.length === 10) {
                                    handleVerifyBank(accountNumber, e.target.value);
                                  }
                                }}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121626] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F49E8]"
                              >
                                {FALLBACK_NIGERIAN_BANKS.map((b) => (
                                  <option key={b.code} value={b.code} className="bg-white dark:bg-[#0c0f1d]">
                                    {b.name}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute left-3 top-2.5 pointer-events-none">
                                <BankLogo bankCode={selectedBankCode} size="sm" />
                              </div>
                            </div>
                          </div>

                          {/* Account Number */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              10-Digit Account Number
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={10}
                                value={accountNumber}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, '');
                                  setAccountNumber(digits);
                                  if (digits.length === 10) {
                                    handleVerifyBank(digits, selectedBankCode);
                                  } else {
                                    setResolvedAccountName(null);
                                    setBankResolveError(null);
                                  }
                                }}
                                placeholder="0123456789"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121626] text-xs font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#2F49E8]"
                              />
                              {isResolvingBank && (
                                <div className="absolute right-3 top-2.5">
                                  <Loader2 className="w-4 h-4 text-[#2F49E8] animate-spin" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Resolved Status Notification */}
                        {resolvedAccountName && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Verified Account: {resolvedAccountName}</span>
                          </div>
                        )}

                        {bankResolveError && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs font-semibold text-red-700 dark:text-red-300">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <span>{bankResolveError}</span>
                          </div>
                        )}

                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          🛡️ Automated escrow transfers happen every Friday once verified views cross 1,000 threshold. You can also edit bank details in your settings anytime.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Campaign Objectives */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                          Primary Campaign Goal
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {CAMPAIGN_GOALS.map((goal) => {
                            const isSelected = selectedGoal === goal.id;
                            return (
                              <div
                                key={goal.id}
                                onClick={() => setSelectedGoal(goal.id)}
                                className={cn(
                                  'cursor-pointer p-4 rounded-xl border transition-all text-left',
                                  isSelected
                                    ? 'border-[#2F49E8] bg-blue-50/60 dark:bg-blue-950/30'
                                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-slate-300'
                                )}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    {goal.label}
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#2F49E8]" />}
                                </div>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                                  {goal.desc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Budget Tier */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                          Estimated Monthly Advertising Budget
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {BUDGET_TIERS.map((tier) => {
                            const isSelected = selectedBudget === tier.id;
                            return (
                              <button
                                key={tier.id}
                                type="button"
                                onClick={() => setSelectedBudget(tier.id)}
                                className={cn(
                                  'p-3 rounded-xl border text-center transition-all',
                                  isSelected
                                    ? 'border-[#2F49E8] bg-blue-50 dark:bg-blue-950/40 text-[#2F49E8] dark:text-blue-300'
                                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-slate-700 dark:text-slate-400 hover:border-slate-300'
                                )}
                              >
                                <span className="text-xs font-bold block">{tier.label}</span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">{tier.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Escrow Agreement Box */}
                      <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="escrow-agreement"
                          checked={agreedEscrowRules}
                          onChange={(e) => setAgreedEscrowRules(e.target.checked)}
                          className="mt-1 size-4 rounded text-[#2F49E8] focus:ring-[#2F49E8]"
                        />
                        <label htmlFor="escrow-agreement" className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer">
                          <strong className="text-slate-900 dark:text-white">Guaranteed Escrow Protection:</strong> I agree to Kpugi&apos;s verified views policy. Funds allocated to campaigns remain locked in secure escrow and are only disbursed upon cryptographic confirmation of genuine Nigerian post views.
                        </label>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  STEP 4: READY TO LAUNCH!
                 ════════════════════════════════════════════════════════════ */}
              {activeStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#17A75B] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <Rocket className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#17A75B] dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                      🎉 Workspace Ready
                    </span>
                    <h2 className="font-clash font-extrabold text-3xl tracking-tight text-slate-950 dark:text-white">
                      Welcome to Kpugi, {role === 'creator' ? displayName || 'Creator' : companyName || 'Brand'}!
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                      {role === 'creator'
                        ? 'Your creator media kit and payout wallet are live. You can now claim active drops and get paid per 1,000 views.'
                        : 'Your brand workspace is set up. You can fund your budget and launch your first performance-driven brief.'}
                    </p>
                  </div>

                  {/* Profile Summary Card */}
                  <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-left space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10 relative flex-shrink-0">
                        {avatarUrl ? (
                          <Image src={avatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
                        ) : (
                          <User className="w-6 h-6 text-slate-400 m-auto mt-3" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-950 dark:text-white">
                          {role === 'creator' ? displayName : companyName}
                        </h4>
                        <span className="text-xs font-semibold text-[#2F49E8] dark:text-blue-400 capitalize">
                          {role} Account
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-slate-200/80 dark:bg-white/10" />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          {role === 'creator' ? 'Niches' : 'Industry'}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {role === 'creator' ? selectedNiches.slice(0, 2).join(', ') : industry}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          {role === 'creator' ? 'Payout Account' : 'Budget Protection'}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {role === 'creator'
                            ? resolvedAccountName
                              ? `✓ ${resolvedAccountName}`
                              : 'Added to wallet'
                            : '100% Escrow Guard'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── STEP ERROR BANNER ────────────────────────────────────────── */}
          {stepError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{stepError}</span>
            </div>
          )}

          <Separator className="bg-slate-100 dark:bg-white/10" />

          {/* ── STEP ACTION CONTROLS ─────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={activeStep === 0 || isSubmitting}
              className="cursor-pointer gap-1.5 text-xs font-bold rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              Step {activeStep + 1} of {steps.length}
            </span>

            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="cursor-pointer gap-1.5 text-xs font-bold bg-[#2F49E8] hover:bg-blue-700 text-white rounded-xl px-5"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="cursor-pointer gap-2 text-xs font-bold bg-[#17A75B] hover:bg-emerald-600 text-white rounded-xl px-6 shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Workspace</span>
                    <Rocket className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>

        </div>
      </main>

      {/* ─── FOOTER BRANDING ───────────────────────────────────────────────── */}
      <footer className="max-w-3xl mx-auto w-full text-center text-xs text-slate-500 dark:text-slate-400 py-2">
        <p>
          Kpugi &copy; {new Date().getFullYear()} — Nigeria&apos;s Verified Creator &amp; Brand Performance Marketplace.
        </p>
      </footer>
    </div>
  );
}
