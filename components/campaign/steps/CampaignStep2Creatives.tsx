'use client';

import React, { useState } from 'react';
import { Upload, Video, Image as ImageIcon, FileText, Sparkles, Plus, X, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
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
    { id: 'Dedicated Video', title: 'Dedicated Video', desc: 'Full standalone video dedicated to brand product/service' },
    { id: 'Integrated Mention', title: 'Integrated Mention', desc: 'Sponsorship segment inside creator daily vlog/content' },
    { id: 'Product Review', title: 'Product Review', desc: 'Unboxing or honest product review & demonstration' },
    { id: 'Live Stream Feature', title: 'Live Stream Feature', desc: 'Live shoutout & product placement during creator live stream' },
  ];

  const hashtags: string[] = formData.requirements?.hashtags || ['#KpugiLaunch', `#${(formData.title || 'Brand').replace(/\s+/g, '')}`];
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="font-display text-xl font-bold text-kpugi-ink">
          Step 2: Brand Ready-to-Post Creatives & Media
        </h2>
        <p className="text-xs text-kpugi-slate mt-0.5">
          Brands provide ready-made text, images, or video assets. Creators grab approved creatives and post directly.
        </p>
      </div>

      {/* Ad Format Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-kpugi-ink">Ad Format *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {adFormats.map((format) => {
            const isSelected = formData.ad_format === format.id;
            return (
              <div
                key={format.id}
                onClick={() => updateFormData({ ad_format: format.id })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-kpugi-blue/5 border-kpugi-blue ring-1 ring-kpugi-blue shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'border-kpugi-blue bg-kpugi-blue text-white' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-kpugi-ink">{format.title}</h4>
                  <p className="text-[11px] text-kpugi-slate mt-0.5">{format.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ready-to-Post Text Copy / Caption */}
      <div className="space-y-1.5 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-700" />
            <span>Ready-to-Post Text Copy / Caption (Grab & Post) *</span>
          </label>
          <span className="text-[10px] font-mono font-bold text-amber-800 uppercase bg-amber-100 px-2 py-0.5 rounded">
            Creators Copy Directly
          </span>
        </div>
        <p className="text-[11px] text-amber-800">
          Enter the exact caption text creators will copy and paste when sharing your creative on their accounts.
        </p>
        <textarea
          rows={3}
          value={formData.requirements?.creative_text_copy || ''}
          onChange={(e) =>
            updateFormData({
              requirements: { ...formData.requirements, creative_text_copy: e.target.value },
            })
          }
          placeholder="e.g. 🔥 Exciting news! Kpugi platform is officially launching in Nigeria. Join thousands of creators today! Link in bio #KpugiLaunch"
          className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed bg-white"
        />
      </div>

      {/* Asset Pack & Google Drive Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-kpugi-ink flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-kpugi-blue" />
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
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-kpugi-blue outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-kpugi-ink flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-kpugi-blue" />
            <span>Google Doc Brief URL</span>
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
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-kpugi-blue outline-none"
          />
        </div>
      </div>

      {/* Hashtags & Mentions */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-kpugi-ink">Mandatory Hashtags & Brand Mentions</h4>
            <p className="text-[11px] text-kpugi-slate">Creators must include these in their post captions.</p>
          </div>
          <button
            type="button"
            disabled={isAiLoading}
            onClick={handleAiTags}
            className="text-[11px] font-bold text-kpugi-blue hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI Auto-Suggest Tags</span>
          </button>
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add hashtag (e.g. #KpugiFit)..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none"
            />
            <button
              type="button"
              onClick={addHashtag}
              className="px-3 py-1.5 rounded-lg bg-kpugi-blue text-white text-xs font-bold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-kpugi-blue text-xs font-mono font-bold"
              >
                <span>{tag}</span>
                <button type="button" onClick={() => removeHashtag(tag)}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Mentions */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={mentionInput}
              onChange={(e) => setMentionInput(e.target.value)}
              placeholder="Add brand mention (e.g. @BrandOfficial)..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMention())}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none"
            />
            <button
              type="button"
              onClick={addMention}
              className="px-3 py-1.5 rounded-lg bg-kpugi-blue text-white text-xs font-bold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mentions.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-mono font-bold"
              >
                <span>{m}</span>
                <button type="button" onClick={() => removeMention(m)}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
