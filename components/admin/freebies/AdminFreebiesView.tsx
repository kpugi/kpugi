'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import {
  Gift,
  Flame,
  BadgePercent,
  Package,
  Zap,
  Plus,
  Eye,
  Pause,
  Play,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  Check,
  Lock,
  LayoutGrid,
  ArrowRight,
  Pencil,
  RotateCcw,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
} from 'lucide-react';
import { PlatformPerk, AdminPerkClaimRow, PerkType } from '@/lib/supabase/perks';
import { getCreatorLevel } from '@/lib/utils/levels';
import {
  adminDeployPerkAction,
  adminUpdatePerkAction,
  adminDeletePerkAction,
  adminApprovePerkClaimAction,
  adminRejectPerkClaimAction,
  adminUpdatePerkStatusAction,
} from '@/app/actions/perks';

// TailAdmin Components
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/admin/components/ui/table';
import Badge from '@/components/admin/components/ui/badge/Badge';
import Button from '@/components/admin/components/ui/button/Button';
import { Modal } from '@/components/admin/components/ui/modal';
import Pagination from '@/components/admin/components/tables/Pagination';
import Label from '@/components/admin/components/form/Label';
import Input from '@/components/admin/components/form/input/InputField';
import TextArea from '@/components/admin/components/form/input/TextArea';

