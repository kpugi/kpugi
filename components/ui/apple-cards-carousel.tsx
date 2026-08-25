'use client';

import React, {
  useEffect,
  useState,
  createContext,
} from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import Image, { ImageProps } from 'next/image';

interface CarouselProps {
  items: React.ReactNode[];
  initialScroll?: number;
}

export type CardType = {
  src: string;
  title: string;
  category: string;
  content?: React.ReactNode;
  cpm?: string;
  brand?: string;
  brandLogo?: string | null;
  platform?: string;
  href?: string;
  campaignId?: string;
};

export const CarouselContext = createContext<{
  currentIndex: number;
}>({
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  return (
    <CarouselContext.Provider value={{ currentIndex }}>
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto py-6 md:py-10 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:none"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              'absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l'
            )}
          />

          <div
            className={cn(
              'flex flex-row justify-start gap-4 pl-4',
              'max-w-7xl mx-auto'
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.12 * index,
                    ease: 'easeOut',
                  },
                }}
                key={'card' + index}
                className="last:pr-[5%] md:last:pr-[33%] rounded-3xl"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll Control Arrows */}
        <div className="flex justify-end gap-2 mr-6 sm:mr-10">
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white disabled:opacity-30 shadow-sm transition-all hover:scale-105"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Previous campaigns"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white disabled:opacity-30 shadow-sm transition-all hover:scale-105"
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Next campaigns"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
}: {
  card: CardType;
  index: number;
  layout?: boolean;
}) => {
  const linkHref = card.href || (card.campaignId ? `/browse/${card.campaignId}` : '/browse');

  return (
    <Link
      href={linkHref}
      className="block rounded-3xl bg-slate-100 dark:bg-[#0E121E] border border-slate-200 dark:border-white/[0.08] h-[28rem] w-72 sm:w-80 md:h-[32rem] md:w-96 overflow-hidden relative z-10 text-left shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
    >
      {/* Subtle top & rich bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 z-20 pointer-events-none" />

      {/* Top Bar: View Campaign Arrow at Top Right */}
      <div className="relative z-30 p-5 md:p-6 w-full flex items-center justify-end">
        <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-slate-950 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* Bottom Section: All Textual Details */}
      <div className="absolute bottom-0 inset-x-0 z-30 p-6 md:p-8 w-full flex flex-col gap-3.5">
        {/* Campaign Title */}
        <h3 className="text-white text-xl md:text-2xl font-bold font-clash max-w-sm text-left [text-wrap:balance] leading-snug drop-shadow-md group-hover:text-white/90 transition-colors">
          {card.title}
        </h3>

        {/* Bottom Line: Author / Brand, Category & CPM */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/15 text-white/80 text-xs font-satoshi font-medium">
          <div className="flex items-center gap-2 truncate">
            {card.brand && (
              <span className="font-semibold text-white truncate">
                {card.brand}
              </span>
            )}
            {card.brand && card.category && (
              <span className="w-1 h-1 rounded-full bg-white/40 shrink-0" />
            )}
            <span className="text-white/70 truncate">{card.category}</span>
          </div>

          {card.cpm && (
            <span className="text-emerald-300 text-xs font-extrabold font-clash bg-emerald-500/25 border border-emerald-400/40 px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-sm shrink-0">
              {card.cpm}
            </span>
          )}
        </div>
      </div>

      <BlurImage
        src={card.src}
        alt={card.title}
        fill
        className="object-cover absolute z-10 inset-0 group-hover:scale-105 transition-transform duration-700"
      />
    </Link>
  );
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}: ImageProps) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <Image
      className={cn(
        'transition duration-300',
        isLoading ? 'blur-sm' : 'blur-0',
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      blurDataURL={typeof src === 'string' ? src : undefined}
      alt={alt ? alt : 'Background image'}
      {...rest}
    />
  );
};
