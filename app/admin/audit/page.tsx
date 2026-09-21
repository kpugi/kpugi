import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/server';
import AuditLogsManager from '@/components/admin/audit/AuditLogsManager';

export const revalidate = 0;

export default async function AdminAuditLogPage() {
  await requireAdminSession();
  const db = createAdminClient();

  // Concurrently fetch from all three segregated audit ledgers using service role client
  const [creatorRes, brandRes, adminRes] = await Promise.allSettled([
    db
      .from('creator_audit_log')
      .select('id, action, action_category, target_table, target_id, details, payload, ip_address, created_at, profiles:creator_id(full_name, email, role)')
      .order('created_at', { ascending: false })
      .limit(300),
    db
      .from('brand_audit_log')
      .select('id, action, action_category, target_table, target_id, details, payload, ip_address, created_at, profiles:brand_id(full_name, email, role)')
      .order('created_at', { ascending: false })
      .limit(300),
    db
      .from('admin_audit_log')
      .select('id, action, target_table, target_id, details, payload, ip_address, created_at, profiles:admin_id(full_name, email, role)')
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  const creatorLogs = creatorRes.status === 'fulfilled' ? creatorRes.value.data || [] : [];
  const brandLogs = brandRes.status === 'fulfilled' ? brandRes.value.data || [] : [];
  const adminLogs = adminRes.status === 'fulfilled' ? adminRes.value.data || [] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">
              Platform &amp; User Audit Trails
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Segregated Ledgers
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Immutable accountability trails for creators, brands, and administrative operators. Click any row to inspect the full event data.
          </p>
        </div>
      </div>

      <AuditLogsManager
        creatorLogs={creatorLogs}
        brandLogs={brandLogs}
        adminLogs={adminLogs}
      />
    </div>
  );
}
