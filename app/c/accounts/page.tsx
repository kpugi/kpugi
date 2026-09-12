import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { getCreatorSocialAccountsGrouped } from '@/lib/supabase/creator';
import CreatorAccountsView from '@/components/creator/accounts/CreatorAccountsView';

export const metadata: Metadata = {
  title: 'Connected Social Accounts',
};

export default async function CreatorAccountsPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const groupedAccounts = await getCreatorSocialAccountsGrouped(userProfile.profile.id);

  return <CreatorAccountsView groupedAccounts={groupedAccounts} />;
}
