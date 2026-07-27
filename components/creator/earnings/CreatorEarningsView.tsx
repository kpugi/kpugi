'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreatorEarningsData } from '@/lib/supabase/creator';
import { requestPayoutAction, resolveAndSaveBankAccountAction, getNigerianBanksAction } from '@/app/actions/creator';
import { FALLBACK_NIGERIAN_BANKS, BankOption } from '@/lib/paystack/banks';
import BankLogo from '@/components/ui/BankLogo';
import { CreditCard, Info, Plus, ShieldCheck, ArrowUpRight, CheckCircle2, Building2, ChevronRight, Filter, Download } from 'lucide-react';

interface CreatorEarningsViewProps {
  data: CreatorEarningsData;
}

export default function CreatorEarningsView({ data }: CreatorEarningsViewProps) {
  const [mounted, setMounted] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamic Nigerian Banks list from Paystack
  const [bankList, setBankList] = useState<BankOption[]>(FALLBACK_NIGERIAN_BANKS);

  // Bank resolution state
  const [selectedBankCode, setSelectedBankCode] = useState('057');
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Custom searchable bank dropdown state
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    getNigerianBanksAction().then((banks) => {
      if (banks && banks.length > 0) {
        setBankList(banks);
      }
    });
  }, []);

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
        const selectedBank = bankList.find((b) => b.code === selectedBankCode);
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
    const selectedBank = bankList.find((b) => b.code === selectedBankCode);
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
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 text-center sm:text-left">
            <div className="space-y-2 flex flex-col items-center sm:items-start">
              <span className="font-sans text-[11px] font-bold text-kpugi-slate uppercase tracking-wider block">
                Available Wallet Balance
              </span>
              <div className="font-mono font-extrabold text-3xl sm:text-4xl text-kpugi-ink tracking-tight">
                ₦{availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex justify-center sm:justify-start">
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
                <BankLogo bankName={data.bankDetails?.bankName || 'Zenith Bank PLC'} bankCode={data.bankDetails?.bankCode || '057'} size="md" />
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
                <BankLogo bankName="GTBank" bankCode="058" size="md" />
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
         BOTTOM ROW: LARGE CREATOR ESCROW & GROWTH BANNER
      ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-kpugi-ink to-blue-950 p-6 sm:p-10 text-white shadow-xl border border-slate-800">
        {/* Background Decorative Glow Shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-kpugi-blue/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Heading & Feature Badges */}
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold font-mono uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Instant Payout Protection & Scraper Audited
            </div>

            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
              Maximize Your Campaign Revenue with Guaranteed Escrow Clearances
            </h3>

            <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every video view, engagement, and conversion is verified in real-time by Kpugi's anti-fraud performance network.
              Funds are ring-fenced upfront in escrow and settle directly into your verified Nigerian bank account.
            </p>

            {/* Feature Pills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <span className="text-[11px] font-bold text-white block">100% Escrow Backed</span>
                  <span className="text-[10px] text-slate-400 block">Funds locked prior to launch</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <ArrowUpRight className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="text-left">
                  <span className="text-[11px] font-bold text-white block">Instant Direct NUBAN</span>
                  <span className="text-[10px] text-slate-400 block">Paystack real-time transfers</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                <div className="text-left">
                  <span className="text-[11px] font-bold text-white block">Automated Audit</span>
                  <span className="text-[10px] text-slate-400 block">Zero manual review delays</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: CTA Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 justify-center">
            <a
              href="/campaigns"
              className="px-6 py-3.5 rounded-2xl bg-kpugi-blue hover:bg-blue-600 text-white font-sans text-xs sm:text-sm font-bold transition-all shadow-lg shadow-kpugi-blue/30 flex items-center justify-center gap-2 group"
            >
              <span>Browse Active Campaigns</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={availableBalance < 10000}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-sans text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4 text-blue-300" />
              <span>Withdraw Available Earnings</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         MODAL 1: WITHDRAWAL REQUEST MODAL
      ───────────────────────────────────────────────────── */}
      {showPayoutModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-kpugi-border">
            <div>
              <h3 className="font-display font-bold text-xl text-kpugi-ink">Request Withdrawal</h3>
              <p className="font-sans text-xs text-kpugi-slate mt-1">
                Enter the amount you wish to transfer to your linked bank account. Minimum withdrawal is ₦10,000.
              </p>
            </div>

            {errorMsg && <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">{errorMsg}</p>}

            <form onSubmit={handlePayoutSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1 uppercase tracking-wider">
                  Amount (₦)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    name="amount"
                    min={10000}
                    max={availableBalance}
                    defaultValue={10000}
                    required
                    className="w-full pl-4 pr-16 py-3.5 rounded-xl border border-kpugi-border font-mono text-base font-extrabold text-kpugi-ink focus:outline-none focus:border-kpugi-blue bg-slate-50 placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-4 text-xs font-extrabold text-kpugi-slate pointer-events-none">NGN</span>
                </div>
                <span className="text-[11px] text-kpugi-slate mt-1.5 block font-medium">
                  Available for withdrawal: <strong className="text-kpugi-ink">₦{availableBalance.toLocaleString()}</strong>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-kpugi-border text-xs text-slate-700 flex items-center gap-3">
                <BankLogo bankName={data.bankDetails?.bankName || 'Zenith Bank PLC'} bankCode={data.bankDetails?.bankCode || '057'} size="sm" />
                <span className="font-medium">
                  Payout destination: <strong className="text-kpugi-ink">{data.bankDetails?.bankName || 'Zenith Bank PLC'}</strong> (****{' '}
                  {data.bankDetails?.accountNumber?.slice(-4) || '4492'})
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-kpugi-border bg-white text-kpugi-slate hover:text-kpugi-ink hover:bg-slate-50 font-sans text-xs font-bold transition-all"
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
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────
         MODAL 2: ADD BANK ACCOUNT (PAYSTACK NUBAN RESOLUTION)
      ───────────────────────────────────────────────────── */}
      {showBankModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-kpugi-border">
            <div>
              <h3 className="font-display font-bold text-xl text-kpugi-ink">Link Bank Account</h3>
              <p className="font-sans text-xs text-kpugi-slate mt-1">
                Enter your Nigerian NUBAN account number. We will verify your account name instantly via Paystack.
              </p>
            </div>

            {errorMsg && <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">{errorMsg}</p>}

            <form onSubmit={handleBankSubmit} className="space-y-4 font-sans text-xs">
              <div className="relative">
                <label className="block text-xs font-bold text-kpugi-slate mb-1 uppercase tracking-wider">
                  Select Bank
                </label>
                
                {/* Custom Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                  className="w-full px-4 py-3 rounded-xl border border-kpugi-border font-sans text-xs flex items-center justify-between bg-white text-left focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BankLogo bankName={bankList.find((b) => b.code === selectedBankCode)?.name} bankCode={selectedBankCode} size="sm" />
                    <span className="font-bold text-kpugi-ink truncate">
                      {bankList.find((b) => b.code === selectedBankCode)?.name || 'Select a bank...'}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isBankDropdownOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Dropdown Menu with Live Search Filter */}
                {isBankDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-2xl border border-kpugi-border shadow-xl p-2 space-y-2 max-h-56 flex flex-col">
                    <input
                      type="text"
                      placeholder="Search bank (e.g. GTBank, OPay, Zenith)..."
                      value={bankSearchQuery}
                      onChange={(e) => setBankSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-kpugi-border rounded-xl focus:outline-none focus:border-kpugi-blue bg-slate-50 font-sans"
                      autoFocus
                    />

                    <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-40">
                      {bankList
                        .filter((b) => b.name.toLowerCase().includes(bankSearchQuery.toLowerCase()))
                        .map((b) => (
                          <button
                            key={`${b.code}-${b.name}`}
                            type="button"
                            onClick={() => {
                              setSelectedBankCode(b.code);
                              setIsBankDropdownOpen(false);
                              setBankSearchQuery('');
                            }}
                            className={`w-full px-3 py-2.5 text-left text-xs font-sans transition-colors flex items-center justify-between rounded-lg ${
                              selectedBankCode === b.code
                                ? 'bg-blue-50 text-kpugi-blue font-bold'
                                : 'hover:bg-slate-50 text-kpugi-ink'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <BankLogo bankName={b.name} bankCode={b.code} size="sm" />
                              <span className="truncate">{b.name}</span>
                            </div>
                            {selectedBankCode === b.code && <CheckCircle2 className="w-3.5 h-3.5 text-kpugi-blue shrink-0" />}
                          </button>
                        ))}
                      {bankList.filter((b) => b.name.toLowerCase().includes(bankSearchQuery.toLowerCase())).length === 0 && (
                        <div className="py-4 text-center text-xs text-kpugi-slate font-medium">No bank found matching query</div>
                      )}
                    </div>
                  </div>
                )}
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
                  className="w-1/2 py-3 rounded-xl border border-kpugi-border bg-white text-kpugi-slate hover:text-kpugi-ink hover:bg-slate-50 font-sans text-xs font-bold transition-all"
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
        </div>,
        document.body
      )}
    </div>
  );
}
