'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';

export default function NetworkStatusToast() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialOnline = navigator.onLine;
      setIsOnline(initialOnline);
      if (!initialOnline) {
        setWasOffline(true);
        setShowToast(true);
      }
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] transition-all duration-300 ease-out transform animate-in fade-in slide-in-from-bottom-4">
      {!isOnline ? (
        <div className="px-4 py-3 rounded-2xl bg-slate-900/90 text-white backdrop-blur-md border border-amber-500/40 shadow-2xl flex items-center gap-3 max-w-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
            <WifiOff className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-xs min-w-0 pr-1">
            <span className="font-bold text-amber-400 block font-display">Connection Lost</span>
            <span className="text-slate-300 block truncate text-[11px]">You are offline. Retrying connection...</span>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-auto shrink-0"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="px-4 py-3 rounded-2xl bg-slate-900/90 text-white backdrop-blur-md border border-emerald-500/40 shadow-2xl flex items-center gap-3 max-w-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
            <Wifi className="w-4 h-4" />
          </div>
          <div className="text-xs min-w-0 pr-1">
            <span className="font-bold text-emerald-400 block font-display">Back Online</span>
            <span className="text-slate-300 block truncate text-[11px]">Connection restored. All systems active.</span>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-auto shrink-0"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
