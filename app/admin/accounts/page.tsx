import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import { fetchConnectedSocialAccountsAction } from '@/app/actions/admin-accounts';
import AccountsTableManager from '@/components/admin/accounts/AccountsTableManager';

export const revalidate = 0;

export default async function AdminAccountsPage() {
  await requireAdminSession();
  const data = await fetchConnectedSocialAccountsAction();

  return <AccountsTableManager initialData={data} />;
}
