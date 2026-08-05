import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Kpugi Creator Platform',
  description: 'Kpugi Privacy Policy detailing data collection, OAuth social connection usage, and data protection practices.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-slate-800 font-sans leading-relaxed">
      <div className="border-b border-slate-200 pb-8 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mt-2">Last Updated: August 3, 2026</p>
      </div>

      <div className="space-y-8 text-sm sm:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            When you register on Kpugi, connect social media accounts (Instagram, TikTok, Twitter/X), or submit content campaigns, we collect:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
            <li>Account Information: Full name, email address, profile handle.</li>
            <li>Connected Social Account Data: Public handles, follower counts, engagement stats, and OAuth access tokens required to verify campaign video submissions.</li>
            <li>Payment & Financial Info: Bank account numbers (NUBAN) via Paystack for creator earnings payouts.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">2. How We Use Your Data</h2>
          <p>We use collected data solely to:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
            <li>Verify campaign post submissions and public view metrics via API scrapers and Graph API endpoints.</li>
            <li>Calculate CPM payout earnings and transfer funds to creator wallets.</li>
            <li>Enforce platform global rules, anti-fraud measures, and Didit identity verification.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">3. Social Account Permissions & OAuth</h2>
          <p>
            When connecting Instagram or TikTok via OAuth 2.0, Kpugi requests read-only scopes (`user_profile`, `user_media`). We never post on your behalf or modify your social media settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">4. User Data Deletion & Account Disconnection</h2>
          <p>
            You have full control over your data. You can disconnect your social media accounts anytime from the <Link href="/accounts" className="text-blue-600 font-bold hover:underline">Accounts Settings</Link> page or request complete account deletion by following our <Link href="/delete" className="text-blue-600 font-bold hover:underline">Data Deletion Request Guide</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">5. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy, contact us at <a href="mailto:use.kpugi@gmail.com" className="text-blue-600 font-bold hover:underline">use.kpugi@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
