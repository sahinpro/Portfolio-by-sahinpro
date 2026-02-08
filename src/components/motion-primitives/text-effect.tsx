'use client';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import React from 'react';

export type PresetType = 'blur' | 'fade-in-blur' | 'scale' | 'fade' | 'slide';

export type PerType = 'word' | 'char' | 'line';

export type TextEffectProps = {
  children: string;
  per?: PerType;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  preset?: PresetType;
  delay?: number;
  speedReveal?: number;
  speedSegment?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  segmentWrapperClassName?: string;
  style?: React.CSSProperties;
};

const defaultStaggerTimes: Record<PerType, number> = {
  char: 0.03,
  word: 0.05,
  line: 0.1,
};

const getPresetAnimation = (preset: PresetType) => {
  switch (preset) {
    case 'blur':
      return { opacity: 0, filter: 'blur(12px)' };
    case 'fade-in-blur':
      return { opacity: 0, y: 20, filter: 'blur(12px)' };
    case 'scale':
      return { opacity: 0, scale: 0 };
    case 'slide':
      return { opacity: 0, y: 20 };
    case 'fade':
    default:
      return { opacity: 0 };
  }
};

const getPresetTo = (preset: PresetType) => {
  switch (preset) {
    case 'blur':
      return { opacity: 1, filter: 'blur(0px)' };
    case 'fade-in-blur':
      return { opacity: 1, y: 0, filter: 'blur(0px)' };
    case 'scale':
      return { opacity: 1, scale: 1 };
    case 'slide':
      return { opacity: 1, y: 0 };
    case 'fade':
    default:
      return { opacity: 1 };
  }
};

const splitText = (text: string, per: PerType) => {
  if (per === 'line') return text.split('\n');
  if (per === 'char') return text.split('');
  return text.split(/(\s+)/);
};

export function TextEffect({
  children,
  per = 'word',
  as = 'p',
  className,
  preset = 'fade',
  delay = 0,
  speedReveal = 1,
  speedSegment = 1,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
  segmentWrapperClassName,
  style,
}: TextEffectProps) {
  const containerRef = useRef<HTMLElement>(null);
  const segmentsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [isVisible, setIsVisible] = useState(trigger);

  useEffect(() => {
    setIsVisible(trigger);
  }, [trigger]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const segments = segmentsRef.current.filter(Boolean) as HTMLSpanElement[];
    if (segments.length === 0) return;

    onAnimationStart?.();

    const stagger = (defaultStaggerTimes[per] / speedReveal) * 1000;
    const duration = (0.3 / speedSegment) * 1000;

    const from = getPresetAnimation(preset);
    const to = getPresetTo(preset);

    gsap.fromTo(
      segments,
      from,
      {
        ...to,
        duration: duration / 1000,
        delay: delay,
        stagger: stagger / 1000,
        ease: 'power3.out',
        onComplete: onAnimationComplete,
      }
    );
  }, [isVisible, children, per, preset, delay, speedReveal, speedSegment, onAnimationComplete, onAnimationStart]);

  const segments = splitText(children, per);
  const Tag = as as keyof JSX.IntrinsicElements;

  return (
    <Tag ref={containerRef} className={className} style={style}>
      {per !== 'line' && <span className='sr-only'>{children}</span>}
      {segments.map((segment, index) => {
        if (per === 'line') {
          return (
            <span
              key={`line-${index}-${segment}`}
              ref={(el) => {
                segmentsRef.current[index] = el;
              }}
              className={cn('block', segmentWrapperClassName)}
            >
              {segment}
            </span>
          );
        }
        if (per === 'char') {
          return (
            <span
              key={`char-${index}-${segment}`}
              ref={(el) => {
                segmentsRef.current[index] = el;
              }}
              className={cn('inline-block whitespace-pre', segmentWrapperClassName)}
              aria-hidden='true'
            >
              {segment}
            </span>
          );
        }
        return (
          <span
            key={`word-${index}-${segment}`}
            ref={(el) => {
              segmentsRef.current[index] = el;
            }}
            className={cn('inline-block whitespace-pre', segmentWrapperClassName)}
            aria-hidden='true'
          >
            {segment}
          </span>
        );
      })}
    </Tag>
  );
}
