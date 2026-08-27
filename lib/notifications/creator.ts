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
  const html = renderReusableEmailTemplate({
    to: email,
    subject: `Welcome to Kpugi, ${name}! 🚀 Let's get that bag`,
    previewText: 'Start monetizing your short-form video views today.',
    icon: 'star',
    headline: `Welcome to Kpugi, ${name}! 🎉`,
    subtitle: `Your creator account is officially live. Connect your handles, claim campaign drops, and start earning per 1,000 verified views.`,
    details: [
      { label: 'STEP 1', value: 'Connect TikTok, Instagram or X handle' },
      { label: 'STEP 2', value: 'Claim slots in active brand campaigns' },
      { label: 'STEP 3', value: 'Post brief creatives & submit your link' },
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
    subject: `Welcome to Kpugi, ${name}! 🚀 Let's get that bag`,
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
  const cleanHandle = `@${handle.replace(/^@/, '')}`;

  const html = renderReusableEmailTemplate({
    to: email,
    subject: `Handle Connected: ${cleanHandle} (${platform.toUpperCase()}) ✅`,
    previewText: `Your ${platform.toUpperCase()} profile is verified and ready.`,
    icon: 'check',
    headline: 'Handle Connected & Verified ✅',
    subtitle: `Your ${platform.toUpperCase()} account ${cleanHandle} has been successfully linked to Kpugi. You can now claim brand campaigns matching your follower tier.`,
    details: [
      { label: 'PLATFORM', value: platform.toUpperCase() },
      { label: 'CONNECTED HANDLE', value: cleanHandle },
      { label: 'STATUS', value: 'Connected', statusBadge: { text: 'Active', variant: 'green' } },
    ],
    cta: {
      label: 'Browse Matching Campaigns',
      url: `${appUrl}/c/campaigns`,
    },
  });

  await sendEmail({
    to: email,
    subject: `Handle Connected: ${cleanHandle} (${platform.toUpperCase()}) ✅`,
    html,
  });
}

export async function notifyCreatorJoinedCampaign({
  clerkId,
  campaignTitle,
  reservedAmount,
  campaignId,
  profileId,
}: {
  clerkId: string;
  campaignTitle: string;
  reservedAmount: number;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/c/campaigns/${campaignId}` : '/c/dashboard';
  
  // In-app notification
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
    subject: `Post Link Locked In! 📌 "${campaignTitle}"`,
    previewText: `Your post for "${campaignTitle}" is now being tracked.`,
    icon: 'check',
    headline: 'Post Link Locked In 📌',
    subtitle: `Your submission for "${campaignTitle}" was received and is now being actively monitored by our automated scrapers.`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'SUBMITTED LINK', value: postUrl },
      { label: 'STATUS', value: 'Tracking Views', statusBadge: { text: 'Tracking', variant: 'blue' } },
    ],
    noticeText: 'Reminder: Keep your post public and published for the full duration so our automated checks can verify your view milestones.',
    cta: {
      label: 'Track Progress on Dashboard',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: `Post Link Locked In! 📌 "${campaignTitle}"`,
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
    subject: `Bag Secured! 🎉 You earned ${formattedPayout} on "${campaignTitle}"`,
    previewText: `Your post verified ${trackedViews.toLocaleString()} views! Earnings added to your wallet.`,
    icon: 'star',
    headline: 'Verification Passed! Bag Secured 🌟',
    subtitle: `Congratulations! Your post for "${campaignTitle}" crushed the view goal with ${trackedViews.toLocaleString()} verified views.`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'VERIFIED VIEWS', value: `${trackedViews.toLocaleString()} views`, isMonospace: true },
      { label: 'NET PAYOUT', value: formattedPayout, isMonospace: true },
      { label: 'STATUS', value: 'Verified & Paid', statusBadge: { text: 'Paid', variant: 'green' } },
    ],
    highlightBar: {
      label: 'Credited to Wallet',
      value: formattedPayout,
      bgColor: '#10B981',
    },
    cta: {
      label: 'View Wallet & Cash Out',
      url: `${appUrl}/c/wallet`,
      subtext: 'Withdraw straight to your linked Nigerian bank account anytime.',
    },
  });

  await sendEmail({
    to: email,
    subject: `Bag Secured! 🎉 You earned ${formattedPayout} on "${campaignTitle}"`,
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
    subject: `Heads Up: Verification Issue on "${campaignTitle}" ⚠️`,
    previewText: `We ran into an issue verifying your post for "${campaignTitle}".`,
    icon: 'star',
    headline: 'Verification Check Needed ⚠️',
    subtitle: `We could not complete verification for your submission on "${campaignTitle}".`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'REASON', value: failureReason },
      { label: 'STATUS', value: 'Incomplete', statusBadge: { text: 'Failed', variant: 'yellow' } },
    ],
    noticeText: 'Common causes include: failing to reach the minimum view count floor, making the post private/deleted, or unlinking your social account permissions.',
    cta: {
      label: 'Review on Dashboard',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: `Heads Up: Verification Issue on "${campaignTitle}" ⚠️`,
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
    subject: `Yooo! You got paid 💰 ${formattedAmount} for "${campaignTitle}"`,
    previewText: `${formattedAmount} added to your wallet!`,
    icon: 'wallet',
    headline: 'Yooo! You Got Paid 💰',
    subtitle: `Your video submission for "${campaignTitle}" passed verification and funds just hit your creator wallet.`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'AMOUNT CREDITED', value: formattedAmount, isMonospace: true },
      { label: 'UPDATED WALLET BALANCE', value: formattedBalance, isMonospace: true },
      { label: 'STATUS', value: 'Paid', statusBadge: { text: 'Credited', variant: 'green' } },
    ],
    highlightBar: {
      label: 'Earnings Credited',
      value: formattedAmount,
      bgColor: '#10B981',
    },
    cta: {
      label: 'View Wallet & Cash Out',
      url: `${appUrl}/c/wallet`,
      subtext: 'Withdraw straight to your Nigerian bank account anytime.',
    },
  });

  await sendEmail({
    to: email,
    subject: `Yooo! You got paid 💰 ${formattedAmount} for "${campaignTitle}"`,
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
    subject: `Funds Dispatched! ${formattedAmount} On the Way to ${bankName} 🏧`,
    previewText: `Your withdrawal of ${formattedAmount} is on its way.`,
    icon: 'wallet',
    headline: 'Transfer Dispatched 🏧',
    subtitle: `Your withdrawal request of ${formattedAmount} has been processed via Paystack and sent straight to your bank account.`,
    details: [
      { label: 'DESTINATION BANK', value: bankName },
      { label: 'ACCOUNT NUMBER', value: accountMasked, isMonospace: true },
      { label: 'AMOUNT DISPATCHED', value: formattedAmount, isMonospace: true },
      { label: 'TRANSFER REFERENCE', value: reference, isMonospace: true },
      { label: 'STATUS', value: 'Dispatched', statusBadge: { text: 'Dispatched', variant: 'green' } },
    ],
    cta: {
      label: 'View Wallet History',
      url: `${appUrl}/c/wallet`,
    },
  });

  await sendEmail({
    to: email,
    subject: `Funds Dispatched! ${formattedAmount} On the Way to ${bankName} 🏧`,
    html,
  });
}
