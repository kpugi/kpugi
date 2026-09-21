import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function SidebarWidget() {
  return (
    <div className="pb-10 pt-4">
      <div className="mx-auto rounded-2xl bg-brand-50/70 p-4 text-center dark:bg-brand-500/5 border border-brand-100/80 dark:border-brand-500/15">
        <div className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/30">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h3 className="text-xs font-bold font-display uppercase tracking-wider text-gray-900 dark:text-white">
          Escrow Custody
        </h3>
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 font-sans leading-relaxed">
          100% automated settlement and escrow protection.
        </p>
        <Link
          href="/admin/system"
          className="mt-3 flex items-center justify-center py-2 px-3 text-xs font-semibold text-white rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors shadow-xs"
        >
          System Health
        </Link>
      </div>
    </div>
  );
}
