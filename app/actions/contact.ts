'use server';

import { resend, sendEmail, renderReusableEmailTemplate } from '@/lib/resend/send-email';

export interface ContactInquiryInput {
  fullName: string;
  email: string;
  company?: string;
  projectType: string;
  budget?: string;
  timeline?: string;
  teamSize?: string;
  message: string;
}

export async function submitContactInquiryAction(data: ContactInquiryInput) {
  try {
    const fullName = (data.fullName || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const company = (data.company || '').trim();
    const projectType = (data.projectType || 'General Inquiry').trim();
    const budget = (data.budget || 'N/A').trim();
    const timeline = (data.timeline || 'N/A').trim();
    const teamSize = (data.teamSize || 'Standard').trim();
    const message = (data.message || '').trim();

    if (!fullName || fullName.length < 2) {
      return { success: false, message: 'Please provide your full name.' };
    }

    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    if (!message || message.length < 10) {
      return { success: false, message: 'Please provide a message with at least 10 characters.' };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@kpugi.com';

    // 1. Send Internal Notification Email to Kpugi Operations
    const internalEmailHtml = renderReusableEmailTemplate({
      to: supportEmail,
      subject: `⚡ New Contact Inquiry: [${projectType}] from ${fullName}`,
      headline: 'New Inbound Inquiry Received 📩',
      subtitle: `Received from the Kpugi Contact Portal at ${new Date().toUTCString()}`,
      cardTitle: 'Sender Information & Scope',
      details: [
        { label: 'Sender Name', value: fullName },
        { label: 'Email Address', value: email, isMonospace: true },
        { label: 'Brand / Handle', value: company || 'Not specified' },
        { label: 'Inquiry Category', value: projectType, statusBadge: { text: projectType, variant: 'blue' } },
        { label: 'Budget Tier', value: budget },
        { label: 'Channel Focus', value: timeline },
        { label: 'Timeframe / Urgency', value: teamSize },
      ],
      bodyHtml: `
        <div style="background-color: #F1F5F9; border-left: 4px solid #2F49E8; padding: 16px; border-radius: 8px; margin-top: 20px;">
          <strong style="color: #0B1026; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Message Content:</strong>
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
      `,
      cta: {
        label: `Reply to ${fullName} →`,
        url: `mailto:${email}?subject=Re: [Kpugi] ${encodeURIComponent(projectType)}`,
      },
    });

    await sendEmail({
      to: supportEmail,
      subject: `⚡ New Contact Inquiry: [${projectType}] from ${fullName}`,
      html: internalEmailHtml,
    });

    // 2. Send Acknowledgment Confirmation Email to the User
    const userConfirmationHtml = renderReusableEmailTemplate({
      to: email,
      subject: 'Message Received — The Kpugi Team is on it ⚡',
      headline: 'We received your message! ⚡',
      subtitle: `Hi ${fullName.split(' ')[0]}, thank you for reaching out to Kpugi. We review every inquiry personally.`,
      cardTitle: 'Your Inquiry Summary',
      details: [
        { label: 'Category', value: projectType, statusBadge: { text: 'In Review', variant: 'green' } },
        { label: 'Reference Email', value: email, isMonospace: true },
        { label: 'Estimated Response', value: 'Under 2 hours (Mon–Sat, 8am–8pm WAT)' },
      ],
      noticeText:
        'Need urgent campaign support or live view assistance? You can also track open tickets or chat with our knowledge base directly at support.kpugi.com.',
      cta: {
        label: 'Explore Help Center Solutions →',
        url: 'https://support.kpugi.com',
      },
    });

    await sendEmail({
      to: email,
      subject: 'Message Received — The Kpugi Team is on it ⚡',
      html: userConfirmationHtml,
    });

    return {
      success: true,
      message: 'Message sent successfully! Our team will get back to you within 2 hours.',
    };
  } catch (error: any) {
    console.error('[Contact Action Error]:', error);
    return {
      success: false,
      message: 'Failed to send message. Please email us directly at support@kpugi.com.',
    };
  }
}
