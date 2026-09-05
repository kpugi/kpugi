import React from 'react';
import {
  IoHeadset,
  IoBriefcase,
  IoHelpCircle,
  IoMegaphone,
} from 'react-icons/io5';
import { FRESHDESK_PORTAL_URL } from '@/lib/support/freshdesk-constants';

export interface ContactMethod {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  isExternal?: boolean;
}

export interface ContactBlockProps {
  badgeText?: string;
  title?: string;
  description?: string;
  contactMethods?: ContactMethod[];
}

const defaultMethods: ContactMethod[] = [
  {
    id: 'creator-support',
    icon: <IoHeadset className="h-6 w-6 text-[#2F49E8] dark:text-[#5B7CFF]" />,
    title: 'Creator Support & Payouts',
    description: 'Get fast assistance with post verification, 1,000-view audits, or Friday direct bank payouts.',
    actionLabel: 'creators@kpugi.com',
    actionUrl: 'mailto:creators@kpugi.com',
  },
  {
    id: 'brand-sales',
    icon: <IoBriefcase className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    title: 'Brand Partnerships & Sales',
    description: 'Plan custom CPM drops, ₦5M+ institutional campaigns, or multi-platform creator distributions.',
    actionLabel: 'brands@kpugi.com',
    actionUrl: 'mailto:brands@kpugi.com',
  },
  {
    id: 'help-center',
    icon: <IoHelpCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
    title: 'Help Center & Solutions',
    description: 'Browse 50+ self-service guides, operating rules, or track your open tickets in real time.',
    actionLabel: 'Visit Help Center →',
    actionUrl: FRESHDESK_PORTAL_URL || 'https://support.kpugi.com',
    isExternal: true,
  },
  {
    id: 'press-legal',
    icon: <IoMegaphone className="h-6 w-6 text-amber-500" />,
    title: 'Media, Press & Legal',
    description: 'For PR inquiries, brand sponsorships, strategic partnerships, and regulatory compliance notices.',
    actionLabel: 'press@kpugi.com',
    actionUrl: 'mailto:press@kpugi.com',
  },
];

export default function ContactBlock({
  badgeText = 'Connect With Kpugi',
  title = 'How can we assist you today?',
  description = 'Our distributed team is available across Nigeria to ensure both advertisers and creators receive prompt, reliable assistance.',
  contactMethods = defaultMethods,
}: ContactBlockProps) {
  return (
    <section className="w-full pt-28 pb-12 sm:pt-36 sm:pb-16 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl space-y-4">
          {badgeText && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase">
              <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
              <span>{badgeText}</span>
            </div>
          )}
          {title && (
            <h1 className="text-3xl font-extrabold font-display tracking-tight sm:text-4xl md:text-5xl text-slate-900 dark:text-white">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactMethods.map((method) => (
            <div
              key={method.id}
              className="bg-white dark:bg-[#0B0D14] flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 p-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] ring-0 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="bg-slate-50 dark:bg-white/[0.04] mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0px_0px_0px_1px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04),0px_2px_4px_0px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0px_0px_0px_1px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04),0px_2px_4px_0px_rgba(0,0,0,0.04)]">
                  {method.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold font-display text-slate-900 dark:text-white">
                  {method.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mb-8 flex-1 leading-relaxed">
                  {method.description}
                </p>
                <div className="mt-auto">
                  <a
                    href={method.actionUrl}
                    target={method.isExternal ? '_blank' : undefined}
                    rel={method.isExternal ? 'noopener noreferrer' : undefined}
                    className="w-full py-3 px-4 rounded-xl bg-[#2F49E8] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),inset_0_-1px_0_0_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>{method.actionLabel}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
