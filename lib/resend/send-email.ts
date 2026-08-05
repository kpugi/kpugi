import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function wrapEmailHtml(content: string, previewText?: string): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const logoUrl = `${appUrl}/kpugi_logo.png`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kpugi</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #0f172a; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background-color: #0b192c; padding: 24px; text-align: center; }
    .logo-img { height: 38px; width: auto; max-width: 180px; display: inline-block; vertical-align: middle; border: 0; }
    .body { padding: 32px 24px; font-size: 15px; line-height: 1.6; color: #334155; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 16px; text-align: center; }
    .footer { background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Kpugi Logo" class="logo-img" />
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Kpugi. All rights reserved.</p>
      <p>Automated notification email. Please do not reply directly to this email.</p>
    </div>
</body>
</html>`;
}

export async function sendEmail({
  to,
  subject,
  html,
  previewText,
}: {
  to: string;
  subject: string;
  html: string;
  previewText?: string;
}) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY is not configured. Email skipped:', { to, subject });
    return { success: false, reason: 'missing_api_key' };
  }

  try {
    const fullHtml = wrapEmailHtml(html, previewText || subject);
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Kpugi <notifications@kpugi.com>',
      to: [to],
      subject,
      html: fullHtml,
    });
    return { success: true, data };
  } catch (error) {
    console.error('[Resend] Error sending email:', error);
    return { success: false, error };
  }
}
