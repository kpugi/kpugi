'use server';

import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail, renderReusableEmailTemplate, resend } from '@/lib/resend/send-email';

export interface WaitlistSubmissionInput {
  role: 'creator' | 'brand';
  fullName: string;
  workEmail: string;
  creatorHandle?: string;
  primaryPlatform?: string;
  monthlyReach?: string;
  companyWebsite?: string;
  adBudget?: string;
  campaignGoals?: string;
  accessCode?: string;
}

export async function submitWaitlistAction(input: WaitlistSubmissionInput) {
  const { role, fullName, workEmail } = input;

  if (!fullName?.trim()) {
    return { success: false, error: 'Full legal name or company name is required.' };
  }

  if (!workEmail?.trim() || !workEmail.includes('@')) {
    return { success: false, error: 'A valid email address is required.' };
  }

  const cleanEmail = workEmail.trim().toLowerCase();
  const cleanName = fullName.trim();
  const VIP_PASSCODE = 'KPUGI-VIP-20NOV';

  try {
    const supabase = createAdminClient();

    // 1. Insert or update entry in Supabase waitlist_submissions
    const { error: dbError } = await supabase.from('waitlist_submissions').insert({
      role: role === 'brand' ? 'brand' : 'creator',
      full_name: cleanName,
      work_email: cleanEmail,
      creator_handle: input.creatorHandle?.trim() || null,
      primary_platform: input.primaryPlatform || null,
      monthly_reach: input.monthlyReach || null,
      company_website: input.companyWebsite?.trim() || null,
      ad_budget: input.adBudget || null,
      campaign_goals: input.campaignGoals || null,
      passcode: VIP_PASSCODE,
    });

    if (dbError) {
      console.warn('[submitWaitlistAction] DB insert warning (table might need migration):', dbError.message);
    }

    // 2. Add to Resend Audience if configured
    if (resend) {
      const audienceId = process.env.RESEND_AUDIENCE_ID || '';
      if (audienceId) {
        try {
          await resend.contacts.create({
            email: cleanEmail,
            firstName: cleanName.split(' ')[0] || cleanName,
            lastName: cleanName.split(' ').slice(1).join(' ') || '',
            unsubscribed: false,
            audienceId: audienceId,
          });
        } catch (resendErr: any) {
          console.warn('[submitWaitlistAction] Resend contact creation note:', resendErr?.message || resendErr);
        }
      }
    }

    // 3. Send VIP Confirmation Email with Launch Passcode & Link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';
    const accessUrl = `${appUrl}/browse?code=${VIP_PASSCODE}`;

    try {
      const confirmationHtml = renderReusableEmailTemplate({
        to: cleanEmail,
        subject: `🎟️ VIP ACCESS CONFIRMED: Your Kpugi Launch Pass #${Math.floor(2800 + Math.random() * 150)}`,
        headline: 'YOUR VIP LAUNCH PASS IS ACTIVE! ⚡',
        subtitle: `Welcome aboard, ${cleanName}. You are prioritized in Tier-1 for the official November 20th launch.`,
        cardTitle: 'Early Access Credentials',
        details: [
          { label: 'Role Profile', value: role === 'brand' ? 'Brand / Advertiser' : 'Verified Creator / Clipper' },
          { label: 'Registered Email', value: cleanEmail, isMonospace: true },
          { label: 'Exclusive Passcode', value: VIP_PASSCODE, isMonospace: true },
          {
            label: 'Launch Perk',
            value:
              role === 'brand'
                ? '0% Platform Fees for 90 Days'
                : '+₦15,000 Escrow Payout Bounty',
          },
          { label: 'Custody Rail', value: 'Stanbic IBTC Tripartite Custody' },
        ],
        noticeText:
          'Your credentials grant priority invite rights on Nov 19th before public mainnet opening. To preview the live environment immediately, use your exclusive unlock link below.',
        cta: {
          label: 'Unlock Early Preview →',
          url: accessUrl,
        },
      });

      await sendEmail({
        to: cleanEmail,
        subject: `🎟️ VIP ACCESS CONFIRMED: Your Kpugi Launch Pass #${Math.floor(2800 + Math.random() * 150)}`,
        html: confirmationHtml,
      });
    } catch (emailErr) {
      console.warn('[submitWaitlistAction] Email dispatch note:', emailErr);
    }

    // 4. Set VIP access cookie so the submitter can browse early if they choose
    try {
      const cookieStore = await cookies();
      cookieStore.set('kpugi_vip_access', 'true', {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      });
    } catch (cErr) {
      console.warn('[submitWaitlistAction] Cookie set warning:', cErr);
    }

    return {
      success: true,
      passcode: VIP_PASSCODE,
      spotNumber: 2842 + Math.floor(Math.random() * 12),
    };
  } catch (err: any) {
    console.error('[submitWaitlistAction] Error:', err);
    return {
      success: false,
      error: err.message || 'Failed to submit waitlist registration. Please try again.',
    };
  }
}

export async function verifyVipPasscodeAction(code: string) {
  const cleanCode = code?.trim().toUpperCase();
  const VALID_CODES = ['KPUGI-VIP-20NOV', 'KPUGI-LAUNCH-2026', 'STANBIC-ESCROW-VIP'];

  if (VALID_CODES.includes(cleanCode)) {
    try {
      const cookieStore = await cookies();
      cookieStore.set('kpugi_vip_access', 'true', {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'Invalid VIP access code. Please check your invitation email.' };
}
