'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OnboardingCreatorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete-creator',
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete creator onboarding');
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Creator onboarding error:', err);
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
            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-3">
              STEP 2 OF 2 — CREATOR PROFILE
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-kpugi-ink mb-2">
              Setup Your Creator Profile
            </h1>
            <p className="text-kpugi-slate text-sm">
              Setup your public creator profile and prepare to link your social accounts.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kpugi-ink mb-2">
                Creator Display Name <span className="text-kpugi-slate font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Media or @alex_posts"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-kpugi-border bg-[#FAFAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm transition-all"
              />
            </div>

            {/* Short Bio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kpugi-ink mb-2">
                Short Bio <span className="text-kpugi-slate font-normal">(Optional)</span>
              </label>
              <textarea
                placeholder="Tell brands what content you create (tech, lifestyle, comedy, finance)..."
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-kpugi-border bg-[#FAFAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm transition-all resize-none"
              />
            </div>

            {/* Social Account Connection Section */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-kpugi-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-kpugi-ink">
                  Connect Social Accounts
                </span>
                <span className="text-xs text-emerald-600 font-bold">Recommended</span>
              </div>
              <p className="text-xs text-kpugi-slate leading-relaxed">
                Linking your accounts allows automated view verification when you submit post links. You can also connect or manage accounts anytime from your dashboard settings.
              </p>

              {/* Account Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {['Instagram', 'TikTok', 'X (Twitter)', 'YouTube', 'Facebook'].map((platform) => (
                  <span
                    key={platform}
                    className="px-3 py-1.5 rounded-lg bg-white border border-kpugi-border text-xs font-medium text-kpugi-ink flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
              >
                {submitting ? 'Saving Profile...' : 'Complete Creator Setup →'}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
