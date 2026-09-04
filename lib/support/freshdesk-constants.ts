export const FRESHDESK_PORTAL_URL =
  process.env.NEXT_PUBLIC_FRESHDESK_PORTAL_URL || 'https://support.kpugi.com';

/**
 * Direct links to Freshdesk hosted portals and knowledge base on custom domain
 */
export const FRESHDESK_LINKS = {
  home: `${FRESHDESK_PORTAL_URL}/support/home`,
  knowledgeBase: `${FRESHDESK_PORTAL_URL}/support/solutions`,
  rules:
    process.env.NEXT_PUBLIC_FRESHDESK_RULES_URL ||
    `${FRESHDESK_PORTAL_URL}/support/solutions/articles/68000035676-kpugi-creator-compliance-quality-standards-operating-rules`,
  brandRules:
    process.env.NEXT_PUBLIC_FRESHDESK_BRAND_RULES_URL ||
    `${FRESHDESK_PORTAL_URL}/support/solutions/articles/brand-advertiser-rules-compliance`,
  rulesCategory: `${FRESHDESK_PORTAL_URL}/support/solutions`,
  communityForums: `${FRESHDESK_PORTAL_URL}/support/discussions`,
  submitTicket: `${FRESHDESK_PORTAL_URL}/support/tickets/new`,
  myTickets: `${FRESHDESK_PORTAL_URL}/support/tickets`,
};
