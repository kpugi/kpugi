'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  CheckCircle2,
  Copy,
  Share2,
  Download,
  Rocket,
  ArrowRight,
  Plus,
  Zap,
  Star,
  BadgeCheck,
  Twitter,
  Linkedin,
  MessageCircle,
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDFDocument } from '@/components/invoice/InvoicePDFDocument';

interface CampaignSuccessViewProps {
  campaign: {
    id: string;
    title: string;
    campaign_code: string;
    total_budget: number;
    cpm_rate: number;
    channels: string[];
    ad_format: string;
    is_featured: boolean;
    created_at: string;
  };
  receipt: {
    receipt_number: string;
    total_amount: number;
    payment_method: string;
    issued_at: string;
  } | null;
  advertiserEmail?: string;
  advertiserName?: string;
}

export function CampaignSuccessView({
  campaign,
  receipt,
  advertiserEmail = '',
  advertiserName = '',
}: CampaignSuccessViewProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const confettiRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com');

  const campaignLink = `${appUrl}/browse?campaign=${campaign.campaign_code}`;

  // 🎉 Confetti burst on mount
  useEffect(() => {
    if (confettiRef.current) return;
    confettiRef.current = true;

    import('canvas-confetti').then((m) => {
      const confetti = m.default;
      const colors = ['#4338ca', '#6366f1', '#a5b4fc', '#fbbf24', '#34d399'];

      // First burst
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors });

      // Second burst 400ms later
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6, x: 0.3 }, colors });
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6, x: 0.7 }, colors });
      }, 400);
    });
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(campaignLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(campaign.campaign_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const shareText = encodeURIComponent(
    `🚀 Just launched "${campaign.title}" on Kpugi! Looking for creators to earn ₦${campaign.cpm_rate.toLocaleString()}/1k views. Check it out:`
  );
  const shareUrl = encodeURIComponent(campaignLink);

  const pdfData = receipt
    ? {
        receipt_number: receipt.receipt_number,
        transaction_type: 'deposit' as const,
        issued_at: receipt.issued_at,
        total_amount: receipt.total_amount,
        escrow_budget: campaign.total_budget,
        featured_fee: campaign.is_featured
          ? Math.max(0, receipt.total_amount - campaign.total_budget) || 2500
          : 0,
        is_featured: campaign.is_featured,
        payment_method: receipt.payment_method,
        status: 'PAID',
        campaign_title: campaign.title,
        campaign_code: campaign.campaign_code,
        advertiser_email: advertiserEmail || '',
        advertiser_name: advertiserEmail || advertiserName || 'Brand Partner',
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0efff] via-[#f8f7ff] to-[#eff6ff] dark:from-[#0B0E14] dark:via-[#12141A] dark:to-[#0B0E14] flex flex-col items-center justify-start py-10 px-4 text-slate-900 dark:text-white">
      <div className="w-full max-w-2xl mx-auto space-y-6">

        {/* Hero Success Banner */}
        <div className="bg-white dark:bg-[#12141A] rounded-3xl border border-indigo-100 dark:border-white/10 shadow-xl p-8 text-center space-y-4 relative overflow-hidden">
          {/* Background decorative orbs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-100/60 dark:bg-indigo-900/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-purple-100/60 dark:bg-purple-900/20 blur-3xl pointer-events-none" />

          <div className="relative flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border-4 border-emerald-100 dark:border-emerald-500/30 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>

          <div className="relative space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-full text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide mb-2">
              <Rocket className="w-3 h-3" />
              <span>CAMPAIGN IS LIVE</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              You&apos;re live! 🎉
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
              <span className="font-bold text-slate-700 dark:text-slate-200">&ldquo;{campaign.title}&rdquo;</span> is
              now visible to qualified creators on Kpugi.
            </p>
          </div>
        </div>

        {/* Campaign Details Card */}
        <div className="bg-white dark:bg-[#12141A] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm divide-y divide-slate-100 dark:divide-white/10">
          <div className="p-5 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Campaign ID</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">{campaign.campaign_code}</span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Copy campaign code"
              >
                {copiedCode ? <BadgeCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {receipt && (
            <div className="p-5 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Receipt ID</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">{receipt.receipt_number}</span>
            </div>
          )}

          <div className="p-5 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Budget Locked</span>
            <span className="font-mono font-extrabold text-slate-900 dark:text-white">
              ₦{campaign.total_budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-5 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">CPM Rate</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">₦{campaign.cpm_rate.toLocaleString()} / 1k views</span>
          </div>

          <div className="p-5 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Platforms</span>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {campaign.channels.map((ch) => (
                <span key={ch} className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-100 dark:border-indigo-500/30">
                  {ch}
                </span>
              ))}
            </div>
          </div>

          {campaign.is_featured && (
            <div className="p-5 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Boost</span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-xs">
                <Star className="w-3.5 h-3.5" /> Featured Campaign
              </span>
            </div>
          )}

          {receipt && (
            <div className="p-5 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Payment</span>
              <span className="capitalize font-bold text-slate-700 dark:text-slate-300 text-sm">
                {receipt.payment_method === 'wallet' ? 'Kpugi Wallet' : 'Card / Bank Transfer'}
              </span>
            </div>
          )}
        </div>

        {/* Share & Copy Row */}
        <div className="bg-white dark:bg-[#12141A] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-5 space-y-4">
          <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Share Your Campaign
          </h3>

          {/* Copy Link */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5">
            <span className="flex-1 text-xs font-mono text-slate-500 dark:text-slate-400 truncate">{campaignLink}</span>
            <button
              onClick={handleCopyLink}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              {copied ? <BadgeCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
            >
              <Twitter className="w-4 h-4" />
              X / Twitter
            </a>
            <a
              href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${encodeURIComponent(campaign.title)}&summary=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </div>
        </div>

        {/* Download Receipt PDF */}
        {mounted && pdfData && (
          <div className="bg-white dark:bg-[#12141A] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Payment Receipt</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Download official PDF for your records</p>
              </div>
              <PDFDownloadLink
                document={<InvoicePDFDocument data={pdfData} />}
                fileName={`Receipt_${pdfData.receipt_number}.pdf`}
              >
                {({ loading }) => (
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {loading ? 'Preparing...' : 'Download PDF'}
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        )}

        {/* Primary CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
          <Link
            href={`/b/campaigns/${campaign.id}`}
            className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#4338ca] hover:bg-[#3730a3] dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            <Zap className="w-5 h-5 text-amber-300" />
            <span>View Campaign</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>

          <Link
            href="/b/campaigns/new"
            className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border-2 border-slate-200 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/40 text-slate-800 dark:text-white font-extrabold text-sm shadow-sm transition-all"
          >
            <Plus className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span>New Campaign</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
