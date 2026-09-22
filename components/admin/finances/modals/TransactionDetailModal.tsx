"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import Link from "next/link";
import {
  FileText,
  Copy,
  Check,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Code,
} from "lucide-react";

export interface TransactionLedgerItem {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  status: string;
  paystack_reference: string | null;
  created_at: string;
  campaign_id?: string | null;
  submission_id?: string | null;
  gross_amount?: number | null;
  fee_amount?: number | null;
  net_amount?: number | null;
  views_audited?: number | null;
  wallet?: {
    wallet_type: string;
    profile_id: string;
  } | null;
  profile?: {
    id: string;
    full_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
  campaign?: {
    id: string;
    title: string;
  } | null;
  submission?: {
    id: string;
    post_url: string | null;
  } | null;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionLedgerItem | null;
}

export default function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailModalProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!transaction) return null;

  const isDeposit = transaction.type === "deposit";
  const isWithdrawal = transaction.type === "withdrawal";
  const isPositive = Number(transaction.amount) > 0;

  const handleCopyRef = () => {
    if (transaction.paystack_reference) {
      navigator.clipboard.writeText(transaction.paystack_reference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[580px] p-6">
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                isPositive
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
              }`}
            >
              {isPositive ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Transaction Details
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Tx #{transaction.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
              transaction.status === "completed"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60"
                : transaction.status === "pending"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200"
            }`}
          >
            {transaction.status}
          </span>
        </div>

        {/* Amount Hero */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/2 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
              Transaction Volume
            </span>
            <span
              className={`text-2xl font-bold font-mono ${
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {isPositive ? "+" : ""}₦{Math.abs(Number(transaction.amount)).toLocaleString()}
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 uppercase">
            {transaction.type.replace(/_/g, " ")}
          </span>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/1">
            <span className="text-[10px] text-gray-400 block uppercase">Timestamp</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">
              {new Date(transaction.created_at).toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/1">
            <span className="text-[10px] text-gray-400 block uppercase">Wallet Type</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block capitalize">
              {transaction.wallet?.wallet_type?.replace(/_/g, " ") || "Internal Wallet"}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/1 col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 block uppercase">Paystack Reference</span>
              {transaction.paystack_reference && (
                <button
                  onClick={handleCopyRef}
                  className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedRef ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRef ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>
            <span className="font-bold text-gray-900 dark:text-white mt-0.5 block break-all">
              {transaction.paystack_reference || "Direct Internal Balance Mutation"}
            </span>
          </div>

          {transaction.profile && (
            <div className="p-3 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/1">
              <span className="text-[10px] text-gray-400 block uppercase">Target User</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block truncate">
                {transaction.profile.full_name || transaction.profile.email}
              </span>
            </div>
          )}

          {transaction.campaign && (
            <div className="p-3 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/1">
              <span className="text-[10px] text-gray-400 block uppercase">Associated Campaign</span>
              <Link
                href={`/admin/campaigns/${transaction.campaign.id}`}
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-0.5 block truncate"
              >
                {transaction.campaign.title}
              </Link>
            </div>
          )}

          {transaction.submission && (
            <div className="p-3 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/1 col-span-2">
              <span className="text-[10px] text-gray-400 block uppercase">Linked Submission</span>
              <Link
                href={`/admin/submissions/${transaction.submission.id}`}
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-0.5 block"
              >
                Submission #{transaction.submission.id.slice(0, 8)}
              </Link>
            </div>
          )}
        </div>

        {/* JSON toggle */}
        {showJson && (
          <div className="rounded-xl border border-gray-200 bg-gray-950 p-4 dark:border-white/10 overflow-hidden">
            <pre className="text-xs font-mono text-emerald-400/90 overflow-x-auto max-h-[220px] leading-relaxed select-all">
              {JSON.stringify(transaction, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showJson ? "Hide JSON Record" : "View Raw JSON"}</span>
          </button>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
