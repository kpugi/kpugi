import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateTextEmbedding, constructCampaignEmbeddingText } from '@/lib/ai/embeddings';
import { getRedisCache, setRedisCache, deleteRedisCache } from '@/lib/redis/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');
    const isFresh = searchParams.get('fresh') === 'true';

    const cacheKey = creatorId ? `campaigns:creator_${creatorId}` : 'campaigns:public';

    if (isFresh) {
      await deleteRedisCache(cacheKey);
    } else {
      const cachedCampaigns = await getRedisCache<any[]>(cacheKey);
      if (cachedCampaigns) {
        return NextResponse.json(
          { campaigns: cachedCampaigns, cached: true },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            },
          }
        );
      }
    }

    const supabase = createAdminClient();

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

    // Attach AI match scores and sanitize oversized base64 cover images
    const enrichedCampaigns = await Promise.all(
      (campaigns || []).map(async (camp) => {
        let matchScore = 94;
        if (creatorId) {
          try {
            const { data: scoreData } = await supabase.rpc('get_campaign_match_score', {
              p_creator_id: creatorId,
              p_campaign_id: camp.id,
            });
            if (typeof scoreData === 'number') {
              matchScore = scoreData;
            }
          } catch (e) {
            // Fallback match score
          }
        }

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
      })
    );

    // Save to Redis Cache (TTL: 45 seconds)
    await setRedisCache(cacheKey, enrichedCampaigns, 45);

    return NextResponse.json(
      { campaigns: enrichedCampaigns, cached: false },
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
