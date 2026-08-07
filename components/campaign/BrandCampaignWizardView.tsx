'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { CampaignStep1Basics } from './steps/CampaignStep1Basics';
import { CampaignStep2Creatives } from './steps/CampaignStep2Creatives';
import { CampaignStep3Targeting } from './steps/CampaignStep3Targeting';
import { CampaignStep4Review } from './steps/CampaignStep4Review';
import { createCampaignWizardAction } from '@/app/actions/campaign';

export function BrandCampaignWizardView() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    objective: 'Brand Awareness',
    description: '',
    voice_transcript: '',
    cpm_rate: 2000,
    min_view_threshold: 1000,
    total_budget: 100000,
    required_live_duration_hours: 72,
    ad_format: 'Dedicated Video',
    channels: ['TikTok', 'Instagram'],
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
    { number: 1, title: 'Basics & AI Briefing' },
    { number: 2, title: 'Creatives & Media' },
    { number: 3, title: 'Targeting & Channels' },
    { number: 4, title: 'Review & Launch' },
  ];

  const validateCurrentStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setErrorMessage('Please enter a campaign title.');
        return false;
      }
      if (!formData.description.trim()) {
        setErrorMessage('Please enter a campaign description/briefing.');
        return false;
      }
      if (formData.total_budget < 10000) {
        setErrorMessage('Minimum campaign total budget is ₦10,000.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.ad_format) {
        setErrorMessage('Please select an ad format.');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.channels || formData.channels.length === 0) {
        setErrorMessage('Please select at least one target social network.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await createCampaignWizardAction({
      title: formData.title,
      description: formData.description,
      ad_format: formData.ad_format,
      cpm_rate: formData.cpm_rate,
      total_budget: formData.total_budget,
      min_view_threshold: formData.min_view_threshold,
      required_live_duration_hours: formData.required_live_duration_hours,
      channels: formData.channels,
      requirements: formData.requirements,
    });

    setIsSubmitting(false);

    if (res.success && res.campaignId) {
      router.push(`/b/campaigns/${res.campaignId}`);
    } else {
      setErrorMessage(res.error || 'Failed to publish campaign.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Stepper Progress Bar */}
      <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {steps.map((step) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <div key={step.number} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-kpugi-blue text-white ring-4 ring-kpugi-blue/10'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Step {step.number}
                  </div>
                  <div
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-kpugi-ink font-extrabold' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Step Content Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm">
        {currentStep === 1 && (
          <CampaignStep1Basics formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 2 && (
          <CampaignStep2Creatives formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 3 && (
          <CampaignStep3Targeting formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 4 && (
          <CampaignStep4Review
            formData={formData}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}

        {/* Navigation Buttons (Steps 1 to 3) */}
        {currentStep < 4 && (
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-kpugi-blue text-white text-xs font-bold hover:bg-kpugi-blue-dark transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Next: {steps[currentStep]?.title || 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
