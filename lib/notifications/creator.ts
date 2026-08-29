import { triggerNotification } from '@/lib/knock/notify';
import { sendEmail, renderReusableEmailTemplate } from '@/lib/resend/send-email';
import { createAdminClient } from '@/lib/supabase/server';

export async function notifyCreatorWelcome({
  clerkId,
  email,
  name,
  profileId,
}: {
  clerkId: string;
  email: string;
  name: string;
  profileId?: string;
}) {
  await triggerNotification({
    workflowKey: 'creator-welcome',
    recipients: [clerkId],
    data: { 
      name,
      action_url: '/c/campaigns',
    },
    profileId,
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const cleanName = name ? name.replace(/^@/, '') : 'Creator';

  const html = renderReusableEmailTemplate({
    to: email,
    subject: `Welcome to the Squad 🚀 Let's Get This Bag!`,
    previewText: `Sync your socials, claim drops, and start monetizing views today.`,
    headline: 'Welcome to Kpugi 🎉 We outside!',
    subtitle: `Yooo ${cleanName}! Your creator account is officially active. Sync your social handles, claim hot campaign drops, and turn your views into real cash. No cap.`,
    details: [
      { label: 'STEP 1', value: 'Connect TikTok, Instagram or X handle' },
      { label: 'STEP 2', value: 'Claim slots in active brand campaign drops' },
      { label: 'STEP 3', value: 'Post brief creatives & lock in your live link' },
      { label: 'STEP 4', value: 'Get paid per 1,000 verified views automatically' },
    ],
    cta: {
      label: 'Explore Active Campaigns',
      url: `${appUrl}/c/campaigns`,
      subtext: 'Browse open campaigns and claim your spot before budget caps fill up.',
    },
  });

  await sendEmail({
    to: email,
    subject: `Welcome to the Squad 🚀 Let's Get This Bag!`,
    previewText: 'Start monetizing your short-form video views today.',
    html,
  });
}

export async function notifyCreatorSocialConnected({
  clerkId,
  email,
  platform,
  handle,
  profileId,
}: {
  clerkId: string;
  email: string;
  platform: string;
  handle: string;
  profileId?: string;
}) {
  await triggerNotification({
    workflowKey: 'social-connected',
    recipients: [clerkId],
    data: { 
      platform, 
      handle,
      action_url: '/c/accounts',
    },
    profileId,
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const cleanHandle = handle ? `@${handle.replace(/^@/, '')}` : '@handle';

  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Handle Verified & Locked 🔓 We\'re live!',
    previewText: `Your ${platform.toUpperCase()} profile is verified and ready.`,
    headline: 'Handle Verified & Locked 🔓',
    subtitle: `Yooo ${cleanHandle}! Your ${platform.toUpperCase()} profile passed the vibe check and is officially verified. You're unlocked and ready to claim top-tier campaign drops!`,
    details: [
      { label: 'PLATFORM', value: platform.toUpperCase() },
      { label: 'CONNECTED HANDLE', value: cleanHandle },
    ],
    cta: {
      label: 'Browse Matching Campaigns',
      url: `${appUrl}/c/campaigns`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Handle Verified & Locked 🔓 We\'re live!',
    html,
  });
}

export async function notifyCreatorJoinedCampaign({
  clerkId,
  email,
  campaignTitle,
  reservedAmount,
  campaignId,
  profileId,
}: {
  clerkId: string;
  email?: string;
  campaignTitle: string;
  reservedAmount: number;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/c/campaigns/${campaignId}` : '/c/dashboard';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  
  await triggerNotification({
    workflowKey: 'campaign-joined',
    recipients: [clerkId],
    data: {
      campaignTitle,
      reservedAmount: `₦${reservedAmount.toLocaleString()}`,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });

  if (email && !email.includes('clerk_user_') && !email.endsWith('@example.com')) {
    const html = renderReusableEmailTemplate({
      to: email,
      subject: 'Slot Secured 🔒 Let\'s Cook!',
      previewText: `Your budget slot for "${campaignTitle}" is locked in escrow.`,
      headline: 'Slot Secured 🔒 Let\'s Cook!',
      subtitle: `Major W! You just snagged a slot for "${campaignTitle}". Your payout budget of ₦${reservedAmount.toLocaleString()} is safely locked in escrow waiting for your views to pop off.`,
      details: [
        { label: 'CAMPAIGN', value: campaignTitle },
        { label: 'RESERVED PAYOUT', value: `₦${reservedAmount.toLocaleString()}`, isMonospace: true },
      ],
      noticeText: 'Download the creative assets, grab the caption details, post on your socials, and drop your live link on the dashboard to start tracking views.',
      cta: {
        label: 'Open Creator Workspace',
        url: `${appUrl}${actionUrl}`,
      },
    });

    await sendEmail({
      to: email,
      subject: 'Slot Secured 🔒 Let\'s Cook!',
      html,
    });
  }
}

export async function notifyCreatorPostSubmitted({
  clerkId,
  email,
  campaignTitle,
  postUrl,
  campaignId,
  profileId,
}: {
  clerkId: string;
  email: string;
  campaignTitle: string;
  postUrl: string;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/c/campaigns/${campaignId}` : '/c/dashboard';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  await triggerNotification({
    workflowKey: 'post-submitted',
    recipients: [clerkId],
    data: { 
      campaignTitle, 
      postUrl,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });

  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Link Locked In 📌 Motion Detected!',
    previewText: `Your post for "${campaignTitle}" is now being actively tracked.`,
    headline: 'Link Locked In 📌 Motion Detected!',
    subtitle: `Link dropped! We received your live post for "${campaignTitle}". Our automated scrapers are now tracking your views in real-time. Let it cook 🔥`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'POST LINK', value: postUrl },
    ],
    noticeText: 'Keep your post public for the full duration so our automated view checks can verify your view milestones.',
    cta: {
      label: 'Track Views on Dashboard',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Link Locked In 📌 Motion Detected!',
    previewText: 'Your live post URL was successfully recorded for performance tracking.',
    html,
  });
}

export async function notifyCreatorVerificationPassed({
  clerkId,
  email,
  campaignTitle,
  trackedViews,
  payoutAmount,
  campaignId,
  profileId,
}: {
  clerkId: string;
  email: string;
  campaignTitle: string;
  trackedViews: number;
  payoutAmount: number;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/c/campaigns/${campaignId}` : '/c/dashboard';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  await triggerNotification({
    workflowKey: 'verification-passed',
    recipients: [clerkId],
    data: {
      campaignTitle,
      trackedViews: trackedViews.toLocaleString(),
      payoutAmount: `₦${payoutAmount.toLocaleString()}`,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });

  const formattedPayout = `₦${payoutAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const html = renderReusableEmailTemplate({
    to: email,
    subject: `BAG SECURED! 💰 ${trackedViews.toLocaleString()} Views Cleared!`,
    previewText: `Your post verified ${trackedViews.toLocaleString()} views! Earnings added to your wallet.`,
    headline: 'Bag Secured! 🎉',
    subtitle: `Yooo! You went crazy on this one 🔥 Your post for "${campaignTitle}" just passed ${trackedViews.toLocaleString()} verified views. Funds have officially landed in your creator wallet!`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'VERIFIED VIEWS', value: `${trackedViews.toLocaleString()} views`, isMonospace: true },
      { label: 'EARNINGS', value: formattedPayout, isMonospace: true },
    ],
    cta: {
      label: 'View Wallet & Cash Out',
      url: `${appUrl}/c/wallet`,
      subtext: 'Withdraw straight to your Nigerian bank account anytime.',
    },
  });

  await sendEmail({
    to: email,
    subject: `BAG SECURED! 💰 ${trackedViews.toLocaleString()} Views Cleared!`,
    previewText: `Your post verified ${trackedViews.toLocaleString()} views! Earnings added to your wallet.`,
    html,
  });
}

export async function notifyCreatorVerificationFailed({
  clerkId,
  email,
  campaignTitle,
  failureReason,
  campaignId,
  profileId,
}: {
  clerkId: string;
  email: string;
  campaignTitle: string;
  failureReason: string;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/c/campaigns/${campaignId}` : '/c/dashboard';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  await triggerNotification({
    workflowKey: 'verification-failed',
    recipients: [clerkId],
    data: { 
      campaignTitle, 
      failureReason,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });

  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Vibe Check Needed ⚠️ Hold up...',
    previewText: `We ran into an issue verifying your post for "${campaignTitle}".`,
    headline: 'Vibe Check Needed ⚠️',
    subtitle: `Yooo! We ran into a slight hiccup verifying your submission for "${campaignTitle}". Don't stress though—check your dashboard to fix it real quick.`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'REASON', value: failureReason },
    ],
    noticeText: 'Common causes include: failing to reach the minimum view count floor, making the post private or deleted, or unlinking account permissions.',
    cta: {
      label: 'Review on Dashboard',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Vibe Check Needed ⚠️ Hold up...',
    html,
  });
}

export async function notifyCreatorPayoutReleased({
  clerkId,
  email,
  campaignTitle,
  amount,
  newBalance,
  campaignId,
  profileId,
}: {
  clerkId: string;
  email: string;
  campaignTitle: string;
  amount: number;
  newBalance: number;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/c/campaigns/${campaignId}` : '/c/dashboard';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  await triggerNotification({
    workflowKey: 'payout-released',
    recipients: [clerkId],
    data: {
      campaignTitle,
      amount: `₦${amount.toLocaleString()}`,
      newBalance: `₦${newBalance.toLocaleString()}`,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });

  const formattedAmount = `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formattedBalance = `₦${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Funds Hit Different 🤑 Wallet Credited!',
    previewText: `${formattedAmount} added to your creator wallet!`,
    headline: 'Yooo! You Got Paid 💰',
    subtitle: `Yooo! That content paid off! ₦${formattedAmount} from "${campaignTitle}" was just deposited into your creator wallet. Time to cash out or stack it up 💸`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'AMOUNT CREDITED', value: formattedAmount, isMonospace: true },
      { label: 'UPDATED WALLET BALANCE', value: formattedBalance, isMonospace: true },
    ],
    cta: {
      label: 'View Wallet & Cash Out',
      url: `${appUrl}/c/wallet`,
      subtext: 'Withdraw straight to your Nigerian bank account anytime.',
    },
  });

  await sendEmail({
    to: email,
    subject: 'Funds Hit Different 🤑 Wallet Credited!',
    html,
  });
}

export async function notifyCreatorWithdrawalCompleted({
  clerkId,
  email,
  amount,
  bankName,
  accountMasked,
  reference,
  profileId,
}: {
  clerkId: string;
  email: string;
  amount: number;
  bankName: string;
  accountMasked: string;
  reference: string;
  profileId?: string;
}) {
  await triggerNotification({
    workflowKey: 'withdrawal-completed',
    recipients: [clerkId],
    data: {
      amount: `₦${amount.toLocaleString()}`,
      bankName,
      accountMasked,
      reference,
      action_url: '/c/wallet',
    },
    profileId,
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const formattedAmount = `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Cashout Complete 💸 Bag In Direct Deposit!',
    previewText: `Your withdrawal of ${formattedAmount} is on its way.`,
    headline: 'Cashout Complete 💸',
    subtitle: `Yooo! ${formattedAmount} is heading straight to your bank account right now. Hard work pays off—go enjoy your gains! 🔥`,
    details: [
      { label: 'DESTINATION BANK', value: bankName },
      { label: 'ACCOUNT NUMBER', value: accountMasked, isMonospace: true },
      { label: 'AMOUNT', value: formattedAmount, isMonospace: true },
      { label: 'REFERENCE', value: reference, isMonospace: true },
    ],
    cta: {
      label: 'View Wallet History',
      url: `${appUrl}/c/wallet`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Cashout Complete 💸 Bag In Direct Deposit!',
    html,
  });
}

export async function notifyJoinedCreatorsCampaignCompleted({
  campaignTitle,
  campaignId,
  supabaseClient,
}: {
  campaignTitle: string;
  campaignId: string;
  supabaseClient?: any;
}) {
  try {
    const supabase = supabaseClient || createAdminClient();
    const { data: submissions, error: subErr } = await supabase
      .from('submissions')
      .select('creator_id')
      .eq('campaign_id', campaignId);

    if (subErr) {
      console.error('[Notification Helper] Error fetching submissions for completed campaign:', subErr);
      return;
    }

    if (!submissions || submissions.length === 0) return;

    const creatorIds = Array.from(new Set(submissions.map((s: any) => s.creator_id).filter(Boolean)));
    if (creatorIds.length === 0) return;

    const { data: profiles, error: profErr } = await supabaseClient
      .from('profiles')
      .select('id, clerk_id, email, full_name')
      .in('id', creatorIds);

    if (profErr) {
      console.error('[Notification Helper] Error fetching creator profiles for completed campaign:', profErr);
      return;
    }

    if (!profiles || profiles.length === 0) return;

    const actionUrl = `/c/dashboard`;
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
    const seenEmails = new Set<string>();

    for (const profile of profiles) {
      if (!profile || !profile.email || seenEmails.has(profile.email)) continue;
      seenEmails.add(profile.email);

      // 1. In-App Notification
      try {
        await triggerNotification({
          workflowKey: 'campaign-completed',
          recipients: [profile.clerk_id || profile.id],
          data: {
            campaignTitle,
            campaignId,
            action_url: actionUrl,
          },
          profileId: profile.id,
        });
      } catch (err) {
        console.error('[Notification Helper] Error sending in-app notification to creator:', err);
      }

      // 2. Email Notification
      try {
        const cleanName = profile.full_name ? profile.full_name.replace(/^@/, '') : 'Creator';
        const html = renderReusableEmailTemplate({
          to: profile.email,
          subject: `Campaign Wrapped 🏁 Drop Complete!`,
          previewText: `The campaign "${campaignTitle}" has officially wrapped up.`,
          headline: 'Campaign Wrapped 🏁',
          subtitle: `Yooo ${cleanName}! The "${campaignTitle}" campaign drop has officially wrapped up. Big shoutout for bringing the heat! Any remaining view tracking will finish automatically.`,
          details: [
            { label: 'CAMPAIGN', value: campaignTitle },
          ],
          noticeText: 'If you have already posted and submitted your live link, view tracking and automatic settlements will continue until your 24h grace period finishes.',
          cta: {
            label: 'Open Creator Dashboard',
            url: `${appUrl}${actionUrl}`,
          },
        });

        await sendEmail({
          to: profile.email,
          subject: `Campaign Wrapped 🏁 Drop Complete!`,
          html,
        });
      } catch (err) {
        console.error('[Notification Helper] Error sending email to creator:', err);
      }
    }
  } catch (err) {
    console.error('[Notification Helper] Error in notifyJoinedCreatorsCampaignCompleted:', err);
  }
}
