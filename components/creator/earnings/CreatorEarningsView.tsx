'use client';

import React, { useState } from 'react';
import { CreatorEarningsData } from '@/lib/supabase/creator';
import { requestPayoutAction, saveBankAccountAction } from '@/app/actions/creator';

interface CreatorEarningsViewProps {
  data: CreatorEarningsData;
}

export default function CreatorEarningsView({ data }: CreatorEarningsViewProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handlePayoutSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);
    const res = await requestPayoutAction(formData);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to request payout');
    } else {
      setShowPayoutModal(false);
    }
  }

  async function handleBankSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);
    const res = await saveBankAccountAction(formData);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save bank account');
    } else {
      setShowBankModal(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-kpugi-border pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-kpugi-ink">Earnings & Payouts</h1>
          <p className="font-sans text-sm text-kpugi-slate mt-1">Manage cleared wallet balance, bank details, and instant payouts.</p>
        </div>
        <button
          onClick={() => setShowPayoutModal(true)}
          disabled={data.availableBalance < 1000}
          className="px-6 py-3 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-kpugi-blue-dark transition-colors shadow-sm disabled:opacity-50"
        >
          💳 Request Payout
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between">
          <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider">Available for Payout</span>
          <div className="font-mono font-bold text-3xl text-kpugi-blue my-2">
            ₦{data.availableBalance.toLocaleString()}
          </div>
          <span className="font-sans text-[11px] text-kpugi-slate">Minimum payout threshold: ₦1,000</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between">
          <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider">Pending Escrow</span>
          <div className="font-mono font-bold text-3xl text-amber-600 my-2">
            ₦{data.pendingEscrow.toLocaleString()}
          </div>
          <span className="font-sans text-[11px] text-kpugi-slate">Locked in active campaign audits</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between">
          <span className="font-sans text-xs font-bold text-kpugi-slate uppercase tracking-wider">Total Lifetime Earned</span>
          <div className="font-mono font-bold text-3xl text-emerald-600 my-2">
            ₦{data.totalEarned.toLocaleString()}
          </div>
          <span className="font-sans text-[11px] text-kpugi-slate">Accumulated payout history</span>
        </div>
      </div>

      {/* Bank Account Connection Card */}
      <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-kpugi-ink">Payout Bank Account</h3>
          {data.bankDetails ? (
            <p className="font-sans text-xs text-kpugi-slate mt-1">
              <span className="font-bold text-kpugi-ink">{data.bankDetails.bankName}</span> • {data.bankDetails.accountNumber} ({data.bankDetails.accountName})
            </p>
          ) : (
            <p className="font-sans text-xs text-red-500 mt-1">No bank account linked yet. Please add a bank account to receive withdrawals.</p>
          )}
        </div>
        <button
          onClick={() => setShowBankModal(true)}
          className="px-4 py-2.5 rounded-xl bg-kpugi-paper hover:bg-slate-200 border border-kpugi-border font-sans text-xs font-bold transition-colors"
        >
          {data.bankDetails ? 'Update Bank Account' : 'Connect Bank Account'}
        </button>
      </div>

      {/* Transaction History Ledger */}
      <div className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-kpugi-ink">Transaction History</h3>
        {data.transactions.length === 0 ? (
          <p className="font-sans text-xs text-kpugi-slate py-4 text-center">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-kpugi-border text-kpugi-slate uppercase text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 uppercase font-bold">{tx.transaction_type || tx.type}</td>
                    <td className="py-3 px-4 font-mono font-bold">₦{tx.amount?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="font-display font-bold text-xl text-kpugi-ink">Request Withdrawal</h3>
            <p className="font-sans text-xs text-kpugi-slate">
              Enter the amount you wish to withdraw to your linked bank account.
            </p>
            {errorMsg && <p className="text-xs text-red-500 font-bold">{errorMsg}</p>}
            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1">Amount (₦)</label>
                <input
                  type="number"
                  name="amount"
                  min={1000}
                  max={data.availableBalance}
                  defaultValue={data.availableBalance}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-kpugi-border font-mono text-sm focus:outline-none focus:border-kpugi-blue"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-kpugi-border font-sans text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-kpugi-blue-dark"
                >
                  {loading ? 'Processing...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Account Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="font-display font-bold text-xl text-kpugi-ink">Bank Account Details</h3>
            {errorMsg && <p className="text-xs text-red-500 font-bold">{errorMsg}</p>}
            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  placeholder="e.g. GTBank / Access Bank"
                  defaultValue={data.bankDetails?.bankName || ''}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-kpugi-border font-sans text-xs focus:outline-none focus:border-kpugi-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1">Bank Code</label>
                <input
                  type="text"
                  name="bankCode"
                  placeholder="e.g. 058"
                  defaultValue={data.bankDetails?.bankCode || '058'}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-kpugi-border font-mono text-xs focus:outline-none focus:border-kpugi-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="10-digit account number"
                  defaultValue={data.bankDetails?.accountNumber || ''}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-kpugi-border font-mono text-xs focus:outline-none focus:border-kpugi-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1">Account Name</label>
                <input
                  type="text"
                  name="accountName"
                  placeholder="Account holder full name"
                  defaultValue={data.bankDetails?.accountName || ''}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-kpugi-border font-sans text-xs focus:outline-none focus:border-kpugi-blue"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-kpugi-border font-sans text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-kpugi-blue-dark"
                >
                  {loading ? 'Saving...' : 'Save Bank Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
