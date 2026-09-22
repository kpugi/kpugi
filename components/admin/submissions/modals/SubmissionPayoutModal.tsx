"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import { Coins, AlertCircle } from "lucide-react";
import { adjustSubmissionPayoutAction } from "@/app/actions/admin-submissions";

interface SubmissionPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: {
    id: string;
    reservedAmount: number;
    payoutAmount: number | null;
    creatorName?: string;
  } | null;
  onSuccess?: (newPayout: number) => void;
}

export default function SubmissionPayoutModal({
  isOpen,
  onClose,
  submission,
  onSuccess,
}: SubmissionPayoutModalProps) {
  const [amountStr, setAmountStr] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (submission) {
      setAmountStr(String(submission.payoutAmount ?? submission.reservedAmount ?? 0));
      setReason("");
      setErrorMsg(null);
    }
  }, [submission]);

  if (!submission) return null;

  const currentPayout = submission.payoutAmount ?? 0;
  const numAmount = parseFloat(amountStr) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isNaN(numAmount) || numAmount < 0) {
      setErrorMsg("Payout amount must be a non-negative number.");
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMsg("A detailed audit reason is mandatory (minimum 5 characters).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await adjustSubmissionPayoutAction(submission.id, numAmount, reason.trim());
      if (res.success) {
        onSuccess?.(res.payoutAmount);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to adjust submission payout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[520px] p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Adjust Submission Payout
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Modify payout release for submission #{submission.id.slice(0, 8)}
              {submission.creatorName && ` (${submission.creatorName})`}.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Escrow Comparison Card */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Reserved Escrow</span>
            <span className="text-sm font-bold font-mono text-gray-800 dark:text-gray-200">
              ₦{Number(submission.reservedAmount || 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Current Payout</span>
            <span className="text-sm font-bold font-mono text-gray-800 dark:text-gray-200">
              ₦{Number(currentPayout).toLocaleString()}
            </span>
          </div>
        </div>

        {/* New Payout Input */}
        <div>
          <label
            htmlFor="payoutInput"
            className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            New Payout Amount (NGN) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-mono">₦</span>
            <input
              id="payoutInput"
              type="number"
              min={0}
              step={100}
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent pl-8 pr-3 py-2 text-xs font-mono font-bold text-gray-900 dark:text-white focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Audit Justification */}
        <div>
          <label
            htmlFor="payoutAuditReason"
            className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Audit Reason & Justification <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="payoutAuditReason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Manual bonus adjusted due to verified viral reach or advertiser bonus agreement."
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Adjusting..." : "Confirm Adjustment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
