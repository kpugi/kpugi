import React from 'react';

export const metadata = {
  title: 'Cookie Policy | Kpugi',
  description: 'How Kpugi uses cookies and browser storage for session authentication and analytics.',
};

export default function CookiesPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-slate-900 dark:text-white">
      <h1 className="text-3xl sm:text-4xl font-extrabold font-display mb-6">Cookie Policy</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
        Last updated: August 2026
      </p>

      <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Essential Cookies</h2>
          <p>
            Kpugi uses essential cookies to keep you signed in securely via Clerk Auth and to preserve theme preferences (Light vs Dark mode).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Analytics & Performance</h2>
          <p>
            We use anonymized telemetry cookies to measure marketplace page performance and load times. We never sell or share cookie data with third parties.
          </p>
        </section>
      </div>
    </div>
  );
}
