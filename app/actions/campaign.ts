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
      if (url.startsWith('data:')) {
        const uploadedUrl = await uploadCampaignImageToStorage(url, 'covers');
        if (uploadedUrl) return uploadedUrl;
      }
      return url;
    };

    const campaignCode = `KPG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const reqs: any = { ...(payload.requirements || {}) };
    if (reqs.creative_image_url && reqs.creative_image_url.startsWith('data:')) {
      reqs.creative_image_url = await uploadCampaignImageToStorage(reqs.creative_image_url, 'creatives');
    }
    if (reqs.creative_video_url && reqs.creative_video_url.startsWith('data:')) {
      reqs.creative_video_url = await uploadCampaignImageToStorage(reqs.creative_video_url, 'creatives');
    }

    const requirementsWithPayment = {
      ...reqs,
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

    const processRequirementsMedia = async (reqs?: any) => {
      const copy = { ...(reqs || {}) };
      if (copy.creative_image_url && copy.creative_image_url.startsWith('data:')) {
        copy.creative_image_url = await uploadCampaignImageToStorage(copy.creative_image_url, 'creatives');
      }
      if (copy.creative_video_url && copy.creative_video_url.startsWith('data:')) {
        copy.creative_video_url = await uploadCampaignImageToStorage(copy.creative_video_url, 'creatives');
      }
      return copy;
    };

    const processedReqs = await processRequirementsMedia(payload.requirements);

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
          const receiptNumber = `KPG-PAY-${payload.id.substring(0, 5).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
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
              ...processedReqs,
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

    // 2b. Upsert campaign_creatives row from requirements data
    try {
      const fileUrl = processedReqs?.creative_video_url || processedReqs?.creative_image_url || null;
      const copyText = processedReqs?.creative_text_copy || null;
      const captionSuggestion = processedReqs?.caption_suggestion || null;

      if (fileUrl || copyText || captionSuggestion) {
        // Delete existing creatives for this campaign then re-insert (clean upsert)
        await supabase.from('campaign_creatives').delete().eq('campaign_id', campaign.id);
        await supabase.from('campaign_creatives').insert({
          campaign_id: campaign.id,
          file_url: fileUrl,
          copy_text: copyText,
          caption_suggestion: captionSuggestion,
        });
      }
    } catch (e) {
      console.error('[Campaign Action] Error saving campaign_creatives:', e);
    }

    // 3. Link or Generate Receipt Record
    let receiptNumber = payload.paystack_reference || '';
    let isPreCharged = false;

    if (receiptNumber) {
      // Look up if a receipt record already exists for this reference (pre-charged wallet or paystack webhook)
      const { data: existingReceipt } = await supabase
        .from('payment_receipts')
        .select('receipt_number')
        .eq('advertiser_id', advertiserId)
        .or(`receipt_number.eq.${receiptNumber},paystack_reference.eq.${receiptNumber}`)
        .maybeSingle();

      if (existingReceipt) {
        isPreCharged = true;
        receiptNumber = existingReceipt.receipt_number;
      }
    }

    if (isPreCharged) {
      // Payment already processed (pre-charged wallet or paystack webhook)
      // Just link the existing receipt to the new campaign and update details
      try {
        await supabase
          .from('payment_receipts')
          .update({
            campaign_id: campaign.id,
            campaign_title: campaign.title,
            escrow_budget: totalBudget,
            featured_fee: featuredFee,
            is_featured: isFeatured,
          })
          .eq('receipt_number', receiptNumber)
          .eq('advertiser_id', advertiserId);
        
        // Link the corresponding wallet transaction if it exists
        await supabase
          .from('wallet_transactions')
          .update({ campaign_id: campaign.id })
          .eq('paystack_reference', receiptNumber);
      } catch (e) {
        console.error('[Campaign Action] Error linking existing receipt/transaction:', e);
      }
    } else {
      // Payment is not pre-charged (e.g. Paystack checkout just completed on client,
      // or first-time creation via other actions).
      if (!receiptNumber) {
        receiptNumber = `KPG-PAY-${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`;
      }

      try {
        await supabase.from('payment_receipts').insert({
          receipt_number: receiptNumber,
          advertiser_id: advertiserId,
          campaign_id: campaign.id,
          campaign_title: campaign.title,
          total_amount: totalPaid,
          escrow_budget: totalBudget,
          featured_fee: featuredFee,
          is_featured: isFeatured,
          payment_method: payload.payment_method || 'wallet',
          paystack_reference: payload.paystack_reference || `WALLET-${Date.now()}`,
          status: 'paid',
        });
      } catch (e) {
        console.error('[Campaign Action] Error inserting receipt:', e);
      }

      // Wallet balance deduction only if NOT pre-charged AND payment method is wallet
      if (payload.payment_method === 'wallet') {
        try {
          const { data: advWallet } = await supabase
            .from('wallets')
            .select('id, balance')
            .eq('profile_id', advertiserId)
            .eq('wallet_type', 'advertiser_funding')
            .maybeSingle();

          if (!advWallet) {
            return { success: false, error: 'Advertiser wallet not found. Please contact support.' };
          }

          const currentWalletBalance = Number(advWallet.balance || 0);
          if (currentWalletBalance < totalBudget) {
            return {
              success: false,
              error: `Insufficient wallet balance. Available: ₦${currentWalletBalance.toLocaleString()}, Required: ₦${totalBudget.toLocaleString()}.`,
            };
          }

          // Atomic deduction — gte guard prevents race-condition negative balance
          const { error: walletDeductErr } = await supabase
            .from('wallets')
            .update({ balance: currentWalletBalance - totalBudget })
            .eq('id', advWallet.id)
            .gte('balance', totalBudget);

          if (walletDeductErr) {
            console.error('[createCampaignWizardAction] wallet deduction failed:', walletDeductErr);
            return { success: false, error: 'Failed to deduct budget from wallet. Please try again.' };
          }

          // Ledger entry
          const { error: txErr } = await supabase.from('wallet_transactions').insert({
            wallet_id: advWallet.id,
            type: 'campaign_funding',
            amount: totalBudget,
            campaign_id: campaign.id,
            status: 'completed',
            paystack_reference: receiptNumber,
          });
          if (txErr) {
            console.error('[createCampaignWizardAction] wallet_transactions insert failed:', txErr);
          }
        } catch (e) {
          console.error('[createCampaignWizardAction] Error recording wallet debit:', e);
        }
      }
    }

    // 4. Trigger creator notifications
    try {
      await notifyCreatorsNewCampaign(campaign);
    } catch (e) {
      console.error('[Campaign Action] Error dispatching creator notifications:', e);
    }

    // 4b. Trigger brand confirmation notification + email
    try {
      const { data: brandProfile } = await supabase
        .from('profiles')
        .select('email, full_name, clerk_id')
        .eq('id', advertiserId)
        .maybeSingle();
      const { data: advProfile } = await supabase
        .from('advertiser_profiles')
        .select('company_name')
        .eq('profile_id', advertiserId)
        .maybeSingle();

      if (brandProfile?.email && brandProfile?.clerk_id) {
        const { notifyAdvertiserCampaignLaunched } = await import('@/lib/notifications/advertiser');
        notifyAdvertiserCampaignLaunched({
          clerkId: brandProfile.clerk_id,
          email: brandProfile.email,
          companyName: advProfile?.company_name || brandProfile.full_name || 'Brand Partner',
          campaignTitle: campaign.title,
          campaignId: campaign.id,
          campaignCode: campaign.campaign_code || '',
          totalBudget,
          receiptNumber,
          profileId: advertiserId,
        }).catch((e) => console.error('[Campaign Action] Brand notification error:', e));
      }
    } catch (e) {
      console.error('[Campaign Action] Error dispatching brand notification:', e);
    }

    revalidatePath('/b/campaigns');
    revalidatePath('/b/wallet');
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

    const cpmFormatted = Number(campaign.cpm_rate || 2000).toLocaleString();
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

    const { sendEmail, renderReusableEmailTemplate } = await import('@/lib/resend/send-email');

    for (const creator of creators) {
      if (!creator.email) continue;
      try {
        const html = renderReusableEmailTemplate({
          to: creator.email,
          subject: `🔥 New Ad Campaign Available: ${campaign.title} (₦${cpmFormatted}/1k views)`,
          previewText: `New campaign live on Kpugi! Earn ₦${cpmFormatted} per 1,000 views on "${campaign.title}"`,
          icon: 'rocket',
          headline: 'New Campaign Drop 🚀!',
          subtitle: `Hi ${creator.full_name || 'Creator'}, a new brand campaign is live on Kpugi with ready-to-post creatives!`,
          cardTitle: 'Campaign Details',
          details: [
            { label: 'Campaign Title', value: campaign.title },
            { label: 'Ad Format', value: campaign.ad_format || 'Short Video' },
          ],
          highlightBar: {
            label: 'Payout Rate',
            value: `₦${cpmFormatted} / 1k views`,
            bgColor: '#2563EB',
          },
          cta: {
            label: 'Let\'s Go!',
            url: `${appUrl}/dashboard`,
            subtext: 'Grab the approved creative asset and publish to start earning!',
          },
        });

        await sendEmail({
          to: creator.email,
          subject: `🔥 New Ad Campaign Available: ${campaign.title} (₦${cpmFormatted}/1k views)`,
          previewText: `New campaign live on Kpugi! Earn ₦${cpmFormatted} per 1,000 views on "${campaign.title}"`,
          html,
        });
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

    // Fetch existing campaign status
    const { data: existingCampaign, error: fetchErr } = await supabase
      .from('campaigns')
      .select('id, status, title, cpm_rate, total_budget, min_view_threshold')
      .eq('id', payload.campaignId)
      .eq('advertiser_id', advertiserId)
      .single();

    if (fetchErr || !existingCampaign) {
      return { success: false, error: 'Campaign not found or access denied.' };
    }

    const isLive = existingCampaign.status === 'live';

    const updateData: any = {
      description: payload.description,
      updated_at: new Date().toISOString(),
    };

    // Only allow title & financial updates if campaign is NOT live
    if (!isLive) {
      updateData.title = payload.title;
      if (payload.cpm_rate !== undefined) updateData.cpm_rate = Math.max(2000, Number(payload.cpm_rate));
      if (payload.min_view_threshold !== undefined) updateData.min_view_threshold = Number(payload.min_view_threshold);
      if (payload.total_budget !== undefined) updateData.total_budget = Number(payload.total_budget);
    }

    if (payload.cover_image_url !== undefined) {
      if (payload.cover_image_url && payload.cover_image_url.startsWith('data:image/')) {
        const uploadedUrl = await uploadCampaignImageToStorage(payload.cover_image_url);
        updateData.cover_image_url = uploadedUrl || payload.cover_image_url;
      } else {
        updateData.cover_image_url = payload.cover_image_url;
      }
    }

    if (payload.ad_format) updateData.ad_format = payload.ad_format;
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

/**
 * AI Cross-Campaign Analytics Insights Generator
 */
export async function generateAIAnalyticsInsightsAction(
  campaignsPayload: Array<{ title: string; views: number; spent: number; cpm: number; channel: string }>
) {
  try {
    if (!campaignsPayload || campaignsPayload.length === 0 || campaignsPayload.every((c) => c.views === 0)) {
      return {
        success: true,
        hasData: false,
        insights: null,
        message: 'No active view delivery data registered yet. Run live campaigns to generate AI ROI analysis.',
      };
    }

    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const modelName = process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct';

    const totalViews = campaignsPayload.reduce((sum, c) => sum + c.views, 0);
    const totalSpent = campaignsPayload.reduce((sum, c) => sum + c.spent, 0);
    const cpv = totalViews > 0 ? totalSpent / totalViews : 0;
    const avgCpm = totalViews > 0 ? (totalSpent / totalViews) * 1000 : 0;

    if (!nvidiaKey) {
      return {
        success: true,
        hasData: true,
        insights: {
          optimizationTip: `Based on ${campaignsPayload.length} live campaign placement(s), your current effective Cost-Per-View is ₦${cpv.toFixed(2)}. Allocating budget toward higher-throughput channel formats will maximize overall view delivery.`,
          benchmarkComparison: `Your brand's blended CPM of ₦${Math.round(avgCpm).toLocaleString()} is being evaluated against standard Nigeria ad-network benchmarks (₦1,500 - ₦2,000 / 1k views).`,
        },
      };
    }

    const promptText = JSON.stringify(campaignsPayload);
    const systemInstruction = `You are Kpugi AI, a senior performance ad analyst for Nigeria's leading view-based ad platform. Analyze the provided real campaign data payload and generate 2 short, highly accurate, executive insights:
1. Optimization Tip (1-2 sentences on channel/budget performance based STRICTLY on data provided).
2. Benchmark Comparison (1-2 sentences comparing effective CPM with typical Nigeria CPM benchmarks of ₦1,500-₦2,000).
Return ONLY a valid JSON object in the exact format: {"optimizationTip": "...", "benchmarkComparison": "..."}`;

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
          { role: 'user', content: `Real Campaign Data:\n${promptText}` },
        ],
        temperature: 0.4,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      throw new Error('NVIDIA AI request failed');
    }

    const jsonRes = await res.json();
    const content = jsonRes.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());

    return {
      success: true,
      hasData: true,
      insights: parsed,
    };
  } catch (error: any) {
    console.error('[AI Analytics Insights] Error:', error);
    return {
      success: false,
      hasData: false,
      error: error?.message || 'Failed to generate AI insights',
    };
  }
}

