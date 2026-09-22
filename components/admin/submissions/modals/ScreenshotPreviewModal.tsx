"use client";

import React from "react";
import Image from "next/image";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import { ExternalLink, Download, Image as ImageIcon } from "lucide-react";

interface ScreenshotPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  submissionId?: string;
  creatorName?: string;
}

export default function ScreenshotPreviewModal({
  isOpen,
  onClose,
  imageUrl,
  submissionId,
  creatorName,
}: ScreenshotPreviewModalProps) {
  if (!imageUrl) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Screenshot Proof Preview
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                {submissionId ? `Submission #${submissionId.slice(0, 8)}` : "Submission Proof"}
                {creatorName && ` • ${creatorName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <span>Open Original</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Media Container */}
        <div className="rounded-xl overflow-hidden bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-gray-800 flex items-center justify-center min-h-[300px] max-h-[550px] relative">
          <img
            src={imageUrl}
            alt="Submission screenshot proof"
            className="max-h-[540px] w-auto max-w-full object-contain mx-auto"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-gray-400">
            Uploaded by creator as verification proof.
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </Modal>
  );
}
