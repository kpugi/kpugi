'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'compact' | 'dropdown' | 'inline';
  className?: string;
}

export function ThemeToggle({ variant = 'compact', className = '' }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-kpugi-border/60 dark:border-white/10 bg-kpugi-paper/50 dark:bg-white/5 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  // Direct toggle on click: flips between light and dark
  const handleQuickToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center p-1 rounded-xl bg-kpugi-paper dark:bg-white/5 border border-kpugi-border dark:border-white/10 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            theme === 'light'
              ? 'bg-white dark:bg-white/10 text-kpugi-blue shadow-sm'
              : 'text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white'
          }`}
          title="Light Mode"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            theme === 'dark'
              ? 'bg-white dark:bg-white/10 text-kpugi-blue shadow-sm'
              : 'text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white'
          }`}
          title="Dark Mode"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            theme === 'system'
              ? 'bg-white dark:bg-white/10 text-kpugi-blue shadow-sm'
              : 'text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white'
          }`}
          title="System Preference"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>System</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={handleQuickToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-label={`Toggle theme (Currently ${theme})`}
        title={`Current: ${theme} (Click to toggle, right-click for options)`}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border border-kpugi-border/80 dark:border-white/10 bg-white dark:bg-[#12141A] hover:bg-slate-50 dark:hover:bg-white/10 text-kpugi-slate hover:text-kpugi-ink dark:text-slate-300 dark:hover:text-white shadow-sm hover:shadow active:scale-95 group ${className}`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-amber-400 transition-transform group-hover:rotate-12 duration-300" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform group-hover:rotate-45 duration-300" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xl py-1.5 z-50 animate-fade-in font-sans text-xs">
            <button
              onClick={() => {
                setTheme('light');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                theme === 'light'
                  ? 'text-kpugi-blue font-bold bg-blue-50/50 dark:bg-blue-500/10'
                  : 'text-kpugi-ink dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </div>
              {theme === 'light' && <Check className="w-3.5 h-3.5 text-kpugi-blue" />}
            </button>

            <button
              onClick={() => {
                setTheme('dark');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                theme === 'dark'
                  ? 'text-kpugi-blue font-bold bg-blue-50/50 dark:bg-blue-500/10'
                  : 'text-kpugi-ink dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Dark</span>
              </div>
              {theme === 'dark' && <Check className="w-3.5 h-3.5 text-kpugi-blue" />}
            </button>

            <button
              onClick={() => {
                setTheme('system');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                theme === 'system'
                  ? 'text-kpugi-blue font-bold bg-blue-50/50 dark:bg-blue-500/10'
                  : 'text-kpugi-ink dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span>System</span>
              </div>
              {theme === 'system' && <Check className="w-3.5 h-3.5 text-kpugi-blue" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeToggle;
