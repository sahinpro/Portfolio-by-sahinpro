'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

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
  const [isVisible, setIsVisible] = useState(trigger);

  useEffect(() => {
    setIsVisible(trigger);
  }, [trigger]);

  const segments = splitText(children, per);
  const Tag = as as keyof JSX.IntrinsicElements;

  // Calculate stagger based on per type and speed
  const stagger = (defaultStaggerTimes[per] / speedReveal);
  const duration = (0.3 / speedSegment);

  // Get animation properties
  const from = getPresetAnimation(preset);
  const to = getPresetTo(preset);

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay
      }
    }
  };

  const childVariants = {
    hidden: { ...from },
    visible: { 
      ...to,
      transition: { 
        duration: duration,
        ease: [0.37, 0.04, 0.29, 1.01] // power3.out equivalent
      }
    }
  };

  return (
    <Tag ref={containerRef} className={className} style={style}>
      {per !== 'line' && <span className='sr-only'>{children}</span>}
      <motion.div 
        initial="hidden" 
        animate={isVisible ? "visible" : "hidden"}
        variants={containerVariants}
        onAnimationStart={onAnimationStart}
        onAnimationComplete={onAnimationComplete}
      >
        {segments.map((segment, index) => {
          if (per === 'line') {
            return (
              <motion.span
                key={`line-${index}-${segment}`}
                variants={childVariants}
                className={cn('block', segmentWrapperClassName)}
              >
                {segment}
              </motion.span>
            );
          }
          if (per === 'char') {
            return (
              <motion.span
                key={`char-${index}-${segment}`}
                variants={childVariants}
                className={cn('inline-block whitespace-pre', segmentWrapperClassName)}
                aria-hidden='true'
              >
                {segment}
              </motion.span>
            );
          }
          return (
            <motion.span
              key={`word-${index}-${segment}`}
              variants={childVariants}
              className={cn('inline-block whitespace-pre', segmentWrapperClassName)}
              aria-hidden='true'
            >
              {segment}
            </motion.span>
          );
        })}
      </motion.div>
    </Tag>
  );
}