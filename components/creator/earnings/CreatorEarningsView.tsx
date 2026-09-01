'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreatorEarningsData } from '@/lib/supabase/creator';
import { requestPayoutAction, resolveAndSaveBankAccountAction, getNigerianBanksAction, deleteBankAccountAction, setDefaultBankAccountAction } from '@/app/actions/creator';
import { FALLBACK_NIGERIAN_BANKS, BankOption } from '@/lib/paystack/banks';
import BankLogo from '@/components/ui/BankLogo';
import { CreditCard, Info, Plus, ShieldCheck, ArrowUpRight, CheckCircle2, Building2, ChevronRight, ChevronDown, Clock, Filter, Download, Eye, TrendingUp, Hash, Trash2 } from 'lucide-react';

interface CreatorEarningsViewProps {
  data: CreatorEarningsData;
}

function formatClearanceDate(dateStr?: string | null) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (isToday) return `Today at ${timeStr}`;
  if (isTomorrow) return `Tomorrow at ${timeStr}`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

function formatHoursRemaining(dateStr?: string | null) {
  if (!dateStr) return '';
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Ready to clear';
  const hrs = Math.max(1, Math.round(diff / (1000 * 60 * 60)));
  return `in ~${hrs}h`;
}

function LiveClearanceTicker({ targetDate }: { targetDate: string }) {
  return <ClearanceCountdown targetDate={targetDate} />;
}

function ClearanceCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    function updateCountdown() {
      const now = Date.now();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-bold font-mono">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        Grace Window Complete (Ready)
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100/70 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-500/30 font-mono text-[11px] font-bold shadow-2xs">
      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
      <span className="text-[10px] font-sans font-medium text-amber-700 dark:text-amber-400">Unlocks in:</span>
      <span className="text-amber-900 dark:text-amber-100 font-extrabold tracking-wide">
        {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
}

function DailyCycleCountdown() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);

      const diff = Math.max(0, midnight.getTime() - now.getTime());
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds });
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-2xs font-mono text-[11px] font-semibold whitespace-nowrap shrink-0 tabular-nums">
      <Clock className="w-3 h-3 text-kpugi-blue dark:text-blue-400 animate-pulse shrink-0" />
      <span className="text-[10px] font-sans font-medium text-slate-500 dark:text-slate-400">Clears in:</span>
      <span className="text-kpugi-blue dark:text-blue-400 font-bold tracking-tight">
        {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
}

