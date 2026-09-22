"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import {
  KeyRound,
  ShieldAlert,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";
import { ServiceIntegrationStatus } from "@/app/actions/admin-settings";

interface ApiKeyUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceIntegrationStatus | null;
}

export default function ApiKeyUpdateModal({
  isOpen,
  onClose,
  service,
}: ApiKeyUpdateModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!service) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[520px] p-6">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-gray-900 dark:text-white">
                {service.name}
              </h3>
              <p className="text-xs text-gray-400 font-sans">
                Service credentials and environment mapping
              </p>
            </div>
          </div>
        </div>

        {/* Security Alert */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-200">Zero-Leak Key Security</p>
            <p className="text-amber-300/80 leading-relaxed">
              API secrets are encrypted and resolved server-side. For production security, update keys in your server environment (<code className="font-mono text-[11px] bg-amber-950/40 px-1 py-0.5 rounded">.env.local</code> or Vercel dashboard) to prevent accidental client leakage.
            </p>
          </div>
        </div>

        {/* Associated Environment Variables */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
            Associated Environment Variables
          </label>
          <div className="space-y-2">
            {service.envKeys.map((envKey) => (
              <div
                key={envKey}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#0A0E1A] border border-gray-200 dark:border-white/5 font-mono text-xs"
              >
                <span className="text-gray-800 dark:text-gray-200 font-semibold">{envKey}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(envKey)}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
                >
                  {copiedKey === envKey ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Current Masked Value */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
            Active Masked Secret
          </label>
          <div className="p-3 rounded-xl bg-gray-100 dark:bg-[#080B14] border border-gray-200 dark:border-white/5 flex items-center justify-between">
            <span className="font-mono text-xs text-indigo-400 tracking-wider">
              {service.maskedKey}
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                service.configured
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {service.configured ? "Configured" : "Missing"}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
