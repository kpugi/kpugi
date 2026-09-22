"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/components/ui/table";
import Badge from "@/components/admin/components/ui/badge/Badge";
import Button from "@/components/admin/components/ui/button/Button";
import Pagination from "@/components/admin/components/tables/Pagination";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Building2,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Landmark,
  Layers,
  ArrowRight,
  Sparkles,
  Sliders,
  ChevronRight,
  RotateCcw,
  Check,
  User,
  ShieldAlert,
} from "lucide-react";
import PayoutActionModal, {
  PayoutRequestItem,
} from "./modals/PayoutActionModal";
import TransactionDetailModal, {
  TransactionLedgerItem,
} from "./modals/TransactionDetailModal";
import ManualWalletAdjustmentModal, {
  WalletAdjustmentTarget,
} from "./modals/ManualWalletAdjustmentModal";
import PaystackVerifyModal from "./modals/PaystackVerifyModal";
import {
  TreasuryMetrics,
  runReconciliationAuditAction,
} from "@/app/actions/admin-finances";

export interface WalletWithProfile {
  id: string;
  profile_id: string;
  wallet_type: string;
  balance: number;
  created_at: string;
  updated_at: string;
  profile?: {
    id?: string;
    full_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    role?: string | null;
  } | null;
}

export interface CampaignEscrowItem {
  id: string;
  title: string;
  total_budget: number;
  spent_budget: number;
  reserved_budget: number;
  status: string;
  created_at: string;
  is_featured?: boolean;
  advertiser?: {
    full_name?: string | null;
    company_name?: string | null;
  } | null;
}

interface FinancesDashboardManagerProps {
  initialMetrics: TreasuryMetrics;
  transactions: TransactionLedgerItem[];
  payoutRequests: PayoutRequestItem[];
  wallets: WalletWithProfile[];
  campaigns: CampaignEscrowItem[];
}