// ─────────────────────────────────────────────────────────────────────────────
// PRESETS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const COVER_PRESETS = [
  { label: 'Reel / Video',      url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&auto=format&fit=crop&q=80' },
  { label: 'Business / Collab', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80' },
  { label: 'Phone / Tech',      url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80' },
  { label: 'Editing / SaaS',    url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80' },
  { label: 'Finance',           url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80' },
  { label: 'Music',             url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80' },
  { label: 'Gear / Studio',     url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80' },
  { label: 'Digital Art',       url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cash / Wallet',     url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80' },
  { label: 'Team / Referral',   url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80' },
];

interface AdminFreebiesViewProps {
  perks: PlatformPerk[];
  pendingClaims: AdminPerkClaimRow[];
  metrics: {
    activePerksCount: number;
    pendingReviewCount: number;
    totalNairaPaidOut: number;
  };
  adminId: string;
}

const renderPerkTypeBadge = (type: PerkType) => {
  if (type === 'challenge') {
    return <Badge color="warning" size="sm" startIcon={<Flame className="w-3 h-3" />}>Challenge</Badge>;
  }
  if (type === 'coupon') {
    return <Badge color="info" size="sm" startIcon={<BadgePercent className="w-3 h-3" />}>Coupon</Badge>;
  }
  return <Badge color="success" size="sm" startIcon={<Gift className="w-3 h-3" />}>Freebie</Badge>;
};

const renderStatusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'active') return <Badge color="success" size="sm">Active</Badge>;
  if (s === 'paused') return <Badge color="warning" size="sm">Paused</Badge>;
  if (s === 'expired') return <Badge color="error" size="sm">Expired</Badge>;
  return <Badge color="dark" size="sm">{status}</Badge>;
};

// ─────────────────────────────────────────────────────────────────────────────
// DEPLOY WIZARD MODAL (TailAdmin)
// ─────────────────────────────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3 | 4;

interface WizardState {
  perk_type: PerkType;
  category: string;
  title: string;
  description: string;
  cover_image_url: string;
  reward_type: string;
  reward_amount: string;
  coupon_code: string;
  affiliate_url: string;
  has_affiliate_disclaimer: boolean;
  min_creator_level: number;
  requires_proof: boolean;
  proof_instructions: string;
  total_quota: string;
  savings_value: string;
  partner_name: string;
  end_at: string;
}

const WIZARD_DEFAULTS: WizardState = {
  perk_type: 'challenge',
  category: 'cash_bounty',
  title: '',
  description: '',
  cover_image_url: COVER_PRESETS[0].url,
  reward_type: 'cash_wallet',
  reward_amount: '',
  coupon_code: '',
  affiliate_url: '',
  has_affiliate_disclaimer: false,
  min_creator_level: 1,
  requires_proof: true,
  proof_instructions: '',
  total_quota: '',
  savings_value: '',
  partner_name: '',
  end_at: '',
};

function DeployWizard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<WizardStep>(1);
  const [form, setForm] = useState<WizardState>(WIZARD_DEFAULTS);
  const [isPending, startTransition] = useTransition();

  const set = (key: keyof WizardState, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleDeploy = () => {
    if (!form.title.trim() || !form.description.trim()) {
      alert('Please fill in both a title and description.');
      return;
    }
    startTransition(async () => {
      const res = await adminDeployPerkAction({
        title: form.title.trim(),
        slug: slugify(form.title) || `perk-${Date.now()}`,
        description: form.description.trim(),
        perk_type: form.perk_type,
        category: form.category || 'general',
        cover_image_url: form.cover_image_url || COVER_PRESETS[0].url,
        theme_color: 'indigo',
        reward_type: form.reward_type as any,
        reward_amount: Number(form.reward_amount) || 0,
        coupon_code: form.coupon_code.trim() || null,
        affiliate_url: form.affiliate_url.trim() || null,
        has_affiliate_disclaimer: form.has_affiliate_disclaimer,
        min_creator_level: form.min_creator_level,
        requires_proof: form.requires_proof,
        proof_instructions: form.proof_instructions.trim() || null,
        total_quota: form.total_quota ? parseInt(form.total_quota, 10) : null,
        savings_value: form.savings_value.trim() || null,
        partner_name: form.partner_name.trim() || null,
        status: 'active',
        start_at: new Date().toISOString(),
        end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
      });
      if (res.success) {
        onClose();
      } else {
        alert(res.error || 'Failed to deploy perk.');
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="border-b border-gray-100 dark:border-gray-800 pb-4 pr-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Deploy New Perk</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Step {step} of 4 — Configure criteria, rewards, and eligibility
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2">
          {([1, 2, 3, 4] as WizardStep[]).map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-800'
              }`}
            />
          ))}
        </div>

        {/* Wizard Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Perk Type</Label>
                <select
                  value={form.perk_type}
                  onChange={(e) => set('perk_type', e.target.value as PerkType)}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden"
                >
                  <option value="challenge">🔥 Challenge Bounty</option>
                  <option value="coupon">🏷️ Discount Coupon</option>
                  <option value="freebie">📦 Freebie / Gear</option>
                </select>
              </div>

              <div>
                <Label>Category</Label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden"
                >
                  <option value="cash_bounty">Cash Bounty</option>
                  <option value="gear_hardware">Gear &amp; Hardware</option>
                  <option value="software_deals">Software &amp; Tools</option>
                  <option value="agency_retainers">Agency Retainers</option>
                  <option value="travel_events">Travel &amp; Events</option>
                  <option value="food_lifestyle">Food &amp; Lifestyle</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Perk Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. ₦150,000 TikTok Sound Challenge"
              />
            </div>

            <div>
              <Label>Description *</Label>
              <TextArea
                rows={3}
                value={form.description}
                onChange={(val) => set('description', val)}
                placeholder="Explain the perks value, how creators qualify, and partner background..."
              />
            </div>

            <div>
              <Label>Cover Image</Label>
              <Input
                value={form.cover_image_url}
                onChange={(e) => set('cover_image_url', e.target.value)}
                placeholder="https://..."
              />
              <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
                {COVER_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => set('cover_image_url', preset.url)}
                    className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-all border ${
                      form.cover_image_url === preset.url
                        ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 font-bold'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Step 2: Rewards & Economics */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Reward Type</Label>
                <select
                  value={form.reward_type}
                  onChange={(e) => set('reward_type', e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden"
                >
                  <option value="cash_wallet">Wallet Cash Payout (₦)</option>
                  <option value="coupon_discount">Discount / Coupon Code</option>
                  <option value="gear_item">Physical Gear / Hardware</option>
                  <option value="software_sub">Software Subscription</option>
                </select>
              </div>

              <div>
                <Label>Reward Amount (₦)</Label>
                <Input
                  type="number"
                  value={form.reward_amount}
                  onChange={(e) => set('reward_amount', e.target.value)}
                  placeholder="e.g. 50000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Partner / Brand Name</Label>
                <Input
                  value={form.partner_name}
                  onChange={(e) => set('partner_name', e.target.value)}
                  placeholder="e.g. Sony Music West Africa"
                />
              </div>

              <div>
                <Label>Savings Value / Worth Display</Label>
                <Input
                  value={form.savings_value}
                  onChange={(e) => set('savings_value', e.target.value)}
                  placeholder="e.g. 20% Off or Worth ₦85,000"
                />
              </div>
            </div>

            {form.perk_type === 'coupon' && (
              <div>
                <Label>Promo / Coupon Code</Label>
                <Input
                  value={form.coupon_code}
                  onChange={(e) => set('coupon_code', e.target.value)}
                  placeholder="e.g. KPUGIVIP50"
                />
              </div>
            )}

            <div>
              <Label>Partner / Affiliate Link</Label>
              <Input
                type="url"
                value={form.affiliate_url}
                onChange={(e) => set('affiliate_url', e.target.value)}
                placeholder="https://partner.com/deal?ref=kpugi"
              />
            </div>
          </div>
        )}

        {/* Wizard Step 3: Rules & Targeting */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Minimum Creator Level</Label>
                <select
                  value={form.min_creator_level}
                  onChange={(e) => set('min_creator_level', Number(e.target.value))}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden"
                >
                  <option value={1}>Level 1: Novice (₦0+)</option>
                  <option value={2}>Level 2: Rising (₦50K+)</option>
                  <option value={3}>Level 3: Pro (₦200K+)</option>
                  <option value={4}>Level 4: Star (₦500K+)</option>
                  <option value={5}>Level 5: Legend (₦1M+)</option>
                </select>
              </div>

              <div>
                <Label>Total Quota (Blank for Unlimited)</Label>
                <Input
                  type="number"
                  value={form.total_quota}
                  onChange={(e) => set('total_quota', e.target.value)}
                  placeholder="e.g. 50"
                />
              </div>
            </div>

            <div>
              <Label>Expiration Date</Label>
              <Input
                type="date"
                value={form.end_at}
                onChange={(e) => set('end_at', e.target.value)}
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.requires_proof}
                  onChange={(e) => set('requires_proof', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-700 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Requires proof submission (video link / screenshot)
                </span>
              </label>
            </div>

            {form.requires_proof && (
              <div>
                <Label>Proof Instructions for Creators</Label>
                <TextArea
                  rows={3}
                  value={form.proof_instructions}
                  onChange={(val) => set('proof_instructions', val)}
                  placeholder="e.g. Post a 15-second video using the official sound and paste your link here."
                />
              </div>
            )}
          </div>
        )}

        {/* Wizard Step 4: Summary & Deploy */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-gray-900 dark:text-white">{form.title || 'Untitled Perk'}</h4>
                {renderPerkTypeBadge(form.perk_type)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{form.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                <div>
                  <span className="text-gray-400">Reward:</span>{' '}
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {form.reward_type === 'cash_wallet' ? `₦${Number(form.reward_amount).toLocaleString()}` : form.savings_value || form.reward_type}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Min Rank:</span>{' '}
                  <span className="font-semibold text-gray-800 dark:text-white">Level {form.min_creator_level}+</span>
                </div>
                <div>
                  <span className="text-gray-400">Quota:</span>{' '}
                  <span className="font-semibold text-gray-800 dark:text-white">{form.total_quota || 'Unlimited'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Partner:</span>{' '}
                  <span className="font-semibold text-gray-800 dark:text-white">{form.partner_name || 'Kpugi Direct'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (step === 1 ? onClose() : setStep((s) => (s - 1) as WizardStep))}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 4 ? (
            <Button
              size="sm"
              onClick={() => setStep((s) => (s + 1) as WizardStep)}
              endIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleDeploy}
              disabled={isPending}
              startIcon={<Gift className="w-4 h-4" />}
            >
              {isPending ? 'Deploying...' : 'Deploy Perk'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REJECT MODAL (TailAdmin)
// ─────────────────────────────────────────────────────────────────────────────

function RejectModal({
  claim,
  onConfirm,
  onClose,
}: {
  claim: AdminPerkClaimRow;
  onConfirm: (notes: string) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState('');
  return (
    <Modal isOpen={Boolean(claim)} onClose={onClose} className="max-w-md p-6 sm:p-8">
      <div className="flex flex-col gap-4">
        <div className="pr-8">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Reject Claim</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Provide feedback so the creator can understand what to fix and resubmit.
          </p>
        </div>
        <div>
          <Label>Rejection Notes</Label>
          <TextArea
            rows={3}
            value={notes}
            onChange={(val) => setNotes(val)}
            placeholder='e.g. "Video is set to private" or "Wrong sound was used"'
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <button
            disabled={!notes.trim()}
            onClick={() => onConfirm(notes.trim())}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-theme-xs"
          >
            Reject Claim
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT PERK MODAL (TailAdmin)
// ─────────────────────────────────────────────────────────────────────────────

function EditPerkModal({
  perk,
  onClose,
}: {
  perk: PlatformPerk;
  onClose: () => void;
}) {
  const [activeSection, setActiveSection] = useState<'content' | 'reward' | 'rules'>('content');
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: perk.title || '',
    description: perk.description || '',
    perk_type: perk.perk_type || 'challenge',
    category: perk.category || 'general',
    cover_image_url: perk.cover_image_url || '',
    status: perk.status || 'active',
    reward_type: perk.reward_type || 'cash_wallet',
    reward_amount: perk.reward_amount ? String(perk.reward_amount) : '',
    savings_value: perk.savings_value || '',
    partner_name: perk.partner_name || '',
    coupon_code: perk.coupon_code || '',
    affiliate_url: perk.affiliate_url || '',
    has_affiliate_disclaimer: perk.has_affiliate_disclaimer || false,
    min_creator_level: perk.min_creator_level || 1,
    requires_proof: perk.requires_proof ?? true,
    proof_instructions: perk.proof_instructions || '',
    total_quota: perk.total_quota ? String(perk.total_quota) : '',
    end_at: perk.end_at ? perk.end_at.slice(0, 10) : '',
  });

  const set = (key: string, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (!form.title.trim() || !form.description.trim()) {
      alert('Please fill in both a title and description.');
      return;
    }

    startTransition(async () => {
      const res = await adminUpdatePerkAction(perk.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        perk_type: form.perk_type as PerkType,
        category: form.category,
        cover_image_url: form.cover_image_url.trim() || COVER_PRESETS[0].url,
        status: form.status as any,
        reward_type: form.reward_type as any,
        reward_amount: Number(form.reward_amount) || 0,
        savings_value: form.savings_value.trim() || null,
        partner_name: form.partner_name.trim() || null,
        coupon_code: form.coupon_code.trim() || null,
        affiliate_url: form.affiliate_url.trim() || null,
        has_affiliate_disclaimer: form.has_affiliate_disclaimer,
        min_creator_level: Number(form.min_creator_level) || 1,
        requires_proof: form.requires_proof,
        proof_instructions: form.proof_instructions.trim() || null,
        total_quota: form.total_quota ? parseInt(form.total_quota, 10) : null,
        end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
      });

      if (res.success) {
        onClose();
      } else {
        alert(res.error || 'Failed to update perk.');
      }
    });
  };

  return (
    <Modal
      isOpen={Boolean(perk)}
      onClose={onClose}
      className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
    >
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 pr-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Perk</h2>
              {renderStatusBadge(form.status)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Update details, criteria, rewards and availability
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveSection('content')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeSection === 'content'
                ? 'border-brand-500 text-brand-500 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            General &amp; Content
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('reward')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeSection === 'reward'
                ? 'border-brand-500 text-brand-500 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Reward &amp; Partner
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('rules')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeSection === 'rules'
                ? 'border-brand-500 text-brand-500 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Eligibility &amp; Verification
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          {activeSection === 'content' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Perk Type</Label>
                  <select
                    value={form.perk_type}
                    onChange={(e) => set('perk_type', e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden"
                  >
                    <option value="challenge">🔥 Challenge Bounty</option>
                    <option value="coupon">🏷️ Discount Coupon</option>
                    <option value="freebie">📦 Freebie / Gear</option>
                  </select>
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    value={form.status}
                    onChange={(e) => set('status', e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden"
                >
                  <option value="cash_bounty">Cash Bounty</option>
                  <option value="gear_hardware">Gear &amp; Hardware</option>
                  <option value="software_deals">Software &amp; Tools</option>
                  <option value="agency_retainers">Agency Retainers</option>
                  <option value="travel_events">Travel &amp; Events</option>
                  <option value="food_lifestyle">Food &amp; Lifestyle</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. ₦150,000 TikTok Sound Challenge"
                />
              </div>

              <div>
                <Label>Description *</Label>
                <TextArea
                  rows={3}
                  value={form.description}
                  onChange={(val) => set('description', val)}
                  placeholder="Explain perks value, requirements, and benefits..."
                />
              </div>

              <div>
                <Label>Cover Image URL</Label>
                <Input
                  value={form.cover_image_url}
                  onChange={(e) => set('cover_image_url', e.target.value)}
                  placeholder="https://..."
                />
                <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
                  {COVER_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => set('cover_image_url', preset.url)}
                      className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-all border ${
                        form.cover_image_url === preset.url
                          ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 font-bold'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'reward' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Reward Type</Label>
                  <select
                    value={form.reward_type}
                    onChange={(e) => set('reward_type', e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden"
                  >
                    <option value="cash_wallet">Wallet Cash Payout (₦)</option>
                    <option value="coupon_discount">Discount / Coupon Code</option>
                    <option value="gear_item">Physical Gear / Hardware</option>
                    <option value="software_sub">Software Subscription</option>
                  </select>
                </div>

                <div>
                  <Label>Reward Amount (₦)</Label>
                  <Input
                    type="number"
                    value={form.reward_amount}
                    onChange={(e) => set('reward_amount', e.target.value)}
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Savings Value / Worth Display</Label>
                  <Input
                    value={form.savings_value}
                    onChange={(e) => set('savings_value', e.target.value)}
                    placeholder="e.g. 20% Off or Worth ₦85,000"
                  />
                </div>

                <div>
                  <Label>Partner / Brand Name</Label>
                  <Input
                    value={form.partner_name}
                    onChange={(e) => set('partner_name', e.target.value)}
                    placeholder="e.g. Sony Music"
                  />
                </div>
              </div>

              <div>
                <Label>Coupon Code (Optional)</Label>
                <Input
                  value={form.coupon_code}
                  onChange={(e) => set('coupon_code', e.target.value)}
                  placeholder="e.g. KPUGI20"
                />
              </div>

              <div>
                <Label>Affiliate / Partner Link</Label>
                <Input
                  type="url"
                  value={form.affiliate_url}
                  onChange={(e) => set('affiliate_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {activeSection === 'rules' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Creator Level</Label>
                  <select
                    value={form.min_creator_level}
                    onChange={(e) => set('min_creator_level', Number(e.target.value))}
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden"
                  >
                    <option value={1}>Level 1: Novice (₦0+)</option>
                    <option value={2}>Level 2: Rising (₦50K+)</option>
                    <option value={3}>Level 3: Pro (₦200K+)</option>
                    <option value={4}>Level 4: Star (₦500K+)</option>
                    <option value={5}>Level 5: Legend (₦1M+)</option>
                  </select>
                </div>

                <div>
                  <Label>Total Quota (Blank for Unlimited)</Label>
                  <Input
                    type="number"
                    value={form.total_quota}
                    onChange={(e) => set('total_quota', e.target.value)}
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <div>
                <Label>Expiration Date</Label>
                <Input
                  type="date"
                  value={form.end_at}
                  onChange={(e) => set('end_at', e.target.value)}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.requires_proof}
                    onChange={(e) => set('requires_proof', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-700 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Requires proof submission (video link / screenshot)
                  </span>
                </label>
              </div>

              {form.requires_proof && (
                <div>
                  <Label>Proof Instructions for Creators</Label>
                  <TextArea
                    rows={3}
                    value={form.proof_instructions}
                    onChange={(val) => set('proof_instructions', val)}
                    placeholder="e.g. Post a public 15-second video meeting view criteria and paste URL..."
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN VIEW: AdminFreebiesView (TailAdmin Components Standard)
// ─────────────────────────────────────────────────────────────────────────────

type SortField = 'title' | 'type' | 'level' | 'reward' | 'claims' | 'status';
type SortDirection = 'asc' | 'desc';

export default function AdminFreebiesView({
  perks,
  pendingClaims,
  metrics,
  adminId,
}: AdminFreebiesViewProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'review'>('catalog');
  const [showWizard, setShowWizard] = useState(false);
  const [editingPerk, setEditingPerk] = useState<PlatformPerk | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rejectTarget, setRejectTarget] = useState<AdminPerkClaimRow | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtered & Sorted Perks
  const filteredPerks = useMemo(() => {
    let list = perks.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.partner_name ?? '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchType = typeFilter === 'all' || p.perk_type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'type') {
        comparison = a.perk_type.localeCompare(b.perk_type);
      } else if (sortField === 'level') {
        comparison = (a.min_creator_level || 0) - (b.min_creator_level || 0);
      } else if (sortField === 'reward') {
        comparison = (Number(a.reward_amount) || 0) - (Number(b.reward_amount) || 0);
      } else if (sortField === 'claims') {
        comparison = (a.claimed_count || 0) - (b.claimed_count || 0);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [perks, search, statusFilter, typeFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredPerks.length / itemsPerPage));
  const paginatedPerks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPerks.slice(start, start + itemsPerPage);
  }, [filteredPerks, currentPage, itemsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleApprove = (claimId: string) => {
    startTransition(async () => {
      const res = await adminApprovePerkClaimAction(claimId);
      if (!res.success) {
        alert(res.error || 'Failed to approve claim.');
      }
    });
  };

  const handleRejectConfirm = (notes: string) => {
    if (!rejectTarget) return;
    startTransition(async () => {
      const res = await adminRejectPerkClaimAction(rejectTarget.id, notes);
      if (!res.success) {
        alert(res.error || 'Failed to reject claim.');
      }
      setRejectTarget(null);
    });
  };

  const handleToggleStatus = (perk: PlatformPerk) => {
    const nextStatus = perk.status === 'active' ? 'paused' : 'active';
    startTransition(async () => {
      const res = await adminUpdatePerkStatusAction(perk.id, nextStatus);
      if (!res.success) {
        alert(res.error || 'Failed to update perk status.');
      }
    });
  };

  const handleDeletePerk = (perk: PlatformPerk) => {
    if (confirm(`Are you sure you want to permanently delete "${perk.title}"? This action cannot be undone.`)) {
      startTransition(async () => {
        const res = await adminDeletePerkAction(perk.id);
        if (!res.success) {
          alert(res.error || 'Failed to delete perk.');
        }
      });
    }
  };

  const isFiltered = search !== '' || statusFilter !== 'all' || typeFilter !== 'all';
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Modals */}
      <DeployWizard isOpen={showWizard} onClose={() => setShowWizard(false)} />
      {editingPerk && <EditPerkModal perk={editingPerk} onClose={() => setEditingPerk(null)} />}
      {rejectTarget && (
        <RejectModal
          claim={rejectTarget}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
        />
      )}

      {/* ── METRIC CARDS (TailAdmin KPI Standard) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs mb-1 font-medium">
            <span>Active Perks</span>
            <Gift className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
            {metrics.activePerksCount}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            Live in Creator Hub
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs mb-1 font-medium">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {metrics.pendingReviewCount}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            Submissions in queue
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs mb-1 font-medium">
            <span>Total Paid Out</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ₦{metrics.totalNairaPaidOut.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            Direct wallet releases
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 text-xs mb-1 font-medium">
            <span>Catalog Total</span>
            <Package className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
            {perks.length}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            Across all 3 categories
          </div>
        </div>
      </div>

      {/* ── MAIN TABLE CONTAINER (TailAdmin Basic Table Standard) ─── */}
      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A]">
        {/* Navigation Tabs Bar */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-slate-900/20">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Perks Catalog</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">
                {perks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'review'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Proof Review Queue</span>
              {metrics.pendingReviewCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  {metrics.pendingReviewCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'catalog' && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:inline">
                Showing {filteredPerks.length} of {perks.length} perks
              </span>
            )}
            <Button
              onClick={() => setShowWizard(true)}
              startIcon={<Plus className="w-4 h-4" />}
              size="sm"
            >
              Deploy New Perk
            </Button>
          </div>
        </div>

        {/* ── TAB 1: PERKS CATALOG ─── */}
        {activeTab === 'catalog' && (
          <>
            {/* Filter Toolbar */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800/80">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
                {/* Left: Status & Type Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
                    {['all', 'active', 'paused', 'draft'].map((st) => {
                      const isActive = statusFilter === st;
                      const count = st === 'all' ? perks.length : perks.filter((p) => p.status === st).length;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setStatusFilter(st);
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${
                            isActive
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          {st} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Type Filter Pills */}
                  <div className="flex items-center gap-1.5">
                    {(['all', 'challenge', 'coupon', 'freebie'] as const).map((t) => {
                      const isSel = typeFilter === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setTypeFilter(t);
                            setCurrentPage(1);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize border ${
                            isSel
                              ? 'bg-brand-50 text-brand-600 border-brand-300 dark:bg-brand-500/15 dark:text-brand-400 dark:border-brand-700 shadow-2xs'
                              : 'bg-white dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          {t === 'all' ? 'All Types' : t}
                        </button>
                      );
                    })}

                    {isFiltered && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Reset all filters"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Search & Page Size */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="relative w-full sm:w-56 lg:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search perks or partners..."
                      className="h-9 w-full rounded-lg border appearance-none ps-8 pe-8 py-1.5 text-xs shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-2 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                    {search && (
                      <button
                        onClick={() => {
                          setSearch('');
                          setCurrentPage(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    <span className="hidden sm:inline">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-9 px-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-slate-800/80 bg-gray-50/70 dark:bg-slate-900/40">
                  <TableRow>
                    <TableCell
                      isHeader
                      onClick={() => handleSort('title')}
                      className="px-5 py-3 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Perk &amp; Brand</span>
                        {sortField === 'title' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell
                      isHeader
                      onClick={() => handleSort('type')}
                      className="px-5 py-3 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hidden md:table-cell hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Type</span>
                        {sortField === 'type' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell
                      isHeader
                      onClick={() => handleSort('level')}
                      className="px-5 py-3 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hidden lg:table-cell hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Min Rank</span>
                        {sortField === 'level' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell
                      isHeader
                      onClick={() => handleSort('reward')}
                      className="px-5 py-3 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hidden lg:table-cell hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Reward / Value</span>
                        {sortField === 'reward' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell
                      isHeader
                      onClick={() => handleSort('claims')}
                      className="px-5 py-3 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hidden md:table-cell hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Quota / Claims</span>
                        {sortField === 'claims' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell
                      isHeader
                      onClick={() => handleSort('status')}
                      className="px-5 py-3 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        {sortField === 'status' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell isHeader className="px-5 py-3 text-end text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedPerks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
                        No perks match your filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPerks.map((perk) => (
                      <TableRow
                        key={perk.id}
                        className="border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Title & Brand */}
                        <TableCell className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200/60 dark:border-gray-700">
                              <img
                                src={perk.cover_image_url || COVER_PRESETS[0].url}
                                alt={perk.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[220px]">
                                {perk.title}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                {perk.partner_name || 'Kpugi Network Partner'}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Type */}
                        <TableCell className="px-5 py-3.5 hidden md:table-cell">
                          {renderPerkTypeBadge(perk.perk_type)}
                        </TableCell>

                        {/* Min Rank */}
                        <TableCell className="px-5 py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1 font-medium">
                            <Lock className="w-3 h-3 text-gray-400" />
                            Level {perk.min_creator_level}+
                          </span>
                        </TableCell>

                        {/* Reward */}
                        <TableCell className="px-5 py-3.5 hidden lg:table-cell">
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {perk.reward_type === 'cash_wallet'
                              ? `₦${Number(perk.reward_amount).toLocaleString()}`
                              : perk.savings_value || perk.reward_type.replace('_', ' ')}
                          </span>
                        </TableCell>

                        {/* Claims */}
                        <TableCell className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                            {perk.claimed_count}
                            {perk.total_quota ? ` / ${perk.total_quota}` : ' (∞)'}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="px-5 py-3.5">
                          {renderStatusBadge(perk.status)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => setEditingPerk(perk)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/15 transition-all cursor-pointer"
                              title="Edit Perk"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(perk)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                              title={perk.status === 'active' ? 'Pause Perk' : 'Activate Perk'}
                            >
                              {perk.status === 'active' ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeletePerk(perk)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/15 transition-all cursor-pointer"
                              title="Delete Perk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}

        {/* ── TAB 2: PROOF REVIEW QUEUE ─── */}
        {activeTab === 'review' && (
          <div className="p-5 space-y-4">
            {pendingClaims.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white">All caught up</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  There are no pending proof submissions awaiting review.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingClaims.map((claim) => {
                  const perk = claim.perk;
                  const creator = claim.creator;
                  const rankData = creator ? getCreatorLevel(creator.total_earned) : null;

                  return (
                    <div
                      key={claim.id}
                      className="p-4 rounded-xl border border-gray-200/80 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-900/30 flex flex-col md:flex-row gap-4"
                    >
                      {/* Creator / Brand info */}
                      <div className="flex items-center gap-3 md:w-56 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                          {creator?.full_name?.charAt(0) ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {creator?.full_name ?? 'Unknown'}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            {creator?.role === 'advertiser'
                              ? '🏢 Brand / Advertiser'
                              : `@${creator?.creator_handle ?? 'creator'}`}
                          </p>
                          {creator?.role === 'advertiser' ? (
                            <span className="inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">
                              Brand Account
                            </span>
                          ) : (
                            rankData && (
                              <span className="text-[10px] font-bold text-brand-500">
                                {rankData.levelInfo.icon} Level {rankData.currentLevelNumber}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Perk details & Submission */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                              {perk?.perk_type ?? 'challenge'}
                            </span>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {perk?.title ?? '—'}
                            </p>
                          </div>
                          {perk?.reward_type === 'cash_wallet' && (
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-500/20">
                              ₦{Number(perk.reward_amount).toLocaleString()} Cash
                            </span>
                          )}
                        </div>

                        {claim.proof_url && (
                          <a
                            href={claim.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Inspect Proof URL</span>
                          </a>
                        )}

                        {claim.proof_notes && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 italic bg-white dark:bg-gray-800/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/60">
                            "{claim.proof_notes}"
                          </p>
                        )}

                        {claim.submitted_at && (
                          <p className="text-[11px] text-gray-400">
                            Submitted: {new Date(claim.submitted_at).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 md:flex-col md:justify-center md:w-36 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApprove(claim.id)}
                          disabled={isPending}
                          className="flex-1 md:w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-theme-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectTarget(claim)}
                          disabled={isPending}
                          className="flex-1 md:w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
