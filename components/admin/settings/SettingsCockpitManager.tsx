"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
  Sliders,
  Compass,
  Megaphone,
  Users,
  KeyRound,
  Clock,
  Server,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Zap,
  Shield,
  ShieldCheck,
  RefreshCw,
  Plus,
  X,
  Play,
  Check,
  DollarSign,
  Activity,
  Layers,
  Eye,
  Info,
  Download,
  Terminal,
} from "lucide-react";
import Button from "@/components/admin/components/ui/button/Button";
import Switch from "@/components/admin/components/form/switch/Switch";
import {
  PlatformSettings,
  DEFAULT_SETTINGS,
} from "@/lib/admin/platform-settings-types";
import {
  ServiceIntegrationStatus,
  updatePlatformSettingsAction,
  resetCategoryDefaultsAction,
  testServiceConnectionAction,
  triggerCronJobAction,
} from "@/app/actions/admin-settings";
import ApiKeyUpdateModal from "./modals/ApiKeyUpdateModal";
import CronRunResultModal, { CronRunResult } from "./modals/CronRunResultModal";

interface SettingsCockpitProps {
  initialSettings: PlatformSettings;
  initialIntegrations: ServiceIntegrationStatus[];
  adminProfile: {
    id: string;
    email?: string | null;
    role: string;
  };
}

type TabKey =
  | "parameters"
  | "browse"
  | "campaigns"
  | "users"
  | "integrations"
  | "crons"
  | "system";

