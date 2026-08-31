'use client';

import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { FaPlus, FaMinus } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Faq6Props {
  badge?: string;
  title: React.ReactNode;
  faqs: FaqItem[];
  className?: string;
}

export function Faq6({
  badge = 'Got Questions? We Got Answers',
  title = 'Frequently Asked Questions',
  faqs,
  className,
}: Faq6Props) {
  return (
    <section className={cn('relative mx-auto w-full max-w-6xl py-20 px-4 sm:px-6 lg:px-8', className)}>
      {/* Ambient soft background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-sky-500/5 to-indigo-500/10 dark:from-emerald-500/[0.06] dark:via-cyan-500/[0.04] dark:to-violet-500/[0.06] blur-[120px] rounded-full" />

      <div className="relative z-10 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#070b16]/75 shadow-xl backdrop-blur-2xl grid grid-cols-1 md:grid-cols-12">
        {/* Left Column: Title & Badge */}
        <div className="md:col-span-4 lg:col-span-5 p-8 md:p-12 border-b border-slate-200/80 dark:border-white/10 md:border-b-0 md:border-r flex flex-col justify-start bg-slate-50/50 dark:bg-white/[0.02]">
          {badge && (
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                💬 {badge}
              </span>
            </div>
          )}
          <h2 className="font-display text-slate-950 dark:text-white text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-tight">
            {title}
          </h2>
          <p className="mt-4 font-sans text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Everything you need to know about joining drops, tracking views, and getting paid every Friday.
          </p>
        </div>

        {/* Right Column: Accordion Items */}
        <div className="md:col-span-8 lg:col-span-7 relative">
          <AccordionPrimitive.Root type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionPrimitive.Item
                key={faq.id}
                value={faq.id}
                className="border-b border-slate-200/80 dark:border-white/10 px-6 md:px-8 last:border-b-0"
              >
                <AccordionPrimitive.Header className="flex">
                  <AccordionPrimitive.Trigger className="group flex flex-1 items-center justify-between py-6 md:py-8 hover:no-underline text-left cursor-pointer">
                    <div className="flex flex-1 items-center gap-4 sm:gap-6 pr-4">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest shrink-0">
                        Q{index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </span>
                      <span className="font-display text-slate-950 dark:text-white text-left text-base font-bold md:text-lg leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    <div className="size-8 shrink-0 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors group-hover:bg-emerald-500/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      <FaPlus className="block h-3 w-3 group-data-[state=open]:hidden" />
                      <FaMinus className="hidden h-3 w-3 group-data-[state=open]:block" />
                    </div>
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>

                <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="pb-8 pl-8 sm:pl-12 pr-4 sm:pr-8">
                    <p className="font-sans text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            ))}
          </AccordionPrimitive.Root>
        </div>
      </div>
    </section>
  );
}

export default Faq6;
