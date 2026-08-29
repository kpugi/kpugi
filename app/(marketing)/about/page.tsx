import React from 'react';

export const metadata = {
  title: 'About Us | Kpugi Performance Ad Network',
  description: 'Learn about Kpugi — Nigeria’s automated performance ad network connecting advertisers with verified creators.',
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
        <span>About Kpugi</span>
      </div>
      <h1 className="text-4xl sm:text-6xl font-extrabold font-display leading-tight mb-6">
        Connecting Brands & Creators with Automated Precision.
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl leading-relaxed max-w-3xl mb-12">
        Kpugi is Nigeria’s premiere automated creator ad network. We eliminate manual gatekeeping, transparently track verified views, and deliver instant payouts to creators.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-white/10">
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
          <h3 className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-2">₦48.5M+</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Paid to Creators</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
          <h3 className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2">12.4K+</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Verified Creators</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
          <h3 className="text-3xl font-mono font-bold text-purple-600 dark:text-purple-400 mb-2">100%</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Escrow Protected</p>
        </div>
      </div>
    </div>
  );
}
