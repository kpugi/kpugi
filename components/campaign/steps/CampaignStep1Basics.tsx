'use client';

import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  AlertCircle,
  Calculator,
  Eye,
  MousePointerClick,
  ShoppingBag,
  Smartphone,
  Calendar,
  Loader2,
} from 'lucide-react';
import { generateAICampaignPolishAction } from '@/app/actions/campaign';

interface Step1Props {
  formData: any;
  updateFormData: (fields: Partial<any>) => void;
}

export function CampaignStep1Basics({ formData, updateFormData }: Step1Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const cpmRate = Number(formData.cpm_rate || 2000);
  const minThreshold = Number(formData.min_view_threshold || 1000);
  const totalBudget = Number(formData.total_budget || 100000);

  const baseReserve = Math.round((minThreshold / 1000) * cpmRate);
  const creatorSlots = cpmRate > 0 ? Math.floor(totalBudget / cpmRate) : 0;
  const potentialViews = cpmRate > 0 ? Math.floor((totalBudget / cpmRate) * 1000) : 0;

  // Speech-to-Text Voice Recording via Deepgram API
  const startRecording = async () => {
    try {
      setAiError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setIsTranscribing(true);

        try {
          const res = await fetch('/api/ai/deepgram-stt', {
            method: 'POST',
            headers: { 'Content-Type': 'audio/webm' },
            body: audioBlob,
          });

          const data = await res.json();
          setIsTranscribing(false);

          if (data.transcript) {
            const currentDesc = formData.description || '';
            const combined = currentDesc
              ? `${currentDesc} ${data.transcript}`.trim()
              : data.transcript;
            updateFormData({
              description: combined.slice(0, 500),
            });
          } else if (data.error) {
            setAiError(data.error);
          }
        } catch (err) {
          setIsTranscribing(false);
          setAiError('Failed to process audio narration.');
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      setAiError('Microphone access denied or unsupported.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // AI Prompt Polish for Title or Description (Requires Campaign Title & Goal context)
  const handleAiPolish = async (targetField: 'title' | 'description') => {
    setAiError('');

    if (targetField === 'description') {
      if (!formData.title || !formData.title.trim()) {
        setAiError('Please enter a Campaign Title first so AI has context to generate your brief.');
        return;
      }

      if (!formData.objective) {
        setAiError('Please select a Primary Goal for your campaign first.');
        return;
      }

      const promptContext = `Campaign Title: ${formData.title.trim()}\nPrimary Goal: ${
        formData.objective
      }\nUser Draft / Voice Notes: ${formData.description || 'No draft provided'}`;

      setIsAiLoading(true);
      const res = await generateAICampaignPolishAction(promptContext, 'description');
      setIsAiLoading(false);

      if (res.success && res.text) {
        updateFormData({ description: res.text.slice(0, 500) });
      } else {
        setAiError(res.error || 'AI generation failed');
      }
      return;
    }

    // Title polish mode
    if (!formData.title && !formData.description) {
      setAiError('Please enter a topic or narrate with voice first to generate an AI title.');
      return;
    }

    const promptContext = formData.title || formData.description || '';
    setIsAiLoading(true);
    const res = await generateAICampaignPolishAction(promptContext, 'title');
    setIsAiLoading(false);

    if (res.success && res.text) {
      updateFormData({ title: res.text.slice(0, 100) });
    } else {
      setAiError(res.error || 'AI generation failed');
    }
  };

  const primaryGoals = [
    {
      id: 'Brand Awareness',
      title: 'Brand Awareness',
      desc: 'Maximize reach and impressions to introduce your brand.',
      icon: Eye,
    },
    {
      id: 'Lead Generation',
      title: 'Lead Generation',
      desc: 'Drive clicks and form submissions for targeted offers.',
      icon: MousePointerClick,
    },
    {
      id: 'Sales & Conversions',
      title: 'Direct Sales',
      desc: 'Optimize for immediate conversions and ROI.',
      icon: ShoppingBag,
    },
    {
      id: 'App Downloads',
      title: 'App Downloads',
      desc: 'Drive installs and active users for your mobile app.',
      icon: Smartphone,
    },
    {
      id: 'Event Promotion',
      title: 'Event Promotion',
      desc: 'Build hype and ticket sales for your upcoming event.',
      icon: Calendar,
    },
  ];

  const currentDescLength = (formData.description || '').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="font-display text-xl font-bold text-kpugi-ink">
          Step 1: Campaign Basics & AI Briefing
        </h2>
        <p className="text-xs text-kpugi-slate mt-0.5">
          Define core campaign goals, voice prompt narration, budget, and CPM payout rates.
        </p>
      </div>

      {aiError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {/* Campaign Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-kpugi-ink">Campaign Title *</label>
          <button
            type="button"
            disabled={isAiLoading || isTranscribing}
            onClick={() => handleAiPolish('title')}
            className="text-[11px] font-bold text-kpugi-blue hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>✨ AI Title Polish</span>
          </button>
        </div>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="e.g. Kpugi Summer Product Launch 2026"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-kpugi-blue focus:border-transparent outline-none font-medium"
        />
      </div>

      {/* Primary Goal / Campaign Objective */}
      <div className="space-y-3 p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
        <div>
          <h3 className="font-display text-base font-extrabold text-kpugi-ink">Primary Goal</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select the main objective for this campaign to optimize delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {primaryGoals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = (formData.objective || 'Brand Awareness') === goal.id;

            return (
              <div
                key={goal.id}
                onClick={() => updateFormData({ objective: goal.id })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-blue-50/40 border-blue-600 ring-1 ring-blue-600 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100/70 text-blue-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900">{goal.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{goal.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign Description & Briefing with Max Characters & Clear Loading State */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-kpugi-ink">Campaign Briefing & Description *</label>

          <div className="flex items-center gap-2">
            {/* Deepgram Voice Narration Mic Button with Clear Loading & Recording UX */}
            <button
              type="button"
              disabled={isTranscribing}
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs font-bold transition-all shadow-sm ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : isTranscribing
                  ? 'bg-kpugi-blue/10 text-kpugi-blue cursor-wait'
                  : 'bg-kpugi-blue/10 text-kpugi-blue hover:bg-kpugi-blue/20'
              }`}
            >
              {isTranscribing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-kpugi-blue" />
              ) : isRecording ? (
                <MicOff className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5" />
              )}
              <span>
                {isTranscribing
                  ? 'Transcribing Audio...'
                  : isRecording
                  ? 'Recording... Stop & Insert'
                  : 'Narrate with Voice'}
              </span>
            </button>

            {/* AI Expand Brief Button using Title + Goal + Description Context */}
            <button
              type="button"
              disabled={isAiLoading || isTranscribing}
              onClick={() => handleAiPolish('description')}
              className="text-[11px] font-bold text-kpugi-blue hover:underline flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 disabled:opacity-50"
            >
              {isAiLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>{isAiLoading ? 'Generating Brief...' : '✨ AI Expand Brief'}</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={5}
            maxLength={500}
            value={formData.description || ''}
            onChange={(e) => updateFormData({ description: e.target.value.slice(0, 500) })}
            placeholder={
              isTranscribing
                ? 'Transcribing your voice narration with Deepgram...'
                : isAiLoading
                ? 'NVIDIA NIM AI is crafting your creator briefing...'
                : 'Explain your product, campaign goals, key selling points, and target audience for creators...'
            }
            className={`w-full px-4 py-3 rounded-xl border text-xs focus:ring-2 focus:ring-kpugi-blue focus:border-transparent outline-none font-medium leading-relaxed transition-all ${
              isTranscribing || isAiLoading
                ? 'border-blue-300 bg-blue-50/20 text-slate-700'
                : 'border-slate-200'
            }`}
          />

          {(isTranscribing || isAiLoading) && (
            <div className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center gap-2 backdrop-blur-[1px]">
              <Loader2 className="w-4 h-4 animate-spin text-kpugi-blue" />
              <span className="text-xs font-bold text-kpugi-ink">
                {isTranscribing ? 'Transcribing voice audio...' : 'AI enhancing creator brief...'}
              </span>
            </div>
          )}
        </div>

        {/* Character Limit Counter */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Concise briefing for creators (max 500 characters)</span>
          <span className={currentDescLength >= 480 ? 'text-amber-600 font-bold' : ''}>
            {currentDescLength} / 500
          </span>
        </div>
      </div>

      {/* Financials & Budget Math Card */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span className="font-display font-bold text-sm">CPM Budget & Slot Calculator</span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
            Escrow Backed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Budget */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">Total Campaign Budget (₦) *</label>
            <input
              type="number"
              min={10000}
              step={5000}
              value={formData.total_budget || 100000}
              onChange={(e) => updateFormData({ total_budget: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white font-mono text-sm font-bold focus:ring-2 focus:ring-kpugi-blue outline-none"
            />
          </div>

          {/* CPM Payout Rate */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">CPM Rate (₦ per 1,000 views) *</label>
            <input
              type="number"
              min={1000}
              step={500}
              value={formData.cpm_rate || 2000}
              onChange={(e) => updateFormData({ cpm_rate: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white font-mono text-sm font-bold focus:ring-2 focus:ring-kpugi-blue outline-none"
            />
          </div>

          {/* Minimum View Floor */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">Min View Floor (Threshold) *</label>
            <input
              type="number"
              min={500}
              step={500}
              value={formData.min_view_threshold || 1000}
              onChange={(e) => updateFormData({ min_view_threshold: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white font-mono text-sm font-bold focus:ring-2 focus:ring-kpugi-blue outline-none"
            />
          </div>
        </div>

        {/* Calculated Stats Banner */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center text-xs font-mono">
          <div className="p-2 rounded bg-white/5">
            <div className="text-[10px] text-slate-400">Slots Created</div>
            <div className="font-bold text-amber-400 text-sm mt-0.5">{creatorSlots} Slots</div>
          </div>
          <div className="p-2 rounded bg-white/5">
            <div className="text-[10px] text-slate-400">View Cap Potential</div>
            <div className="font-bold text-emerald-400 text-sm mt-0.5">
              {potentialViews.toLocaleString()} Views
            </div>
          </div>
          <div className="p-2 rounded bg-white/5">
            <div className="text-[10px] text-slate-400">Base Reserve / Slot</div>
            <div className="font-bold text-blue-300 text-sm mt-0.5">₦{baseReserve.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
