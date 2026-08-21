'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { BrandSettingsData } from '@/lib/supabase/advertiser';
import { updateBrandBillingContactAction } from '@/app/actions/advertiser';
import {
  Mail,
  User,
  Phone,
  Receipt,
  FileCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface BrandBillingContactTabProps {
  data: BrandSettingsData;
}

export default function BrandBillingContactTab({ data }: BrandBillingContactTabProps) {
  const { user } = useUser();

  const [fullName, setFullName] = useState(
    data.profile.fullName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '')
  );
  const [billingEmail, setBillingEmail] = useState(data.advertiser.billingEmail || data.profile.email || '');
  const [phone, setPhone] = useState(data.profile.phone || '');
  const [taxId, setTaxId] = useState(data.advertiser.taxId || '');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setMessage({ type: 'error', text: 'Admin full name is required.' });
      return;
    }
    if (!billingEmail.trim()) {
      setMessage({ type: 'error', text: 'Billing & invoicing email is required.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // 1. If client user is loaded, update Clerk name directly
      if (user?.update) {
        try {
          const parts = fullName.trim().split(' ');
          const fName = parts[0] || fullName.trim();
          const lName = parts.length > 1 ? parts.slice(1).join(' ') : '';
          await user.update({
            firstName: fName,
            lastName: lName,
          });
        } catch (clerkErr) {
          console.warn('[Clerk user.update Warning]:', clerkErr);
        }
      }

      // 2. Call Server Action
      const res = await updateBrandBillingContactAction({
        fullName: fullName.trim(),
        billingEmail: billingEmail.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        taxId: taxId.trim() || undefined,
      });

      if (!res.success) {
        setMessage({ type: 'error', text: res.error || 'Failed to save billing & contact details.' });
      } else {
        setMessage({ type: 'success', text: 'Contact and billing details saved successfully!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-kpugi-ink dark:text-white">
      {/* Toast Feedback */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
              : 'bg-red-50 dark:bg-rose-950/40 text-red-800 dark:text-rose-300 border border-red-200 dark:border-rose-500/30'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Account Owner & Admin Contact */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-kpugi-ink dark:text-white mt-1">Primary Account Admin</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Contact information for the authorized administrator managing this brand account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Admin Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Alex Johnson"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-kpugi-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs sm:text-sm text-kpugi-ink dark:text-white focus:bg-white dark:focus:bg-[#161820] focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3 text-kpugi-blue dark:text-blue-400" /> Synchronized across your primary administrator account.
            </p>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Contact Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-kpugi-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs sm:text-sm text-kpugi-ink dark:text-white focus:bg-white dark:focus:bg-[#161820] focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used for critical campaign milestone SMS alerts and account verification.
            </p>
          </div>
        </div>
      </div>

      {/* Invoicing & Tax Compliance */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-kpugi-ink dark:text-white mt-1">Receipt & Tax Settings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            These details appear on your downloadable PDF invoices, Paystack receipts, and tax records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Clerk Primary Account Email (Read-Only) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Primary Account Login Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                disabled
                value={data.profile.email}
                className="w-full pl-10 pr-24 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
              />
              <span className="absolute right-3 top-3 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white dark:bg-[#161820] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-2xs flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-slate-400" /> Primary Login
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Your primary account login email address.
            </p>
          </div>

          {/* Dedicated Billing Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Official Invoicing & Billing Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Receipt className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="billing@yourcompany.com"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-kpugi-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs sm:text-sm text-kpugi-ink dark:text-white focus:bg-white dark:focus:bg-[#161820] focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Where downloadable PDF receipts and escrow settlement notices are delivered.
            </p>
          </div>

          {/* CAC / Tax ID Number */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              CAC Registration / Tax Identification Number (TIN)
            </label>
            <div className="relative">
              <FileCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="e.g., RC-1234567 or TIN-987654321"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-kpugi-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs sm:text-sm text-kpugi-ink dark:text-white focus:bg-white dark:focus:bg-[#161820] focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Optional: Printed on corporate expense invoices for company tax deduction filings.
            </p>
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3.5 bg-kpugi-blue hover:bg-kpugi-blue/90 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-kpugi-blue/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving Details...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Save Contact & Billing
            </>
          )}
        </button>
      </div>
    </form>
  );
}
