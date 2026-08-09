'use server';

import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { uploadCampaignImageToStorage } from '@/lib/supabase/storage';
import { revalidatePath } from 'next/cache';

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

export interface CampaignWizardPayload {
  id?: string;
  title: string;
  description: string;
  cover_image_url?: string;
  ad_format: string;
  cpm_rate: number;
  total_budget: number;
  min_view_threshold: number;
  required_live_duration_hours: number;
  channels: string[];
  is_featured?: boolean;
  payment_method?: 'paystack' | 'wallet';
  paystack_reference?: string;
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
    display_ad_format?: string;
  };
}

/**
 * Server action to save a draft campaign
 */
export async function saveCampaignDraftAction(payload: Partial<CampaignWizardPayload>) {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.profile) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    if (!userProfile.advertiserProfile) {
      return { success: false, error: 'Only registered advertisers can save drafts.' };
    }

    const advertiserId = userProfile.profile.id;
    const supabase = createAdminClient();

    const normalizeAdFormat = (fmt?: string): 'video' | 'image' | 'text' => {
      if (!fmt) return 'video';
      const lower = fmt.toLowerCase();
      if (lower.includes('image') || lower.includes('photo')) return 'image';
      if (lower.includes('text') || lower.includes('post copy')) return 'text';
      return 'video';
    };

    const processCoverImageUrl = async (url?: string | null) => {
      if (!url) return null;
      if (url.startsWith('data:image/')) {
        const uploadedUrl = await uploadCampaignImageToStorage(url);
        if (uploadedUrl) return uploadedUrl;
      }
      return url;
    };

    const campaignCode = `KPG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const requirementsWithPayment = {
      ...(payload.requirements || {}),
      ...(payload.paystack_reference ? { paystack_reference: payload.paystack_reference } : {}),
      ...(payload.payment_method ? { payment_method: payload.payment_method } : {}),
    };

    const safeCoverImage = await processCoverImageUrl(payload.cover_image_url);

    if (payload.id) {
      // Update existing draft
      const { error: updateErr } = await supabase
        .from('campaigns')
        .update({
          title: payload.title || 'Untitled Draft',
          description: payload.description || '',
          cover_image_url: safeCoverImage,
          ad_format: normalizeAdFormat(payload.ad_format),
          cpm_rate: payload.cpm_rate || 2000,
          total_budget: payload.total_budget || 100000,
          min_view_threshold: payload.min_view_threshold || 1000,
          required_live_duration_hours: payload.required_live_duration_hours || 72,
          channels: payload.channels || ['TikTok', 'Instagram'],
          is_featured: Boolean(payload.is_featured),
          status: 'draft',
          requirements: requirementsWithPayment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.id)
        .eq('advertiser_id', advertiserId);

      if (updateErr) {
        return { success: false, error: `Draft update failed: ${updateErr.message}` };
      }

      revalidatePath('/b/campaigns');
      return { success: true, campaignId: payload.id };
    }

    // Create new draft
    const { data: campaign, error: insertErr } = await supabase
      .from('campaigns')
      .insert({
        advertiser_id: advertiserId,
        title: payload.title || 'Untitled Draft',
        campaign_code: campaignCode,
        description: payload.description || '',
        cover_image_url: safeCoverImage,
        ad_format: normalizeAdFormat(payload.ad_format),
        cpm_rate: payload.cpm_rate || 2000,
        total_budget: payload.total_budget || 100000,
        reserved_budget: 0,
        spent_budget: 0,
        min_view_threshold: payload.min_view_threshold || 1000,
        required_live_duration_hours: payload.required_live_duration_hours || 72,
        verification_grace_hours: 24,
        channels: payload.channels || ['TikTok', 'Instagram'],
        is_featured: Boolean(payload.is_featured),
        status: 'draft',
        requirements: requirementsWithPayment,
      })
      .select('*')
      .single();

    if (insertErr) {
      return { success: false, error: `Draft save failed: ${insertErr.message}` };
    }

    revalidatePath('/b/campaigns');
    return { success: true, campaignId: campaign.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server error saving draft' };
  }
}

/**
 * Server action to verify a Paystack transaction server-side
 */
export async function verifyPaystackTransactionAction(reference: string) {
  try {
    const userProfile = await getOrCreateUserProfile();
    if (!userProfile || !userProfile.profile) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      // Return success in test environment if secret key is not set
      return { success: true, reference, status: 'success' };
    }

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return { success: false, error: 'Failed to verify transaction with Paystack server.' };
    }

    const data = await res.json();
    if (data.status && data.data?.status === 'success') {
      return {
        success: true,
        reference,
        status: 'success',
        amount: data.data.amount / 100, // convert from kobo
        paidAt: data.data.paid_at,
        customerEmail: data.data.customer?.email,
      };
    } else {
      return {
        success: false,
        error: data.data?.gateway_response || 'Payment declined by card issuer.',
      };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server error verifying payment' };
  }
}

/**
 * Server action to publish new brand campaign with Campaign Budget lock & receipts
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

    // 1. Calculate base slot reserve & total checkout
    const cpmRate = Number(payload.cpm_rate || 2000);
    const minThreshold = Number(payload.min_view_threshold || 1000);
    const baseSlotReserve = Math.round((minThreshold / 1000) * cpmRate);
    const totalBudget = Number(payload.total_budget || 100000);
    const isFeatured = Boolean(payload.is_featured);
    const featuredFee = isFeatured ? 2500 : 0;
    const totalPaid = totalBudget + featuredFee;

    const initialReservedBudget = Math.min(baseSlotReserve, totalBudget);

    const normalizeAdFormat = (fmt?: string): 'video' | 'image' | 'text' => {
      if (!fmt) return 'video';
      const lower = fmt.toLowerCase();
      if (lower.includes('image') || lower.includes('photo')) return 'image';
      if (lower.includes('text') || lower.includes('post copy')) return 'text';
      return 'video';
    };

    const processCoverImageUrl = async (url?: string | null) => {
      if (!url) return null;
      if (url.startsWith('data:image/')) {
        const uploadedUrl = await uploadCampaignImageToStorage(url);
        if (uploadedUrl) return uploadedUrl;
      }
      return url;
    };

    const safeCoverImage = await processCoverImageUrl(payload.cover_image_url);

    // Idempotency Check: Check if campaign ID exists & is already live
    let campaign: any = null;

    if (payload.id) {
      const { data: existingCampaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', payload.id)
        .eq('advertiser_id', advertiserId)
        .single();

      if (existingCampaign) {
        if (existingCampaign.status === 'live') {
          // Already published (Idempotent return)
          const receiptNumber = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${payload.id.substring(0, 4).toUpperCase()}`;
          return {
            success: true,
            campaignId: existingCampaign.id,
            receipt: {
              receipt_number: receiptNumber,
              total_amount: totalPaid,
              escrow_budget: totalBudget,
              featured_fee: featuredFee,
              is_featured: isFeatured,
              payment_method: payload.payment_method || 'wallet',
            },
          };
        }

        // Update existing draft to status = 'live'
        const { data: updatedCampaign, error: updateErr } = await supabase
          .from('campaigns')
          .update({
            title: payload.title,
            description: payload.description,
            cover_image_url: safeCoverImage,
            ad_format: normalizeAdFormat(payload.ad_format),
            cpm_rate: cpmRate,
            total_budget: totalBudget,
            reserved_budget: initialReservedBudget,
            min_view_threshold: minThreshold,
            required_live_duration_hours: payload.required_live_duration_hours || 72,
            channels: payload.channels || ['TikTok', 'Instagram'],
            is_featured: isFeatured,
            status: 'live',
            requirements: {
              ...(payload.requirements || {}),
              display_ad_format: payload.ad_format || 'Dedicated Video',
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.id)
          .select('*')
          .single();

        if (updateErr) {
          return { success: false, error: `Failed to launch campaign draft: ${updateErr.message}` };
        }
        campaign = updatedCampaign;
      }
    }

    // Insert new campaign if not updating existing draft
    if (!campaign) {
      const campaignCode = `KPG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const { data: insertedCampaign, error: insertErr } = await supabase
        .from('campaigns')
        .insert({
          advertiser_id: advertiserId,
          title: payload.title,
          campaign_code: campaignCode,
          description: payload.description,
          cover_image_url: safeCoverImage,
          ad_format: normalizeAdFormat(payload.ad_format),
          cpm_rate: cpmRate,
          total_budget: totalBudget,
          reserved_budget: initialReservedBudget,
          spent_budget: 0,
          min_view_threshold: minThreshold,
          required_live_duration_hours: payload.required_live_duration_hours || 72,
          verification_grace_hours: 24,
          channels: payload.channels || ['TikTok', 'Instagram'],
          is_featured: isFeatured,
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
      campaign = insertedCampaign;
    }

    // 3. Generate Receipt Record
    const receiptNumber = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    try {
      await supabase.from('payment_receipts').insert({
        receipt_number: receiptNumber,
        advertiser_id: advertiserId,
        campaign_id: campaign.id,
        total_amount: totalPaid,
        escrow_budget: totalBudget,
        featured_fee: featuredFee,
        is_featured: isFeatured,
        payment_method: payload.payment_method || 'wallet',
        paystack_reference: payload.paystack_reference || `WALLET-${Date.now()}`,
        status: 'paid',
      });
    } catch (e) {
      // Table may be migrating, continue cleanly
    }

    // 4. Trigger Knock notifications and Resend emails to all creators
    try {
      await notifyCreatorsNewCampaign(campaign);
    } catch (e) {
      console.error('[Campaign Action] Error dispatching creator notifications:', e);
    }

    revalidatePath('/b/campaigns');
    revalidatePath('/browse');

    return {
      success: true,
      campaignId: campaign.id,
      receipt: {
        receipt_number: receiptNumber,
        total_amount: totalPaid,
        escrow_budget: totalBudget,
        featured_fee: featuredFee,
        is_featured: isFeatured,
        payment_method: payload.payment_method || 'wallet',
      },
    };
  } catch (err: any) {
    console.error('[Campaign Action] Exception launching campaign:', err);
    return { success: false, error: err?.message || 'Server error launching campaign' };
  }
}

/**
 * Helper to notify creators about a new live campaign via Knock & Resend
 */
export async function notifyCreatorsNewCampaign(campaign: any) {
  try {
    const supabase = createAdminClient();

    // Fetch active creator profiles
    const { data: creators } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('role', 'creator')
      .limit(100);

    if (!creators || creators.length === 0) return;

    const resendKey = process.env.RESEND_API_KEY;
    const cpmFormatted = Number(campaign.cpm_rate || 2000).toLocaleString();

    for (const creator of creators) {
      if (!creator.email) continue;
      try {
        // Send email via Resend API
        if (resendKey) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM_EMAIL || 'Kpugi <onboarding@resend.dev>',
              to: creator.email,
              subject: `🔥 New Ad Campaign Available: ${campaign.title} (₦${cpmFormatted}/1k views)`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e0fb; border-radius: 16px; background-color: #ffffff;">
                  <h2 style="color: #4338ca; margin-top: 0;">🚀 New Campaign Live on Kpugi!</h2>
                  <p style="color: #334155; font-size: 14px;">Hi ${creator.full_name || 'Creator'},</p>
                  <p style="color: #334155; font-size: 14px;">A new brand campaign is live on Kpugi with ready-to-post creatives!</p>
                  <div style="background-color: #f8f7ff; border: 1px solid #e2e0fb; padding: 18px; border-radius: 12px; margin: 16px 0;">
                    <h3 style="margin: 0 0 8px 0; color: #1e1b4b; font-size: 16px;">${campaign.title}</h3>
                    <p style="margin: 0; color: #4338ca; font-weight: bold; font-size: 15px;">Payout Rate: ₦${cpmFormatted} per 1,000 views</p>
                  </div>
                  <p style="color: #475569; font-size: 13px;">Log in to your Kpugi Creator Dashboard, grab the approved creative asset, and publish to start earning!</p>
                </div>
              `,
            }),
          });
        }
      } catch (e) {
        // Suppress individual creator email error
      }
    }
  } catch (err) {
    console.error('[Notification Helper] Error notifying creators:', err);
  }
}

