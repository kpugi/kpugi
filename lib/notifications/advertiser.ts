import { triggerNotification } from '@/lib/knock/notify';
import { sendEmail, renderReusableEmailTemplate } from '@/lib/resend/send-email';

export async function notifyAdvertiserWelcome({
  clerkId,
  email,
  companyName,
  profileId,
}: {
  clerkId: string;
  email: string;
  companyName: string;
  profileId?: string;
}) {
  await triggerNotification({
    workflowKey: 'advertiser-welcome',
    recipients: [clerkId],
    data: { 
      companyName,
      action_url: '/b/dashboard',
    },
    profileId,
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Welcome to Kpugi 🚀',
    previewText: 'Launch performance campaigns and tap into verified creators.',
    headline: 'Welcome to Kpugi 🚀',
    subtitle: `Welcome ${companyName}!, your brand partner account is officially active. Fund your balance, launch performance campaigns, and pay strictly for confirmed creator views.`,
    details: [
      { label: 'STEP 1', value: 'Deposit budget to your brand wallet' },
      { label: 'STEP 2', value: 'Create campaign brief & upload creatives' },
      { label: 'STEP 3', value: 'Creators post and drive verified views' },
    ],
    cta: {
      label: 'Launch First Campaign',
      url: `${appUrl}/b/campaigns/new`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Welcome to Kpugi 🚀',
    previewText: 'Launch performance campaigns and pay strictly for confirmed views.',
    html,
  });
}

export async function notifyAdvertiserWalletFunded({
  clerkId,
  email,
  amount,
  newBalance,
  reference,
  profileId,
}: {
  clerkId: string;
  email: string;
  amount: number;
  newBalance: number;
  reference: string;
  profileId?: string;
}) {
  await triggerNotification({
    workflowKey: 'wallet-funded',
    recipients: [clerkId],
    data: {
      amount: `₦${amount.toLocaleString()}`,
      newBalance: `₦${newBalance.toLocaleString()}`,
      reference,
      action_url: '/b/wallet',
    },
    profileId,
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const formattedAmount = `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formattedBalance = `₦${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Deposit Confirmed 💳',
    previewText: `Your deposit of ${formattedAmount} was successfully confirmed.`,
    headline: 'Deposit Confirmed 💳',
    subtitle: 'Your payment was successfully confirmed via Paystack. Your balance is ready to power your campaign drops.',
    details: [
      { label: 'AMOUNT DEPOSITED', value: formattedAmount, isMonospace: true },
      { label: 'UPDATED BALANCE', value: formattedBalance, isMonospace: true },
      { label: 'PAYMENT REFERENCE', value: reference, isMonospace: true },
    ],
    noticeText: 'These funds can be allocated directly towards performance campaigns with 100% verified view tracking.',
    cta: {
      label: 'View Brand Wallet',
      url: `${appUrl}/b/wallet`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Deposit Confirmed 💳',
    previewText: `Your deposit of ${formattedAmount} was successfully confirmed.`,
    html,
  });
}

export async function notifyAdvertiserCampaignLive({
  clerkId,
  email,
  campaignTitle,
  totalBudget,
  cpmRate,
  campaignId,
  profileId,
}: {
  clerkId: string;
  email: string;
  campaignTitle: string;
  totalBudget: number;
  cpmRate: number;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/b/campaigns/${campaignId}` : '/b/dashboard';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  await triggerNotification({
    workflowKey: 'campaign-funded',
    recipients: [clerkId],
    data: {
      campaignTitle,
      totalBudget: `₦${totalBudget.toLocaleString()}`,
      cpmRate: `₦${cpmRate.toLocaleString()}`,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });

  const formattedBudget = `₦${totalBudget.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Campaign is Live & Cooking 🚀',
    previewText: `Budget is locked and "${campaignTitle}" is live. Creators are ready to claim slots.`,
    headline: 'Campaign is Live & Ready to Cook 🚀',
    subtitle: `Budget is locked in and your campaign is live. Creators are ready to claim slots and amplify for campaign for absolute virality!`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'BUDGET LOCKED', value: formattedBudget, isMonospace: true },
      { label: 'CPM', value: `₦${cpmRate.toLocaleString()}/1k views`, isMonospace: true },
    ],
    noticeText: 'We track every view in real-time. As creators publish and clock in views, verified view counts and payout settlements update live on your dashboard.',
    cta: {
      label: 'Open Campaign Dashboard',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Campaign is Live & Cooking 🚀',
    html,
  });
}

export async function notifyAdvertiserCreatorJoined({
  clerkId,
  email,
  creatorHandle,
  platform,
  campaignTitle,
  reservedAmount,
  campaignId,
  profileId,
}: {
  clerkId: string;
  email: string;
  creatorHandle: string;
  platform: string;
  campaignTitle: string;
  reservedAmount: number;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/b/campaigns/${campaignId}` : '/b/dashboard';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const cleanHandle = `@${creatorHandle.replace(/^@/, '')}`;

  await triggerNotification({
    workflowKey: 'creator-joined',
    recipients: [clerkId],
    data: {
      creatorHandle: cleanHandle,
      platform,
      campaignTitle,
      reservedAmount: `₦${reservedAmount.toLocaleString()}`,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });

  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Creator Joined Campaign! 🚀',
    previewText: `${cleanHandle} has joined "${campaignTitle}".`,
    headline: 'Creator Joined Campaign! 🚀',
    subtitle: `Great news!, a creator has joined your campaign and reserved slots to amplify your brand.`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'CREATOR', value: cleanHandle },
      { label: 'PLATFORM', value: platform.toUpperCase() },
      { label: 'BUDGET RESERVED', value: `₦${reservedAmount.toLocaleString()}`, isMonospace: true },
    ],
    noticeText: 'The reserved budget is locked in escrow. Once the creator posts and view metrics are scraped, payouts will be released automatically based on their performance.',
    cta: {
      label: 'View Campaign Progress',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Creator Joined Campaign! 🚀',
    html,
  });
}

export async function notifyAdvertiserCreatorSubmitted({
  clerkId,
  email,
  creatorHandle,
  platform,
  postUrl,
  campaignTitle,
  campaignId,
  profileId,
}: {
  clerkId: string;
  email: string;
  creatorHandle: string;
  platform: string;
  postUrl: string;
  campaignTitle: string;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/b/campaigns/${campaignId}` : '/b/dashboard';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const cleanHandle = `@${creatorHandle.replace(/^@/, '')}`;

  await triggerNotification({
    workflowKey: 'creator-submitted-post',
    recipients: [clerkId],
    data: {
      creatorHandle: cleanHandle,
      platform,
      campaignTitle,
      postUrl,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });

  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Creator Dropped a Live Link 📹',
    previewText: `${cleanHandle} just submitted their live post link for "${campaignTitle}".`,
    headline: 'Creator Dropped a Live Link 📹',
    subtitle: `Creator ${cleanHandle} (${platform.toUpperCase()}) just submitted their live post link for "${campaignTitle}".`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'CREATOR', value: cleanHandle },
      { label: 'PLATFORM', value: platform.toUpperCase() },
      { label: 'LIVE POST LINK', value: postUrl },
    ],
    noticeText: 'Our automated view tracking is now monitoring performance. Once verified view milestones are achieved, payouts will settle smoothly.',
    cta: {
      label: 'View Campaign Submissions',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Creator Dropped a Live Link 📹',
    html,
  });
}

export async function notifyAdvertiserSubmissionVerified({
  clerkId,
  creatorHandle,
  campaignTitle,
  trackedViews,
  payoutAmount,
  campaignId,
  profileId,
}: {
  clerkId: string;
  creatorHandle: string;
  campaignTitle: string;
  trackedViews: number;
  payoutAmount: number;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/b/campaigns/${campaignId}` : '/b/dashboard';

  await triggerNotification({
    workflowKey: 'creator-verified',
    recipients: [clerkId],
    data: {
      creatorHandle: `@${creatorHandle.replace(/^@/, '')}`,
      campaignTitle,
      trackedViews: trackedViews.toLocaleString(),
      payoutAmount: `₦${payoutAmount.toLocaleString()}`,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });
}

export async function notifyAdvertiserSubmissionFailed({
  clerkId,
  creatorHandle,
  campaignTitle,
  failureReason,
  refundedAmount,
  campaignId,
  profileId,
}: {
  clerkId: string;
  creatorHandle: string;
  campaignTitle: string;
  failureReason: string;
  refundedAmount: number;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/b/campaigns/${campaignId}` : '/b/dashboard';

  await triggerNotification({
    workflowKey: 'creator-failed',
    recipients: [clerkId],
    data: {
      creatorHandle: `@${creatorHandle.replace(/^@/, '')}`,
      campaignTitle,
      failureReason,
      refundedAmount: `₦${refundedAmount.toLocaleString()}`,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });
}

export async function notifyAdvertiserBudgetDepleted({
  clerkId,
  email,
  campaignTitle,
  campaignId,
  profileId,
}: {
  clerkId: string;
  email: string;
  campaignTitle: string;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/b/campaigns/${campaignId}` : '/b/dashboard';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  await triggerNotification({
    workflowKey: 'budget-depleted',
    recipients: [clerkId],
    data: { 
      campaignTitle,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });

  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Budget 100% Locked & Moving 🔥',
    previewText: `All slots for "${campaignTitle}" have been claimed by creators.`,
    headline: 'Budget 100% Locked & Moving 🔥',
    subtitle: `Every slot for "${campaignTitle}" has been claimed by active creators. Want to keep the views and engagement rolling? Top up your budget anytime.`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'SLOT STATUS', value: '100% Claimed' },
    ],
    cta: {
      label: 'Top Up Campaign Budget',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Budget 100% Locked & Moving 🔥',
    html,
  });
}

export async function notifyAdvertiserCampaignCompleted({
  clerkId,
  email,
  campaignTitle,
  totalViews,
  totalSpent,
  campaignId,
  profileId,
}: {
  clerkId: string;
  email: string;
  campaignTitle: string;
  totalViews: number;
  totalSpent: number;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/b/campaigns/${campaignId}` : '/b/dashboard';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  await triggerNotification({
    workflowKey: 'campaign-completed',
    recipients: [clerkId],
    data: {
      campaignTitle,
      totalViews: totalViews.toLocaleString(),
      totalSpent: `₦${totalSpent.toLocaleString()}`,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });

  const html = renderReusableEmailTemplate({
    to: email,
    subject: 'Campaign Wrap Up 📊',
    previewText: `Your campaign "${campaignTitle}" delivered ${totalViews.toLocaleString()} verified views.`,
    headline: 'Campaign Wrap Up 📊',
    subtitle: `Your campaign "${campaignTitle}" has reached completion. Here is your final performance snapshot:`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'TOTAL VERIFIED VIEWS', value: `${totalViews.toLocaleString()} views`, isMonospace: true },
      { label: 'TOTAL SPENT', value: `₦${totalSpent.toLocaleString()}`, isMonospace: true },
    ],
    cta: {
      label: 'View Campaign Analytics',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Campaign Wrap Up 📊',
    html,
  });
}
