import React from 'react';
import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';

export default function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutShell role="advertiser">
      {children}
    </DashboardLayoutShell>
  );
}