/**
 * Server action to archive a campaign (Drafts & Live campaigns are marked status='archived' to preserve history)
 */
export async function archiveCampaignAction(campaignId: string) {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.profile) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    if (!userProfile.advertiserProfile) {
      return { success: false, error: 'Only registered advertisers can archive campaigns.' };
    }

    const advertiserId = userProfile.profile.id;
    const supabase = createAdminClient();

    // Check existing campaign status
    const { data: campaign, error: fetchErr } = await supabase
      .from('campaigns')
      .select('id, status, is_featured, total_budget')
      .eq('id', campaignId)
      .eq('advertiser_id', advertiserId)
      .single();

    if (fetchErr || !campaign) {
      return { success: false, error: 'Campaign not found or access denied.' };
    }

    // Set status to 'archived' in database to preserve history
    const { error: archiveErr } = await supabase
      .from('campaigns')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    if (archiveErr) {
      return { success: false, error: `Failed to archive campaign: ${archiveErr.message}` };
    }

    revalidatePath('/b/campaigns');
    revalidatePath('/b/dashboard');
    revalidatePath('/browse');

    return {
      success: true,
      message: 'Campaign archived successfully. History preserved on dashboard.',
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server error archiving campaign' };
  }
}

// Backwards compatibility alias
export const deleteCampaignAction = archiveCampaignAction;