export default function CreatorEarningsView({ data }: CreatorEarningsViewProps) {
  const [mounted, setMounted] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Selected withdrawal destination account
  const defaultBankId = data.bankAccounts?.find(b => b.isPrimary)?.id || data.bankAccounts?.[0]?.id || '';
  const [selectedWithdrawBankId, setSelectedWithdrawBankId] = useState<string>(defaultBankId);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

  // Sync default withdraw bank ID if accounts change
  useEffect(() => {
    if (data.bankAccounts && data.bankAccounts.length > 0) {
      const primary = data.bankAccounts.find(b => b.isPrimary) || data.bankAccounts[0];
      if (primary && (!selectedWithdrawBankId || !data.bankAccounts.some(b => b.id === selectedWithdrawBankId))) {
        setSelectedWithdrawBankId(primary.id);
      }
    }
  }, [data.bankAccounts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!loading) setShowPayoutModal(false);
        if (!loading) setShowBankModal(false);
      }
    };
    if (showPayoutModal || showBankModal) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showPayoutModal, showBankModal, loading]);

  // Real creator balances from Supabase
  const availableBalance = data.availableBalance || 0;
  const pendingEscrow = data.pendingEscrow || 0;
  const totalEarned = data.totalEarned || 0;
  const totalWithdrawn = data.totalWithdrawn || 0;
  const lastWithdrawal = data.lastWithdrawalDate
    ? new Date(data.lastWithdrawalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No withdrawals yet';

  async function handlePayoutSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (data.kycStatus !== 'verified') {
      setErrorMsg('Identity Verification Required: Please verify your government ID on the Settings page before requesting withdrawals.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const amountVal = Number(formData.get('amount'));
    if (amountVal < 10000) {
      setErrorMsg('Minimum withdrawal amount is ₦10,000');
      setLoading(false);
      return;
    }

    if (selectedWithdrawBankId) {
      formData.set('bankAccountId', selectedWithdrawBankId);
    }

    const res = await requestPayoutAction(formData);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to request payout');
    } else {
      setShowPayoutModal(false);
    }
  }

  async function handleDeleteAccount(accountId: string) {
    if (!confirm('Are you sure you want to delete this payout account?')) return;
    setActionLoadingId(accountId);
    try {
      const res = await deleteBankAccountAction(accountId);
      if (!res.success) {
        alert(res.error || 'Failed to delete account');
      }
    } catch (err: any) {
      alert(err.message || 'Network error deleting account');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleSetDefaultAccount(accountId: string) {
    setActionLoadingId(accountId);
    try {
      const res = await setDefaultBankAccountAction(accountId);
      if (!res.success) {
        alert(res.error || 'Failed to set default account');
      } else {
        setSelectedWithdrawBankId(accountId);
      }
    } catch (err: any) {
      alert(err.message || 'Network error setting default account');
    } finally {
      setActionLoadingId(null);
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
    formData.set('bankCode', selectedBankCode);
    formData.set('bankName', selectedBank?.name || 'Bank');
    formData.set('accountNumber', accountNumber);
    if (resolvedAccountName) {
      formData.set('accountName', resolvedAccountName);
    }

    const res = await resolveAndSaveBankAccountAction(formData);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save bank account');
    } else {
      setShowBankModal(false);
      setAccountNumber('');
      setResolvedAccountName('');
    }
  }

  // Real transactions from database with enriched clearance & audit data
  const displayTransactions = (data.transactions || []).map((tx: any) => {
    const isWithdrawal = Boolean(tx.is_withdrawal || tx.type === 'withdrawal' || tx.transaction_type === 'withdrawal' || Number(tx.amount || 0) < 0);
    const isCredit = !isWithdrawal && (tx.type === 'credit' || tx.type === 'payout' || tx.type === 'payout_release' || tx.transaction_type === 'payout');
    const isClearing = Boolean(tx.is_clearing);

    let statusLabel = 'Completed';
    if (isClearing) {
      statusLabel = 'Clearing';
    } else if (tx.status) {
      statusLabel = tx.status.charAt(0).toUpperCase() + tx.status.slice(1);
    }

    return {
      id: tx.id,
      date: new Date(tx.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date(tx.created_at || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      title: tx.title || (isWithdrawal ? 'Direct Bank Withdrawal' : 'Campaign Earnings'),
      sub: tx.campaign_title || (isWithdrawal ? 'Bank Transfer' : 'Campaign Payout'),
      reference: tx.reference || `TX-${tx.id.slice(0, 8).toUpperCase()}`,
      amount: Math.abs(Number(tx.amount || 0)),
      isCredit,
      isWithdrawal,
      bankName: tx.bank_name || null,
      accountNumber: tx.account_number || null,
      accountName: tx.account_name || null,
      status: statusLabel,
      isClearing,
      clearanceAt: tx.clearance_at,
      viewsCount: tx.views_count || tx.views_scraped || tx.views_delta || null,
      viewsScraped: tx.views_scraped,
      viewsDelta: tx.views_delta,
      cpmRate: tx.cpm_rate,
      settlementMethod: tx.settlement_method || (isWithdrawal ? 'Direct Bank Settlement (NUBAN)' : 'Advertiser Verification'),
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink dark:text-white pb-12 font-sans">
      {/* ─────────────────────────────────────────────────────
         TOP ROW: BALANCE CARDS
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hero Balance Card (70% width) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 text-center sm:text-left">
            <div className="space-y-2 flex flex-col items-center sm:items-start">
              <span className="font-sans text-[11px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider block">
                Available Wallet Balance
              </span>
              <div className="font-mono font-extrabold text-3xl sm:text-4xl text-kpugi-ink dark:text-white tracking-tight">
                ₦{availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold font-sans">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Ready for instant withdrawal
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

          <div className="border-t border-kpugi-border dark:border-white/10 pt-6 grid grid-cols-2 gap-4 text-center sm:text-left text-xs">
            <div>
              <span className="text-kpugi-slate dark:text-slate-400 font-medium text-[11px] block uppercase tracking-wider">Total Withdrawn</span>
              <span className="font-mono font-bold text-kpugi-ink dark:text-white text-sm sm:text-base mt-0.5 block">
                ₦{totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-kpugi-slate dark:text-slate-400 font-medium text-[11px] block uppercase tracking-wider">Last Withdrawal</span>
              <span className="font-sans font-bold text-kpugi-ink dark:text-white text-sm sm:text-base mt-0.5 block">{lastWithdrawal}</span>
            </div>
          </div>
        </div>

        {/* Right Pending Clearance Card (30% width) */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col justify-between space-y-5 text-center sm:text-left">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-sans text-[11px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              Pending Clearance
            </span>
            <DailyCycleCountdown />
          </div>

          <div>
            <div className="font-mono font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
              ₦{pendingEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {data.nextClearanceDate && pendingEscrow > 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-500/30 space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                  Next Release
                </span>
                <span className="font-mono font-bold text-xs text-amber-900 dark:text-amber-200">
                  ₦{(data.nextClearanceAmount || pendingEscrow).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-amber-800 dark:text-amber-300 flex-wrap">
                <span className="font-medium text-[11px] text-slate-600 dark:text-slate-400">{formatClearanceDate(data.nextClearanceDate)}</span>
                <ClearanceCountdown targetDate={data.nextClearanceDate} />
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-left">
              <p className="text-xs text-kpugi-slate dark:text-slate-400 leading-relaxed">
                Earnings from newly audited views clear daily into your withdrawable balance.
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/5 text-[11px] text-kpugi-slate dark:text-slate-400">
                <span>Auto-Clearance Cycle:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">Every 24h</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         MIDDLE ROW: COMPACT TODAY'S PROGRESS STRIP
      ───────────────────────────────────────────────────── */}
      {Boolean(data.todayViews && data.todayViews > 0) && (
        <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-center sm:text-left">
          {/* Header Label with Pulsing Live Dot */}
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Today's Live Accrual
              </span>
            </div>

            {/* Centered Huge Earning Amount */}
            <div className="font-mono font-black text-3xl sm:text-4xl lg:text-5xl text-kpugi-blue tracking-tight">
              +₦{Number(data.todayAccrual).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex flex-col sm:items-end justify-center gap-1">
            <DailyCycleCountdown />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Auto-settles at cycle reset</span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
         BOTTOM ROW: TRANSACTION HISTORY & PAYOUT METHODS
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transaction History Ledger (65% width) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-display font-bold text-xl text-kpugi-ink dark:text-white">Transaction History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-kpugi-border dark:border-white/10 text-kpugi-slate dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Campaign / Type</th>
                  <th className="py-3 px-4">Amount (NGN)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-2 w-8 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayTransactions.length > 0 ? (
                  displayTransactions.map((tx) => {
                    const isExpanded = expandedTxId === tx.id;
                    return (
                      <React.Fragment key={tx.id}>
                        <tr
                          onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                          className={`hover:bg-slate-50/90 dark:hover:bg-white/5 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50/70 dark:bg-white/5' : ''
                            }`}
                        >
                          <td className="py-4 px-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            <div>{tx.date}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{tx.time}</div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-bold text-kpugi-ink dark:text-white">{tx.title}</div>
                            <div className="text-[11px] text-kpugi-slate dark:text-slate-400 flex items-center gap-1.5">
                              <span>{tx.sub}</span>
                              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{tx.reference}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono font-bold whitespace-nowrap text-sm">
                            <span className={tx.isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                              {tx.isCredit ? '+₦' : '-₦'}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {tx.isClearing ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
                                Clearing ({formatHoursRemaining(tx.clearanceAt)})
                              </span>
                            ) : tx.status === 'Completed' || tx.status === 'Success' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                Cleared
                              </span>
                            ) : tx.status === 'Processing' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                                <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
                                Processing
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                {tx.status}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-2 text-center text-slate-400">
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 inline-block ${isExpanded ? 'rotate-180 text-kpugi-blue' : ''
                                }`}
                            />
                          </td>
                        </tr>

                        {/* Accordion Details Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-50/50 dark:bg-black/20">
                            <td colSpan={5} className="p-3 sm:p-5 pt-0">
                              <div className="rounded-2xl bg-white dark:bg-[#0D111D] border border-slate-200/80 dark:border-white/10 p-5 space-y-4 shadow-xs">
                                {tx.isWithdrawal ? (
                                  <>
                                    {/* Withdrawal Header / Status Bar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                            <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                            Direct Bank Withdrawal
                                          </span>
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                                            {tx.status}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          {tx.status === 'Completed' || tx.status === 'Cleared' || tx.status === 'Success'
                                            ? `Disbursed to ${tx.bankName || 'bank account'} (${tx.accountNumber ? '****' + tx.accountNumber.slice(-4) : 'NUBAN'}) via direct settlement.`
                                            : `Disbursement request of ₦${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been submitted and queued for bank settlement.`}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Withdrawal Metric Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                      {/* Box 1: Destination Account */}
                                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                          <Building2 className="w-3 h-3 text-slate-400" /> Destination Account
                                        </span>
                                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                          {tx.bankName || 'Direct Bank'}
                                        </div>
                                        <div className="font-mono text-xs text-slate-600 dark:text-slate-300">
                                          {tx.accountNumber ? `****${tx.accountNumber.slice(-4)}` : 'NUBAN Direct'}
                                          {tx.accountName ? ` • ${tx.accountName}` : ''}
                                        </div>
                                      </div>

                                      {/* Box 2: Payout Breakdown */}
                                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                          <CreditCard className="w-3 h-3 text-slate-400" /> Amount & Fee
                                        </span>
                                        <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                                          ₦{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                          Transfer Fee: ₦0.00 (Zero Fee)
                                        </div>
                                      </div>

                                      {/* Box 3: Audit Reference */}
                                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                          <Hash className="w-3 h-3 text-slate-400" /> Reference & Timestamp
                                        </span>
                                        <div className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                                          {tx.reference}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                          {tx.date} at {tx.time}
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Campaign Earnings Header / Countdown Ticker Bar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tx.isClearing
                                                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                                                : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400'
                                              }`}
                                          >
                                            {tx.isClearing ? (
                                              <></>
                                            ) : (
                                              <>
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                                Settled & Cleared to Wallet
                                              </>
                                            )}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          {tx.isClearing
                                            ? 'Views have been validated by anti-fraud audit. Payout is undergoing 24-hour verification maturity before release.'
                                            : 'Payout has successfully cleared and is available in your balance for instant withdrawal.'}
                                        </p>
                                      </div>

                                      {tx.isClearing && tx.clearanceAt && (
                                        <div className="shrink-0">
                                          <ClearanceCountdown targetDate={tx.clearanceAt} />
                                        </div>
                                      )}
                                    </div>

                                    {/* Audit Metric Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                      {/* Box 1: Verified Traffic */}
                                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                          <Eye className="w-3 h-3 text-slate-400" /> Verified Traffic
                                        </span>
                                        <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                                          {(tx.viewsScraped || tx.viewsCount || 0).toLocaleString()}{' '}
                                          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">views</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                          Audited batch: {(tx.viewsDelta || tx.viewsScraped || tx.viewsCount || 0).toLocaleString()} views
                                        </div>
                                      </div>

                                      {/* Box 2: Campaign CPM Rate */}
                                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                          <TrendingUp className="w-3 h-3 text-slate-400" /> Campaign CPM
                                        </span>
                                        <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                                          ₦{(tx.cpmRate || 0).toLocaleString()}{' '}
                                          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ 1k views</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                          Payout: (Views ÷ 1,000) × CPM
                                        </div>
                                      </div>

                                      {/* Box 3: Verification Audit Trail */}
                                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                          <Hash className="w-3 h-3 text-slate-400" /> Audit Trail & Clearance
                                        </span>
                                        <div className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                                          {tx.reference}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                          {tx.isClearing && tx.clearanceAt
                                            ? `Unlocks: ${formatClearanceDate(tx.clearanceAt)}`
                                            : `Settled via: ${tx.settlementMethod}`}
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 mb-1">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-sm text-kpugi-ink dark:text-white">No Transactions Yet</p>
                        <p className="text-xs text-kpugi-slate dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                          Completed campaign payouts and NUBAN bank withdrawals will automatically generate ledger records here.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Payout Methods & Audited Badge (35% width) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Payout Methods */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-kpugi-ink dark:text-white">Payout Methods</h3>
              <button
                onClick={() => setShowBankModal(true)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-kpugi-border dark:border-white/10 flex items-center justify-center transition-colors"
                title="Add Bank Account"
              >
                <Plus className="w-4 h-4 text-kpugi-slate dark:text-slate-300" />
              </button>
            </div>

            <div className="space-y-3">
              {data.bankAccounts && data.bankAccounts.length > 0 ? (
                data.bankAccounts.map((acc, idx) => (
                  <div
                    key={acc.id || idx}
                    className={`p-4 rounded-2xl border-2 flex items-start justify-between gap-3 transition-all ${acc.isPrimary ? 'bg-blue-50/50 dark:bg-blue-950/30 border-kpugi-blue dark:border-blue-500/50 shadow-2xs' : 'bg-white dark:bg-[#0D111D] border-kpugi-border dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <BankLogo bankName={acc.bankName} bankCode={acc.bankCode} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-kpugi-ink dark:text-white truncate">{acc.bankName}</span>
                          {acc.isPrimary && <CheckCircle2 className="w-4 h-4 text-kpugi-blue shrink-0 fill-kpugi-blue/10" />}
                        </div>
                        <div className="text-[11px] text-kpugi-slate dark:text-slate-400 font-mono mt-0.5">
                          {acc.accountName} (**** {acc.accountNumber?.slice(-4) || '****'})
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {acc.isPrimary ? (
                            <span className="inline-block text-[9px] font-bold text-kpugi-blue bg-blue-100/60 dark:bg-blue-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              PRIMARY DESTINATION
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAccount(acc.id)}
                              disabled={actionLoadingId === acc.id}
                              className="text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-kpugi-blue dark:hover:text-blue-400 hover:underline transition-colors disabled:opacity-50"
                            >
                              {actionLoadingId === acc.id ? 'Setting...' : 'Set as Primary'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete Account Action */}
                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(acc.id)}
                      disabled={actionLoadingId === acc.id}
                      title="Delete payout account"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0 disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-kpugi-border dark:border-white/10 rounded-2xl space-y-3 bg-slate-50/50 dark:bg-white/5">
                  <Building2 className="w-8 h-8 text-kpugi-slate dark:text-slate-400 mx-auto opacity-60" />
                  <h4 className="font-display font-bold text-sm text-kpugi-ink dark:text-white">No Bank Account Linked Yet</h4>
                  <p className="text-xs text-kpugi-slate dark:text-slate-400 max-w-xs mx-auto">
                    Link your bank account to receive automatic withdrawals via Paystack.
                  </p>
                  <button
                    onClick={() => setShowBankModal(true)}
                    className="px-4 py-2 rounded-xl bg-kpugi-blue text-white text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Link Bank Account</span>
                  </button>
                </div>
              )}
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
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
              Maximize Your Campaign Revenue with Guaranteed Escrow Clearances
            </h3>

            <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every post view, engagement, and conversion is verified in real-time by Kpugi's anti-fraud performance network.
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
                  <span className="text-[11px] font-bold text-white block">Instant Settlement</span>
                  <span className="text-[10px] text-slate-400 block">Immediate NUBAN dispatch</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                <div className="text-left">
                  <span className="text-[11px] font-bold text-white block">Transparent Audits</span>
                  <span className="text-[10px] text-slate-400 block">Real-time view milestones</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: CTA Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (data.kycStatus !== 'verified') {
                  window.location.href = '/c/settings';
                } else {
                  setShowPayoutModal(true);
                }
              }}
              className="w-full sm:w-auto lg:w-full px-8 py-4 rounded-2xl bg-kpugi-blue hover:bg-blue-600 text-white font-sans text-sm font-bold shadow-lg shadow-kpugi-blue/30 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>{data.kycStatus === 'verified' ? 'Withdraw Earnings' : 'Verify ID to Withdraw'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <a
              href="/browse"
              className="w-full sm:w-auto lg:w-full px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-sans text-sm font-bold backdrop-blur-md transition-all text-center border border-white/10"
            >
              Browse Active Campaigns
            </a>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         MODAL 1: REQUEST WITHDRAWAL MODAL
      ───────────────────────────────────────────────────── */}
      {showPayoutModal && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) setShowPayoutModal(false);
          }}
          className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#12141A] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-kpugi-border dark:border-white/10 text-kpugi-ink dark:text-white">
            <div>
              <h3 className="font-display font-bold text-xl text-kpugi-ink dark:text-white">Request Withdrawal</h3>
              <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400 mt-1">
                Enter the amount you wish to transfer to your linked bank account. Minimum withdrawal is ₦10,000.
              </p>
            </div>

            {data.kycStatus !== 'verified' && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
                <div className="font-bold flex items-center gap-2 text-xs">
                  <span>🛡️ ID Verification Required</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  To comply with platform regulations and release earnings withdrawals, you must verify your official government ID (NIN, Voter Card, or Passport).
                </p>
                <a
                  href="/c/settings"
                  className="inline-block px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
                >
                  Verify Identity in Settings →
                </a>
              </div>
            )}

            {errorMsg && <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-500/30">{errorMsg}</p>}

            <form onSubmit={handlePayoutSubmit} className="space-y-4 font-sans text-xs">
              <input type="hidden" name="bankAccountId" value={selectedWithdrawBankId || defaultBankId} />
              <div>
                <label className="block text-xs font-bold text-kpugi-slate dark:text-slate-400 mb-1 uppercase tracking-wider">
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
                    className="w-full pl-4 pr-16 py-3.5 rounded-xl border border-kpugi-border dark:border-white/10 font-mono text-base font-extrabold text-kpugi-ink dark:text-white focus:outline-none focus:border-kpugi-blue bg-slate-50 dark:bg-white/5 focus:bg-white dark:focus:bg-black/30 placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-4 text-xs font-extrabold text-kpugi-slate dark:text-slate-400 pointer-events-none">NGN</span>
                </div>
                <span className="text-[11px] text-kpugi-slate dark:text-slate-400 mt-1.5 block font-medium">
                  Available for withdrawal: <strong className="text-kpugi-ink dark:text-white">₦{availableBalance.toLocaleString()}</strong>
                </span>
              </div>

              {/* Destination Account Selection */}
              <div>
                <label className="block text-xs font-bold text-kpugi-slate dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Payout Destination Account
                </label>
                {data.bankAccounts && data.bankAccounts.length > 1 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {data.bankAccounts.map((acc) => {
                      const isSelected = (selectedWithdrawBankId || defaultBankId) === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setSelectedWithdrawBankId(acc.id)}
                          className={`w-full p-3 rounded-xl border-2 text-left flex items-center justify-between gap-3 transition-all ${isSelected
                              ? 'border-kpugi-blue bg-blue-50/60 dark:bg-blue-950/40 shadow-2xs'
                              : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#0D111D]'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <BankLogo bankName={acc.bankName} bankCode={acc.bankCode} size="sm" />
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-kpugi-ink dark:text-white truncate">
                                {acc.bankName} • ****{acc.accountNumber?.slice(-4)}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{acc.accountName}</div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-kpugi-blue shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-kpugi-border dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-3">
                    <BankLogo bankName={data.bankDetails?.bankName || 'Zenith Bank PLC'} bankCode={data.bankDetails?.bankCode || '057'} size="sm" />
                    <span className="font-medium">
                      <strong className="text-kpugi-ink dark:text-white">{data.bankDetails?.bankName || 'Zenith Bank PLC'}</strong> (****{' '}
                      {data.bankDetails?.accountNumber?.slice(-4) || '4492'})
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 font-sans text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || data.kycStatus !== 'verified'}
                  className="w-1/2 py-3 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20 disabled:opacity-50 disabled:bg-slate-400"
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
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading && !isResolving) setShowBankModal(false);
          }}
          className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#12141A] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-kpugi-border dark:border-white/10 text-kpugi-ink dark:text-white">
            <div>
              <h3 className="font-display font-bold text-xl text-kpugi-ink dark:text-white">Link Bank Account</h3>
              <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400 mt-1">
                Enter your Bank Account number. We will verify your account name instantly.
              </p>
            </div>

            {errorMsg && <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-500/30">{errorMsg}</p>}

            <form onSubmit={handleBankSubmit} className="space-y-4 font-sans text-xs">
              <div className="relative">
                <label className="block text-xs font-bold text-kpugi-slate dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Select Bank
                </label>

                {/* Custom Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                  className="w-full px-4 py-3 rounded-xl border border-kpugi-border dark:border-white/10 font-sans text-xs flex items-center justify-between bg-white dark:bg-white/5 text-left focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BankLogo bankName={bankList.find((b) => b.code === selectedBankCode)?.name} bankCode={selectedBankCode} size="sm" />
                    <span className="font-bold text-kpugi-ink dark:text-white truncate">
                      {bankList.find((b) => b.code === selectedBankCode)?.name || 'Select a bank...'}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isBankDropdownOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Dropdown Menu with Live Search Filter */}
                {isBankDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-[#0D111D] rounded-2xl border border-kpugi-border dark:border-white/10 shadow-xl p-2 space-y-2 max-h-56 flex flex-col">
                    <input
                      type="text"
                      placeholder="Search bank (e.g. GTBank, OPay, Zenith)..."
                      value={bankSearchQuery}
                      onChange={(e) => setBankSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-kpugi-border dark:border-white/10 rounded-xl focus:outline-none focus:border-kpugi-blue bg-slate-50 dark:bg-white/5 text-kpugi-ink dark:text-white font-sans"
                      autoFocus
                    />

                    <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-white/5 max-h-40">
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
                            className={`w-full px-3 py-2.5 text-left text-xs font-sans transition-colors flex items-center justify-between rounded-lg ${selectedBankCode === b.code
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-kpugi-blue font-bold'
                                : 'hover:bg-slate-50 dark:hover:bg-white/5 text-kpugi-ink dark:text-white'
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
                        <div className="py-4 text-center text-xs text-kpugi-slate dark:text-slate-400 font-medium">No bank found matching query</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <input type="hidden" name="bankCode" value={selectedBankCode} />
              <div>
                <label className="block text-xs font-bold text-kpugi-slate dark:text-slate-400 mb-1 uppercase tracking-wider">
                  NUBAN Account Number (10 Digits)
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  maxLength={10}
                  placeholder="e.g. 0123456789"
                  value={accountNumber}
                  onChange={(e) => handleNubanChange(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:border-kpugi-blue focus:ring-4 focus:ring-kpugi-blue/10 transition-all shadow-sm"
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
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
                  <span>Account Holder Name:</span>
                  <span className="font-mono text-emerald-900 dark:text-emerald-300">{resolvedAccountName} ✓</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 font-sans text-xs font-bold transition-all"
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