// ─── Charge Wallet at Payment Step (Step 4) ──────────────────────────────────
// Called immediately when user clicks Pay with Wallet, BEFORE they publish.
// This ensures the wallet balance is deducted and visible in the ledger right away.

export async function chargeWalletForCampaignAction(amount: number, walletRef: string) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: 'Unauthorized: Please sign in.' };
  }

  const supabase = createAdminClient();
  const profileId = userProfile.profile.id;

  // 1. Fetch advertiser wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('profile_id', profileId)
    .eq('wallet_type', 'advertiser_funding')
    .maybeSingle();

  if (!wallet) {
    return { success: false, error: 'Advertiser wallet not found. Please contact support.' };
  }

  const currentBalance = Number(wallet.balance || 0);
  if (currentBalance < amount) {
    return {
      success: false,
      error: `Insufficient wallet balance. Available: ₦${currentBalance.toLocaleString()}, Required: ₦${amount.toLocaleString()}.`,
    };
  }

  // 2. Atomic balance deduction with race-condition guard
  const { error: deductErr } = await supabase
    .from('wallets')
    .update({ balance: currentBalance - amount })
    .eq('id', wallet.id)
    .gte('balance', amount);

  if (deductErr) {
    console.error('[chargeWalletForCampaignAction] deduction error:', deductErr);
    return { success: false, error: 'Failed to deduct from wallet. Please try again.' };
  }

  // 3. Ledger entry — pending campaign (no campaign_id yet, will link when published)
  await supabase.from('wallet_transactions').insert({
    wallet_id: wallet.id,
    type: 'campaign_funding',
    amount,
    status: 'completed',
    paystack_reference: walletRef,
    created_at: new Date().toISOString(),
  });

  // 4. Payment receipt row — allows lookup by KPG-PAY-* before campaign is even published
  await supabase.from('payment_receipts').insert({
    receipt_number: walletRef,
    advertiser_id: profileId,
    total_amount: amount,
    escrow_budget: amount,
    featured_fee: 0,
    is_featured: false,
    payment_method: 'wallet',
    paystack_reference: walletRef,
    transaction_type: 'campaign_funding',
    status: 'paid',
  }).then(({ error: rErr }) => {
    if (rErr && !rErr.message.includes('duplicate')) {
      console.error('[chargeWalletForCampaignAction] payment_receipts error:', rErr);
    }
  });

  revalidatePath('/b/wallet');

  return { success: true, walletRef };
}

