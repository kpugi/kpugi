'use client';

import React from 'react';
import { InvoiceModal, InvoiceData } from '@/components/common/InvoiceModal';

interface ReceiptModalProps {
  receipt: {
    receipt_number: string;
    total_amount: number;
    escrow_budget: number;
    featured_fee: number;
    is_featured: boolean;
    payment_method: string;
  };
  campaignId: string;
  campaignTitle: string;
  onClose: () => void;
}

export function CampaignReceiptModal({
  receipt,
  campaignId,
  campaignTitle,
  onClose,
}: ReceiptModalProps) {
  const invoiceData: InvoiceData = {
    receipt_number: receipt.receipt_number,
    transaction_type: 'campaign_funding',
    issued_at: new Date().toISOString(),
    total_amount: receipt.total_amount,
    escrow_budget: receipt.escrow_budget,
    featured_fee: receipt.featured_fee,
    is_featured: receipt.is_featured,
    payment_method: receipt.payment_method,
    status: 'PAID',
    advertiser_name: 'Brand Partner',
    campaign_title: campaignTitle,
  };

  return (
    <InvoiceModal
      data={invoiceData}
      campaignId={campaignId}
      onClose={onClose}
    />
  );
}
