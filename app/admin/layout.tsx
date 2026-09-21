import React from 'react';
import type { Metadata } from 'next';
import { getAdminSessionSafe } from '@/lib/admin/auth';
import AdminAccessDenied from '@/components/admin/AdminAccessDenied';
import AdminShell from '@/components/admin/layout/AdminShell';
import '@/styles/tailadmin.css';

export const metadata: Metadata = {
  title: 'Kpugi Admin Console',
  description: 'TailAdmin-powered internal operations, campaign management, submissions, and audit log',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, error } = await getAdminSessionSafe();

  if (!session) {
    return <AdminAccessDenied error={error || 'Admin clearance verification failed'} />;
  }

  return (
    <AdminShell profile={session.profile}>
      {children}
    </AdminShell>
  );
}
