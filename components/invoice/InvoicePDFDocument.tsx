'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const logoUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/kpugi_logo.png`
  : '/kpugi_logo.png';

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
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandBox: {
    alignItems: 'flex-start',
  },
  logoImage: {
    width: 120,
    height: 46,
    objectFit: 'contain',
    marginBottom: 4,
  },
  logoSub: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  receiptMetaBox: {
    alignItems: 'flex-end',
  },
  receiptTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  metaLabelText: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 2,
  },
  metaValueHighlight: {
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
  },

  // Order details card
  orderDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 22,
  },
  orderDetailsTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10,
  },
  orderGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderGridCol: {
    width: '32%',
  },
  orderItemLabel: {
    fontSize: 8,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  orderItemValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
  },
  orderItemValueMono: {
    fontSize: 8.5,
    color: '#334155',
  },

  // Table
  tableContainer: {
    marginBottom: 18,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 6,
    marginBottom: 6,
  },
  thDesc: {
    flex: 3.5,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  thPrice: {
    flex: 1.3,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  thDuration: {
    flex: 1.1,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  thQty: {
    flex: 0.7,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  thAmount: {
    flex: 1.5,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  tdDesc: {
    flex: 3.5,
  },
  tdDescTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
  },
  tdDescSub: {
    fontSize: 7.5,
    color: '#64748B',
    marginTop: 2,
  },
  tdPrice: {
    flex: 1.3,
    fontSize: 8.5,
    color: '#334155',
    textAlign: 'right',
  },
  tdDuration: {
    flex: 1.1,
    fontSize: 8.5,
    color: '#334155',
    textAlign: 'center',
  },
  tdQty: {
    flex: 0.7,
    fontSize: 8.5,
    color: '#334155',
    textAlign: 'center',
  },
  tdAmount: {
    flex: 1.5,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'right',
  },

  // Totals Section
  totalsSection: {
    alignItems: 'flex-end',
    marginTop: 6,
    marginBottom: 24,
  },
  totalsBox: {
    width: '45%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: '#64748B',
  },
  totalVal: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: '#0F172A',
  },
  finalTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
  },
  finalTotalVal: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#2563EB',
  },

  // Spaceship Guidance Box: Additional Transaction Details
  additionalSection: {
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  additionalTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  guidanceBlock: {
    marginBottom: 8,
  },
  guidanceHeading: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  guidanceText: {
    fontSize: 8,
    color: '#64748B',
    lineHeight: 1.35,
  },

  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    textAlign: 'center',
  },
  footerCompany: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    marginBottom: 3,
  },
  footerDisclaimer: {
    fontSize: 7.5,
    color: '#94A3B8',
    lineHeight: 1.3,
  },
});

export const InvoicePDFDocument: React.FC<{ data: InvoiceData }> = ({ data }) => {
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

  // Format currency with standard NGN for PDF rendering (avoids Helvetica font broken Naira symbol ¦)
  const formatCurrency = (val: number) =>
    `NGN ${Number(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const paymentSourceStr = data.payment_method === 'wallet'
    ? 'Kpugi Wallet'
    : 'Paystack Card / Transfer';

  return (
    <Document title={`Receipt_${data.receipt_number}`}>
      <Page size="A4" style={styles.page}>

        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandBox}>
            <Image src={logoUrl} style={styles.logoImage} />
          </View>
          <View style={styles.receiptMetaBox}>
            <Text style={styles.receiptTitle}>Receipt / Invoice</Text>
            <Text style={styles.metaLabelText}>
              Invoice / Receipt number: <Text style={styles.metaValueHighlight}>{data.receipt_number}</Text>
            </Text>
            <Text style={styles.metaLabelText}>
              Date: <Text style={styles.metaValueHighlight}>{formattedDate}</Text>
            </Text>
          </View>
        </View>

        {/* Order Details Box */}
        <View style={styles.orderDetailsBox}>
          <Text style={styles.orderDetailsTitle}>Order details</Text>

          <View style={styles.orderGrid}>
            <View style={styles.orderGridCol}>
              <Text style={styles.orderItemLabel}>BILLED TO</Text>
              <Text style={styles.orderItemValue}>
                {data.advertiser_email || data.advertiser_name || 'Brand Partner'}
              </Text>
            </View>
            <View style={styles.orderGridCol}>
              <Text style={styles.orderItemLabel}>PAYMENT SOURCE</Text>
              <Text style={styles.orderItemValue}>{paymentSourceStr}</Text>
            </View>
            <View style={styles.orderGridCol}>
              <Text style={styles.orderItemLabel}>FINAL COST</Text>
              <Text style={styles.orderItemValue}>{formatCurrency(finalTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.thDesc}>DESCRIPTION</Text>
            <Text style={styles.thPrice}>PRICE</Text>
            <Text style={styles.thDuration}>DURATION</Text>
            <Text style={styles.thQty}>QTY</Text>
            <Text style={styles.thAmount}>AMOUNT</Text>
          </View>

          {/* Main Item Row */}
          <View style={styles.tableRow}>
            <View style={styles.tdDesc}>
              <Text style={styles.tdDescTitle}>{descriptionTitle}</Text>
            </View>
            <Text style={styles.tdPrice}>{formatCurrency(mainRowAmount)}</Text>
            <Text style={styles.tdDuration}>{durationStr}</Text>
            <Text style={styles.tdQty}>1</Text>
            <Text style={styles.tdAmount}>{formatCurrency(mainRowAmount)}</Text>
          </View>

          {/* Featured Placement Row (If applied) */}
          {hasFeaturedAddOn && data.featured_fee ? (
            <View style={styles.tableRow}>
              <View style={styles.tdDesc}>
                <Text style={styles.tdDescTitle}>Featured Campaign Placement Boost</Text>
                <Text style={styles.tdDescSub}>Top banner placement & high priority creator notifications</Text>
              </View>
              <Text style={styles.tdPrice}>{formatCurrency(data.featured_fee)}</Text>
              <Text style={styles.tdDuration}>7 Days</Text>
              <Text style={styles.tdQty}>1</Text>
              <Text style={styles.tdAmount}>{formatCurrency(data.featured_fee)}</Text>
            </View>
          ) : null}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalVal}>{formatCurrency(finalTotal)}</Text>
            </View>
            <View style={styles.finalTotalRow}>
              <Text style={styles.finalTotalLabel}>Total</Text>
              <Text style={styles.finalTotalVal}>{formatCurrency(finalTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Additional Transaction Details (Spaceship-style guidance) */}
        <View style={styles.additionalSection}>
          <Text style={styles.additionalTitle}>Additional Transaction Details</Text>

          <View style={styles.guidanceBlock}>
            <Text style={styles.guidanceHeading}>Campaign Deployment</Text>
            <Text style={styles.guidanceText}>
              If you launched an ad campaign, it is now live and accepting creator submissions. You can discover top-performing creators in Kpugi Marketplace or visit your Campaign Dashboard to monitor verified view counts, submissions, and milestone releases.
            </Text>
          </View>

          <View style={styles.guidanceBlock}>
            <Text style={styles.guidanceHeading}>Customer Support</Text>
            <Text style={styles.guidanceText}>
              Feel free to contact our Customer Service team if you have any questions or concerns. We are available 24/7 at support@kpugi.com.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerCompany}>
            © {new Date().getFullYear()} Kpugi Marketplace
          </Text>
          <Text style={styles.footerDisclaimer}>
            Kpugi is a performance media marketplace for creators and brands. All rights reserved.
          </Text>
        </View>

      </Page>
    </Document>
  );
};
