import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/server';
import {
  ArrowLeft,
  Shield,
  Video,
  Building2,
  Clock,
  Database,
  ExternalLink,
  Code2,
  CheckCircle2,
  User,
  Globe,
  Tag,
} from 'lucide-react';
import Badge from '@/components/admin/components/ui/badge/Badge';
import AuditPayloadViewer from '@/components/admin/audit/AuditPayloadViewer';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function AuditLogDetailPage({ params, searchParams }: PageProps) {
  await requireAdminSession();
  const db = createAdminClient();

  const { id } = await params;
  const { type = 'creators' } = await searchParams;

  let event: any = null;
  let eventType: 'creator' | 'brand' | 'admin' = 'creator';

  // Attempt fetch from designated table first, then fallback to others if needed
  if (type === 'brands') {
    const { data } = await db
      .from('brand_audit_log')
      .select('*, profiles:brand_id(id, full_name, email, role)')
      .eq('id', id)
      .maybeSingle();
    if (data) {
      event = data;
      eventType = 'brand';
    }
  } else if (type === 'admin') {
    const { data } = await db
      .from('admin_audit_log')
      .select('*, profiles:admin_id(id, full_name, email, role)')
      .eq('id', id)
      .maybeSingle();
    if (data) {
      event = data;
      eventType = 'admin';
    }
  } else {
    const { data } = await db
      .from('creator_audit_log')
      .select('*, profiles:creator_id(id, full_name, email, role)')
      .eq('id', id)
      .maybeSingle();
    if (data) {
      event = data;
      eventType = 'creator';
    }
  }

  // Fallback search across all 3 tables if not found
  if (!event) {
    const [c, b, a] = await Promise.all([
      db.from('creator_audit_log').select('*, profiles:creator_id(id, full_name, email, role)').eq('id', id).maybeSingle(),
      db.from('brand_audit_log').select('*, profiles:brand_id(id, full_name, email, role)').eq('id', id).maybeSingle(),
      db.from('admin_audit_log').select('*, profiles:admin_id(id, full_name, email, role)').eq('id', id).maybeSingle(),
    ]);

    if (c.data) {
      event = c.data;
      eventType = 'creator';
    } else if (b.data) {
      event = b.data;
      eventType = 'brand';
    } else if (a.data) {
      event = a.data;
      eventType = 'admin';
    }
  }

  if (!event) {
    notFound();
  }

  const profile = Array.isArray(event.profiles) ? event.profiles[0] : event.profiles;
  const isSystem = eventType === 'admin' && (!profile || event.action === 'auto_settlement_reconciled');
  const actorName = isSystem ? 'System Automation Engine' : profile?.full_name || 'Platform User';
  const category = event.action_category || event.action?.split('.')[0] || 'general';

  const formatTimeAgo = (dateString: string) => {
    const ms = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(ms / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/audit"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Audit Ledger
        </Link>

        <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
          ID: #{event.id}
        </span>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 dark:border-gray-800 dark:bg-gray-900/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                  eventType === 'creator'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40'
                    : eventType === 'brand'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
                }`}
              >
                {eventType.toUpperCase()} TRAIL
              </span>

              <span className="text-xs text-gray-400">•</span>

              <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase">
                {category}
              </span>
            </div>

            <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mt-2">
              {event.action}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans max-w-2xl">
              {event.details || 'Immutable accountability record generated by Kpugi event subsystem.'}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs font-mono text-gray-500 dark:text-gray-400 flex items-center sm:justify-end gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {new Date(event.created_at).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium font-sans mt-0.5">
              {formatTimeAgo(event.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Actor Info + Target Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Actor Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-gray-900/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
            <User className="w-4 h-4 text-brand-500" />
            Actor &amp; Account Origin
          </div>

          <div className="flex items-center gap-3.5 pt-1">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold font-display shadow-sm ${
                eventType === 'creator'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                  : eventType === 'brand'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
              }`}
            >
              {actorName.slice(0, 1).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {actorName}
              </h3>
              {profile?.email && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {profile.email}
                </p>
              )}
              <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase">
                {profile?.role || (isSystem ? 'System Engine' : 'Admin Operator')}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800/80 pt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="font-mono">IP Address</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {event.ip_address || 'Internal Service Origin'}
              </span>
            </div>
            {profile?.id && (
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                <span className="font-mono">Profile ID</span>
                <span className="font-mono text-gray-800 dark:text-gray-200 text-[11px]">
                  #{profile.id.slice(0, 12)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Target Entity Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-gray-900/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
            <Database className="w-4 h-4 text-brand-500" />
            Target Entity &amp; Ledger Scope
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-mono">Affected Table</span>
              <span className="font-semibold text-gray-900 dark:text-white font-mono">
                {event.target_table || 'platform_global'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-mono">Entity Target ID</span>
              <span className="font-mono text-brand-500 dark:text-brand-400 font-medium">
                {event.target_id ? `#${event.target_id}` : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-mono">Ledger Partition</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {eventType}_audit_log
              </span>
            </div>
          </div>

          {event.target_table === 'campaigns' && (
            <div className="border-t border-gray-100 dark:border-gray-800/80 pt-3">
              <Link
                href="/admin/campaigns"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Inspect in Campaigns Console
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          {event.target_table === 'submissions' && (
            <div className="border-t border-gray-100 dark:border-gray-800/80 pt-3">
              <Link
                href="/admin/submissions"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Inspect in Submissions Queue
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Dual-Mode Payload & State Explorer: Visual Inspector + Raw JSON */}
      <AuditPayloadViewer
        payload={event.payload || {}}
        action={event.action}
        category={category}
        details={event.details}
        rawEvent={{
          id: event.id,
          action: event.action,
          category: event.action_category,
          actor: {
            name: actorName,
            email: profile?.email,
            role: profile?.role || (isSystem ? 'system' : 'admin'),
            id: profile?.id,
          },
          target: {
            table: event.target_table,
            id: event.target_id,
          },
          details: event.details,
          payload: event.payload || {},
          ip_address: event.ip_address,
          timestamp: event.created_at,
        }}
      />
    </div>
  );
}
