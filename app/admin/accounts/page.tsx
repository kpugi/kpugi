import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import { fetchConnectedSocialAccountsAction } from '@/app/actions/admin-accounts';
import AccountsTableManager from '@/components/admin/accounts/AccountsTableManager';

export const revalidate = 0;

interface AdminAccountsPageProps {
  searchParams?: Promise<{ platform?: string }>;
}

export default async function AdminAccountsPage({ searchParams }: AdminAccountsPageProps) {
  await requireAdminSession();
  const resolvedParams = searchParams ? await searchParams : {};
  const data = await fetchConnectedSocialAccountsAction();

  return (
    <AccountsTableManager
      initialData={data}
      initialPlatform={resolvedParams.platform}
    />
  );
}
