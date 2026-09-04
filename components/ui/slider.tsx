'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  rangeClassName?: string;
  thumbClassName?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, rangeClassName, thumbClassName, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center py-2 cursor-pointer',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-neutral-800/80 border border-slate-300/40 dark:border-white/5 transition-colors">
      <SliderPrimitive.Range
        className={cn('absolute h-full bg-[#2F49E8] transition-all', rangeClassName)}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        'block h-5 w-5 rounded-full border-2 border-[#2F49E8] bg-white ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F49E8] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-115 active:scale-95 shadow-md shadow-[#2F49E8]/30',
        thumbClassName
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
