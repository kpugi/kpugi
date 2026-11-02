'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/admin/components/ui/modal';
import Button from '@/components/admin/components/ui/button/Button';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  CreditCard,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  X,
  Eye,
} from 'lucide-react';
import {
  getCreatorKycInspection,
  approveKpugiSyncSubmission,
  rejectKpugiSyncSubmission,
  KycInspectionData,
} from '@/app/actions/admin-kyc';

interface KycInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string | null;
  onSuccess?: () => void;
}

export default function KycInspectionModal({
  isOpen,
  onClose,
  creatorId,
  onSuccess,
}: KycInspectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KycInspectionData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (isOpen && creatorId) {
      setLoading(true);
      setErrorMsg(null);
      setRejecting(false);
      setRejectReason('');

      getCreatorKycInspection(creatorId)
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          setErrorMsg(err.message || 'Failed to fetch KYC inspection data.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, creatorId]);

  if (!isOpen || !creatorId) return null;

  const handleApprove = async () => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      await approveKpugiSyncSubmission(creatorId);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      setErrorMsg('Rejection reason must be at least 5 characters.');
      return;
    }

    setActionLoading(true);
    setErrorMsg(null);
    try {
      await rejectKpugiSyncSubmission(creatorId, rejectReason.trim());
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-3xl w-full max-h-[88vh] flex flex-col p-0 overflow-hidden my-auto rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900"
    >
      {/* 1. Sticky Header */}
      <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-gray-900 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                KpugiSync Identity Inspection
              </h3>
              {data && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                    data.kycStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : data.kycStatus === 'pending'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {data.kycStatus}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {data ? `${data.fullName} (${data.email})` : 'Loading creator submission...'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shrink-0 ml-2"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
          <p className="text-xs text-gray-500">Decrypting & verifying identity assets...</p>
        </div>
      ) : errorMsg && !data ? (
        <div className="p-6 text-center space-y-3">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs inline-block">
            {errorMsg}
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Compact Cross-Reference Banner (Sticky under header) */}
          <div className="shrink-0 px-5 sm:px-6 py-3 bg-gray-50/70 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Bank Account (Source of Truth) */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Payout Bank Account (Source of Truth)
                </span>
                <p className="font-bold text-gray-900 dark:text-white truncate text-sm">
                  {data?.bankAccount?.accountName || 'No account linked'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {data?.bankAccount?.bankName} ({data?.bankAccount?.accountNumber})
                </p>
              </div>
            </div>

            {/* AI Extracted Legal Name & Metrics */}
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    AI Extracted Name from ID
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white truncate text-sm">
                    {data?.submission?.extractedName || 'Name not legible'}
                  </p>
                  {data?.submission?.idNumber && (
                    <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate">
                      ID Number: {data.submission.idNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Match Pills */}
              <div className="text-right shrink-0">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    (data?.submission?.matchScore ?? 0) >= 85
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  Match: {data?.submission?.matchScore ?? 0}%
                </span>
                <span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Face: {data?.submission?.faceConfidence ?? 0}%
                </span>
              </div>
            </div>
          </div>

          {/* 3. Scrollable Inspection Body */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
            {/* Visual Documents Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Government ID */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Government ID ({data?.submission?.documentType || 'Official Document'})
                  </span>
                  {data?.idSignedUrl && (
                    <a
                      href={data.idSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-brand-500 hover:text-brand-600 flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Full Size</span>
                    </a>
                  )}
                </div>

                <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-slate-950/5 dark:bg-black/30 h-56 sm:h-64 flex items-center justify-center overflow-hidden group">
                  {data?.idSignedUrl ? (
                    <a
                      href={data.idSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full flex items-center justify-center p-2 cursor-zoom-in"
                    >
                      <img
                        src={data.idSignedUrl}
                        alt="Government ID"
                        className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-200 group-hover:scale-102"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>Click to view original</span>
                      </div>
                    </a>
                  ) : (
                    <div className="text-center p-6 text-xs text-gray-400">
                      No document image on file
                    </div>
                  )}
                </div>
              </div>

              {/* Live Selfie */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Live Selfie Photo
                  </span>
                  {data?.selfieSignedUrl && (
                    <a
                      href={data.selfieSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-brand-500 hover:text-brand-600 flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Full Size</span>
                    </a>
                  )}
                </div>

                <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-slate-950/5 dark:bg-black/30 h-56 sm:h-64 flex items-center justify-center overflow-hidden group">
                  {data?.selfieSignedUrl ? (
                    <a
                      href={data.selfieSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full flex items-center justify-center p-2 cursor-zoom-in"
                    >
                      <img
                        src={data.selfieSignedUrl}
                        alt="Live Selfie"
                        className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-200 group-hover:scale-102"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>Click to view original</span>
                      </div>
                    </a>
                  ) : (
                    <div className="text-center p-6 text-xs text-gray-400">
                      No selfie photo on file
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Summary Reasoning Note */}
            {data?.submission?.reason && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                <span className="font-bold text-gray-800 dark:text-gray-200 shrink-0">
                  AI Verdict:
                </span>
                <span>{data.submission.reason}</span>
              </div>
            )}

            {/* Error Message banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Rejection Drawer */}
            {rejecting && (
              <form
                onSubmit={handleReject}
                className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 space-y-3 animate-in fade-in duration-150"
              >
                <label className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                  Rejection Reason (will be shown to creator):
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Name on ID does not match payout bank account. Please upload your valid government ID."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setRejecting(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    disabled={actionLoading || rejectReason.trim().length < 5}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* 4. Sticky Action Footer */}
          <div className="shrink-0 px-5 sm:px-6 py-3.5 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-gray-900/90 backdrop-blur-md flex items-center justify-between z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={actionLoading}
            >
              Close
            </Button>

            {!rejecting && (
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRejecting(true)}
                  disabled={actionLoading}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Reject with Reason...
                </Button>

                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={actionLoading || data?.kycStatus === 'verified'}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {actionLoading
                      ? 'Approving...'
                      : data?.kycStatus === 'verified'
                      ? 'Already Approved'
                      : 'Approve Verification'}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
