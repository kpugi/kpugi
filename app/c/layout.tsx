import React from 'react';
import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutShell role="creator">
      {children}
    </DashboardLayoutShell>
  );
}
