'use client';

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 rounded-xl border border-white/10 bg-[#121214]/95 p-4 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {t.variant === 'destructive' ? (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            {t.title && <div className="font-medium text-sm text-white">{t.title}</div>}
            {t.description && <div className="text-xs text-neutral-400 mt-1">{t.description}</div>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-neutral-500 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
