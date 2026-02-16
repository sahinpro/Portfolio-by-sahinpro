'use client';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { Children, useEffect, useRef, useState } from 'react';

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
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, trigger]);

  useEffect(() => {
    if (!textRef.current) return;

    gsap.fromTo(
      textRef.current,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power3.out',
      }
    );
  }, [currentIndex]);

  return (
    <div className={cn('relative inline-block whitespace-nowrap', className)}>
      <div ref={textRef} key={currentIndex}>
        {items[currentIndex]}
      </div>
    </div>
  );
}
