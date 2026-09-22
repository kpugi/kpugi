"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Loader2,
  Copy,
  Check,
  CreditCard,
  Building2,
  ExternalLink,
  Code,
  ShieldCheck,
} from "lucide-react";
import { verifyPaystackTransactionAction } from "@/app/actions/admin-finances";

interface PaystackVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReference?: string | null;
}

export default function PaystackVerifyModal({
  isOpen,
  onClose,
  initialReference,
}: PaystackVerifyModalProps) {
  const [reference, setReference] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showJson, setShowJson] = useState<boolean>(false);

  useEffect(() => {
    if (initialReference) {
      setReference(initialReference);
      handleVerify(initialReference);
    } else {
      setReference("");
      setResult(null);
      setError(null);
    }
  }, [initialReference, isOpen]);

  const handleVerify = async (refToVerify?: string) => {
    const targetRef = (refToVerify || reference).trim();
    if (!targetRef) {
      setError("Please enter a Paystack reference to verify.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await verifyPaystackTransactionAction(targetRef);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || "Failed to verify transaction with Paystack.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected network or gateway error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Live Paystack Gateway Verification
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Direct cryptographic verification query against Paystack Core API
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter reference (e.g. KPG-..., T123456789)..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-4 text-xs font-mono text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => handleVerify()}
            disabled={loading || !reference.trim()}
            className="flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>Verify</span>
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Paystack Verification Error</p>
              <p className="mt-0.5 text-[11px] opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Verification Result Card */}
        {result && (
          <div className="space-y-3.5 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <div className="flex items-center justify-between border-b border-gray-200/70 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                {result.status === "success" ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Paystack Success
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {result.status?.toUpperCase() || "PENDING"}
                  </span>
                )}
                <span className="text-xs text-gray-500 font-mono">
                  ID: {result.id}
                </span>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">Settled Amount</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  ₦{(Number(result.amount || 0) / 100).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* Grid of verified properties */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-white p-2.5 shadow-xs dark:bg-gray-800">
                <span className="text-[11px] text-gray-400">Gateway Message</span>
                <p className="mt-0.5 font-medium text-gray-900 dark:text-white">
                  {result.gateway_response || result.message || "Approved"}
                </p>
              </div>
              <div className="rounded-lg bg-white p-2.5 shadow-xs dark:bg-gray-800">
                <span className="text-[11px] text-gray-400">Channel / Method</span>
                <p className="mt-0.5 font-medium capitalize text-gray-900 dark:text-white">
                  {result.channel || "Card"}
                </p>
              </div>
              <div className="rounded-lg bg-white p-2.5 shadow-xs dark:bg-gray-800">
                <span className="text-[11px] text-gray-400">Customer</span>
                <p className="mt-0.5 font-medium truncate text-gray-900 dark:text-white">
                  {result.customer?.email || "N/A"}
                </p>
              </div>
              <div className="rounded-lg bg-white p-2.5 shadow-xs dark:bg-gray-800">
                <span className="text-[11px] text-gray-400">Paid At</span>
                <p className="mt-0.5 font-medium text-gray-900 dark:text-white">
                  {result.paid_at
                    ? new Date(result.paid_at).toLocaleString()
                    : "Not settled yet"}
                </p>
              </div>
            </div>

            {/* Card / Bank Authorization details if available */}
            {result.authorization && (
              <div className="rounded-lg border border-gray-200/60 bg-white p-2.5 text-xs dark:border-gray-800 dark:bg-gray-800">
                <span className="text-[11px] font-semibold text-gray-400">
                  Funding Source Authorization
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    {result.authorization.brand?.toUpperCase()} •••• {result.authorization.last4}
                  </span>
                  <span className="text-gray-500 font-mono text-[11px]">
                    {result.authorization.bank || "Debit Card"}
                  </span>
                </div>
              </div>
            )}

            {/* Raw JSON toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowJson(!showJson)}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-brand-500 dark:text-gray-400"
              >
                <Code className="h-3.5 w-3.5" />
                <span>{showJson ? "Hide Raw Paystack JSON" : "Inspect Raw Paystack JSON"}</span>
              </button>

              {showJson && (
                <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-gray-900 p-3 text-[10px] font-mono text-emerald-400">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
          {result?.reference && (
            <button
              type="button"
              onClick={() => handleCopy(result.reference)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-500"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copied ? "Copied" : "Copy Ref"}</span>
            </button>
          )}
          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
