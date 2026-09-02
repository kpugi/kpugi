'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Rocket,
  Compass,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  role: 'creator' | 'advertiser';
  displayName?: string;
}

export default function OnboardingWelcomeModal({
  isOpen,
  onClose,
  onStartTour,
  role,
  displayName = 'there',
}: OnboardingWelcomeModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#2F49E8', '#17A75B', '#7B96FF', '#F59E0B'],
        });
      } catch {}
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const isCreator = role === 'creator';

  const perks = isCreator
    ? [
        {
          icon: Zap,
          title: 'Live Hourly View Updates',
          desc: 'Watch your real view counts climb every 60 minutes and turn into earnings.',
          color: 'text-amber-500 bg-amber-500/10',
        },
        {
          icon: CreditCard,
          title: 'Guaranteed Friday Bank Deposits',
          desc: 'Brand payments are guaranteed upfront. Receive direct bank alerts every Friday.',
          color: 'text-emerald-500 bg-emerald-500/10',
        },
        {
          icon: TrendingUp,
          title: 'Direct Brand Collaborations',
          desc: 'Get paid per view or fixed rates on Instagram, TikTok, Facebook & X.',
          color: 'text-blue-500 bg-blue-500/10',
        },
      ]
    : [
        {
          icon: ShieldCheck,
          title: '100% Protected Ad Budget',
          desc: 'Your budget is completely safe and only paid out when creators deliver verified views.',
          color: 'text-emerald-500 bg-emerald-500/10',
        },
        {
          icon: Zap,
          title: 'Quick Campaign Launch',
          desc: 'Publish briefs in 2 minutes and connect with top verified Nigerian creators.',
          color: 'text-blue-500 bg-blue-500/10',
        },
        {
          icon: TrendingUp,
          title: 'Live Performance & Growth Tracking',
          desc: 'Watch real-time audience reach, creator post submissions, and verified engagement.',
          color: 'text-purple-500 bg-purple-500/10',
        },
      ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-kpugi-blue dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Welcome to Kpugi</span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl text-kpugi-ink dark:text-white tracking-tight">
              Ready to win, {displayName}? 🎉
            </h2>

            <p className="text-xs sm:text-sm text-kpugi-slate dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              {isCreator
                ? 'Your creator dashboard is all set up. Let us show you around in 60 seconds so you can land your first paid campaign.'
                : 'Your brand workspace is ready. Let us give you a 60-second walkthrough to help you launch high-ROI creator campaigns.'}
            </p>
          </div>

          {/* Key Value Cards */}
          <div className="space-y-3 mb-8">
            {perks.map((perk, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-left transition-all hover:border-kpugi-blue/30"
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${perk.color}`}>
                  <perk.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs sm:text-sm text-kpugi-ink dark:text-white">
                    {perk.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-kpugi-slate dark:text-slate-400 leading-normal mt-0.5">
                    {perk.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                onStartTour();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-sans font-semibold text-sm text-white bg-kpugi-blue hover:bg-blue-700 shadow-sm transition-all"
            >
              <Rocket className="w-4 h-4" />
              <span>Take 60-Second Interactive Tour</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl font-sans font-semibold text-xs text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Skip, I'll explore on my own
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
