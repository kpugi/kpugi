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
      action_url: '/dashboard',
    },
    profileId,
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const html = renderReusableEmailTemplate({
    to: email,
    subject: `Welcome to the big leagues, ${companyName}! 🏢`,
    previewText: 'Launch performance campaigns backed by 100% escrow protection.',
    icon: 'star',
    headline: 'Welcome to the Big Leagues 🏢!',
    subtitle: `Hello ${companyName}, your brand partner account is ready. Fund your balance, launch performance video campaigns, and pay only for verified view milestones reached by creators.`,
    cta: {
      label: 'Create First Campaign',
      url: `${appUrl}/campaigns/new`,
    },
  });

  await sendEmail({
    to: email,
    subject: `Welcome to the big leagues, ${companyName}! 🏢`,
    previewText: 'Launch performance campaigns backed by 100% escrow protection.',
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
      action_url: '/wallet',
    },
    profileId,
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const html = renderReusableEmailTemplate({
    to: email,
    subject: `Wallet Loaded 💳! ₦${amount.toLocaleString()} is ready to fund your next viral campaign`,
    previewText: 'Your escrow wallet has been funded successfully.',
    icon: 'wallet',
    headline: 'Wallet Loaded 💳!',
    subtitle: 'Say less! 💰 Your deposit payment was successfully confirmed via Paystack.',
    cardTitle: 'Transaction Details',
    details: [
      { label: 'Paystack Reference', value: reference, isMonospace: true },
      { label: 'Date', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
      { label: 'Total Available Balance', value: `₦${newBalance.toLocaleString()}`, isMonospace: true },
    ],
    highlightBar: {
      label: 'Amount Deposited',
      value: `₦${amount.toLocaleString()}`,
      bgColor: '#2563EB',
    },
    cta: {
      label: 'View Dashboard',
      url: `${appUrl}/b/wallet`,
      subtext: 'Or login to your account to view full transaction history.',
    },
  });

  await sendEmail({
    to: email,
    subject: `Wallet Loaded 💳! ₦${amount.toLocaleString()} is ready to fund your next viral campaign`,
    previewText: 'Your escrow wallet has been funded successfully.',
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
  const actionUrl = campaignId ? `/campaigns/${campaignId}` : '/dashboard';
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

  const html = renderReusableEmailTemplate({
    to: email,
    subject: `Lights, camera, action 🎬! "${campaignTitle}" is live and catching views`,
    previewText: `Your campaign "${campaignTitle}" is funded and live!`,
    icon: 'rocket',
    headline: 'We Cooked 🍳! Campaign Live!',
    subtitle: `Your campaign "${campaignTitle}" is funded and live on the Kpugi creator marketplace.`,
    cardTitle: 'Campaign Details',
    details: [
      { label: 'Campaign Title', value: campaignTitle },
      { label: 'CPM Rate', value: `₦${cpmRate.toLocaleString()} per 1k views` },
    ],
    highlightBar: {
      label: 'Total Escrow Budget',
      value: `₦${totalBudget.toLocaleString()}`,
      bgColor: '#2563EB',
    },
    cta: {
      label: 'View Campaign Dashboard',
      url: `${appUrl}${actionUrl}`,
      subtext: 'Track real-time view counts and creator submissions.',
    },
  });

  await sendEmail({
    to: email,
    subject: `Lights, camera, action 🎬! "${campaignTitle}" is live and catching views`,
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
  const actionUrl = campaignId ? `/campaigns/${campaignId}` : '/dashboard';

  // In-app notification only
  await triggerNotification({
    workflowKey: 'creator-joined',
    recipients: [clerkId],
    data: {
      creatorHandle: `@${creatorHandle}`,
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
  const actionUrl = campaignId ? `/campaigns/${campaignId}` : '/dashboard';

  await triggerNotification({
    workflowKey: 'creator-submitted-post',
    recipients: [clerkId],
    data: {
      creatorHandle: `@${creatorHandle}`,
      platform,
      campaignTitle,
      postUrl,
      campaignId,
      action_url: actionUrl,
    },
    profileId,
  });

  await sendEmail({
    to: email,
    subject: `New Post Link Submitted for "${campaignTitle}"`,
    html: `
      <h2 style="margin-top:0;">Creator Submitted Live Post Link 📹</h2>
      <p>Creator <strong>@${creatorHandle}</strong> (${platform.toUpperCase()}) submitted a live link for <strong>"${campaignTitle}"</strong>.</p>
      
      <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 16px; border-radius:8px; margin:16px 0;">
        <p style="margin:0; font-size:14px; color:#64748b;"><strong>Live Post:</strong> <a href="${postUrl}" style="color:#2563eb;">${postUrl}</a></p>
      </div>
    `,
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
  const actionUrl = campaignId ? `/campaigns/${campaignId}` : '/dashboard';

  await triggerNotification({
    workflowKey: 'creator-verified',
    recipients: [clerkId],
    data: {
      creatorHandle: `@${creatorHandle}`,
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
  const actionUrl = campaignId ? `/campaigns/${campaignId}` : '/dashboard';

  await triggerNotification({
    workflowKey: 'creator-failed',
    recipients: [clerkId],
    data: {
      creatorHandle: `@${creatorHandle}`,
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
  const actionUrl = campaignId ? `/campaigns/${campaignId}` : '/dashboard';

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

  await sendEmail({
    to: email,
    subject: `⚠️ Budget Fully Reserved for "${campaignTitle}"`,
    html: `
      <h2 style="margin-top:0; color:#d97706;">Campaign Budget Fully Committed ⚠️</h2>
      <p>100% of the budget for <strong>"${campaignTitle}"</strong> has been reserved by creators.</p>
      <p>You can top up your campaign budget anytime to allow more creators to participate.</p>
    `,
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
  const actionUrl = campaignId ? `/campaigns/${campaignId}` : '/dashboard';

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

  await sendEmail({
    to: email,
    subject: `📊 Campaign Completed: "${campaignTitle}" Summary`,
    html: `
      <h2 style="margin-top:0; color:#16a34a;">Campaign Finished! 📊</h2>
      <p>Your ad campaign <strong>"${campaignTitle}"</strong> has finished its required duration.</p>
      
      <table style="width:100%; border-collapse:collapse; margin:20px 0; background:#f8fafc; border-radius:8px;">
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 16px; color:#64748b;">Total Verified Views:</td>
          <td style="padding:12px 16px; font-weight:800; text-align:right;">${totalViews.toLocaleString()} views</td>
        </tr>
        <tr>
          <td style="padding:12px 16px; color:#64748b;">Total Spend:</td>
          <td style="padding:12px 16px; font-weight:800; color:#2563eb; text-align:right;">₦${totalSpent.toLocaleString()}</td>
        </tr>
      </table>
    `,
  });
}

export async function notifyAdvertiserCampaignLaunched({
  clerkId,
  email,
  companyName,
  campaignTitle,
  campaignId,
  campaignCode,
  totalBudget,
  receiptNumber,
  profileId,
}: {
  clerkId: string;
  email: string;
  companyName: string;
  campaignTitle: string;
  campaignId: string;
  campaignCode: string;
  totalBudget: number;
  receiptNumber: string;
  profileId?: string;
}) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  await triggerNotification({
    workflowKey: 'advertiser-campaign-launched',
    recipients: [clerkId],
    data: {
      campaignTitle,
      campaignId,
      campaignCode,
      action_url: `/b/campaigns/${campaignId}`,
    },
    profileId,
  }).catch(() => {});

  const html = renderReusableEmailTemplate({
    to: email,
    subject: `🚀 Your campaign "${campaignTitle}" is now LIVE on Kpugi!`,
    previewText: `Your campaign is live and visible to creators. Receipt: ${receiptNumber}`,
    icon: 'rocket',
    headline: 'Campaign Launched Successfully! 🎉',
    subtitle: `Hi ${companyName}, your campaign is live and is now visible to qualified creators on the Kpugi platform. Sit tight — creators will start applying soon!`,
    cardTitle: 'Campaign Summary',
    details: [
      { label: 'Campaign Title', value: campaignTitle },
      { label: 'Campaign Code', value: campaignCode },
      { label: 'Receipt ID', value: receiptNumber },
    ],
    highlightBar: {
      label: 'Escrow Budget Locked',
      value: `₦${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      bgColor: '#4338ca',
    },
    cta: {
      label: 'View Your Campaign',
      url: `${appUrl}/b/campaigns/${campaignId}`,
      subtext: 'Track performance, manage submissions, and approve creator content from your dashboard.',
    },
  });

  await sendEmail({
    to: email,
    subject: `🚀 Your campaign "${campaignTitle}" is now LIVE on Kpugi!`,
    previewText: `Your campaign is live and visible to creators. Receipt: ${receiptNumber}`,
    html,
  });
}
