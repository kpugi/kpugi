import React from 'react';

export function FundWalletModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="font-display font-bold text-lg mb-2">Fund Wallet via Paystack</h3>
        <button onClick={onClose} className="btn btn-sm btn-ghost">Close</button>
      </div>
    </div>
  );
}
