'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

export interface InvoiceData {
  receipt_number: string;
  transaction_type: string;
  issued_at: string;
  total_amount: number;
  escrow_budget?: number;
  featured_fee?: number;
  is_featured?: boolean;
  payment_method: string;
  paystack_reference?: string | null;
  status: string;
  advertiser_name: string;
  advertiser_email?: string;
  campaign_title?: string | null;
  campaign_code?: string | null;
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563EB',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 2,
  },
  receiptBadgeBox: {
    alignItems: 'flex-end',
  },
  docHeaderTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  receiptNum: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 4,
    fontFamily: 'Helvetica-Bold',
  },
  statusTag: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#DCFCE7',
    color: '#166534',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metaCol: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  metaValueBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  metaValueText: {
    fontSize: 9,
    color: '#475569',
    marginTop: 2,
  },
  table: {
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  colDesc: {
    flex: 3,
  },
  colType: {
    flex: 1.5,
  },
  colAmount: {
    flex: 1.5,
    textAlign: 'right',
  },
  thText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tdText: {
    fontSize: 9,
    color: '#0F172A',
  },
  tdTextBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  tdAmountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 28,
  },
  summaryBox: {
    width: '50%',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  totalText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    textAlign: 'center',
  },
  footerHeading: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 8,
    color: '#64748B',
    lineHeight: 1.3,
  },
});

export const InvoicePDFDocument: React.FC<{ data: InvoiceData }> = ({ data }) => {
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
      ? `Campaign Escrow Allocation: ${data.campaign_title}`
      : 'Campaign Escrow Allocation';

  const amountStr = `N${Number(data.total_amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <Document title={`Receipt_${data.receipt_number}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
<div className="flex items-center gap-3">
                <img src="/kpugi_logo.png" alt="Kpugi Logo" className="h-12 w-auto object-contain" />
              </div>           
               <Text style={styles.brandSub}>Official Payment Receipt</Text>
          </View>
          <View style={styles.receiptBadgeBox}>
            <Text style={styles.docHeaderTitle}>Payment Receipt</Text>
            <Text style={styles.receiptNum}>{data.receipt_number}</Text>
            <Text style={styles.statusTag}>PAID & VERIFIED ✓</Text>
          </View>
        </View>

        {/* Metadata Grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.sectionTitle}>ISSUED BY</Text>
            <Text style={styles.metaValueBold}>Kpugi Media</Text>
            <Text style={styles.metaValueText}>Social Ad Marketpace</Text>
            <Text style={styles.metaValueText}>Rivers State, Nigeria • billing@kpugi.com</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.sectionTitle}>BILLED TO</Text>
            {data.advertiser_email && <Text style={styles.metaValueText}>{data.advertiser_email}</Text>}
            <Text style={styles.metaValueText}>Date: {formattedDate}</Text>
            <Text style={styles.metaValueText}>Method: {data.payment_method.toUpperCase()}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colDesc}>
              <Text style={styles.thText}>Description</Text>
            </View>
            <View style={styles.colType}>
              <Text style={styles.thText}>Type</Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={styles.thText}>Amount</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.colDesc}>
              <Text style={styles.tdTextBold}>{descriptionText}</Text>
              {data.campaign_code && (
                <Text style={{ fontSize: 8, color: '#64748B', marginTop: 2 }}>
                  Campaign Code: {data.campaign_code}
                </Text>
              )}
            </View>
            <View style={styles.colType}>
              <Text style={styles.tdText}>{isDeposit ? 'Deposit' : 'Campaign Funding'}</Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={styles.tdAmountText}>{amountStr}</Text>
            </View>
          </View>

          {data.is_featured && data.featured_fee && data.featured_fee > 0 ? (
            <View style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={styles.tdTextBold}>Featured Campaign Placement Add-On</Text>
              </View>
              <View style={styles.colType}>
                <Text style={styles.tdText}>Add-On Fee</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.tdAmountText}>
                  N{Number(data.featured_fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Summary Box */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={{ fontSize: 9, color: '#64748B' }}>Subtotal:</Text>
              <Text style={{ fontSize: 9, color: '#0F172A', fontWeight: 'bold' }}>{amountStr}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ fontSize: 9, color: '#64748B' }}>Platform Fee:</Text>
              <Text style={{ fontSize: 9, color: '#0F172A', fontWeight: 'bold' }}>N0.00</Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0F172A' }}>Total Paid:</Text>
              <Text style={styles.totalText}>{amountStr}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This official payment receipt is generated automatically by Kpugi Media Platform. Funds allocated for campaigns are locked in escrow and released to creators upon verified view thresholds.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