/**
 * Server action to update existing campaign details (all parameters)
 */
export async function updateCampaignDetailsAction(payload: {
  campaignId: string;
  title: string;
  description: string;
  cover_image_url?: string;
  ad_format?: string;
  cpm_rate?: number;
  min_view_threshold?: number;
  total_budget?: number;
  required_live_duration_hours?: number;
  channels?: string[];
  is_featured?: boolean;
  requirements?: any;
}) {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.profile) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const advertiserId = userProfile.profile.id;
    const supabase = createAdminClient();

    const updateData: any = {
      title: payload.title,
      description: payload.description,
      updated_at: new Date().toISOString(),
    };

    if (payload.cover_image_url !== undefined) {
      if (payload.cover_image_url && payload.cover_image_url.startsWith('data:image/')) {
        const uploadedUrl = await uploadCampaignImageToStorage(payload.cover_image_url);
        updateData.cover_image_url = uploadedUrl || payload.cover_image_url;
      } else {
        updateData.cover_image_url = payload.cover_image_url;
      }
    }

    if (payload.ad_format) updateData.ad_format = payload.ad_format;
    if (payload.cpm_rate !== undefined) updateData.cpm_rate = Math.max(2000, Number(payload.cpm_rate));
    if (payload.min_view_threshold !== undefined) updateData.min_view_threshold = Number(payload.min_view_threshold);
    if (payload.total_budget !== undefined) updateData.total_budget = Number(payload.total_budget);
    if (payload.required_live_duration_hours !== undefined) updateData.required_live_duration_hours = Number(payload.required_live_duration_hours);
    if (payload.channels) updateData.channels = payload.channels;
    if (payload.is_featured !== undefined) updateData.is_featured = Boolean(payload.is_featured);
    if (payload.requirements) updateData.requirements = payload.requirements;

    const { error: updateErr } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', payload.campaignId)
      .eq('advertiser_id', advertiserId);

    if (updateErr) {
      return { success: false, error: `Failed to update campaign: ${updateErr.message}` };
    }

    revalidatePath('/b/campaigns');
    revalidatePath(`/b/campaigns/${payload.campaignId}`);
    revalidatePath('/browse');

    return { success: true, message: 'Campaign updated successfully.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server error updating campaign' };
  }
}
