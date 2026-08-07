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
 * AI Prompt Polish using NVIDIA NIM AI API
 */
export async function generateAICampaignPolishAction(
  promptText: string,
  mode: 'title' | 'description' | 'requirements' | 'hashtags'
) {
  try {
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const modelName = process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct';

    if (!nvidiaKey) {
      return { success: false, error: 'NVIDIA API Key missing. Please add NVIDIA_API_KEY to .env.local.' };
    }

    let systemInstruction = '';
    if (mode === 'title') {
      systemInstruction =
        'You are an expert marketing strategist for viral social media ad campaigns. Generate a punchy, high-converting 3-to-6 word campaign title based on the brand prompt. Return ONLY the title text with no quotes, markdown, or intro.';
    } else if (mode === 'description') {
      systemInstruction =
        'You are an expert ad copywriter. Write a compelling, high-converting creator briefing for content creators based on the brand campaign title, primary goal, and notes. Write strictly the final briefing text for creators to read. DO NOT include meta-commentary, planning thoughts, instructions, or character count notes in your output.';
    } else if (mode === 'requirements') {
      systemInstruction =
        'Create concise, structured content guidelines (Do & Donts, brand tone, key message) for creators posting ready-made brand video/image/text creatives. Return clean text.';
    } else {
      systemInstruction =
        'Generate a comma-separated list of 4 relevant viral hashtags and 2 official brand mentions starting with # and @.';
    }

    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${nvidiaKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: `Brand Campaign Details:\n${promptText}` },
        ],
        temperature: 0.6,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[NVIDIA NIM AI] API error:', errText);
      return { success: false, error: 'NVIDIA NIM AI text generation failed' };
    }

    const data = await res.json();
    let resultText = data?.choices?.[0]?.message?.content?.trim() || '';

    // Strip out <think>...</think> reasoning blocks if model outputs thought tokens
    resultText = resultText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    if (mode === 'title' || mode === 'description') {
      resultText = resultText
        .replace(/^#+\s+/gm, '')
        .replace(/\*\*/g, '')
        .replace(/^[*-]\s+/gm, '• ')
        .replace(/^Paragraph \d+:.*$/gm, '')
        .replace(/^We need to.*$/gm, '')
        .replace(/^Here is.*$/gm, '')
        .trim();
    }

    if (mode === 'description') {
      resultText = resultText.slice(0, 500).trim();
    }

    return { success: true, text: resultText };
  } catch (err: any) {
    console.error('[NVIDIA NIM AI] Server action error:', err);
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
    const normalizeAdFormat = (fmt?: string): 'video' | 'image' | 'text' => {
      if (!fmt) return 'video';
      const lower = fmt.toLowerCase();
      if (lower.includes('image') || lower.includes('photo')) return 'image';
      if (lower.includes('text') || lower.includes('post copy')) return 'text';
      return 'video';
    };

    const campaignCode = `KPG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 2. Insert new campaign into database
    const { data: campaign, error: insertErr } = await supabase
      .from('campaigns')
      .insert({
        advertiser_id: advertiserId,
        title: payload.title,
        campaign_code: campaignCode,
        description: payload.description,
        ad_format: normalizeAdFormat(payload.ad_format),
        cpm_rate: cpmRate,
        total_budget: totalBudget,
        reserved_budget: initialReservedBudget,
        spent_budget: 0,
        min_view_threshold: minThreshold,
        required_live_duration_hours: payload.required_live_duration_hours || 72,
        verification_grace_hours: 24,
        channels: payload.channels || ['TikTok', 'Instagram'],
        status: 'live',
        requirements: {
          ...(payload.requirements || {}),
          display_ad_format: payload.ad_format || 'Dedicated Video',
        },
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
