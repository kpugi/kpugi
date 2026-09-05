'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

export interface MediaPlanData {
  planRef: string;
  issuedAt: string;
  validUntil: string;
  campaignType: string;
  campaignTypeName: string;
  budgetNgn: number;
  budgetFormatted: string;
  guaranteedViews: number;
  baseCpm: number;
  baseCpmFormatted: string;
  estimatedCreators: number;
  agencyViews: number;
  manualViews: number;
  currency?: string;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  // Top Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#2F49E8',
  },
  brandTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#2F49E8',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  docTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  docBadge: {
    backgroundColor: '#17A75B',
    color: '#FFFFFF',
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  metaText: {
    fontSize: 7.5,
    color: '#64748B',
    marginTop: 2,
  },

  // Executive Highlight Banner
  highlightBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  highlightViewsLabel: {
    fontSize: 7.5,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  highlightViewsVal: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  highlightBudgetBox: {
    alignItems: 'flex-end',
  },
  highlightBudgetLabel: {
    fontSize: 7.5,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  highlightBudgetVal: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 2,
  },

  // Section Headers
  sectionHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },

  // Grid Info Box
  gridBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gridCol: {
    width: '48%',
  },
  label: {
    fontSize: 7.5,
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
  },

  // Tables
  table: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 14,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRowHighlight: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  colChannel: { width: '40%' },
  colShare: { width: '20%', textAlign: 'center' },
  colViews: { width: '40%', textAlign: 'right' },

  thText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tdText: {
    fontSize: 8,
    color: '#1E293B',
  },
  tdBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#2F49E8',
  },

  // Comparison Box
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  compCard: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
  },
  compCardWinner: {
    width: '34%',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#2F49E8',
    borderRadius: 6,
    padding: 8,
  },
  compTitle: {
    fontSize: 7.5,
    color: '#64748B',
    marginBottom: 3,
  },
  compViews: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 3,
  },
  compViewsWinner: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#2F49E8',
    marginBottom: 3,
  },
  compNote: {
    fontSize: 6.5,
    color: '#64748B',
    lineHeight: 1.2,
  },

  // Legal & Escrow Terms
  termsBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  termItem: {
    fontSize: 7,
    color: '#475569',
    marginBottom: 3,
    lineHeight: 1.3,
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: '#94A3B8',
  },
});

