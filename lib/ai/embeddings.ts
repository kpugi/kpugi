/**
 * Google Gemini Embeddings (`gemini-embedding-001`, 768 dimensions) Service for Kpugi
 */

import { createAdminClient } from '@/lib/supabase/server';

const getGeminiApiKey = () => {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
};

/**
 * Generate a 768-dimension vector embedding for input text using Google Gemini embeddings
 */
export async function generateTextEmbedding(text: string): Promise<number[] | null> {
  const apiKey = getGeminiApiKey();

  if (!apiKey || !text || !text.trim()) {
    console.warn('[Gemini Embeddings] API key or text input missing.');
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: {
          parts: [{ text: text.trim() }],
        },
        outputDimensionality: 768,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Gemini Embeddings API Error ${res.status}]:`, errText);
      return null;
    }

    const data = await res.json();
    if (data?.embedding?.values && Array.isArray(data.embedding.values)) {
      return data.embedding.values;
    }

    return null;
  } catch (error) {
    console.error('[Gemini Embeddings Exception]:', error);
    return null;
  }
}

/**
 * Helper to construct formatted text for campaign embedding
 */
export function constructCampaignEmbeddingText(campaign: {
  title: string;
  description: string;
  ad_format?: string;
  channels?: string[];
  requirements?: any;
}): string {
  const channelList = campaign.channels && campaign.channels.length > 0 
    ? campaign.channels.join(', ') 
    : 'TikTok, Instagram';
  const reqs = campaign.requirements ? JSON.stringify(campaign.requirements) : '';
  return `Brand Campaign: ${campaign.title}. Description: ${campaign.description}. Target Channels: ${channelList}. Ad Format: ${campaign.ad_format || 'video'}. Requirements: ${reqs}.`;
}

/**
 * Helper to construct formatted text for creator profile embedding
 */
export function constructCreatorEmbeddingText(creator: {
  display_name?: string;
  bio?: string;
  niche_categories?: string[];
  niche_tags?: string[];
  platforms?: string[];
}): string {
  const niches = (creator.niche_categories || creator.niche_tags || []).join(', ') || 'Lifestyle, Tech, Entertainment';
  const platforms = (creator.platforms || []).join(', ') || 'TikTok, Instagram, X';
  return `Creator Profile: ${creator.display_name || 'Creator'}. Bio: ${creator.bio || ''}. Niches: ${niches}. Connected Platforms: ${platforms}.`;
}

/**
 * Syncs and updates the 768-dim embedding for a campaign in Supabase
 */
export async function syncCampaignEmbedding(campaignId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('id, title, description, ad_format, channels, requirements')
      .eq('id', campaignId)
      .maybeSingle();

    if (error || !campaign) {
      console.error(`[syncCampaignEmbedding] Failed to fetch campaign ${campaignId}:`, error);
      return false;
    }

    const text = constructCampaignEmbeddingText(campaign);
    const embedding = await generateTextEmbedding(text);

    if (!embedding) {
      console.warn(`[syncCampaignEmbedding] Embedding generation failed for campaign ${campaignId}`);
      return false;
    }

    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ embedding: embedding as any })
      .eq('id', campaignId);

    if (updateError) {
      console.error(`[syncCampaignEmbedding] Failed to update embedding for campaign ${campaignId}:`, updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[syncCampaignEmbedding] Exception for campaign ${campaignId}:`, err);
    return false;
  }
}

/**
 * Syncs and updates the 768-dim embedding for a creator profile in Supabase
 */
export async function syncCreatorProfileEmbedding(profileId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data: creator, error } = await supabase
      .from('creator_profiles')
      .select('profile_id, display_name, bio, niche_categories')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error || !creator) {
      console.error(`[syncCreatorProfileEmbedding] Failed to fetch creator ${profileId}:`, error);
      return false;
    }

    const text = constructCreatorEmbeddingText(creator);
    const embedding = await generateTextEmbedding(text);

    if (!embedding) {
      console.warn(`[syncCreatorProfileEmbedding] Embedding generation failed for creator ${profileId}`);
      return false;
    }

    const { error: updateError } = await supabase
      .from('creator_profiles')
      .update({ embedding: embedding as any })
      .eq('profile_id', profileId);

    if (updateError) {
      console.error(`[syncCreatorProfileEmbedding] Failed to update embedding for creator ${profileId}:`, updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[syncCreatorProfileEmbedding] Exception for creator ${profileId}:`, err);
    return false;
  }
}
