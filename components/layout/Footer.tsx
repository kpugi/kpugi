import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-kpugi-border bg-white pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center mb-4">
              <Image
                src="/kpugi_logo.png"
                alt="Kpugi Logo"
                width={150}
                height={150}
                className="rounded-lg"
              />
            </Link>
            <p className="text-xs text-kpugi-slate leading-relaxed mb-4">
              The Nigeria-first automated marketplace connecting advertisers and creators for verified ad placements.
            </p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-kpugi-naira text-[11px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-kpugi-naira"></span>
              Paystack Naira Payouts
            </span>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-semibold text-sm text-kpugi-ink mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs text-kpugi-slate">
              <li><Link href="/browse" className="hover:text-kpugi-primary transition-colors">Browse</Link></li>
              <li><Link href="/how-it-works" className="hover:text-kpugi-primary transition-colors">How it Works</Link></li>
              <li><Link href="/pricing" className="hover:text-kpugi-primary transition-colors">CPM Pricing</Link></li>
              <li><Link href="/sign-up" className="hover:text-kpugi-primary transition-colors">Brand Dashboard</Link></li>
            </ul>
          </div>

          {/* For Creators */}
          <div>
            <h4 className="font-display font-semibold text-sm text-kpugi-ink mb-4">Creators</h4>
            <ul className="space-y-2.5 text-xs text-kpugi-slate">
              <li><Link href="/sign-up" className="hover:text-kpugi-primary transition-colors">Connect Social Account</Link></li>
              <li><Link href="/how-it-works#verification" className="hover:text-kpugi-primary transition-colors">1k View Verification</Link></li>
              <li><Link href="/sign-up" className="hover:text-kpugi-primary transition-colors">Instant Payouts</Link></li>
            </ul>
          </div>

          {/* Platform Rules */}
          <div>
            <h4 className="font-display font-semibold text-sm text-kpugi-ink mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs text-kpugi-slate">
              <li><span className="text-kpugi-ink font-medium">No Manual Gatekeepers</span></li>
              <li><span className="text-kpugi-ink font-medium">Automated View Audit</span></li>
              <li><span className="text-kpugi-ink font-medium">10% Platform Commission</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-kpugi-border pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-kpugi-slate gap-4">
          <p>© {new Date().getFullYear()} Kpugi Technologies. Built for Nigerian Creators & Brands.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Global Campaign Rules</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
