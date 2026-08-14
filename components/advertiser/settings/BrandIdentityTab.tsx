'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { BrandSettingsData } from '@/lib/supabase/advertiser';
import { updateBrandIdentityAction } from '@/app/actions/advertiser';
import {
  Building2,
  Globe,
  MapPin,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Camera,
  RefreshCw,
  Share2,
  Trash2,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface BrandIdentityTabProps {
  data: BrandSettingsData;
  onUpdateSuccess: (newLogoUrl?: string | null) => void;
}

const INDUSTRY_OPTIONS = [
  'E-commerce & Retail',
  'Fintech & Web3',
  'SaaS & Software',
  'Fashion & Consumer Goods',
  'Gaming & Mobile Apps',
  'Media & Entertainment',
  'Food & FMCG',
  'Health & Wellness',
  'Education & EdTech',
  'Travel & Hospitality',
  'Agency & Marketing',
  'Other',
];

const PRESET_LOGOS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534972195531-a756b1126f24?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
];

export default function BrandIdentityTab({ data, onUpdateSuccess }: BrandIdentityTabProps) {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState(data.advertiser.companyName || '');
  const [tagline, setTagline] = useState(data.advertiser.tagline || '');
  const [industry, setIndustry] = useState(data.advertiser.industry || 'E-commerce & Retail');
  const [website, setWebsite] = useState(data.advertiser.companyWebsite || '');
  const [location, setLocation] = useState(data.advertiser.location || 'Lagos, Nigeria');

  const [logoPreview, setLogoPreview] = useState<string>(
    data.advertiser.companyLogoUrl || data.profile.avatarUrl || user?.imageUrl || ''
  );
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [socialLinks, setSocialLinks] = useState({
    instagram: data.advertiser.socialLinks.instagram || '',
    tiktok: data.advertiser.socialLinks.tiktok || '',
    twitter: data.advertiser.socialLinks.twitter || '',
    linkedin: data.advertiser.socialLinks.linkedin || '',
    youtube: data.advertiser.socialLinks.youtube || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Logo image size must be under 5MB.' });
      return;
    }

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setLogoBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (url: string) => {
    setLogoPreview(url);
    setLogoBase64(null);
    setUploadedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setMessage({ type: 'error', text: 'Company or Brand Name is required.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // 1. Two-way client sync with Clerk user profile image if raw file selected
      if (uploadedFile && user?.setProfileImage) {
        try {
          await user.setProfileImage({ file: uploadedFile });
        } catch (clerkErr) {
          console.warn('[Clerk user.setProfileImage Warning]:', clerkErr);
        }
      }

      // 2. Call Server Action
      const res = await updateBrandIdentityAction({
        companyName: companyName.trim(),
        companyWebsite: website.trim() || undefined,
        industry,
        tagline: tagline.trim() || undefined,
        location: location.trim() || undefined,
        logoUrl: logoBase64 ? undefined : logoPreview || undefined,
        logoBase64: logoBase64 || undefined,
        socialLinks,
      });

      if (!res.success) {
        setMessage({ type: 'error', text: res.error || 'Failed to update brand identity.' });
      } else {
        setMessage({ type: 'success', text: 'Brand identity and logo updated successfully!' });
        setLogoBase64(null);
        setUploadedFile(null);
        if (res.logoUrl) {
          setLogoPreview(res.logoUrl);
          onUpdateSuccess(res.logoUrl);
        } else {
          onUpdateSuccess(logoPreview);
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toast Feedback */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Brand Visual Identity & Logo */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-kpugi-blue font-bold text-xs uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>Visual Identity & Brand Logo</span>
          </div>
          <h2 className="font-display text-xl font-bold text-kpugi-ink mt-1">Official Brand Logo</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            This logo represents your brand on campaign briefs, creator catalogues, and official payment receipts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-kpugi-blue/20 bg-white flex items-center justify-center relative shadow-sm">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Brand Logo"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 p-2 bg-kpugi-blue hover:bg-kpugi-blue/90 text-white rounded-xl shadow-md border-2 border-white transition-transform hover:scale-105"
              title="Upload New Logo"
            >
              <UploadCloud className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-kpugi-ink text-xs font-bold rounded-xl border border-kpugi-border shadow-2xs transition-all"
              >
                Upload New Image
              </button>
              {logoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoPreview('');
                    setLogoBase64(null);
                    setUploadedFile(null);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Recommended: Square PNG, WebP, or SVG (minimum 400×400px, max 5MB). Automatically updates across your profile and campaigns.
            </p>
          </div>
        </div>
      </div>

      {/* Company & Business Profile Details */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-kpugi-blue font-bold text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Company Profile</span>
          </div>
          <h2 className="font-display text-xl font-bold text-kpugi-ink mt-1">Business Details</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Essential company details shown to creators on campaign briefs and brand discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Company / Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Paystack, Konga, PiggyVest"
              className="w-full p-3.5 rounded-xl border border-kpugi-border bg-slate-50 text-xs sm:text-sm text-kpugi-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
            />
          </div>

          {/* Industry Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Industry Category
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-kpugi-border bg-slate-50 text-xs sm:text-sm text-kpugi-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
            >
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Tagline / Elevator Pitch */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Brand Tagline / Description
            </label>
            <div className="relative">
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., Modern digital banking and automated savings for Africa's builders."
                className="w-full p-3.5 pr-10 rounded-xl border border-kpugi-border bg-slate-50 text-xs sm:text-sm text-kpugi-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
              />
              <Sparkles className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              A short description shown under your brand name on creator discovery feeds.
            </p>
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Official Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-kpugi-border bg-slate-50 text-xs sm:text-sm text-kpugi-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
              />
            </div>
          </div>

          {/* Headquarters Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Headquarters Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Lagos, Nigeria"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-kpugi-border bg-slate-50 text-xs sm:text-sm text-kpugi-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Official Social Media Channels */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-kpugi-blue font-bold text-xs uppercase tracking-wider">
            <Share2 className="w-4 h-4" />
            <span>Social Presence</span>
          </div>
          <h2 className="font-display text-xl font-bold text-kpugi-ink mt-1">Official Brand Channels</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Links to your official social profiles used for verifying campaign hashtags and creator tags.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Instagram Handle or URL</label>
            <input
              type="text"
              value={socialLinks.instagram}
              onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              placeholder="@yourbrand or https://instagram.com/..."
              className="w-full p-3 rounded-xl border border-kpugi-border bg-slate-50 text-xs sm:text-sm text-kpugi-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">TikTok Handle or URL</label>
            <input
              type="text"
              value={socialLinks.tiktok}
              onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
              placeholder="@yourbrand or https://tiktok.com/@..."
              className="w-full p-3 rounded-xl border border-kpugi-border bg-slate-50 text-xs sm:text-sm text-kpugi-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">X (Twitter) Handle or URL</label>
            <input
              type="text"
              value={socialLinks.twitter}
              onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
              placeholder="@yourbrand or https://x.com/..."
              className="w-full p-3 rounded-xl border border-kpugi-border bg-slate-50 text-xs sm:text-sm text-kpugi-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">LinkedIn Company Page</label>
            <input
              type="text"
              value={socialLinks.linkedin}
              onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
              placeholder="https://linkedin.com/company/..."
              className="w-full p-3 rounded-xl border border-kpugi-border bg-slate-50 text-xs sm:text-sm text-kpugi-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue transition-all"
            />
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3.5 bg-kpugi-blue hover:bg-kpugi-blue/90 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-kpugi-blue/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Save Identity Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
}
