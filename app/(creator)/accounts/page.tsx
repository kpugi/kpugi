import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { getCreatorSocialAccounts } from '@/lib/supabase/creator';
import CreatorAccountsView from '@/components/creator/accounts/CreatorAccountsView';

export default async function AccountsPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const socialAccounts = await getCreatorSocialAccounts(userProfile.profile.id);

  return <CreatorAccountsView socialAccounts={socialAccounts} />;
}
