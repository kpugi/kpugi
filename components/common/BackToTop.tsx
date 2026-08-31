'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (totalScroll > 0) {
        setScrollProgress(Number((currentScroll / totalScroll).toFixed(3)));
      }

      if (currentScroll > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG circular stroke calculation for 36px radius
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 group flex items-center justify-center size-11 rounded-full bg-white/80 dark:bg-[#0E121E]/80 backdrop-blur-md border border-slate-200/90 dark:border-white/15 text-slate-700 dark:text-slate-200 shadow-lg shadow-slate-900/5 dark:shadow-black/40 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2F49E8]"
        >
          {/* Subtle Circular Scroll Progress Indicator */}
          <svg className="absolute inset-0 size-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="text-slate-200/50 dark:text-white/5"
              strokeWidth="2.2"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="text-kpugi-primary dark:text-[#5B7CFF] transition-all duration-150"
              strokeWidth="2.2"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Up Arrow Icon */}
          <ArrowUp className="size-4.5 transition-transform duration-200 group-hover:-translate-y-0.5 text-slate-700 dark:text-slate-200 group-hover:text-kpugi-primary dark:group-hover:text-white relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default BackToTop;
