'use server';

import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface SubmitReviewInput {
  campaignId: string;
  targetType?: 'campaign_and_brand' | 'platform';
  rating: number;
  sentimentId: 'poor' | 'mediocre' | 'decent' | 'great' | 'legendary';
  tags?: string[];
  comment?: string;
  metricsHighlight?: string;
}

export interface CampaignReviewDisplayItem {
  id: string;
  campaignId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerHandle: string;
  reviewerAvatar: string | null;
  reviewerRole: 'creator' | 'advertiser';
  rating: number;
  sentimentId: 'poor' | 'mediocre' | 'decent' | 'great' | 'legendary';
  tags: string[];
  comment: string | null;
  metricsHighlight: string | null;
  createdAt: string;
}

export interface CampaignReviewsSummary {
  averageRating: number;
  totalReviews: number;
  sentimentCounts: Record<string, number>;
  topTags: { tag: string; count: number }[];
  reviews: CampaignReviewDisplayItem[];
}

export async function submitCampaignReviewAction(input: SubmitReviewInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const supabase = createAdminClient();

    // 1. Get profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('clerk_id', userId)
      .single();

    if (profileErr || !profile) {
      return { success: false, error: 'Profile not found.' };
    }

    // 2. Get campaign details to find advertiser_id
    const { data: campaign, error: campErr } = await supabase
      .from('campaigns')
      .select('id, advertiser_id, title')
      .eq('id', input.campaignId)
      .single();

    if (campErr || !campaign) {
      return { success: false, error: 'Campaign not found.' };
    }

    const reviewerRole = profile.role === 'advertiser' ? 'advertiser' : 'creator';
    const targetType = input.targetType || 'campaign_and_brand';

    // 3. Upsert review
    const { data: review, error: reviewErr } = await supabase
      .from('campaign_reviews')
      .upsert(
        {
          campaign_id: input.campaignId,
          reviewer_profile_id: profile.id,
          reviewer_role: reviewerRole,
          target_type: targetType,
          target_advertiser_id: campaign.advertiser_id,
          sentiment_id: input.sentimentId,
          rating: Math.min(5, Math.max(1, Math.round(input.rating))),
          tags: input.tags || [],
          comment: input.comment?.trim() || null,
          metrics_highlight: input.metricsHighlight?.trim() || null,
          is_public: reviewerRole === 'creator',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'campaign_id,reviewer_profile_id,target_type',
        }
      )
      .select('*')
      .single();

    if (reviewErr) {
      console.error('Error submitting campaign review:', reviewErr);
      return { success: false, error: reviewErr.message };
    }

    revalidatePath(`/c/campaigns/${input.campaignId}`);
    revalidatePath(`/b/campaigns/${input.campaignId}`);
    revalidatePath(`/browse/${input.campaignId}`);
    revalidatePath('/c/campaigns');
    revalidatePath('/b/campaigns');
    revalidatePath('/c/dashboard');
    revalidatePath('/b/dashboard');

    return { success: true, review };
  } catch (error: any) {
    console.error('Exception in submitCampaignReviewAction:', error);
    return { success: false, error: error.message || 'Failed to submit review.' };
  }
}

export async function getCampaignReviewStatusAction(campaignId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { reviewed: false, review: null };
    }

    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return { reviewed: false, review: null };
    }

    const { data: review } = await supabase
      .from('campaign_reviews')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('reviewer_profile_id', profile.id)
      .maybeSingle();

    return {
      reviewed: Boolean(review),
      review: review || null,
    };
  } catch (error) {
    console.error('Error in getCampaignReviewStatusAction:', error);
    return { reviewed: false, review: null };
  }
}

