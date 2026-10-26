"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";

type NicheComboboxProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Distinct niches already used by existing leads. */
  options: string[];
  placeholder?: string;
  invalid?: boolean;
  className?: string;
};

/**
 * Searchable niche picker: typing filters the existing niches so the admin
 * selects an established label instead of accidentally creating near-duplicates
 * ("Cleaning service" vs "Cleaning services"). A genuinely new niche can still
 * be added explicitly via the “create” row.
 */
export function NicheCombobox({
  id,
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Search niches…",
  invalid = false,
  className,
}: NicheComboboxProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim();
  const normalizedValue = value.trim().toLowerCase();
  const canCreate =
    trimmedQuery !== "" &&
    !options.some((o) => o.trim().toLowerCase() === trimmedQuery.toLowerCase());

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          onBlur={onBlur}
          className={cn(
            "flex items-center justify-between gap-2 text-left",
            className,
          )}
        >
          <span className={cn("truncate", !value && "text-white/25")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        // z-[220] matches SelectContent: the portal must stack above the
        // AdminSidePanel (z-[120]) or the dropdown opens invisibly behind it.
        className="z-[220] w-[var(--radix-popover-trigger-width)] min-w-[240px] border-white/10 bg-[#111] p-0 text-white"
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search niches…"
            className="text-white placeholder:text-white/30 focus:ring-0"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-sm text-white/50">
              {trimmedQuery ? "No matching niche." : "No niches yet."}
            </CommandEmpty>
            {options.length > 0 ? (
              <CommandGroup heading="Existing niches">
                {options.map((niche) => (
                  <CommandItem
                    key={niche}
                    value={niche}
                    onSelect={() => select(niche)}
                    className="gap-2 data-[selected=true]:bg-white/10"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        normalizedValue === niche.trim().toLowerCase()
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                      aria-hidden
                    />
                    <span className="truncate">{niche}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            {canCreate ? (
              <CommandGroup heading="Create new">
                <CommandItem
                  // `value` embeds the typed query, so cmdk's built-in filter
                  // always keeps this row visible while canCreate is true.
                  value={`create:${trimmedQuery.toLowerCase()}`}
                  onSelect={() => select(trimmedQuery)}
                  className="gap-2 text-emerald-300 data-[selected=true]:bg-white/10"
                >
                  <Plus className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">
                    Add “{trimmedQuery}” as a new niche
                  </span>
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
