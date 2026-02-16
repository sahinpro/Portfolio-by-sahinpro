import { cn } from "@/lib/utils";
import * as React from "react";

interface FuzzyTextProps extends React.HTMLAttributes<HTMLDivElement> {
  baseIntensity?: number;
  hoverIntensity?: number;
  enableHover?: boolean;
  children: React.ReactNode;
}

const FuzzyText = React.forwardRef<HTMLDivElement, FuzzyTextProps>(
  (
    {
      className,
      baseIntensity = 0.2,
      hoverIntensity = 0.5,
      enableHover = false,
      children,
      ...props
    },
    ref
  ) => {
    const [intensity, setIntensity] = React.useState(baseIntensity);
    const textRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!enableHover || !textRef.current) return;

      const element = textRef.current;

      const handleMouseEnter = () => {
        setIntensity(hoverIntensity);
      };

      const handleMouseLeave = () => {
        setIntensity(baseIntensity);
      };

      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, [enableHover, hoverIntensity, baseIntensity]);

    // Generate multiple text shadows for a more realistic fuzzy effect
    const generateTextShadow = (intensity: number) => {
      const shadows: string[] = [];
      const steps = 8;
      for (let i = 0; i < steps; i++) {
        const offset = (i / steps) * intensity * 2;
        const blur = intensity * (1 + i * 0.5);
        const opacity = 1 - i / steps;
        shadows.push(
          `${offset}px ${offset}px ${blur}px rgba(255, 255, 255, ${opacity * 0.8})`
        );
      }
      return shadows.join(", ");
    };

    return (
      <div
        ref={ref}
        className={cn("inline-block", className)}
        {...props}
      >
        <div
          ref={textRef}
          className="inline-block"
          style={{
            filter: `blur(${intensity}px)`,
            transition: "filter 0.3s ease-in-out",
            textShadow: generateTextShadow(intensity),
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

FuzzyText.displayName = "FuzzyText";

export default FuzzyText;
