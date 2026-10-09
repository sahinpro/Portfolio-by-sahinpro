import { cn } from "@/lib/utils";
import * as React from "react";

export const inputFieldClassName =
  "flex h-9 w-full min-w-0 rounded-md border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-4 focus-visible:ring-ring/[0.04] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

export const inputFieldShellClassName =
  "flex w-full min-w-0 overflow-hidden rounded-md border border-input bg-input/30 transition-colors outline-none focus-within:ring-4 focus-within:ring-ring/[0.04]";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputFieldClassName, className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
