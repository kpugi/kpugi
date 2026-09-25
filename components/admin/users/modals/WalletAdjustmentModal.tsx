"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import { Wallet, PlusCircle, MinusCircle, AlertCircle } from "lucide-react";
import { adjustUserWalletBalanceAction } from "@/app/actions/admin-users";

interface WalletAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    advertiserBalance?: number;
    creatorBalance?: number;
  } | null;
  onSuccess?: (newBalance: number, walletType: "advertiser_funding" | "creator_earnings") => void;
}

export default function WalletAdjustmentModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: WalletAdjustmentModalProps) {
  const [walletType, setWalletType] = useState<"advertiser_funding" | "creator_earnings">(
    user?.role === "advertiser" ? "advertiser_funding" : "creator_earnings"
  );
  const [adjustmentType, setAdjustmentType] = useState<"credit" | "debit">("credit");
  const [amountStr, setAmountStr] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) return null;

  const currentBalance =
    walletType === "advertiser_funding"
      ? user.advertiserBalance || 0
      : user.creatorBalance || 0;

  const amountNum = parseFloat(amountStr) || 0;
  const projectedBalance =
    adjustmentType === "credit"
      ? currentBalance + amountNum
      : currentBalance - amountNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountNum || amountNum <= 0) {
      setErrorMsg("Please enter a valid amount greater than ₦0.");
      return;
    }

    if (adjustmentType === "debit" && projectedBalance < 0) {
      setErrorMsg(`Debit exceeds available balance (₦${currentBalance.toLocaleString()}).`);
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMsg("A detailed audit reason is mandatory (minimum 5 characters).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await adjustUserWalletBalanceAction(
        user.id,
        walletType,
        amountNum,
        adjustmentType,
        reason.trim()
      );
      if (res.success) {
        onSuccess?.(res.newBalance, walletType);
        onClose();
        setAmountStr("");
        setReason("");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to adjust wallet balance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[560px] p-6 sm:p-8"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Adjust User Wallet Balance
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Apply manual credit or debit adjustment for {user.fullName} ({user.email}). Every adjustment creates an immutable transaction record.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Wallet Type Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Select Target Wallet
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWalletType("creator_earnings")}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-start ${
                walletType === "creator_earnings"
                  ? "bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
              }`}
            >
              <span>Creator Earnings</span>
              <span className="font-mono text-[11px] opacity-75 mt-0.5">
                Current: ₦{(user.creatorBalance || 0).toLocaleString()}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setWalletType("advertiser_funding")}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-start ${
                walletType === "advertiser_funding"
                  ? "bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
              }`}
            >
              <span>Advertiser Funding</span>
              <span className="font-mono text-[11px] opacity-75 mt-0.5">
                Current: ₦{(user.advertiserBalance || 0).toLocaleString()}
              </span>
            </button>
          </div>
        </div>

        {/* Operation Direction */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Adjustment Direction
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAdjustmentType("credit")}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                adjustmentType === "credit"
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Credit (+ Add Funds)</span>
            </button>

            <button
              type="button"
              onClick={() => setAdjustmentType("debit")}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                adjustmentType === "debit"
                  ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <MinusCircle className="w-3.5 h-3.5" />
              <span>Debit (- Deduct Funds)</span>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label
            htmlFor="adjustmentAmount"
            className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Amount (NGN ₦) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">
              ₦
            </span>
            <input
              id="adjustmentAmount"
              type="number"
              min="1"
              step="any"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="e.g., 50000"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent ps-8 pe-3 py-2 text-xs font-mono text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {amountNum > 0 && (
            <div className="mt-2 text-xs flex items-center justify-between text-gray-500 dark:text-gray-400 font-mono px-1">
              <span>Projected New Balance:</span>
              <span
                className={`font-bold ${
                  projectedBalance < 0
                    ? "text-rose-500"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                ₦{projectedBalance.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Audit Justification */}
        <div>
          <label
            htmlFor="adjustmentReason"
            className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Audit Reason & Reference <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="adjustmentReason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Bank transfer reconciliation receipt #TRX-94821 or campaign credit compensation"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-xs text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Executing Adjustment..." : "Execute Adjustment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
