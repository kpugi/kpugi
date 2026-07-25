'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingRolePage() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<'advertiser' | 'creator' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRole = async (role: 'advertiser' | 'creator') => {
    try {
      setLoadingRole(role);
      setError(null);

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-role', role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to set role');
      }

      router.push(`/onboarding/${role}`);
    } catch (err: any) {
      console.error('Role selection error:', err);
      setError(err.message || 'Something went wrong');
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-kpugi-paper text-kpugi-ink flex flex-col justify-center py-12 px-6">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-3.5 py-1 rounded-full bg-kpugi-blue/10 text-kpugi-blue text-xs font-bold uppercase tracking-wider mb-3">
            STEP 1 OF 2 — ACCOUNT TYPE
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight mb-3 text-kpugi-ink">
            How do you plan to use Kpugi?
          </h1>
          <p className="text-kpugi-slate text-base sm:text-lg max-w-xl mx-auto">
            Choose your primary account role. You can always update or expand your account profile later.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Advertiser */}
          <div 
            onClick={() => !loadingRole && handleSelectRole('advertiser')}
            className={`p-8 rounded-3xl bg-white border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 ${
              loadingRole === 'advertiser' ? 'border-kpugi-blue ring-2 ring-kpugi-blue/20 opacity-80' : 'border-kpugi-border hover:border-kpugi-blue'
            }`}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-kpugi-blue/10 text-kpugi-blue flex items-center justify-center font-bold text-xl mb-6">
                📣
              </div>
              <span className="text-xs font-bold text-kpugi-blue uppercase tracking-wider block mb-1">FOR BRANDS & AGENCIES</span>
              <h2 className="font-display font-bold text-2xl mb-2 text-kpugi-ink">Advertiser</h2>
              <p className="text-kpugi-slate text-sm leading-relaxed mb-6">
                Launch targeted social campaigns. Upload ready-made video/image creative, set your CPM budget, and get verified views.
              </p>
            </div>

            <button
              disabled={loadingRole !== null}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-kpugi-ink text-white hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              {loadingRole === 'advertiser' ? 'Setting Role...' : 'Continue as Advertiser →'}
            </button>
          </div>

          {/* Card 2: Creator */}
          <div 
            onClick={() => !loadingRole && handleSelectRole('creator')}
            className={`p-8 rounded-3xl bg-white border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 ${
              loadingRole === 'creator' ? 'border-emerald-500 ring-2 ring-emerald-500/20 opacity-80' : 'border-kpugi-border hover:border-emerald-500'
            }`}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl mb-6">
                🚀
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">FOR CREATORS & INFLUENCERS</span>
              <h2 className="font-display font-bold text-2xl mb-2 text-kpugi-ink">Creator</h2>
              <p className="text-kpugi-slate text-sm leading-relaxed mb-6">
                Post ready-made campaign briefs to your TikTok, Instagram, or X profiles and earn automated payouts per 1,000 views.
              </p>
            </div>

            <button
              disabled={loadingRole !== null}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              {loadingRole === 'creator' ? 'Setting Role...' : 'Continue as Creator →'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
