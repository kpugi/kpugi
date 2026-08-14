import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { getCreatorSubmissionsData } from '@/lib/supabase/creator';
import CreatorSubmissionsView from '@/components/creator/submissions/CreatorSubmissionsView';

export default async function CreatorSubmissionsPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile || !userProfile.creatorProfile) {
    redirect('/sign-in');
  }

  const data = await getCreatorSubmissionsData(
    userProfile.profile.id,
    userProfile.creatorProfile.id
  );

  return <CreatorSubmissionsView data={data} />;
}
