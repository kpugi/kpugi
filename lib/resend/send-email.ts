import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY is not configured. Email skipped:', { to, subject });
    return { success: false, reason: 'missing_api_key' };
  }

  try {
    const data = await resend.emails.send({
      from: 'Kpugi <notifications@kpugi.com>',
      to: [to],
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('[Resend] Error sending email:', error);
    return { success: false, error };
  }
}
