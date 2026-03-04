import { BUTTON_VARIANTS } from "@/constants/buttonStyles";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CTAButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  showArrow?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

/**
 * Call-to-action button component with multiple variants
 */
export const CTAButton = ({
  href,
  onClick,
  children,
  className,
  variant = "primary",
  showArrow = true,
  type = "button",
  disabled = false,
}: CTAButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity- px-4 py-3 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10";

  const variantConfig = BUTTON_VARIANTS[variant];
  const variantStyles = cn(
    variantConfig.base,
    variantConfig.background,
    variantConfig.hover,
    variantConfig.text,
    variantConfig.shadow
  );

  const arrowIcon = showArrow ? (
    variant === "secondary" ? (
      <ArrowUpRight className="w-[18px] h-[18px] text-white" />
    ) : (
      <ArrowUpRight className="w-5 h-5" />
    )
  ) : null;

  const renderContent = () => {
    if (variant === "secondary") {
      return (
        <>
          <span className="bg-[linear-gradient(58deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,1)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-transparent text-sm text-center tracking-[0] leading-5 whitespace-nowrap">
            {children}
          </span>
          {arrowIcon}
          <div className="absolute top-0 left-[calc(50.00%_-_48px)] w-[97px] h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_42%,rgba(255,255,255,0)_100%)]" />
          <div className="absolute top-0 left-[calc(50.00%_-_48px)] w-[97px] h-px blur-[2px] bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_42%,rgba(255,255,255,0)_100%)]" />
        </>
      );
    }

    return (
      <>
        {children}
        {arrowIcon}
      </>
    );
  };

  if (href && !disabled) {
    return (
      <Link to={href} className={cn(baseStyles, variantStyles, className)}>
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
