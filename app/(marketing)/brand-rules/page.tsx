import { redirect } from 'next/navigation';
import { FRESHDESK_LINKS } from '@/lib/support/freshdesk-constants';

export const metadata = {
  title: 'Brand Rules & Campaign Compliance | Kpugi Support',
  description: 'The official source of truth, campaign compliance, and escrow operating rules for Kpugi advertisers.',
};

export default function BrandRulesPage() {
  redirect(FRESHDESK_LINKS.brandRules);
}

