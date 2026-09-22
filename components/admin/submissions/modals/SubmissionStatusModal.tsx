"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";
import { overrideSubmissionStatusAction, SubmissionStatusType } from "@/app/actions/admin-submissions";

interface SubmissionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: {
    id: string;
    status: string;
    creatorName?: string;
    campaignTitle?: string;
    reservedAmount?: number;
    failureReason?: string | null;
  } | null;
  onSuccess?: (newStatus: SubmissionStatusType) => void;
}

const COMMON_FAILURE_REASONS = [
  "Campaign brief compliance failed: Your post caption is missing required hashtag(s).",
  "Post content does not adhere to advertiser campaign guidelines.",
  "Social post is private, deleted, or unreachable by scraper.",
  "Video did not meet the minimum duration requirement.",
  "Post was uploaded from an unverified or mismatched social account.",
  "Artificial view manipulation or invalid engagement detected.",
  "Custom failure reason",
];

export default function SubmissionStatusModal({
  isOpen,
  onClose,
  submission,
  onSuccess,
}: SubmissionStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatusType>(
    (submission?.status as SubmissionStatusType) || "verified_pass"
  );
  const [selectedFailurePreset, setSelectedFailurePreset] = useState(COMMON_FAILURE_REASONS[0]);
  const [customFailureReason, setCustomFailureReason] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state on open
  React.useEffect(() => {
    if (submission) {
      if (submission.status === "verified_fail" || submission.status === "rejected") {
        setSelectedStatus("verified_fail");
        if (submission.failureReason) {
          if (COMMON_FAILURE_REASONS.includes(submission.failureReason)) {
            setSelectedFailurePreset(submission.failureReason);
          } else {
            setSelectedFailurePreset("Custom failure reason");
            setCustomFailureReason(submission.failureReason);
          }
        }
      } else if (submission.status === "verified_pass" || submission.status === "approved") {
        setSelectedStatus("verified_pass");
      } else {
        setSelectedStatus("verified_pass");
      }
      setReason("");
      setErrorMsg(null);
    }
  }, [submission]);

  if (!submission) return null;

  const isFailing = selectedStatus === "verified_fail" || selectedStatus === "rejected";
  const isPassing = selectedStatus === "verified_pass" || selectedStatus === "approved";
  const isPaying = selectedStatus === "paid";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMsg("A detailed audit reason is mandatory (minimum 5 characters).");
      return;
    }

    let finalFailureReason: string | undefined = undefined;
    if (isFailing) {
      finalFailureReason =
        selectedFailurePreset === "Custom failure reason"
          ? customFailureReason.trim()
          : selectedFailurePreset;
      if (!finalFailureReason || finalFailureReason.length < 5) {
        setErrorMsg("Please provide an explicit failure reason for the creator.");
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await overrideSubmissionStatusAction(
        submission.id,
        selectedStatus,
        reason.trim(),
        finalFailureReason
      );

      if (res.success) {
        onSuccess?.(res.status);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to override submission status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[580px] p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isFailing
                ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                : isPassing
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
            }`}
          >
            {isFailing ? (
              <XCircle className="w-6 h-6" />
            ) : isPassing ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Override Submission Status
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Manual administrative intervention for submission #{submission.id.slice(0, 8)}
              {submission.creatorName && ` by ${submission.creatorName}`}.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Status Options Pills */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Target Verification Status <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "verified_pass", label: "Pass (Approved)", color: "emerald" },
              { id: "verified_fail", label: "Fail (Rejected)", color: "rose" },
              { id: "pending", label: "Pending Review", color: "amber" },
              { id: "paid", label: "Paid & Released", color: "blue" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatus(st.id as SubmissionStatusType)}
                className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                  selectedStatus === st.id
                    ? st.color === "emerald"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-500 shadow-xs"
                      : st.color === "rose"
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-500 shadow-xs"
                      : st.color === "amber"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-500 shadow-xs"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-500 shadow-xs"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Failure Reason Section if Failing */}
        {isFailing && (
          <div className="space-y-2.5 p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
            <label className="block text-xs font-semibold text-rose-800 dark:text-rose-300">
              Reason for Verification Failure <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedFailurePreset}
              onChange={(e) => setSelectedFailurePreset(e.target.value)}
              className="w-full rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
            >
              {COMMON_FAILURE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {selectedFailurePreset === "Custom failure reason" && (
              <textarea
                rows={2}
                value={customFailureReason}
                onChange={(e) => setCustomFailureReason(e.target.value)}
                placeholder="Enter specific failure details displayed to the creator..."
                className="w-full rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
              />
            )}
          </div>
        )}

        {/* Informational Alert if Passing or Paying */}
        {isPassing && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Approving this submission verifies compliance and unlocks payout eligibility for ₦
              {(submission.reservedAmount || 0).toLocaleString()}.
            </span>
          </div>
        )}

        {isPaying && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Marking as Paid confirms that funds have been credited and settles this submission.
            </span>
          </div>
        )}

        {/* Audit Justification */}
        <div>
          <label
            htmlFor="statusAuditReason"
            className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Internal Audit Justification <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="statusAuditReason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Reviewed creator appeal and verified post hashtags manually on live video."
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
              isFailing
                ? "bg-rose-600 hover:bg-rose-700"
                : isPassing
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-brand-600 hover:bg-brand-700"
            }`}
          >
            {isSubmitting ? "Updating Status..." : "Confirm Override"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
