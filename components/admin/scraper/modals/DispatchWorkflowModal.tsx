"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import { Play, Loader2, AlertCircle, GitBranch, CheckCircle2 } from "lucide-react";
import { dispatchGitHubWorkflowAction } from "@/app/actions/admin-scraper";

interface DispatchWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  repo: string;
}

export default function DispatchWorkflowModal({
  isOpen,
  onClose,
  onSuccess,
  repo,
}: DispatchWorkflowModalProps) {
  const [batchSize, setBatchSize] = useState("50");
  const [branch, setBranch] = useState("main");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const parsedSize = parseInt(batchSize, 10) || 50;
      const res = await dispatchGitHubWorkflowAction(parsedSize, branch);
      onSuccess(res.message);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to dispatch GitHub workflow.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[480px] p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Dispatch GitHub Actions Workflow
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Trigger <code className="font-mono text-brand-500">scraper-cron.yml</code> on {repo}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200/60 dark:bg-rose-950/40 dark:border-rose-900/60 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Target Branch / Git Ref
            </label>
            <div className="relative">
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                placeholder="main"
              />
              <GitBranch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Batch Size (Submissions to Audit)
            </label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
            >
              <option value="10">10 Submissions (Quick Test)</option>
              <option value="25">25 Submissions (Light Batch)</option>
              <option value="50">50 Submissions (Standard Default)</option>
              <option value="100">100 Submissions (Heavy Batch)</option>
              <option value="250">250 Submissions (Full Drain)</option>
            </select>
            <p className="text-[11px] text-gray-400 mt-1">
              Controls the maximum number of due submissions processed in this GitHub runner execution.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Runner Pipeline includes:</span>
            </div>
            <ul className="list-disc pl-5 text-[11px] space-y-0.5">
              <li>Metric Scraper &amp; View Auditor (<code className="font-mono">python .scraper/runner.py</code>)</li>
              <li>Daily Settlement &amp; Auto-Release (<code className="font-mono">node .scraper/settle.js</code>)</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5 bg-brand-500 hover:bg-brand-600 text-white">
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Dispatch Workflow</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
