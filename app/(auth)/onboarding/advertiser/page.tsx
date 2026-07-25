'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingAdvertiserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    company_name: '',
    company_website: '',
    billing_email: '',
    agreed_global_rules: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      setError('Please enter your company or brand name');
      return;
    }
    if (!formData.billing_email.trim()) {
      setError('Please enter your billing email address');
      return;
    }
    if (!formData.agreed_global_rules) {
      setError('You must agree to the platform rules to create an advertiser account');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete-advertiser',
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete advertiser onboarding');
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Advertiser onboarding error:', err);
      setError(err.message || 'Something went wrong');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-kpugi-paper text-kpugi-ink flex flex-col justify-center py-12 px-6">
      <div className="max-w-xl mx-auto w-full">
        
        {/* Card Container */}
        <div className="bg-white border border-kpugi-border rounded-3xl p-8 sm:p-10 shadow-sm">
          
          <div className="mb-8">
            <span className="inline-block px-3.5 py-1 rounded-full bg-kpugi-blue/10 text-kpugi-blue text-xs font-bold uppercase tracking-wider mb-3">
              STEP 2 OF 2 — BRAND DETAILS
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-kpugi-ink mb-2">
              Setup Your Advertiser Profile
            </h1>
            <p className="text-kpugi-slate text-sm">
              Provide your organization details and agree to platform rules to start creating campaigns.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kpugi-ink mb-2">
                Company / Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Media Ltd or Brand Studio"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-kpugi-border bg-[#FAFAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/30 focus:border-kpugi-blue text-sm transition-all"
                required
              />
            </div>

            {/* Company Website */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kpugi-ink mb-2">
                Company Website <span className="text-kpugi-slate font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://yourbrand.com"
                value={formData.company_website}
                onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-kpugi-border bg-[#FAFAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/30 focus:border-kpugi-blue text-sm transition-all"
              />
            </div>

            {/* Billing Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kpugi-ink mb-2">
                Billing Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="billing@yourbrand.com"
                value={formData.billing_email}
                onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-kpugi-border bg-[#FAFAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/30 focus:border-kpugi-blue text-sm transition-all"
                required
              />
            </div>

            {/* Global Rules Box */}
            <div className="p-4 rounded-2xl bg-kpugi-paper border border-kpugi-border text-xs leading-relaxed text-kpugi-slate space-y-2">
              <span className="font-bold text-kpugi-ink block">Platform Campaign Rules Agreement</span>
              <p>
                By publishing campaigns on Kpugi, you agree that campaign budgets are ring-fenced upfront in escrow. Once a creator's submission meets your verified view floor and duration requirements, payout is automatically released.
              </p>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.agreed_global_rules}
                onChange={(e) => setFormData({ ...formData, agreed_global_rules: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-kpugi-border text-kpugi-blue focus:ring-kpugi-blue"
                required
              />
              <span className="text-xs text-kpugi-ink font-medium">
                I agree to the platform-wide campaign rules and escrow terms.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-kpugi-blue hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20"
            >
              {submitting ? 'Saving Profile...' : 'Complete Setup & Go to Dashboard →'}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}
