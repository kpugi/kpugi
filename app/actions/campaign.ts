'use server';

import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CampaignWizardPayload {
  title: string;
  description: string;
  ad_format: string;
  cpm_rate: number;
  total_budget: number;
  min_view_threshold: number;
  required_live_duration_hours: number;
  channels: string[];
  requirements: {
    objective?: string;
    target_niche?: string[];
    min_followers?: number;
    hashtags?: string[];
    mentions?: string[];
    google_doc_url?: string;
    google_drive_url?: string;
    script_do_and_donts?: string;
    creative_text_copy?: string;
    creative_assets?: string[];
    voice_narration_transcript?: string;
  };
}

/**
 * AI Prompt Polish using Google Gemini API
 */
export async function generateAICampaignPolishAction(
  promptText: string,
  mode: 'title' | 'description' | 'requirements' | 'hashtags'
) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return { success: false, error: 'Google AI key not configured' };
    }

    let systemInstruction = '';
    if (mode === 'title') {
      systemInstruction =
        'You are an expert marketing strategist for viral social media ad campaigns. Generate a punchy, high-converting 3-to-6 word campaign title based on the brand prompt. Return ONLY the title text.';
    } else if (mode === 'description') {
      systemInstruction =
        'You are an expert marketing copywriter. Create a clear, engaging 2-to-4 paragraph campaign briefing for creators detailing the campaign goals, key selling points, and target audience. Return clear markdown formatted text.';
    } else if (mode === 'requirements') {
      systemInstruction =
        'Create concise, structured content guidelines (Do & Donts, brand tone, key message) for creators posting ready-made brand video/image/text creatives.';
    } else {
      systemInstruction =
        'Generate a comma-separated list of 4 relevant viral hashtags and 2 official brand mentions starting with # and @.';
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nBrand Context: ${promptText}` }],
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Gemini AI] API error:', errText);
      return { success: false, error: 'AI generation failed' };
    }

    const data = await res.json();
    const resultText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    return { success: true, text: resultText };
  } catch (err: any) {
    console.error('[Gemini AI] Server action error:', err);
    return { success: false, error: err?.message || 'Server error during AI generation' };
  }
}

/**
 * Server action to publish new brand campaign with escrow budget lock
 */
export async function createCampaignWizardAction(payload: CampaignWizardPayload) {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.profile) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    if (!userProfile.advertiserProfile) {
      return { success: false, error: 'Only registered advertisers can launch campaigns.' };
    }

    const advertiserId = userProfile.profile.id;
    const supabase = createAdminClient();

    // 1. Calculate base slot reserve
    const cpmRate = Number(payload.cpm_rate || 2000);
    const minThreshold = Number(payload.min_view_threshold || 1000);
    const baseSlotReserve = Math.round((minThreshold / 1000) * cpmRate);
    const totalBudget = Number(payload.total_budget || 100000);

    // Initial reserved budget starts at 0 (or baseline slot commitment)
    const initialReservedBudget = Math.min(baseSlotReserve, totalBudget);

    // Generate campaign code (e.g. KPG-X9A2M)
    const campaignCode = `KPG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 2. Insert new campaign into database
    const { data: campaign, error: insertErr } = await supabase
      .from('campaigns')
      .insert({
        advertiser_id: advertiserId,
        title: payload.title,
        campaign_code: campaignCode,
        description: payload.description,
        ad_format: payload.ad_format || 'Dedicated Video',
        cpm_rate: cpmRate,
        total_budget: totalBudget,
        reserved_budget: initialReservedBudget,
        spent_budget: 0,
        min_view_threshold: minThreshold,
        required_live_duration_hours: payload.required_live_duration_hours || 72,
        verification_grace_hours: 24,
        channels: payload.channels || ['TikTok', 'Instagram'],
        status: 'live',
        requirements: payload.requirements || {},
      })
      .select('*')
      .single();

    if (insertErr) {
      console.error('[Campaign Action] Error inserting campaign:', insertErr);
      return { success: false, error: `Database insert failed: ${insertErr.message}` };
    }

    revalidatePath('/b/campaigns');
    revalidatePath('/(marketing)/browse');

    return { success: true, campaignId: campaign.id, campaignCode: campaign.campaign_code };
  } catch (err: any) {
    console.error('[Campaign Action] Server error:', err);
    return { success: false, error: err?.message || 'Failed to create campaign' };
  }
}
