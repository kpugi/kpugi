'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, AlertCircle, Info, Calculator } from 'lucide-react';
import { generateAICampaignPolishAction } from '@/app/actions/campaign';

interface Step1Props {
  formData: any;
  updateFormData: (fields: Partial<any>) => void;
}

export function CampaignStep1Basics({ formData, updateFormData }: Step1Props) {
  const [isRecording, setIsRecording] = useState(false);
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
        setIsAiLoading(true);

        try {
          const res = await fetch('/api/ai/deepgram-stt', {
            method: 'POST',
            headers: { 'Content-Type': 'audio/webm' },
            body: audioBlob,
          });

          const data = await res.json();
          setIsAiLoading(false);

          if (data.transcript) {
            updateFormData({
              voice_transcript: data.transcript,
              description: formData.description
                ? `${formData.description}\n\n[Voice Narration]: ${data.transcript}`
                : data.transcript,
            });
          } else if (data.error) {
            setAiError(data.error);
          }
        } catch (err) {
          setIsAiLoading(false);
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

  // AI Prompt Polish for Title or Description
  const handleAiPolish = async (targetField: 'title' | 'description') => {
    const textToPolish =
      targetField === 'title' ? formData.title : formData.description || formData.title;

    if (!textToPolish) {
      setAiError('Please enter a topic or voice prompt first.');
      return;
    }

    setIsAiLoading(true);
    setAiError('');

    const res = await generateAICampaignPolishAction(textToPolish, targetField);
    setIsAiLoading(false);

    if (res.success && res.text) {
      updateFormData({ [targetField]: res.text });
    } else {
      setAiError(res.error || 'AI generation failed');
    }
  };

  const objectives = [
    'Brand Awareness',
    'Product Launch',
    'Sales & Conversions',
    'App Downloads',
    'Event Promotion',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-kpugi-ink">
            Step 1: Campaign Basics & AI Briefing
          </h2>
          <p className="text-xs text-kpugi-slate mt-0.5">
            Define core campaign goals, voice prompt narration, budget, and CPM payout rates.
          </p>
        </div>

        {/* Deepgram Voice Narration Mic Button */}
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-sans text-xs font-bold transition-all shadow-sm ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-kpugi-blue/10 text-kpugi-blue hover:bg-kpugi-blue/20'
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isRecording ? 'Stop Voice Narration' : 'Narrate with Voice'}</span>
        </button>
      </div>

      {aiError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {/* Voice Transcript Display */}
      {formData.voice_transcript && (
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-kpugi-blue">
            <Mic className="w-3.5 h-3.5" />
            <span>Deepgram Transcribed Voice Narration</span>
          </div>
          <p className="italic">"{formData.voice_transcript}"</p>
        </div>
      )}

      {/* Campaign Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-kpugi-ink">Campaign Title *</label>
          <button
            type="button"
            disabled={isAiLoading}
            onClick={() => handleAiPolish('title')}
            className="text-[11px] font-bold text-kpugi-blue hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
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

      {/* Campaign Objective */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-kpugi-ink">Campaign Objective *</label>
        <div className="flex flex-wrap gap-2">
          {objectives.map((obj) => (
            <button
              key={obj}
              type="button"
              onClick={() => updateFormData({ objective: obj })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                formData.objective === obj
                  ? 'bg-kpugi-blue text-white border-kpugi-blue shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {obj}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Description & Briefing */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-kpugi-ink">Campaign Briefing & Description *</label>
          <button
            type="button"
            disabled={isAiLoading}
            onClick={() => handleAiPolish('description')}
            className="text-[11px] font-bold text-kpugi-blue hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI Expand Brief</span>
          </button>
        </div>
        <textarea
          rows={4}
          value={formData.description || ''}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Explain your product, campaign goals, key selling points, and target audience for creators..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-kpugi-blue focus:border-transparent outline-none font-medium leading-relaxed"
        />
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

          {/* CPM Rate */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">CPM Payout Rate (₦ / 1k views)</label>
            <input
              type="number"
              min={1000}
              step={500}
              value={formData.cpm_rate || 2000}
              onChange={(e) => updateFormData({ cpm_rate: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white font-mono text-sm font-bold focus:ring-2 focus:ring-kpugi-blue outline-none"
            />
          </div>

          {/* Minimum View Threshold */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">Min View Threshold</label>
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

        {/* Real-time Math Summary */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center font-mono text-xs">
          <div className="bg-white/5 p-2 rounded-lg">
            <div className="text-[10px] text-slate-400">Available Creator Slots</div>
            <div className="text-base font-extrabold text-amber-400">{creatorSlots} Slots</div>
          </div>
          <div className="bg-white/5 p-2 rounded-lg">
            <div className="text-[10px] text-slate-400">Est. Total View Cap</div>
            <div className="text-base font-extrabold text-emerald-400">{potentialViews.toLocaleString()} views</div>
          </div>
          <div className="bg-white/5 p-2 rounded-lg">
            <div className="text-[10px] text-slate-400">Slot Base Reserve</div>
            <div className="text-base font-extrabold text-cyan-400">₦{baseReserve.toLocaleString()} / slot</div>
          </div>
        </div>
      </div>

      {/* Required Live Duration */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-kpugi-ink">
          Required Live Post Duration (Hours)
        </label>
        <select
          value={formData.required_live_duration_hours || 72}
          onChange={(e) => updateFormData({ required_live_duration_hours: Number(e.target.value) })}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-kpugi-blue outline-none"
        >
          <option value={24}>24 Hours (Minimum)</option>
          <option value={48}>48 Hours</option>
          <option value={72}>72 Hours (Recommended)</option>
          <option value={168}>7 Days (Max Exposure)</option>
        </select>
      </div>
    </div>
  );
}
