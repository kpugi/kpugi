import { redirect } from 'next/navigation';
import { FRESHDESK_LINKS } from '@/lib/support/freshdesk-constants';

export const metadata = {
  title: 'Community Forum | Kpugi Hub',
  description: 'Join the Kpugi creator and advertiser community forum on Kpugi Hub.',
};

export default function CommunityPage() {
  redirect(FRESHDESK_LINKS.communityForums);
}

