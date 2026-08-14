import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { getBrandSettingsData } from '@/lib/supabase/advertiser';
import AdvertiserSettingsView from '@/components/advertiser/AdvertiserSettingsView';

export const dynamic = 'force-dynamic';

export default async function BrandSettingsPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const brandData = await getBrandSettingsData(userProfile.profile.id);

  if (!brandData) {
    // Fallback in case brand record is initializing
    const fallbackData = {
      profile: {
        id: userProfile.profile.id,
        clerkId: userProfile.profile.clerk_id || '',
        fullName: userProfile.profile.full_name || 'Brand Partner',
        email: userProfile.profile.email || '',
        avatarUrl: userProfile.profile.avatar_url || null,
        phone: userProfile.profile.phone || null,
        createdAt: userProfile.profile.created_at || new Date().toISOString(),
      },
      advertiser: {
        companyName: userProfile.advertiserProfile?.company_name || userProfile.profile.full_name || 'Brand Partner',
        companyWebsite: userProfile.advertiserProfile?.company_website || null,
        billingEmail: userProfile.advertiserProfile?.billing_email || userProfile.profile.email || null,
        industry: 'E-commerce & Retail',
        tagline: null,
        location: 'Nigeria',
        companyLogoUrl: userProfile.profile.avatar_url || null,
        taxId: null,
        lowBalanceAlertEnabled: true,
        lowBalanceAlertThreshold: 50000,
        socialLinks: {},
        campaignDefaults: {
          defaultGraceHours: 48,
          defaultLiveHours: 24,
          preferKycCreators: false,
          autoPauseThresholdPct: 95,
        },
        notificationPreferences: {
          emailMilestones: true,
          emailSubmissions: true,
          emailWallet: true,
          weeklyDigest: true,
        },
        agreedGlobalRulesAt: userProfile.advertiserProfile?.agreed_global_rules_at || null,
      },
      wallet: {
        balance: 0,
        escrowLocked: 0,
      },
      stats: {
        totalCampaigns: 0,
        totalSpent: 0,
        isVerifiedPartner: false,
      },
    };

    return <AdvertiserSettingsView initialData={fallbackData} />;
  }

  return <AdvertiserSettingsView initialData={brandData} />;
}
