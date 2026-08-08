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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-kpugi-border shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-kpugi-ink">{title}</h3>
          <button onClick={onClose} className="text-kpugi-slate hover:text-kpugi-ink font-bold">
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
