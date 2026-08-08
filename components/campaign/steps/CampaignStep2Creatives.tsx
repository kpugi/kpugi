'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { generateAICampaignPolishAction } from '@/app/actions/campaign';

interface Step2Props {
  formData: any;
  updateFormData: (fields: Partial<any>) => void;
}

export function CampaignStep2Creatives({ formData, updateFormData }: Step2Props) {
  const [tagInput, setTagInput] = useState('');
  const [mentionInput, setMentionInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

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

      {/* Ready-to-Post Text Copy / Caption (Grab & Post) */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#4338ca]" />
            <span>Ready-to-Post Caption (Grab & Post) *</span>
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
