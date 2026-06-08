"use client";

import { BUTTON_VARIANTS } from "@/constants/buttonStyles";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface CTAButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  accentClassName?: string;
  showArrow?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const CTAButton = ({
  href,
  onClick,
  children,
  className,
  variant = "primary",
  accentClassName,
  showArrow = true,
  leftIcon,
  rightIcon,
  type = "button",
  disabled = false,
}: CTAButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity- px-4 py-2.5 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10";

  const variantConfig = BUTTON_VARIANTS[variant];
  const useAccent = variant === "secondary" && accentClassName;
  const variantStyles = cn(
    variantConfig.base,
    !useAccent && variantConfig.background,
    !useAccent && variantConfig.hover,
    variantConfig.text,
    variantConfig.shadow,
    useAccent && accentClassName,
  );

  const trailingIcon =
    rightIcon ??
    (showArrow ? (
      variant === "secondary" ? (
        <ArrowUpRight className="w-5 h-5 text-white" />
      ) : (
        <ArrowUpRight className="w-5 h-5" />
      )
    ) : null);

  const renderContent = () => {
    if (variant === "secondary") {
      return (
        <>
          <span className="flex items-center gap-1 font-medium text-sm text-center tracking-[0] leading-5 whitespace-nowrap text-white">
            {leftIcon ? (
              <span className="[&_svg]:text-white shrink-0" aria-hidden>
                {leftIcon}
              </span>
            ) : null}
            {children}
          </span>
          {trailingIcon ? (
            <span
              className="inline-flex shrink-0 items-center text-white"
              aria-hidden
            >
              {trailingIcon}
            </span>
          ) : null}
          <div className="absolute top-0 left-[calc(50.00%_-_48px)] w-[97px] h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_42%,rgba(255,255,255,0)_100%)]" />
          <div className="absolute top-0 left-[calc(50.00%_-_48px)] w-[97px] h-px blur-[2px] bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_42%,rgba(255,255,255,0)_100%)]" />
        </>
      );
    }

    return (
      <>
        {children}
        {trailingIcon}
      </>
    );
  };

  const isExternal =
    href &&
    (href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("//"));

  if (href && !disabled) {
    const linkClassName = cn(baseStyles, variantStyles, className);
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className={linkClassName}
        >
          {renderContent()}
        </a>
      );
    }
    return (
      <Link href={href} onClick={onClick} className={linkClassName}>
        {renderContent()}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={cn(baseStyles, variantStyles, className)}
    >
      {renderContent()}
    </button>
  );
};
