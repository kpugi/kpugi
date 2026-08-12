import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface EmailDetailRow {
  label: string;
  value: string;
  isMonospace?: boolean;
}

export interface ReusableEmailParams {
  to: string;
  subject: string;
  previewText?: string;
  icon?: 'check' | 'wallet' | 'rocket' | 'star' | 'alert';
  headline: string;
  subtitle?: string;
  cardTitle?: string;
  details?: EmailDetailRow[];
  highlightBar?: {
    label: string;
    value: string;
    bgColor?: string;
  };
  cta?: {
    label: string;
    url: string;
    subtext?: string;
  };
  bodyHtml?: string;
  footerNote?: string;
}

export function renderReusableEmailTemplate(params: ReusableEmailParams): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const logoUrl = `${appUrl}/kpugi_logo.png`;
  const year = new Date().getFullYear();

  // Status icon configuration
  let iconBg = '#EEF2FF';
  let iconColor = '#2563EB';
  let iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  if (params.icon === 'wallet') {
    iconBg = '#ECFDF5';
    iconColor = '#10B981';
    iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`;
  } else if (params.icon === 'rocket') {
    iconBg = '#EEF2FF';
    iconColor = '#4338CA';
    iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71.79-1.81.79-1.81l-3.79-3.79s-1.1.08-1.79.79z"></path><path d="M12 15l-3-3 8.5-8.5c1-1 2.5-.5 3.5.5s1.5 2.5.5 3.5L12 15z"></path></svg>`;
  } else if (params.icon === 'star') {
    iconBg = '#F3E8FF';
    iconColor = '#7C3AED';
    iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
  } else if (params.icon === 'alert') {
    iconBg = '#FFE4E6';
    iconColor = '#E11D48';
    iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }

  // Render detail rows
  let detailsHtml = '';
  if (params.details && params.details.length > 0) {
    detailsHtml = params.details
      .map(
        (d) => `
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 11px 0; color: #64748B; font-size: 13px; font-weight: 500;">${d.label}</td>
          <td style="padding: 11px 0; color: #0F172A; font-size: 13px; font-weight: 700; text-align: right; ${
            d.isMonospace ? "font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;" : ''
          }">${d.value}</td>
        </tr>`
      )
      .join('');
  }

  // Render highlight bar inside card
  let highlightBarHtml = '';
  if (params.highlightBar) {
    const bg = params.highlightBar.bgColor || '#2563EB';
    highlightBarHtml = `
      <div style="background-color: ${bg}; border-radius: 8px; padding: 14px 18px; margin-top: 14px; display: table; width: 100%; box-sizing: border-box;">
        <div style="display: table-cell; vertical-align: middle; color: #FFFFFF; font-weight: 700; font-size: 14px;">
          ${params.highlightBar.label}
        </div>
        <div style="display: table-cell; vertical-align: middle; color: #FFFFFF; font-weight: 900; font-size: 18px; text-align: right; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;">
          ${params.highlightBar.value}
        </div>
      </div>`;
  }

  // Render CTA Button
  let ctaHtml = '';
  if (params.cta) {
    ctaHtml = `
      <div style="text-align: center; margin: 28px 0 12px 0;">
        <a href="${params.cta.url}" style="background-color: #2563EB; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">${params.cta.label}</a>
        ${params.cta.subtext ? `<p style="font-size: 12px; color: #94A3B8; margin-top: 12px; margin-bottom: 0;">${params.cta.subtext}</p>` : ''}
      </div>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #EBEBF5; margin: 0; padding: 32px 16px; color: #0F172A;">
  ${params.previewText ? `<div style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${params.previewText}</div>` : ''}
  
  <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);">
    
    <!-- Bold Prominent Top Header -->
    <div style="background-color: #FFFFFF; padding: 24px; text-align: center; border-bottom: 1px solid #F1F5F9;">
      <img src="${logoUrl}" alt="Kpugi Logo" style="height: 48px; width: auto; max-width: 220px; display: inline-block; border: 0;" />
    </div>

    <!-- Body Content Area -->
    <div style="padding: 36px 32px 28px 32px; text-align: center;">
      
      <!-- Dynamic Status Icon -->
      <div style="width: 48px; height: 48px; border-radius: 50%; background-color: ${iconBg}; color: ${iconColor}; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; line-height: 48px; text-align: center;">
        <span style="display: inline-block; vertical-align: middle; margin-top: 10px;">${iconSvg}</span>
      </div>

      <!-- Gen Z Headline & Subtitle -->
      <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 8px 0; letter-spacing: -0.5px; line-height: 1.2;">
        ${params.headline}
      </h1>
      ${params.subtitle ? `<p style="font-size: 14px; color: #64748B; margin: 0 0 24px 0; line-height: 1.5;">${params.subtitle}</p>` : ''}

      ${params.bodyHtml || ''}

      <!-- Structured Transaction / Details Card -->
      ${(params.details && params.details.length > 0) || params.highlightBar ? `
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; text-align: left; margin-top: 20px;">
        ${params.cardTitle ? `<div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">${params.cardTitle}</div>` : ''}
        
        ${params.details && params.details.length > 0 ? `
        <table style="width: 100%; border-collapse: collapse;">
          ${detailsHtml}
        </table>` : ''}

        ${highlightBarHtml}
      </div>` : ''}

      <!-- CTA Action Button -->
      ${ctaHtml}

    </div>

    <!-- Footer Security Note -->
    <div style="background-color: #FFFFFF; padding: 24px 32px 32px 32px; text-align: center; border-top: 1px solid #F1F5F9; font-size: 12px; color: #64748B; line-height: 1.5;">
      
      <div style="margin-bottom: 12px; color: #94A3B8;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </div>

      <p style="margin: 0 0 16px 0; color: #64748B; font-size: 12px; max-width: 440px; display: inline-block;">
        ${params.footerNote || 'Kpugi provides secure, objective escrow services for media planning. Your funds are held securely until contractual milestones are met.'}
      </p>

      <div style="margin-bottom: 12px;">
        <a href="${appUrl}/dashboard" style="color: #2563EB; text-decoration: none; font-weight: 600;">Dashboard</a>
        &nbsp;&nbsp;•&nbsp;&nbsp;
        <a href="${appUrl}/support" style="color: #2563EB; text-decoration: none; font-weight: 600;">Support</a>
        &nbsp;&nbsp;•&nbsp;&nbsp;
        <a href="${appUrl}/privacy" style="color: #2563EB; text-decoration: none; font-weight: 600;">Privacy Policy</a>
      </div>

      <p style="margin: 0; font-size: 11px; color: #94A3B8;">
        &copy; ${year} Kpugi Marketplace. Secure Escrow for Media Planning.
      </p>
    </div>

  </div>
</body>
</html>`;
}

export function wrapEmailHtml(content: string, previewText?: string): string {
  return renderReusableEmailTemplate({
    to: '',
    subject: 'Kpugi Notification',
    previewText,
    headline: 'Notification Update',
    bodyHtml: content,
  });
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
    const fullHtml = html.includes('<!DOCTYPE html>') ? html : wrapEmailHtml(html, previewText || subject);
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Kpugi <onboarding@resend.dev>',
      to: [to],
      subject,
      html: fullHtml,
    });
    console.log('[Resend Email Sent Successfully]:', { to, subject, data });
    return { success: true, data };
  } catch (error) {
    console.error('[Resend] Error sending email:', error);
    return { success: false, error };
  }
}
