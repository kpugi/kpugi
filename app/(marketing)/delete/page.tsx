import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'User Data Deletion Instructions | Kpugi Creator Platform',
  description: 'Step-by-step instructions on how users can delete their data and disconnect social media accounts from Kpugi.',
};

export default function UserDataDeletionPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-slate-800 font-sans leading-relaxed">
      <div className="border-b border-slate-200 pb-6 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Data Deletion Instructions</h1>
        <p className="text-sm text-slate-500 mt-2">Compliance with Meta Platform & General Data Deletion Requirements</p>
      </div>

      <div className="space-y-6 text-sm sm:text-base">
        <p>
          At Kpugi, we respect your data privacy. According to Meta&apos;s Platform rules, users have the right to request deletion of their personal data and revoke OAuth authorization.
        </p>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Option 1: Disconnect via Kpugi Dashboard (Instant)</h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>Log in to your Kpugi account and go to <Link href="/accounts" className="text-blue-600 font-bold hover:underline">Social Accounts (/accounts)</Link>.</li>
            <li>Find your connected Instagram or TikTok card.</li>
            <li>Click <strong>Disconnect / Revoke Account</strong>.</li>
            <li>All stored OAuth access tokens, cached follower metrics, and profile linkages will be permanently removed from our database immediately.</li>
          </ol>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Option 2: Revoke via Facebook/Instagram App Settings</h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>Log into your Facebook or Instagram account.</li>
            <li>Go to <strong>Settings & Privacy</strong> &rarr; <strong>Apps and Websites</strong>.</li>
            <li>Find <strong>Kpugi Platform</strong> in the active apps list.</li>
            <li>Click <strong>Remove</strong> to revoke all access permissions.</li>
          </ol>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Option 3: Manual Deletion Request via Email</h2>
          <p className="text-slate-700">
            If you wish to delete your entire Kpugi user profile, campaign submission history, and associated data, please send an email to:
          </p>
          <p className="font-mono font-bold text-blue-600">use.kpugi@gmail.com</p>
          <p className="text-xs text-slate-500">
            Subject: <strong>Data Deletion Request - [Your Username]</strong>. Requests are processed within 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
