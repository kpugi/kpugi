"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import { ShieldCheck, UserCog, AlertCircle } from "lucide-react";
import { updateUserRoleAction, overrideUserKycStatusAction } from "@/app/actions/admin-users";

interface UserRoleKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    kycStatus?: string;
  } | null;
  onSuccess?: () => void;
}

export default function UserRoleKycModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: UserRoleKycModalProps) {
  const [selectedRole, setSelectedRole] = useState<"creator" | "advertiser" | "both">(
    (user?.role as any) || "creator"
  );
  const [selectedKyc, setSelectedKyc] = useState<"verified" | "unverified" | "pending" | "rejected">(
    (user?.kycStatus as any) || "unverified"
  );
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMsg("Please provide an audit justification (at least 5 characters).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Role update if changed
      if (selectedRole !== user.role) {
        await updateUserRoleAction(user.id, selectedRole, reason.trim());
      }

      // 2. KYC update if changed
      if (selectedKyc !== user.kycStatus) {
        await overrideUserKycStatusAction(user.id, selectedKyc, reason.trim());
      }

      onSuccess?.();
      onClose();
      setReason("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update user parameters.");
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
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 flex items-center justify-center shrink-0">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Role & KYC Status Override
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Modify account capabilities and identity verification clearance for {user.fullName} ({user.email}).
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Platform Role
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: "creator", label: "Creator", desc: "Monetizes content" },
              { id: "advertiser", label: "Advertiser", desc: "Funds briefs" },
              { id: "both", label: "Both (Hybrid)", desc: "Dual privileges" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id as any)}
                className={`p-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-start ${
                  selectedRole === r.id
                    ? "bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 font-bold"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                <span>{r.label}</span>
                <span className="text-[10px] font-normal opacity-70 mt-0.5">
                  {r.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* KYC Status Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Didit KYC Verification State
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "verified", label: "Verified", color: "emerald" },
              { id: "pending", label: "Pending", color: "amber" },
              { id: "unverified", label: "Unverified", color: "gray" },
              { id: "rejected", label: "Rejected", color: "rose" },
            ].map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setSelectedKyc(k.id as any)}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer capitalize text-center ${
                  selectedKyc === k.id
                    ? "bg-brand-500 text-white border-brand-500 shadow-xs"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Justification */}
        <div>
          <label
            htmlFor="kycRoleReason"
            className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Audit Reason & Notes <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="kycRoleReason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Manually verified government ID via Didit compliance review ticket #KYC-5192"
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
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
