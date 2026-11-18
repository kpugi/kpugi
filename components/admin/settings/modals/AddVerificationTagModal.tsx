"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import Label from "@/components/admin/components/form/Label";
import InputField from "@/components/admin/components/form/input/InputField";
import Switch from "@/components/admin/components/form/switch/Switch";
import { ShieldCheck, Sparkles, X, Check } from "lucide-react";
import { VerificationMetaTag } from "@/lib/admin/platform-settings-types";

interface AddVerificationTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tag: VerificationMetaTag) => void;
  initialTag?: VerificationMetaTag | null;
}

export default function AddVerificationTagModal({
  isOpen,
  onClose,
  onSave,
  initialTag,
}: AddVerificationTagModalProps) {
  const [snippet, setSnippet] = useState("");
  const [serviceLabel, setServiceLabel] = useState("");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTag) {
      setServiceLabel(initialTag.serviceLabel || "");
      setName(initialTag.name || "");
      setContent(initialTag.content || "");
      setEnabled(initialTag.enabled !== false);
      setSnippet("");
      setError(null);
    } else {
      setServiceLabel("");
      setName("");
      setContent("");
      setEnabled(true);
      setSnippet("");
      setError(null);
    }
  }, [initialTag, isOpen]);

  // Auto-parse pasted HTML <meta> tags
  const handleSnippetChange = (raw: string) => {
    setSnippet(raw);
    setError(null);

    if (!raw.trim()) return;

    // Check for name and content attributes
    const nameMatch = raw.match(/name=["']([^"']+)["']/i);
    const contentMatch = raw.match(/content=["']([^"']+)["']/i);

    if (nameMatch && nameMatch[1]) {
      setName(nameMatch[1]);
      // Guess service label if empty
      if (!serviceLabel) {
        const lower = nameMatch[1].toLowerCase();
        if (lower.includes("profiton")) setServiceLabel("Profiton");
        else if (lower.includes("google")) setServiceLabel("Google Search Console");
        else if (lower.includes("facebook") || lower.includes("meta")) setServiceLabel("Meta Domain Verification");
        else if (lower.includes("pinterest")) setServiceLabel("Pinterest");
        else if (lower.includes("ahrefs")) setServiceLabel("Ahrefs");
        else if (lower.includes("msvalidate")) setServiceLabel("Bing Webmaster");
      }
    }

    if (contentMatch && contentMatch[1]) {
      setContent(contentMatch[1]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Meta tag name is required (e.g. 'profiton-domain-verification').");
      return;
    }
    if (!content.trim()) {
      setError("Meta tag content value is required.");
      return;
    }

    const tagToSave: VerificationMetaTag = {
      id: initialTag?.id || `tag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      content: content.trim(),
      serviceLabel: serviceLabel.trim() || name.trim(),
      enabled,
      createdAt: initialTag?.createdAt || new Date().toISOString(),
    };

    onSave(tagToSave);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[580px] p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-gray-900 dark:text-white">
                {initialTag ? "Edit Verification Meta Tag" : "Add Verification Meta Tag"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">
                Injected server-side into static HTML for crawlers and domain verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Quick Paste Snippet Input */}
        <div>
          <Label htmlFor="snippetInput" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Quick Paste Full Tag (Optional)
          </Label>
          <InputField
            id="snippetInput"
            value={snippet}
            onChange={(e) => handleSnippetChange(e.target.value)}
            placeholder='e.g. <meta name="profiton-domain-verification" content="..." />'
          />
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>Paste any raw HTML tag here to automatically extract the name and content</span>
          </p>
        </div>

        {/* Service Label */}
        <div>
          <Label htmlFor="serviceLabelInput" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Service / Provider Label
          </Label>
          <InputField
            id="serviceLabelInput"
            value={serviceLabel}
            onChange={(e) => setServiceLabel(e.target.value)}
            placeholder="e.g. Profiton, Google Search Console, Meta Domain"
          />
        </div>

        {/* Meta Name */}
        <div>
          <Label htmlFor="tagNameInput" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Meta Tag Name (`name`) *
          </Label>
          <InputField
            id="tagNameInput"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. profiton-domain-verification"
            required
          />
        </div>

        {/* Meta Content */}
        <div>
          <Label htmlFor="tagContentInput" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Tag Value (`content`) *
          </Label>
          <InputField
            id="tagContentInput"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. c5f35696abf43999a5d813c1cba8b4fc6de687f7f9a3bd5942b315c54007cdfb"
            required
          />
        </div>

        {/* Enabled Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-slate-900/40">
          <div>
            <span className="text-xs font-semibold text-gray-900 dark:text-white block">
              Tag Status
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              When enabled, this tag is rendered in the server HTML
            </span>
          </div>
          <Switch
            label=""
            checked={enabled}
            onChange={(val) => setEnabled(val)}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            {initialTag ? "Update Tag" : "Save Verification Tag"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
