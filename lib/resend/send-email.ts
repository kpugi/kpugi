import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface EmailDetailRow {
  label: string;
  value: string;
  isMonospace?: boolean;
  statusBadge?: {
    text: string;
    variant?: 'green' | 'blue' | 'amber';
  };
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
  noticeText?: string;
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
  let iconBg = '#ECFDF5';
  let iconColor = '#059669';
  let iconBorder = '#A7F3D0';
  let iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  if (params.icon === 'rocket') {
    iconBg = '#EEF2FF';
    iconColor = '#4338CA';
    iconBorder = '#C7D2FE';
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71.79-1.81.79-1.81l-3.79-3.79s-1.1.08-1.79.79z"></path><path d="M12 15l-3-3 8.5-8.5c1-1 2.5-.5 3.5.5s1.5 2.5.5 3.5L12 15z"></path></svg>`;
  } else if (params.icon === 'wallet') {
    iconBg = '#ECFDF5';
    iconColor = '#059669';
    iconBorder = '#A7F3D0';
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`;
  } else if (params.icon === 'star') {
    iconBg = '#F5F3FF';
    iconColor = '#7C3AED';
    iconBorder = '#DDD6FE';
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
  } else if (params.icon === 'alert') {
    iconBg = '#FFF1F2';
    iconColor = '#E11D48';
    iconBorder = '#FECDD3';
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }

  // Render detail rows
  let detailsHtml = '';
  if (params.details && params.details.length > 0) {
    detailsHtml = params.details
      .map((d, idx) => {
        const isLast = idx === params.details!.length - 1;
        const borderStyle = isLast ? '' : 'border-bottom: 1px solid #F1F5F9;';
        
        let valueContent = d.value;
        if (d.statusBadge) {
          const badgeBg = d.statusBadge.variant === 'amber' ? '#FEF3C7' : d.statusBadge.variant === 'blue' ? '#DBEAFE' : '#DCFCE7';
          const badgeText = d.statusBadge.variant === 'amber' ? '#92400E' : d.statusBadge.variant === 'blue' ? '#1E40AF' : '#15803D';
          const dotColor = d.statusBadge.variant === 'amber' ? '#D97706' : d.statusBadge.variant === 'blue' ? '#2563EB' : '#16A34A';
          valueContent = `
            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 9999px; background-color: ${badgeBg}; color: ${badgeText}; font-size: 11px; font-weight: 700; font-family: -apple-system, sans-serif;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${dotColor};"></span>
              ${d.statusBadge.text}
            </span>`;
        }

        return `
        <tr style="${borderStyle}">
          <td style="padding: 12px 0; color: #64748B; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${d.label}</td>
          <td style="padding: 12px 0; color: #0F172A; font-size: 13px; font-weight: 700; text-align: right; ${
            d.isMonospace ? "font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;" : "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
          }">${valueContent}</td>
        </tr>`;
      })
      .join('');
  }

  // Render highlight bar inside card
  let highlightBarHtml = '';
  if (params.highlightBar) {
    const bg = params.highlightBar.bgColor || '#2563EB';
    highlightBarHtml = `
      <div style="background-color: ${bg}; border-radius: 10px; padding: 14px 18px; margin-top: 14px; display: table; width: 100%; box-sizing: border-box;">
        <div style="display: table-cell; vertical-align: middle; color: #FFFFFF; font-weight: 700; font-size: 13px; font-family: -apple-system, sans-serif;">
          ${params.highlightBar.label}
        </div>
        <div style="display: table-cell; vertical-align: middle; color: #FFFFFF; font-weight: 900; font-size: 17px; text-align: right; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;">
          ${params.highlightBar.value}
        </div>
      </div>`;
  }

  // Render CTA Button
  let ctaHtml = '';
  if (params.cta) {
    ctaHtml = `
      <div style="text-align: center; margin: 26px 0 10px 0;">
        <a href="${params.cta.url}" style="background-color: #2563EB; color: #FFFFFF; font-weight: 700; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-decoration: none; padding: 14px 36px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);">${params.cta.label}</a>
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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; margin: 0; padding: 32px 16px; color: #0F172A; -webkit-font-smoothing: antialiased;">
  ${params.previewText ? `<div style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${params.previewText}</div>` : ''}
  
  <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 18px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);">
    
    <!-- Clean Centered Brand Header -->
    <div style="background-color: #FFFFFF; padding: 28px 24px 20px 24px; text-align: center; border-bottom: 1px solid #F1F5F9;">
      <a href="${appUrl}" style="text-decoration: none; display: inline-block;">
        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 900; color: #2563EB; letter-spacing: -0.5px;">Kpugi<span style="color: #0F172A;">.</span></span>
      </a>
    </div>

    <!-- Body Content Area -->
    <div style="padding: 32px 32px 24px 32px; text-align: center;">
      
      <!-- Status Icon Badge -->
      <div style="width: 44px; height: 44px; border-radius: 50%; background-color: ${iconBg}; border: 1px solid ${iconBorder}; color: ${iconColor}; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; line-height: 44px; text-align: center;">
        <span style="display: inline-block; vertical-align: middle; margin-top: 8px;">${iconSvg}</span>
      </div>

      <!-- Headline & Subtitle -->
      <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 6px 0 10px 0; letter-spacing: -0.4px; line-height: 1.25;">
        ${params.headline}
      </h1>
      ${params.subtitle ? `<p style="font-size: 13.5px; color: #64748B; margin: 0 0 22px 0; line-height: 1.55; max-width: 420px; display: inline-block;">${params.subtitle}</p>` : ''}

      ${params.bodyHtml || ''}

      <!-- Structured Receipt / Details Card -->
      ${(params.details && params.details.length > 0) || params.highlightBar ? `
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px 20px; text-align: left; margin: 20px 0;">
        ${params.cardTitle ? `<div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">${params.cardTitle}</div>` : ''}
        
        ${params.details && params.details.length > 0 ? `
        <table style="width: 100%; border-collapse: collapse;">
          ${detailsHtml}
        </table>` : ''}

        ${highlightBarHtml}
      </div>` : ''}

      <!-- Notice / Info Statement (Only if explicitly passed) -->
      ${params.noticeText ? `
      <p style="font-size: 12.5px; color: #64748B; line-height: 1.55; margin: 16px 0 0 0; text-align: left;">
        ${params.noticeText}
      </p>` : ''}

      <!-- CTA Action Button -->
      ${ctaHtml}

    </div>

    <!-- Clean Footer -->
    <div style="background-color: #F8FAFC; padding: 24px 32px 28px 32px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B; line-height: 1.5;">
      
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #475569; font-weight: 500;">
        Got questions or need a hand? <a href="mailto:support@kpugi.com" style="color: #2563EB; text-decoration: none; font-weight: 700;">Holler at Kpugi Support</a>
      </p>

      <p style="margin: 8px 0 0 0; font-size: 11px; color: #94A3B8;">
        &copy; ${year} Kpugi Marketplace. The #1 performance ad network for creators & brands.
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
