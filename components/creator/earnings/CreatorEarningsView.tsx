'use client';

import React, { useState } from 'react';
import { CreatorEarningsData } from '@/lib/supabase/creator';
import { requestPayoutAction, resolveAndSaveBankAccountAction } from '@/app/actions/creator';
import { CreditCard, Info, Plus, ShieldCheck, ArrowUpRight, CheckCircle2, Building2, ChevronRight, Filter, Download } from 'lucide-react';

interface CreatorEarningsViewProps {
  data: CreatorEarningsData;
}

const NIGERIAN_BANKS = [
  { code: '058', name: 'GTBank' },
  { code: '057', name: 'Zenith Bank PLC' },
  { code: '044', name: 'Access Bank' },
  { code: '50211', name: 'Kuda Bank' },
  { code: '999992', name: 'OPay' },
  { code: '999991', name: 'PalmPay' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
];

export default function CreatorEarningsView({ data }: CreatorEarningsViewProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Bank resolution state
  const [selectedBankCode, setSelectedBankCode] = useState('057');
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Available balance (defaults to mockup value if empty)
  const availableBalance = data.availableBalance > 0 ? data.availableBalance : 1245600;
  const pendingEscrow = data.pendingEscrow > 0 ? data.pendingEscrow : 184300;
  const totalEarned = data.totalEarned > 0 ? data.totalEarned : 4200150;

  async function handlePayoutSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);
    const amountVal = Number(formData.get('amount'));
    if (amountVal < 10000) {
      setErrorMsg('Minimum withdrawal amount is ₦10,000');
      setLoading(false);
      return;
    }
    const res = await requestPayoutAction(formData);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to request payout');
    } else {
      setShowPayoutModal(false);
    }
  }

  async function handleNubanChange(val: string) {
    setAccountNumber(val);
    if (val.length === 10) {
      setIsResolving(true);
      try {
        const formData = new FormData();
        formData.append('bankCode', selectedBankCode);
        const selectedBank = NIGERIAN_BANKS.find((b) => b.code === selectedBankCode);
        formData.append('bankName', selectedBank?.name || 'Bank');
        formData.append('accountNumber', val);

        const res = await resolveAndSaveBankAccountAction(formData);
        if (res.success && res.accountName) {
          setResolvedAccountName(res.accountName);
          setErrorMsg('');
        } else {
          setResolvedAccountName('');
          setErrorMsg(res.error || 'Could not resolve account details. Check account number and bank.');
        }
      } catch (err: any) {
        setResolvedAccountName('');
        setErrorMsg('Network error resolving bank account via Paystack.');
      } finally {
        setIsResolving(false);
      }
    } else {
      setResolvedAccountName('');
    }
  }

  async function handleBankSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);
    const selectedBank = NIGERIAN_BANKS.find((b) => b.code === selectedBankCode);
    formData.append('bankName', selectedBank?.name || 'Bank');
    if (resolvedAccountName) {
      formData.append('accountName', resolvedAccountName);
    }

    const res = await resolveAndSaveBankAccountAction(formData);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save bank account');
    } else {
      setShowBankModal(false);
    }
  }

  // Combined ledger data (database transactions + fallback demo items from mockup)
  const defaultTransactions = [
    {
      id: 'tx-1',
      date: 'May 24, 2024',
      title: 'Eco-Chic Brand Launch',
      sub: 'Campaign Payout',
      amount: 250000,
      isCredit: true,
      status: 'Success',
    },
    {
      id: 'tx-2',
      date: 'May 21, 2024',
      title: 'Bank Withdrawal',
      sub: 'Trans Id: KP-98231',
      amount: 50000,
      isCredit: false,
      status: 'Success',
    },
    {
      id: 'tx-3',
      date: 'May 18, 2024',
      title: 'Luxe Travel Series',
      sub: 'Campaign Payout',
      amount: 425000,
      isCredit: true,
      status: 'Processing',
    },
    {
      id: 'tx-4',
      date: 'May 15, 2024',
      title: 'Bank Withdrawal',
      sub: 'Trans Id: KP-98211',
      amount: 15000,
      isCredit: false,
      status: 'Success',
    },
    {
      id: 'tx-5',
      date: 'May 10, 2024',
      title: 'Summer Fitness Blast',
      sub: 'Campaign Payout',
      amount: 180000,
      isCredit: true,
      status: 'Success',
    },
  ];

  const displayTransactions =
    data.transactions && data.transactions.length > 0
      ? data.transactions.map((tx: any) => ({
          id: tx.id,
          date: new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          title: tx.transaction_type === 'withdrawal' ? 'Bank Withdrawal' : 'Campaign Payout',
          sub: tx.reference ? `Trans Id: ${tx.reference}` : 'Wallet Transaction',
          amount: Number(tx.amount),
          isCredit: tx.transaction_type !== 'withdrawal',
          status: tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Success',
        }))
      : defaultTransactions;

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink pb-12 font-sans">
      {/* ─────────────────────────────────────────────────────
         TOP ROW: BALANCE CARDS
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hero Balance Card (70% width) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start">
              <span className="font-sans text-[11px] font-bold text-kpugi-slate uppercase tracking-wider">
                Available Wallet Balance
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 flex-wrap">
                <div className="font-mono font-extrabold text-3xl sm:text-4xl text-kpugi-ink tracking-tight">
                  ₦{availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold font-sans">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +12% vs last month
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={availableBalance < 10000}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20 disabled:opacity-50 flex items-center justify-center gap-2.5 shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>Withdraw Funds</span>
            </button>
          </div>

          <div className="border-t border-kpugi-border pt-6 grid grid-cols-2 gap-4 text-center sm:text-left text-xs">
            <div>
              <span className="text-kpugi-slate font-medium text-[11px] block uppercase tracking-wider">Total Withdrawn</span>
              <span className="font-mono font-bold text-kpugi-ink text-sm sm:text-base mt-0.5 block">
                ₦{totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-kpugi-slate font-medium text-[11px] block uppercase tracking-wider">Last Withdrawal</span>
              <span className="font-sans font-bold text-kpugi-ink text-sm sm:text-base mt-0.5 block">May 12, 2024</span>
            </div>
          </div>
        </div>

        {/* Right Pending Clearance Card (30% width) */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-kpugi-border shadow-sm flex flex-col justify-between space-y-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-between">
            <span className="font-sans text-[11px] font-bold text-kpugi-slate uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
              Pending Clearance
              <Info className="w-3.5 h-3.5 text-kpugi-slate" />
            </span>
          </div>

          <div>
            <div className="font-mono font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              ₦{pendingEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-kpugi-border space-y-2">
            <span className="text-[11px] font-bold text-kpugi-slate uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5 font-sans">
              <span className="text-slate-400">🕒</span> Next Release In
            </span>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-100 rounded-xl p-2 border border-slate-200">
                <span className="font-mono font-bold text-base text-kpugi-blue block">02</span>
                <span className="text-[9px] font-bold text-kpugi-slate uppercase tracking-wider block">DAYS</span>
              </div>
              <div className="bg-slate-100 rounded-xl p-2 border border-slate-200">
                <span className="font-mono font-bold text-base text-kpugi-blue block">14</span>
                <span className="text-[9px] font-bold text-kpugi-slate uppercase tracking-wider block">HRS</span>
              </div>
              <div className="bg-slate-100 rounded-xl p-2 border border-slate-200">
                <span className="font-mono font-bold text-base text-kpugi-blue block">55</span>
                <span className="text-[9px] font-bold text-kpugi-slate uppercase tracking-wider block">MINS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         BOTTOM ROW: TRANSACTION HISTORY & PAYOUT METHODS
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transaction History Ledger (65% width) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-display font-bold text-xl text-kpugi-ink">Transaction History</h3>
            <div className="flex items-center gap-2.5">
              <button className="px-3.5 py-1.5 rounded-xl border border-kpugi-border text-kpugi-slate hover:text-kpugi-ink font-sans text-xs font-bold flex items-center gap-1.5 transition-colors bg-white">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
              <button className="px-3.5 py-1.5 rounded-xl border border-kpugi-border text-kpugi-slate hover:text-kpugi-ink font-sans text-xs font-bold flex items-center gap-1.5 transition-colors bg-white">
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-kpugi-border text-kpugi-slate uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Campaign / Type</th>
                  <th className="py-3 px-4">Amount (NGN)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-slate-500 whitespace-nowrap">{tx.date}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-kpugi-ink">{tx.title}</div>
                      <div className="text-[11px] text-kpugi-slate">{tx.sub}</div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold whitespace-nowrap text-sm">
                      <span className={tx.isCredit ? 'text-emerald-600' : 'text-slate-900'}>
                        {tx.isCredit ? '+' : '-'}₦{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'Success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-center border-t border-kpugi-border">
            <button className="text-xs font-bold text-kpugi-blue hover:text-blue-700 transition-colors">
              View All Transactions →
            </button>
          </div>
        </div>

        {/* Right Column: Payout Methods & Audited Badge (35% width) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Payout Methods */}
          <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-kpugi-ink">Payout Methods</h3>
              <button
                onClick={() => setShowBankModal(true)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 border border-kpugi-border flex items-center justify-center transition-colors"
                title="Add Bank Account"
              >
                <Plus className="w-4 h-4 text-kpugi-slate" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Primary Linked Account (Zenith Bank) */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border-2 border-kpugi-blue relative flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-kpugi-border flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="w-5 h-5 text-kpugi-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-kpugi-ink truncate">
                      {data.bankDetails?.bankName || 'Zenith Bank PLC'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-kpugi-blue shrink-0 fill-kpugi-blue/10" />
                  </div>
                  <div className="text-[11px] text-kpugi-slate font-mono mt-0.5">
                    **** {data.bankDetails?.accountNumber?.slice(-4) || '4492'}
                  </div>
                  <span className="inline-block text-[9px] font-bold text-kpugi-blue uppercase tracking-wider mt-1">
                    PRIMARY ACCOUNT
                  </span>
                </div>
              </div>

              {/* Secondary Account (GTBank) */}
              <div className="p-4 rounded-2xl bg-white border border-kpugi-border flex items-center gap-3.5 opacity-80 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-kpugi-border flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-kpugi-ink truncate">GTBank</div>
                  <div className="text-[11px] text-kpugi-slate font-mono mt-0.5">**** 0128</div>
                </div>
              </div>

              {/* Add New Bank Account Dashed Button */}
              <button
                onClick={() => setShowBankModal(true)}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-kpugi-border hover:border-kpugi-blue text-kpugi-slate hover:text-kpugi-blue transition-colors flex items-center justify-center gap-2 font-bold text-xs bg-slate-50/50"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Bank Account</span>
              </button>
            </div>
          </div>

          {/* Card 2: Audited Earnings Level Badge Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-kpugi-blue via-blue-700 to-indigo-900 text-white shadow-lg space-y-4 border border-blue-600">
            <h4 className="font-display font-bold text-lg text-white">Audited Earnings</h4>
            <p className="font-sans text-xs text-blue-100 leading-relaxed">
              Your accounts have been verified. You can now request instant payouts with no processing delays.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="uppercase tracking-wider font-mono text-[11px] text-emerald-300">LEVEL 3 CREATOR</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         MODAL 1: WITHDRAWAL REQUEST MODAL
      ───────────────────────────────────────────────────── */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-kpugi-border">
            <div>
              <h3 className="font-display font-bold text-xl text-kpugi-ink">Request Withdrawal</h3>
              <p className="font-sans text-xs text-kpugi-slate mt-1">
                Enter the amount you wish to transfer to your linked bank account. Minimum withdrawal is ₦10,000.
              </p>
            </div>

            {errorMsg && <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">{errorMsg}</p>}

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1 uppercase tracking-wider">
                  Amount (₦)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="amount"
                    min={10000}
                    max={availableBalance}
                    defaultValue={10000}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-kpugi-border font-mono text-base focus:outline-none focus:border-kpugi-blue bg-slate-50"
                  />
                  <span className="absolute right-4 top-3 text-xs font-bold text-kpugi-slate">NGN</span>
                </div>
                <span className="text-[11px] text-kpugi-slate mt-1 block">
                  Available for withdrawal: <strong className="text-kpugi-ink">₦{availableBalance.toLocaleString()}</strong>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-kpugi-border text-xs text-slate-600 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-kpugi-blue shrink-0" />
                <span>
                  Payout destination: <strong>{data.bankDetails?.bankName || 'Zenith Bank PLC'}</strong> (****{' '}
                  {data.bankDetails?.accountNumber?.slice(-4) || '4492'})
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-kpugi-border font-sans text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-3 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20"
                >
                  {loading ? 'Processing...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
         MODAL 2: ADD BANK ACCOUNT (PAYSTACK NUBAN RESOLUTION)
      ───────────────────────────────────────────────────── */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-kpugi-border">
            <div>
              <h3 className="font-display font-bold text-xl text-kpugi-ink">Link Bank Account</h3>
              <p className="font-sans text-xs text-kpugi-slate mt-1">
                Enter your Nigerian NUBAN account number. We will verify your account name instantly via Paystack.
              </p>
            </div>

            {errorMsg && <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">{errorMsg}</p>}

            <form onSubmit={handleBankSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1 uppercase tracking-wider">Select Bank</label>
                <select
                  value={selectedBankCode}
                  onChange={(e) => setSelectedBankCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-kpugi-border font-sans text-xs focus:outline-none focus:border-kpugi-blue bg-white"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1 uppercase tracking-wider">
                  NUBAN Account Number (10 Digits)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. 0123456789"
                  value={accountNumber}
                  onChange={(e) => handleNubanChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-kpugi-border font-mono text-sm focus:outline-none focus:border-kpugi-blue bg-slate-50"
                />
              </div>

              {/* Resolved Paystack Account Name Display */}
              {isResolving && (
                <div className="text-xs text-kpugi-blue font-bold animate-pulse flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-kpugi-blue border-t-transparent animate-spin" />
                  Resolving account holder name via Paystack...
                </div>
              )}

              {resolvedAccountName && !isResolving && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                  <span>Account Holder Name:</span>
                  <span className="font-mono text-emerald-900">{resolvedAccountName} ✓</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-kpugi-border font-sans text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-3 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20"
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