export default function SettingsCockpitManager({
  initialSettings,
  initialIntegrations,
  adminProfile,
}: SettingsCockpitProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("parameters");
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);
  const [integrations, setIntegrations] = useState<ServiceIntegrationStatus[]>(
    initialIntegrations
  );

  // Dirty state tracking per section
  const [isMarketplaceDirty, setIsMarketplaceDirty] = useState(false);
  const [isBrowseDirty, setIsBrowseDirty] = useState(false);
  const [isCampaignsDirty, setIsCampaignsDirty] = useState(false);
  const [isUsersDirty, setIsUsersDirty] = useState(false);

  // Feedback banner state
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Transitions & loading states
  const [isPending, startTransition] = useTransition();
  const [testingServiceKey, setTestingServiceKey] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<
    Record<string, { status: string; latencyMs: number; message: string }>
  >({});

  // Modals state
  const [selectedService, setSelectedService] =
    useState<ServiceIntegrationStatus | null>(null);
  const [cronResult, setCronResult] = useState<CronRunResult | null>(null);
  const [runningCronPath, setRunningCronPath] = useState<string | null>(null);

  // New category input for Browse tab
  const [newCategoryText, setNewCategoryText] = useState("");

  // Helper to show temporary notification
  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  // Save changes handler
  const handleSaveSection = (category: keyof PlatformSettings) => {
    startTransition(async () => {
      try {
        await updatePlatformSettingsAction(category, settings[category]);
        if (category === "marketplace") setIsMarketplaceDirty(false);
        if (category === "browse") setIsBrowseDirty(false);
        if (category === "campaigns") setIsCampaignsDirty(false);
        if (category === "users") setIsUsersDirty(false);
        showToast("success", `Platform ${category} settings saved successfully.`);
      } catch (err: any) {
        showToast("error", err?.message || "Failed to update settings.");
      }
    });
  };

  // Reset to factory defaults handler
  const handleResetSection = (category: keyof PlatformSettings) => {
    if (
      !confirm(
        `Are you sure you want to reset ${category} settings back to system defaults?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await resetCategoryDefaultsAction(category);
        setSettings((prev) => ({
          ...prev,
          [category]: DEFAULT_SETTINGS[category],
        }));
        if (category === "marketplace") setIsMarketplaceDirty(false);
        if (category === "browse") setIsBrowseDirty(false);
        if (category === "campaigns") setIsCampaignsDirty(false);
        if (category === "users") setIsUsersDirty(false);
        showToast(
          "success",
          `${category.toUpperCase()} parameters reset to system defaults.`
        );
      } catch (err: any) {
        showToast("error", err?.message || "Failed to reset settings.");
      }
    });
  };

  // Test individual service connection
  const handleTestService = async (serviceKey: string) => {
    setTestingServiceKey(serviceKey);
    try {
      const res = await testServiceConnectionAction(serviceKey);
      setPingResults((prev) => ({
        ...prev,
        [serviceKey]: {
          status: res.status,
          latencyMs: res.latencyMs,
          message: res.message,
        },
      }));
    } catch (err: any) {
      setPingResults((prev) => ({
        ...prev,
        [serviceKey]: {
          status: "error",
          latencyMs: 0,
          message: err?.message || "Ping error",
        },
      }));
    } finally {
      setTestingServiceKey(null);
    }
  };

  // Trigger background cron job
  const handleTriggerCron = async (jobName: string, cronPath: string) => {
    setRunningCronPath(cronPath);
    try {
      const res = await triggerCronJobAction(cronPath);
      setCronResult({
        jobName,
        path: cronPath,
        success: res.success,
        statusCode: res.statusCode,
        latencyMs: res.latencyMs,
        payload: res.payload,
        error: res.error,
        triggeredAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setCronResult({
        jobName,
        path: cronPath,
        success: false,
        statusCode: 500,
        latencyMs: 0,
        payload: null,
        error: err?.message || "Execution failed",
        triggeredAt: new Date().toISOString(),
      });
    } finally {
      setRunningCronPath(null);
    }
  };

  // Export settings snapshot JSON
  const handleExportConfig = () => {
    const configSnapshot = {
      exportedAt: new Date().toISOString(),
      platform: "Kpugi Influencer Operations Platform",
      operator: adminProfile.email,
      settings,
    };
    const blob = new Blob([JSON.stringify(configSnapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpugi_platform_settings_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("success", "Platform configuration exported to JSON.");
  };

  // Category addition helper for browse discovery
  const handleAddCategory = () => {
    if (!newCategoryText.trim()) return;
    const cat = newCategoryText.trim();
    if (!settings.browse.activeCategories.includes(cat)) {
      setSettings((prev) => ({
        ...prev,
        browse: {
          ...prev.browse,
          activeCategories: [...prev.browse.activeCategories, cat],
        },
      }));
      setIsBrowseDirty(true);
    }
    setNewCategoryText("");
  };

  const handleRemoveCategory = (cat: string) => {
    setSettings((prev) => ({
      ...prev,
      browse: {
        ...prev.browse,
        activeCategories: prev.browse.activeCategories.filter((c) => c !== cat),
      },
    }));
    setIsBrowseDirty(true);
  };

  // Cron jobs list
  const CRON_JOBS = [
    {
      name: "Daily Settlement Engine",
      path: "/api/cron/daily-settlement",
      schedule: "Daily @ 00:00 UTC",
      status: "Active",
      description:
        "Reconciles campaign view thresholds, computes creator earnings, and transfers payouts.",
    },
    {
      name: "Submission Auto-Verifier",
      path: "/api/cron/verify-submissions",
      schedule: "Every 30 mins",
      status: "Active",
      description:
        "Fetches live social metrics (views, likes, shares) and verifies compliance against campaign briefs.",
    },
    {
      name: "Expired Campaign Closer",
      path: "/api/cron/close-expired-campaigns",
      schedule: "Hourly",
      status: "Active",
      description:
        "Automatically marks campaigns whose total budget is exhausted or deadline reached as completed.",
    },
    {
      name: "Payout Release Engine",
      path: "/api/cron/release-payouts",
      schedule: "Daily @ 06:00 UTC",
      status: "Active",
      description:
        "Dispatches pending creator withdrawal requests to Paystack bank transfers.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-gray-900 dark:text-white tracking-tight">
              Platform Settings Cockpit
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live Governance
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-1">
            Central command center for marketplace fees, public discovery rules, campaign governance, security keys, and automated tasks.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportConfig}
            className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300 font-sans"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export Settings (JSON)
          </Button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-sans transition-all animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-gray-200 dark:border-slate-800/80">
        <button
          onClick={() => setActiveTab("parameters")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all whitespace-nowrap ${
            activeTab === "parameters"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Marketplace Parameters</span>
          {isMarketplaceDirty && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("browse")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all whitespace-nowrap ${
            activeTab === "browse"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Browse & Discovery</span>
          {isBrowseDirty && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("campaigns")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all whitespace-nowrap ${
            activeTab === "campaigns"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Campaign Governance</span>
          {isCampaignsDirty && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all whitespace-nowrap ${
            activeTab === "users"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Creator & User Policies</span>
          {isUsersDirty && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all whitespace-nowrap ${
            activeTab === "integrations"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>API Keys & Services Vault</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
            {integrations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("crons")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all whitespace-nowrap ${
            activeTab === "crons"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Automations & Crons</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all whitespace-nowrap ${
            activeTab === "system"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>System Diagnostics</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MARKETPLACE PARAMETERS */}
      {/* ========================================================================= */}
      {activeTab === "parameters" && (
        <div className="space-y-6">
          {/* Maintenance Mode Banner Card */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              settings.marketplace.maintenanceMode
                ? "bg-rose-950/20 border-rose-500/30 text-rose-200"
                : "bg-white dark:bg-[#0C101A] border-gray-200/80 dark:border-slate-800/80 text-slate-300"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    settings.marketplace.maintenanceMode
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                    Public Maintenance Mode
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                    When active, public visitors will see a friendly maintenance message. Admin console remains accessible.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono font-bold uppercase ${
                    settings.marketplace.maintenanceMode
                      ? "text-rose-400"
                      : "text-slate-500"
                  }`}
                >
                  {settings.marketplace.maintenanceMode ? "Enabled" : "Disabled"}
                </span>
                <Switch
                  checked={settings.marketplace.maintenanceMode}
                  color="blue"
                  onChange={(checked) => {
                    setSettings((prev) => ({
                      ...prev,
                      marketplace: {
                        ...prev.marketplace,
                        maintenanceMode: checked,
                      },
                    }));
                    setIsMarketplaceDirty(true);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Core Financial & Operational Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Commission Rate */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                    Platform Service Fee (Commission)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                    Percentage retained by Kpugi upon creator payout settlement.
                  </p>
                </div>
                <span className="font-mono text-lg font-bold text-indigo-400">
                  {Math.round(settings.marketplace.commissionRate * 100)}%
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="0.30"
                  step="0.01"
                  value={settings.marketplace.commissionRate}
                  onChange={(e) => {
                    setSettings((prev) => ({
                      ...prev,
                      marketplace: {
                        ...prev.marketplace,
                        commissionRate: parseFloat(e.target.value),
                      },
                    }));
                    setIsMarketplaceDirty(true);
                  }}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>0% (Zero Fee)</span>
                  <span>10% (Default)</span>
                  <span>30% (Max)</span>
                </div>
              </div>
            </div>

            {/* Minimum View Goal */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                    Minimum Verified View Goal
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                    Lowest video view count a creator must achieve before earnings unlock.
                  </p>
                </div>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  {settings.marketplace.minViewsThreshold.toLocaleString()} views
                </span>
              </div>

              <input
                type="number"
                min="0"
                step="50"
                value={settings.marketplace.minViewsThreshold}
                onChange={(e) => {
                  setSettings((prev) => ({
                    ...prev,
                    marketplace: {
                      ...prev.marketplace,
                      minViewsThreshold: parseInt(e.target.value) || 0,
                    },
                  }));
                  setIsMarketplaceDirty(true);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Minimum Payout Withdrawal */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                    Minimum Withdrawal Amount
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                    Smallest wallet balance required for a creator to request bank payout.
                  </p>
                </div>
                <span className="font-mono text-lg font-bold text-indigo-300">
                  ₦{settings.marketplace.minWithdrawalAmount.toLocaleString()}
                </span>
              </div>

              <input
                type="number"
                min="500"
                step="500"
                value={settings.marketplace.minWithdrawalAmount}
                onChange={(e) => {
                  setSettings((prev) => ({
                    ...prev,
                    marketplace: {
                      ...prev.marketplace,
                      minWithdrawalAmount: parseInt(e.target.value) || 500,
                    },
                  }));
                  setIsMarketplaceDirty(true);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Minimum Campaign Budget */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                    Minimum Campaign Budget
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                    Smallest deposit an advertiser can fund when launching a campaign.
                  </p>
                </div>
                <span className="font-mono text-lg font-bold text-indigo-300">
                  ₦{settings.marketplace.minCampaignBudget.toLocaleString()}
                </span>
              </div>

              <input
                type="number"
                min="1000"
                step="1000"
                value={settings.marketplace.minCampaignBudget}
                onChange={(e) => {
                  setSettings((prev) => ({
                    ...prev,
                    marketplace: {
                      ...prev.marketplace,
                      minCampaignBudget: parseInt(e.target.value) || 1000,
                    },
                  }));
                  setIsMarketplaceDirty(true);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Featured Campaign Fee */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                    Featured Placement Fee
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                    Flat premium fee charged to brands for pinning to top discovery slots.
                  </p>
                </div>
                <span className="font-mono text-lg font-bold text-amber-300">
                  ₦{settings.marketplace.featuredFee.toLocaleString()}
                </span>
              </div>

              <input
                type="number"
                min="0"
                step="500"
                value={settings.marketplace.featuredFee}
                onChange={(e) => {
                  setSettings((prev) => ({
                    ...prev,
                    marketplace: {
                      ...prev.marketplace,
                      featuredFee: parseInt(e.target.value) || 0,
                    },
                  }));
                  setIsMarketplaceDirty(true);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Support Contact Email */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <div>
                <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                  Platform Support Email
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                  Receives escalations and appears in creator transactional receipts.
                </p>
              </div>

              <input
                type="email"
                value={settings.marketplace.supportEmail}
                onChange={(e) => {
                  setSettings((prev) => ({
                    ...prev,
                    marketplace: {
                      ...prev.marketplace,
                      supportEmail: e.target.value,
                    },
                  }));
                  setIsMarketplaceDirty(true);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section Footer Save Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#0A0E1A] border border-gray-200 dark:border-slate-800/80">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetSection("marketplace")}
              className="text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset to Defaults
            </Button>

            <Button
              size="sm"
              disabled={!isMarketplaceDirty || isPending}
              onClick={() => handleSaveSection("marketplace")}
              className="flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? "Saving..." : "Save Parameters"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BROWSE & DISCOVERY CONTROLS */}
      {/* ========================================================================= */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hero Slider Settings */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                Featured Hero Carousel
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                    Maximum Hero Slots (Pinned Campaigns)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.browse.heroMaxSlots}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        browse: {
                          ...prev.browse,
                          heroMaxSlots: parseInt(e.target.value) || 5,
                        },
                      }));
                      setIsBrowseDirty(true);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Limits how many campaigns can be featured simultaneously on the top slider.
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                    Auto-Slide Rotation Speed (Seconds)
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={settings.browse.heroAutoSlideIntervalSec}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        browse: {
                          ...prev.browse,
                          heroAutoSlideIntervalSec: parseInt(e.target.value) || 6,
                        },
                      }));
                      setIsBrowseDirty(true);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Default Sort Algorithm */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Default Campaign Sorting
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Determines the initial campaign order when creators land on the browse page.
              </p>

              <div className="space-y-2">
                {[
                  {
                    id: "trending",
                    label: "Trending First",
                    desc: "Highest view velocity and active submissions in the last 48 hours",
                  },
                  {
                    id: "newest",
                    label: "Newest Briefs",
                    desc: "Most recently launched advertiser campaigns",
                  },
                  {
                    id: "cpm",
                    label: "Highest CPM Rate",
                    desc: "Best paying reward rates per 1,000 verified views",
                  },
                  {
                    id: "budget",
                    label: "Largest Reward Pool",
                    desc: "Campaigns with the largest total creator budgets",
                  },
                ].map((sortOption) => (
                  <label
                    key={sortOption.id}
                    onClick={() => {
                      setSettings((prev) => ({
                        ...prev,
                        browse: {
                          ...prev.browse,
                          defaultSortAlgorithm: sortOption.id as any,
                        },
                      }));
                      setIsBrowseDirty(true);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      settings.browse.defaultSortAlgorithm === sortOption.id
                        ? "bg-indigo-600/10 border-indigo-500/40 text-white"
                        : "bg-gray-50 dark:bg-[#080B14] border-gray-300 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="defaultSortAlgorithm"
                      checked={
                        settings.browse.defaultSortAlgorithm === sortOption.id
                      }
                      onChange={() => {}}
                      className="mt-1 accent-indigo-500"
                    />
                    <div>
                      <p className="font-semibold text-xs text-slate-200">
                        {sortOption.label}
                      </p>
                      <p className="text-[11px] text-slate-400">{sortOption.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Active Marketplace Categories */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
            <div>
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                Active Marketplace Categories
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                Categories displayed in creator search filters and campaign creation dropdowns.
              </p>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {settings.browse.activeCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 font-sans"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Category Form */}
            <div className="flex items-center gap-2 max-w-sm pt-2">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryText}
                onChange={(e) => setNewCategoryText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <Button size="sm" variant="outline" onClick={handleAddCategory}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Global Announcement Banner */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                  Global Site Announcement Banner
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                  Displays a prominent alert banner across all public creator and advertiser pages.
                </p>
              </div>

              <Switch
                checked={settings.browse.announcementBanner.enabled}
                color="blue"
                onChange={(checked) => {
                  setSettings((prev) => ({
                    ...prev,
                    browse: {
                      ...prev.browse,
                      announcementBanner: {
                        ...prev.browse.announcementBanner,
                        enabled: checked,
                      },
                    },
                  }));
                  setIsBrowseDirty(true);
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block">
                  Announcement Message
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🚀 Welcome to Kpugi 2.0! Instant payout settlements are now live."
                  value={settings.browse.announcementBanner.message}
                  onChange={(e) => {
                    setSettings((prev) => ({
                      ...prev,
                      browse: {
                        ...prev.browse,
                        announcementBanner: {
                          ...prev.browse.announcementBanner,
                          message: e.target.value,
                        },
                      },
                    }));
                    setIsBrowseDirty(true);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block">
                  Color Theme
                </label>
                <select
                  value={settings.browse.announcementBanner.theme}
                  onChange={(e) => {
                    setSettings((prev) => ({
                      ...prev,
                      browse: {
                        ...prev.browse,
                        announcementBanner: {
                          ...prev.browse.announcementBanner,
                          theme: e.target.value as any,
                        },
                      },
                    }));
                    setIsBrowseDirty(true);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="info">Info (Indigo / Blue)</option>
                  <option value="success">Success (Emerald / Green)</option>
                  <option value="warning">Alert (Amber / Orange)</option>
                </select>
              </div>
            </div>

            {/* Live Banner Preview */}
            {settings.browse.announcementBanner.message && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-mono text-slate-500">Live Preview:</span>
                <div
                  className={`p-3 rounded-xl border text-xs font-sans flex items-center justify-between ${
                    settings.browse.announcementBanner.theme === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : settings.browse.announcementBanner.theme === "warning"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                  }`}
                >
                  <span>{settings.browse.announcementBanner.message}</span>
                  <span className="text-[10px] font-mono uppercase font-bold opacity-75">
                    {settings.browse.announcementBanner.enabled ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section Footer Save Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#0A0E1A] border border-gray-200 dark:border-slate-800/80">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetSection("browse")}
              className="text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset to Defaults
            </Button>

            <Button
              size="sm"
              disabled={!isBrowseDirty || isPending}
              onClick={() => handleSaveSection("browse")}
              className="flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? "Saving..." : "Save Browse Settings"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CAMPAIGN GOVERNANCE & RULES */}
      {/* ========================================================================= */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campaign Approval Policy */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                Campaign Launch Approval Policy
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Controls whether newly funded advertiser briefs require admin sign-off before appearing on the public browse feed.
              </p>

              <div className="space-y-2">
                <label
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      campaigns: {
                        ...prev.campaigns,
                        approvalPolicy: "admin_review",
                      },
                    }));
                    setIsCampaignsDirty(true);
                  }}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    settings.campaigns.approvalPolicy === "admin_review"
                      ? "bg-indigo-600/10 border-indigo-500/40 text-white"
                      : "bg-gray-50 dark:bg-[#080B14] border-gray-300 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="approvalPolicy"
                    checked={settings.campaigns.approvalPolicy === "admin_review"}
                    onChange={() => {}}
                    className="mt-1 accent-indigo-500"
                  />
                  <div>
                    <p className="font-semibold text-xs text-slate-200">
                      Require Admin Review (Recommended)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      New campaigns enter a Pending Review queue for quality & compliance check before public launch.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      campaigns: {
                        ...prev.campaigns,
                        approvalPolicy: "instant_launch",
                      },
                    }));
                    setIsCampaignsDirty(true);
                  }}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    settings.campaigns.approvalPolicy === "instant_launch"
                      ? "bg-indigo-600/10 border-indigo-500/40 text-white"
                      : "bg-gray-50 dark:bg-[#080B14] border-gray-300 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="approvalPolicy"
                    checked={settings.campaigns.approvalPolicy === "instant_launch"}
                    onChange={() => {}}
                    className="mt-1 accent-indigo-500"
                  />
                  <div>
                    <p className="font-semibold text-xs text-slate-200">
                      Instant Auto-Launch
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Campaigns go live immediately once Paystack deposit is verified.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Allowed Social Networks */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                Supported Social Platforms
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Enable or disable social networks creators can submit video links from.
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    key: "tiktok",
                    label: "TikTok Videos",
                    color: "text-rose-400",
                  },
                  {
                    key: "instagram",
                    label: "Instagram Reels",
                    color: "text-pink-400",
                  },
                  {
                    key: "youtube",
                    label: "YouTube Shorts",
                    color: "text-red-400",
                  },
                  {
                    key: "twitter",
                    label: "X (Twitter) Clips",
                    color: "text-sky-400",
                  },
                ].map((platform) => {
                  const isChecked = (settings.campaigns.allowedSocialPlatforms as any)[
                    platform.key
                  ];
                  return (
                    <div
                      key={platform.key}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#080B14] border border-slate-800"
                    >
                      <span className={`text-xs font-semibold ${platform.color}`}>
                        {platform.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSettings((prev) => ({
                            ...prev,
                            campaigns: {
                              ...prev.campaigns,
                              allowedSocialPlatforms: {
                                ...prev.campaigns.allowedSocialPlatforms,
                                [platform.key]: !isChecked,
                              },
                            },
                          }));
                          setIsCampaignsDirty(true);
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          isChecked ? "bg-indigo-600" : "bg-slate-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            isChecked ? "translate-x-4.5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verification Audit Window */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <div>
                <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                  Post Verification Audit Window
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                  How long the scraper monitors video engagement velocity before final settlement.
                </p>
              </div>

              <select
                value={settings.campaigns.verificationWindowHours}
                onChange={(e) => {
                  setSettings((prev) => ({
                    ...prev,
                    campaigns: {
                      ...prev.campaigns,
                      verificationWindowHours: parseInt(e.target.value) || 48,
                    },
                  }));
                  setIsCampaignsDirty(true);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value={24}>24 Hours (Fast settlement)</option>
                <option value={48}>48 Hours (Recommended baseline)</option>
                <option value={72}>72 Hours (Extended view audit)</option>
                <option value={168}>7 Days (Deep multi-day verification)</option>
              </select>
            </div>

            {/* Max Submissions Per Creator */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <div>
                <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                  Submission Limit per Creator
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                  Maximum number of distinct video submissions one creator can submit for a single brief.
                </p>
              </div>

              <input
                type="number"
                min="1"
                max="10"
                value={settings.campaigns.maxSubmissionsPerCreator}
                onChange={(e) => {
                  setSettings((prev) => ({
                    ...prev,
                    campaigns: {
                      ...prev.campaigns,
                      maxSubmissionsPerCreator: parseInt(e.target.value) || 1,
                    },
                  }));
                  setIsCampaignsDirty(true);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section Footer Save Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#0A0E1A] border border-gray-200 dark:border-slate-800/80">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetSection("campaigns")}
              className="text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset to Defaults
            </Button>

            <Button
              size="sm"
              disabled={!isCampaignsDirty || isPending}
              onClick={() => handleSaveSection("campaigns")}
              className="flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? "Saving..." : "Save Campaign Rules"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CREATOR & USER POLICIES */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity (KYC) Verification Policy */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                Creator Identity Verification (KYC)
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Controls when creators are mandated to verify government ID and biometrics via Didit.
              </p>

              <div className="space-y-2">
                {[
                  {
                    id: "strict",
                    label: "Strict Verification",
                    desc: "Identity check required before ANY payout withdrawal is permitted",
                  },
                  {
                    id: "threshold",
                    label: "Threshold Gated",
                    desc: "Required only when total creator withdrawals exceed the threshold amount",
                  },
                  {
                    id: "relaxed",
                    label: "Relaxed Onboarding",
                    desc: "Automated phone/email checks, ID required only upon suspicious activity",
                  },
                ].map((policy) => (
                  <label
                    key={policy.id}
                    onClick={() => {
                      setSettings((prev) => ({
                        ...prev,
                        users: {
                          ...prev.users,
                          kycPolicy: policy.id as any,
                        },
                      }));
                      setIsUsersDirty(true);
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      settings.users.kycPolicy === policy.id
                        ? "bg-indigo-600/10 border-indigo-500/40 text-white"
                        : "bg-gray-50 dark:bg-[#080B14] border-gray-300 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="kycPolicy"
                      checked={settings.users.kycPolicy === policy.id}
                      onChange={() => {}}
                      className="mt-1 accent-indigo-500"
                    />
                    <div>
                      <p className="font-semibold text-xs text-slate-200">
                        {policy.label}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{policy.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {settings.users.kycPolicy === "threshold" && (
                <div className="pt-2">
                  <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                    Exemption Threshold Limit (NGN)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    value={settings.users.kycThresholdAmount}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        users: {
                          ...prev.users,
                          kycThresholdAmount: parseInt(e.target.value) || 50000,
                        },
                      }));
                      setIsUsersDirty(true);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Minimum Follower Thresholds */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                Audience Size Entry Minimums
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Follower count required on creator social profiles before applying to briefs.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                    TikTok Follower Minimum
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={settings.users.followerMinimums.tiktok}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        users: {
                          ...prev.users,
                          followerMinimums: {
                            ...prev.users.followerMinimums,
                            tiktok: parseInt(e.target.value) || 0,
                          },
                        },
                      }));
                      setIsUsersDirty(true);
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                    Instagram Follower Minimum
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={settings.users.followerMinimums.instagram}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        users: {
                          ...prev.users,
                          followerMinimums: {
                            ...prev.users.followerMinimums,
                            instagram: parseInt(e.target.value) || 0,
                          },
                        },
                      }));
                      setIsUsersDirty(true);
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                    YouTube Subscriber Minimum
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={settings.users.followerMinimums.youtube}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        users: {
                          ...prev.users,
                          followerMinimums: {
                            ...prev.users.followerMinimums,
                            youtube: parseInt(e.target.value) || 0,
                          },
                        },
                      }));
                      setIsUsersDirty(true);
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Risk & Fraud Protections */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                Automated Risk & Fraud Defenses
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#080B14] border border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Rapid View Spike Shield
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Flag videos that gain &gt;1,000% view velocity within 1 hour for manual anti-bot audit.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSettings((prev) => ({
                        ...prev,
                        users: {
                          ...prev.users,
                          flagViewVelocitySpikes: !prev.users.flagViewVelocitySpikes,
                        },
                      }));
                      setIsUsersDirty(true);
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      settings.users.flagViewVelocitySpikes
                        ? "bg-indigo-600"
                        : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        settings.users.flagViewVelocitySpikes
                          ? "translate-x-4.5"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#080B14] border border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Duplicate Bank Details Block
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Prevent multiple creator accounts from binding the exact same bank account number.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSettings((prev) => ({
                        ...prev,
                        users: {
                          ...prev.users,
                          blockDuplicateBankAccounts:
                            !prev.users.blockDuplicateBankAccounts,
                        },
                      }));
                      setIsUsersDirty(true);
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      settings.users.blockDuplicateBankAccounts
                        ? "bg-indigo-600"
                        : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        settings.users.blockDuplicateBankAccounts
                          ? "translate-x-4.5"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section Footer Save Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#0A0E1A] border border-gray-200 dark:border-slate-800/80">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetSection("users")}
              className="text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset to Defaults
            </Button>

            <Button
              size="sm"
              disabled={!isUsersDirty || isPending}
              onClick={() => handleSaveSection("users")}
              className="flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? "Saving..." : "Save User Policies"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: API KEYS & EXTERNAL SERVICES VAULT */}
      {/* ========================================================================= */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold font-display text-white">
                External Integrations Status Vault
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                Overview of third-party APIs, gateways, automated scrapers, and database connections.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-sans">
                {integrations.filter((i) => i.configured).length} of{" "}
                {integrations.length} Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((service) => {
              const pingResult = pingResults[service.key];
              const isPinging = testingServiceKey === service.key;

              return (
                <div
                  key={service.key}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-3.5 transition-all hover:border-slate-700/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-display">
                          {service.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                        {service.statusText}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        service.configured
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {service.configured ? "Configured" : "Missing Key"}
                    </span>
                  </div>

                  {/* Masked Secret Row */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#080B14] border border-slate-800/60 font-mono text-xs">
                    <span className="text-indigo-300 tracking-wider">
                      {service.maskedKey}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedService(service)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-sans transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect
                    </button>
                  </div>

                  {/* Live Ping Status & Action */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      {pingResult ? (
                        <span
                          className={`flex items-center gap-1 font-mono text-[11px] ${
                            pingResult.status === "connected"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {pingResult.status === "connected" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {pingResult.latencyMs}ms
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          Ready to ping
                        </span>
                      )}
                    </div>

                    {service.isTestable && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPinging}
                        onClick={() => handleTestService(service.key)}
                        className="text-[11px] h-7 px-2.5 font-sans"
                      >
                        {isPinging ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                            Pinging...
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 mr-1 text-amber-400" />
                            Test Connection
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: BACKGROUND AUTOMATIONS & CRONS */}
      {/* ========================================================================= */}
      {activeTab === "crons" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display text-white">
                Scheduled Tasks & Automation Engines
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                Background routines that settle balances, scrape social metrics, and enforce campaign deadlines.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none overflow-hidden">
            {CRON_JOBS.map((job) => {
              const isRunning = runningCronPath === job.path;

              return (
                <div
                  key={job.path}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-900/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-slate-200 font-display">
                        {job.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {job.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                      <span>Endpoint: {job.path}</span>
                      <span>•</span>
                      <span>Schedule: {job.schedule}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isRunning}
                      onClick={() => handleTriggerCron(job.name, job.path)}
                      className="text-xs h-8 flex items-center gap-1.5 font-sans"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                          <span>Trigger Run Now</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SYSTEM DIAGNOSTICS & INFRASTRUCTURE */}
      {/* ========================================================================= */}
      {activeTab === "system" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono uppercase font-semibold">
                  Postgres Security Layer
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-base font-bold text-white font-display">
                RLS Enforcement Active
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                is_admin() DB policy verified
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono uppercase font-semibold">
                  Active Operator
                </span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-base font-bold text-white font-display truncate">
                {adminProfile.email || "Admin User"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Role: {adminProfile.role}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono uppercase font-semibold">
                  Platform Runtime
                </span>
                <Server className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-base font-bold text-white font-display">
                Next.js 15 App Router
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                React 19 Server Components
              </p>
            </div>
          </div>

          {/* Backup & Audit Summary */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
            <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
              System Configuration Backup & Audit
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              All parameter adjustments made in this cockpit automatically produce immutable records in the <code className="font-mono text-indigo-300">admin_audit_log</code> table.
            </p>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportConfig}
                className="flex items-center gap-2 text-xs"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                Download Complete Platform Config (JSON)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ApiKeyUpdateModal
        isOpen={Boolean(selectedService)}
        onClose={() => setSelectedService(null)}
        service={selectedService}
      />

      <CronRunResultModal
        isOpen={Boolean(cronResult)}
        onClose={() => setCronResult(null)}
        result={cronResult}
      />
    </div>
  );
}
