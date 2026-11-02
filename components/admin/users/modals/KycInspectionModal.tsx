'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/admin/components/ui/modal';
import Button from '@/components/admin/components/ui/button/Button';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  CreditCard,
  AlertCircle,
  ExternalLink,
  RefreshCw,
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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[720px] p-6 sm:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                KpugiSync Identity Inspection
              </h3>
              <p className="text-xs text-gray-500">
                {data ? `${data.fullName} (${data.email})` : 'Loading submission...'}
              </p>
            </div>
          </div>
          {data && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
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

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
            <p className="text-xs text-gray-500">Loading encrypted verification assets...</p>
          </div>
        ) : errorMsg && !data ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 text-xs">
            {errorMsg}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payout Bank vs ID Name Cross-Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-emerald-500" />
                  Payout Bank Account
                </span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {data?.bankAccount?.accountName || 'No account linked'}
                </p>
                <p className="text-xs text-gray-500">
                  {data?.bankAccount?.bankName} ({data?.bankAccount?.accountNumber})
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3 h-3 text-brand-500" />
                  AI Extracted Name
                </span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {data?.submission?.extractedName || 'Name not legible'}
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Match Score: {data?.submission?.matchScore ?? 0}%
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    Face: {data?.submission?.faceConfidence ?? 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Document & Selfie Image Viewers */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Encrypted Verification Assets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID Front */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-gray-500">
                    Government ID ({data?.submission?.documentType || 'Card'})
                  </span>
                  {data?.idSignedUrl ? (
                    <a
                      href={data.idSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-black/5 aspect-4/3"
                    >
                      <img
                        src={data.idSignedUrl}
                        alt="Government ID"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                        <ExternalLink className="w-4 h-4" />
                        <span>View Full ID</span>
                      </div>
                    </a>
                  ) : (
                    <div className="p-8 rounded-2xl bg-gray-100 dark:bg-white/5 border border-dashed border-gray-200 text-center text-xs text-gray-400">
                      No document image on file
                    </div>
                  )}
                </div>

                {/* Live Selfie */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-gray-500">Live Selfie Photo</span>
                  {data?.selfieSignedUrl ? (
                    <a
                      href={data.selfieSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-black/5 aspect-4/3"
                    >
                      <img
                        src={data.selfieSignedUrl}
                        alt="Live Selfie"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                        <ExternalLink className="w-4 h-4" />
                        <span>View Full Selfie</span>
                      </div>
                    </a>
                  ) : (
                    <div className="p-8 rounded-2xl bg-gray-100 dark:bg-white/5 border border-dashed border-gray-200 text-center text-xs text-gray-400">
                      No selfie image on file
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message if action fails */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Reject Form Drawer */}
            {rejecting ? (
              <form onSubmit={handleReject} className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 space-y-3">
                <label className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  Rejection Reason (will be shown to creator):
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Name on ID does not match your payout bank account. Please upload your valid government ID."
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
                    disabled={actionLoading || rejectReason.length < 5}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                  </Button>
                </div>
              </form>
            ) : (
              /* Decision Actions */
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={actionLoading}
                >
                  Close
                </Button>

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
                    <span>{actionLoading ? 'Approving...' : 'Approve Verification'}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
