import React from 'react';

export default function DashboardFooter() {
  return (
    <footer className="border-t border-kpugi-border bg-white px-6 sm:px-8 py-5 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-kpugi-slate">
        
        {/* System Operational Badge */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-medium text-kpugi-ink">All Verification & Escrow Systems Operational</span>
        </div>

        {/* Copyright */}
        <div>
          © {new Date().getFullYear()} Kpugi Technologies. Nigeria-first performance ad platform.
        </div>

        {/* Links */}
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-kpugi-blue transition-colors">Documentation</a>
          <span>·</span>
          <a href="#" className="hover:text-kpugi-blue transition-colors">Global Rules</a>
          <span>·</span>
          <a href="#" className="hover:text-kpugi-blue transition-colors">Support</a>
        </div>

      </div>
    </footer>
  );
}
