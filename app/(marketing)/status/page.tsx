import React from 'react';

export const metadata = {
  title: 'Platform Status | Kpugi Systems',
  description: 'Live operational status of Kpugi audit engines, Paystack payout gateways, and API scrapers.',
};

export default function StatusPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>All Systems Operational</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight mb-4">
        Kpugi Platform Status
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-10">
        Real-time monitoring for Kpugi view audit engines, webhooks, and payout infrastructure.
      </p>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-between">
          <span className="font-bold text-sm">Automated View Audit Scraper Engine</span>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">Operational</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-between">
          <span className="font-bold text-sm">Paystack NUBAN Payout Gateway</span>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">Operational</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-between">
          <span className="font-bold text-sm">Social OAuth Authentication Services</span>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">Operational</span>
        </div>
      </div>
    </div>
  );
}
