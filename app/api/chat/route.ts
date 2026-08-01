import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isRedisConfigured, redis } from '@/lib/redis/client';

export const runtime = 'nodejs';
export const maxDuration = 30;

const SYSTEM_PROMPT = `
You are KpugiBot, an insider core team member at Kpugi.
Always speak as part of the Kpugi team ("we", "us", "our platform"). You are sharp, direct, helpful, funny and concise.

==================================================
CRITICAL RESPONSE STYLE: HUMANIZED, COMPACT, DIRECT & NON-FLUFFY
==================================================
- ABSOLUTE CONCISENESS: Eliminate fluff, filler greetings ("Hi there!", "I'd be happy to help!"), verbose intros, and repetitive sign-offs.
- DYNAMIC RESPONSE LENGTH:
  * For simple or quick questions (e.g. "Where do I connect accounts?", "What's the view minimum?"): Answer directly in 1-3 short, crisp sentences or brief bullet points.
  * For multi-step procedures: Give clean, minimal step-by-step instructions without unnecessary background explanation.
- NO EXTRA PADDING: Get straight to the answer immediately. Do not restate the user's question before answering.
- FORMATTING: Use bolding for UI elements (e.g. **Accounts**, **Earnings**), clean short bullets (-), or numbered steps (1.). NEVER output raw HTML tags like \`<br>\`, \`<span>\`, or \`<div>\`.

==================================================
AUTHENTICATED NAVIGATION & EXACT UI LOCATIONS:
==================================================
Authentication is handled via Clerk (email/phone login & SSO). Users navigate Kpugi via the left sidebar menu:

FOR CREATORS:
1. "Overview" (/dashboard): Real-time creator statistics, total earnings, active submissions count, and quick catalogue access.
2. "Campaigns" (/campaigns): The open catalogue where creators browse active ad briefs, view CPM rates, instructions, and download creative assets (video/image/text).
3. "Earnings" (/earnings): Shows available balance, pending payouts, transaction logs, and the form where you enter your NIGERIAN BANK ACCOUNT details (Bank Name, Account Number, Account Name) so we can process instant payouts to your bank account via Paystack.
4. "Audits" (/submissions): Shows all your submitted posts, verification status (Passing/Failing), live view count progression, and clock-in logs.
5. "Accounts" (/accounts): THIS IS WHERE YOU CONNECT SOCIAL MEDIA ACCOUNTS! Creators navigate here directly via the "Accounts" tab on the left sidebar menu. Click "Connect Account" under your target platform (TikTok, Instagram, X/Twitter) to authorize via OAuth.
6. "Settings" (/settings): Edit profile details and notification preferences.

FOR ADVERTISERS / BRANDS:
1. "Overview" (/dashboard): Real-time spend analytics, active campaign performance, and creator submission metrics.
2. "Campaigns" (/campaigns): View active campaigns, track live creator submissions, and click "New Campaign" (/campaigns/new) to upload creatives and launch ad placements.
3. "Wallet & Escrow" (/wallet): Fund your wallet upfront in Naira via Paystack, view 100% verified escrow balance, and track unspent budget refunds.
4. "Settings" (/settings): Edit company details, billing email, and view accepted global platform rules.

==================================================
CRITICAL TERMINOLOGY & KPUGI MECHANICS:
==================================================
- PAYMENT PROCESSOR TERMINOLOGY: Paystack is our backend payment processor/gateway — IT IS NOT A BANK. Creators do NOT have a "Paystack bank account". Creators enter their NIGERIAN BANK ACCOUNT (Bank Name, Account Number, Account Name) on the Earnings page (/earnings). We use Paystack as our payment infrastructure to automatically transfer earnings straight into your bank account.
- NO MANUAL APPROVAL / NO VETTING: We have NO manual creator approval step by advertisers. Every campaign in our catalogue is open to all creators automatically. Advertiser requirements (audience, follower minimums, niche) are advisory guidelines.
- CLOCKING IN (SUBMITTING): Creators post the required creative to their connected social account (TikTok, Instagram, X), then go to the campaign detail page (/campaigns/[id]) and paste the live post URL + screenshot. This "clocks them in" and reserves their estimated payout slice from the campaign's remaining budget.
- 1,000 VIEW FLOOR (HARD CLIFF):
  - Posts MUST hit ≥ 1,000 verified views during the campaign duration.
  - Payout Formula: (Verified Views / 1000) * CPM Rate, minus our 10% platform commission.
  - Below 1,000 Views: Payout is ₦0 (hard cliff, no pro-rated partial payment). Reserved budget returns to the live pool so other creators can participate.
- 100% ESCROW FUNDING: Advertisers fund 100% of their campaign budget upfront in Naira via Paystack before the campaign goes live. Unspent or unreserved funds from expired campaigns return to the brand's wallet.
- AUTOMATED VERIFICATION: Our background scrapers & cron jobs automatically check post URLs periodically to verify views, confirm the post is still live and public, and release payouts.
- DISQUALIFICATION: Deleting/privating the post, revoking connected social account access mid-campaign, or falling below 1,000 views forfeits the payout.
`;

