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
    subject: `Welcome to Kpugi, ${companyName}! 🚀`,
    previewText: 'Launch performance campaigns and tap into verified creators.',
    icon: 'star',
    headline: `Welcome to Kpugi, ${companyName}! 🚀`,
    subtitle: `Your brand partner account is officially set up. Fund your balance, launch performance video campaigns, and pay only for verified view milestones reached by creators.`,
    cta: {
      label: 'Launch Your First Campaign',
      url: `${appUrl}/b/campaigns/new`,
    },
  });

  await sendEmail({
    to: email,
    subject: `Welcome to Kpugi, ${companyName}! 🚀`,
    previewText: 'Launch performance campaigns and pay only for real, verified views.',
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
    subject: `Deposit Confirmed! ${formattedAmount} Added to Your Balance 💳`,
    previewText: `Your deposit of ${formattedAmount} was successfully confirmed and added to your balance.`,
    icon: 'wallet',
    headline: 'Funds Added to Balance 💳',
    subtitle: 'Your payment was successfully confirmed via Paystack. Your balance is ready to power your campaign drops.',
    details: [
      { label: 'PAYMENT REFERENCE', value: reference, isMonospace: true },
      { label: 'AMOUNT DEPOSITED', value: formattedAmount, isMonospace: true },
      { label: 'UPDATED BALANCE', value: formattedBalance, isMonospace: true },
      {
        label: 'STATUS',
        value: 'Completed',
        statusBadge: { text: 'Completed', variant: 'green' },
      },
    ],
    noticeText: 'These funds can be allocated directly towards performance campaigns with 100% verified view tracking.',
    cta: {
      label: 'View Brand Wallet',
      url: `${appUrl}/b/wallet`,
    },
  });

  await sendEmail({
    to: email,
    subject: `Deposit Confirmed! ${formattedAmount} Added to Your Balance 💳`,
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
    subject: `Your Campaign is Live & Cooking! 🚀 "${campaignTitle}"`,
    previewText: `Budget is locked and "${campaignTitle}" is live. Creators are already eyeing this drop.`,
    icon: 'check',
    headline: 'Campaign is Live & Ready to Cook 🚀',
    subtitle: `Budget is locked in and your briefing is live. Creators are already eyeing this drop to grab creatives and post.`,
    details: [
      { label: 'CAMPAIGN NAME', value: campaignTitle },
      { label: 'BUDGET LOCKED', value: formattedBudget, isMonospace: true },
      { label: 'CPM PAYOUT RATE', value: `₦${cpmRate.toLocaleString()} / 1k views` },
      {
        label: 'STATUS',
        value: 'Live',
        statusBadge: { text: 'Live', variant: 'green' },
      },
    ],
    noticeText: 'We track every view in real-time. As creators publish and clock in views, you will see verified view counts and payout settlements update live on your dashboard.',
    cta: {
      label: 'Open Campaign Dashboard',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: `Your Campaign is Live & Cooking! 🚀 "${campaignTitle}"`,
    html,
  });
}

export async function notifyAdvertiserCreatorJoined({
  clerkId,
  creatorHandle,
  platform,
  campaignTitle,
  reservedAmount,
  campaignId,
  profileId,
}: {
  clerkId: string;
  creatorHandle: string;
  platform: string;
  campaignTitle: string;
  reservedAmount: number;
  campaignId?: string;
  profileId?: string;
}) {
  const actionUrl = campaignId ? `/b/campaigns/${campaignId}` : '/b/dashboard';

  // In-app notification
  await triggerNotification({
    workflowKey: 'creator-joined',
    recipients: [clerkId],
    data: {
      creatorHandle: `@${creatorHandle.replace(/^@/, '')}`,
      platform,
      campaignTitle,
      reservedAmount: `₦${reservedAmount.toLocaleString()}`,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
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

  await triggerNotification({
    workflowKey: 'creator-submitted-post',
    recipients: [clerkId],
    data: {
      creatorHandle: `@${creatorHandle.replace(/^@/, '')}`,
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
    subject: `New Post Link Dropped for "${campaignTitle}" 📹`,
    previewText: `@${creatorHandle.replace(/^@/, '')} just submitted their live post link.`,
    icon: 'check',
    headline: 'Creator Dropped a Live Link 📹',
    subtitle: `Creator @${creatorHandle.replace(/^@/, '')} (${platform.toUpperCase()}) just submitted their live post for "${campaignTitle}".`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'CREATOR', value: `@${creatorHandle.replace(/^@/, '')}` },
      { label: 'PLATFORM', value: platform.toUpperCase() },
      { label: 'STATUS', value: 'Tracking Views', statusBadge: { text: 'Tracking', variant: 'blue' } },
    ],
    noticeText: 'Our automated tracking is now monitoring view performance. Once verified milestones are achieved, payouts will settle seamlessly.',
    cta: {
      label: 'View Campaign Submissions',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: `New Post Link Dropped for "${campaignTitle}" 📹`,
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
    subject: `Campaign Budget 100% Reserved! 🔥 "${campaignTitle}"`,
    previewText: `All slots for "${campaignTitle}" have been claimed by creators.`,
    icon: 'star',
    headline: 'Budget 100% Locked & Moving 🔥',
    subtitle: `Every slot for "${campaignTitle}" has been claimed by active creators. Want to keep the views and engagement rolling? Top up your budget anytime.`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'SLOT STATUS', value: '100% Claimed', statusBadge: { text: 'Fully Claimed', variant: 'blue' } },
    ],
    cta: {
      label: 'Top Up Campaign Budget',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: `Campaign Budget 100% Reserved! 🔥 "${campaignTitle}"`,
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
    subject: `Campaign Wrapped! Check Out The Numbers 📊 "${campaignTitle}"`,
    previewText: `Your campaign "${campaignTitle}" delivered ${totalViews.toLocaleString()} verified views.`,
    icon: 'check',
    headline: "That's a Wrap! 📊",
    subtitle: `Your campaign "${campaignTitle}" has officially wrapped up. Here is your final performance snapshot:`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'TOTAL VERIFIED VIEWS', value: `${totalViews.toLocaleString()} views`, isMonospace: true },
      { label: 'TOTAL CAMPAIGN SPEND', value: `₦${totalSpent.toLocaleString()}`, isMonospace: true },
      { label: 'STATUS', value: 'Completed', statusBadge: { text: 'Completed', variant: 'green' } },
    ],
    cta: {
      label: 'View Full Campaign Analytics',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: `Campaign Wrapped! Check Out The Numbers 📊 "${campaignTitle}"`,
    html,
  });
}