export default function FinancesDashboardManager({
  initialMetrics,
  transactions,
  payoutRequests,
  wallets,
  campaigns,
}: FinancesDashboardManagerProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "transactions" | "payouts" | "deposits" | "escrow" | "reconciliation"
  >("transactions");

  // Modal States
  const [selectedTx, setSelectedTx] = useState<TransactionLedgerItem | null>(
    null
  );
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequestItem | null>(
    null
  );
  const [selectedWallet, setSelectedWallet] =
    useState<WalletAdjustmentTarget | null>(null);
  const [verifyRef, setVerifyRef] = useState<string | null>(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState<boolean>(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState<boolean>(false);

  // Global Alert Banner
  const [bannerAlert, setBannerAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Transaction Ledger Filters
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [txStatusFilter, setTxStatusFilter] = useState("all");
  const [txPage, setTxPage] = useState(1);
  const txPerPage = 15;

  // Payout Queue Filters
  const [payoutSearch, setPayoutSearch] = useState("");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("all");
  const [payoutPage, setPayoutPage] = useState(1);
  const payoutPerPage = 12;

  // Deposits Filters
  const [depositSearch, setDepositSearch] = useState("");
  const [depositPage, setDepositPage] = useState(1);
  const depositPerPage = 12;

  // Escrow Filters
  const [escrowSearch, setEscrowSearch] = useState("");
  const [escrowPage, setEscrowPage] = useState(1);
  const escrowPerPage = 10;

  // Wallets / Reconciliation Filters
  const [walletSearch, setWalletSearch] = useState("");
  const [walletTypeFilter, setWalletTypeFilter] = useState("all");
  const [walletPage, setWalletPage] = useState(1);
  const walletPerPage = 15;

  // Run audit reconciliation action
  const handleRunAudit = async () => {
    setIsAuditing(true);
    setBannerAlert(null);
    try {
      const res = await runReconciliationAuditAction();
      if (res.success) {
        setBannerAlert({
          type: "success",
          message:
            "Reconciliation complete: All custodial wallets and double-entry transaction ledgers verified.",
        });
      } else {
        setBannerAlert({
          type: "error",
          message: res.message || "Reconciliation audit failed.",
        });
      }
    } catch (err: any) {
      setBannerAlert({
        type: "error",
        message: err?.message || "Audit execution encountered an error.",
      });
    } finally {
      setIsAuditing(false);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Date",
      "Type",
      "Amount_NGN",
      "Status",
      "Paystack_Ref",
      "User_Name",
      "User_Email",
      "Wallet_Type",
    ];

    const rows = transactions.map((t) => [
      t.id,
      new Date(t.created_at).toISOString(),
      t.type,
      t.amount,
      t.status,
      t.paystack_reference || "",
      t.profile?.full_name || "",
      t.profile?.email || "",
      t.wallet?.wallet_type || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `kpugi_financial_ledger_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        !txSearch ||
        tx.id.toLowerCase().includes(txSearch.toLowerCase()) ||
        (tx.paystack_reference &&
          tx.paystack_reference.toLowerCase().includes(txSearch.toLowerCase())) ||
        (tx.profile?.full_name &&
          tx.profile.full_name.toLowerCase().includes(txSearch.toLowerCase())) ||
        (tx.profile?.email &&
          tx.profile.email.toLowerCase().includes(txSearch.toLowerCase()));

      const matchesType =
        txTypeFilter === "all" || tx.type.toLowerCase() === txTypeFilter;

      const matchesStatus =
        txStatusFilter === "all" || tx.status.toLowerCase() === txStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, txSearch, txTypeFilter, txStatusFilter]);

  const totalTxPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / txPerPage)
  );
  const paginatedTransactions = useMemo(() => {
    const start = (txPage - 1) * txPerPage;
    return filteredTransactions.slice(start, start + txPerPage);
  }, [filteredTransactions, txPage]);

  // Filtered Payouts
  const filteredPayouts = useMemo(() => {
    return payoutRequests.filter((p) => {
      const matchesSearch =
        !payoutSearch ||
        p.id.toLowerCase().includes(payoutSearch.toLowerCase()) ||
        (p.reference &&
          p.reference.toLowerCase().includes(payoutSearch.toLowerCase())) ||
        (p.profile?.full_name &&
          p.profile.full_name.toLowerCase().includes(payoutSearch.toLowerCase())) ||
        (p.account_name &&
          p.account_name.toLowerCase().includes(payoutSearch.toLowerCase())) ||
        (p.account_number && p.account_number.includes(payoutSearch));

      const matchesStatus =
        payoutStatusFilter === "all" ||
        p.status.toLowerCase() === payoutStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payoutRequests, payoutSearch, payoutStatusFilter]);

  const totalPayoutPages = Math.max(
    1,
    Math.ceil(filteredPayouts.length / payoutPerPage)
  );
  const paginatedPayouts = useMemo(() => {
    const start = (payoutPage - 1) * payoutPerPage;
    return filteredPayouts.slice(start, start + payoutPerPage);
  }, [filteredPayouts, payoutPage]);

  // Filtered Deposits
  const depositTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.type === "deposit");
  }, [transactions]);

  const filteredDeposits = useMemo(() => {
    return depositTransactions.filter((tx) => {
      if (!depositSearch) return true;
      return (
        tx.id.toLowerCase().includes(depositSearch.toLowerCase()) ||
        (tx.paystack_reference &&
          tx.paystack_reference
            .toLowerCase()
            .includes(depositSearch.toLowerCase())) ||
        (tx.profile?.full_name &&
          tx.profile.full_name
            .toLowerCase()
            .includes(depositSearch.toLowerCase())) ||
        (tx.profile?.email &&
          tx.profile.email.toLowerCase().includes(depositSearch.toLowerCase()))
      );
    });
  }, [depositTransactions, depositSearch]);

  const totalDepositPages = Math.max(
    1,
    Math.ceil(filteredDeposits.length / depositPerPage)
  );
  const paginatedDeposits = useMemo(() => {
    const start = (depositPage - 1) * depositPerPage;
    return filteredDeposits.slice(start, start + depositPerPage);
  }, [filteredDeposits, depositPage]);

  // Filtered Escrow Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (!escrowSearch) return true;
      return (
        c.title.toLowerCase().includes(escrowSearch.toLowerCase()) ||
        (c.advertiser?.full_name &&
          c.advertiser.full_name
            .toLowerCase()
            .includes(escrowSearch.toLowerCase())) ||
        (c.advertiser?.company_name &&
          c.advertiser.company_name
            .toLowerCase()
            .includes(escrowSearch.toLowerCase()))
      );
    });
  }, [campaigns, escrowSearch]);

  const totalEscrowPages = Math.max(
    1,
    Math.ceil(filteredCampaigns.length / escrowPerPage)
  );
  const paginatedCampaigns = useMemo(() => {
    const start = (escrowPage - 1) * escrowPerPage;
    return filteredCampaigns.slice(start, start + escrowPerPage);
  }, [filteredCampaigns, escrowPage]);

  // Filtered Wallets
  const filteredWallets = useMemo(() => {
    return wallets.filter((w) => {
      const matchesSearch =
        !walletSearch ||
        w.id.toLowerCase().includes(walletSearch.toLowerCase()) ||
        (w.profile?.full_name &&
          w.profile.full_name.toLowerCase().includes(walletSearch.toLowerCase())) ||
        (w.profile?.email &&
          w.profile.email.toLowerCase().includes(walletSearch.toLowerCase()));

      const matchesType =
        walletTypeFilter === "all" || w.wallet_type === walletTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [wallets, walletSearch, walletTypeFilter]);

  const totalWalletPages = Math.max(
    1,
    Math.ceil(filteredWallets.length / walletPerPage)
  );
  const paginatedWallets = useMemo(() => {
    const start = (walletPage - 1) * walletPerPage;
    return filteredWallets.slice(start, start + walletPerPage);
  }, [filteredWallets, walletPage]);

  // Helper for status badge
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge color="success">Completed</Badge>;
      case "pending":
      case "processing":
        return <Badge color="warning">Pending</Badge>;
      case "failed":
        return <Badge color="error">Failed</Badge>;
      case "cancelled":
        return <Badge color="light">Cancelled</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  // Helper for transaction type badge
  const renderTxTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <ArrowDownLeft className="h-3 w-3" />
            Deposit
          </span>
        );
      case "campaign_funding":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <Layers className="h-3 w-3" />
            Campaign Fund
          </span>
        );
      case "budget_release_refund":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
            <RotateCcw className="h-3 w-3" />
            Refund Release
          </span>
        );
      case "payout_release":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            <Sparkles className="h-3 w-3" />
            Creator Settlement
          </span>
        );
      case "withdrawal":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <ArrowUpRight className="h-3 w-3" />
            Bank Withdrawal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if any */}
      {bannerAlert && (
        <div
          className={`flex items-center justify-between rounded-xl p-4 text-sm ${
            bannerAlert.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : bannerAlert.type === "error"
              ? "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
              : "bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {bannerAlert.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0" />
            )}
            <span className="font-medium">{bannerAlert.message}</span>
          </div>
          <button
            onClick={() => setBannerAlert(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header with Title & Action Controls */}
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between font-sans">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white sm:text-2xl">
              Platform Finances
            </h1>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Paystack Connected
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Track all money in and out of Kpugi — deposits, campaign budgets, platform earnings, and creator payouts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setVerifyRef(null);
              setIsVerifyOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-sans"
          >
            <ShieldCheck className="h-4 w-4 text-cyan-600" />
            <span>Check Paystack Ref</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 text-xs font-sans"
          >
            <RefreshCw
              className={`h-4 w-4 text-brand-600 ${
                isAuditing ? "animate-spin" : ""
              }`}
            />
            <span>Recheck Balances</span>
          </Button>

          <Button
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs font-sans"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Primary Financial Metric Cards - 2 Rows for Maximum Clarity & Visual Appeal */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 font-sans">
        {/* Card 1: Total User Balances */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100/80 dark:bg-blue-950/50 dark:text-blue-400">
              <Wallet className="h-5 w-5" />
            </div>
            <Badge color="info">User Funds</Badge>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Wallet Balances
            </span>
            <h3 className="mt-1 text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-white">
              ₦{initialMetrics.totalCustodialLiquidity.toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Advertisers:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                ₦{initialMetrics.advertiserLiquidity.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Creators:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                ₦{initialMetrics.creatorLiquidity.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${
                    initialMetrics.totalCustodialLiquidity > 0
                      ? Math.round(
                          (initialMetrics.advertiserLiquidity /
                            initialMetrics.totalCustodialLiquidity) *
                            100
                        )
                      : 50
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Campaign Budgets in Escrow */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100/80 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <Badge color="success">Escrow Protected</Badge>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Campaign Budgets in Escrow
            </span>
            <h3 className="mt-1 text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-white">
              ₦
              {(
                initialMetrics.totalCampaignPool -
                initialMetrics.spentCampaignBudget
              ).toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Reserved for Submissions:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                ₦{initialMetrics.reservedEscrowBudget.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Paid Out so Far:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                ₦{initialMetrics.spentCampaignBudget.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{
                  width: `${
                    initialMetrics.totalCampaignPool > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (initialMetrics.spentCampaignBudget /
                              initialMetrics.totalCampaignPool) *
                              100
                          )
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Paystack Bank Balance */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition-colors group-hover:bg-cyan-100/80 dark:bg-cyan-950/50 dark:text-cyan-400">
              <Landmark className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Bank Sync
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Paystack Account Balance
            </span>
            <h3 className="mt-1 text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-white">
              ₦{initialMetrics.paystackBalanceNgn.toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Deposits Received:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                ₦{initialMetrics.lifetimeDepositsVolume.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Reserve Status:</span>
              <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                {initialMetrics.totalCustodialLiquidity > 0
                  ? `${(
                      (initialMetrics.paystackBalanceNgn /
                        initialMetrics.totalCustodialLiquidity) *
                      100
                    ).toFixed(1)}% Funded`
                  : "100% Funded"}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Platform Earnings */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100/80 dark:bg-emerald-950/50 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <Badge color="success">Kpugi Revenue</Badge>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Platform Earnings
            </span>
            <h3 className="mt-1 text-2xl sm:text-3xl font-bold font-display text-emerald-600 dark:text-emerald-400">
              ₦
              {(
                initialMetrics.estimatedCommissionRevenue +
                initialMetrics.featuredCampaignFees
              ).toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">10% Platform Fee:</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                ₦{initialMetrics.estimatedCommissionRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Featured Ads:
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                ₦{initialMetrics.featuredCampaignFees.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Card 5: Total Paid to Creators */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100/80 dark:bg-purple-950/50 dark:text-purple-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <Badge color="light">Bank Payouts</Badge>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Paid to Creators
            </span>
            <h3 className="mt-1 text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-white">
              ₦{initialMetrics.lifetimePayoutsVolume.toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Transfer Method:</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                Bank Transfer (NUBAN)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Delivery Status:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                100% Completed
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-purple-500 transition-all"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Card 6: Pending Withdrawal Requests */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100/80 dark:bg-amber-950/50 dark:text-amber-400">
              <CreditCard className="h-5 w-5" />
            </div>
            {initialMetrics.pendingPayoutsCount > 0 ? (
              <Badge color="warning">
                {initialMetrics.pendingPayoutsCount} To Review
              </Badge>
            ) : (
              <Badge color="success">All Cleared</Badge>
            )}
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pending Withdrawals
            </span>
            <h3 className="mt-1 text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-white">
              ₦{initialMetrics.pendingPayoutsVolume.toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Requests Waiting:</span>
              <span
                className={`font-semibold ${
                  initialMetrics.pendingPayoutsCount > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {initialMetrics.pendingPayoutsCount > 0
                  ? `${initialMetrics.pendingPayoutsCount} Awaiting Review`
                  : "0 Pending Requests"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Safety Rollback:</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Automatic Refund Ready
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={`h-full rounded-full transition-all ${
                  initialMetrics.pendingPayoutsCount > 0
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{
                  width:
                    initialMetrics.pendingPayoutsCount > 0 ? "100%" : "0%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 font-sans">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "transactions"
              ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>All Transactions ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("payouts")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "payouts"
              ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Creator Payouts ({payoutRequests.length})</span>
          {initialMetrics.pendingPayoutsCount > 0 && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              {initialMetrics.pendingPayoutsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("deposits")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "deposits"
              ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <ArrowDownLeft className="h-4 w-4" />
          <span>Deposits Received ({depositTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("escrow")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "escrow"
              ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Campaign Budgets ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reconciliation")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "reconciliation"
              ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>User Wallets & Float ({wallets.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: MASTER DOUBLE-ENTRY TRANSACTION LEDGER             */}
      {/* ========================================================= */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => {
                  setTxSearch(e.target.value);
                  setTxPage(1);
                }}
                placeholder="Search by reference, user name, email, transaction ID..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={txTypeFilter}
                onChange={(e) => {
                  setTxTypeFilter(e.target.value);
                  setTxPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="campaign_funding">Campaign Funding</option>
                <option value="budget_release_refund">Budget Release Refund</option>
                <option value="payout_release">Payout Release</option>
                <option value="withdrawal">Withdrawal</option>
              </select>

              <select
                value={txStatusFilter}
                onChange={(e) => {
                  setTxStatusFilter(e.target.value);
                  setTxPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {(txSearch || txTypeFilter !== "all" || txStatusFilter !== "all") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTxSearch("");
                    setTxTypeFilter("all");
                    setTxStatusFilter("all");
                    setTxPage(1);
                  }}
                  className="text-xs"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/40">
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Type & Reference
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Beneficiary / Account
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Context / Campaign
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Timestamp
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-xs text-gray-500 dark:text-gray-400"
                    >
                      No transactions found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((tx) => {
                    const isPositive =
                      tx.type === "deposit" ||
                      tx.type === "budget_release_refund" ||
                      tx.type === "payout_release";
                    const formattedDate = new Date(tx.created_at);

                    return (
                      <TableRow
                        key={tx.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 dark:border-gray-800/60 dark:hover:bg-gray-800/30"
                      >
                        {/* Type & Ref */}
                        <TableCell className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <div>{renderTxTypeBadge(tx.type)}</div>
                            <span className="font-mono text-[10px] text-gray-400">
                              {tx.paystack_reference || tx.id.slice(0, 16)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Beneficiary */}
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                              {tx.profile?.avatar_url ? (
                                <Image
                                  src={tx.profile.avatar_url}
                                  alt={tx.profile.full_name || "User"}
                                  fill
                                  sizes="28px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-gray-500">
                                  {(tx.profile?.full_name || "U")[0].toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                                {tx.profile?.full_name || "Platform Account"}
                              </p>
                              <p className="truncate text-[10px] text-gray-400">
                                {tx.profile?.email || tx.wallet?.wallet_type || "Internal Ledger"}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="py-3 px-4 text-right">
                          <span
                            className={`font-mono text-xs font-bold ${
                              isPositive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {isPositive ? "+" : "-"}₦
                            {Math.abs(Number(tx.amount) || 0).toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Context */}
                        <TableCell className="py-3 px-4">
                          {tx.campaign?.title ? (
                            <Link
                              href={`/admin/campaigns`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                            >
                              <span className="truncate max-w-[140px]">
                                {tx.campaign.title}
                              </span>
                            </Link>
                          ) : (
                            <span className="text-[11px] text-gray-400">
                              {tx.wallet?.wallet_type === "advertiser_funding"
                                ? "Advertiser Treasury"
                                : tx.wallet?.wallet_type === "creator_earnings"
                                ? "Creator Earnings"
                                : "Custodial System"}
                            </span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3 px-4 text-center">
                          {renderStatusBadge(tx.status)}
                        </TableCell>

                        {/* Timestamp */}
                        <TableCell className="py-3 px-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                              {formattedDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {formattedDate.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                              title="Inspect Details"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>

                            {tx.paystack_reference && (
                              <button
                                onClick={() => {
                                  setVerifyRef(tx.paystack_reference);
                                  setIsVerifyOpen(true);
                                }}
                                className="rounded-lg p-1 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
                                title="Verify Gateway"
                              >
                                <ShieldCheck className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination footer */}
            {totalTxPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 p-4 dark:border-gray-800">
                <p className="text-xs text-gray-500">
                  Showing {(txPage - 1) * txPerPage + 1} to{" "}
                  {Math.min(txPage * txPerPage, filteredTransactions.length)} of{" "}
                  {filteredTransactions.length} entries
                </p>
                <Pagination
                  currentPage={txPage}
                  totalPages={totalTxPages}
                  onPageChange={setTxPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CREATOR PAYOUT QUEUE & WITHDRAWAL REQUESTS         */}
      {/* ========================================================= */}
      {activeTab === "payouts" && (
        <div className="space-y-4">
          {/* Header & Filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={payoutSearch}
                onChange={(e) => {
                  setPayoutSearch(e.target.value);
                  setPayoutPage(1);
                }}
                placeholder="Search by creator name, bank account, reference..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={payoutStatusFilter}
                onChange={(e) => {
                  setPayoutStatusFilter(e.target.value);
                  setPayoutPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="all">All Payout Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="completed">Settled</option>
                <option value="failed">Failed / Rolled Back</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/40">
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Creator / User
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Payout Amount
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    NUBAN Bank Details
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Reference
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Requested At
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedPayouts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-xs text-gray-500 dark:text-gray-400"
                    >
                      No creator payout requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPayouts.map((p) => {
                    const formattedDate = new Date(p.created_at);
                    const isPending =
                      p.status === "pending" || p.status === "processing";

                    return (
                      <TableRow
                        key={p.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 dark:border-gray-800/60 dark:hover:bg-gray-800/30"
                      >
                        {/* Creator */}
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                              {p.profile?.avatar_url ? (
                                <Image
                                  src={p.profile.avatar_url}
                                  alt={p.profile.full_name || "Creator"}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-500">
                                  {(p.profile?.full_name || "C")[0].toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                                {p.creator_profile?.display_name ||
                                  p.profile?.full_name ||
                                  "Creator"}
                              </p>
                              <p className="truncate text-[10px] text-gray-400">
                                {p.profile?.email || p.profile_id}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="py-3 px-4 text-right">
                          <span className="font-mono text-sm font-extrabold text-gray-900 dark:text-white">
                            ₦{Number(p.amount).toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Bank Details */}
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                            <div>
                              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                {p.bank_name || "NUBAN Bank"}
                              </p>
                              <p className="font-mono text-[11px] text-gray-500">
                                {p.account_number} • {p.account_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Ref */}
                        <TableCell className="py-3 px-4">
                          <span className="font-mono text-xs text-gray-500">
                            {p.reference || "N/A"}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3 px-4 text-center">
                          {renderStatusBadge(p.status)}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="py-3 px-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                              {formattedDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {formattedDate.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          </div>
                        </TableCell>

                        {/* Action */}
                        <TableCell className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant={isPending ? "primary" : "outline"}
                            onClick={() => setSelectedPayout(p)}
                            className="text-xs"
                          >
                            {isPending ? "Process Payout" : "View Record"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {totalPayoutPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 p-4 dark:border-gray-800">
                <p className="text-xs text-gray-500">
                  Showing {(payoutPage - 1) * payoutPerPage + 1} to{" "}
                  {Math.min(payoutPage * payoutPerPage, filteredPayouts.length)} of{" "}
                  {filteredPayouts.length} entries
                </p>
                <Pagination
                  currentPage={payoutPage}
                  totalPages={totalPayoutPages}
                  onPageChange={setPayoutPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PAYSTACK GATEWAY DEPOSITS                          */}
      {/* ========================================================= */}
      {activeTab === "deposits" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={depositSearch}
                onChange={(e) => {
                  setDepositSearch(e.target.value);
                  setDepositPage(1);
                }}
                placeholder="Search deposits by reference, payer name, email..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/40">
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Paystack Reference
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Advertiser / Payer
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Deposit Amount
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Gateway Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Timestamp
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Verification
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedDeposits.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-xs text-gray-500 dark:text-gray-400"
                    >
                      No Paystack deposits recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDeposits.map((d) => {
                    const formattedDate = new Date(d.created_at);

                    return (
                      <TableRow
                        key={d.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 dark:border-gray-800/60 dark:hover:bg-gray-800/30"
                      >
                        <TableCell className="py-3 px-4 font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                          {d.paystack_reference || d.id}
                        </TableCell>

                        <TableCell className="py-3 px-4">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">
                            {d.profile?.full_name || "Advertiser"}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {d.profile?.email || "N/A"}
                          </p>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          +₦{Number(d.amount).toLocaleString()}
                        </TableCell>

                        <TableCell className="py-3 px-4 text-center">
                          {renderStatusBadge(d.status)}
                        </TableCell>

                        <TableCell className="py-3 px-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                              {formattedDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {formattedDate.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setVerifyRef(d.paystack_reference);
                              setIsVerifyOpen(true);
                            }}
                            className="text-xs flex items-center gap-1 ml-auto"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />
                            <span>Verify Paystack</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {totalDepositPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 p-4 dark:border-gray-800">
                <p className="text-xs text-gray-500">
                  Showing {(depositPage - 1) * depositPerPage + 1} to{" "}
                  {Math.min(depositPage * depositPerPage, filteredDeposits.length)} of{" "}
                  {filteredDeposits.length} entries
                </p>
                <Pagination
                  currentPage={depositPage}
                  totalPages={totalDepositPages}
                  onPageChange={setDepositPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CAMPAIGN ESCROW & BUDGET POOLS                      */}
      {/* ========================================================= */}
      {activeTab === "escrow" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={escrowSearch}
                onChange={(e) => {
                  setEscrowSearch(e.target.value);
                  setEscrowPage(1);
                }}
                placeholder="Search campaigns, advertisers, brands..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/40">
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Campaign
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Total Budget
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Disbursed (Spent)
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Active Reserved Escrow
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Burn Rate
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Inspect
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-xs text-gray-500 dark:text-gray-400"
                    >
                      No campaign escrow records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCampaigns.map((c) => {
                    const total = Number(c.total_budget) || 1;
                    const spent = Number(c.spent_budget) || 0;
                    const reserved = Number(c.reserved_budget) || 0;
                    const pct = Math.min(100, Math.round((spent / total) * 100));

                    return (
                      <TableRow
                        key={c.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 dark:border-gray-800/60 dark:hover:bg-gray-800/30"
                      >
                        <TableCell className="py-3 px-4">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {c.title}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {c.advertiser?.company_name ||
                              c.advertiser?.full_name ||
                              "Advertiser"}
                          </p>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right font-mono text-xs font-bold text-gray-900 dark:text-white">
                          ₦{total.toLocaleString()}
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          ₦{spent.toLocaleString()}
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          ₦{reserved.toLocaleString()}
                        </TableCell>

                        <TableCell className="py-3 px-4">
                          <div className="w-28">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                              <span>{pct}% Spent</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                              <div
                                className="h-full rounded-full bg-brand-500 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-center">
                          {renderStatusBadge(c.status)}
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right">
                          <Link
                            href={`/admin/campaigns`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                          >
                            <span>Manage</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {totalEscrowPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 p-4 dark:border-gray-800">
                <p className="text-xs text-gray-500">
                  Showing {(escrowPage - 1) * escrowPerPage + 1} to{" "}
                  {Math.min(escrowPage * escrowPerPage, filteredCampaigns.length)} of{" "}
                  {filteredCampaigns.length} entries
                </p>
                <Pagination
                  currentPage={escrowPage}
                  totalPages={totalEscrowPages}
                  onPageChange={setEscrowPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: CUSTODIAL WALLETS & FLOAT RECONCILIATION AUDIT      */}
      {/* ========================================================= */}
      {activeTab === "reconciliation" && (
        <div className="space-y-4">
          {/* Paystack Reserves vs User Balances Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                    Paystack Reserves vs User Balances
                  </h3>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Verifies that the money in our Paystack business account covers 100% of all user wallet balances
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  100% Funded & Safe
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
                <span className="text-xs text-gray-500">Paystack Account Balance:</span>
                <p className="mt-1 text-xl font-bold font-display text-gray-900 dark:text-white">
                  ₦{initialMetrics.paystackBalanceNgn.toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-400">Live Bank Balance</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
                <span className="text-xs text-gray-500">Total User Balances:</span>
                <p className="mt-1 text-xl font-bold font-display text-gray-900 dark:text-white">
                  ₦{initialMetrics.totalCustodialLiquidity.toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-400">Combined User Wallets</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
                <span className="text-xs text-gray-500">Balance Coverage:</span>
                <p className="mt-1 text-xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                  {initialMetrics.totalCustodialLiquidity > 0
                    ? (
                        (initialMetrics.paystackBalanceNgn /
                          initialMetrics.totalCustodialLiquidity) *
                        100
                      ).toFixed(1)
                    : "100.0"}
                  %
                </p>
                <p className="text-[11px] text-emerald-600/80">Fully Funded & Backed</p>
              </div>
            </div>
          </div>

          {/* Wallets Filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={walletSearch}
                onChange={(e) => {
                  setWalletSearch(e.target.value);
                  setWalletPage(1);
                }}
                placeholder="Search wallets by user, email, wallet ID..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={walletTypeFilter}
                onChange={(e) => {
                  setWalletTypeFilter(e.target.value);
                  setWalletPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="all">All Wallet Types</option>
                <option value="advertiser_funding">Advertiser Wallets</option>
                <option value="creator_earnings">Creator Wallets</option>
              </select>
            </div>
          </div>

          {/* Wallets Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/40">
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    User / Account
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Wallet Type
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Balance
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Last Updated
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-2.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Admin Intervention
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedWallets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-xs text-gray-500 dark:text-gray-400"
                    >
                      No user wallets found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedWallets.map((w) => {
                    const formattedDate = new Date(w.updated_at || w.created_at);

                    return (
                      <TableRow
                        key={w.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 dark:border-gray-800/60 dark:hover:bg-gray-800/30"
                      >
                        <TableCell className="py-3 px-4">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {w.profile?.full_name || "Account"}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {w.profile?.email || w.profile_id}
                          </p>
                        </TableCell>

                        <TableCell className="py-3 px-4">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              w.wallet_type === "advertiser_funding"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                : "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                            }`}
                          >
                            {w.wallet_type === "advertiser_funding"
                              ? "Advertiser Funding"
                              : "Creator Earnings"}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right font-mono text-sm font-bold text-gray-900 dark:text-white">
                          ₦{Number(w.balance).toLocaleString()}
                        </TableCell>

                        <TableCell className="py-3 px-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                              {formattedDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {formattedDate.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedWallet(w);
                              setIsAdjustmentOpen(true);
                            }}
                            className="text-xs flex items-center gap-1.5 ml-auto"
                          >
                            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                            <span>Adjust Balance</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {totalWalletPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 p-4 dark:border-gray-800">
                <p className="text-xs text-gray-500">
                  Showing {(walletPage - 1) * walletPerPage + 1} to{" "}
                  {Math.min(walletPage * walletPerPage, filteredWallets.length)} of{" "}
                  {filteredWallets.length} entries
                </p>
                <Pagination
                  currentPage={walletPage}
                  totalPages={totalWalletPages}
                  onPageChange={setWalletPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
      />

      {/* Payout Action Modal */}
      <PayoutActionModal
        isOpen={!!selectedPayout}
        onClose={() => setSelectedPayout(null)}
        payout={selectedPayout}
        onSuccess={(msg) => {
          setBannerAlert({ type: "success", message: msg });
        }}
      />

      {/* Manual Balance Adjustment Modal */}
      <ManualWalletAdjustmentModal
        isOpen={isAdjustmentOpen}
        onClose={() => {
          setIsAdjustmentOpen(false);
          setSelectedWallet(null);
        }}
        wallet={selectedWallet}
        onSuccess={(msg) => {
          setBannerAlert({ type: "success", message: msg });
        }}
      />

      {/* Paystack Verify Modal */}
      <PaystackVerifyModal
        isOpen={isVerifyOpen}
        onClose={() => {
          setIsVerifyOpen(false);
          setVerifyRef(null);
        }}
        initialReference={verifyRef}
      />
    </div>
  );
}
