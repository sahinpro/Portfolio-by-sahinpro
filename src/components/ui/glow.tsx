import { cva, VariantProps } from "class-variance-authority";
import React from "react";

import { cn } from "@/lib/utils";

const glowVariants = cva("absolute w-full", {
  variants: {
    variant: {
      top: "top-0",
      above: "-top-[128px]",
      bottom: "bottom-0",
      below: "-bottom-[128px]",
      center: "top-[50%]",
    },
  },
  defaultVariants: {
    variant: "top",
  },
});

function Glow({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof glowVariants>) {
  return (
    <div
      data-slot="glow"
      className={cn(glowVariants({ variant }), className)}
      {...props}
    >
      <div
        className={cn(
          "absolute left-1/2 h-[108px] w-[50%] -translate-x-1/2 scale-[2.5] rounded-[50%] opacity-100 sm:h-[712px] pointer-events-none blur-3xl ",
          variant === "center" && "-translate-y-1/2",
        )}
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(205, 205, 205, 1), transparent 60%)",
        }}
      />
      <div
        className={cn(
          "absolute left-1/2 h-[108px] w-[40%] -translate-x-1/2 scale-[200%] rounded-[50%] opacity-100 sm:h-[256px] pointer-events-none blur-3xl",
          variant === "center" && "-translate-y-1/2",
        )}
        style={{
          background:
            "radial-gradient(ellipse 40% 100% at 50% 0%, rgba(105, 105, 105, 1), transparent 80%)",
        }}
      />
    </div>
  );
}

export default Glow;
