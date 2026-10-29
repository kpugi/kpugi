import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserWalletView from '@/components/advertiser/AdvertiserWalletView';
import { getBrandWalletData } from '@/lib/supabase/advertiser';
import { verifyPaystackDepositAction, verifyBachsDepositAction } from '@/app/actions/advertiser';

export const metadata: Metadata = {
  title: 'Billing & Escrow Wallet',
};

interface PageProps {
  searchParams: Promise<{
    reference?: string;
    trxref?: string;
    session_id?: string;
    processor?: string;
    cancelled?: string;
  }>;
}

export default async function BrandWalletPage({ searchParams }: PageProps) {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const resolvedParams = await searchParams;
  const rawSessionId = resolvedParams?.session_id;
  const validSessionId = rawSessionId && !rawSessionId.includes('{CHECKOUT_SESSION_ID}') && !rawSessionId.includes('%7BCHECKOUT_SESSION_ID%7D') ? rawSessionId : null;
  const rawRef = resolvedParams?.reference;
  const isBachsRef = Boolean(rawRef?.startsWith('KPG-BCH-'));

  const isBachs =
    resolvedParams?.processor === 'bachs' ||
    Boolean(validSessionId) ||
    isBachsRef;

  const bachsRef = rawRef || validSessionId || null;
  const paystackRef = !isBachs ? (rawRef || resolvedParams?.trxref || null) : null;
  let verificationNotice: { text: string; type: 'success' | 'error' } | null = null;

  if (resolvedParams?.cancelled) {
    verificationNotice = {
      text: 'Deposit was cancelled. No funds were deducted.',
      type: 'error',
    };
  } else if (isBachs && bachsRef) {
    // Pass false for shouldRevalidate to prevent revalidatePath during Server Component render
    const verifyRes = await verifyBachsDepositAction(bachsRef, false);
    if (verifyRes.success) {
      verificationNotice = {
        text: `₦${verifyRes.amount?.toLocaleString()} successfully verified & funded into your brand wallet via Bachs.io!`,
        type: 'success',
      };
    } else {
      verificationNotice = {
        text: verifyRes.error || 'Bachs payment verification failed.',
        type: 'error',
      };
    }
  } else if (paystackRef) {
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
