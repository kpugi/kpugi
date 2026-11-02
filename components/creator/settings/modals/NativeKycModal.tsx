'use client';

import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  UploadCloud,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  User,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NativeKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccountName: string;
  bankName: string;
  accountNumber: string;
  onSuccess: (newStatus: 'verified' | 'pending') => void;
}

export default function NativeKycModal({
  isOpen,
  onClose,
  bankAccountName,
  bankName,
  accountNumber,
  onSuccess,
}: NativeKycModalProps) {
  const [docType, setDocType] = useState<string>('nin_slip');
  const [idNumber, setIdNumber] = useState<string>('');

  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);

  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<string>('Encrypting documents...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<'verified' | 'pending' | null>(null);
  const [resultMessage, setResultMessage] = useState<string>('');

  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleIdFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('ID file size must be less than 10MB.');
        return;
      }
      setIdFile(file);
      setIdPreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleSelfieFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Selfie file size must be less than 10MB.');
        return;
      }
      setSelfieFile(file);
      setSelfiePreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile || !selfieFile) {
      setErrorMessage('Please upload both your Government ID photo and a live Selfie.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSubmitPhase('Encrypting & uploading documents...');

    try {
      const formData = new FormData();
      formData.append('id_image', idFile);
      formData.append('selfie', selfieFile);
      formData.append('document_type', docType);
      formData.append('id_number', idNumber);

      // Rotate progress messages for feedback
      const progressTimer = setTimeout(() => {
        setSubmitPhase('Analyzing document & face biometrics with KpugiSync AI...');
      }, 1800);

      const crossCheckTimer = setTimeout(() => {
        setSubmitPhase(`Cross-referencing with payout name: ${bankAccountName}...`);
      }, 3800);

      const res = await fetch('/api/kyc/native/submit', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(progressTimer);
      clearTimeout(crossCheckTimer);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Identity verification failed.');
      }

      const status = data.status as 'verified' | 'pending';
      setResultStatus(status);
      setResultMessage(data.message || 'Verification submitted.');

      if (status === 'verified') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Auto close and notify parent after short celebration
      setTimeout(() => {
        onSuccess(status);
        onClose();
      }, status === 'verified' ? 2400 : 3000);
    } catch (err: any) {
      console.error('[KpugiSync Submit Error]:', err);
      setErrorMessage(err.message || 'Something went wrong during verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-kpugi-blue/10 dark:bg-kpugi-blue/20 flex items-center justify-center text-kpugi-blue">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  KpugiSync Verification
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-kpugi-blue dark:text-blue-300">
                  INSTANT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                1-minute automated identity check to unlock earnings payouts
              </p>
            </div>
          </div>
          {!submitting && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Payout Name Info Card */}
          <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-500/20 text-xs">
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-kpugi-blue shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-blue-950 dark:text-blue-200">
                  Payout Verification Match Target:
                </span>
                <p className="text-kpugi-blue dark:text-blue-300 font-bold text-sm tracking-wide mt-0.5">
                  {bankAccountName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {bankName} (•••{accountNumber.slice(-4)}) — The name on your uploaded ID should match this account.
                </p>
              </div>
            </div>
          </div>

          {resultStatus ? (
            <div className="py-8 text-center space-y-3">
              {resultStatus === 'verified' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Identity Verified! 🎉
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                    {resultMessage}
                  </p>
                  <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 pt-2">
                    Instant withdrawals are now active on your account.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                    <ShieldCheck className="w-9 h-9" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Submission Under Review ⏳
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                    {resultMessage}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2">
                    Our compliance team is verifying your submission. Your dashboard will update shortly.
                  </p>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Step 1: Document Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-kpugi-blue" />
                  <span>Select Government Document Type</span>
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-kpugi-blue transition-all"
                >
                  <option value="nin_slip">National Identification Number (NIN Slip)</option>
                  <option value="nin_card">NIN Plastic Smart Card</option>
                  <option value="voters_card">Permanent Voter's Card (PVC)</option>
                  <option value="drivers_license">Driver's License (FRSC)</option>
                  <option value="passport">International Passport</option>
                </select>
              </div>

              {/* Step 2: Document / ID Number (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Document Number</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 11-digit NIN or Passport Number"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-kpugi-blue transition-all"
                />
              </div>

              {/* Step 3: Upload Front of ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-kpugi-blue" />
                  <span>Upload Front of ID Card / Slip</span>
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  ref={idInputRef}
                  onChange={handleIdFileSelect}
                  className="hidden"
                />

                {idPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900/5 group">
                    <img
                      src={idPreview}
                      alt="ID Preview"
                      className="w-full h-36 object-contain bg-black/40"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button
                        type="button"
                        onClick={() => idInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs shadow-md"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => idInputRef.current?.click()}
                    disabled={submitting}
                    className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-white/15 rounded-2xl hover:border-kpugi-blue/60 dark:hover:border-kpugi-blue/60 transition-all flex flex-col items-center justify-center gap-1.5 bg-slate-50/50 dark:bg-white/[0.02]"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Snap or upload photo of your ID
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PNG, JPG up to 10MB • All 4 corners visible
                    </span>
                  </button>
                )}
              </div>

              {/* Step 4: Quick Selfie */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-kpugi-blue" />
                  <span>Take a Quick Selfie</span>
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="user"
                  ref={selfieInputRef}
                  onChange={handleSelfieFileSelect}
                  className="hidden"
                />

                {selfiePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900/5 group flex items-center justify-center">
                    <img
                      src={selfiePreview}
                      alt="Selfie Preview"
                      className="w-32 h-32 rounded-full object-cover border-2 border-kpugi-blue my-2 shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                      <button
                        type="button"
                        onClick={() => selfieInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs shadow-md"
                      >
                        Retake Selfie
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => selfieInputRef.current?.click()}
                    disabled={submitting}
                    className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-white/15 rounded-2xl hover:border-kpugi-blue/60 dark:hover:border-kpugi-blue/60 transition-all flex flex-col items-center justify-center gap-1.5 bg-slate-50/50 dark:bg-white/[0.02]"
                  >
                    <Camera className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Take front camera selfie
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Good lighting • No hats or sunglasses
                    </span>
                  </button>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || !idFile || !selfieFile}
                className="w-full py-3.5 rounded-xl bg-kpugi-blue hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-kpugi-blue/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{submitPhase}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span>Verify & Match Identity with KpugiSync</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
