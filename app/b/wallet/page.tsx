import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserWalletView from '@/components/advertiser/AdvertiserWalletView';
import { getBrandWalletData } from '@/lib/supabase/advertiser';
import { verifyPaystackDepositAction } from '@/app/actions/advertiser';

interface PageProps {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}

export default async function BrandWalletPage({ searchParams }: PageProps) {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const resolvedParams = await searchParams;
  const paystackRef = resolvedParams?.reference || resolvedParams?.trxref || null;
  let verificationNotice: { text: string; type: 'success' | 'error' } | null = null;

  if (paystackRef) {
    // Pass false for shouldRevalidate to prevent revalidatePath during Server Component render
    const verifyRes = await verifyPaystackDepositAction(paystackRef, false);
    if (verifyRes.success) {
      verificationNotice = {
        text: `₦${verifyRes.amount?.toLocaleString()} successfully verified & funded into your brand wallet!`,
        type: 'success',
      };
    } else {
      verificationNotice = {
        text: verifyRes.error || 'Payment verification failed.',
        type: 'error',
      };
    }
  }

  const data = await getBrandWalletData(userProfile.profile.id);

  return <AdvertiserWalletView data={data} verificationNotice={verificationNotice} />;
}
