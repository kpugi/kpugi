import React from 'react';
import type { Metadata } from 'next';
import { requireAdminSession } from '@/lib/admin/auth';
import { fetchBroadcastsAction } from '@/app/actions/admin-broadcasts';
import BroadcastsManager from '@/components/admin/broadcasts/BroadcastsManager';

export const metadata: Metadata = {
  title: 'Platform Broadcasts & Announcements — Kpugi Admin',
};

export const revalidate = 0;

export default async function AdminBroadcastsPage() {
  await requireAdminSession();
  const initialData = await fetchBroadcastsAction();

  return <BroadcastsManager initialData={initialData} />;
}
