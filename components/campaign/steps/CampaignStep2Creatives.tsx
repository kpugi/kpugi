'use client';

import React, { useState, useRef } from 'react';
import {
  Video,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Plus,
  X,
  Link as LinkIcon,
  Play,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { generateAICampaignPolishAction } from '@/app/actions/campaign';
import { optimizeImageFile } from '@/lib/utils/imageOptimizer';

interface Step2Props {
  formData: any;
  updateFormData: (fields: Partial<any>) => void;
}

export function CampaignStep2Creatives({ formData, updateFormData }: Step2Props) {
  const [tagInput, setTagInput] = useState('');
  const [mentionInput, setMentionInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [videoTab, setVideoTab] = useState<'upload' | 'url'>('upload');
  const [videoUploadError, setVideoUploadError] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const currentFormat = formData.ad_format || 'Video Asset';
  const isVideoFormat = currentFormat.toLowerCase().includes('video');
  const isImageFormat = currentFormat.toLowerCase().includes('image');

  const adFormats = [
    {
      id: 'Video Asset',
      title: 'Video Creative',
      desc: 'Ready-to-post video file for creators to download & publish.',
      icon: Video,
    },
    {
      id: 'Image Banner',
      title: 'Image & Banner',
      desc: 'Ready-to-post photo or graphic banner for creators to grab.',
      icon: ImageIcon,
    },
    {
      id: 'Text Caption',
      title: 'Text Copy & Caption',
      desc: 'Approved post copy, text caption & promo link for creators to post.',
      icon: FileText,
    },
  ];

  const hashtags: string[] = formData.requirements?.hashtags || [
    '#KpugiLaunch',
    `#${(formData.title || 'Brand').replace(/\s+/g, '')}`,
  ];
  const mentions: string[] = formData.requirements?.mentions || ['@KpugiApp'];

  const handleCreativeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await optimizeImageFile(file, 1200, 1200, 0.82);
      updateFormData({
        requirements: {
          ...formData.requirements,
          creative_image_url: compressedBase64,
        },
      });
    } catch (err) {
      setImageUploadError('Failed to process image file.');
    }
  };

  const handleCreativeVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setVideoUploadError('Video file size exceeds 50MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateFormData({
        requirements: {
          ...formData.requirements,
          creative_video_url: base64,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const addHashtag = () => {
    if (!tagInput.trim()) return;
    const formatted = tagInput.startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
    if (!hashtags.includes(formatted)) {
      updateFormData({
        requirements: {
          ...formData.requirements,
          hashtags: [...hashtags, formatted],
        },
      });
    }
    setTagInput('');
  };

  const removeHashtag = (tag: string) => {
    updateFormData({
      requirements: {
        ...formData.requirements,
        hashtags: hashtags.filter((t) => t !== tag),
      },
    });
  };

  const addMention = () => {
    if (!mentionInput.trim()) return;
    const formatted = mentionInput.startsWith('@') ? mentionInput.trim() : `@${mentionInput.trim()}`;
    if (!mentions.includes(formatted)) {
      updateFormData({
        requirements: {
          ...formData.requirements,
          mentions: [...mentions, formatted],
        },
      });
    }
    setMentionInput('');
  };

  const removeMention = (m: string) => {
    updateFormData({
      requirements: {
        ...formData.requirements,
        mentions: mentions.filter((t) => t !== m),
      },
    });
  };

  const handleAiTags = async () => {
    setIsAiLoading(true);
    const res = await generateAICampaignPolishAction(
      `${formData.title} - ${formData.description}`,
      'hashtags'
    );
    setIsAiLoading(false);

    if (res.success && res.text) {
      const generated = res.text
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean);

      const newTags = generated.filter((t: string) => t.startsWith('#'));
      const newMentions = generated.filter((t: string) => t.startsWith('@'));

      updateFormData({
        requirements: {
          ...formData.requirements,
          hashtags: Array.from(new Set([...hashtags, ...newTags])),
          mentions: Array.from(new Set([...mentions, ...newMentions])),
        },
      });
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Title & Subtitle Section - Step 1 Style */}
      <div className="text-center space-y-2">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Let's configure requirements.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Specify ad format, mandatory hashtags, brand mentions, and creative assets for creators.
        </p>
      </div>

      {/* Ad Format Selection Grid (Same as Step 1 Goal Selection) */}
      <div className="space-y-4 pt-2">
        <h3 className="font-display font-extrabold text-base text-slate-900 text-center">
          Select Ad Format
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {adFormats.map((format) => {
            const Icon = format.icon;
            const isSelected = (formData.ad_format || 'Video Asset') === format.id;

            return (
              <div
                key={format.id}
                onClick={() => updateFormData({ ad_format: format.id })}
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
                    {format.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    {format.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          DYNAMIC AD FORMAT CREATIVE ASSET INPUTS
      ───────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        
        {/* CASE 1: VIDEO ASSET */}
        {isVideoFormat && (
          <div className="p-5 rounded-2xl bg-[#f8f7ff] border border-[#e2e0fb] space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-4 h-4 text-[#4338ca]" />
                <span>Video Creative Asset for Creators *</span>
              </label>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#dcd8fc]">
                <button
                  type="button"
                  onClick={() => setVideoTab('upload')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    videoTab === 'upload'
                      ? 'bg-[#4338ca] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setVideoTab('url')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    videoTab === 'url'
                      ? 'bg-[#4338ca] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Video URL / Link
                </button>
              </div>
            </div>

            {videoUploadError && (
              <p className="text-[11px] font-bold text-red-600">{videoUploadError}</p>
            )}

            {videoTab === 'upload' ? (
              <div className="space-y-3">
                {formData.requirements?.creative_video_url && formData.requirements.creative_video_url.startsWith('data:video') ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black aspect-video max-h-[220px] flex items-center justify-center">
                    <video
                      src={formData.requirements.creative_video_url}
                      controls
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateFormData({
                          requirements: { ...formData.requirements, creative_video_url: '' },
                        })
                      }
                      className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors shadow-md"
                      title="Remove Video"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="h-32 border-2 border-dashed border-[#c7d2fe] hover:border-[#4338ca] rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer bg-white transition-all text-center group"
                  >
                    <Upload className="w-6 h-6 text-[#4338ca] mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800">Click to upload official campaign video</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">MP4, WEBM, MOV (Max 50MB)</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleCreativeVideoUpload}
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="url"
                  value={formData.requirements?.creative_video_url || ''}
                  onChange={(e) =>
                    updateFormData({
                      requirements: { ...formData.requirements, creative_video_url: e.target.value },
                    })
                  }
                  placeholder="Paste YouTube, TikTok, Instagram, Google Drive, or MP4 URL..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#dcd8fc] text-xs font-mono text-slate-900 focus:ring-2 focus:ring-[#4338ca] outline-none"
                />
                {formData.requirements?.creative_video_url && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-700 truncate max-w-xs">{formData.requirements.creative_video_url}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Video Link Attached
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CASE 2: IMAGE ASSET */}
        {isImageFormat && (
          <div className="p-5 rounded-2xl bg-[#f8f7ff] border border-[#e2e0fb] space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#4338ca]" />
                <span>Image Creative Asset for Creators *</span>
              </label>
              <span className="text-[10px] font-mono font-bold text-[#4338ca] bg-[#eeedfd] px-2.5 py-0.5 rounded-full border border-[#dcd8fc]">
                Auto-Optimized JPEG
              </span>
            </div>

            {imageUploadError && (
              <p className="text-[11px] font-bold text-red-600">{imageUploadError}</p>
            )}

            {formData.requirements?.creative_image_url ? (
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900">
                <img
                  src={formData.requirements.creative_image_url}
                  alt="Creative Asset"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateFormData({
                      requirements: { ...formData.requirements, creative_image_url: '' },
                    })
                  }
                  className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors shadow-md"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="h-32 border-2 border-dashed border-[#c7d2fe] hover:border-[#4338ca] rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer bg-white transition-all text-center group"
              >
                <Upload className="w-6 h-6 text-[#4338ca] mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Click to upload official campaign banner/photo</span>
                <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP (Auto-optimized in browser)</span>
              </div>
            )}
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleCreativeImageUpload}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </div>
        )}

        {/* Ready-to-Post Text Copy / Caption */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#4338ca]" />
              <span>Ready-to-Post Caption & Copy Instructions *</span>
            </label>
            <span className="text-[10px] font-mono font-bold text-[#4338ca] bg-[#eeedfd] px-2.5 py-0.5 rounded-full border border-[#dcd8fc]">
              Creators Copy Directly
            </span>
          </div>
          <textarea
            rows={3}
            value={formData.requirements?.creative_text_copy || ''}
            onChange={(e) =>
              updateFormData({
                requirements: { ...formData.requirements, creative_text_copy: e.target.value },
              })
            }
            placeholder="e.g. 🔥 Exciting news! Kpugi platform is officially launching in Nigeria. Join thousands of creators today! Link in bio #KpugiLaunch"
            className="w-full px-4 py-3.5 rounded-2xl bg-[#f8f7ff] border border-[#e2e0fb] text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#4338ca] outline-none leading-relaxed transition-all"
          />
        </div>
      </div>

      {/* Asset Pack & Google Drive Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-[#4338ca]" />
            <span>Google Drive Asset Pack URL</span>
          </label>
          <input
            type="url"
            value={formData.requirements?.google_drive_url || ''}
            onChange={(e) =>
              updateFormData({
                requirements: { ...formData.requirements, google_drive_url: e.target.value },
              })
            }
            placeholder="https://drive.google.com/drive/folders/..."
            className="w-full px-4 py-3 rounded-2xl bg-[#f8f7ff] border border-[#e2e0fb] text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#4338ca] outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#4338ca]" />
            <span>Google Doc Guidelines Brief URL</span>
          </label>
          <input
            type="url"
            value={formData.requirements?.google_doc_url || ''}
            onChange={(e) =>
              updateFormData({
                requirements: { ...formData.requirements, google_doc_url: e.target.value },
              })
            }
            placeholder="https://docs.google.com/document/d/..."
            className="w-full px-4 py-3 rounded-2xl bg-[#f8f7ff] border border-[#e2e0fb] text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#4338ca] outline-none transition-all"
          />
        </div>
      </div>

      {/* Mandatory Hashtags & Mentions */}
      <div className="p-5 rounded-2xl bg-[#f8f7ff] border border-[#e2e0fb] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Mandatory Hashtags & Brand Mentions</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Creators must include these in their post captions.</p>
          </div>
          <button
            type="button"
            disabled={isAiLoading}
            onClick={handleAiTags}
            className="text-[11px] font-bold text-[#4f46e5] bg-white border border-[#dcd8fc] px-3 py-1 rounded-full hover:bg-slate-50 transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>✨ Auto-Suggest</span>
          </button>
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add hashtag (e.g. #KpugiLaunch)..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#4338ca]"
            />
            <button
              type="button"
              onClick={addHashtag}
              className="px-4 py-2 rounded-xl bg-[#4338ca] text-white text-xs font-bold hover:bg-[#3730a3]"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#eeedfd] text-[#4338ca] text-xs font-mono font-bold border border-[#dcd8fc]"
              >
                <span>{tag}</span>
                <button type="button" onClick={() => removeHashtag(tag)}>
                  <X className="w-3.5 h-3.5 hover:text-red-500" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Mentions */}
        <div className="space-y-2 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={mentionInput}
              onChange={(e) => setMentionInput(e.target.value)}
              placeholder="Add brand mention (e.g. @KpugiApp)..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMention())}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#4338ca]"
            />
            <button
              type="button"
              onClick={addMention}
              className="px-4 py-2 rounded-xl bg-[#4338ca] text-white text-xs font-bold hover:bg-[#3730a3]"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mentions.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-mono font-bold border border-purple-200"
              >
                <span>{m}</span>
                <button type="button" onClick={() => removeMention(m)}>
                  <X className="w-3.5 h-3.5 hover:text-red-500" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
