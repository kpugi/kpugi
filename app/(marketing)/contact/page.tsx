import React from 'react';

export const metadata = {
  title: 'Contact Us | Kpugi Performance Ad Network',
  description: 'Get in touch with the Kpugi team for brand partnerships, creator support, or press inquiries.',
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
        <span>Contact Us</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight mb-4">
        Holla at us anytime ⚡
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-10">
        Have a question about brand campaigns, view verification, or creator payouts? We respond within 2 hours.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4">
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">Brand Support & Sales</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Need help planning a ₦5M+ custom CPM drop or institutional campaign?</p>
          <a href="mailto:brands@kpugi.com" className="inline-block font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline">
            brands@kpugi.com →
          </a>
        </div>

        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4">
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">Creator Support</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Questions about post audits, Paystack cashouts, or account levels?</p>
          <a href="mailto:creators@kpugi.com" className="inline-block font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            creators@kpugi.com →
          </a>
        </div>
      </div>
    </div>
  );
}
