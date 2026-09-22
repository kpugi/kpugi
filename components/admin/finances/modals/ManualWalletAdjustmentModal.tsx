"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldAlert,
  User,
  Wallet,
} from "lucide-react";
import { manualWalletAdjustmentAction } from "@/app/actions/admin-finances";

export interface WalletAdjustmentTarget {
  id: string;
  profile_id: string;
  wallet_type: string;
  balance: number;
  profile?: {
    full_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    role?: string | null;
  } | null;
}

interface ManualWalletAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletAdjustmentTarget | null;
  onSuccess: (message: string) => void;
}

export default function ManualWalletAdjustmentModal({
  isOpen,
  onClose,
  wallet,
  onSuccess,
}: ManualWalletAdjustmentModalProps) {
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amountStr, setAmountStr] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!wallet) return null;

  const currentBal = Number(wallet.balance) || 0;
  const numAmount = Math.max(0, Number(amountStr) || 0);
  const projectedBalance =
    direction === "credit" ? currentBal + numAmount : currentBal - numAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numAmount <= 0) {
      setError("Please enter a valid positive adjustment amount.");
      return;
    }

    if (direction === "debit" && projectedBalance < 0) {
      setError(
        `Insufficient balance. Cannot debit ₦${numAmount.toLocaleString()} from a current balance of ₦${currentBal.toLocaleString()}.`
      );
      return;
    }

    if (!reason.trim() || reason.trim().length < 10) {
      setError("Please provide a comprehensive reason (minimum 10 characters) for this audit log.");
      return;
    }

    if (!confirmed) {
      setError("You must check the confirmation box acknowledging this live financial intervention.");
      return;
    }

    setLoading(true);
    try {
      const res = await manualWalletAdjustmentAction(
        wallet.id,
        numAmount,
        direction,
        reason.trim()
      );
      if (res.success) {
        onSuccess(res.message);
        onClose();
        // reset
        setAmountStr("");
        setReason("");
        setConfirmed(false);
      } else {
        setError(res.message || "Failed to adjust wallet balance.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during adjustment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Manual Wallet Balance Adjustment
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Administrative balance intervention with strict immutable audit trail
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Wallet Target Info Card */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-xs dark:bg-gray-800">
                <Wallet className="h-4 w-4 text-brand-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {wallet.profile?.full_name || "Unknown User"}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {wallet.profile?.email || wallet.profile_id}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
              {wallet.wallet_type === "advertiser_funding" ? "Advertiser Wallet" : "Creator Wallet"}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-gray-200/80 pt-2.5 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">Current Balance:</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              ₦{currentBal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Direction Selection (Credit vs Debit) */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Adjustment Direction
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection("credit")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                direction === "credit"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20 dark:border-emerald-500/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
              <span>Credit (+) Add Funds</span>
            </button>
            <button
              type="button"
              onClick={() => setDirection("debit")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                direction === "debit"
                  ? "border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20 dark:border-rose-500/50 dark:bg-rose-950/30 dark:text-rose-300"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              <ArrowUpRight className="h-4 w-4 text-rose-600" />
              <span>Debit (-) Deduct Funds</span>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Adjustment Amount (NGN)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-gray-500">
              ₦
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="e.g. 25000"
              required
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-8 pr-4 text-sm font-semibold text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Balance Projection Strip */}
        <div className="flex items-center justify-between rounded-lg bg-gray-100/70 px-3 py-2 text-xs dark:bg-gray-800/60">
          <span className="text-gray-500 dark:text-gray-400">Projected New Balance:</span>
          <span
            className={`font-bold ${
              projectedBalance < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-gray-900 dark:text-white"
            }`}
          >
            ₦{projectedBalance.toLocaleString()}
          </span>
        </div>

        {/* Mandatory Reason */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Audit Justification (Required)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            required
            placeholder="Explain why this manual balance correction is taking place (e.g. Offline bank settlement reconciliation, disputed payout dispute settlement, chargeback correction)..."
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            This reason will be logged in the immutable security audit ledger with your admin ID.
          </p>
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 cursor-pointer dark:border-amber-900/40 dark:bg-amber-950/20">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
          />
          <span className="text-xs leading-relaxed text-amber-900 dark:text-amber-300">
            I confirm that this manual balance change is authorized, accurate, and will directly adjust the user's live platform wallet balance.
          </span>
        </label>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading || !confirmed || numAmount <= 0}
            className={
              direction === "credit"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-rose-600 hover:bg-rose-700 text-white"
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : direction === "credit" ? (
              `Credit ₦${numAmount.toLocaleString()}`
            ) : (
              `Debit ₦${numAmount.toLocaleString()}`
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
