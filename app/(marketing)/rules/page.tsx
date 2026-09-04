import { redirect } from 'next/navigation';
import { FRESHDESK_LINKS } from '@/lib/support/freshdesk-constants';

export const metadata = {
  title: 'Platform Rules & Creator Compliance | Kpugi Support',
  description: 'The official source of truth and compliance rules for Kpugi creators and advertisers.',
};

export default function RulesPage() {
  redirect(FRESHDESK_LINKS.rules);
}
