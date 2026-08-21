'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, Zap, Loader2, AlertCircle } from 'lucide-react';
import { initializePaystackDepositAction, verifyPaystackDepositAction, logCancelledPaystackDepositAction } from '@/app/actions/advertiser';
import { formatCompactCurrency } from '@/lib/utils/format';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  advertiserEmail?: string;
  onSuccess?: (amount: number) => void;
}

export function FundWalletModal({ isOpen, onClose, advertiserEmail, onSuccess }: FundWalletModalProps) {
  const [mounted, setMounted] = useState(false);
  const [depositAmount, setDepositAmount] = useState('500000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadPaystackScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).PaystackPop) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'https://js.paystack.co/v1/inline.js';
        fallbackScript.async = true;
        fallbackScript.onload = () => resolve(true);
        fallbackScript.onerror = () => resolve(false);
        document.body.appendChild(fallbackScript);
      };
      document.body.appendChild(script);
    });
  };

  if (!isOpen) return null;

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const cleanAmountStr = String(depositAmount || '').replace(/[^0-9.]/g, '');
    const amtNum = parseFloat(cleanAmountStr) || 0;
    if (amtNum < 5000) {
      setErrorMsg("Hold on now 🛑... Minimum top-up is ₦5,000! Let's get them numbers up.");
      setIsSubmitting(false);
      return;
    }

    const paystackPublicKey =
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_3630914972cbf0ef4986fc0ae2181d38a94f9412';
    const paystackRef = `KPG-PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const onPaymentSuccess = async (ref: string) => {
      setIsSubmitting(true);
      const verifyRes = await verifyPaystackDepositAction(ref);
      setIsSubmitting(false);

      if (verifyRes.success) {
        onClose();
        if (onSuccess) onSuccess(amtNum);
      } else {
        setErrorMsg(verifyRes.error || 'Paystack payment verification failed.');
      }
    };

    const onPaymentCancel = async () => {
      setIsSubmitting(false);
      await logCancelledPaystackDepositAction(paystackRef, amtNum);
      setErrorMsg("Oops!🤭...that payment didn't go through now, did it?");
    };

    await loadPaystackScript();

    try {
      if ((window as any).PaystackPop) {
        const paystack = new (window as any).PaystackPop();
        paystack.newTransaction({
          key: paystackPublicKey,
          email: advertiserEmail || 'advertiser@kpugi.com',
          amount: amtNum * 100,
          currency: 'NGN',
          ref: paystackRef,
          onSuccess: (transaction: any) => onPaymentSuccess(transaction.reference || paystackRef),
          onCancel: onPaymentCancel,
          onClose: onPaymentCancel,
        });
        return;
      }
    } catch (e: any) {
      if (typeof (window as any).PaystackPop?.setup === 'function') {
        const handler = (window as any).PaystackPop.setup({
          key: paystackPublicKey,
          email: advertiserEmail || 'advertiser@kpugi.com',
          amount: amtNum * 100,
          currency: 'NGN',
          ref: paystackRef,
          callback: (response: any) => onPaymentSuccess(response.reference || paystackRef),
          onClose: onPaymentCancel,
        });
        handler.openIframe();
        return;
      }
    }

    const initRes = await initializePaystackDepositAction(amtNum);
    if (initRes.success && initRes.authorization_url) {
      window.location.href = initRes.authorization_url;
    } else {
      setIsSubmitting(false);
      setErrorMsg(initRes.error || 'Failed to launch Paystack checkout.');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 min-h-screen w-screen overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-[#12141A] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 p-6 space-y-5 animate-in fade-in zoom-in-95 my-auto text-slate-900 dark:text-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#4338ca] dark:text-indigo-400 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">Add Funds</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
                Deposit Amount (₦ NGN)
              </label>
              <span className="text-[11px] font-bold text-slate-400">Min: ₦5,000</span>
            </div>
            <input
              type="number"
              min={5000}
              step={1000}
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border font-mono font-black text-lg text-slate-900 dark:text-white bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20"
              required
            />
          </div>

          {/* Quick Select Presets */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Quick Preset Options</span>
            <div className="grid grid-cols-3 gap-2">
              {['100000', '500000', '1000000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                    depositAmount === amt
                      ? 'bg-[#4338ca] text-white border-[#4338ca]'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  {formatCompactCurrency(Number(amt))}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Payment Gateway
            </span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">Paystack Popup</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            Payments trigger an inline Paystack popup modal. Funds are credited immediately upon confirmation.
          </p>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (parseFloat(String(depositAmount || '').replace(/[^0-9.]/g, '')) || 0) < 5000}
              className="px-6 py-2.5 rounded-xl bg-[#4338ca] text-white text-xs font-bold shadow-2xs hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Opening Paystack...</span>
                </>
              ) : (
                <span>Pay with Paystack</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : modalContent;
}
