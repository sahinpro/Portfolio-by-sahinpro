'use client';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import { Children, useEffect, useState } from 'react';

export type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  onIndexChange?: (index: number) => void;
  trigger?: boolean;
};

export function TextLoop({
  children,
  className,
  interval = 2,
  onIndexChange,
  trigger = true,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);
  const { reducedMotion, level } = usePerformanceMode();
  const freeze = useReducedMotion() === true || reducedMotion || level === 'low';

  useEffect(() => {
    if (!trigger || freeze || items.length <= 1) return;

    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, trigger, freeze]);

  const textVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.3, 
        ease: [0.37, 0.04, 0.29, 1.01]
      } 
    }
  };

  return (
    <div className={cn('relative inline-block whitespace-nowrap', className)}>
      <motion.div
        key={currentIndex}
        initial="hidden"
        animate="visible"
        variants={textVariants}
      >
        {items[currentIndex]}
      </motion.div>
    </div>
  );
}