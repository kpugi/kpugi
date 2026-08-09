'use client';

import React, { useState, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  AlertCircle,
  Eye,
  MousePointerClick,
  ShoppingBag,
  Smartphone,
  Loader2,
  Image as ImageIcon,
  Upload,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { generateAICampaignPolishAction } from '@/app/actions/campaign';

import { optimizeImageFile } from '@/lib/utils/imageOptimizer';

interface Step1Props {
  formData: any;
  updateFormData: (fields: Partial<any>) => void;
  onNext?: () => void;
  onSaveDraft?: () => void;
  isDrafting?: boolean;
}

export function CampaignStep1Basics({
  formData,
  updateFormData,
}: Step1Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [imageError, setImageError] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_SIZE_MB = 10;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.toLowerCase();
    if (!ALLOWED_TYPES.includes(fileType)) {
      setImageError('Invalid image format. Allowed formats: JPG, PNG, WEBP.');
      return;
    }

    try {
      // Compress and resize image in-browser to max 1200px and 82% quality (~100KB-200KB)
      const compressedBase64 = await optimizeImageFile(file, 1200, 1200, 0.82);
      updateFormData({ cover_image_url: compressedBase64 });
    } catch (err) {
      setImageError('Failed to process image. Please try another file.');
    }
  };

  const removeImage = () => {
    setImageError('');
    updateFormData({ cover_image_url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  // AI Prompt Polish
  const handleAiPolish = async (targetField: 'title' | 'description') => {
    setAiError('');

    if (targetField === 'description') {
      if (!formData.title || !formData.title.trim()) {
        setAiError('Please enter a Campaign Title first so AI has context.');
        return;
      }

      const promptContext = `Campaign Title: ${formData.title.trim()}\nPrimary Goal: ${
        formData.objective || 'Brand Awareness'
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

    // Title polish
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
      title: 'Awareness',
      desc: 'Max reach, views & creator impressions.',
      icon: Eye,
    },
    {
      id: 'Lead Generation',
      title: 'Leads',
      desc: 'Form signups, sign-ups & user leads.',
      icon: MousePointerClick,
    },
    {
      id: 'Sales & Conversions',
      title: 'Sales',
      desc: 'Direct product checkout & app orders.',
      icon: ShoppingBag,
    },
    {
      id: 'App Installs',
      title: 'Installs',
      desc: 'App store downloads & active users.',
      icon: Smartphone,
    },
  ];

  const currentDescLength = (formData.description || '').length;

  return (
    <div className="space-y-8 font-sans">
      {/* Title & Subtitle Section */}
      <div className="text-center space-y-2">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Let's start with the basics.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Give your campaign a memorable name and tell us what you're trying to achieve.
        </p>
      </div>

      {/* AI Error Alert */}
      {(aiError || imageError) && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{imageError || aiError}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setAiError('');
              setImageError('');
            }}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Campaign Title Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800">Campaign Title *</label>

          <button
            type="button"
            disabled={isAiLoading || isTranscribing}
            onClick={() => handleAiPolish('title')}
            className="text-[11px] font-bold text-[#4f46e5] bg-[#eeedfd] hover:bg-[#e4e1fd] border border-[#dcd8fc] px-3 py-1 rounded-full transition-all flex items-center gap-1 disabled:opacity-50"
          >
            {isAiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4f46e5]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
            )}
            <span>{isAiLoading ? 'Polishing...' : 'AI Polish'}</span>
          </button>
        </div>

        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => updateFormData({ title: e.target.value.slice(0, 100) })}
          placeholder="e.g. Kpugi Mobile App Launch Nigeria 2026"
          className="w-full px-4 py-3.5 rounded-2xl bg-[#f8f7ff] border border-[#e2e0fb] text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#4338ca] focus:border-transparent outline-none font-medium transition-all"
        />
      </div>

      {/* Rectangular Campaign Cover Banner Upload */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#4338ca]" />
            <span>Campaign Cover Banner (Rectangular 16:9)</span>
          </label>
          <span className="text-[10px] font-mono font-bold text-slate-500 bg-[#f8f7ff] border border-[#e2e0fb] px-2.5 py-0.5 rounded-full">
            JPG, PNG, WEBP (Max 5MB)
          </span>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="hidden"
        />

        {formData.cover_image_url ? (
          <div className="relative w-full aspect-[16/9] max-h-60 rounded-2xl overflow-hidden border border-[#e2e0fb] bg-slate-900 shadow-xs group">
            <img
              src={formData.cover_image_url}
              alt="Campaign Banner Preview"
              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 p-4 flex items-end justify-between">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Banner Uploaded (16:9)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold transition-all shadow-sm backdrop-blur-md"
                >
                  Change Banner
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-sm backdrop-blur-md"
                  title="Remove Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-6 sm:p-8 rounded-2xl bg-[#f8f7ff] border-2 border-dashed border-[#c7d2fe] hover:border-[#4338ca] hover:bg-[#eeedfd] transition-all flex flex-col items-center justify-center text-center cursor-pointer space-y-2.5 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#eeedfd] group-hover:bg-[#4338ca] text-[#4338ca] group-hover:text-white flex items-center justify-center transition-all">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#4338ca] transition-colors">
                Click to upload campaign header banner
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Rectangular landscape format (16:9 recommended) • Max 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Goal Cards Grid */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <h3 className="font-display font-extrabold text-base text-slate-900 text-center">
          What's the main goal?
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {primaryGoals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = (formData.objective || 'Brand Awareness') === goal.id;

            return (
              <div
                key={goal.id}
                onClick={() => updateFormData({ objective: goal.id })}
                className={`p-5 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center space-y-2.5 min-h-[140px] justify-center ${
                  isSelected
                    ? 'bg-[#eeedfd] border-2 border-[#4338ca] text-[#4338ca] shadow-xs'
                    : 'bg-[#f8f7ff] border border-[#e2e0fb] hover:border-slate-300 text-slate-700'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#4338ca] text-white' : 'bg-[#e9e6fd] text-[#4338ca]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-slate-900 leading-tight">
                    {goal.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    {goal.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The Brief (Description & Voice Narration) */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-800">The Brief</label>

          <div className="flex items-center gap-2">
            {/* Deepgram Voice Narration */}
            <button
              type="button"
              disabled={isTranscribing}
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                isRecording
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'bg-[#eeedfd] text-[#4f46e5] border-[#dcd8fc] hover:bg-[#e4e1fd]'
              }`}
            >
              {isTranscribing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-[#4f46e5]" />
              )}
              <span>
                {isTranscribing ? 'Transcribing...' : isRecording ? 'Recording... Stop' : 'Narrate'}
              </span>
            </button>

            {/* AI Expand Brief Button */}
            <button
              type="button"
              disabled={isAiLoading || isTranscribing}
              onClick={() => handleAiPolish('description')}
              className="text-[11px] font-bold text-[#4f46e5] bg-[#eeedfd] hover:bg-[#e4e1fd] border border-[#dcd8fc] px-3 py-1 rounded-full transition-all flex items-center gap-1 disabled:opacity-50"
            >
              {isAiLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4f46e5]" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
              )}
              <span>{isAiLoading ? 'Generating...' : 'AI Expand'}</span>
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
                : 'Explain your product, campaign goals, key selling points, and target audience...'
            }
            className={`w-full px-4 py-3.5 rounded-2xl bg-[#f8f7ff] border border-[#e2e0fb] text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#4338ca] focus:border-transparent outline-none font-medium leading-relaxed transition-all ${
              isTranscribing || isAiLoading ? 'border-[#4338ca] bg-purple-50/20' : ''
            }`}
          />

          {(isTranscribing || isAiLoading) && (
            <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-[1px]">
              <Loader2 className="w-4 h-4 animate-spin text-[#4338ca]" />
              <span className="text-xs font-bold text-slate-800">
                {isTranscribing ? 'Transcribing voice audio...' : 'AI expanding creator brief...'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Concise briefing for creators (max 500 chars)</span>
          <span className={currentDescLength >= 480 ? 'text-amber-600 font-bold' : ''}>
            {currentDescLength} / 500
          </span>
        </div>
      </div>
    </div>
  );
}
