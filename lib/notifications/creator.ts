import { triggerNotification } from '@/lib/knock/notify';
import { sendEmail } from '@/lib/resend/send-email';

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
      action_url: '/dashboard',
    },
    profileId,
  });

  await sendEmail({
    to: email,
    subject: `Welcome to Kpugi, ${name}! 🚀`,
    previewText: 'Start monetizing your short-form video views today.',
    html: `
      <h2 style="margin-top:0;">Welcome to Kpugi, ${name}! 🎉</h2>
      <p>Your creator account is active. Connect your TikTok or Instagram handle, browse available performance campaigns, and start earning per 1,000 verified views.</p>
      
      <div style="background:#f8fafc; border-left:4px solid #2563eb; padding:16px; margin:20px 0;">
        <h4 style="margin:0 0 8px 0;">How it works:</h4>
        <ol style="margin:0; padding-left:20px;">
          <li>Claim a slot in an active brand campaign.</li>
          <li>Post your video using the brand's brief and mandatory tags.</li>
          <li>Submit your live video link within 72 hours.</li>
          <li>Automated scrapers verify your view counts and release funds to your wallet.</li>
        </ol>
      </div>

      <p style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com'}/dashboard" class="btn">Explore Campaigns</a>
      </p>
    `,
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
      action_url: '/accounts',
    },
    profileId,
  });

  await sendEmail({
    to: email,
    subject: `Social Account Connected: @${handle} (${platform.toUpperCase()})`,
    html: `
      <h2 style="margin-top:0;">Social Account Connected ✅</h2>
      <p>Your <strong>${platform.toUpperCase()}</strong> account <strong>@${handle}</strong> has been successfully linked to Kpugi.</p>
      <p>You can now use this page to join campaigns matching your follower base and platform requirements.</p>
    `,
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
  const actionUrl = campaignId ? `/campaigns/${campaignId}` : '/dashboard';
  
  // In-app only for routine campaign joins to avoid inbox clutter
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
  const actionUrl = campaignId ? `/campaigns/${campaignId}` : '/dashboard';

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

  await sendEmail({
    to: email,
    subject: `Submission Received for "${campaignTitle}"`,
    previewText: 'Your live post URL was successfully recorded for performance tracking.',
    html: `
      <h2 style="margin-top:0;">Post Link Submitted 📌</h2>
      <p>Your post for campaign <strong>"${campaignTitle}"</strong> was received and is now being monitored by Kpugi scrapers.</p>
      
      <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 16px; border-radius:8px; margin:16px 0;">
        <p style="margin:0; font-size:14px; color:#64748b;"><strong>Submitted Link:</strong> <a href="${postUrl}" style="color:#2563eb;">${postUrl}</a></p>
      </div>

      <p><strong>Reminder:</strong> Please keep the post public and published for the full campaign duration so automated checks can verify view milestones.</p>
    `,
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
  const actionUrl = campaignId ? `/campaigns/${campaignId}` : '/dashboard';

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

  await sendEmail({
    to: email,
    subject: `🎉 Verification Passed: You earned ₦${payoutAmount.toLocaleString()} on "${campaignTitle}"`,
    previewText: `Your post verified ${trackedViews.toLocaleString()} views! Earnings added to your wallet.`,
    html: `
      <h2 style="margin-top:0; color:#16a34a;">Verification Passed! 🌟</h2>
      <p>Congratulations! Your post for campaign <strong>"${campaignTitle}"</strong> has successfully completed verification.</p>
      
      <table style="width:100%; border-collapse:collapse; margin:20px 0; background:#f8fafc; border-radius:8px; overflow:hidden;">
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 16px; color:#64748b;">Verified Views:</td>
          <td style="padding:12px 16px; font-weight:700; text-align:right;">${trackedViews.toLocaleString()} views</td>
        </tr>
        <tr>
          <td style="padding:12px 16px; color:#64748b;">Net Earnings (after 10% commission):</td>
          <td style="padding:12px 16px; font-weight:800; color:#16a34a; font-size:18px; text-align:right;">₦${payoutAmount.toLocaleString()}</td>
        </tr>
      </table>

      <p>Earnings have been credited to your Kpugi Wallet and are ready for withdrawal.</p>
      <p style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com'}/creator/wallet" class="btn">View Wallet & Withdraw</a>
      </p>
    `,
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
  const actionUrl = campaignId ? `/campaigns/${campaignId}` : '/dashboard';

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

  await sendEmail({
    to: email,
    subject: `Submission Update: Verification Issue for "${campaignTitle}"`,
    html: `
      <h2 style="margin-top:0; color:#dc2626;">Verification Could Not Be Completed ⚠️</h2>
      <p>Unfortunately, your submission for campaign <strong>"${campaignTitle}"</strong> did not meet verification criteria.</p>
      
      <div style="background:#fef2f2; border:1px solid #fecaca; padding:16px; border-radius:8px; margin:16px 0; color:#991b1b;">
        <strong>Reason:</strong> ${failureReason}
      </div>

      <p>Common reasons include: failing to reach the minimum view count floor within the campaign duration, taking down or privatizing the post, or revoking social account permissions.</p>
    `,
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
  const actionUrl = campaignId ? `/campaigns/${campaignId}` : '/dashboard';

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

  await sendEmail({
    to: email,
    subject: `💰 Wallet Credited: ₦${amount.toLocaleString()} from "${campaignTitle}"`,
    html: `
      <h2 style="margin-top:0; color:#16a34a;">Wallet Credited 💵</h2>
      <p><strong>₦${amount.toLocaleString()}</strong> has been credited to your Kpugi creator earnings wallet from <strong>"${campaignTitle}"</strong>.</p>
      <p><strong>Updated Wallet Balance:</strong> ₦${newBalance.toLocaleString()}</p>
    `,
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
      action_url: '/earnings',
    },
    profileId,
  });

  await sendEmail({
    to: email,
    subject: `Bank Transfer Dispatched: ₦${amount.toLocaleString()} to ${bankName}`,
    html: `
      <h2 style="margin-top:0; color:#2563eb;">Withdrawal Dispatched 🏧</h2>
      <p>Your withdrawal request of <strong>₦${amount.toLocaleString()}</strong> has been processed and sent to your bank account via Paystack.</p>
      
      <table style="width:100%; border-collapse:collapse; margin:20px 0; background:#f8fafc; border-radius:8px;">
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 16px; color:#64748b;">Destination Bank:</td>
          <td style="padding:10px 16px; font-weight:700; text-align:right;">${bankName}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 16px; color:#64748b;">Account Number:</td>
          <td style="padding:10px 16px; font-family:monospace; text-align:right;">${accountMasked}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px; color:#64748b;">Transfer Reference:</td>
          <td style="padding:10px 16px; font-family:monospace; text-align:right;">${reference}</td>
        </tr>
      </table>
    `,
  });
}
