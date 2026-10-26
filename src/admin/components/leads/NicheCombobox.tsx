"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

/** How long after the last keystroke the niche list re-filters. */
const SEARCH_DEBOUNCE_MS = 250;
/** Minimum typed characters before the niche dropdown appears at all. */
const MIN_SEARCH_CHARS = 2;

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
 * Inline searchable niche picker — the field itself is the search box (no
 * separate dropdown search input). The dropdown of previously listed niches
 * only appears once at least MIN_SEARCH_CHARS characters are typed (after
 * the debounce settles), filtering that list live. Select an established
 * label instead of accidentally creating near-duplicates ("Cleaning service"
 * vs "Cleaning services"); a genuinely new niche is only added explicitly
 * via the “create” row.
 */
export function NicheCombobox({
  id,
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Type at least 2 characters to search niches…",
  invalid = false,
  className,
}: NicheComboboxProps): JSX.Element {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  /** Keyboard highlight: 0..filtered.length-1 = niche rows, filtered.length = create row. */
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  // JS debounce: only re-filter the previously listed niches once typing has
  // paused for SEARCH_DEBOUNCE_MS.
  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedQuery(query),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [query]);

  // Click outside closes the picker and discards the uncommitted search text.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
        setDebouncedQuery("");
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const normalizedQuery = debouncedQuery.trim().toLowerCase();
  const searchActive = normalizedQuery.length >= MIN_SEARCH_CHARS;
  const filtered = searchActive
    ? options.filter((o) => o.toLowerCase().includes(normalizedQuery))
    : [];
  const canCreate =
    searchActive &&
    !options.some((o) => o.trim().toLowerCase() === normalizedQuery);
  const totalRows = filtered.length + (canCreate ? 1 : 0);
  // Hidden until ≥2 characters are typed — no full-list dump on focus.
  const showList = open && searchActive && totalRows > 0;

  const reset = () => {
    setQuery("");
    setDebouncedQuery("");
    setActiveIndex(-1);
  };

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
    reset();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) =>
        totalRows === 0 ? -1 : Math.min(i + 1, totalRows - 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      if (open && activeIndex >= 0) {
        event.preventDefault();
        if (activeIndex < filtered.length) {
          select(filtered[activeIndex]);
        } else if (canCreate) {
          select(query.trim());
        }
      } else {
        // Enter without a highlighted row: commit the typed text only once it
        // is long enough to be a real niche; otherwise let the form handle it.
        if (query.trim().length >= MIN_SEARCH_CHARS) select(query.trim());
      }
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
        reset();
      }
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <Input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-invalid={invalid || undefined}
        autoComplete="off"
        className={cn("pr-9", className)}
        placeholder={placeholder}
        value={open ? query : value}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
        aria-hidden
      />
      {showList ? (
        <ul
          // Keep focus on the input so clicks below register before blur
          // tears the list down.
          onMouseDown={(e) => e.preventDefault()}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto
            rounded-lg border border-white/10 bg-[#111] py-1 shadow-xl shadow-black/50"
        >
          {filtered.map((niche, i) => (
            <li
              key={niche}
              role="option"
              aria-selected={activeIndex === i}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => select(niche)}
              className={cn(
                "flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-white/85",
                activeIndex === i && "bg-white/10",
              )}
            >
              <Check
                className={cn(
                  "h-4 w-4 shrink-0",
                  value.trim().toLowerCase() === niche.trim().toLowerCase()
                    ? "opacity-100"
                    : "opacity-0",
                )}
                aria-hidden
              />
              <span className="truncate">{niche}</span>
            </li>
          ))}
          {canCreate ? (
            <li
              role="option"
              aria-selected={activeIndex === filtered.length}
              onMouseEnter={() => setActiveIndex(filtered.length)}
              onClick={() => select(query.trim())}
              className={cn(
                "flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-emerald-300",
                activeIndex === filtered.length && "bg-white/10",
              )}
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">
                Add “{query.trim()}” as a new niche
              </span>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
