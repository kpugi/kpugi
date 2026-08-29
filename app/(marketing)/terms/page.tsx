import React from 'react';

export const metadata = {
  title: 'Terms of Service | Kpugi',
  description: 'Terms of service and platform agreements for advertisers and creators on Kpugi.',
};

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-slate-900 dark:text-white">
      <h1 className="text-3xl sm:text-4xl font-extrabold font-display mb-6">Terms of Service</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
        Last updated: August 2026
      </p>

      <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Platform Agreement</h2>
          <p>
            By accessing or using Kpugi, whether as a Brand (Advertiser) or Creator, you agree to be bound by these terms. Kpugi operates strictly as an automated performance advertising marketplace.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Creator Audits & Payouts</h2>
          <p>
            Creators receive payouts exclusively for verified organic view impressions audited by Kpugi automated security algorithms. Any artificial, bot, or inorganic view manipulation is subject to immediate campaign forfeiture and permanent account disqualification.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Brand Escrow & Refunds</h2>
          <p>
            Campaign deposits placed by Advertisers are held in automated escrow. Funds are released to creators only upon verified 1k view milestones. Unused campaign funds can be returned to advertiser balances.
          </p>
        </section>
      </div>
    </div>
  );
}
