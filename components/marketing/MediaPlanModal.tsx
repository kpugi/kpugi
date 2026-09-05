'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download, Printer, X, FileText, Check, ShieldCheck, ArrowRight, Copy } from 'lucide-react';
import { MediaPlanPDFDocument, MediaPlanData } from './MediaPlanPDFDocument';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export type { MediaPlanData };

interface MediaPlanModalProps {
  data: MediaPlanData;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaPlanModal({ data, isOpen, onClose }: MediaPlanModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `KPUGI EXECUTIVE CAMPAIGN MEDIA PLAN
Plan Ref: ${data.planRef}
Date: ${data.issuedAt}
----------------------------------------
• Target Guaranteed Views: ${data.guaranteedViews.toLocaleString()} views
• Total Campaign Budget: ${data.budgetFormatted}
• Effective Rate: ${data.baseCpmFormatted} CPM
• Drop Model: ${data.campaignTypeName}
• Verified Creators Mobilized: ~${data.estimatedCreators} creators
• Channels: Instagram Reels (45%), TikTok (35%), X / Twitter (20%)
• Escrow Protection: 100% Escrow Backed with automated milestone refund
----------------------------------------
Review full media plan: https://kpugi.com/roiestimator`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast({
        title: 'Media Plan Summary Copied!',
        description: 'Copied executive summary to clipboard.',
      });
    }
  };

  const igViews = Math.round(data.guaranteedViews * 0.45);
  const tiktokViews = Math.round(data.guaranteedViews * 0.35);
  const xViews = data.guaranteedViews - igViews - tiktokViews;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#0A0D1A] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-[#070913] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2F49E8]/10 border border-[#2F49E8]/20 flex items-center justify-center text-[#2F49E8]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Executive Campaign Media Plan</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">Ref: {data.planRef} • 1-Page Corporate Proposal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm">
          {/* Document Header Sheet */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="text-2xl font-black tracking-tight text-[#2F49E8] dark:text-[#5B75FF]">KPUGI</div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Performance Creator Media Network</p>
              <p className="text-xs text-slate-400 mt-1">support@kpugi.com • kpugi.com</p>
            </div>
            <div className="sm:text-right space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#17A75B]/10 border border-[#17A75B]/20 text-[#17A75B] text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% ESCROW PROTECTED</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-neutral-400">Issued: {data.issuedAt}</div>
              <div className="text-xs text-slate-500 dark:text-neutral-400">Flight Validity: 14 Days ({data.validUntil})</div>
            </div>
          </div>

          {/* Primary Metrics Highlight Banner */}
          <div className="p-6 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Guaranteed Verified Reach Target</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                {data.guaranteedViews.toLocaleString()} <span className="text-xl font-medium text-slate-400">views</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">Delivered across ~{data.estimatedCreators} verified creators</p>
            </div>
            <div className="sm:text-right pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Campaign Budget</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#10B981] mt-1">
                {data.budgetFormatted}
              </div>
              <p className="text-xs text-slate-400 mt-1">Rate: {data.baseCpmFormatted} CPM</p>
            </div>
          </div>

          {/* Section 1: Campaign Scope */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Campaign Scope & Parameters</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
              <div>
                <span className="text-xs text-slate-500 dark:text-neutral-400 block">Drop Model</span>
                <span className="font-semibold text-slate-900 dark:text-white">{data.campaignTypeName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-neutral-400 block">Effective CPM Rate</span>
                <span className="font-semibold text-slate-900 dark:text-white">{data.baseCpmFormatted} per 1,000 Verified Views</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-neutral-400 block">Active Creators Mobilized</span>
                <span className="font-semibold text-slate-900 dark:text-white">~{data.estimatedCreators} Verified Creators</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-neutral-400 block">Creative Delivery Rule</span>
                <span className="font-semibold text-slate-900 dark:text-white">100% Brand-Ready Assets (Zero Filming)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Channel Flight Allocation */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">2. Multi-Platform Channel Distribution</h4>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400">
                  <tr>
                    <th className="p-3 font-semibold">Channel / Placement</th>
                    <th className="p-3 font-semibold text-center">Flight Share</th>
                    <th className="p-3 font-semibold text-right">Projected Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  <tr>
                    <td className="p-3 font-medium">Instagram Reels & Feed</td>
                    <td className="p-3 text-center text-slate-500">45%</td>
                    <td className="p-3 text-right font-bold text-[#2F49E8] dark:text-[#6882FF]">~{igViews.toLocaleString()} views</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">TikTok Video Drops</td>
                    <td className="p-3 text-center text-slate-500">35%</td>
                    <td className="p-3 text-right font-bold text-[#2F49E8] dark:text-[#6882FF]">~{tiktokViews.toLocaleString()} views</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">X (Twitter) Feed Amplification</td>
                    <td className="p-3 text-center text-slate-500">20%</td>
                    <td className="p-3 text-right font-bold text-[#2F49E8] dark:text-[#6882FF]">~{xViews.toLocaleString()} views</td>
                  </tr>
                  <tr className="bg-blue-50/70 dark:bg-blue-950/20 font-bold">
                    <td className="p-3 text-slate-900 dark:text-white">Total Guaranteed Deployment</td>
                    <td className="p-3 text-center">100%</td>
                    <td className="p-3 text-right text-[#17A75B]">{data.guaranteedViews.toLocaleString()} views</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Competitive Benchmark */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">3. Delivery Benchmark Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <span className="text-xs text-slate-500 block mb-1">Traditional Agency</span>
                <span className="text-lg font-bold text-slate-800 dark:text-neutral-200">~{data.agencyViews.toLocaleString()} views</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">40% retainer markup, zero view guarantees & slow onboarding.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <span className="text-xs text-slate-500 block mb-1">Direct Manual Outreach</span>
                <span className="text-lg font-bold text-slate-800 dark:text-neutral-200">~{data.manualViews.toLocaleString()} views</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">High creator ghosting, unverified bot views & no escrow.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-[#2F49E8]/30">
                <span className="text-xs text-[#2F49E8] dark:text-[#6882FF] font-bold block mb-1">With Kpugi Network</span>
                <span className="text-lg font-black text-[#2F49E8] dark:text-[#6882FF]">{data.guaranteedViews.toLocaleString()} views</span>
                <p className="text-[11px] text-slate-600 dark:text-neutral-300 mt-1 leading-tight">100% Escrow backed. Automated bot filtering. 0 wasted spend.</p>
              </div>
            </div>
          </div>

          {/* Section 4: Performance Escrow SLA */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">4. Escrow Protection & Performance SLA</h4>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2 text-xs text-slate-600 dark:text-neutral-300">
              <p>• <strong>100% Performance Escrow:</strong> Funds remain securely locked in escrow and are released incrementally as verified views are logged.</p>
              <p>• <strong>Automated Bot Scrubbing:</strong> Traffic is filtered in real-time to purge bot clicks, engagement pods, and unverified impressions.</p>
              <p>• <strong>Unspent Budget Guarantee:</strong> If the target quota of {data.guaranteedViews.toLocaleString()} views is not reached during the campaign flight, unspent funds are credited back to the brand wallet automatically.</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-[#070913] border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download Vector PDF via @react-pdf/renderer */}
            <PDFDownloadLink
              document={<MediaPlanPDFDocument data={data} />}
              fileName={`Kpugi_Campaign_Media_Plan_${data.planRef}.pdf`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F49E8] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md"
            >
              {({ loading }) => (
                <>
                  <Download className="w-4 h-4" />
                  <span>{loading ? 'Preparing PDF...' : 'Download Official PDF'}</span>
                </>
              )}
            </PDFDownloadLink>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-white transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Plan</span>
            </button>

            {/* Copy Summary */}
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-white transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-[#17A75B]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
          </div>

          <Link
            href="/brands"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition-all shadow-sm"
          >
            <span>Deposit & Launch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
