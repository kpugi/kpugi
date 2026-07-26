/**
 * Google Gemini Embeddings (`text-embedding-004`, 768 dimensions) Service for Kpugi
 */

const getGeminiApiKey = () => {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
};

/**
 * Generate a 768-dimension vector embedding for input text using Google Gemini text-embedding-004
 */
export async function generateTextEmbedding(text: string): Promise<number[] | null> {
  const apiKey = getGeminiApiKey();

  if (!apiKey || !text || !text.trim()) {
    console.warn('[Gemini Embeddings] API key or text input missing.');
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text: text.trim() }],
        },
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
}): string {
  const channelList = campaign.channels ? campaign.channels.join(', ') : 'TikTok, Instagram';
  return `Brand Campaign: ${campaign.title}. Description: ${campaign.description}. Target Channels: ${channelList}. Ad Format: ${campaign.ad_format || 'video'}. Base Rate: N2000 per 1k views.`;
}

/**
 * Helper to construct formatted text for creator profile embedding
 */
export function constructCreatorEmbeddingText(creator: {
  display_name?: string;
  bio?: string;
  niche_tags?: string[];
  platforms?: string[];
}): string {
  const niches = creator.niche_tags ? creator.niche_tags.join(', ') : 'Lifestyle, Tech, Entertainment';
  const platforms = creator.platforms ? creator.platforms.join(', ') : 'TikTok, Instagram, X';
  return `Creator Profile: ${creator.display_name || 'Creator'}. Bio: ${creator.bio || ''}. Niches: ${niches}. Connected Platforms: ${platforms}.`;
}
