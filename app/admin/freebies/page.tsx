import React from 'react';
import type { Metadata } from 'next';
import { requireAdminSession } from '@/lib/admin/auth';
import AdminFreebiesView from '@/components/admin/freebies/AdminFreebiesView';
import {
  adminGetAllPerks,
  adminGetPendingClaims,
  adminGetPerkMetrics,
} from '@/lib/supabase/perks';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Freebies & Perks Control Center — Kpugi Admin',
  description: 'Deploy creator challenges, coupons, software deals, and bonuses. Review proof submissions and trigger instant wallet payouts.',
};

export default async function AdminFreebiesPage() {
  const { profile } = await requireAdminSession();

  const [perks, pendingClaims, metrics] = await Promise.all([
    adminGetAllPerks(),
    adminGetPendingClaims(),
    adminGetPerkMetrics(),
  ]);

  return (
    <AdminFreebiesView
      perks={perks}
      pendingClaims={pendingClaims}
      metrics={metrics}
      adminId={profile.id}
    />
  );
}
