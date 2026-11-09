import React, { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <>
      <style>
        {`
          @keyframes marquee {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(calc(-100% - var(--gap, 1rem)));
            }
          }

          @keyframes marquee-vertical {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(calc(-100% - var(--gap, 1rem)));
            }
          }

          .animate-marquee {
            animation: marquee var(--duration, 40s) linear infinite;
          }

          .animate-marquee-vertical {
            animation: marquee-vertical var(--duration, 40s) linear infinite;
          }

          .animate-reverse {
            animation-direction: reverse !important;
          }

          .pause-on-hover:hover .animate-marquee,
          .pause-on-hover:hover .animate-marquee-vertical {
            animation-play-state: paused !important;
          }
        `}
      </style>
      <div
        {...props}
        className={cn(
          'group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem]',
          {
            'flex-row gap-[var(--gap,1rem)]': !vertical,
            'flex-col gap-[var(--gap,1rem)]': vertical,
            'pause-on-hover': pauseOnHover,
          },
          className
        )}
      >
        {Array(repeat)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={cn('flex shrink-0 justify-around gap-[var(--gap,1rem)]', {
                'animate-marquee flex-row': !vertical,
                'animate-marquee-vertical flex-col': vertical,
                'animate-reverse': reverse,
              })}
            >
              {children}
            </div>
          ))}
      </div>
    </>
  );
}

export default Marquee;

