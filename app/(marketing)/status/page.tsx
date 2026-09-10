import { redirect } from 'next/navigation';
import { STATUS_PAGE_URL } from '@/lib/constants/site';

export const metadata = {
  title: 'Platform Operational Status | Kpugi Systems',
  description: 'Real-time operational status for Kpugi systems and services.',
};

export default function StatusPage() {
  redirect(STATUS_PAGE_URL);
}
