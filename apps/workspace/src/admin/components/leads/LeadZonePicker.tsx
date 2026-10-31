"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sahinpro/shared/ui/select";

export type ZoneOption = { id: string; city: string; tz: string };

const triggerClass =
  "h-8 w-full rounded-lg border-white/[0.08] bg-white/[0.04] text-xs text-white " +
  "focus-visible:border-white/[0.18] focus-visible:bg-white/[0.06]";

/** Compact city / IANA-time-zone selector used by the Outreach Time Planner. */
export function ZonePicker({
  value,
  options,
  onChange,
  placeholder = "Select a city…",
  ariaLabel,
}: {
  value: string;
  options: ZoneOption[];
  onChange: (tz: string) => void;
  placeholder?: string;
  ariaLabel: string;
}): JSX.Element {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={`${triggerClass} ${value ? "" : "border-amber-400/40 bg-amber-500/[0.08]"}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border-white/10 bg-[#111] text-white">
        {options.map((o) => (
          <SelectItem
            key={`${o.id}-${o.tz}`}
            value={o.tz}
            className="focus:bg-white/10 text-xs"
          >
            {o.city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
