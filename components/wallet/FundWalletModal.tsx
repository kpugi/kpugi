import React from 'react';

export function FundWalletModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 min-h-screen w-screen">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="font-display font-bold text-lg mb-2">Fund Wallet via Paystack</h3>
        <button onClick={onClose} className="btn btn-sm btn-ghost">Close</button>
      </div>
    </div>
  );
}
