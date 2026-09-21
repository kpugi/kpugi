import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/server';
import CampaignsTableManager, { AdminCampaignItem } from '@/components/admin/campaigns/CampaignsTableManager';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  if (resolvedParams?.id) {
    redirect(`/admin/campaigns/${resolvedParams.id}`);
  }

  await requireAdminSession();
  const supabase = createAdminClient();

  // Fetch campaigns joined with advertiser and creatives
  const { data: rawCampaigns, error } = await supabase
    .from('campaigns')
    .select(`
      id,
      campaign_code,
      title,
      description,
      ad_format,
      status,
      cpm_rate,
      total_budget,
      reserved_budget,
      spent_budget,
      is_featured,
      is_hero_pinned,
      created_at,
      advertiser_id,
      advertiser_profiles:advertiser_id (
        company_name,
        billing_email,
        profiles:profiles!advertiser_profiles_profile_id_fkey (
          full_name,
          email,
          avatar_url
        )
      ),
      campaign_creatives (
        file_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[AdminCampaignsPage] Error loading campaigns:', error);
  }

  // Map to clean AdminCampaignItem structures
  const campaigns: AdminCampaignItem[] = (rawCampaigns || []).map((c: any) => {
    const advProfile = Array.isArray(c.advertiser_profiles) ? c.advertiser_profiles[0] : c.advertiser_profiles;
    const baseProfile = advProfile?.profiles
      ? Array.isArray(advProfile.profiles)
        ? advProfile.profiles[0]
        : advProfile.profiles
      : null;
    const creatives = Array.isArray(c.campaign_creatives) ? c.campaign_creatives : [];
    const coverUrl = creatives[0]?.file_url || null;

    return {
      id: c.id,
      campaign_code: c.campaign_code,
      title: c.title,
      description: c.description,
      ad_format: c.ad_format,
      status: c.status,
      cpm_rate: Number(c.cpm_rate || 0),
      total_budget: Number(c.total_budget || 0),
      reserved_budget: Number(c.reserved_budget || 0),
      spent_budget: Number(c.spent_budget || 0),
      is_featured: !!c.is_featured,
      is_hero_pinned: !!c.is_hero_pinned,
      created_at: c.created_at,
      advertiser_id: c.advertiser_id,
      advertiser_name: advProfile?.company_name || baseProfile?.full_name || 'Brand Partner',
      advertiser_email: advProfile?.billing_email || baseProfile?.email || '',
      cover_image_url: coverUrl,
    };
  });

  return <CampaignsTableManager campaigns={campaigns} />;
}