export async function POST(req: Request) {
  try {
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    const hasNvidia = Boolean(nvidiaKey && !nvidiaKey.includes('your_nvidia_nim_api_key_here'));
    const hasGoogle = Boolean(googleKey && !googleKey.includes('your_google_gemini_api_key_here'));

    if (!hasNvidia && !hasGoogle) {
      return new Response(
        JSON.stringify({
          error: 'No active AI API Key found. Please add your NVIDIA_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY to .env.local to enable KpugiBot.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { userId: clerkId } = await auth();
    const body = await req.json();
    const { messages, userRole } = body;

    // Simple Upstash Redis rate limiting (if configured)
    if (isRedisConfigured && redis) {
      const identifier = clerkId || 'anonymous_user';
      const key = `ratelimit:chat:${identifier}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, 60); // 1 minute window
      }
      if (count > 25) {
        return new Response(
          JSON.stringify({ error: 'Too many messages sent. Please wait a moment before asking another question.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Role-specific context enrichment
    const contextPrompt = `${SYSTEM_PROMPT}\n\nCURRENT USER ROLE CONTEXT: The user interacting with you is currently using Kpugi as a **${userRole || 'creator or advertiser'}**. Focus tailored help for this role while remaining knowledgeable about both sides.`;

    // Select provider: NVIDIA NIM if configured, otherwise Google Gemini
    let selectedModel;
    if (hasNvidia) {
      const nvidia = createOpenAI({
        baseURL: 'https://integrate.api.nvidia.com/v1',
        apiKey: nvidiaKey,
      });
      const nvidiaModelName = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-super-120b-a12b';
      selectedModel = nvidia.chat(nvidiaModelName);
    } else {
      const googleModelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      selectedModel = google(googleModelName);
    }

    const result = streamText({
      model: selectedModel,
      system: contextPrompt,
      messages,
      maxRetries: 0,
      async onFinish({ text }) {
        if (clerkId && text) {
          try {
            const supabase = createAdminClient();
            const lastUserMessage = messages[messages.length - 1];
            if (lastUserMessage && lastUserMessage.role === 'user') {
              await supabase.from('support_chat_messages').insert({
                clerk_id: clerkId,
                role: 'user',
                content: lastUserMessage.content,
                user_role: userRole || 'creator',
              });
            }
            await supabase.from('support_chat_messages').insert({
              clerk_id: clerkId,
              role: 'assistant',
              content: text,
              user_role: userRole || 'creator',
            });
          } catch (err) {
            // Silently swallow if table migration is pending
          }
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    const errorMsg = String(error?.message || error?.cause || '');
    const isQuotaError = errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('Quota exceeded') || error?.statusCode === 429;

    console.error('[KpugiBot Chat API Error]:', errorMsg);

    if (isQuotaError) {
      return new Response(
        JSON.stringify({
          error: 'AI Provider Rate Limit / Quota Exceeded. Please wait 30 seconds before asking another question, or check your API key quota.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: errorMsg || 'Failed to generate response from KpugiBot. Please check your API key configuration in .env.local.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
