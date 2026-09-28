"use client";

import React, { useMemo } from "react";

interface CampaignBriefRendererProps {
  content?: string | null;
  className?: string;
}

/**
 * Safely sanitizes basic HTML string by removing script/iframe tags and on* event handlers
 */
function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\son\w+=\w+/gi, "");
}

/**
 * CampaignBriefRenderer renders formatted TipTap HTML briefs or plain text with newlines
 * seamlessly supporting dark mode, typography styling, and list hierarchies.
 */
export default function CampaignBriefRenderer({
  content,
  className = "",
}: CampaignBriefRendererProps) {
  const raw = (content || "").trim();

  const isHtml = useMemo(() => {
    return /<[a-z][\s\S]*>/i.test(raw);
  }, [raw]);

  const sanitized = useMemo(() => {
    return isHtml ? sanitizeHtml(raw) : "";
  }, [raw, isHtml]);

  if (!raw) {
    return (
      <p className={`text-sm text-slate-400 dark:text-slate-500 italic ${className}`}>
        No campaign brief description provided.
      </p>
    );
  }

  if (isHtml) {
    return (
      <div
        className={`campaign-brief-content prose dark:prose-invert prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300
          prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
          prose-h2:text-base sm:prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2 prose-h2:pb-1 prose-h2:border-b prose-h2:border-slate-100 dark:prose-h2:border-white/5
          prose-h3:text-sm sm:prose-h3:text-base prose-h3:mt-3 prose-h3:mb-1.5
          prose-p:my-2.5 prose-p:leading-relaxed
          prose-ul:my-2.5 prose-ul:list-disc prose-ul:pl-5
          prose-ol:my-2.5 prose-ol:list-decimal prose-ol:pl-5
          prose-li:my-1 prose-li:leading-relaxed
          prose-strong:font-bold prose-strong:text-slate-900 dark:prose-strong:text-white
          prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-950/20 prose-blockquote:py-1.5 prose-blockquote:px-3.5 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:my-3
          prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:underline hover:prose-a:text-indigo-700
          prose-code:text-indigo-600 dark:prose-code:text-indigo-300 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-950/40 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs
          ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  // Plain text fallback (preserves whitespace and newlines for non-HTML briefs)
  return (
    <div
      className={`font-sans text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-line ${className}`}
    >
      {raw}
    </div>
  );
}
