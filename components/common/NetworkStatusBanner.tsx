'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function NetworkStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBackOnlineToast, setShowBackOnlineToast] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      console.log('[NetworkStatus] Event: Offline');
      setIsOffline(true);
      setShowBackOnlineToast(false);
    };

    const handleOnline = () => {
      console.log('[NetworkStatus] Event: Online');
      setIsOffline(false);
      setShowBackOnlineToast(true);
      const timer = setTimeout(() => {
        setShowBackOnlineToast(false);
      }, 4000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Fast Polling Fallback (Checks every 2.5s for instant OS network state changes)
    const pollInterval = setInterval(() => {
      if (typeof window !== 'undefined') {
        const currentStatus = !navigator.onLine;
        setIsOffline((prev) => {
          if (!prev && currentStatus) {
            handleOffline();
          } else if (prev && !currentStatus) {
            handleOnline();
          }
          return currentStatus;
        });
      }
    }, 2500);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      clearInterval(pollInterval);
    };
  }, []);

  if (!isOffline && !showBackOnlineToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999999] pointer-events-auto transition-all duration-300 transform translate-y-0">
      {isOffline ? (
        <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-rose-600 text-white shadow-2xl ring-4 ring-rose-500/25 text-xs font-extrabold font-sans">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <WifiOff className="w-4 h-4 text-white shrink-0" />
          <span>You are offline. Check internet connection.</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-emerald-600 text-white shadow-2xl ring-4 ring-emerald-500/25 text-xs font-extrabold font-sans">
          <Wifi className="w-4 h-4 text-white shrink-0" />
          <span>Back online. Connection restored!</span>
        </div>
      )}
    </div>
  );
}
