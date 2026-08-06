'use client';

import React, { useState } from 'react';
import { CreditCard, Lock, ArrowUpRight, Plus, ShieldCheck, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { BrandWalletData } from '@/lib/supabase/advertiser';
import { depositBrandFundsAction } from '@/app/actions/advertiser';

interface AdvertiserWalletViewProps {
  data: BrandWalletData;
}

export default function AdvertiserWalletView({ data }: AdvertiserWalletViewProps) {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { walletBalance, totalEscrowLocked, totalSpent, transactions, activeCampaignsEscrow } = data;

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    const formData = new FormData();
    formData.append('amount', depositAmount);
    formData.append('reference', `KP-DEP-${Date.now()}`);

    const res = await depositBrandFundsAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setShowDepositModal(false);
      setMsg({ text: `₦${Number(depositAmount).toLocaleString()} successfully added to brand wallet balance!`, type: 'success' });
    } else {
      setMsg({ text: res.error || 'Failed to complete deposit', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner & Balance Overview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Brand Escrow & Funding Wallet</span>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-white mt-1">
              ₦{walletBalance.toLocaleString()}
            </h1>
            <span className="text-xs text-slate-400 mt-1 block">Unallocated Available Cash Balance</span>
          </div>

          <button
            onClick={() => setShowDepositModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-kpugi-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-kpugi-blue/30 transition-all flex items-center justify-center gap-2 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand Funds</span>
          </button>
        </div>

        {/* Escrow Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Locked Campaign Escrow</span>
              <span className="font-display font-bold text-lg text-amber-300">₦{totalEscrowLocked.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Historical Spent</span>
              <span className="font-display font-bold text-lg text-emerald-300">₦{totalSpent.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Active Campaign Escrow List */}
      <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-kpugi-ink">Active Campaign Escrow Allocations</h3>

        {activeCampaignsEscrow.length === 0 ? (
          <p className="text-xs text-kpugi-slate py-4">No active live campaigns locking escrow funds currently.</p>
        ) : (
          <div className="space-y-3">
            {activeCampaignsEscrow.map((camp) => (
              <div key={camp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">{camp.title}</span>
                  <span className="text-[11px] text-slate-500">
                    Spent: ₦{camp.spent_budget.toLocaleString()} of ₦{camp.total_budget.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-700 font-bold uppercase block">Escrow Locked</span>
                  <span className="font-mono font-bold text-xs text-amber-800">₦{camp.escrow_remaining.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Ledger Table */}
      <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-kpugi-ink">Transaction History</h3>

        {transactions.length === 0 ? (
          <p className="text-xs text-kpugi-slate py-4">No transaction history recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        tx.transaction_type === 'deposit' ? 'bg-emerald-100 text-emerald-800' :
                        tx.transaction_type === 'unspent_refund' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {tx.transaction_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{tx.reference}</td>
                    <td className={`py-3 px-3 text-right font-mono font-bold ${
                      tx.transaction_type === 'deposit' || tx.transaction_type === 'unspent_refund' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.transaction_type === 'deposit' || tx.transaction_type === 'unspent_refund' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleDepositSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-kpugi-border">
            <h3 className="font-display font-bold text-lg text-kpugi-ink">Add Brand Funding</h3>
            <p className="text-xs text-kpugi-slate">
              Enter deposit amount to fund your brand wallet for launching creator campaigns.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Deposit Amount (₦)</label>
              <input
                type="number"
                min="5000"
                step="5000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full p-3 rounded-xl border border-kpugi-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-kpugi-blue hover:bg-blue-600 text-white font-bold text-xs transition-colors"
              >
                Deposit via Paystack →
              </button>
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
