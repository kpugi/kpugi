'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#12141A] rounded-2xl max-w-lg w-full p-6 border border-kpugi-border dark:border-white/10 shadow-2xl relative text-kpugi-ink dark:text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-kpugi-ink dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
