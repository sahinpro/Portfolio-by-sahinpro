"use client";

import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  type MotionValue,
} from "framer-motion";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Anthropic Claude brand terracotta */
export const CLAUDE_BRAND_COLOR = "#D97757";

/** Keep the custom cursor above cards, header chrome, and overlays. */
export const FOLLOWING_POINTER_Z_INDEX = 99999;

export type FollowerPointerCardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string | React.ReactNode;
  accentColor?: string;
  pointerClassName?: string;
  bubbleClassName?: string;
};

export function FollowerPointerCard({
  children,
  className,
  title,
  accentColor = CLAUDE_BRAND_COLOR,
  pointerClassName,
  bubbleClassName,
}: FollowerPointerCardProps): JSX.Element {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isInside, setIsInside] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    x.set(e.clientX);
    y.set(e.clientY);
  };

  return (
    <div
      onMouseLeave={() => setIsInside(false)}
      onMouseEnter={() => setIsInside(true)}
      onMouseMove={handleMouseMove}
      className={cn("relative cursor-none", className)}
    >
      {mounted
        ? createPortal(
            <AnimatePresence>
              {isInside ? (
                <FollowPointer
                  x={x}
                  y={y}
                  title={title}
                  accentColor={accentColor}
                  pointerClassName={pointerClassName}
                  bubbleClassName={bubbleClassName}
                />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
      {children}
    </div>
  );
}

function FollowPointer({
  x,
  y,
  title,
  accentColor,
  pointerClassName,
  bubbleClassName,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  title?: string | React.ReactNode;
  accentColor: string;
  pointerClassName?: string;
  bubbleClassName?: string;
}): JSX.Element {
  return (
    <motion.div
      className="pointer-events-none fixed h-4 w-4 rounded-full"
      style={{
        top: y,
        left: x,
        zIndex: FOLLOWING_POINTER_Z_INDEX,
      }}
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="1"
        viewBox="0 0 16 16"
        className={cn(
          "h-6 w-6 -translate-x-[12px] -translate-y-[10px] -rotate-[70deg] transform",
          pointerClassName,
        )}
        style={{ color: accentColor }}
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
      </svg>
      <motion.div
        style={{ backgroundColor: accentColor }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className={cn(
          "min-w-max rounded-full px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg shadow-black/30",
          bubbleClassName,
        )}
      >
        {title ?? "Featured project"}
      </motion.div>
    </motion.div>
  );
}
