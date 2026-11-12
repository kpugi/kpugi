import { createAdminClient } from '@/lib/supabase/server';

export interface TrustpilotBccDecision {
  shouldBcc: boolean;
  bccAddress?: string;
  reason:
    | 'bcc_not_configured'
    | 'bcc_disabled'
    | 'first_payout'
    | 'repeat_payout_capped'
    | 'first_campaign_completed'
    | 'repeat_campaign_capped'
    | 'forced'
    | 'default_allowed';
}

export interface TrustpilotJsonLdParams {
  html: string;
  recipientEmail: string;
  recipientName?: string;
  referenceId?: string;
  tags?: string[];
}

/**
 * Returns the Trustpilot Automatic Feedback Service (AFS) BCC email address from the server environment.
 * Kept strictly on the backend to avoid leaking the invitation address into frontend bundles.
 */
export function getTrustpilotBccAddress(): string | null {
  const address = process.env.TRUSTPILOT_BCC?.trim();
  return address && address.length > 0 ? address : null;
}

/**
 * Checks whether Trustpilot BCC is globally enabled via environment variables.
 */
export function isTrustpilotBccEnabled(): boolean {
  if (process.env.TRUSTPILOT_BCC_ENABLED === 'false') {
    return false;
  }
  return getTrustpilotBccAddress() !== null;
}

/**
 * Decides whether Trustpilot BCC should be attached to a creator's payout email.
 *
 * To prevent depleting Trustpilot's free plan invitation quotas (which cap monthly invites),
 * this defaults to only triggering on a creator's first completed payout.
 * Can be relaxed by setting TRUSTPILOT_BCC_FIRST_ONLY=false.
 */
export async function shouldSendTrustpilotBccForCreatorPayout({
  profileId,
  force = false,
}: {
  profileId?: string;
  force?: boolean;
}): Promise<TrustpilotBccDecision> {
  const bccAddress = getTrustpilotBccAddress();

  if (!bccAddress) {
    return { shouldBcc: false, reason: 'bcc_not_configured' };
  }

  if (process.env.TRUSTPILOT_BCC_ENABLED === 'false') {
    return { shouldBcc: false, reason: 'bcc_disabled' };
  }

  if (force) {
    return { shouldBcc: true, bccAddress, reason: 'forced' };
  }

  const firstOnly = process.env.TRUSTPILOT_BCC_FIRST_ONLY !== 'false';

  // If firstOnly is not active, allow every payout
  if (!firstOnly || !profileId) {
    return { shouldBcc: true, bccAddress, reason: 'default_allowed' };
  }

  try {
    const supabase = createAdminClient();

    // Count previously completed/paid payout requests for this creator
    const { count, error } = await supabase
      .from('payout_requests')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .in('status', ['paid', 'completed']);

    if (error) {
      console.warn('[Trustpilot BCC] Error checking previous payouts for creator:', error);
      // Fail-safe: allow BCC if check fails, or default to true
      return { shouldBcc: true, bccAddress, reason: 'first_payout' };
    }

    // If count is greater than 1, they have already had completed payouts before
    // (count === 1 means the currently completed payout is their first ever)
    if (count !== null && count > 1) {
      console.log(
        `[Trustpilot BCC] Creator ${profileId} already has ${count} completed payouts. Skipping BCC to protect monthly invitation quota.`
      );
      return { shouldBcc: false, reason: 'repeat_payout_capped' };
    }

    return { shouldBcc: true, bccAddress, reason: 'first_payout' };
  } catch (err) {
    console.warn('[Trustpilot BCC] Exception in shouldSendTrustpilotBccForCreatorPayout:', err);
    return { shouldBcc: true, bccAddress, reason: 'first_payout' };
  }
}

/**
 * Decides whether Trustpilot BCC should be attached to a brand's campaign completion email.
 *
 * Free plan quota protection: triggers on the brand's first completed campaign drop by default.
 * Can be relaxed by setting TRUSTPILOT_BCC_FIRST_ONLY=false.
 */
export async function shouldSendTrustpilotBccForBrandCampaign({
  profileId,
  force = false,
}: {
  profileId?: string;
  force?: boolean;
}): Promise<TrustpilotBccDecision> {
  const bccAddress = getTrustpilotBccAddress();

  if (!bccAddress) {
    return { shouldBcc: false, reason: 'bcc_not_configured' };
  }

  if (process.env.TRUSTPILOT_BCC_ENABLED === 'false') {
    return { shouldBcc: false, reason: 'bcc_disabled' };
  }

  if (force) {
    return { shouldBcc: true, bccAddress, reason: 'forced' };
  }

  const firstOnly = process.env.TRUSTPILOT_BCC_FIRST_ONLY !== 'false';

  // If firstOnly is not active, allow every completed campaign
  if (!firstOnly || !profileId) {
    return { shouldBcc: true, bccAddress, reason: 'default_allowed' };
  }

  try {
    const supabase = createAdminClient();

    // Count previously completed campaigns for this brand/advertiser
    const { count, error } = await supabase
      .from('campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('advertiser_id', profileId)
      .eq('status', 'completed');

    if (error) {
      console.warn('[Trustpilot BCC] Error checking previous campaigns for advertiser:', error);
      return { shouldBcc: true, bccAddress, reason: 'first_campaign_completed' };
    }

    // If count > 1, brand has already completed campaigns prior to this one
    if (count !== null && count > 1) {
      console.log(
        `[Trustpilot BCC] Brand ${profileId} already has ${count} completed campaigns. Skipping BCC to protect monthly invitation quota.`
      );
      return { shouldBcc: false, reason: 'repeat_campaign_capped' };
    }

    return { shouldBcc: true, bccAddress, reason: 'first_campaign_completed' };
  } catch (err) {
    console.warn('[Trustpilot BCC] Exception in shouldSendTrustpilotBccForBrandCampaign:', err);
    return { shouldBcc: true, bccAddress, reason: 'first_campaign_completed' };
  }
}

/**
 * Injects Trustpilot's official Automatic Feedback Service (AFS) JSON-LD script snippet.
 * When Trustpilot's invitation parser reads the BCC'd email, it extracts recipient name,
 * email, order/payout reference, and tags to accurately generate the review invitation.
 */
export function embedTrustpilotJsonLd({
  html,
  recipientEmail,
  recipientName,
  referenceId,
  tags = [],
}: TrustpilotJsonLdParams): string {
  const cleanName = recipientName ? recipientName.replace(/^@/, '') : 'Valued Customer';
  const cleanEmail = recipientEmail.trim();
  const cleanRef = referenceId || `ref-${Date.now()}`;

  const jsonLdData: Record<string, any> = {
    recipientEmail: cleanEmail,
    recipientName: cleanName,
    referenceId: cleanRef,
  };

  const templateId =
    process.env.TRUSTPILOT_TEMPLATE_ID || process.env.NEXT_PUBLIC_TRUSTPILOT_TEMPLATE_ID;
  if (templateId) {
    jsonLdData.templateId = templateId;
  }

  if (tags && tags.length > 0) {
    jsonLdData.tags = tags;
  }

  const scriptTag = `
<!-- Trustpilot Automatic Feedback Service (AFS) Structured Data -->
<script type="application/json+trustpilot">
${JSON.stringify(jsonLdData, null, 2)}
</script>
`;

  // Insert before </body> if present, or append to HTML
  if (html.includes('</body>')) {
    return html.replace('</body>', `${scriptTag}\n</body>`);
  }

  return `${html}\n${scriptTag}`;
}

