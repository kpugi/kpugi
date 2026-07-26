import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateTextEmbedding, constructCampaignEmbeddingText } from '@/lib/ai/embeddings';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        campaign_code,
        description,
        ad_format,
        cpm_rate,
        total_budget,
        reserved_budget,
        spent_budget,
        status,
        channels,
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

    // Attach AI match scores
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
        return {
          ...camp,
          match_score: matchScore,
        };
      })
    );

    return NextResponse.json({ campaigns: enrichedCampaigns });
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

    return NextResponse.json({ campaign: newCampaign });
  } catch (err) {
    console.error('[Campaigns API POST Exception]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

