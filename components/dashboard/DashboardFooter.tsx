import React from 'react';
import Link from 'next/link';
import { FRESHDESK_LINKS, STATUS_PAGE_URL } from '@/lib/support/freshdesk';

export default function DashboardFooter() {
  return (
    <footer className="border-t border-kpugi-border dark:border-white/10 bg-white dark:bg-[#0D111D] px-6 sm:px-8 py-5 mt-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-kpugi-slate dark:text-slate-400">

        {/* System Operational Badge - Links to live status page */}
        <a
          href={STATUS_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer"
          title="View live Kpugi system status"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-medium text-kpugi-ink dark:text-white group-hover:text-kpugi-blue dark:group-hover:text-blue-400 transition-colors">
            All Systems Operational
          </span>
        </a>

        {/* Copyright */}
        <div>
          © {new Date().getFullYear()} Kpugi Technologies.
        </div>

        {/* Links */}
        <div className="flex items-center gap-4">
          <a
            href={FRESHDESK_LINKS.knowledgeBase}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-kpugi-blue dark:hover:text-white transition-colors"
          >
            Knowledge Base
          </a>
          <span>·</span>
          <a
            href={FRESHDESK_LINKS.communityForums}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-kpugi-blue dark:hover:text-white transition-colors"
          >
            Community
          </a>
          <span>·</span>
          <a
            href={FRESHDESK_LINKS.rules}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-kpugi-blue dark:hover:text-white transition-colors"
          >
            Rules
          </a>
          <span>·</span>
          <a
            href={STATUS_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-kpugi-blue dark:hover:text-white transition-colors font-medium"
          >
            Status
          </a>
          <span>·</span>
          <a
            href={FRESHDESK_LINKS.myTickets}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-kpugi-blue dark:hover:text-white transition-colors"
          >
            Support
          </a>
        </div>

      </div>
    </footer>
  );
}
