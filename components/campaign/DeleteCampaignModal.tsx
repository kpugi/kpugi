'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Archive, Trash2, X, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import {
  archiveCampaignAction,
  deleteArchivedCampaignAction,
  deleteAllArchivedCampaignsAction,
} from '@/app/actions/campaign';

export type CampaignModalMode = 'archive' | 'delete' | 'deleteAll';

interface DeleteCampaignModalProps {
  campaign?: {
    id: string;
    title: string;
    status: string;
    total_budget?: number;
  } | null;
  mode?: CampaignModalMode;
  archivedCount?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteCampaignModal({
  campaign,
  mode,
  archivedCount = 0,
  onClose,
  onSuccess,
}: DeleteCampaignModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Determine mode: if not explicitly passed, determine from campaign status
  const currentMode: CampaignModalMode =
    mode || (campaign?.status === 'archived' ? 'delete' : 'archive');

  const handleAction = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      let res: { success: boolean; error?: string; message?: string };

      if (currentMode === 'deleteAll') {
        res = await deleteAllArchivedCampaignsAction();
      } else if (currentMode === 'delete' && campaign?.id) {
        res = await deleteArchivedCampaignAction(campaign.id);
      } else if (campaign?.id) {
        res = await archiveCampaignAction(campaign.id);
      } else {
        res = { success: false, error: 'No target campaign specified.' };
      }

      setIsProcessing(false);

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to complete requested action.');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err?.message || 'Unexpected error occurred.');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#12141A] rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden text-kpugi-ink dark:text-white">
        {/* Header */}
        {currentMode === 'archive' ? (
          <div className="p-6 bg-slate-900 dark:bg-[#161820] text-white text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 dark:bg-white/10 text-amber-400 border border-slate-700 dark:border-white/10 flex items-center justify-center mx-auto">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold">Archive Campaign?</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
                Move this campaign to your archived records. You can still view past performance reports in the archived section.
              </p>
            </div>
          </div>
        ) : currentMode === 'deleteAll' ? (
          <div className="p-6 bg-rose-950 text-white text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-900/80 text-rose-300 border border-rose-800 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold">Delete All Archived Campaigns?</h3>
              <p className="text-xs text-rose-200/90 mt-1 max-w-xs mx-auto leading-relaxed">
                Remove all {archivedCount > 0 ? `${archivedCount} ` : ''}archived campaigns from your dashboard.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-rose-950 text-white text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-900/80 text-rose-300 border border-rose-800 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold">Delete Archived Campaign?</h3>
              <p className="text-xs text-rose-200/90 mt-1 max-w-xs mx-auto leading-relaxed">
                Remove this archived campaign from your brand dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Content Details */}
        <div className="p-6 space-y-4 text-xs font-sans">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-500/30 text-red-700 dark:text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          {campaign && currentMode !== 'deleteAll' && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400">Target Campaign</div>
              <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{campaign.title}</div>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                  CURRENT STATUS: {campaign.status}
                </span>
              </div>
            </div>
          )}

          {currentMode === 'archive' ? (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
              📁 <strong>Campaign History:</strong> Archived campaigns remain visible in your dedicated Archived tab for historical analytics.
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Database Record Preserved:</strong> This removes the campaign from your user view while preserving all financial transactions, receipts, and submission history in the database for platform history.
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {currentMode === 'archive' ? (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleAction}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
              <span>{isProcessing ? 'Archiving...' : 'Archive Campaign'}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleAction}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>
                {isProcessing
                  ? 'Deleting...'
                  : currentMode === 'deleteAll'
                  ? 'Delete All Archived'
                  : 'Delete from Dashboard'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
