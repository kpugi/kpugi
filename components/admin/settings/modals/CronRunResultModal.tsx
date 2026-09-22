"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import {
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Zap,
} from "lucide-react";

export interface CronRunResult {
  jobName: string;
  path: string;
  success: boolean;
  statusCode: number;
  latencyMs: number;
  payload: Record<string, unknown> | null;
  error?: string;
  triggeredAt: string;
}

interface CronRunResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CronRunResult | null;
}

export default function CronRunResultModal({
  isOpen,
  onClose,
  result,
}: CronRunResultModalProps) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const jsonString = result.payload
    ? JSON.stringify(result.payload, null, 2)
    : result.error || "No payload returned.";

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[640px] p-6">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                result.success
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-gray-900 dark:text-white">
                {result.jobName}
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                {result.path}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
              result.success
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            HTTP {result.statusCode}
          </span>
        </div>

        {/* Quick Diagnostics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#0A0E1A] border border-gray-200 dark:border-white/5 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-gray-400 text-[10px]">Execution Latency</p>
              <p className="font-mono font-bold text-gray-900 dark:text-white">
                {result.latencyMs} ms
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#0A0E1A] border border-gray-200 dark:border-white/5 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-gray-400 text-[10px]">Executed At</p>
              <p className="font-mono text-gray-900 dark:text-white">
                {new Date(result.triggeredAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* JSON Payload Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 font-sans">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Cron Response Payload
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-emerald-400 font-sans">
                  <Check className="w-3.5 h-3.5" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1 font-sans">
                  <Copy className="w-3.5 h-3.5" /> Copy JSON
                </span>
              )}
            </button>
          </div>
          <div className="p-4 rounded-xl bg-[#080B14] border border-white/5 overflow-x-auto max-h-[280px]">
            <pre className="font-mono text-xs text-emerald-300 leading-relaxed">
              {jsonString}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-gray-100 dark:border-white/5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Result
          </Button>
        </div>
      </div>
    </Modal>
  );
}
