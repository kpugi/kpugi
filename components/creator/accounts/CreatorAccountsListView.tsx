'use client';

import React, { useState } from 'react';
import { PlatformConfig } from './CreatorAccountsView';
import { SocialAccountDetails } from '@/lib/supabase/creator';
import {
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Info,
  Copy,
  Check,
  Key,
} from 'lucide-react';

interface CreatorAccountsListViewProps {
  platforms: PlatformConfig[];
  accountsGrouped: Record<string, SocialAccountDetails[]>;
  renderIcon: (key: string, className?: string) => React.ReactNode;
  onConnect: (platform: PlatformConfig) => void;
  onVerify: (platformKey: string, handle: string, verificationCode?: string | null) => void;
  onDisconnect: (platformKey: string, handle: string, accountId?: string) => void;
  onOpenGuide: (platform: PlatformConfig) => void;
  checkLoading: string | null;
  formatCompactNumber: (num: number | null | undefined) => string;
}

export default function CreatorAccountsListView({
  platforms,
  accountsGrouped,
  renderIcon,
  onConnect,
  onVerify,
  onDisconnect,
  onOpenGuide,
  checkLoading,
  formatCompactNumber,
}: CreatorAccountsListViewProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <div className="rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 overflow-hidden shadow-xs">
      {/* Desktop Table Header */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-white/[0.03] border-b border-kpugi-border dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400 font-mono">
        <div className="col-span-3">Network & Category</div>
        <div className="col-span-4">Connected Handle & Verification Code</div>
        <div className="col-span-2">Verification Status</div>
        <div className="col-span-1 text-right">Audience</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-kpugi-border dark:divide-white/5">
        {platforms.map((platform) => {
          const pKey = platform.key === 'twitter' ? 'x' : platform.key;
          const accountsList = accountsGrouped[pKey] || accountsGrouped[platform.key] || [];
          const hasAccounts = accountsList.length > 0;

          if (!hasAccounts) {
            return (
              <div
                key={platform.key}
                className="p-5 lg:px-6 lg:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-kpugi-border dark:border-white/10 flex items-center justify-center shrink-0 shadow-xs">
                    {renderIcon(platform.key, 'w-5 h-5')}
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <h4 className="font-display font-bold text-sm text-kpugi-ink dark:text-white leading-tight">
                        {platform.name}
                      </h4>
                      <span className="text-[11px] text-kpugi-slate dark:text-slate-400 font-medium">
                        {platform.category}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenGuide(platform)}
                      title={`Verification Guide for ${platform.name}`}
                      className="p-1.5 rounded-lg text-kpugi-slate dark:text-slate-400 hover:text-kpugi-blue dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                    Not Linked
                  </span>
                  <button
                    onClick={() => onConnect(platform)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-kpugi-blue/10 dark:bg-kpugi-blue/20 text-kpugi-blue dark:text-blue-400 hover:bg-kpugi-blue hover:text-white text-xs font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={platform.key} className="bg-transparent">
              {/* Account Rows */}
              <div className="divide-y divide-kpugi-border/50 dark:divide-white/5">
                {accountsList.map((account, idx) => {
                  const isVerified = account.verificationStatus === 'verified';
                  const isPending = !isVerified;
                  const isLoading = checkLoading === account.handle;
                  const methodLabel = account.verificationMethod === 'post' ? 'Post' : 'Bio';

                  return (
                    <div
                      key={account.id || `${platform.key}-${account.handle}-${idx}`}
                      className="p-5 lg:px-6 lg:py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Col 1: Platform & Category + Info Guide Button */}
                      <div className="lg:col-span-3 flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-kpugi-border dark:border-white/10 flex items-center justify-center shrink-0 shadow-xs">
                          {renderIcon(platform.key, 'w-5 h-5')}
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="min-w-0">
                            <h4 className="font-display font-bold text-sm text-kpugi-ink dark:text-white leading-tight truncate">
                              {platform.name}
                            </h4>
                            <span className="text-[11px] text-kpugi-slate dark:text-slate-400 font-medium block truncate">
                              {platform.category}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenGuide(platform)}
                            title={`Verification Instructions for ${platform.name}`}
                            className="p-1 rounded-lg text-kpugi-slate dark:text-slate-400 hover:text-kpugi-blue dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Col 2: Handle, Avatar, & Persistent Verification Code */}
                      <div className="lg:col-span-4 flex items-start gap-3 min-w-0">
                        {account.avatarUrl ? (
                          <img
                            src={account.avatarUrl}
                            alt={account.handle}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                            className="w-9 h-9 rounded-full object-cover border border-kpugi-border dark:border-white/10 shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-xs shrink-0 text-slate-700 dark:text-slate-300 mt-0.5">
                            {account.handle.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-kpugi-blue dark:text-blue-400 truncate">
                              @{account.handle}
                            </span>
                          </div>

                          {/* If Verified: show verified status */}
                          {isVerified ? (
                            <span className="text-[11px] text-kpugi-slate dark:text-slate-400 block truncate font-medium">
                              Verified Channel
                            </span>
                          ) : (
                            /* If Pending: Display Saved Verification Code with Instant Copy */
                            <div className="mt-1">
                              {account.verificationCode ? (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 dark:bg-black/80 text-white font-mono text-[10px] border border-slate-800 dark:border-white/10 shadow-2xs">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">
                                      Bio Code:
                                    </span>
                                    <span className="text-emerald-400 font-extrabold select-all tracking-wider">
                                      {account.verificationCode}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => copyCode(account.verificationCode!)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-kpugi-slate dark:text-slate-200 font-sans text-[10px] font-bold transition-all border border-slate-200 dark:border-white/10 shrink-0"
                                    title="Copy Code to Clipboard"
                                  >
                                    {copiedCode === account.verificationCode ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-500" />
                                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3 text-kpugi-slate dark:text-slate-400" />
                                        <span>Copy Code</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onVerify(platform.key, account.handle, null)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                                >
                                  <Key className="w-3 h-3" />
                                  <span>Generate Verification Code</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Col 3: Status Badge */}
                      <div className="lg:col-span-2 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
                            isVerified
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
                              : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20'
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>VERIFIED</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>PENDING</span>
                            </>
                          )}
                        </span>

                        {isVerified && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                            {methodLabel}
                          </span>
                        )}
                      </div>

                      {/* Col 4: Audience Count */}
                      <div className="lg:col-span-1 lg:text-right">
                        <span className="text-[10px] text-kpugi-slate dark:text-slate-400 block lg:hidden uppercase font-mono font-semibold">
                          {platform.key === 'youtube' ? 'Subscribers' : 'Followers'}
                        </span>
                        <span className="font-mono font-extrabold text-sm text-kpugi-ink dark:text-white">
                          {account.followerCount ? formatCompactNumber(account.followerCount) : '—'}
                        </span>
                      </div>

                      {/* Col 5: Actions */}
                      <div className="lg:col-span-2 flex items-center justify-start lg:justify-end gap-2 pt-2 lg:pt-0">
                        {isPending ? (
                          <button
                            onClick={() => onVerify(platform.key, account.handle, account.verificationCode)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-sans text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                          >
                            {isLoading ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            <span>Verify</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onVerify(platform.key, account.handle, null)}
                            disabled={isLoading}
                            title="Re-check & Sync Account"
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-kpugi-blue dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                          >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-kpugi-blue' : ''}`} />
                          </button>
                        )}

                        <button
                          onClick={() => onDisconnect(platform.key, account.handle, account.id)}
                          disabled={isLoading}
                          title="Disconnect Account"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Platform Footer: Connect Multiple Handles */}
              <div className="px-5 lg:px-6 py-2.5 bg-slate-50/50 dark:bg-white/[0.015] border-t border-kpugi-border/40 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-kpugi-slate dark:text-slate-400 font-mono">
                  {accountsList.length} connected {accountsList.length === 1 ? 'handle' : 'handles'} for {platform.name}
                </span>
                <button
                  type="button"
                  onClick={() => onConnect(platform)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 hover:bg-kpugi-blue hover:text-white dark:hover:bg-kpugi-blue text-kpugi-slate dark:text-slate-200 border border-kpugi-border dark:border-white/10 text-xs font-bold transition-all shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another {platform.name} Handle</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
