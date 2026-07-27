import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';
import { CampaignForm } from '@/components/campaign/CampaignForm';

export default async function NewCampaignPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (userProfile.role !== 'advertiser' && !userProfile.advertiserProfile) {
    redirect('/dashboard');
  }

  return (
    <DashboardLayoutShell role="advertiser" title="Create Campaign">
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        <div className="border-b border-kpugi-border pb-4">
          <h1 className="font-display text-2xl font-bold text-kpugi-ink">Launch New Campaign</h1>
          <p className="font-sans text-xs text-kpugi-slate mt-1">Set campaign budget, view payout rate, and deliverables for creators.</p>
        </div>
        <div className="p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm">
          <CampaignForm />
        </div>
      </div>
    </DashboardLayoutShell>
  );
}