export async function getCampaignReviewsSummaryAction(
  campaignId: string,
  reviewerRole: 'creator' | 'advertiser' | 'all' = 'creator'
): Promise<CampaignReviewsSummary> {
  try {
    const supabase = createAdminClient();

    // 1. Resolve actual campaign ID (in case campaign_code was passed)
    let realCampaignId = campaignId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);

    if (!isUuid) {
      const { data: matchedCamp } = await supabase
        .from('campaigns')
        .select('id')
        .or(`campaign_code.ilike.${campaignId},id.eq.${campaignId}`)
        .maybeSingle();

      if (matchedCamp?.id) {
        realCampaignId = matchedCamp.id;
      }
    }

    // 2. Fetch raw reviews from campaign_reviews table (strictly creator reviews by default)
    let query = supabase
      .from('campaign_reviews')
      .select('*')
      .eq('campaign_id', realCampaignId)
      .eq('is_public', true);

    if (reviewerRole !== 'all') {
      query = query.eq('reviewer_role', reviewerRole);
    }

    const { data: rawReviews, error } = await query.order('created_at', { ascending: false });

    if (error || !rawReviews || rawReviews.length === 0) {
      if (error) console.error('Error fetching campaign reviews:', error);
      return {
        averageRating: 5.0,
        totalReviews: 0,
        sentimentCounts: {},
        topTags: [],
        reviews: [],
      };
    }

    // 3. Fetch reviewer profiles & creator profiles in parallel
    const reviewerIds = Array.from(new Set(rawReviews.map((r: any) => r.reviewer_profile_id).filter(Boolean)));

    const [profilesRes, creatorProfilesRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, avatar_url').in('id', reviewerIds),
      supabase.from('creator_profiles').select('profile_id, display_name, avatar_url').in('profile_id', reviewerIds),
    ]);

    const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
    const creatorMap = new Map((creatorProfilesRes.data || []).map((cp: any) => [cp.profile_id, cp]));

    const sentimentCounts: Record<string, number> = {
      poor: 0,
      mediocre: 0,
      decent: 0,
      great: 0,
      legendary: 0,
    };
    const tagCountMap: Record<string, number> = {};
    let totalScore = 0;

    const reviews: CampaignReviewDisplayItem[] = rawReviews.map((r: any) => {
      const p = profileMap.get(r.reviewer_profile_id);
      const cp = creatorMap.get(r.reviewer_profile_id);

      const rawName = cp?.display_name || p?.full_name || (r.reviewer_role === 'advertiser' ? 'Brand Partner' : 'Verified Creator');
      const reviewerName = rawName.startsWith('@') ? rawName.slice(1) : rawName;
      const reviewerHandle = `@${reviewerName.toLowerCase().replace(/\s+/g, '')}`;
      const reviewerAvatar = cp?.avatar_url || p?.avatar_url || null;

      const rating = Number(r.rating || 5);
      totalScore += rating;

      if (r.sentiment_id && sentimentCounts[r.sentiment_id] !== undefined) {
        sentimentCounts[r.sentiment_id] += 1;
      }

      if (Array.isArray(r.tags)) {
        r.tags.forEach((tag: string) => {
          tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
        });
      }

      return {
        id: r.id,
        campaignId: r.campaign_id,
        reviewerId: r.reviewer_profile_id,
        reviewerName,
        reviewerHandle,
        reviewerAvatar,
        reviewerRole: r.reviewer_role as 'creator' | 'advertiser',
        rating,
        sentimentId: r.sentiment_id || 'great',
        tags: Array.isArray(r.tags) ? r.tags : [],
        comment: r.comment || null,
        metricsHighlight: r.metrics_highlight || null,
        createdAt: r.created_at || r.updated_at || new Date().toISOString(),
      };
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(1)) : 5.0;

    const topTags = Object.entries(tagCountMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      averageRating,
      totalReviews,
      sentimentCounts,
      topTags,
      reviews,
    };
  } catch (err) {
    console.error('Exception in getCampaignReviewsSummaryAction:', err);
    return {
      averageRating: 5.0,
      totalReviews: 0,
      sentimentCounts: {},
      topTags: [],
      reviews: [],
    };
  }
}
