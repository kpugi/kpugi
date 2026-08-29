'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'compact' | 'futuristic' | 'inline';
  className?: string;
}

export function ThemeToggle({ variant = 'compact', className = '' }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={
          variant === 'futuristic'
            ? `w-14 h-7.5 rounded-full border border-black/10 dark:border-white/10 bg-slate-200/50 dark:bg-white/5 animate-pulse ${className}`
            : `w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 bg-slate-200/50 dark:bg-white/5 animate-pulse ${className}`
        }
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Toggle theme (Currently ${theme})`}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border border-slate-200 dark:border-white/15 bg-white/70 dark:bg-white/10 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 shadow-xs ${className}`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-cyan-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>
    );
  }

  // Futuristic Glass Sliding Capsule Toggle Switch
  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      title={`Current: ${isDark ? 'Dark' : 'Light'} Mode (Click to switch)`}
      className={`relative inline-flex items-center w-[54px] h-[28px] rounded-full p-0.5 transition-all duration-300 cursor-pointer select-none border backdrop-blur-xl ${
        isDark
          ? 'bg-slate-900/80 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
          : 'bg-slate-100/90 border-slate-300/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]'
      } ${className}`}
    >
      {/* Track Icons */}
      <span className="absolute left-1.5 flex items-center justify-center text-amber-500 opacity-90 transition-opacity duration-300">
        <Sun className="w-3.5 h-3.5" />
      </span>
      <span className="absolute right-1.5 flex items-center justify-center text-cyan-400 opacity-90 transition-opacity duration-300">
        <Moon className="w-3.5 h-3.5" />
      </span>

      {/* Sliding Futuristic Glass Knob */}
      <span
        className={`relative z-10 flex items-center justify-center w-[22px] h-[22px] rounded-full transition-transform duration-300 ease-out backdrop-blur-md ${
          isDark
            ? 'translate-x-[26px] bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_2px_8px_rgba(6,182,212,0.5),inset_0_1px_1px_rgba(255,255,255,0.6)]'
            : 'translate-x-[1px] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_2px_8px_rgba(245,158,11,0.4),inset_0_1px_1px_rgba(255,255,255,0.8)]'
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-white fill-white/20" />
        ) : (
          <Sun className="w-3 h-3 text-white fill-white/20" />
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
