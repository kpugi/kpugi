'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  ShieldCheck,
  Rocket,
  Lock,
  Sparkles,
  Receipt,
  X,
} from 'lucide-react';

interface PaymentBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  totalBudget: number;
  featuredFee: number;
  isFeatured: boolean;
  paymentMethod: 'wallet' | 'paystack';
  paymentRef: string;
  isLaunching: boolean;
  onConfirmLaunch: () => void;
}

export function CampaignPaymentBridgeModal({
  isOpen,
  onClose,
  campaignTitle,
  totalBudget,
  featuredFee,
  isFeatured,
  paymentMethod,
  paymentRef,
  isLaunching,
  onConfirmLaunch,
}: PaymentBridgeModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen) return null;

  const totalPaid = totalBudget + (isFeatured ? featuredFee : 0);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e8e6fd] space-y-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Header Icon */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
            Payment Verified & Escrow Locked
          </h2>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Your transaction was processed successfully and escrow funds are locked in smart contract.
          </p>
        </div>

        {/* Payment Summary Box */}
        <div className="p-5 rounded-2xl bg-[#f8f7ff] border border-[#e2e0fb] space-y-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-[#e2e0fb] pb-3">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-[#4338ca]" />
              <span>Payment Reference</span>
            </span>
            <span className="font-mono font-bold text-[#4338ca] bg-white px-2.5 py-0.5 rounded-full border border-[#dcd8fc]">
              {paymentRef}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Campaign Title</span>
            <span className="font-bold text-slate-900 truncate max-w-[200px]">
              {campaignTitle || 'Untitled Campaign'}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Budget</span>
            <span className="font-mono font-bold text-slate-900">
              ₦{totalBudget.toLocaleString()}
            </span>
          </div>

          {isFeatured && (
            <div className="flex justify-between items-center text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <span className="flex items-center gap-1 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Featured Campaign Add-On</span>
              </span>
              <span className="font-mono font-bold">+₦{featuredFee.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-600">
            <span>Payment Method</span>
            <span className="font-bold text-slate-800 capitalize">
              {paymentMethod === 'wallet' ? 'Kpugi Escrow Wallet' : 'Instant Card / Bank Transfer'}
            </span>
          </div>

          <div className="flex justify-between items-center font-extrabold text-sm text-slate-900 pt-3 border-t border-slate-200">
            <span className="font-display font-extrabold text-base">Total Paid</span>
            <span className="font-mono text-xl font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              ₦{totalPaid.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Security & Notification Notice */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Launching will immediately notify all qualified creators via email and push notifications.
          </span>
        </div>

        {/* Paramount Launch Button */}
        <button
          type="button"
          disabled={isLaunching}
          onClick={onConfirmLaunch}
          className="w-full py-4 px-6 rounded-2xl bg-[#4338ca] hover:bg-[#3730a3] text-white font-sans text-base font-extrabold transition-all flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-50"
        >
          <Rocket className="w-5 h-5 text-amber-300 animate-bounce" />
          <span>
            {isLaunching
              ? 'Publishing Campaign...'
              : 'PUBLISH!'}
          </span>
        </button>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
