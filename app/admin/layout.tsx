import React from 'react';
import type { Metadata } from 'next';
import { getAdminSessionSafe } from '@/lib/admin/auth';
import AdminAccessDenied from '@/components/admin/AdminAccessDenied';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export const metadata: Metadata = {
  title: 'Kpugi Admin Console',
  description: 'Internal operations, campaign management, submissions, and audit log',
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
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex antialiased selection:bg-indigo-500/30">
      {/* Standalone Admin Sidebar */}
      <AdminSidebar profile={session.profile} />

      {/* Main Admin Content Stage */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#07090E]">
        <AdminHeader />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
