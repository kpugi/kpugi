"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import { Code, Copy, Check } from "lucide-react";

interface ScrapePayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  check: {
    id: string;
    checkedAt: string;
    postReachable: boolean;
    viewCount: number | null;
    rawScrape: Record<string, unknown> | null;
    notes: string | null;
  } | null;
}

export default function ScrapePayloadModal({
  isOpen,
  onClose,
  check,
}: ScrapePayloadModalProps) {
  const [copied, setCopied] = useState(false);

  if (!check) return null;

  const jsonString = JSON.stringify(check.rawScrape || {}, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[650px] p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Raw Scrape Payload
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Check #{check.id.slice(0, 8)} • {new Date(check.checkedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        {/* Notes strip if present */}
        {check.notes && (
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 text-xs font-mono text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-white/5">
            {check.notes}
          </div>
        )}

        {/* JSON Code Box */}
        <div className="relative rounded-xl overflow-hidden bg-gray-900 text-gray-100 p-4 font-mono text-xs max-h-[400px] overflow-y-auto border border-gray-800">
          <pre className="whitespace-pre-wrap break-words">{jsonString}</pre>
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
