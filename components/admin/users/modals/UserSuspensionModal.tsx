"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import { AlertTriangle, CheckCircle2, ShieldAlert, Check } from "lucide-react";
import { setUserSuspensionStatusAction } from "@/app/actions/admin-users";

interface UserSuspensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    fullName: string;
    email: string;
    isSuspended: boolean;
  } | null;
  onSuccess?: (newStatus: "active" | "suspended") => void;
}

export default function UserSuspensionModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: UserSuspensionModalProps) {
  const [reason, setReason] = useState("");
  const [banInClerk, setBanInClerk] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) return null;

  const willSuspend = !user.isSuspended;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMsg("Please provide a detailed justification (at least 5 characters).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await setUserSuspensionStatusAction(
        user.id,
        willSuspend ? "suspended" : "active",
        reason.trim(),
        { banInClerk }
      );
      if (res.success) {
        onSuccess?.(res.status);
        onClose();
        setReason("");
        setBanInClerk(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update user suspension status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[540px] p-6 sm:p-8"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              willSuspend
                ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
            }`}
          >
            {willSuspend ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {willSuspend ? "Suspend User Account" : "Reactivate User Account"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {willSuspend
                ? `Suspending will enforce Read-Only Mode across the platform for ${user.fullName} (${user.email}).`
                : `Reactivating will restore normal write, campaign, and payout privileges for ${user.fullName} (${user.email}).`}
            </p>
          </div>
        </div>

        {willSuspend && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">Account Read-Only Enforcement:</span>
                <p className="leading-relaxed">
                  The user will be barred from joining new campaigns, submitting video links, requesting withdrawals, updating profile data, and connecting accounts.
                </p>
              </div>
            </div>

            {/* Clerk Integration Card */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/30 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Clerk Integration Connected
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                Suspension status and reason will automatically sync to the user&apos;s Clerk user metadata (accessible in Clerk Dashboard &amp; JWT claims).
              </p>

              <label className="flex items-start gap-2.5 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={banInClerk}
                  onChange={(e) => setBanInClerk(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Also block sign-in completely (Clerk Full Ban)
                  </span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Unchecked by default to allow the user read-only sign-in access. Check this if you want to revoke all active sessions and block login entirely.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/50">
            {errorMsg}
          </div>
        )}

        <div>
          <label
            htmlFor="suspensionReason"
            className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Audit Reason & Justification <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="suspensionReason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              willSuspend
                ? "e.g., Flagged for repetitive view manipulation or policy violations"
                : "e.g., Creator submitted verified proof and cleared appeal review"
            }
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
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
              willSuspend
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isSubmitting
              ? willSuspend
                ? "Suspending..."
                : "Reactivating..."
              : willSuspend
                ? "Confirm Suspension"
                : "Confirm Reactivation"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
