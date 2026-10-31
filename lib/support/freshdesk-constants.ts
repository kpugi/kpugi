import { STATUS_PAGE_URL } from '@/lib/constants/site';

export { STATUS_PAGE_URL };

export const FRESHDESK_PORTAL_URL =
  process.env.NEXT_PUBLIC_FRESHDESK_PORTAL_URL || 'https://hub.kpugi.com';

/**
 * Direct links to Kpugi Hub knowledge base and platform compliance rules
 */
export const FRESHDESK_LINKS = {
  home: 'https://hub.kpugi.com',
  knowledgeBase: 'https://hub.kpugi.com/docs/',
  rules:
    process.env.NEXT_PUBLIC_FRESHDESK_RULES_URL ||
    'https://hub.kpugi.com/docs/kpugi-creator-compliance-quality-standards-operating-rules/',
  brandRules:
    process.env.NEXT_PUBLIC_FRESHDESK_BRAND_RULES_URL ||
    'https://hub.kpugi.com/docs/kpugi-brand-advertiser-operating-rules-campaign-compliance-escrow-standards/',
  rulesCategory: 'https://hub.kpugi.com/docs/category/understanding-kpugis-platform/',
  communityForums: 'https://hub.kpugi.com/community',
  submitTicket: 'https://hub.kpugi.com/support/',
  myTickets: 'https://hub.kpugi.com/support/',
  statusPage: STATUS_PAGE_URL,
};

