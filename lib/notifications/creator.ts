import { triggerNotification } from '@/lib/knock/notify';
import { sendEmail, renderReusableEmailTemplate } from '@/lib/resend/send-email';

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
    subject: 'Welcome to Kpugi 🚀',
    previewText: 'Start monetizing your short-form video views today.',
    headline: 'Welcome to Kpugi 🎉',
    subtitle: `Yooo ${cleanName}!, your creator account is officially live. Connect your handles, claim campaign drops, and get paid per 1,000 verified views.`,
    details: [
      { label: 'STEP 1', value: 'Connect TikTok, Instagram or X handle' },
      { label: 'STEP 2', value: 'Claim slots in active brand campaigns' },
      { label: 'STEP 3', value: 'Post brief creatives & lock in your live link' },
      { label: 'STEP 4', value: 'Get paid per 1,000 verified views' },
    ],
    cta: {
      label: 'Explore Active Campaigns',
      url: `${appUrl}/c/campaigns`,
      subtext: 'Browse open campaigns and claim your spot before budget caps fill up.',
    },
  });

  await sendEmail({
    to: email,
    subject: 'Welcome to Kpugi 🚀',
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
    subject: 'Handle Connected & Verified ✅',
    previewText: `Your ${platform.toUpperCase()} profile is verified and ready.`,
    headline: 'Handle Connected & Verified ✅',
    subtitle: `Yooo ${cleanHandle}!, your ${platform.toUpperCase()} profile is now verified and active. You're all set to claim campaigns matching your tier.`,
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
    subject: 'Handle Connected & Verified ✅',
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
  email: string;
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

  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Campaign Slot Secured! 🔒',
    previewText: `Your budget slot for "${campaignTitle}" is locked in.`,
    headline: 'Campaign Slot Secured! 🔒',
    subtitle: `Awesome!, you've successfully reserved your slot for "${campaignTitle}". Your payout budget of ₦${reservedAmount.toLocaleString()} is locked in escrow.`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'RESERVED PAYOUT', value: `₦${reservedAmount.toLocaleString()}`, isMonospace: true },
    ],
    noticeText: 'Please download the creative assets, copy the caption copy, post on your social handles, and submit your live link on the dashboard to trigger view counting and verification.',
    cta: {
      label: 'Open Creator Workspace',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Campaign Slot Secured! 🔒',
    html,
  });
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
    subject: 'Post Link Locked In 📌',
    previewText: `Your post for "${campaignTitle}" is now being tracked.`,
    headline: 'Post Link Locked In 📌',
    subtitle: `Yooo!, your submission for "${campaignTitle}" was received and is now being actively monitored by our scrapers.`,
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
    subject: 'Post Link Locked In 📌',
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
    subject: 'Bag Secured! 🎉',
    previewText: `Your post verified ${trackedViews.toLocaleString()} views! Earnings added to your wallet.`,
    headline: 'Bag Secured! 🎉',
    subtitle: `Yooo!, congratulations! Your post for "${campaignTitle}" hit the view milestone with ${trackedViews.toLocaleString()} verified views.`,
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
    subject: 'Bag Secured! 🎉',
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
    subject: 'Verification Check Needed ⚠️',
    previewText: `We ran into an issue verifying your post for "${campaignTitle}".`,
    headline: 'Verification Check Needed ⚠️',
    subtitle: `Yooo!, we could not verify your submission on "${campaignTitle}".`,
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
    subject: 'Verification Check Needed ⚠️',
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
    subject: 'Yooo! You Got Paid 💰',
    previewText: `${formattedAmount} added to your wallet!`,
    headline: 'Yooo! You Got Paid 💰',
    subtitle: `Yooo!, your video submission for "${campaignTitle}" passed verification and funds just landed in your creator wallet.`,
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
    subject: 'Yooo! You Got Paid 💰',
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
    subject: 'Cashout Complete 💸',
    previewText: `Your withdrawal of ${formattedAmount} is on its way.`,
    headline: 'Cashout Complete 💸',
    subtitle: `Yooo!, your withdrawal request of ${formattedAmount} has been processed via Paystack and sent straight to your bank account.`,
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
    subject: 'Cashout Complete 💸',
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
  supabaseClient: any;
}) {
  try {
    const { data: submissions, error } = await supabaseClient
      .from('submissions')
      .select('profiles(id, clerk_id, email, full_name)')
      .eq('campaign_id', campaignId);

    if (error || !submissions || submissions.length === 0) return;

    const actionUrl = `/c/dashboard`;
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
    const seenEmails = new Set<string>();

    for (const sub of submissions) {
      const profile = sub.profiles as any;
      if (!profile || !profile.email || seenEmails.has(profile.email)) continue;
      seenEmails.add(profile.email);

      // 1. In-App Notification
      try {
        await triggerNotification({
          workflowKey: 'campaign-completed-creator',
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
        const html = renderReusableEmailTemplate({
          to: profile.email,
          subject: `Campaign Concluded: ${campaignTitle} 🏁`,
          previewText: `The campaign "${campaignTitle}" has ended.`,
          headline: 'Campaign Concluded 🏁',
          subtitle: `Hi ${profile.full_name || 'Creator'}, the campaign "${campaignTitle}" has ended and submissions are now closed.`,
          details: [
            { label: 'CAMPAIGN', value: campaignTitle },
          ],
          noticeText: 'If you have already posted and submitted your live link, view tracking and automatic settlements will continue until your 24h grace period finishes.',
          cta: {
            label: 'Open Dashboard',
            url: `${appUrl}${actionUrl}`,
          },
        });

        await sendEmail({
          to: profile.email,
          subject: `Campaign Concluded: ${campaignTitle} 🏁`,
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
