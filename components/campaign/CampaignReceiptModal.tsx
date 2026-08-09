'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Download, Printer, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  receipt: {
    receipt_number: string;
    total_amount: number;
    escrow_budget: number;
    featured_fee: number;
    is_featured: boolean;
    payment_method: string;
  };
  campaignId: string;
  campaignTitle: string;
  onClose: () => void;
}

export function CampaignReceiptModal({
  receipt,
  campaignId,
  campaignTitle,
  onClose,
}: ReceiptModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleGoToCampaign = () => {
    router.push(`/b/campaigns/${campaignId}`);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white text-center space-y-2 relative">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-1">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-extrabold">Campaign Funded & Live!</h3>
          <p className="text-xs text-slate-300">
            Campaign Budget locked in smart contract & creators notified.
          </p>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-4 font-sans text-xs flex-1 overflow-y-auto">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-slate-500 font-mono text-[11px]">
              <span>RECEIPT NUMBER</span>
              <span className="font-bold text-slate-900">{receipt.receipt_number}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 text-[11px]">
              <span>DATE & TIME</span>
              <span className="font-medium text-slate-700">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 text-[11px]">
              <span>PAYMENT METHOD</span>
              <span className="font-bold text-slate-800 capitalize">{receipt.payment_method}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Campaign Details</div>
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
              <div className="font-bold text-slate-900 text-sm">{campaignTitle}</div>
              <div className="text-[11px] text-indigo-700 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Smart Contract Escrow Protection Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold uppercase text-slate-400">Financial Breakdown</div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Campaign Budget</span>
              <span className="font-mono font-bold text-slate-900">₦{receipt.escrow_budget.toLocaleString()}</span>
            </div>

            {receipt.is_featured && (
              <div className="flex justify-between items-center text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                <span className="flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Featured Campaign Add-On</span>
                </span>
                <span className="font-mono font-bold">₦{receipt.featured_fee.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
              <span>TOTAL PAID</span>
              <span className="font-mono text-base font-extrabold text-emerald-600">₦{receipt.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={handleGoToCampaign}
            className="px-5 py-2.5 rounded-xl bg-kpugi-blue hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>View Campaign</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
