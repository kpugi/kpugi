"use client";

import React, { useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExtension from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Unlink,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";

interface CampaignBriefEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  isAiLoading?: boolean;
  isTranscribing?: boolean;
}

export default function CampaignBriefEditor({
  value,
  onChange,
  placeholder = "Explain your product, campaign goals, key selling points, and target audience...",
  maxLength = 2000,
  disabled = false,
  isAiLoading = false,
  isTranscribing = false,
}: CampaignBriefEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 dark:text-indigo-400 underline font-semibold cursor-pointer",
        },
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editable: !disabled && !isAiLoading && !isTranscribing,
    editorProps: {
      attributes: {
        class:
          "tiptap ProseMirror prose dark:prose-invert prose-slate max-w-none text-sm text-slate-900 dark:text-white leading-relaxed min-h-[140px] px-4 py-3.5 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If editor has no real content (<p></p>), emit empty string
      const isEmpty = editor.isEmpty;
      onChange(isEmpty ? "" : html);
    },
  });

  // Synchronize external value changes (e.g. from Voice Narration or AI Expand)
  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();
    const normalizedValue = value || "";

    // If external value changed from current editor state, update editor content
    if (normalizedValue !== currentHtml && (normalizedValue || !editor.isEmpty)) {
      editor.commands.setContent(normalizedValue);
    }
  }, [value, editor]);

  // Update editable state if loading changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled && !isAiLoading && !isTranscribing);
    }
  }, [editor, disabled, isAiLoading, isTranscribing]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter website link URL:", previousUrl || "https://");

    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  const charactersCount = editor?.storage.characterCount.characters() ?? (value || "").length;

  return (
    <div className="space-y-1.5 font-sans">
      <div
        className={`relative rounded-2xl border transition-all overflow-hidden ${
          isTranscribing || isAiLoading
            ? "border-[#4338ca] bg-purple-50/20 dark:bg-indigo-950/30"
            : "border-[#e2e0fb] dark:border-white/10 bg-[#f8f7ff] dark:bg-white/5 focus-within:bg-white dark:focus-within:bg-[#161820] focus-within:ring-2 focus-within:ring-[#4338ca] dark:focus-within:ring-indigo-500 focus-within:border-transparent"
        }`}
      >
        {/* WYSIWYG Formatting Toolbar */}
        {editor && (
          <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#e2e0fb] dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03]">
            {/* Bold */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={disabled || isAiLoading || isTranscribing}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                editor.isActive("bold")
                  ? "bg-[#eeedfd] text-[#4338ca] dark:bg-indigo-950/80 dark:text-indigo-300 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10"
              }`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            {/* Italic */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={disabled || isAiLoading || isTranscribing}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                editor.isActive("italic")
                  ? "bg-[#eeedfd] text-[#4338ca] dark:bg-indigo-950/80 dark:text-indigo-300 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10"
              }`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            {/* Strike */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={disabled || isAiLoading || isTranscribing}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                editor.isActive("strike")
                  ? "bg-[#eeedfd] text-[#4338ca] dark:bg-indigo-950/80 dark:text-indigo-300 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10"
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-0.5" />

            {/* Heading 2 */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              disabled={disabled || isAiLoading || isTranscribing}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-[#eeedfd] text-[#4338ca] dark:bg-indigo-950/80 dark:text-indigo-300 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10"
              }`}
              title="Section Heading (H2)"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>

            {/* Heading 3 */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              disabled={disabled || isAiLoading || isTranscribing}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                editor.isActive("heading", { level: 3 })
                  ? "bg-[#eeedfd] text-[#4338ca] dark:bg-indigo-950/80 dark:text-indigo-300 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10"
              }`}
              title="Sub-heading (H3)"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-0.5" />

            {/* Bullet List */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={disabled || isAiLoading || isTranscribing}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                editor.isActive("bulletList")
                  ? "bg-[#eeedfd] text-[#4338ca] dark:bg-indigo-950/80 dark:text-indigo-300 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10"
              }`}
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            {/* Ordered List */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={disabled || isAiLoading || isTranscribing}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                editor.isActive("orderedList")
                  ? "bg-[#eeedfd] text-[#4338ca] dark:bg-indigo-950/80 dark:text-indigo-300 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10"
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            {/* Blockquote */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              disabled={disabled || isAiLoading || isTranscribing}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                editor.isActive("blockquote")
                  ? "bg-[#eeedfd] text-[#4338ca] dark:bg-indigo-950/80 dark:text-indigo-300 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10"
              }`}
              title="Quote / Highlight"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-0.5" />

            {/* Link */}
            <button
              type="button"
              onClick={setLink}
              disabled={disabled || isAiLoading || isTranscribing}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                editor.isActive("link")
                  ? "bg-[#eeedfd] text-[#4338ca] dark:bg-indigo-950/80 dark:text-indigo-300 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10"
              }`}
              title="Add Link"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
            {editor.isActive("link") && (
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetLink().run()}
                className="p-1.5 rounded-lg text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                title="Remove Link"
              >
                <Unlink className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Undo / Redo */}
            <div className="ms-auto flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo() || disabled || isAiLoading || isTranscribing}
                className="p-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-200/60 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo() || disabled || isAiLoading || isTranscribing}
                className="p-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-200/60 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TipTap Editor Content */}
        <EditorContent editor={editor} />

        {/* Loading Overlay for Voice STT & AI Expand */}
        {(isTranscribing || isAiLoading) && (
          <div className="absolute inset-0 bg-white/70 dark:bg-[#12141A]/80 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-[1px] z-10">
            <Loader2 className="w-4 h-4 animate-spin text-[#4338ca] dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isTranscribing ? "Transcribing voice audio with Deepgram..." : "AI expanding creator brief..."}
            </span>
          </div>
        )}
      </div>

      {/* Character Count Bar (Max 2,000 Chars) */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 px-0.5">
        <span>Campaign Brief (max {maxLength.toLocaleString()} chars)</span>
        <span
          className={
            charactersCount >= maxLength * 0.95
              ? "text-amber-600 dark:text-amber-400 font-bold"
              : ""
          }
        >
          {charactersCount.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
