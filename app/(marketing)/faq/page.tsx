import React from 'react';

export const metadata = {
  title: 'Help & FAQ | Kpugi Support',
  description: 'Frequently asked questions for advertisers and creators on Kpugi.',
};

export default function FAQPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
        <span>Help Center</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight mb-4">
        Frequently Asked Questions
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-10">
        Everything you need to know about launching drops, submitting posts, and withdrawing earnings.
      </p>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">How does Kpugi verify video views?</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Our automated scrapers query official APIs hourly. Only organic human view increments are calculated into creator CPM earnings.</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">What is the minimum view requirement?</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Kpugi has zero minimum follower requirements! Payouts begin unlocking once a post achieves its first 1,000 verified views.</p>
        </div>
      </div>
    </div>
  );
}
