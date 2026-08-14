'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CheckCircle2, Download, Printer, ArrowRight, X, ShieldCheck, FileText, XCircle, Clock } from 'lucide-react';
import { InvoicePDFDocument, InvoiceData } from '@/components/invoice/InvoicePDFDocument';

export type { InvoiceData };

interface InvoiceModalProps {
  data: InvoiceData;
  campaignId?: string | null;
  onClose: () => void;
}

export function InvoiceModal({ data, campaignId, onClose }: InvoiceModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const isPaid = data.status === 'COMPLETED' || data.status === 'PAID';
  const isCancelled = data.status === 'CANCELLED' || data.status === 'FAILED';
  const isPending = data.status === 'PENDING';

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(data.issued_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const isDeposit = data.transaction_type === 'deposit';
  const descriptionText = isDeposit
    ? 'Wallet Account Top-Up (Paystack Checkout)'
    : data.campaign_title
      ? `Campaign Budget: ${data.campaign_title}`
      : 'Campaign Budget';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-extrabold text-white">Official Payment Receipt</h3>
              <p className="text-[10px] text-slate-400 font-mono">{data.receipt_number}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Document Container (Flat Paper View) */}
        <div className="p-6 sm:p-8 space-y-6 font-sans text-xs flex-1 overflow-y-auto print-container bg-white relative">
          {/* Decorative Stamp Watermark */}
          <div className="absolute top-28 right-8 sm:right-16 pointer-events-none select-none opacity-[0.14] sm:opacity-[0.18] rotate-[-12deg] z-10 transition-all duration-300">
            <div className={`w-28 h-28 rounded-full border-4 border-double flex flex-col items-center justify-center font-display font-black tracking-widest text-center uppercase ${
              isCancelled ? 'border-rose-600 text-rose-600' : isPending ? 'border-amber-600 text-amber-600' : 'border-emerald-600 text-emerald-600'
            }`}>
              <div className="text-[10px] font-bold tracking-widest leading-none">KPUGI</div>
              <div className="text-[17px] font-black my-0.5 leading-none">{isCancelled ? 'CANCELLED' : isPending ? 'PENDING' : 'PAID'}</div>
              <div className="text-[8px] font-extrabold tracking-wider leading-none">OFFICIAL</div>
            </div>
          </div>
          {/* Executive Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <img src="/kpugi_logo.png" alt="Kpugi Logo" className="h-12 w-auto object-contain" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium">Official Payment Receipt</p>
            </div>

            <div className="sm:text-right space-y-1">
              {isCancelled ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-extrabold uppercase tracking-wider">
                  <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>CANCELLED</span>
                </div>
              ) : isPending ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-extrabold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>PENDING</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-extrabold uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PAID & VERIFIED</span>
                </div>
              )}
              <div className="text-[11px] font-mono text-slate-600 pt-1">
                Ref: <span className="font-bold text-slate-900">{data.receipt_number}</span>
              </div>
            </div>
          </div>

          {/* 2-Column Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Issued By</span>
              <p className="font-bold text-slate-900 text-sm">Kpugi Media</p>
              <p className="text-slate-500 text-[11px]">Social Ad Marketplace</p>
              <p className="text-slate-500 text-[11px]">Rivers State, Nigeria • billing@kpugi.com</p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billed To</span>
              {data.advertiser_email && <p className="text-slate-500 text-[11px]">{data.advertiser_email}</p>}
              <p className="text-slate-500 text-[11px]">Date: {formattedDate}</p>
              <p className="text-slate-500 text-[11px] uppercase">Payment Method: <span className="font-bold text-slate-800">{data.payment_method}</span></p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500">
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {descriptionText}
                    {data.campaign_code && (
                      <span className="block font-mono text-[10px] text-slate-500 font-normal mt-0.5">
                        Campaign Code: {data.campaign_code}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium capitalize">
                    {isDeposit ? 'Wallet Deposit' : 'Campaign Escrow'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900">
                    ₦{Number(data.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {data.is_featured && data.featured_fee && data.featured_fee > 0 ? (
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Featured Campaign Placement Add-On
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">Add-On Fee</td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900">
                      ₦{Number(data.featured_fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Summary Box */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 p-4 bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-800">
                  ₦{Number(data.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Platform Fee:</span>
                <span className="font-mono font-bold text-slate-800">₦0.00</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-extrabold text-sm text-slate-900">
                <span>{isCancelled ? 'Total Amount:' : isPending ? 'Total Pending:' : 'Total Paid:'}</span>
                <span className={`font-mono text-base font-extrabold ${isCancelled ? 'text-slate-600' : isPending ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ₦{Number(data.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Escrow Guarantee Footer */}
          <div className="p-4 bg-slate-50 border border-slate-200 flex items-start gap-3">
            <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${isCancelled ? 'text-slate-400' : 'text-blue-600'}`} />
            <div className="space-y-0.5 text-xs">
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {isCancelled
                  ? 'This transaction invoice has been cancelled. No funds were processed, charged, or transferred. If you intended to complete this deposit, please start a new deposit session.'
                  : 'This official receipt is generated automatically by Kpugi Media Platform. Funds allocated for campaigns are locked in smart escrow and released to creators upon verified view thresholds.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Download Vector PDF Button */}
            <PDFDownloadLink
              document={<InvoicePDFDocument data={data} />}
              fileName={`Receipt_${data.receipt_number}.pdf`}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
            >
              {({ loading }) => (
                <>
                  <Download className="w-4 h-4" />
                  <span>{loading ? 'Generating PDF...' : 'Download PDF'}</span>
                </>
              )}
            </PDFDownloadLink>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>

        
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
