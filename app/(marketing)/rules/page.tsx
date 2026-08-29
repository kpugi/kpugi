import React from 'react';

export const metadata = {
  title: 'Platform Rules | Kpugi',
  description: 'Global campaign rules and view audit guidelines for creators and advertisers.',
};

export default function RulesPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-slate-900 dark:text-white">
      <h1 className="text-3xl sm:text-4xl font-extrabold font-display mb-6">Platform Rules & Quality Guidelines</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
        Last updated: August 2026
      </p>

      <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Authentic Views Only</h2>
          <p>
            All impressions must originate from genuine organic human viewers. Use of bot farms, view exchange groups, paid view panels, or loop auto-refreshers results in instant audit rejection and account termination.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Content Guidelines</h2>
          <p>
            Submissions must fulfill the exact brief specified in the drop details (e.g. tag @brand, include campaign hashtag, keep video live for 72 hours minimum). Deleting a campaign video early forfeits all earnings for that drop.
          </p>
        </section>
      </div>
    </div>
  );
}
