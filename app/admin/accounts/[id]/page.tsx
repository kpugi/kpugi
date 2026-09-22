import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin/auth';
import { fetchSocialAccountDetailAction } from '@/app/actions/admin-accounts';
import AccountDetailView from '@/components/admin/accounts/AccountDetailView';

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Connected Social Account #${id.slice(0, 8)} — Kpugi Admin`,
  };
}

export default async function AdminAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;

  try {
    const detailData = await fetchSocialAccountDetailAction(id);
    return <AccountDetailView initialData={detailData} />;
  } catch (err: any) {
    console.error('[AdminAccountDetailPage] Failed to fetch account:', err);
    notFound();
  }
}
