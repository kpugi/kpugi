import React from 'react';
import Link from 'next/link';

export function Sidebar({ role }: { role: 'advertiser' | 'creator' }) {
  const links =
    role === 'advertiser'
      ? [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Wallet', href: '/wallet' },
          { label: 'Settings', href: '/settings' },
        ]
      : [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Catalogue', href: '/catalogue' },
          { label: 'My Submissions', href: '/submissions' },
          { label: 'Connected Accounts', href: '/accounts' },
          { label: 'Earnings & Payouts', href: '/earnings' },
          { label: 'Settings', href: '/settings' },
        ];

  return (
    <aside className="w-60 border-r border-kpugi-border dark:border-white/10 bg-white dark:bg-[#0D111D] p-6 flex flex-col justify-between min-h-screen transition-colors duration-300">
      <div>
        <div className="font-display font-bold text-xl text-kpugi-ink dark:text-white mb-8">
          Kpugi {role === 'advertiser' ? 'Brand' : 'Creator'}
        </div>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-kpugi-paper dark:hover:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
