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

export function renderChannelIcons(channels: string[] | undefined, appUrl?: string): string {
  if (!channels || channels.length === 0) return '';
  
  return channels
    .map((channel) => {
      const c = channel.toLowerCase().trim();
      let iconUrl = 'https://img.icons8.com/color/48/globe.png';
      let label = channel;
      let bgColor = '#F1F5F9';
      let textColor = '#334155';
      let borderColor = '#E2E8F0';

      if (c.includes('insta') || c.includes('ig')) {
        iconUrl = 'https://img.icons8.com/color/48/instagram-new.png';
        label = 'Instagram';
        bgColor = '#FDF2F8';
        textColor = '#BE185D';
        borderColor = '#FBCFE8';
      } else if (c.includes('tiktok') || c.includes('tik')) {
        iconUrl = 'https://img.icons8.com/color/48/tiktok.png';
        label = 'TikTok';
        bgColor = '#ECFDF5';
        textColor = '#047857';
        borderColor = '#A7F3D0';
      } else if (c.includes('youtube') || c.includes('yt') || c.includes('short')) {
        iconUrl = 'https://img.icons8.com/color/48/youtube-play.png';
        label = 'YouTube';
        bgColor = '#FEF2F2';
        textColor = '#B91C1C';
        borderColor = '#FEE2E2';
      } else if (c.includes('twitter') || c === 'x' || c.startsWith('x/')) {
        iconUrl = 'https://img.icons8.com/color/48/twitterx--v2.png';
        label = 'X';
        bgColor = '#F8FAFC';
        textColor = '#0F172A';
        borderColor = '#E2E8F0';
      } else if (c.includes('face') || c.includes('fb')) {
        iconUrl = 'https://img.icons8.com/color/48/facebook-new.png';
        label = 'Facebook';
        bgColor = '#EFF6FF';
        textColor = '#1D4ED8';
        borderColor = '#BFDBFE';
      } else if (c.includes('link') || c.includes('ln')) {
        iconUrl = 'https://img.icons8.com/color/48/linkedin.png';
        label = 'LinkedIn';
        bgColor = '#EFF6FF';
        textColor = '#1D4ED8';
        borderColor = '#BFDBFE';
      }

      return `<span style="display: inline-block; padding: 4px 10px; border-radius: 6px; background-color: ${bgColor}; color: ${textColor}; font-size: 12px; font-weight: 700; margin-right: 6px; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; border: 1px solid ${borderColor}; vertical-align: middle;"><img src="${iconUrl}" alt="" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 5px; border: 0;" />${label}</span>`;
    })
    .join('');
}

