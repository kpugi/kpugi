import { triggerNotification } from '@/lib/knock/notify';
import { sendEmail } from '@/lib/resend/send-email';

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

  await sendEmail({
    to: email,
    subject: `Welcome to Kpugi Brand Console, ${companyName}! 🏢`,
    previewText: 'Launch performance campaigns backed by 100% escrow protection.',
    html: `
      <h2 style="margin-top:0;">Welcome to Kpugi Brand Console! 🏢</h2>
      <p>Hello <strong>${companyName}</strong>,</p>
      <p>Your brand partner account is ready. Fund your balance, launch performance video campaigns, and pay only for verified view milestones reached by creators.</p>
      
      <div style="background:#f8fafc; border-left:4px solid #2563eb; padding:16px; margin:20px 0;">
        <h4 style="margin:0 0 8px 0;">Why Brands Choose Kpugi:</h4>
        <ul style="margin:0; padding-left:20px;">
          <li><strong>Zero Waste:</strong> Funds stay in escrow until creators hit verified view floors.</li>
          <li><strong>Automated Scraping:</strong> View count auditing runs automatically every 6 hours.</li>
          <li><strong>Direct Creators:</strong> Top creators claim slots and deliver authentic short-form UGC videos.</li>
        </ul>
      </div>

      <p style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com'}/campaigns/new" class="btn">Create First Campaign</a>
      </p>
    `,
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

  await sendEmail({
    to: email,
    subject: `Deposit Confirmed: ₦${amount.toLocaleString()} added to your Kpugi balance`,
    previewText: 'Your escrow wallet has been funded successfully.',
    html: `
      <h2 style="margin-top:0; color:#16a34a;">Wallet Deposit Received 💳</h2>
      <p>We received your deposit payment via Paystack.</p>
      
      <table style="width:100%; border-collapse:collapse; margin:20px 0; background:#f8fafc; border-radius:8px;">
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 16px; color:#64748b;">Amount Deposited:</td>
          <td style="padding:10px 16px; font-weight:700; text-align:right;">₦${amount.toLocaleString()}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 16px; color:#64748b;">Paystack Reference:</td>
          <td style="padding:10px 16px; font-family:monospace; text-align:right;">${reference}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px; color:#64748b;">Total Available Balance:</td>
          <td style="padding:10px 16px; font-weight:800; color:#2563eb; text-align:right;">₦${newBalance.toLocaleString()}</td>
        </tr>
      </table>
    `,
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

  await sendEmail({
    to: email,
    subject: `🚀 Campaign Live: "${campaignTitle}" is now active!`,
    html: `
      <h2 style="margin-top:0; color:#2563eb;">Campaign Live & Open to Creators! 🚀</h2>
      <p>Your campaign <strong>"${campaignTitle}"</strong> is funded and live on the Kpugi creator marketplace.</p>
      
      <table style="width:100%; border-collapse:collapse; margin:20px 0; background:#f8fafc; border-radius:8px;">
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 16px; color:#64748b;">Total Budget:</td>
          <td style="padding:10px 16px; font-weight:700; text-align:right;">₦${totalBudget.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px; color:#64748b;">CPM Rate:</td>
          <td style="padding:10px 16px; font-weight:700; text-align:right;">₦${cpmRate.toLocaleString()} per 1,000 views</td>
        </tr>
      </table>

      <p style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com'}${actionUrl}" class="btn">View Campaign Dashboard</a>
      </p>
    `,
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
