"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  User,
  CreditCard,
  Loader2,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import {
  approvePayoutRequestAction,
  rejectPayoutRequestAction,
} from "@/app/actions/admin-finances";

export interface PayoutRequestItem {
  id: string;
  profile_id: string;
  amount: number;
  status: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  reference: string | null;
  created_at: string;
  profile?: {
    full_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
  creator_profile?: {
    display_name?: string | null;
    creator_handle?: string | null;
    kyc_status?: string | null;
    total_earned?: number | null;
  } | null;
}

interface PayoutActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  payout: PayoutRequestItem | null;
  onSuccess: (message: string) => void;
}

export default function PayoutActionModal({
  isOpen,
  onClose,
  payout,
  onSuccess,
}: PayoutActionModalProps) {
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [approvalMode, setApprovalMode] = useState<"paystack_transfer" | "manual">("manual");
  const [transferNote, setTransferNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!payout) return null;

  const creatorName =
    payout.creator_profile?.display_name ||
    payout.profile?.full_name ||
    payout.account_name ||
    "Creator";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (actionType === "approve") {
        const res = await approvePayoutRequestAction(
          payout.id,
          approvalMode,
          transferNote || undefined
        );
        onSuccess(res.message);
      } else {
        if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
          throw new Error("Please provide a rejection reason (min 5 chars).");
        }
        const res = await rejectPayoutRequestAction(
          payout.id,
          payout.reference || "",
          rejectionReason.trim()
        );
        onSuccess(res.message);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Process Creator Withdrawal
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Req #{payout.id.slice(0, 8)} • Ref: {payout.reference || "N/A"}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 uppercase">
            {payout.status}
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Bank & Creator Details Card */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 dark:border-gray-800 dark:bg-white/2 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-800/60 pb-2">
            <span className="text-gray-400">Withdrawal Amount</span>
            <span className="text-base font-bold font-mono text-gray-900 dark:text-white">
              ₦{Number(payout.amount).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300 font-mono">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Bank Name</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {payout.bank_name || "Direct Bank Transfer"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Account Number</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {payout.account_number || "—"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Account Name</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {payout.account_name || creatorName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Creator Handle</span>
              <span className="font-semibold text-brand-500">
                @{payout.creator_profile?.creator_handle || "creator"}
              </span>
            </div>
          </div>
        </div>

        {/* Decision Toggle */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setActionType("approve")}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              actionType === "approve"
                ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            Approve &amp; Settle
          </button>
          <button
            type="button"
            onClick={() => setActionType("reject")}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              actionType === "reject"
                ? "bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            Reject &amp; Rollback
          </button>
        </div>

        {/* Action fields */}
        {actionType === "approve" ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Settlement Mode
              </label>
              <select
                value={approvalMode}
                onChange={(e) => setApprovalMode(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="manual">Manual Bank Transfer (External Banking App)</option>
                <option value="paystack_transfer">Automated Paystack Transfer API</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Audit Note / External Reference (Optional)
              </label>
              <input
                type="text"
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                placeholder="e.g. Sent via GTBank mobile app session #19382"
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Rejection Reason (Mandatory for audit trail)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                rows={3}
                placeholder="e.g. Account name mismatch or invalid bank account number provided."
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <p className="text-[11px] text-gray-400">
              Rejecting this request will execute an atomic rollback on Postgres, immediately refunding ₦{Number(payout.amount).toLocaleString()} back to the creator&apos;s wallet balance.
            </p>
          </div>
        )}

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading}
            className={`gap-1.5 text-white ${
              actionType === "approve"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : actionType === "approve" ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Settlement</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject &amp; Rollback</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
