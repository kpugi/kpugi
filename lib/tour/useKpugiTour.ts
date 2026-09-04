'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { driver, Driver } from 'driver.js';
import confetti from 'canvas-confetti';
import { getTourSteps, isDrawerStep } from './tour-config';

interface UseKpugiTourOptions {
  role: 'creator' | 'advertiser';
  autoStart?: boolean;
  onOpenMobileMenu?: () => void;
  onCloseMobileMenu?: () => void;
}

export function useKpugiTour({
  role,
  autoStart = false,
  onOpenMobileMenu,
  onCloseMobileMenu,
}: UseKpugiTourOptions) {
  const driverRef = useRef<Driver | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Check completion status from LocalStorage and backend API
  useEffect(() => {
    let isMounted = true;

    async function checkTourStatus() {
      try {
        const localStatus = localStorage.getItem(`kpugi_tour_completed_${role}`);
        if (localStatus === 'true') {
          if (isMounted) {
            setHasCompletedTour(true);
            setIsLoading(false);
          }
          return;
        }

        // Check backend status
        const res = await fetch('/api/onboarding/progress');
        if (res.ok) {
          const data = await res.json();
          const completed = !!data.onboarding_tour_completed;
          if (isMounted) {
            setHasCompletedTour(completed);
            if (completed) {
              localStorage.setItem(`kpugi_tour_completed_${role}`, 'true');
            }
          }
        } else {
          if (isMounted) setHasCompletedTour(false);
        }
      } catch (err) {
        console.error('[useKpugiTour] Error checking tour status:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkTourStatus();
    return () => {
      isMounted = false;
    };
  }, [role]);

  // Persist tour completion and fire celebration confetti
  const markTourCompleted = useCallback(async () => {
    try {
      localStorage.setItem(`kpugi_tour_completed_${role}`, 'true');
      setHasCompletedTour(true);
      setIsTourActive(false);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#2F49E8', '#17A75B', '#7B96FF', '#FFD700'],
        });
      } catch {}

      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete-tour', role }),
      });
    } catch (err) {
      console.error('[useKpugiTour] Error persisting tour completion:', err);
    }
  }, [role]);

  // Force Stop Tour
  const stopTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
    setIsTourActive(false);
    onCloseMobileMenu?.();
  }, [onCloseMobileMenu]);

  // Start Tour Handler
  const startTour = useCallback(() => {
    // If an existing instance is running, destroy it first
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const steps = getTourSteps(role, isMobile);

    // Filter steps to only those elements that currently exist in the DOM
    const validSteps = steps.filter((step) => {
      if (typeof step.element === 'string') {
        const el = document.querySelector(step.element);
        if (!el) return false;
        // On desktop, filter out elements that are hidden with display: none
        if (!isMobile) {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || (rect.width === 0 && rect.height === 0)) {
            return false;
          }
        }
        return true;
      }
      return true;
    });

    if (validSteps.length === 0) {
      console.warn('[useKpugiTour] No valid tour targets found on DOM.');
      return;
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(9, 10, 15, 0.82)',
      stagePadding: isMobile ? 6 : 10,
      stageRadius: 14,
      steps: validSteps,
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Finish Tour 🎉',
      onHighlightStarted: (element, step, { driver: d }) => {
        if (isMobile) {
          const inDrawer = isDrawerStep(step?.element);
          if (inDrawer) {
            onOpenMobileMenu?.();
            // Allow CSS transition to slide the drawer out, then reposition spotlight
            setTimeout(() => {
              try {
                d.refresh();
              } catch {}
            }, 320);
          } else {
            onCloseMobileMenu?.();
            setTimeout(() => {
              try {
                d.refresh();
              } catch {}
            }, 320);
          }
        }
      },
      onCloseClick: () => {
        setIsTourActive(false);
        if (isMobile) onCloseMobileMenu?.();
        driverObj.destroy();
      },
      onDestroyStarted: () => {
        setIsTourActive(false);
        if (isMobile) onCloseMobileMenu?.();
        if (!driverObj.hasNextStep()) {
          markTourCompleted();
        }
      },
      onDestroyed: () => {
        setIsTourActive(false);
        if (isMobile) onCloseMobileMenu?.();
        driverRef.current = null;
      },
    });

    driverRef.current = driverObj;
    setIsTourActive(true);
    driverObj.drive();
  }, [role, markTourCompleted, onOpenMobileMenu, onCloseMobileMenu]);

  // Handle auto-start if applicable and not previously completed
  useEffect(() => {
    if (autoStart && !isLoading && !hasCompletedTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, isLoading, hasCompletedTour, startTour]);

  return {
    startTour,
    stopTour,
    isTourActive,
    hasCompletedTour,
    isLoading,
    markTourCompleted,
  };
}
