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
    subject: 'Welcome to Kpugi 🚀 Real Creators, Real Motion!',
    previewText: 'Launch performance campaigns and tap into verified creators.',
    headline: 'Welcome to Kpugi 🚀',
    subtitle: `Welcome ${companyName}! You're in good hands. Fund your brand wallet, drop your campaign briefs, and let vetted creators take your brand viral. Zero fluff, 100% verified views.`,
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
    subject: 'Welcome to Kpugi 🚀 Real Creators, Real Motion!',
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
    subject: 'Funds Locked & Loaded 💳 Time to Drop!',
    previewText: `Your deposit of ${formattedAmount} was successfully confirmed.`,
    headline: 'Deposit Confirmed 💳',
    subtitle: `Payment confirmed! Your brand wallet is now loaded with ${formattedAmount}. Your budget is primed to ignite creator campaigns and drive real reach.`,
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
    subject: 'Funds Locked & Loaded 💳 Time to Drop!',
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
    subject: 'Campaign Live & Cooking 🔥 Motion Initiated!',
    previewText: `Budget is locked and "${campaignTitle}" is live. Creators are ready to claim slots.`,
    headline: 'Campaign Live & Cooking 🚀',
    subtitle: `We are LIVE! "${campaignTitle}" is officially out in the wild. Creators are already claiming slots to turn your content into pure virality.`,
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
    subject: 'Campaign Live & Cooking 🔥 Motion Initiated!',
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
    subject: `Creator Picked Up The Drop! 🚀 ${cleanHandle} is in!`,
    previewText: `${cleanHandle} has joined "${campaignTitle}".`,
    headline: 'Creator Joined Campaign! 🚀',
    subtitle: `Big motion! Creator ${cleanHandle} just grabbed a slot in "${campaignTitle}". Their budget slot is locked in escrow while they prep the post.`,
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
    subject: `Creator Picked Up The Drop! 🚀 ${cleanHandle} is in!`,
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
    subject: 'Live Post Dropped 📹 Content is Cooking!',
    previewText: `${cleanHandle} just submitted their live post link for "${campaignTitle}".`,
    headline: 'Creator Dropped a Live Link 📹',
    subtitle: `Content is live! ${cleanHandle} (${platform.toUpperCase()}) dropped their live video link for "${campaignTitle}". We're actively scraping & tracking views right now.`,
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
    subject: 'Live Post Dropped 📹 Content is Cooking!',
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
    subject: '100% Budget Locked 🔥 Campaign Sold Out!',
    previewText: `All slots for "${campaignTitle}" have been claimed by creators.`,
    headline: 'Budget 100% Claimed 🔥',
    subtitle: `Pure fire! Every single slot for "${campaignTitle}" has been snagged by creators. Want to keep the viral train rolling? Top up your campaign budget anytime.`,
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
    subject: '100% Budget Locked 🔥 Campaign Sold Out!',
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
  const actionUrl = campaignId ? `/b/campaigns/${campaignId}?review=true` : '/b/dashboard';
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
    subject: 'Campaign Wrap Up 📊 Final Scoreboard Inside!',
    previewText: `Your campaign "${campaignTitle}" delivered ${totalViews.toLocaleString()} verified views. Rate your experience!`,
    headline: 'Campaign Wrap Up 📊',
    subtitle: `That's a wrap! "${campaignTitle}" officially completed with ${totalViews.toLocaleString()} verified views delivered. How was your campaign experience on Kpugi? Leave a quick 20-second review to help other brands and improve platform matching.`,
    details: [
      { label: 'CAMPAIGN', value: campaignTitle },
      { label: 'TOTAL VERIFIED VIEWS', value: `${totalViews.toLocaleString()} views`, isMonospace: true },
      { label: 'TOTAL SPENT', value: `₦${totalSpent.toLocaleString()}`, isMonospace: true },
    ],
    cta: {
      label: 'Rate Experience & View Full Report ⭐',
      url: `${appUrl}${actionUrl}`,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Campaign Wrap Up 📊 Final Scoreboard Inside!',
    html,
  });
}
