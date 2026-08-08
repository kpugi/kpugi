'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Save, Loader2, FileText, AlertCircle } from 'lucide-react';
import { updateCampaignDetailsAction, generateAICampaignPolishAction } from '@/app/actions/campaign';

interface EditCampaignModalProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    channels?: string[];
    is_featured?: boolean;
    requirements?: any;
    status: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCampaignModal({ campaign, onClose, onSuccess }: EditCampaignModalProps) {
  const [title, setTitle] = useState(campaign.title || '');
  const [description, setDescription] = useState(campaign.description || '');
  const [creativeCopy, setCreativeCopy] = useState(campaign.requirements?.creative_text_copy || '');
  const [driveUrl, setDriveUrl] = useState(campaign.requirements?.google_drive_url || '');
  const [docUrl, setDocUrl] = useState(campaign.requirements?.google_doc_url || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleAiExpandBrief = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a Campaign Title first.');
      return;
    }
    setErrorMsg('');
    setIsAiLoading(true);

    const contextPrompt = `Campaign Title: ${title.trim()}\nUser Draft: ${description || 'No draft provided'}`;
    const res = await generateAICampaignPolishAction(contextPrompt, 'description');
    setIsAiLoading(false);

    if (res.success && res.text) {
      setDescription(res.text.slice(0, 500));
    } else {
      setErrorMsg(res.error || 'AI generation failed.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Campaign Title cannot be empty.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Campaign Brief description cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await updateCampaignDetailsAction({
      campaignId: campaign.id,
      title: title.trim(),
      description: description.trim(),
      requirements: {
        ...(campaign.requirements || {}),
        creative_text_copy: creativeCopy.trim(),
        google_drive_url: driveUrl.trim(),
        google_doc_url: docUrl.trim(),
      },
    });

    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to update campaign.');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-display text-base font-extrabold text-kpugi-ink">Edit Campaign Details</h3>
            <p className="text-xs text-kpugi-slate mt-0.5">
              Update creative guidelines, copy, and briefing text for creators.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Campaign Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
              placeholder="Campaign Title"
              required
            />
          </div>

          {/* Brief Description with AI Polish */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Brief Description *</label>
              <button
                type="button"
                onClick={handleAiExpandBrief}
                disabled={isAiLoading}
                className="text-[10px] font-bold text-kpugi-blue hover:text-indigo-700 flex items-center gap-1 bg-kpugi-paper px-2 py-0.5 rounded-md border border-kpugi-border"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{isAiLoading ? 'AI Polishing...' : 'Polish with AI'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
              placeholder="Brief description for creators..."
              required
            />
          </div>

          {/* Creative Text Copy */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Approved Caption / Copy Text</label>
            <textarea
              rows={2}
              value={creativeCopy}
              onChange={(e) => setCreativeCopy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
              placeholder="Ready-to-post caption for creators..."
            />
          </div>

          {/* Asset URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Google Drive Folder URL</label>
              <input
                type="url"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-800 text-[11px]"
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Google Doc Brief URL</label>
              <input
                type="url"
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-800 text-[11px]"
                placeholder="https://docs.google.com/..."
              />
            </div>
          </div>

          {/* Footer Action Bar & Error Message */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-kpugi-blue hover:bg-indigo-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSubmitting ? 'Saving Changes...' : 'Save Details'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
