import React from 'react';
import Link from 'next/link';

export default function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-kpugi-paper">
      {/* Sidebar */}
      <aside className="w-60 border-r border-kpugi-border bg-white p-6 flex flex-col justify-between">
        <div>
          <div className="font-display font-bold text-xl text-kpugi-ink mb-8">Kpugi Brand</div>
          <nav className="space-y-2">
            <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-kpugi-paper">
              Dashboard
            </Link>
            <Link href="/campaigns" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-kpugi-paper">
              Campaigns
            </Link>
            <Link href="/wallet" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-kpugi-paper">
              Wallet
            </Link>
          </nav>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
