"use client";

import React, { useState } from "react";
import Button from "@/components/admin/components/ui/button/Button";
import Switch from "@/components/admin/components/form/switch/Switch";
import Label from "@/components/admin/components/form/Label";
import InputField from "@/components/admin/components/form/input/InputField";
import TextArea from "@/components/admin/components/form/input/TextArea";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  Code2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  SiteVerificationSettings,
  VerificationMetaTag,
  CustomHeaderScript,
} from "@/lib/admin/platform-settings-types";
import AddVerificationTagModal from "../modals/AddVerificationTagModal";

interface SiteVerificationTabProps {
  settings: SiteVerificationSettings;
  onChange: (updated: SiteVerificationSettings) => void;
  onSave: () => void;
  onReset: () => void;
  isDirty: boolean;
  isPending: boolean;
}

export default function SiteVerificationTab({
  settings,
  onChange,
  onSave,
  onReset,
  isDirty,
  isPending,
}: SiteVerificationTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<VerificationMetaTag | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScriptsSection, setShowScriptsSection] = useState(false);

  // New script form state
  const [newScriptLabel, setNewScriptLabel] = useState("");
  const [newScriptPlacement, setNewScriptPlacement] = useState<"head" | "body_start" | "body_end">("head");
  const [newScriptCode, setNewScriptCode] = useState("");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddTag = (tag: VerificationMetaTag) => {
    const existingIndex = settings.metaTags.findIndex((t) => t.id === tag.id);
    let updatedTags: VerificationMetaTag[];

    if (existingIndex >= 0) {
      updatedTags = [...settings.metaTags];
      updatedTags[existingIndex] = tag;
    } else {
      updatedTags = [...settings.metaTags, tag];
    }

    onChange({
      ...settings,
      metaTags: updatedTags,
    });
  };

  const handleDeleteTag = (id: string) => {
    onChange({
      ...settings,
      metaTags: settings.metaTags.filter((t) => t.id !== id),
    });
  };

  const handleToggleTag = (id: string, enabled: boolean) => {
    onChange({
      ...settings,
      metaTags: settings.metaTags.map((t) =>
        t.id === id ? { ...t, enabled } : t
      ),
    });
  };

  const handleApplyPreset = (preset: { label: string; name: string; placeholder: string }) => {
    setEditingTag({
      id: `tag-${Date.now()}`,
      serviceLabel: preset.label,
      name: preset.name,
      content: "",
      enabled: true,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleAddScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScriptCode.trim()) return;

    const newScript: CustomHeaderScript = {
      id: `script-${Date.now()}`,
      label: newScriptLabel.trim() || "Custom Script",
      code: newScriptCode.trim(),
      placement: newScriptPlacement,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    onChange({
      ...settings,
      customScripts: [...(settings.customScripts || []), newScript],
    });

    setNewScriptLabel("");
    setNewScriptCode("");
  };

  const handleDeleteScript = (id: string) => {
    onChange({
      ...settings,
      customScripts: (settings.customScripts || []).filter((s) => s.id !== id),
    });
  };

  const handleToggleScript = (id: string, enabled: boolean) => {
    onChange({
      ...settings,
      customScripts: (settings.customScripts || []).map((s) =>
        s.id === id ? { ...s, enabled } : s
      ),
    });
  };

  const PRESETS = [
    { label: "Profiton", name: "profiton-domain-verification", placeholder: "c5f35696..." },
    { label: "Google Search Console", name: "google-site-verification", placeholder: "google-verification-token" },
    { label: "Meta Domain Verification", name: "facebook-domain-verification", placeholder: "facebook-domain-token" },
    { label: "Pinterest", name: "p:domain_verify", placeholder: "pinterest-token" },
    { label: "Ahrefs", name: "ahrefs-site-verification", placeholder: "ahrefs-token" },
    { label: "Bing Webmaster", name: "msvalidate.01", placeholder: "bing-validation-code" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Dynamic Server Site Verification & Meta Tags</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Zero Redeployments
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Meta tags saved here are rendered directly into the static HTML <code className="text-indigo-400 font-mono">&lt;head&gt;</code> by Next.js on every request. This ensures backend crawlers, search engines, and verification bots (like Profiton, Google, and Meta) verify domain ownership instantly without requiring code commits or Vercel redeployments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Button
            size="sm"
            variant="primary"
            disabled={isPending}
            onClick={onSave}
            className="flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isPending ? "Saving..." : "Save & Publish"}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={onReset}
            className="flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Preset Quick Add Bar */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick Verification Presets (Click to Add):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/60"
            >
              <Plus className="w-3 h-3 text-indigo-400" />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Verification Tags Table Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Active Verification Tags ({settings.metaTags?.length || 0})
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Live &lt;meta&gt; tags rendered into the public HTML head
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setEditingTag(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Verification Tag</span>
          </Button>
        </div>

        {(!settings.metaTags || settings.metaTags.length === 0) ? (
          <div className="p-10 text-center">
            <ShieldCheck className="w-10 h-10 text-gray-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              No verification tags added yet
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Add your Profiton, Google, Meta, or custom domain tags to verify ownership without touching code.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Meta Tag Name</th>
                  <th className="py-3 px-4">Tag Value (`content`)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {settings.metaTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/30">
                        {tag.serviceLabel || "Custom"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-700 dark:text-slate-300">
                      {tag.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-500 dark:text-slate-400 truncate max-w-[240px]">
                          {tag.content}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(tag.content, tag.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1"
                          title="Copy content"
                        >
                          {copiedId === tag.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex justify-center">
                        <Switch
                          label=""
                          checked={tag.enabled !== false}
                          onChange={(val) => handleToggleTag(tag.id, val)}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTag(tag);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Tag"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Tag"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collapsible: Custom Raw Header Scripts */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowScriptsSection(!showScriptsSection)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-slate-300">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Advanced: Custom Raw Scripts & HTML Code Snippets
              </h4>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Safely inject custom &lt;script&gt; or &lt;link&gt; tags at runtime
              </p>
            </div>
          </div>
          {showScriptsSection ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showScriptsSection && (
          <div className="p-5 border-t border-gray-100 dark:border-slate-800 space-y-5">
            {/* New Script Form */}
            <form onSubmit={handleAddScript} className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/40 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-slate-300">
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add Custom Code Snippet</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="scriptLabel" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Snippet Label / Name
                  </Label>
                  <InputField
                    id="scriptLabel"
                    value={newScriptLabel}
                    onChange={(e) => setNewScriptLabel(e.target.value)}
                    placeholder="e.g. Affiliate Tracking Code"
                  />
                </div>
                <div>
                  <Label htmlFor="scriptPlacement" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Injection Location
                  </Label>
                  <select
                    id="scriptPlacement"
                    value={newScriptPlacement}
                    onChange={(e) => setNewScriptPlacement(e.target.value as any)}
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-300 focus:outline-hidden"
                  >
                    <option value="head" className="dark:bg-slate-900">&lt;head&gt; (Top of Page)</option>
                    <option value="body_start" className="dark:bg-slate-900">&lt;body&gt; Start</option>
                    <option value="body_end" className="dark:bg-slate-900">&lt;body&gt; End (Footer)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="scriptCode" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Raw Code Snippet
                </Label>
                <TextArea
                  rows={4}
                  value={newScriptCode}
                  onChange={(val) => setNewScriptCode(val)}
                  placeholder="<script>...</script> or <link rel='...' />"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="sm" variant="primary">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Snippet
                </Button>
              </div>
            </form>

            {/* List of Custom Scripts */}
            {settings.customScripts && settings.customScripts.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Configured Snippets ({settings.customScripts.length})
                </h5>
                <div className="space-y-2">
                  {settings.customScripts.map((script) => (
                    <div
                      key={script.id}
                      className="p-3 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            {script.label}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                            {script.placement}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-gray-400 truncate max-w-md mt-0.5">
                          {script.code}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Switch
                          label=""
                          checked={script.enabled}
                          onChange={(val) => handleToggleScript(script.id, val)}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteScript(script.id)}
                          className="p-1 text-gray-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AddVerificationTagModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTag(null);
        }}
        onSave={handleAddTag}
        initialTag={editingTag}
      />
    </div>
  );
}
