'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download, Printer, X, FileText } from 'lucide-react';
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(data.issued_at).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isDeposit = data.transaction_type === 'deposit' || data.transaction_type === 'wallet_deposit';
  const hasFeaturedAddOn = isDeposit && Boolean(data.is_featured && data.featured_fee && data.featured_fee > 0);

  const depositBudgetPortion = data.escrow_budget || (data.total_amount - (data.featured_fee || 0));
  const mainRowAmount = isDeposit
    ? (hasFeaturedAddOn ? depositBudgetPortion : data.total_amount)
    : (data.escrow_budget || data.total_amount);

  const finalTotal = isDeposit ? data.total_amount : (data.escrow_budget || data.total_amount);

  const descriptionTitle = data.campaign_title
    ? `Campaign: ${data.campaign_title}`
    : 'Wallet Balance Deposit';

  const durationStr = data.campaign_title ? 'Active Run' : 'Permanent';

  const formatCurrency = (val: number) =>
    `NGN ${Number(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const paymentSourceStr = data.payment_method === 'wallet'
    ? 'Kpugi Wallet'
    : 'Paystack Card / Transfer';

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Dark Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-extrabold text-white">Receipt / Invoice Preview</h3>
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

        {/* Printable Spaceship Receipt View */}
        <div className="p-6 sm:p-10 space-y-6 font-sans text-xs flex-1 overflow-y-auto print-container bg-white">
          
          {/* Header Row */}
          <div className="flex justify-between items-start pb-5 border-b border-slate-200">
            <div>
              <img src="/kpugi_logo.png" alt="Kpugi Logo" className="h-11 w-auto object-contain" />
             
            </div>

            <div className="text-right">
              <h2 className="text-lg font-bold text-slate-900">Receipt / Invoice</h2>
              <p className="text-slate-500 text-[11px] mt-1">
                Invoice / Receipt number: <span className="font-bold text-slate-900">{data.receipt_number}</span>
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Date: <span className="font-bold text-slate-900">{formattedDate}</span>
              </p>
            </div>
          </div>

          {/* Order Details Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs mb-3">Order details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">BILLED TO</span>
                <span className="font-bold text-slate-900">
                  {data.advertiser_email || data.advertiser_name || 'Brand Partner'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PAYMENT SOURCE</span>
                <span className="font-bold text-slate-900">{paymentSourceStr}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">FINAL COST</span>
                <span className="font-bold text-slate-900">{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-[10px] font-bold uppercase text-slate-600 tracking-wider">
                  <th className="pb-2">DESCRIPTION</th>
                  <th className="pb-2 text-right">PRICE</th>
                  <th className="pb-2 text-center">DURATION</th>
                  <th className="pb-2 text-center">QTY</th>
                  <th className="pb-2 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                <tr>
                  <td className="py-3 pr-2">
                    <span className="font-bold text-slate-900 block">{descriptionTitle}</span>
                  </td>
                  <td className="py-3 text-right text-slate-700">{formatCurrency(mainRowAmount)}</td>
                  <td className="py-3 text-center text-slate-700">{durationStr}</td>
                  <td className="py-3 text-center text-slate-700">1</td>
                  <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(mainRowAmount)}</td>
                </tr>

                {hasFeaturedAddOn && data.featured_fee ? (
                  <tr>
                    <td className="py-3 pr-2">
                      <span className="font-bold text-slate-900 block">Featured Campaign Placement Boost</span>
                      <span className="text-[10px] text-slate-500">Top banner placement & high priority creator notifications</span>
                    </td>
                    <td className="py-3 text-right text-slate-700">{formatCurrency(data.featured_fee)}</td>
                    <td className="py-3 text-center text-slate-700">7 Days</td>
                    <td className="py-3 text-center text-slate-700">1</td>
                    <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(data.featured_fee)}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-full sm:w-60 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(finalTotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 font-bold text-sm text-slate-900">
                <span>Total</span>
                <span className="text-base font-extrabold text-blue-600">{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Additional Transaction Details (Spaceship Style) */}
          <div className="pt-5 border-t border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900">Additional Transaction Details</h4>
            
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-[11px]">Campaign Deployment</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                If you launched an ad campaign, it is now live and accepting creator submissions. You can discover top-performing creators in Kpugi Marketplace or visit your Campaign Dashboard to monitor verified view counts, submissions, and milestone releases.
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-[11px]">Customer Support</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Feel free to contact our Customer Service team if you have any questions or concerns. We are available 24/7 at support@kpugi.com.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-5 border-t border-slate-200 text-center space-y-1 text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700">
              &copy; {new Date().getFullYear()} Kpugi Marketplace • support@kpugi.com
            </p>
            <p className="text-[10px] text-slate-400">
              Kpugi is a performance media marketplace for creators and brands. All rights reserved.
            </p>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Download Vector PDF Button */}
            <PDFDownloadLink
              document={<InvoicePDFDocument data={data} />}
              fileName={`Receipt_${data.receipt_number}.pdf`}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
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
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
