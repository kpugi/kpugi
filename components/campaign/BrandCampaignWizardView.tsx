'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, ArrowLeft, AlertCircle, Save, Loader2, Rocket, Lock } from 'lucide-react';
import { CampaignStep1Basics } from './steps/CampaignStep1Basics';
import { CampaignStep2Creatives } from './steps/CampaignStep2Creatives';
import { CampaignStep3Targeting } from './steps/CampaignStep3Targeting';
import { CampaignStep4Payment } from './steps/CampaignStep4Payment';
import { CampaignStep5Launch } from './steps/CampaignStep5Launch';
import { CampaignReceiptModal } from './CampaignReceiptModal';
import { createCampaignWizardAction, saveCampaignDraftAction } from '@/app/actions/campaign';

interface BrandCampaignWizardViewProps {
  walletBalance?: number;
}

export function BrandCampaignWizardView({ walletBalance = 0 }: BrandCampaignWizardViewProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [createdCampaignId, setCreatedCampaignId] = useState<string>('');

  // Payment State
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [verifiedPaymentRef, setVerifiedPaymentRef] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    objective: 'Brand Awareness',
    description: '',
    cover_image_url: '',
    voice_transcript: '',
    cpm_rate: 2000,
    min_view_threshold: 1000,
    total_budget: 100000,
    required_live_duration_hours: 72,
    ad_format: 'Video Asset',
    channels: ['TikTok', 'Instagram'],
    is_featured: false,
    payment_method: 'wallet' as 'wallet' | 'paystack',
    paystack_reference: '',
    requirements: {
      creative_text_copy: '',
      google_drive_url: '',
      google_doc_url: '',
      target_niche: ['Lifestyle', 'Tech & Innovation'],
      min_followers: 1000,
      hashtags: ['#KpugiLaunch'],
      mentions: ['@KpugiApp'],
    },
  });

  const updateFormData = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
      requirements: {
        ...prev.requirements,
        ...(fields.requirements || {}),
      },
    }));
  };

  const steps = [
    { number: 1, title: 'Basics' },
    { number: 2, title: 'Requirements' },
    { number: 3, title: 'Targeting' },
    { number: 4, title: 'Payment' },
    { number: 5, title: 'Publish' },
  ];

  const validateCurrentStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setErrorMessage('Please enter a campaign title.');
        return false;
      }
      if (!formData.description.trim()) {
        setErrorMessage('Please enter a brief or record a voice narration.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.requirements?.creative_text_copy?.trim()) {
        setErrorMessage('Please enter the ready-to-post caption / text copy.');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.channels || formData.channels.length === 0) {
        setErrorMessage('Please select at least 1 target social network.');
        return false;
      }
    }
    return true;
  };

  const isCurrentStepValid = () => {
    if (currentStep === 1) {
      return Boolean(formData.title?.trim() && formData.description?.trim());
    }
    if (currentStep === 2) {
      return Boolean(formData.requirements?.creative_text_copy?.trim());
    }
    if (currentStep === 3) {
      return Boolean(formData.channels && formData.channels.length > 0);
    }
    if (currentStep === 4) {
      return Boolean(
        formData.title?.trim() &&
        formData.description?.trim() &&
        formData.requirements?.creative_text_copy?.trim() &&
        formData.channels &&
        formData.channels.length > 0
      );
    }
    if (currentStep === 5) {
      return isPaymentCompleted;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDraft = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsDrafting(true);

    const res = await saveCampaignDraftAction(formData);
    setIsDrafting(false);

    if (res.success && res.campaignId) {
      setFormData((prev) => ({ ...prev, id: res.campaignId! }));
      setSuccessMessage('Draft saved successfully! You can resume editing anytime.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } else {
      setErrorMessage(res.error || 'Failed to save draft.');
    }
  };

  // Helper to load Paystack InlineJS script dynamically
  const loadPaystackScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).PaystackPop) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Step 4 Action: Process Payment (Wallet or Paystack) and Advance to Step 5 (Publish)
  const handleExecutePaymentStep4 = async () => {
    setErrorMessage('');
    const totalPayableAmount = Number(formData.total_budget || 100000) + (formData.is_featured ? 2500 : 0);
    const method = formData.payment_method || 'wallet';

    if (method === 'wallet') {
      if (walletBalance < totalPayableAmount) {
        setErrorMessage(
          `Insufficient escrow wallet balance (Available: ₦${walletBalance.toLocaleString()}). Please top up your wallet or select Instant Card & Bank Transfer.`
        );
        return;
      }

      const walletRef = `WALLET-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setVerifiedPaymentRef(walletRef);
      setIsPaymentCompleted(true);
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Paystack Instant Checkout
    setIsSubmitting(true);
    const scriptLoaded = await loadPaystackScript();
    setIsSubmitting(false);

    if (!scriptLoaded || !(window as any).PaystackPop) {
      setErrorMessage('Could not load Paystack checkout script. Please check your internet connection.');
      return;
    }

    const publicKey =
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_3630914972cbf0ef4986fc0ae2181d38a94f9412';

    const paystackRef = `KPG_PAY_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const handler = (window as any).PaystackPop.setup({
      key: publicKey,
      email: 'advertiser@kpugi.com',
      amount: totalPayableAmount * 100, // in kobo
      currency: 'NGN',
      ref: paystackRef,
      callback: (response: any) => {
        const ref = response.reference || paystackRef;
        setFormData((prev) => ({
          ...prev,
          paystack_reference: ref,
        }));
        setVerifiedPaymentRef(ref);
        setIsPaymentCompleted(true);
        setCurrentStep(5);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onClose: () => {
        setErrorMessage('Paystack checkout was closed or cancelled.');
      },
    });

    handler.openIframe();
  };

  // Step 5 Action: Final Campaign Publish & Dispatch Creator Notifications
  const handleFinalPublishStep5 = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await createCampaignWizardAction({
      id: formData.id || undefined,
      title: formData.title,
      description: formData.description,
      cover_image_url: formData.cover_image_url,
      ad_format: formData.ad_format,
      cpm_rate: formData.cpm_rate,
      total_budget: formData.total_budget,
      min_view_threshold: formData.min_view_threshold,
      required_live_duration_hours: formData.required_live_duration_hours,
      channels: formData.channels,
      is_featured: formData.is_featured,
      payment_method: formData.payment_method,
      paystack_reference: verifiedPaymentRef,
      requirements: formData.requirements,
    });

    setIsSubmitting(false);

    if (res.success && res.campaignId) {
      setCreatedCampaignId(res.campaignId);
      if (res.receipt) {
        setActiveReceipt(res.receipt);
      } else {
        router.push(`/b/campaigns/${res.campaignId}`);
      }
    } else {
      setErrorMessage(res.error || 'Failed to publish campaign.');
    }
  };

  const totalPayableAmount = Number(formData.total_budget || 100000) + (formData.is_featured ? 2500 : 0);
  const isValid = isCurrentStepValid();

  return (
    <div className="min-h-screen bg-[#f4f3ff] py-6 sm:py-8 px-4 sm:px-8 font-sans relative">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        
        {/* Stepper Progress Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 my-4">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.number || (step.number === 4 && isPaymentCompleted);
            const isCurrent = currentStep === step.number;

            return (
              <React.Fragment key={step.number}>
                <div
                  className="flex flex-col items-center gap-1.5 cursor-pointer"
                  onClick={() => {
                    if (step.number < currentStep) setCurrentStep(step.number);
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      isCurrent
                        ? 'bg-[#4338ca] text-white shadow-md ring-4 ring-[#4338ca]/15'
                        : isCompleted
                        ? 'bg-[#4338ca] text-white'
                        : 'bg-[#e9e8fa] text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-[#4338ca]' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`h-[2px] w-8 sm:w-16 mb-5 transition-all ${
                      currentStep > step.number ? 'bg-[#4338ca]' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Main Card Container */}
        <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-[#e8e6fd] space-y-8">
          {currentStep === 1 && (
            <CampaignStep1Basics
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onSaveDraft={handleSaveDraft}
              isDrafting={isDrafting}
            />
          )}
          {currentStep === 2 && (
            <CampaignStep2Creatives formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <CampaignStep3Targeting formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <CampaignStep4Payment
              formData={formData}
              updateFormData={updateFormData}
              walletBalance={walletBalance}
              isSubmitting={isSubmitting}
              onInitiatePayment={handleExecutePaymentStep4}
            />
          )}
          {currentStep === 5 && (
            <CampaignStep5Launch
              formData={formData}
              paymentRef={verifiedPaymentRef}
              paymentMethod={formData.payment_method}
              isPublishing={isSubmitting}
              onConfirmLaunch={handleFinalPublishStep5}
            />
          )}

          {/* Action Bar Section: Error & Success Messages Render Directly Above Buttons */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            {errorMessage && (
              <div className="w-full p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between gap-2 animate-fadeIn shadow-2xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-red-500 hover:text-red-700 font-bold text-base"
                >
                  ×
                </button>
              </div>
            )}

            {successMessage && (
              <div className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between gap-2 animate-fadeIn shadow-2xs">
                <div className="flex items-center gap-2 font-bold">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage('')}
                  className="text-emerald-600 hover:text-emerald-800 font-bold text-base"
                >
                  ×
                </button>
              </div>
            )}

            {/* Centered Action Navigation Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 rounded-full border border-slate-300 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                disabled={isDrafting}
                onClick={handleSaveDraft}
                className="px-7 py-3 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold transition-all flex items-center gap-2 shadow-2xs disabled:opacity-50"
              >
                {isDrafting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#4338ca]" />
                ) : (
                  <Save className="w-4 h-4 text-slate-600" />
                )}
                <span>{isDrafting ? 'Saving Draft...' : 'Save Draft'}</span>
              </button>

              {currentStep < 4 && (
                <button
                  type="button"
                  disabled={!isValid}
                  onClick={handleNext}
                  className="px-8 py-3 rounded-full bg-[#4338ca] hover:bg-[#3730a3] text-white text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#4338ca]"
                >
                  <span>Continue to {steps[currentStep]?.title || 'Next Step'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {currentStep === 4 && (
                <button
                  type="button"
                  disabled={isSubmitting || !isValid}
                  onClick={handleExecutePaymentStep4}
                  className="px-8 py-3.5 rounded-full bg-[#4338ca] hover:bg-[#3730a3] text-white text-sm font-extrabold transition-all shadow-lg hover:shadow-xl flex items-center gap-2.5 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#4338ca]"
                >
                  <Lock className="w-4.5 h-4.5 text-amber-300" />
                  <span>
                    {isSubmitting
                      ? 'Processing Payment...'
                      : `Pay ₦${totalPayableAmount.toLocaleString()} & Proceed to Step 5`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Floating Fixed Toast Notification (Ensures 100% visibility anywhere on screen) */}
        {(errorMessage || successMessage) && (
          <div className="fixed bottom-6 right-6 z-[9999] max-w-md animate-fadeIn">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-900 text-white border border-red-700 shadow-2xl text-xs font-medium flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-300" />
                <span className="flex-1">{errorMessage}</span>
                <button onClick={() => setErrorMessage('')} className="font-bold text-slate-300 hover:text-white">
                  ✕
                </button>
              </div>
            )}

            {successMessage && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-medium flex items-center gap-3">
                <Check className="w-5 h-5 shrink-0 text-emerald-400" />
                <span className="flex-1 font-bold">{successMessage}</span>
                <button onClick={() => setSuccessMessage('')} className="font-bold text-slate-300 hover:text-white">
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* Printable Receipt Modal */}
        {activeReceipt && (
          <CampaignReceiptModal
            receipt={activeReceipt}
            campaignId={createdCampaignId}
            campaignTitle={formData.title || 'Ad Campaign'}
            onClose={() => setActiveReceipt(null)}
          />
        )}
      </div>
    </div>
  );
}
