'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Wallet,
  Lock,
  Banknote,
  Plus,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Zap,
  ExternalLink,
  FileText,
  Info,
  BellRing,
  Coins,
  Clock,
} from 'lucide-react';
import { BrandWalletData } from '@/lib/supabase/advertiser';
import {
  initializePaystackDepositAction,
  verifyPaystackDepositAction,
  logCancelledPaystackDepositAction,
  saveAdvertiserAlertSettingsAction,
  getFilteredTransactionsAction,
} from '@/app/actions/advertiser';
import { InvoiceModal, InvoiceData } from '@/components/common/InvoiceModal';

interface AdvertiserWalletViewProps {
  data: BrandWalletData;
  verificationNotice?: { text: string; type: 'success' | 'error' } | null;
}

export default function AdvertiserWalletView({ data, verificationNotice }: AdvertiserWalletViewProps) {
  const {
    walletId,
    walletBalance,
    totalEscrowLocked,
    totalPayouts,
    advertiserEmail,
    lowBalanceAlertEnabled,
    lowBalanceAlertThreshold,
    transactions: initialTransactions,
    activeCampaignsEscrow: rawEscrow,
    recentPayouts,
  } = data;

  const [mounted, setMounted] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('500000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(verificationNotice || null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const [dbTransactions, setDbTransactions] = useState(initialTransactions);
  const [filterType, setFilterType] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  const [alertEnabled, setAlertEnabled] = useState(lowBalanceAlertEnabled);
  const [alertThreshold, setAlertThreshold] = useState(String(lowBalanceAlertThreshold));
  const [isSavingAlert, setIsSavingAlert] = useState(false);

  const handleApplyFilters = async () => {
    setIsFiltering(true);
    try {
      const res = await getFilteredTransactionsAction(
        walletId,
        filterType,
        filterStartDate || null,
        filterEndDate || null
      );
      if (res.success && res.transactions) {
        setDbTransactions(res.transactions);
        setCurrentPage(1);
      } else {
        setMsg({ text: res.error || 'Failed to apply filters.', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: `Failed to fetch filtered list: ${err.message}`, type: 'error' });
    } finally {
      setIsFiltering(false);
    }
  };

  const handleResetFilters = () => {
    setFilterType('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setDbTransactions(initialTransactions);
    setCurrentPage(1);
  };

  const handleSaveAlertSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAlert(true);
    try {
      const thresholdNum = parseFloat(alertThreshold.replace(/[^0-9.]/g, '')) || 0;
      const res = await saveAdvertiserAlertSettingsAction(alertEnabled, thresholdNum);
      if (res.success) {
        setMsg({ text: 'Low-balance alert preferences saved successfully in your profile!', type: 'success' });
      } else {
        setMsg({ text: res.error || 'Failed to save settings.', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: `Failed to save preferences: ${err.message}`, type: 'error' });
    } finally {
      setIsSavingAlert(false);
    }
  };


  // Dynamically load Paystack Inline JS V2 for popup checkout
  useEffect(() => {
    if ((window as any).PaystackPop) return;
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    script.onerror = () => {
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://js.paystack.co/v1/inline.js';
      fallbackScript.async = true;
      document.body.appendChild(fallbackScript);
    };
    document.body.appendChild(script);
  }, []);

  // Utility to format values compactly in M's and K's (e.g., ₦2.45M, ₦500K)
  const formatCompactCurrency = (val: number) => {
    if (val >= 1000000) {
      const num = val / 1000000;
      return `₦${num.toFixed(num % 1 === 0 ? 0 : 2)}M`;
    }
    if (val >= 1000) {
      const num = val / 1000;
      return `₦${num.toFixed(num % 1 === 0 ? 0 : 1)}K`;
    }
    return `₦${val.toLocaleString()}`;
  };

  const format2Decimals = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Map database transactions to UI shape dynamically
  const transactions = (dbTransactions || []).map((t) => {
    let typeLabel = 'Deposit';
    let desc = 'Wallet Top Up (Paystack)';

    if (t.transaction_type === 'campaign_funding' || t.transaction_type === 'debit') {
      typeLabel = 'Campaign Funding';
      desc = t.campaign_title ? `${t.campaign_title}` : 'Campaign Budget Allocation';
    } else if (t.transaction_type === 'unspent_refund' || t.transaction_type === 'budget_release_refund') {
      typeLabel = 'Unspent Refund';
      desc = t.campaign_title ? `Refund: ${t.campaign_title}` : 'Unspent Budget Refund';
    } else if (t.transaction_type === 'deposit') {
      typeLabel = 'Deposit';
      desc = 'Wallet Top Up (Paystack)';
    }

    const isCredit = typeLabel === 'Deposit' || typeLabel === 'Unspent Refund';
    const txDate = new Date(t.created_at);

    return {
      id: t.id,
      date: txDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: txDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      type: typeLabel,
      description: desc,
      campaignId: t.campaign_id || null,
      campaignCode: t.campaign_code || null,
      campaignTitle: t.campaign_title || null,
      reference: t.reference || `KPG-PAY-${t.id.slice(0, 5).toUpperCase()}`,
      rawCreatedAt: t.created_at,
      amount: isCredit ? Math.abs(t.amount) : -Math.abs(t.amount),
      status: (t.status || 'COMPLETED').toUpperCase(),
    };
  });

  const handleOpenReceipt = (tx: any) => {
    const isDeposit = tx.type === 'Deposit';
    const refNum = tx.reference || `KPG-PAY-${tx.id.slice(0, 5).toUpperCase()}`;

    setSelectedInvoice({
      receipt_number: refNum,
      transaction_type: isDeposit ? 'deposit' : 'campaign_funding',
      issued_at: tx.rawCreatedAt || new Date().toISOString(),
      total_amount: Math.abs(tx.amount),
      payment_method: isDeposit ? 'paystack' : 'wallet',
      status: tx.status,
      advertiser_name: advertiserEmail?.split('@')[0] || 'Brand Partner',
      advertiser_email: advertiserEmail,
      campaign_title: tx.campaignTitle || (isDeposit ? null : tx.description),
      campaign_code: tx.campaignCode || null,
    });
    setSelectedCampaignId(tx.campaignId || null);
  };

  const escrowItems = (rawEscrow || []).map((e) => ({
    id: e.id,
    title: e.title,
    amount: e.escrow_remaining,
    creators: e.creators_assigned,
    status: 'LOCKED',
  }));

  // 100% True DB Metric Values
  const liveWalletBalance = walletBalance || 0;
  const liveEscrowLocked = totalEscrowLocked || 0;
  const liveTotalPayouts = totalPayouts || 0;

  // Pagination calculations
  const totalPages = Math.ceil(transactions.length / itemsPerPage) || 1;
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Paystack V2 Popup Deposit Handler (Matching Campaign Creation Flow)
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    const cleanAmountStr = String(depositAmount || '').replace(/[^0-9.]/g, '');
    const amtNum = parseFloat(cleanAmountStr) || 0;
    if (amtNum < 5000) {
      setMsg({ text: "Hold on now 🛑... Minimum top-up is ₦5,000! Let's get them numbers up.", type: 'error' });
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
        setShowDepositModal(false);
        setMsg({
          text: `Say less! 💰 ₦${amtNum.toLocaleString()} just landed clean in your brand wallet.`,
          type: 'success',
        });
      } else {
        setMsg({ text: verifyRes.error || 'Paystack payment verification failed.', type: 'error' });
      }
    };

    const onPaymentCancel = async () => {
      setIsSubmitting(false);
      await logCancelledPaystackDepositAction(paystackRef, amtNum);
      setMsg({
        text: 'Oops!🤭...that payment didn\'t go through now, did it?',
        type: 'error',
      });
    };

    // Trigger Paystack V2 Popup API
    try {
      if ((window as any).PaystackPop) {
        const paystack = new (window as any).PaystackPop();
        paystack.newTransaction({
          key: paystackPublicKey,
          email: advertiserEmail || 'advertiser@kpugi.com',
          amount: amtNum * 100, // kobo
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

    // Fallback: server initialize if popup unavailable
    const initRes = await initializePaystackDepositAction(amtNum);
    if (initRes.success && initRes.authorization_url) {
      window.location.href = initRes.authorization_url;
    } else {
      setIsSubmitting(false);
      setMsg({ text: initRes.error || 'Failed to launch Paystack checkout.', type: 'error' });
    }
  };

  const handleExportStatementCSV = () => {
    const csvLines = [
      `"===================================================================================================="`,
      `"KPUGI ADVERTISING PLATFORM — BRAND WALLET STATEMENT"`,
      `"===================================================================================================="`,
      `"Generated At:","${new Date().toLocaleString()}"`,
      `"Total Wallet Balance (Available):","NGN ${format2Decimals(liveWalletBalance)}"`,
      `"Active Campaign Escrow Locked:","NGN ${format2Decimals(liveEscrowLocked)}"`,
      `"Total All-Time Creator Payouts Released:","NGN ${format2Decimals(liveTotalPayouts)}"`,
      `""`,
      `"--- TRANSACTION HISTORY LEDGER ---"`,
      `"Date","Type","Description","Amount (NGN)","Status"`,
    ];

    transactions.forEach((tx) => {
      const amtStr = tx.amount > 0 ? `+${tx.amount}` : `${tx.amount}`;
      csvLines.push(`"${tx.date}","${tx.type}","${tx.description}",${amtStr},"${tx.status}"`);
    });

    csvLines.push(`""`);
    csvLines.push(`"===================================================================================================="`);
    csvLines.push(`"End of Official Kpugi Wallet Statement. Confidential & Proprietary."`);

    const csvContent = 'data:text/csv;charset=utf-8,' + csvLines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kpugi_wallet_statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Section Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Overview
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Manage your institutional capital and active campaign escrows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportStatementCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Statement</span>
          </button>
          <button
            type="button"
            onClick={() => setShowDepositModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#4338ca] text-white font-bold text-xs shadow-2xs hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Funds</span>
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 Top Financial Summary Cards Grid (100% Real DB Data) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Wallet Balance */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Wallet Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#4338ca] flex items-center justify-center border border-blue-100/60">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatCompactCurrency(liveWalletBalance)}
            </p>
            <span className="text-[11px] font-medium text-slate-400 mt-1 block">
              Unallocated funds available
            </span>
          </div>
        </div>

        {/* Card 2: Active Escrow */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Active Escrow
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatCompactCurrency(liveEscrowLocked)}
            </p>
            <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#4338ca] animate-pulse" />
              Locked across {escrowItems.length} campaign{escrowItems.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Card 3: Total Payouts */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Payouts
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatCompactCurrency(liveTotalPayouts)}
            </p>
            <span className="text-[11px] font-medium text-slate-400 mt-1 block">
              All-time released to creators
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid: Full-Width Transaction History */}
      <div className="w-full space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Card Header (No 'View All' link) */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
                Transaction History
              </h2>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {transactions.length} Record{transactions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Ledger Filters Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-3">
              {/* Type Select */}
              <div className="flex flex-col gap-1 min-w-[130px] flex-1 sm:flex-initial">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Type</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-hidden text-slate-700"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="campaign_funding">Campaign Funding</option>
                  <option value="unspent_refund">Refunds</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-1 min-w-[120px] flex-1 sm:flex-initial">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Start Date</span>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-hidden text-slate-700"
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-1 min-w-[120px] flex-1 sm:flex-initial">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">End Date</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-hidden text-slate-700"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-end gap-2 self-stretch pt-4 sm:pt-0">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  disabled={isFiltering}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors self-end h-[36px]"
                >
                  {isFiltering ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Filtering...</span>
                    </>
                  ) : (
                    <span>Apply Filters</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={isFiltering}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-600 font-bold text-xs rounded-xl transition-colors h-[36px]"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/70">
                    <th className="py-3 px-5">Date & Time</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No transaction history recorded yet. Make a deposit to fund your brand wallet.
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((tx) => {
                      const isCredit = tx.amount > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-5">
                            <span className="font-mono font-bold text-slate-800 text-xs block">{tx.date}</span>
                            <span className="font-mono text-[10px] text-slate-400 font-medium block">{tx.time}</span>
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-800">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                                tx.type === 'Deposit'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                  : tx.type === 'Unspent Refund'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-600">
                            <div className="flex items-center gap-2 flex-wrap">
                              {tx.campaignId ? (
                                <Link
                                  href={`/b/campaigns/${tx.campaignId}`}
                                  className="text-slate-900 font-bold hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors group"
                                >
                                  <span>{tx.description}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                </Link>
                              ) : (
                                <span>{tx.description}</span>
                              )}
                              {tx.campaignCode && (
                                <span className="font-mono text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                                  {tx.campaignCode}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {tx.type === 'Unspent Refund' ? (
                              <div className="inline-flex items-center gap-1 font-mono font-extrabold text-emerald-600">
                                <span>+₦{format2Decimals(tx.amount)}</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenReceipt(tx)}
                                title="Click to view official receipt 📄"
                                className={`group inline-flex items-center gap-1 font-mono font-extrabold hover:underline transition-all ${
                                  isCredit ? 'text-blue-600 hover:text-blue-700' : 'text-slate-900 hover:text-blue-600'
                                }`}
                              >
                                <span>{isCredit ? '+' : ''}₦{format2Decimals(tx.amount)}</span>
                                <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                              </button>
                            )}
                          </td>
                          <td className="py-4 px-5 text-right">
                            {tx.type === 'Unspent Refund' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                {tx.status}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenReceipt(tx)}
                                title="Click to view official receipt 📄"
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-opacity hover:opacity-80 ${
                                  tx.status === 'COMPLETED'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                    : tx.status === 'CANCELLED'
                                      ? 'bg-slate-100 text-slate-700 border border-slate-200/60'
                                      : tx.status === 'FAILED'
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                }`}
                              >
                                {tx.status}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Card List View */}
            <div className="block sm:hidden divide-y divide-slate-100">
              {paginatedTransactions.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No transaction history recorded yet. Make a deposit to fund your brand wallet.
                </div>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <div key={tx.id} className="p-4 space-y-2">
                      {/* Top Row: Type Pill + Campaign Code + Amount */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              tx.type === 'Deposit'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : tx.type === 'Unspent Refund'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            {tx.type}
                          </span>
                          {tx.campaignCode && (
                            <span className="font-mono text-[9px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold shrink-0">
                              {tx.campaignCode}
                            </span>
                          )}
                        </div>
                        {tx.type === 'Unspent Refund' ? (
                          <div
                            className="font-mono text-sm font-extrabold text-emerald-600 shrink-0"
                          >
                            <span>+₦{format2Decimals(tx.amount)}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenReceipt(tx)}
                            title="Click to view official receipt 📄"
                            className={`font-mono text-sm font-extrabold shrink-0 flex items-center gap-1 hover:underline ${
                              isCredit ? 'text-blue-600' : 'text-slate-900'
                            }`}
                          >
                            <span>{isCredit ? '+' : ''}₦{format2Decimals(tx.amount)}</span>
                            <FileText className="w-3 h-3 text-slate-400" />
                          </button>
                        )}
                      </div>

                      {/* Middle Row: Description */}
                      <div className="text-xs font-semibold text-slate-700 leading-snug">
                        {tx.campaignId ? (
                          <Link
                            href={`/b/campaigns/${tx.campaignId}`}
                            className="text-slate-900 font-bold hover:text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <span>{tx.description}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </Link>
                        ) : (
                          <span>{tx.description}</span>
                        )}
                      </div>

                      {/* Bottom Row: Date & Time + Status Pill */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                        <span>{tx.date} • {tx.time}</span>
                        {tx.type === 'Unspent Refund' ? (
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          >
                            {tx.status}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenReceipt(tx)}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              tx.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : tx.status === 'CANCELLED'
                                  ? 'bg-slate-100 text-slate-700 border border-slate-200/60'
                                  : tx.status === 'FAILED'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            }`}
                          >
                            {tx.status}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {transactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                {Math.min(currentPage * itemsPerPage, transactions.length)} of {transactions.length} transactions
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Settings & Activity Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Low Balance Alerts Card (1/3 width) */}
        <div className="md:col-span-1 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <BellRing className="w-4 h-4 text-indigo-600 animate-bounce" />
            <h3 className="font-display text-sm font-bold text-slate-900">Low Balance Alerts</h3>
          </div>
          <form onSubmit={handleSaveAlertSettings} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Enable Email Alert</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertEnabled}
                  onChange={(e) => setAlertEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Alert Threshold (₦)
              </label>
              <div className="relative rounded-xl border border-slate-200 focus-within:border-indigo-500 transition-colors">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₦</span>
                <input
                  type="text"
                  value={Number(alertThreshold).toLocaleString('en-US')}
                  onChange={(e) => {
                    const cleanVal = e.target.value.replace(/[^0-9.]/g, '');
                    setAlertThreshold(cleanVal);
                  }}
                  disabled={!alertEnabled}
                  className="w-full pl-7 pr-4 py-2.5 bg-transparent text-xs font-mono font-bold text-slate-800 focus:outline-hidden disabled:opacity-40"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSavingAlert}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {isSavingAlert ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>

        {/* Live Payout Activity Stream Card (2/3 width) */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Coins className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="font-display text-sm font-bold text-slate-900">Recent Payout Activity</h3>
          </div>
          <div className="space-y-3">
            {recentPayouts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent payouts released from your campaigns.</p>
            ) : (
              recentPayouts.map((payout) => (
                <div key={payout.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Released <span className="font-mono font-extrabold text-slate-900">₦{payout.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> to <span className="font-bold text-indigo-600">@{payout.creatorName}</span>
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Campaign: {payout.campaignTitle}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 shrink-0">
                    {new Date(payout.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Paystack Checkout Deposit Modal (+ Add Funds) */}
      {showDepositModal && mounted && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 min-h-screen w-screen overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#4338ca] flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-display font-extrabold text-base text-slate-900">Add Funds</h3>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">
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
                  className={`w-full px-4 py-3 rounded-2xl border font-mono font-black text-lg text-slate-900 focus:outline-none transition-colors ${
                    (parseFloat(String(depositAmount || '').replace(/[^0-9.]/g, '')) || 0) < 5000
                      ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30'
                      : 'border-slate-200 focus:ring-2 focus:ring-[#4338ca]/20'
                  }`}
                  required
                />
                {(parseFloat(String(depositAmount || '').replace(/[^0-9.]/g, '')) || 0) < 5000 && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Hold on now... Minimum top-up is ₦5,000! Let's get them numbers up.
                  </p>
                )}
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
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {formatCompactCurrency(Number(amt))}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Payment Gateway
                </span>
                <span className="font-bold text-slate-900 font-mono">Paystack Popup</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Payments trigger an inline Paystack popup modal. Funds are credited ONLY after Paystack confirms successful payment.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
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
        </div>,
        document.body
      )}

      {/* Official Payment Receipt / Invoice Modal Portal */}
      {selectedInvoice && (
        <InvoiceModal
          data={selectedInvoice}
          campaignId={selectedCampaignId}
          onClose={() => {
            setSelectedInvoice(null);
            setSelectedCampaignId(null);
          }}
        />
      )}
    </div>
  );
}
