'use server';

import { resend, sendEmail, renderReusableEmailTemplate } from '@/lib/resend/send-email';

export interface BannerAdInquiryInput {
  fullName: string;
  email: string;
  company: string;
  placementFormat: string;
  targetAudience: string;
  duration: string;
  budgetRange: string;
  message: string;
}

export async function submitBannerAdInquiryAction(data: BannerAdInquiryInput) {
  try {
    const fullName = (data.fullName || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const company = (data.company || '').trim();
    const placementFormat = (data.placementFormat || 'Leaderboard / Billboard').trim();
    const targetAudience = (data.targetAudience || 'Both Audiences').trim();
    const duration = (data.duration || '2 Weeks').trim();
    const budgetRange = (data.budgetRange || '₦500,000 – ₦1,500,000').trim();
    const message = (data.message || '').trim();

    if (!fullName || fullName.length < 2) {
      return { success: false, message: 'Please provide your full name or media contact.' };
    }

    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please provide a valid business email address.' };
    }

    if (!company || company.length < 2) {
      return { success: false, message: 'Please provide your brand or company name.' };
    }

    const adSalesEmail = process.env.AD_SALES_EMAIL || process.env.SUPPORT_EMAIL || 'brands@kpugi.com';

    // 1. Send Internal Notification Email to Kpugi Ad Sales
    const internalEmailHtml = renderReusableEmailTemplate({
      to: adSalesEmail,
      subject: `🎯 New On-Platform Ad Booking Request: [${placementFormat}] from ${company}`,
      headline: 'New Banner & Sponsorship Booking Inquiry 🚀',
      subtitle: `Received via Kpugi Advertise Portal on ${new Date().toUTCString()}`,
      cardTitle: 'Placement & Advertiser Scope',
      details: [
        { label: 'Company / Brand', value: company },
        { label: 'Contact Person', value: fullName },
        { label: 'Work Email', value: email, isMonospace: true },
        { label: 'Ad Format / Placement', value: placementFormat, statusBadge: { text: placementFormat, variant: 'blue' } },
        { label: 'Target Demographic', value: targetAudience },
        { label: 'Flight Duration', value: duration },
        { label: 'Planned Budget', value: budgetRange, statusBadge: { text: budgetRange, variant: 'green' } },
      ],
      bodyHtml: `
        <div style="background-color: #F1F5F9; border-left: 4px solid #2F49E8; padding: 16px; border-radius: 8px; margin-top: 20px;">
          <strong style="color: #0B1026; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Creative Brief / Notes:</strong>
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message || 'No additional notes provided.'}</p>
        </div>
      `,
      cta: {
        label: `Review & Reply to ${company} →`,
        url: `mailto:${email}?subject=Re: [Kpugi Ads] On-Platform Sponsorship Inquiry for ${encodeURIComponent(company)}`,
      },
    });

    await sendEmail({
      to: adSalesEmail,
      subject: `🎯 New On-Platform Ad Booking Request: [${placementFormat}] from ${company}`,
      html: internalEmailHtml,
    });

    // 2. Send Acknowledgment Confirmation Email to Advertiser
    const advertiserConfirmationHtml = renderReusableEmailTemplate({
      to: email,
      subject: 'Placement Inquiry Received — Kpugi Ad Operations 🎯',
      headline: 'We received your ad booking inquiry! ⚡',
      subtitle: `Hi ${fullName.split(' ')[0]}, thank you for your interest in advertising on Kpugi. Our ad operations team will review your placement request.`,
      cardTitle: 'Your Requested Placement Summary',
      details: [
        { label: 'Brand Name', value: company },
        { label: 'Requested Placement', value: placementFormat, statusBadge: { text: 'In Review', variant: 'blue' } },
        { label: 'Target Audience', value: targetAudience },
        { label: 'Estimated Turnaround', value: 'Ad Flight Review within 24 hours' },
      ],
      noticeText:
        'Our ad ops team will provide creative asset specifications, tracking tag setup instructions, and confirm available inventory dates.',
      cta: {
        label: 'Explore Kpugi Marketplace →',
        url: 'https://kpugi.com/browse',
      },
    });

    await sendEmail({
      to: email,
      subject: 'Placement Inquiry Received — Kpugi Ad Operations 🎯',
      html: advertiserConfirmationHtml,
    });

    return {
      success: true,
      message: 'Ad placement inquiry received! Our ad operations desk will contact you within 24 hours with flight availability.',
    };
  } catch (error: any) {
    console.error('[Banner Ad Action Error]:', error);
    return {
      success: false,
      message: 'Failed to submit inquiry. Please email us directly at brands@kpugi.com.',
    };
  }
}
