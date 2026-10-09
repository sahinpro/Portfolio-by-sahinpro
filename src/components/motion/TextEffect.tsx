"use client";
import { usePerformanceMode } from "@/hooks/usePerformanceMode";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export type PresetType = "blur" | "fade-in-blur" | "scale" | "fade" | "slide";

export type PerType = "word" | "char" | "line";

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
    case "blur":
      return { opacity: 0, filter: "blur(12px)" };
    case "fade-in-blur":
      return { opacity: 0, y: 20, filter: "blur(12px)" };
    case "scale":
      return { opacity: 0, scale: 0 };
    case "slide":
      return { opacity: 0, y: 20 };
    case "fade":
    default:
      return { opacity: 0 };
  }
};

const getPresetTo = (preset: PresetType) => {
  switch (preset) {
    case "blur":
      return { opacity: 1, filter: "blur(0px)" };
    case "fade-in-blur":
      return { opacity: 1, y: 0, filter: "blur(0px)" };
    case "scale":
      return { opacity: 1, scale: 1 };
    case "slide":
      return { opacity: 1, y: 0 };
    case "fade":
    default:
      return { opacity: 1 };
  }
};

const splitText = (text: string, per: PerType) => {
  if (per === "line") return text.split("\n");
  if (per === "char") return text.split("");
  return text.split(/(\s+)/);
};

const splitWordsWithSpaces = (text: string): string[] => {
  return text.split(/(\s+)/);
};

export function TextEffect({
  children,
  per = "word",
  as = "div",
  className,
  preset = "fade",
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
  const { simpleVisuals, reducedMotion, level } = usePerformanceMode();
  const freezeMotion = reducedMotion || level === "low";
  const motionPer: PerType =
    simpleVisuals && per === "char" ? "word" : per;
  const motionPreset: PresetType =
    simpleVisuals && (preset === "blur" || preset === "fade-in-blur")
      ? "slide"
      : preset;

  useEffect(() => {
    setIsVisible(trigger);
  }, [trigger]);

  const Tag = as as keyof JSX.IntrinsicElements;

  if (freezeMotion) {
    return (
      <Tag ref={containerRef} className={className} style={style}>
        {children}
      </Tag>
    );
  }

  const segments = splitText(children, motionPer);
  const wordSegments = motionPer === "char" ? splitWordsWithSpaces(children) : null;

  const stagger = defaultStaggerTimes[motionPer] / speedReveal;
  const duration = (simpleVisuals ? 0.22 : 0.3) / speedSegment;
  const from = getPresetAnimation(motionPreset);
  const to = getPresetTo(motionPreset);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const childVariants = {
    hidden: { ...from },
    visible: {
      ...to,
      transition: {
        duration: duration,
        ease: [0.37, 0.04, 0.29, 1.01],
      },
    },
  };

  if (motionPer === "char" && wordSegments) {
    let charIndex = 0;
    return (
      <Tag ref={containerRef} className={className} style={style}>
        <span className="sr-only">{children}</span>
        <motion.span
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
          onAnimationStart={onAnimationStart}
          onAnimationComplete={onAnimationComplete}
          className="inline"
        >
          {wordSegments.map((wordOrSpace, wordIndex) => {
            const isSpace = /^\s+$/.test(wordOrSpace);
            if (isSpace) {
              return (
                <span
                  key={`space-${wordIndex}`}
                  className="whitespace-pre leading-9 sm:leading-7 md:leading-8 lg:leading-[60px]"
                  aria-hidden="true"
                >
                  {wordOrSpace}
                </span>
              );
            }
            const chars = wordOrSpace.split("");
            return (
              <span
                key={`word-${wordIndex}-${wordOrSpace}`}
                className="inline-block whitespace-nowrap align-baseline"
                aria-hidden="true"
              >
                {chars.map((char) => {
                  const i = charIndex++;
                  const charDelay = delay + i * stagger;
                  return (
                    <motion.span
                      key={`char-${i}-${char}`}
                      variants={{
                        hidden: childVariants.hidden,
                        visible: {
                          ...childVariants.visible,
                          transition: {
                            ...childVariants.visible.transition,
                            delay: charDelay,
                          },
                        },
                      }}
                      className={cn(
                        "inline-block whitespace-pre",
                        segmentWrapperClassName,
                      )}
                    >
                      {char}
                    </motion.span>
                  );
                })}
              </span>
            );
          })}
        </motion.span>
      </Tag>
    );
  }

  return (
    <Tag ref={containerRef} className={className} style={style}>
      {motionPer !== "line" && <span className="sr-only">{children}</span>}
      <motion.span
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={containerVariants}
        onAnimationStart={onAnimationStart}
        onAnimationComplete={onAnimationComplete}
        className={motionPer === "line" ? "block" : "inline"}
      >
        {segments.map((segment, index) => {
          if (motionPer === "line") {
            return (
              <motion.span
                key={`line-${index}-${segment}`}
                variants={childVariants}
                className={cn("block", segmentWrapperClassName)}
              >
                {segment}
              </motion.span>
            );
          }
          return (
            <motion.span
              key={`word-${index}-${segment}`}
              variants={childVariants}
              className={cn(
                "inline-block whitespace-pre",
                segmentWrapperClassName,
              )}
              aria-hidden="true"
            >
              {segment}
            </motion.span>
          );
        })}
      </motion.span>
    </Tag>
  );
}
