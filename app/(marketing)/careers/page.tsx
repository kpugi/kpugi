import React from 'react';

export const metadata = {
  title: 'Careers | Join Kpugi',
  description: 'Help us build the future of creator monetization in Africa. Explore open positions at Kpugi.',
};

export default function CareersPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-6">
        <span>Careers at Kpugi</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight mb-4">
        Build the Infrastructure for Creator Commerce.
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-10">
        We’re engineering high-throughput audit pipelines, automated fraud detection, and instant payment settlement for millions of creators across Africa.
      </p>

      <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-center space-y-4">
        <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">No Open Positions Right Now</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          We operate lean, but we’re always looking for exceptional engineers and growth leads. Send your GitHub or portfolio to <span className="text-blue-600 dark:text-blue-400 font-mono">careers@kpugi.com</span>.
        </p>
      </div>
    </div>
  );
}