export function renderReusableEmailTemplate(params: ReusableEmailParams): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const year = new Date().getFullYear();

  // Render detail rows in a clean, stacked line-by-line mobile-first layout
  let detailsHtml = '';
  if (params.details && params.details.length > 0) {
    detailsHtml = params.details
      .map((d, idx) => {
        const isLast = idx === params.details!.length - 1;
        const marginBottom = isLast ? '0' : '18px';
        
        let valueContent = d.value;
        if (d.statusBadge) {
          const badgeBg = d.statusBadge.variant === 'amber' ? '#FEF3C7' : d.statusBadge.variant === 'blue' ? '#DBEAFE' : '#DCFCE7';
          const badgeText = d.statusBadge.variant === 'amber' ? '#92400E' : d.statusBadge.variant === 'blue' ? '#1E40AF' : '#15803D';
          const dotColor = d.statusBadge.variant === 'amber' ? '#D97706' : d.statusBadge.variant === 'blue' ? '#2563EB' : '#16A34A';
          valueContent = `
            <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: ${badgeBg}; color: ${badgeText}; font-size: 12px; font-weight: 700; font-family: -apple-system, sans-serif;">
              <span style="color: ${dotColor}; margin-right: 4px;">●</span>${d.statusBadge.text}
            </span>`;
        }

        return `
        <div style="margin-bottom: ${marginBottom}; text-align: left;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 0.6px; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${d.label}
          </div>
          <div style="font-size: 15px; font-weight: 700; color: #0F172A; line-height: 1.4; ${
            d.isMonospace ? "font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;" : "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
          }">
            ${valueContent}
          </div>
        </div>`;
      })
      .join('');
  }

  // Render highlight bar (if applicable)
  let highlightBarHtml = '';
  if (params.highlightBar) {
    const bg = params.highlightBar.bgColor || '#2563EB';
    highlightBarHtml = `
      <div style="background-color: ${bg}; border-radius: 10px; padding: 14px 18px; margin-top: 16px; text-align: left; box-sizing: border-box;">
        <div style="color: rgba(255, 255, 255, 0.85); font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-family: -apple-system, sans-serif;">
          ${params.highlightBar.label}
        </div>
        <div style="color: #FFFFFF; font-weight: 900; font-size: 20px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;">
          ${params.highlightBar.value}
        </div>
      </div>`;
  }

  // Render CTA Button
  let ctaHtml = '';
  if (params.cta) {
    ctaHtml = `
      <div style="text-align: center; margin: 26px 0 10px 0;">
        <a href="${params.cta.url}" style="background-color: #2563EB; color: #FFFFFF; font-weight: 700; font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-decoration: none; padding: 14px 28px; border-radius: 10px; display: block; box-sizing: border-box; text-align: center; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);">${params.cta.label}</a>
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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 28px 16px; color: #0F172A; -webkit-font-smoothing: antialiased;">
  ${params.previewText ? `<div style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${params.previewText}</div>` : ''}
  
  <div style="max-width: 500px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
    
    <!-- Clean Centered Brand Header -->
    <div style="background-color: #FFFFFF; padding: 24px 24px 20px 24px; text-align: center; border-bottom: 1px solid #F1F5F9;">
      <a href="${appUrl}" style="text-decoration: none; display: inline-block;">
        <img src="${appUrl}/kpugi_logo.png" alt="Kpugi." style="display: block; height: 32px; border: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 28px; font-weight: 900; color: #2563EB; letter-spacing: -1px; line-height: 1; text-decoration: none;" />
      </a>
    </div>

    <!-- Body Content Area -->
    <div style="padding: 28px 24px 24px 24px; text-align: left;">
      
      <!-- Headline & Subtitle -->
      <h1 style="font-size: 21px; font-weight: 800; color: #0F172A; margin: 0 0 10px 0; letter-spacing: -0.4px; line-height: 1.3;">
        ${params.headline}
      </h1>
      ${params.subtitle ? `<p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.55;">${params.subtitle}</p>` : ''}

      ${params.bodyHtml || ''}

      <!-- Clean Line-by-Line Details Section -->
      ${(params.details && params.details.length > 0) || params.highlightBar ? `
      <div style="border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; padding: 20px 0; margin: 20px 0;">
        ${params.cardTitle ? `<div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94A3B8; letter-spacing: 0.6px; margin-bottom: 16px;">${params.cardTitle}</div>` : ''}
        
        ${detailsHtml}

        ${highlightBarHtml}
      </div>` : ''}

      <!-- Notice / Info Statement (Only if explicitly passed) -->
      ${params.noticeText ? `
      <p style="font-size: 13px; color: #64748B; line-height: 1.55; margin: 16px 0 0 0; text-align: left;">
        ${params.noticeText}
      </p>` : ''}

      <!-- CTA Action Button -->
      ${ctaHtml}

    </div>

    <!-- Clean Footer -->
    <div style="background-color: #F8FAFC; padding: 20px 24px 24px 24px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B; line-height: 1.5;">
      <p style="margin: 0 0 10px 0; font-size: 12.5px; color: #475569; font-weight: 500;">
        Got questions or need a hand? <a href="mailto:support@kpugi.com" style="color: #2563EB; text-decoration: none; font-weight: 700;">Holla at us</a>
      </p>

      <p style="margin: 0; font-size: 11px; color: #94A3B8;">
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
}): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY is missing. Email skipped:', { to, subject });
    return { success: false, error: 'missing_api_key' };
  }

  try {
    const fromAddress =
      process.env.RESEND_FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      'Tuazor From Kpugi <hello@kpugi.com>';

    const result = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error('[Resend Error Response]:', { to, subject, error: result.error });
      return { success: false, error: result.error };
    }

    console.log('[Resend Email Sent Successfully]:', { to, subject, id: result.data?.id });
    return { success: true, data: result.data };
  } catch (error) {
    console.error('[Resend Exception Sending Email]:', error);
    return { success: false, error };
  }
}
