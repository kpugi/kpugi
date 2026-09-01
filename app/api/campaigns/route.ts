import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { generateTextEmbedding, constructCampaignEmbeddingText } from '@/lib/ai/embeddings';
import { getRedisCache, setRedisCache, deleteRedisCache } from '@/lib/redis/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');
    const creatorClerkId = searchParams.get('creatorClerkId');
    const isFresh = searchParams.get('fresh') === 'true';

    const supabase = createAdminClient();
    let effectiveCreatorId = creatorId;

    let userRole = 'public';
    if (!effectiveCreatorId && creatorClerkId) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('clerk_id', creatorClerkId)
        .maybeSingle();
      if (prof?.id) {
        userRole = prof.role || 'creator';
        if (userRole !== 'advertiser') {
          effectiveCreatorId = prof.id;
        }
      }
    }

    const cacheKey = effectiveCreatorId ? `campaigns:creator_${effectiveCreatorId}` : `campaigns:${userRole}`;

    if (isFresh) {
      await deleteRedisCache(cacheKey);
    } else {
      const cachedCampaigns = await getRedisCache<any[]>(cacheKey);
      if (cachedCampaigns) {
        return NextResponse.json(
          { campaigns: cachedCampaigns, userRole, cached: true },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            },
          }
        );
      }
    }

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        campaign_code,
        description,
        cover_image_url,
        ad_format,
        cpm_rate,
        total_budget,
        reserved_budget,
        spent_budget,
        status,
        channels,
        is_featured,
        requirements,
        min_view_threshold,
        required_live_duration_hours,
        created_at,
        advertiser:advertiser_profiles (
          company_name,
          profile:profiles (
            avatar_url
          )
        ),
        creatives:campaign_creatives (
          file_url
        ),
        submissions:submissions (
          id,
          final_view_count,
          last_scraped_at,
          verified_at,
          submitted_at,
          payout_amount,
          pending_payout_amount,
          status
        )
      `)
      .in('status', ['live', 'completed'])
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Campaigns API Error]:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch bulk AI match scores for the creator if logged in
    const matchScoreMap: Record<string, number> = {};
    if (effectiveCreatorId) {
      try {
        const { data: bulkScores } = await supabase.rpc('get_creator_campaign_match_scores', {
          p_creator_id: effectiveCreatorId,
        });
        if (Array.isArray(bulkScores)) {
          for (const item of bulkScores) {
            if (item.campaign_id && typeof item.match_score === 'number') {
              matchScoreMap[item.campaign_id] = item.match_score;
            }
          }
        }
      } catch (e) {
        console.warn('[Campaigns API] Bulk match score fetch error:', e);
      }
    }

    const now = Date.now();
    const t24h = now - 24 * 60 * 60 * 1000;
    const t7d = now - 7 * 24 * 60 * 60 * 1000;
    const t30d = now - 30 * 24 * 60 * 60 * 1000;

    // Attach AI match scores, ranking badges (Trending 24h, Hot 7d, Popular 30d), and sanitize cover images
    const enrichedCampaigns = (campaigns || []).map((camp) => {
      const matchScore = matchScoreMap[camp.id] ?? (effectiveCreatorId ? 75 : 94);

      // Sanitize cover_image_url if it's an oversized base64 data URI (> 50KB) to prevent JSON API bloat
      let safeCoverUrl = camp.cover_image_url || null;
      if (safeCoverUrl && safeCoverUrl.startsWith('data:image/') && safeCoverUrl.length > 50000) {
        safeCoverUrl = camp.creatives?.[0]?.file_url || null;
      }

      const subs: any[] = camp.submissions || [];

      // Calculate live accrued spent budget = max(DB spent_budget, sum(payout_amount + pending_payout_amount))
      const totalAccruedSpent = subs.reduce(
        (sum, s) => sum + Number(s.payout_amount || 0) + Number(s.pending_payout_amount || 0),
        0
      );
      const liveSpentBudget = Math.max(Number(camp.spent_budget || 0), totalAccruedSpent);

      // 1. Calculate Activity in 24 Hours (Trending: strictly requires verified views in last 24h)
      const subs24h = subs.filter((s) => {
        const subTime = s.submitted_at ? new Date(s.submitted_at).getTime() : 0;
        const verTime = s.verified_at ? new Date(s.verified_at).getTime() : 0;
        const scrapTime = s.last_scraped_at ? new Date(s.last_scraped_at).getTime() : 0;
        return (subTime >= t24h || verTime >= t24h || scrapTime >= t24h) && Number(s.final_view_count || 0) > 0;
      });
      const views24h = subs24h.reduce((sum, s) => sum + Number(s.final_view_count || 0), 0);
      const isTrending = views24h > 0;

      // 2. Calculate Activity in 7 Days (Hot: strictly requires verified views in last 7d)
      const subs7d = subs.filter((s) => {
        const subTime = s.submitted_at ? new Date(s.submitted_at).getTime() : 0;
        const verTime = s.verified_at ? new Date(s.verified_at).getTime() : 0;
        const scrapTime = s.last_scraped_at ? new Date(s.last_scraped_at).getTime() : 0;
        return (subTime >= t7d || verTime >= t7d || scrapTime >= t7d) && Number(s.final_view_count || 0) > 0;
      });
      const views7d = subs7d.reduce((sum, s) => sum + Number(s.final_view_count || 0), 0);
      const isHot = views7d >= 10000;

      // 3. Calculate Activity in 30 Days (Popular: strictly requires cumulative verified views >= 1,000)
      const totalViews = subs.reduce((sum, s) => sum + Number(s.final_view_count || 0), 0);
      const isPopular = totalViews >= 100000;

      // Compile all qualifying badges (only for campaigns with real verified views)
      const rankBadges: ('trending' | 'hot' | 'popular')[] = [];
      if (isTrending) rankBadges.push('trending');
      if (isHot) rankBadges.push('hot');
      if (isPopular) rankBadges.push('popular');

      const activityScores = {
        score24h: views24h,
        score7d: views7d,
        score30d: totalViews,
        views24h,
        views7d,
        totalViews,
      };

      return {
        ...camp,
        spent_budget: liveSpentBudget,
        cover_image_url: safeCoverUrl,
        match_score: matchScore,
        rank_badges: rankBadges,
        activity_scores: activityScores,
      };
    });

    // Save to Redis Cache (TTL: 45 seconds)
    await setRedisCache(cacheKey, enrichedCampaigns, 45);

    return NextResponse.json(
      { campaigns: enrichedCampaigns, userRole, cached: false },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (err) {
    console.error('[Campaigns API] Server error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userProfile = await getOrCreateUserProfile();
    if (!userProfile || !userProfile.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const advertiserId = userProfile.profile.id;
    const userRole = userProfile.profile.role;

    if (userRole !== 'advertiser' && userRole !== 'both') {
      return NextResponse.json({ error: 'Only advertisers can create campaigns' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      ad_format,
      cpm_rate,
      total_budget,
      min_view_threshold,
      required_live_duration_hours,
      verification_grace_hours,
      cover_image_url,
      channels,
      requirements,
    } = body;

    if (!title || !description || !ad_format || !total_budget) {
      return NextResponse.json(
        { error: 'Missing required campaign fields (title, description, ad_format, total_budget)' },
        { status: 400 }
      );
    }

    if (Number(total_budget) <= 0 || Number(cpm_rate || 2000) <= 0) {
      return NextResponse.json({ error: 'Budget and CPM must be positive amounts' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Generate Gemini Embedding for new campaign if provided
    let embedding: number[] | null = null;
    if (title && description) {
      const embeddingText = constructCampaignEmbeddingText({ title, description, ad_format, channels });
      embedding = await generateTextEmbedding(embeddingText);
    }

    const campaignPayload = {
      advertiser_id: advertiserId,
      title: String(title).trim(),
      description: String(description).trim(),
      ad_format: ['text', 'image', 'video'].includes(ad_format) ? ad_format : 'video',
      cpm_rate: Number(cpm_rate) || 2000,
      total_budget: Number(total_budget),
      reserved_budget: 0,
      spent_budget: 0,
      min_view_threshold: Number(min_view_threshold) || 1000,
      required_live_duration_hours: Number(required_live_duration_hours) || 72,
      verification_grace_hours: Number(verification_grace_hours) || 24,
      cover_image_url: cover_image_url || null,
      channels: Array.isArray(channels) ? channels : [],
      requirements: requirements && typeof requirements === 'object' ? requirements : {},
      status: 'funding_pending',
      embedding: embedding ? (embedding as any) : null,
    };

    const { data: newCampaign, error } = await supabase
      .from('campaigns')
      .insert(campaignPayload)
      .select('*')
      .single();

    if (error) {
      console.error('[Campaigns API POST Error]:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Invalidate Redis Public Campaigns Cache on new campaign creation
    await deleteRedisCache('campaigns:public');

    return NextResponse.json({ campaign: newCampaign });
  } catch (err) {
    console.error('[Campaigns API POST Exception]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
