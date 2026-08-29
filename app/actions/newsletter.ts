'use server';

import { resend, sendEmail, renderReusableEmailTemplate } from '@/lib/resend/send-email';

export async function subscribeToNewsletterAction(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Add to Resend Contacts List if Resend client is initialized
    if (resend) {
      const audienceId = process.env.RESEND_AUDIENCE_ID || '';
      try {
        if (audienceId) {
          await resend.contacts.create({
            email: cleanEmail,
            unsubscribed: false,
            audienceId: audienceId,
          });
        }
      } catch (contactErr: any) {
        console.warn('Resend contact create note:', contactErr?.message || contactErr);
      }
    }

    // 2. Send a Gen-Z high-energy Welcome Email to the Subscriber via Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';
    const welcomeHtml = renderReusableEmailTemplate({
      to: cleanEmail,
      subject: '🔥 YOU ARE LOCKED IN! Welcome to Kpugi Drop Alerts',
      headline: 'DROP ALERTS LOCKED IN! ⚡',
      subtitle: 'You are now officially subscribed to the #1 performance ad network turning views into direct cash.',
      cardTitle: 'Subscription Details',
      details: [
        { label: 'Subscriber Email', value: cleanEmail, isMonospace: true },
        { label: 'Status', value: 'Active', statusBadge: { text: 'Subscribed ⚡', variant: 'green' } },
        { label: 'Alert Frequency', value: 'Instant Drop Alerts' },
      ],
      noticeText: 'Get ready for high-yield creator drops and verified performance campaigns delivered straight to your inbox.',
      cta: {
        label: 'Browse Active Drops →',
        url: `${appUrl}/browse`,
      },
    });

    await sendEmail({
      to: cleanEmail,
      subject: '🔥 YOU ARE LOCKED IN! Welcome to Kpugi Drop Alerts',
      html: welcomeHtml,
    });

    return {
      success: true,
      message: 'Subscribed! Check your inbox for drop alerts ⚡',
    };
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return {
      success: true,
      message: 'Subscribed! Check your inbox for drop alerts ⚡',
    };
  }
}
