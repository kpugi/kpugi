import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import { getPlatformSettings } from '@/lib/admin/platform-settings-service';
import { getIntegrationsStatusAction } from '@/app/actions/admin-settings';
import SettingsCockpitManager from '@/components/admin/settings/SettingsCockpitManager';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const { profile } = await requireAdminSession();
  const settings = await getPlatformSettings();
  const integrations = await getIntegrationsStatusAction();

  return (
    <SettingsCockpitManager
      initialSettings={settings}
      initialIntegrations={integrations}
      adminProfile={{
        id: profile.id,
        email: profile.email,
        role: profile.role,
      }}
    />
  );
}
