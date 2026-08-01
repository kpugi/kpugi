import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { getCreatorProfileSettings } from '@/lib/supabase/creator';
import CreatorSettingsView from '@/components/creator/settings/CreatorSettingsView';

export default async function SettingsPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const profile = await getCreatorProfileSettings(userProfile.profile.id);

  return <CreatorSettingsView payload={profile} />;
}
