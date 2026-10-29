'use server';

import { getOrCreateUserProfile, checkProfileSuspension } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { uploadCampaignImageToStorage } from '@/lib/supabase/storage';
import { logAuditEvent, AUDIT_ACTIONS } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

/**
 * AI Prompt Polish using NVIDIA NIM AI API
 */
export async function generateAICampaignPolishAction(
  promptText: string,
  mode: 'title' | 'description' | 'requirements' | 'hashtags' | 'caption'
) {
  try {
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const configuredModel = process.env.NVIDIA_MODEL;
    // Fall back to meta/llama-3.2-11b-vision-instruct if model is unset or known to stall
    const modelName =
      !configuredModel || configuredModel.includes('kimi') || configuredModel.includes('moonshot')
        ? 'meta/llama-3.2-11b-vision-instruct'
        : configuredModel;

    if (!nvidiaKey) {
      return { success: false, error: 'NVIDIA API Key missing. Please add NVIDIA_API_KEY to .env.local.' };
    }

    let systemInstruction = '';
    if (mode === 'title') {
      systemInstruction =
        'You are an expert marketing strategist for viral social media ad campaigns. Generate a punchy, high-converting 3-to-6 word campaign title based on the brand prompt. Return ONLY the title text with no quotes, markdown, or intro.';
    } else if (mode === 'description') {
      systemInstruction = `You are an expert campaign strategist on Kpugi, Nigeria's leading pay-per-view creator ad distribution platform.

PLATFORM OPERATING MODEL:
- On Kpugi, creators DO NOT produce, shoot, film, design, or write original content.
- The brand provides 100% finished official creative assets (ready-made video ads, promo images/flyers, or official captions), which are attached directly to the campaign page.
- Creators earn cash per verified view simply by downloading the brand's attached creative asset, publishing it to the approved campaign channels, and driving authentic organic views from their audience.

CRITICAL CONSTRAINTS (STRICT):
1. NEVER instruct creators to "create content", "shoot a video", "record footage", "write reviews", or "design graphics". Their sole task is to distribute the brand's provided asset.
2. NEVER output placeholders like "[Insert link to download the asset]", "[Insert link]", "[Download link]", or "[Link to creative]". The creative asset is already attached directly on the campaign page, so simply tell creators to download the attached creative asset directly from this campaign page.
3. DO NOT hardcode cliché titles like "(Grab & Amplify)". Headings must vary naturally based on the campaign and its specific goal.
4. DO NOT blindly list all social media platforms. Only refer to the specific approved channels provided in the campaign details (or refer to them as "the approved campaign channels / eligible platforms").

TAILOR THE BRIEF SPECIFICALLY TO THE CAMPAIGN GOAL:
- If Goal is AWARENESS / BRAND REACH:
  * Focus on viral audience reach, brand recall, high view counts, and public conversation.
  * Headings could look like: "## Campaign Overview", "## How to Amplify & Earn", "## Verification & Payout Rules", "## Tips for Maximum Viral Views".
  * Creators should post at peak hours and drive authentic views and shares.

- If Goal is LEADS / SIGNUPS:
  * Focus on driving audience curiosity, signups, waitlists, or registrations.
  * Headings could look like: "## About This Initiative", "## Distribution & Action Steps", "## Payout & Verification Guidelines", "## Tips to Drive Signups & Views".
  * Creators should emphasize the signup call-to-action and direct followers to the link in bio.

- If Goal is SALES / ORDERS:
  * Focus on the product value, special discount/offer, purchase urgency, and conversions.
  * Headings could look like: "## Product Offer & Overview", "## How to Share & Earn", "## Posting & Verification Requirements", "## Tips to Boost Your Conversion Views".
  * Creators should emphasize the promo offer and buying prompt in their post.

- If Goal is APP INSTALLS:
  * Focus on app features, key utility, and downloading the app on Google Play / Apple App Store.
  * Headings could look like: "## App Launch Overview", "## Creator Distribution Guide", "## Payout Eligibility Rules", "## Tips for High-Converting App Views".
  * Creators should direct followers to download the app via the link in bio.

STRUCTURE OF THE BRIEF:
1. Campaign Overview (Tailored to the mission/offer and the primary goal)
2. Creator Instructions (Clear steps: download the attached creative asset from this page and publish it on the approved channels with the official caption)
3. Posting Rules & Payout Verification (Essential rules: keep post public and live for min 24-48 hours, do not alter/cut the brand asset, use official caption/tags, strictly authentic organic views with zero bot tolerance)
4. Tips to Maximize Earnings & Views (Goal-specific advice on timing and engagement)

OUTPUT FORMAT:
Return clean, semantic HTML elements directly (for a rich TipTap WYSIWYG editor):
- Use <h2> for each section heading (e.g. <h2>Campaign Overview</h2>, <h2>Creator Instructions</h2>, <h2>Posting Rules & Payout Verification</h2>, <h2>Tips for Maximum Reach</h2>).
- Use <p> for descriptive paragraphs.
- Use <ul> and <li> for lists of rules and tips.
- Use <strong> for emphasis.
- DO NOT wrap in <html>, <body>, or markdown code fences. Return ONLY the clean HTML tags.
Keep the briefing polished, concise, engaging, and under 1,600 characters so it fits comfortably. Return clean text ready for creators to read. DO NOT include meta-commentary, thinking notes, or bracketed placeholders.`;
    } else if (mode === 'caption') {
      systemInstruction =
        'You are an expert social media copywriter for viral ad campaigns in Nigeria. Write an engaging, high-converting, ready-to-post social media caption for content creators to publish with the brand creative. Hook the audience in the first sentence with an engaging hook or question, clearly communicate the value/offer, include an explicit call-to-action (CTA, e.g. Link in bio, download now, or check out today), and end with 2-4 relevant hashtags and official brand mentions. Use natural emojis for high engagement. Return ONLY the final caption text ready for creators to copy and post. DO NOT include quotation marks, markdown headings, intro remarks, or meta-commentary.';
    } else if (mode === 'requirements') {
      systemInstruction =
        'Create concise, structured content distribution guidelines (Do & Donts, required live duration, brand tone) for creators posting ready-made brand video/image creatives on Kpugi. Emphasize that creators amplify pre-made brand assets and do not produce original content. Return clean text.';
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
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: `Brand Campaign Details:\n${promptText}` },
        ],
        temperature: 0.6,
        max_tokens: mode === 'description' ? 1200 : mode === 'caption' ? 500 : 300,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[NVIDIA NIM AI] API error:', res.status, errText);
      return { success: false, error: 'NVIDIA NIM AI text generation failed' };
    }

    const data = await res.json();
    let resultText = data?.choices?.[0]?.message?.content?.trim() || '';

    // Strip out <think>...</think> reasoning blocks if model outputs thought tokens
    resultText = resultText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    if (mode === 'title') {
      resultText = resultText
        .replace(/^#+\s+/gm, '')
        .replace(/\*\*/g, '')
        .replace(/^"|"$/g, '')
        .replace(/^Here is.*$/gm, '')
        .trim();
    }

    if (mode === 'caption') {
      resultText = resultText
        .replace(/^["']|["']$/g, '')
        .replace(/^Here is (the|a|your).*?:\s*/gim, '')
        .replace(/^Caption:\s*/gim, '')
        .replace(/^#+\s+.*?\n/gm, '')
        .trim();
    }

    if (mode === 'description') {
      resultText = resultText
        .replace(/^Paragraph \d+:.*$/gm, '')
        .replace(/^Here is (the|your).*$/gim, '')
        .replace(/^```(?:html)?\s*/gi, '')
        .replace(/```\s*$/g, '')
        .trim();

      // Check if text already contains semantic HTML tags (<h2>, <p>, <ul>, <li>)
      const hasSemanticHtml = /<(?:h[1-4]|p|ul|ol|li)\b[^>]*>/i.test(resultText);

      if (hasSemanticHtml) {
        // Clean up any double-wrapped or empty tags
        resultText = resultText
          .replace(/<p>\s*<(?:h[1-4]|ul|ol)>/gi, (m: string) => m.slice(3))
          .replace(/<\/(?:h[1-4]|ul|ol)>\s*<\/p>/gi, (m: string) => m.slice(0, -4))
          .replace(/<p>\s*<\/p>/gi, '')
          .trim();
      } else {
        // Robust line-by-line Markdown to HTML converter
        const lines = resultText.split(/\r?\n/);
        const output: string[] = [];
        let inList = false;
        let listType = 'ul';

        const closeList = () => {
          if (inList) {
            output.push(`</${listType}>`);
            inList = false;
          }
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) {
            closeList();
            continue;
          }

          // Heading 2: ## Heading or **Heading:** on a standalone line
          const h2Match = line.match(/^#{1,2}\s+(.+)$/);
          const boldHeadingMatch = line.match(/^\*\*(.+?)\*\*:?$/);
          if (h2Match || boldHeadingMatch) {
            closeList();
            const content = (h2Match ? h2Match[1] : boldHeadingMatch![1]).replace(/\*\*/g, '').trim();
            output.push(`<h2>${content}</h2>`);
            continue;
          }

          // Heading 3: ### Heading
          const h3Match = line.match(/^#{3,4}\s+(.+)$/);
          if (h3Match) {
            closeList();
            const content = h3Match[1].replace(/\*\*/g, '').trim();
            output.push(`<h3>${content}</h3>`);
            continue;
          }

          // Bullet List item (- or * or •)
          const bulletMatch = line.match(/^[•*-]\s+(.+)$/);
          if (bulletMatch) {
            if (!inList || listType !== 'ul') {
              closeList();
              output.push('<ul>');
              inList = true;
              listType = 'ul';
            }
            const itemContent = bulletMatch[1].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            output.push(`<li>${itemContent}</li>`);
            continue;
          }

          // Numbered List item (1. 2.)
          const numberMatch = line.match(/^\d+\.\s+(.+)$/);
          if (numberMatch) {
            if (!inList || listType !== 'ol') {
              closeList();
              output.push('<ol>');
              inList = true;
              listType = 'ol';
            }
            const itemContent = numberMatch[1].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            output.push(`<li>${itemContent}</li>`);
            continue;
          }

          // Regular paragraph
          closeList();
          const formatted = line
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, '$1<em>$2</em>$3');
          output.push(`<p>${formatted}</p>`);
        }

        closeList();
        if (output.length > 0) {
          resultText = output.join('\n');
        }
      }

      resultText = resultText.slice(0, 2000).trim();
    }

    return { success: true, text: resultText };
  } catch (err: any) {
    const isTimeout =
      err?.name === 'TimeoutError' ||
      err?.name === 'AbortError' ||
      err?.code === 'UND_ERR_HEADERS_TIMEOUT' ||
      err?.message?.includes('aborted');
    console.error('[NVIDIA NIM AI] Server action error:', err);
    return {
      success: false,
      error: isTimeout
        ? 'AI request timed out. Please retry or enter your brief directly.'
        : err?.message || 'Server error during AI generation',
    };
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
  payment_method?: 'paystack' | 'bachs' | 'wallet';
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

    const { isSuspended, reason } = checkProfileSuspension(userProfile.profile);
    if (isSuspended) {
      return { success: false, error: `Account suspended (${reason || 'Read-Only Mode'}). Campaign drafts cannot be saved.` };
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
      return {
        success: true,
        campaignId: payload.id,
        cover_image_url: safeCoverImage,
        requirements: requirementsWithPayment,
      };
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
    return {
      success: true,
      campaignId: campaign.id,
      cover_image_url: safeCoverImage,
      requirements: requirementsWithPayment,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server error saving draft' };
  }
}

/**
 * Server action to verify a Paystack transaction server-side and record dual ledger entries (deposit + campaign funding)
 */
export async function verifyPaystackTransactionAction(
  reference: string,
  metadata?: {
    campaignId?: string;
    campaignTitle?: string;
    isFeatured?: boolean;
    featuredFee?: number;
    amount?: number;
  }
) {
  try {
    const userProfile = await getOrCreateUserProfile();
    if (!userProfile || !userProfile.profile) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const { isSuspended, reason } = checkProfileSuspension(userProfile.profile);
    if (isSuspended) {
      return { success: false, error: `Account suspended (${reason || 'Read-Only Mode'}). Campaign funding is disabled.` };
    }

    const profileId = userProfile.profile.id;
    const supabase = createAdminClient();
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    let verifiedAmount = metadata?.amount || 0;
    let customerEmail = userProfile.profile.email;

    if (paystackSecret) {
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
        const paystackData = data.data;

        // Strictly lock verifiedAmount to what was inputted on Kpugi (metadata?.amount), NOT Paystack customer gross fees
        if (metadata?.amount && Number(metadata.amount) > 0) {
          verifiedAmount = Number(metadata.amount);
        } else if (paystackData?.metadata?.amount && Number(paystackData.metadata.amount) > 0) {
          verifiedAmount = Number(paystackData.metadata.amount);
        } else if (paystackData?.requested_amount && Number(paystackData.requested_amount) > 0) {
          verifiedAmount = Number(paystackData.requested_amount) / 100;
        } else if (paystackData?.fees && Number(paystackData.fees) > 0 && Number(paystackData.amount) > Number(paystackData.fees)) {
          verifiedAmount = (Number(paystackData.amount) - Number(paystackData.fees)) / 100;
        } else {
          verifiedAmount = Number(paystackData.amount) / 100;
        }

        customerEmail = paystackData.customer?.email || customerEmail;
      } else {
        return {
          success: false,
          error: data.data?.gateway_response || 'Payment declined by card issuer.',
        };
      }
    }

    // Get or create advertiser funding wallet
    let { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('profile_id', profileId)
      .eq('wallet_type', 'advertiser_funding')
      .maybeSingle();

    if (!wallet) {
      const { data: newWallet, error: walletCreateErr } = await supabase
        .from('wallets')
        .insert({
          profile_id: profileId,
          wallet_type: 'advertiser_funding',
          balance: 0,
        })
        .select('id, balance')
        .single();

      if (!walletCreateErr && newWallet) {
        wallet = newWallet;
      }
    }

    // Record Dual Ledger Entries in wallet_transactions (Deposit + Campaign Funding Debit)
    if (wallet) {
      const { data: existingTx } = await supabase
        .from('wallet_transactions')
        .select('id, type')
        .eq('paystack_reference', reference);

      const hasDeposit = existingTx?.some((t) => t.type === 'deposit');
      const hasDebit = existingTx?.some((t) => t.type === 'campaign_funding');

      if (!hasDeposit) {
        // 1. Deposit Entry (Credit)
        const { error: depErr } = await supabase.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          type: 'deposit',
          amount: verifiedAmount,
          status: 'completed',
          paystack_reference: reference,
          created_at: new Date(Date.now() - 1000).toISOString(),
        });
        if (depErr) {
          console.error('[verifyPaystackTransactionAction] deposit insert error:', depErr);
        }
      }

      const escrowBudget = (metadata?.featuredFee && metadata.featuredFee > 0)
        ? (verifiedAmount - metadata.featuredFee)
        : verifiedAmount;

      if (!hasDebit) {
        // 2. Campaign Funding Entry (Debit) — strictly creator escrow budget
        const { error: debitErr } = await supabase.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          type: 'campaign_funding',
          amount: escrowBudget > 0 ? escrowBudget : verifiedAmount,
          status: 'completed',
          paystack_reference: reference,
          campaign_id: metadata?.campaignId || null,
          created_at: new Date().toISOString(),
        });
        if (debitErr) {
          console.error('[verifyPaystackTransactionAction] campaign_funding debit error:', debitErr);
        }
      }
    }

    // 3. Insert or update payment_receipts record
    const receiptNum = reference.startsWith('KPG-PAY-')
      ? reference
      : `KPG-PAY-${reference.slice(-5).toUpperCase()}`;

    const totalBudget = verifiedAmount - (metadata?.featuredFee || 0);

    await supabase
      .from('payment_receipts')
      .upsert(
        {
          receipt_number: receiptNum,
          advertiser_id: profileId,
          campaign_id: metadata?.campaignId || null,
          campaign_title: metadata?.campaignTitle || null,
          total_amount: verifiedAmount,
          escrow_budget: totalBudget > 0 ? totalBudget : verifiedAmount,
          featured_fee: metadata?.featuredFee || 0,
          is_featured: Boolean(metadata?.isFeatured),
          payment_method: 'paystack',
          paystack_reference: reference,
          transaction_type: 'campaign_funding',
          advertiser_email: customerEmail,
          status: 'paid',
        },
        { onConflict: 'receipt_number' }
      )
      .then(({ error: rErr }) => {
        if (rErr && !rErr.message.includes('duplicate')) {
          console.error('[verifyPaystackTransactionAction] payment_receipts error:', rErr);
        }
      });

    revalidatePath('/b/wallet');
    revalidatePath('/b/campaigns');

    return {
      success: true,
      reference,
      status: 'success',
      amount: verifiedAmount,
      customerEmail,
    };
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

    const { isSuspended, reason } = checkProfileSuspension(userProfile.profile);
    if (isSuspended) {
      return { success: false, error: `Account suspended (${reason || 'Read-Only Mode'}). Launching campaigns is disabled.` };
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
        
        // Link the corresponding wallet transaction if it exists (for campaign_funding)
        await supabase
          .from('wallet_transactions')
          .update({ campaign_id: campaign.id })
          .eq('paystack_reference', receiptNumber)
          .eq('type', 'campaign_funding');
      } catch (e) {
        console.error('[Campaign Action] Error linking existing receipt/transaction:', e);
      }
    } else {
      // Payment is not pre-charged (e.g. Paystack checkout just completed on client,
      // or first-time creation via other actions).
      if (!receiptNumber) {
        const isBachsPay = payload.payment_method === 'bachs' || payload.paystack_reference?.startsWith('KPG-BCH-');
        const prefix = isBachsPay ? 'KPG-BCH' : 'KPG-PAY';
        receiptNumber = `${prefix}-${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`;
      }

      try {
        const { error: insErr } = await supabase.from('payment_receipts').insert({
          receipt_number: receiptNumber,
          advertiser_id: advertiserId,
          campaign_id: campaign.id,
          campaign_title: campaign.title,
          total_amount: totalPaid,
          escrow_budget: totalBudget,
          featured_fee: featuredFee,
          is_featured: isFeatured,
          payment_method: payload.payment_method || 'wallet',
          paystack_reference: payload.paystack_reference || receiptNumber,
          status: 'paid',
        });

        if (insErr && insErr.message.includes('check constraint')) {
          await supabase.from('payment_receipts').insert({
            receipt_number: receiptNumber,
            advertiser_id: advertiserId,
            campaign_id: campaign.id,
            campaign_title: campaign.title,
            total_amount: totalPaid,
            escrow_budget: totalBudget,
            featured_fee: featuredFee,
            is_featured: isFeatured,
            payment_method: 'paystack',
            paystack_reference: payload.paystack_reference || receiptNumber,
            status: 'paid',
            notes: payload.payment_method === 'bachs' ? 'Paid via Bachs.io Gateway' : undefined,
          });
        }
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
      } else if (payload.payment_method === 'paystack' || payload.payment_method === 'bachs') {
        // Fallback for gateway payments: ensure dual ledger entries exist (Deposit + Campaign Funding Debit)
        try {
          let { data: advWallet } = await supabase
            .from('wallets')
            .select('id, balance')
            .eq('profile_id', advertiserId)
            .eq('wallet_type', 'advertiser_funding')
            .maybeSingle();

          if (!advWallet) {
            const { data: newW } = await supabase
              .from('wallets')
              .insert({ profile_id: advertiserId, wallet_type: 'advertiser_funding', balance: 0 })
              .select('id, balance')
              .single();
            advWallet = newW;
          }

          if (advWallet) {
            const { data: existingTx } = await supabase
              .from('wallet_transactions')
              .select('id, type')
              .eq('paystack_reference', receiptNumber);

            const hasDeposit = existingTx?.some((t) => t.type === 'deposit');
            const hasDebit = existingTx?.some((t) => t.type === 'campaign_funding');

            if (!hasDeposit) {
              await supabase.from('wallet_transactions').insert({
                wallet_id: advWallet.id,
                type: 'deposit',
                amount: totalPaid,
                paystack_reference: receiptNumber,
                status: 'completed',
                created_at: new Date(Date.now() - 1000).toISOString(),
              });
            }

            if (!hasDebit) {
              await supabase.from('wallet_transactions').insert({
                wallet_id: advWallet.id,
                type: 'campaign_funding',
                amount: totalBudget,
                campaign_id: campaign.id,
                paystack_reference: receiptNumber,
                status: 'completed',
                created_at: new Date().toISOString(),
              });
            } else {
              await supabase
                .from('wallet_transactions')
                .update({ campaign_id: campaign.id })
                .eq('paystack_reference', receiptNumber)
                .eq('type', 'campaign_funding');
            }
          }
        } catch (e) {
          console.error('[createCampaignWizardAction] Error recording Paystack dual ledger entries:', e);
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

      if (brandProfile?.email) {
        const { notifyAdvertiserCampaignLive } = await import('@/lib/notifications/advertiser');
        await notifyAdvertiserCampaignLive({
          clerkId: brandProfile.clerk_id || advertiserId,
          email: brandProfile.email,
          campaignTitle: campaign.title,
          totalBudget,
          cpmRate,
          campaignId: campaign.id,
          profileId: advertiserId,
        });
      }
    } catch (e) {
      console.error('[Campaign Action] Error dispatching brand notification:', e);
    }

    // 5. Immutable Brand Audit Trail
    logAuditEvent({
      profileId: advertiserId,
      actorRole: 'advertiser',
      action: AUDIT_ACTIONS.CAMPAIGN_CREATED,
      actionCategory: 'campaign',
      targetTable: 'campaigns',
      targetId: campaign.id,
      details: `Created and launched campaign "${campaign.title}" with budget ₦${totalBudget.toLocaleString()}`,
      payload: {
        title: campaign.title,
        campaign_code: campaign.campaign_code,
        budget: totalBudget,
        cpm: cpmRate,
        channels: campaign.channels,
        ad_format: payload.ad_format,
        receipt_number: receiptNumber,
        payment_method: payload.payment_method || 'wallet',
      },
    }).catch((e) => console.error('[Campaign Action] Error logging campaign audit event:', e));

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
    const { data: creators, error: fetchErr } = await supabase
      .from('profiles')
      .select('id, clerk_id, email, full_name')
      .eq('role', 'creator')
      .limit(100);

    if (fetchErr) {
      console.error('[notifyCreatorsNewCampaign] Error fetching creators:', fetchErr);
      return;
    }

    if (!creators || creators.length === 0) return;

    const cpmFormatted = Number(campaign.cpm_rate || 2000).toLocaleString();
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
    const actionUrl = `/browse/${campaign.id}`;

    const { sendEmail, renderReusableEmailTemplate, renderChannelIcons } = await import('@/lib/resend/send-email');
    const { triggerNotification } = await import('@/lib/knock/notify');

    const campaignChannels = Array.isArray(campaign.channels) && campaign.channels.length > 0
      ? campaign.channels
      : ['TikTok', 'Instagram'];
    const channelIconsHtml = renderChannelIcons(campaignChannels, appUrl);

    for (const creator of creators) {
      // 1. Dispatch In-App Notification to Creator Bell
      try {
        if (creator.clerk_id || creator.id) {
          await triggerNotification({
            workflowKey: 'new-campaign-alert',
            recipients: [creator.clerk_id || creator.id],
            data: {
              campaignTitle: campaign.title,
              cpmRate: `₦${cpmFormatted}/1k views`,
              adFormat: campaign.ad_format || 'Video / Image',
              campaignId: campaign.id,
              action_url: actionUrl,
            },
            profileId: creator.id,
          });
        }
      } catch (notifErr) {
        console.error('[Notification Helper] Error sending in-app notification to creator:', notifErr);
      }

      // 2. Dispatch Branded Email to Creator
      if (
        !creator.email ||
        creator.email.includes('clerk_user_') ||
        creator.email.endsWith('@fitness.com') ||
        creator.email.endsWith('@marketing.com') ||
        creator.email.endsWith('@lifestyle.com') ||
        creator.email.endsWith('@example.com')
      ) {
        continue;
      }

      try {
        const creatorHandle = creator.full_name ? `${creator.full_name.replace(/^@/, '')}` : 'Creator';
        const emailSubject = `🔥 NEW DROP ALERT! Bag Available inside`;

        const html = renderReusableEmailTemplate({
          to: creator.email,
          subject: '🔥 NEW DROP ALERT! Bag Available inside',
          previewText: `New campaign drop "${campaign.title}" is now live on Kpugi!`,
          headline: 'New Campaign Drop 🚀',
          subtitle: `Yooo ${creatorHandle}! Fresh motion just dropped! "${campaign.title}" is live paying ₦${cpmFormatted}/1k views. Grab your slot before the budget gets cleaned out!`,
          details: [
            { label: 'CAMPAIGN', value: campaign.title },
            { label: 'CPM', value: `₦${cpmFormatted}/1k views`, isMonospace: true },
            { label: 'FORMAT', value: campaign.ad_format || 'Video / Image' },
            ...(channelIconsHtml ? [{ label: 'CHANNELS', value: channelIconsHtml }] : []),
          ],
          noticeText: 'Slots are first-come, first-served. Grab your creatives, post, and lock in your views before the budget cap is reached!',
          cta: {
            label: 'Claim Slot Now',
            url: `${appUrl}${actionUrl}`,
            subtext: 'Open the brief on Kpugi to grab pre-approved captions, assets, and mandatory tags.',
          },
        });

        const emailRes = await sendEmail({
          to: creator.email,
          subject: emailSubject,
          previewText: `New campaign brief "${campaign.title}" is now live.`,
          html,
        });
        console.log('[notifyCreatorsNewCampaign] Creator email dispatch:', { email: creator.email, result: emailRes });
      } catch (e) {
        console.error('[notifyCreatorsNewCampaign] Failed to dispatch email to:', creator.email, e);
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

    const { isSuspended, reason } = checkProfileSuspension(userProfile.profile);
    if (isSuspended) {
      return { success: false, error: `Account suspended (${reason || 'Read-Only Mode'}). Campaign archiving is disabled.` };
    }

    if (!userProfile.advertiserProfile) {
      return { success: false, error: 'Only registered advertisers can archive campaigns.' };
    }

    const advertiserId = userProfile.profile.id;
    const supabase = createAdminClient();

    // Check existing campaign status
    const { data: campaign, error: fetchErr } = await supabase
      .from('campaigns')
      .select('id, title, status, is_featured, total_budget')
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

    // Immutable Brand Audit Trail
    logAuditEvent({
      profileId: advertiserId,
      actorRole: 'advertiser',
      action: AUDIT_ACTIONS.CAMPAIGN_CANCELLED,
      actionCategory: 'campaign',
      targetTable: 'campaigns',
      targetId: campaignId,
      details: `Archived campaign "${campaign.title || campaignId}"`,
      payload: {
        campaign_id: campaignId,
        previous_status: campaign.status,
        new_status: 'archived',
      },
    }).catch((e) => console.error('[Campaign Action] Error logging archive audit:', e));

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

/**
 * Server action to soft-delete a single archived campaign from the user dashboard.
 * Campaigns MUST be archived first before they can be deleted.
 */
export async function deleteArchivedCampaignAction(campaignId: string) {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.profile) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const { isSuspended, reason } = checkProfileSuspension(userProfile.profile);
    if (isSuspended) {
      return { success: false, error: `Account suspended (${reason || 'Read-Only Mode'}). Campaign deletion is disabled.` };
    }

    if (!userProfile.advertiserProfile) {
      return { success: false, error: 'Only registered advertisers can delete campaigns.' };
    }

    const advertiserId = userProfile.profile.id;
    const supabase = createAdminClient();

    // Check existing campaign status
    const { data: campaign, error: fetchErr } = await supabase
      .from('campaigns')
      .select('id, status, requirements')
      .eq('id', campaignId)
      .eq('advertiser_id', advertiserId)
      .single();

    if (fetchErr || !campaign) {
      return { success: false, error: 'Campaign not found or access denied.' };
    }

    if (campaign.status !== 'archived') {
      return { success: false, error: 'Campaign must be archived before it can be deleted from your dashboard.' };
    }

    const updatedReqs = {
      ...(typeof campaign.requirements === 'object' && campaign.requirements !== null ? campaign.requirements : {}),
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    };

    const { error: deleteErr } = await supabase
      .from('campaigns')
      .update({
        deleted: true,
        requirements: updatedReqs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    if (deleteErr) {
      return { success: false, error: `Failed to delete campaign: ${deleteErr.message}` };
    }

    revalidatePath('/b/campaigns');
    revalidatePath('/b/dashboard');
    revalidatePath('/browse');

    return {
      success: true,
      message: 'Campaign deleted from your dashboard. Records preserved in database.',
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server error deleting campaign' };
  }
}

/**
 * Server action to batch delete all archived campaigns from the user dashboard.
 */
export async function deleteAllArchivedCampaignsAction() {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.profile) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    if (!userProfile.advertiserProfile) {
      return { success: false, error: 'Only registered advertisers can delete campaigns.' };
    }

    const advertiserId = userProfile.profile.id;
    const supabase = createAdminClient();

    // Fetch all archived campaigns for this advertiser that are not already deleted
    const { data: archivedList, error: fetchErr } = await supabase
      .from('campaigns')
      .select('id, requirements')
      .eq('advertiser_id', advertiserId)
      .eq('status', 'archived')
      .eq('deleted', false);

    if (fetchErr) {
      return { success: false, error: `Failed to fetch archived campaigns: ${fetchErr.message}` };
    }

    if (!archivedList || archivedList.length === 0) {
      return { success: true, message: 'No archived campaigns to delete.' };
    }

    // Soft-delete all archived campaigns
    for (const item of archivedList) {
      const updatedReqs = {
        ...(typeof item.requirements === 'object' && item.requirements !== null ? item.requirements : {}),
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      };

      await supabase
        .from('campaigns')
        .update({
          deleted: true,
          requirements: updatedReqs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);
    }

    revalidatePath('/b/campaigns');
    revalidatePath('/b/dashboard');
    revalidatePath('/browse');

    return {
      success: true,
      message: `Successfully removed ${archivedList.length} archived campaign(s) from your dashboard.`,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server error deleting archived campaigns' };
  }
}

// Backwards compatibility alias
export const deleteCampaignAction = deleteArchivedCampaignAction;

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

    if (existingCampaign.status === 'archived') {
      return { success: false, error: 'Archived campaigns cannot be edited.' };
    }

    if (existingCampaign.status === 'completed') {
      return { success: false, error: 'Completed campaigns cannot be edited.' };
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

    // Immutable Brand Audit Trail
    logAuditEvent({
      profileId: advertiserId,
      actorRole: 'advertiser',
      action: AUDIT_ACTIONS.CAMPAIGN_UPDATED,
      actionCategory: 'campaign',
      targetTable: 'campaigns',
      targetId: payload.campaignId,
      details: `Updated campaign details for "${payload.title}"`,
      payload: {
        campaign_id: payload.campaignId,
        title: payload.title,
        cpm_rate: payload.cpm_rate,
        total_budget: payload.total_budget,
      },
    }).catch((e) => console.error('[Campaign Action] Error logging update audit:', e));

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
    const configuredModel = process.env.NVIDIA_MODEL;
    const modelName =
      !configuredModel || configuredModel.includes('kimi') || configuredModel.includes('moonshot')
        ? 'meta/llama-3.2-11b-vision-instruct'
        : configuredModel;

    const totalViews = campaignsPayload.reduce((sum, c) => sum + c.views, 0);
    const totalSpent = campaignsPayload.reduce((sum, c) => sum + c.spent, 0);
    const cpv = totalViews > 0 ? totalSpent / totalViews : 0;
    const avgCpm = totalViews > 0 ? (totalSpent / totalViews) * 1000 : 0;

    const fallbackInsights = {
      optimizationTip: `Based on ${campaignsPayload.length} live campaign placement(s), your current effective Cost-Per-View is ₦${cpv.toFixed(2)}. Allocating budget toward higher-throughput channel formats will maximize overall view delivery.`,
      benchmarkComparison: `Your brand's blended CPM of ₦${Math.round(avgCpm).toLocaleString()} is being evaluated against standard Nigeria ad-network benchmarks (₦1,500 - ₦2,000 / 1k views).`,
    };

    if (!nvidiaKey) {
      return {
        success: true,
        hasData: true,
        insights: fallbackInsights,
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
      signal: AbortSignal.timeout(15000),
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
      const errText = await res.text().catch(() => '');
      console.warn('[AI Analytics Insights] NVIDIA AI HTTP notice:', res.status, errText);
      return {
        success: true,
        hasData: true,
        insights: fallbackInsights,
      };
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
    console.warn('[AI Analytics Insights] AI service notice:', error?.message);
    return {
      success: true,
      hasData: true,
      insights: {
        optimizationTip: 'Channel performance is being evaluated across live placements. Continue driving views to generate enriched optimization insights.',
        benchmarkComparison: 'Targeting standard Nigeria ad benchmarks (₦1,500 - ₦2,000 CPM / 1k views).',
      },
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

  const { isSuspended, reason } = checkProfileSuspension(userProfile.profile);
  if (isSuspended) {
    return { success: false, error: `Account suspended (${reason || 'Read-Only Mode'}). Wallet payments are disabled.` };
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

/**
 * Initialize Bachs Hosted Checkout Session for Campaign Funding (Server Action)
 */
export async function initializeBachsCampaignCheckoutAction(params: {
  campaignId?: string;
  campaignTitle?: string;
  totalPayableAmount: number;
  isFeatured?: boolean;
  advertiserEmail?: string;
}) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: 'Unauthorized: Please sign in.' };
  }

  const { createBachsCheckoutSession, generateBachsReference } = await import('@/lib/bachs/checkout');
  const ref = generateBachsReference('KPG-BCH');
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  try {
    const session = await createBachsCheckoutSession({
      amountInNaira: params.totalPayableAmount,
      customerEmail: params.advertiserEmail || userProfile.profile.email || 'advertiser@kpugi.com',
      reference: ref,
      successUrl: `${appUrl}/b/campaigns/new?draftId=${params.campaignId || ''}&reference=${ref}&processor=bachs&step=5`,
      cancelUrl: `${appUrl}/b/campaigns/new?draftId=${params.campaignId || ''}&cancelled=true`,
      metadata: {
        campaignId: params.campaignId,
        campaignTitle: params.campaignTitle,
        isFeatured: Boolean(params.isFeatured),
        amount: params.totalPayableAmount,
        processor: 'bachs',
      },
    });

    if (session && session.checkout_url) {
      return {
        success: true,
        checkout_url: session.checkout_url,
        checkout_id: session.checkout_id,
        reference: session.reference || ref,
      };
    }

    return { success: false, error: 'Failed to create Bachs checkout session.' };
  } catch (err: any) {
    console.error('[initializeBachsCampaignCheckoutAction Error]:', err);
    return { success: false, error: err?.message || 'Error connecting to Bachs payment gateway.' };
  }
}


