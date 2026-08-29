import React from 'react';

export const metadata = {
  title: 'Escrow & Payment Terms | Kpugi',
  description: 'Payment terms, automated escrow settlement, and Paystack bank withdrawal policies on Kpugi.',
};

export default function PaymentTermsPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-slate-900 dark:text-white">
      <h1 className="text-3xl sm:text-4xl font-extrabold font-display mb-6">Escrow & Payment Terms</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
        Last updated: August 2026
      </p>

      <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Campaign Deposit Escrow</h2>
          <p>
            When an Advertiser launches a campaign, funds equal to the total campaign budget are held in automated escrow. Funds are disbursed to creators incrementing per 1,000 verified views.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Creator Earnings & Paystack Withdrawals</h2>
          <p>
            Creator earnings are deposited into their Kpugi Wallet immediately upon audit clearance. Instant payouts to verified Nigerian bank accounts (NUBAN) are processed via Paystack.
          </p>
        </section>
      </div>
    </div>
  );
}
