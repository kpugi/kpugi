import React from 'react';

export const metadata = {
  title: 'Security & Trust | Kpugi',
  description: 'Learn about Kpugi automated security architecture, escrow protection, and anti-fraud view audits.',
};

export default function SecurityPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
        <span>Security & Trust</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight mb-4">
        Bank-Grade Escrow & Automated Fraud Auditing.
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-10">
        Kpugi is built to protect every Naira for both brands and creators.
      </p>

      <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300">
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">100% Escrow Deposit Protection</h3>
          <p>Advertiser funds are locked in automated escrow vaults before campaigns launch. Creators are guaranteed payout upon passing view audits.</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hourly Automated View Audits</h3>
          <p>Our algorithms continuously query official social APIs (TikTok, Graph API, YouTube Data API) to verify organic impression velocity and block bot farms.</p>
        </div>
      </div>
    </div>
  );
}
