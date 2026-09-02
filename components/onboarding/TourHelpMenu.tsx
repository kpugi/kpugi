'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  PlayCircle,
  ListTodo,
  Bot,
  FileText,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { openCrispChat } from '@/lib/support/crisp';

interface TourHelpMenuProps {
  role: 'creator' | 'advertiser';
  onStartTour: () => void;
  onOpenChat?: () => void;
}

export default function TourHelpMenu({ role, onStartTour, onOpenChat }: TourHelpMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenSupport = () => {
    setIsOpen(false);
    if (onOpenChat) {
      onOpenChat();
    } else {
      openCrispChat();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="tour-header-help-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Help & Guides"
        className="p-2 rounded-xl text-kpugi-slate hover:text-kpugi-ink dark:text-slate-300 dark:hover:text-white hover:bg-kpugi-paper dark:hover:bg-white/5 transition-colors relative"
      >
        <HelpCircle className="w-[18px] h-[18px]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0D1017] border border-kpugi-border dark:border-white/10 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-kpugi-border dark:border-white/10 mb-1">
            <p className="text-xs font-bold text-kpugi-ink dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-kpugi-blue" />
              <span>Help & Resources</span>
            </p>
            <p className="text-[11px] text-kpugi-slate dark:text-slate-400">
              Quick guides and interactive assistance
            </p>
          </div>

          <div className="space-y-0.5">
            {/* Replay Tour */}
            <button
              onClick={() => {
                setIsOpen(false);
                onStartTour();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-kpugi-blue/10 dark:hover:bg-kpugi-blue/20 group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <PlayCircle className="w-4 h-4 text-kpugi-blue dark:text-[#7B96FF]" />
                <div>
                  <p className="text-xs font-bold text-kpugi-ink dark:text-white group-hover:text-kpugi-blue dark:group-hover:text-[#7B96FF]">
                    Replay Product Tour
                  </p>
                  <p className="text-[10px] text-kpugi-slate dark:text-slate-400">
                    Interactive 60-second walkthrough
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-kpugi-slate group-hover:text-kpugi-blue" />
            </button>

            {/* Crisp Live Support & AI Assistant */}
            <button
              onClick={handleOpenSupport}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-kpugi-ink dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Live Support & AI Assistant
                  </p>
                  <p className="text-[10px] text-kpugi-slate dark:text-slate-400">
                    Get instant help or chat with our team
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-kpugi-slate group-hover:text-emerald-600" />
            </button>

            {/* Documentation / Guidelines */}
            <Link
              href="/rules"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/5 group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-kpugi-ink dark:text-white">
                    Platform Guidelines & FAQs
                  </p>
                  <p className="text-[10px] text-kpugi-slate dark:text-slate-400">
                    Payment policies and guidelines
                  </p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-kpugi-slate" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
