'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  CheckSquare,
  Users,
  ScrollText,
  Activity,
  Sliders,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

interface AdminSidebarProps {
  profile: {
    id: string;
    is_admin: boolean;
    role: string;
    full_name: string | null;
    email: string;
  };
}

const NAV_ITEMS = [
  {
    label: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'Campaigns',
    href: '/admin/campaigns',
    icon: Megaphone,
    badge: 'Hero Pin',
  },
  {
    label: 'Submissions',
    href: '/admin/submissions',
    icon: CheckSquare,
    badge: null,
  },
  {
    label: 'Users & Roles',
    href: '/admin/users',
    icon: Users,
    badge: null,
  },
  {
    label: 'Audit Log',
    href: '/admin/audit',
    icon: ScrollText,
    badge: 'RLS',
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Sliders,
    badge: null,
  },
];

export default function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-[#0A0E17] border-r border-slate-800/80 flex flex-col flex-shrink-0 min-h-screen select-none">
      {/* Brand & Console Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 font-display font-extrabold text-sm">
              K
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-white text-base tracking-tight group-hover:text-indigo-400 transition-colors">
                  Kpugi
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  OPS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono tracking-tight">admin.kpugi.com</p>
            </div>
          </Link>
        </div>

        {/* Live Status indicator */}
        <div className="mt-4 px-3 py-2 rounded-lg bg-[#0E1422] border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] text-slate-300 font-medium">DB RBAC Active</span>
          </div>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 pt-2 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
          Management
        </div>

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                active
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                  {item.badge}
                </span>
              ) : active ? (
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400/80" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Operator Account & Footer */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {/* Quick jump to public platform */}
        <Link
          href="/dashboard"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors border border-dashed border-slate-800"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Exit to Platform</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">kpugi.com</span>
        </Link>

        {/* Current Operator Profile */}
        <div className="p-2.5 rounded-xl bg-[#0E1422] border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <UserButton afterSignOutUrl="/sign-in" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {profile.full_name || 'Admin Operator'}
                </p>
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate">{profile.email}</p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ADMIN
          </span>
        </div>
      </div>
    </aside>
  );
}