export function MediaPlanPDFDocument({ data }: { data: MediaPlanData }) {
  const igViews = Math.round(data.guaranteedViews * 0.45);
  const tiktokViews = Math.round(data.guaranteedViews * 0.35);
  const xViews = data.guaranteedViews - igViews - tiktokViews;

  return (
    <Document title={`Kpugi_Media_Plan_${data.planRef}`}>
      <Page size="A4" style={styles.page}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brandTitle}>KPUGI</Text>
            <Text style={styles.brandSubtitle}>Performance Creator Media Network</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.docTitle}>CAMPAIGN MEDIA PLAN</Text>
            <Text style={styles.docBadge}>100% ESCROW PROTECTED</Text>
            <Text style={styles.metaText}>Plan Ref: {data.planRef}</Text>
            <Text style={styles.metaText}>Issued: {data.issuedAt}</Text>
            <Text style={styles.metaText}>Flight Validity: 14 Days ({data.validUntil})</Text>
          </View>
        </View>

        {/* Highlight Banner */}
        <View style={styles.highlightBanner}>
          <View>
            <Text style={styles.highlightViewsLabel}>Guaranteed Verified Reach Target</Text>
            <Text style={styles.highlightViewsVal}>{data.guaranteedViews.toLocaleString()} VIEWS</Text>
          </View>
          <View style={styles.highlightBudgetBox}>
            <Text style={styles.highlightBudgetLabel}>Total Campaign Budget</Text>
            <Text style={styles.highlightBudgetVal}>{data.budgetFormatted}</Text>
          </View>
        </View>

        {/* Section 1: Executive Scope */}
        <Text style={styles.sectionHeader}>1. Campaign Scope & Flight Specifications</Text>
        <View style={styles.gridBox}>
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.label}>Drop Model</Text>
              <Text style={styles.value}>{data.campaignTypeName}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.label}>Effective CPM Rate</Text>
              <Text style={styles.value}>{data.baseCpmFormatted} per 1,000 Views</Text>
            </View>
          </View>
          <View style={[styles.gridRow, { marginBottom: 0 }]}>
            <View style={styles.gridCol}>
              <Text style={styles.label}>Estimated Creators Mobilized</Text>
              <Text style={styles.value}>~{data.estimatedCreators} Verified Creators</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.label}>Creative Delivery Rule</Text>
              <Text style={styles.value}>100% Brand-Ready Creatives (Zero Filming / 0 Editing)</Text>
            </View>
          </View>
        </View>

        {/* Section 2: Channel Allocation */}
        <Text style={styles.sectionHeader}>2. Multi-Platform Channel Distribution</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.thText, styles.colChannel]}>Channel / Placement</Text>
            <Text style={[styles.thText, styles.colShare]}>Flight Share</Text>
            <Text style={[styles.thText, styles.colViews]}>Projected Verified Views</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tdText, styles.colChannel]}>Instagram Reels & Feed</Text>
            <Text style={[styles.tdText, styles.colShare]}>45%</Text>
            <Text style={[styles.tdBold, styles.colViews]}>~{igViews.toLocaleString()} views</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tdText, styles.colChannel]}>TikTok Video Drops</Text>
            <Text style={[styles.tdText, styles.colShare]}>35%</Text>
            <Text style={[styles.tdBold, styles.colViews]}>~{tiktokViews.toLocaleString()} views</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tdText, styles.colChannel]}>X (Twitter) Feed & Amplification</Text>
            <Text style={[styles.tdText, styles.colShare]}>20%</Text>
            <Text style={[styles.tdBold, styles.colViews]}>~{xViews.toLocaleString()} views</Text>
          </View>
          <View style={styles.tableRowHighlight}>
            <Text style={[styles.thText, styles.colChannel]}>Total Guaranteed Deployment</Text>
            <Text style={[styles.thText, styles.colShare]}>100%</Text>
            <Text style={[styles.thText, styles.colViews, { color: '#2F49E8' }]}>
              {data.guaranteedViews.toLocaleString()} Views
            </Text>
          </View>
        </View>

        {/* Section 3: Performance Benchmark */}
        <Text style={styles.sectionHeader}>3. Cost Efficiency & View Delivery Audit</Text>
        <View style={styles.comparisonContainer}>
          <View style={styles.compCard}>
            <Text style={styles.compTitle}>Traditional Ad Agency</Text>
            <Text style={styles.compViews}>~{data.agencyViews.toLocaleString()}</Text>
            <Text style={styles.compNote}>40% retainer markup, agency commission cuts, zero reach guarantees.</Text>
          </View>
          <View style={styles.compCard}>
            <Text style={styles.compTitle}>Direct Manual Outreach</Text>
            <Text style={styles.compViews}>~{data.manualViews.toLocaleString()}</Text>
            <Text style={styles.compNote}>Influencer ghosting, unverified bot views, no escrow backing.</Text>
          </View>
          <View style={styles.compCardWinner}>
            <Text style={[styles.compTitle, { color: '#2F49E8', fontWeight: 'bold' }]}>Kpugi Performance Suite</Text>
            <Text style={styles.compViewsWinner}>{data.guaranteedViews.toLocaleString()}</Text>
            <Text style={[styles.compNote, { color: '#1E293B' }]}>
              100% Escrow backed. Automated AI bot filter. Unspent funds refunded.
            </Text>
          </View>
        </View>

        {/* Section 4: Escrow SLA */}
        <Text style={styles.sectionHeader}>4. Escrow Protection & Performance SLA</Text>
        <View style={styles.termsBox}>
          <Text style={styles.termItem}>
            • 100% Automated Escrow Backing: Campaign funds are locked in platform escrow and disbursed to creators only upon algorithmic verification of real human views.
          </Text>
          <Text style={styles.termItem}>
            • AI Bot & Fraud Scrubbing: Real-time traffic audit removes bot views, engagement rings, and suspicious clicks before crediting view quotas.
          </Text>
          <Text style={styles.termItem}>
            • Unconditional View Milestone Refund: If any portion of the guaranteed {data.guaranteedViews.toLocaleString()} views is not achieved within the flight window, unspent funds are credited back to the brand wallet.
          </Text>
          <Text style={styles.termItem}>
            • Non-Deletion Guarantee: Creators agree to keep campaign drops active on their accounts indefinitely; unauthorized deletion forfeits creator compensation.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Kpugi Technologies Inc. • support@kpugi.com • kpugi.com</Text>
          <Text style={styles.footerText}>Official Proposal Ref: {data.planRef} • Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
}
