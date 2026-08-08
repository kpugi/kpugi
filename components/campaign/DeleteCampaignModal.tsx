'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Archive, X, Loader2 } from 'lucide-react';
import { archiveCampaignAction } from '@/app/actions/campaign';

interface DeleteCampaignModalProps {
  campaign: {
    id: string;
    title: string;
    status: string;
    total_budget?: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteCampaignModal({ campaign, onClose, onSuccess }: DeleteCampaignModalProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const isDraft = campaign.status === 'draft';

  const handleArchive = async () => {
    setIsArchiving(true);
    setErrorMsg('');

    const res = await archiveCampaignAction(campaign.id);
    setIsArchiving(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to archive campaign.');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center mx-auto">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-extrabold">
              {isDraft ? 'Archive Draft Campaign?' : 'Archive Live Campaign?'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
              Archive this campaign to remove it from your active workspace while keeping your performance records safe.
            </p>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4 text-xs font-sans">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Target Campaign</div>
            <div className="font-bold text-slate-900 text-sm truncate">{campaign.title}</div>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-200 text-slate-700">
                CURRENT STATUS: {campaign.status}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
            📁 <strong>Campaign History:</strong> Archived campaigns will be stored safely in your account history.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Keep Campaign
          </button>

          <button
            type="button"
            disabled={isArchiving}
            onClick={handleArchive}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {isArchiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
            <span>{isArchiving ? 'Archiving...' : 'Archive Campaign'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
