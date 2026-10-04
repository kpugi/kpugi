"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  CreditCard,
  Loader2,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  KeyRound,
  Send,
} from "lucide-react";
import {
  approvePayoutRequestAction,
  disbursePayoutRequestAction,
  finalizePaystackTransferAction,
  rejectPayoutRequestAction,
} from "@/app/actions/admin-finances";
import { formatScheduledFriday } from "@/lib/utils/payout-schedule";

export interface PayoutRequestItem {
  id: string;
  profile_id: string;
  bank_account_id?: string | null;
  amount: number;
  status: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  reference: string | null;
  transfer_reference?: string | null;
  scheduled_for?: string | null;
  rejection_reason?: string | null;
  admin_notes?: string | null;
  paystack_transfer_code?: string | null;
  processed_at?: string | null;
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
  const [actionType, setActionType] = useState<"approve" | "disburse" | "reject">("approve");
  const [disburseMode, setDisburseMode] = useState<"paystack_transfer" | "manual">("paystack_transfer");
  const [transferNote, setTransferNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Verification state
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [activeTransferCode, setActiveTransferCode] = useState("");

  if (!payout) return null;

  const creatorName =
    payout.creator_profile?.display_name ||
    payout.profile?.full_name ||
    payout.account_name ||
    "Creator";

  const isAlreadyCompleted = payout.status === "completed" || payout.status === "success";

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setError("Please enter the verification OTP sent to your phone.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await finalizePaystackTransferAction(
        payout.id,
        activeTransferCode,
        otpCode.trim()
      );
      onSuccess(res.message);
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to finalize OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (actionType === "approve") {
        const res = await approvePayoutRequestAction(payout.id);
        onSuccess(res.message);
        handleClose();
      } else if (actionType === "disburse") {
        const res = await disbursePayoutRequestAction(
          payout.id,
          disburseMode,
          transferNote || undefined
        );

        if (res.requiresOtp && res.transferCode) {
          setActiveTransferCode(res.transferCode);
          setOtpRequired(true);
          return;
        }

        onSuccess(res.message);
        handleClose();
      } else {
        if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
          throw new Error("Please provide a rejection reason (min 5 chars).");
        }
        const ref = payout.reference || payout.transfer_reference || "";
        const res = await rejectPayoutRequestAction(
          payout.id,
          ref,
          rejectionReason.trim()
        );
        onSuccess(res.message);
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOtpRequired(false);
    setOtpCode("");
    setActiveTransferCode("");
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[520px] p-6">
      {otpRequired ? (
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Authorize Paystack Transfer
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Transfer Code: {activeTransferCode}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200/80 text-xs text-cyan-800 dark:bg-cyan-950/30 dark:border-cyan-800/60 dark:text-cyan-300 space-y-1">
            <p className="font-semibold">OTP Verification Required</p>
            <p className="text-[11px] leading-relaxed">
              Paystack has dispatched a one-time authorization code to your merchant mobile phone. Enter the code below to release ₦{Number(payout.amount).toLocaleString()} to {payout.account_name || creatorName}.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Enter Paystack OTP
            </label>
            <input
              type="text"
              required
              autoFocus
              maxLength={8}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="e.g. 123456"
              className="w-full text-center font-mono text-lg tracking-widest px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorize &amp; Complete</span>
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center font-bold">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Manage Creator Withdrawal
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  Req #{payout.id.slice(0, 8)} • Ref: {payout.reference || "N/A"}
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${
              payout.status === 'completed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                : payout.status === 'approved'
                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                : payout.status === 'rejected'
                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
            }`}>
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
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">Friday Settlement Batch</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {payout.scheduled_for ? formatScheduledFriday(payout.scheduled_for) : "Next Friday"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">Current Balance</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ₦{Number(payout.creator_profile?.total_earned || 0).toLocaleString()} earned
                </span>
              </div>
            </div>
          </div>

          {!isAlreadyCompleted && (
            <>
              {/* Decision Toggle - 3 Options: Approve, Disburse, Reject */}
              <div className="grid grid-cols-3 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-800 gap-0.5">
                <button
                  type="button"
                  onClick={() => setActionType("approve")}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    actionType === "approve"
                      ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-xs"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                  }`}
                >
                  1. Approve Batch
                </button>
                <button
                  type="button"
                  onClick={() => setActionType("disburse")}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    actionType === "disburse"
                      ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                  }`}
                >
                  2. Disburse Now
                </button>
                <button
                  type="button"
                  onClick={() => setActionType("reject")}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    actionType === "reject"
                      ? "bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-xs"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                  }`}
                >
                  3. Reject &amp; Rollback
                </button>
              </div>

              {/* Action Fields based on selection */}
              {actionType === "approve" && (
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-xs text-purple-800 dark:bg-purple-950/30 dark:border-purple-800/60 dark:text-purple-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Approve for Scheduled Friday Batch</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-purple-700 dark:text-purple-300">
                    Approving this request verifies that the creator&apos;s submissions and views are valid.
                    The request will be queued for the upcoming batch disbursement on{" "}
                    <strong>{payout.scheduled_for ? formatScheduledFriday(payout.scheduled_for) : "Friday"}</strong>.
                  </p>
                </div>
              )}

              {actionType === "disburse" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Disbursement Method
                    </label>
                    <select
                      value={disburseMode}
                      onChange={(e) => setDisburseMode(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="paystack_transfer">Automated Paystack Transfer API (Instant NUBAN)</option>
                      <option value="manual">Manual Bank Transfer (Paid via Bank App)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Audit Note / Settlement Reference (Optional)
                    </label>
                    <input
                      type="text"
                      value={transferNote}
                      onChange={(e) => setTransferNote(e.target.value)}
                      placeholder="e.g. Disbursed via Paystack live batch or mobile banking session"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {actionType === "reject" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Rejection Reason (Mandatory for audit trail &amp; creator explanation)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                      rows={3}
                      placeholder="e.g. Account name mismatch or suspicious views detected during audit."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Rejecting this request will execute an atomic rollback on Postgres, immediately refunding ₦{Number(payout.amount).toLocaleString()} back to the creator&apos;s available wallet balance.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
              {isAlreadyCompleted ? "Close" : "Cancel"}
            </Button>
            {!isAlreadyCompleted && (
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                className={`gap-1.5 text-white ${
                  actionType === "approve"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : actionType === "disburse"
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
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approve for Friday Batch</span>
                  </>
                ) : actionType === "disburse" ? (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Disburse Payment Now</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject &amp; Refund</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}
