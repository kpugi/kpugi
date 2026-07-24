import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-kpugi-border shadow-xl relative">
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
}
