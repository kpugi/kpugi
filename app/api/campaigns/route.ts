import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
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
          id
        )
      `)
      .eq('status', 'live')
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

    // Attach AI match scores and sanitize oversized base64 cover images
    const enrichedCampaigns = (campaigns || []).map((camp) => {
      const matchScore = matchScoreMap[camp.id] ?? (effectiveCreatorId ? 75 : 94);

      // Sanitize cover_image_url if it's an oversized base64 data URI (> 50KB) to prevent JSON API bloat
      let safeCoverUrl = camp.cover_image_url || null;
      if (safeCoverUrl && safeCoverUrl.startsWith('data:image/') && safeCoverUrl.length > 50000) {
        safeCoverUrl = camp.creatives?.[0]?.file_url || null;
      }

      return {
        ...camp,
        cover_image_url: safeCoverUrl,
        match_score: matchScore,
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
    const supabase = createAdminClient();
    const body = await request.json();

    const { title, description, channels, ad_format } = body;

    // Generate Gemini Embedding for new campaign if provided
    let embedding: number[] | null = null;
    if (title && description) {
      const embeddingText = constructCampaignEmbeddingText({ title, description, ad_format, channels });
      embedding = await generateTextEmbedding(embeddingText);
    }

    const { data: newCampaign, error } = await supabase
      .from('campaigns')
      .insert({
        ...body,
        embedding: embedding ? (embedding as any) : null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[Campaigns API POST Error]:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Invalidate Redis Public Campaigns Cache on new campaign creation
    await deleteRedisCache('campaigns:public');

    // Trigger Campaign Live Notification if status is live
    if (newCampaign && newCampaign.status === 'live' && newCampaign.advertiser_id) {
      const { notifyAdvertiserCampaignLive } = await import('@/lib/notifications/advertiser');
      supabase
        .from('profiles')
        .select('clerk_id, email')
        .eq('id', newCampaign.advertiser_id)
        .maybeSingle()
        .then(({ data: advProfile }) => {
          if (advProfile) {
            notifyAdvertiserCampaignLive({
              clerkId: advProfile.clerk_id,
              email: advProfile.email,
              campaignTitle: newCampaign.title,
              totalBudget: Number(newCampaign.total_budget) || 0,
              cpmRate: Number(newCampaign.cpm_rate) || 2000,
              campaignId: newCampaign.id,
              profileId: newCampaign.advertiser_id,
            }).catch(err => console.error('[Campaigns API] Campaign live notification error:', err));
          }
        });
    }

    return NextResponse.json({ campaign: newCampaign });
  } catch (err) {
    console.error('[Campaigns API POST Exception]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
