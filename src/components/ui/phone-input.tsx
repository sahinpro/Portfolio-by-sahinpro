"use client";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDown, Search } from "lucide-react";
import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

type PhoneInputProps = Omit<
  React.ComponentProps<typeof RPNInput.default>,
  "onChange"
> & {
  onChange?: (value: RPNInput.Value | undefined) => void;
  error?: string;
  id?: string;
};

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(
  (
    {
      className,
      onChange,
      error,
      id,
      name,
      onBlur,
      numberInputProps,
      ...props
    },
    ref,
  ) => (
    <div className="flex flex-col gap-1.5 w-full">
      <div
        className={cn(
          "flex overflow-hidden rounded-xl border border-input bg-input/30 transition-colors outline-none",
          "focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/50",
          error
            ? "border-destructive/60 focus-within:border-destructive focus-within:ring-4 focus-within:ring-destructive/20"
            : null,
          className,
        )}
      >
        <RPNInput.default
          ref={ref}
          className="flex flex-1 min-w-0"
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={InputComponent}
          onChange={(value) => onChange?.(value ?? undefined)}
          numberInputProps={{ id, name, onBlur, ...numberInputProps }}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  ),
);
PhoneInput.displayName = "PhoneInput";

const InputComponent = ({
  className,
  ref: _ref,
  ...props
}: React.ComponentProps<"input">) => (
  <input
    className={cn(
      "flex h-10 w-full min-w-0 flex-1 rounded-r-xl rounded-l-none border-0 border-l border-input bg-transparent px-3 py-1 text-base text-white shadow-none transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-0 md:text-sm",
      className,
    )}
    {...props}
  />
);
InputComponent.displayName = "InputComponent";

type CountrySelectOption = { label: string; value: RPNInput.Country };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
  options: CountrySelectOption[];
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    const list = options.filter((x) => x.value);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.value && RPNInput.getCountryCallingCode(o.value).includes(q)),
    );
  }, [options, search]);

  const selected = options.find((o) => o.value === value);

  React.useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSelect = React.useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex items-center gap-1.5 rounded-l-xl rounded-r-none h-10 pl-3 pr-2 min-w-0 text-white hover:bg-white/5 focus:outline-none focus:ring-0 disabled:opacity-50"
          aria-label="Country"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selected?.value &&
            (() => {
              const Flag = flags[selected.value];
              return Flag ? (
                <span className="flex h-5 w-6 shrink-0 overflow-hidden rounded-sm">
                  <Flag title={selected.label} />
                </span>
              ) : null;
            })()}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] min-w-[280px] max-w-[calc(100vw-2rem)] p-0 border border-white/10 bg-[#0d0d0d] text-white rounded-lg shadow-xl align-start"
        align="start"
        sideOffset={4}
      >
        <div className="border-b border-white/10 p-2">
          <div className="flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-2.5 py-1.5">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <Input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="flex-1 min-w-0 border-0 bg-transparent text-sm text-white shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/40"
              aria-label="Search country"
            />
          </div>
        </div>
        <div
          className="phone-country-list max-h-[260px] overflow-y-auto overflow-x-hidden py-1"
          role="listbox"
          aria-label="Countries"
          style={
            {
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            } as React.CSSProperties
          }
        >
          <style>{`
            .phone-country-list::-webkit-scrollbar { display: none; }
          `}</style>
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/50">
              No country found.
            </p>
          ) : (
            filtered.map((option) => {
              const Flag = option.value ? flags[option.value] : null;
              const isSelected = value === option.value;
              const code = option.value
                ? `+${RPNInput.getCountryCallingCode(option.value)}`
                : "";
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "w-full grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-3 py-2 text-left text-sm rounded-md transition-colors",
                    "hover:bg-white/10 text-white/90 hover:text-white",
                    isSelected && "bg-white/10 text-white",
                  )}
                  onClick={() => option.value && handleSelect(option.value)}
                >
                  {Flag ? (
                    <span className="flex h-5 w-6 shrink-0 overflow-hidden rounded-sm place-self-center">
                      <Flag title={option.label} />
                    </span>
                  ) : (
                    <span className="w-6" />
                  )}
                  <span className="min-w-0 truncate">{option.label}</span>
                  {code ? (
                    <span className="text-xs text-white/50 tabular-nums text-right shrink-0">
                      {code}
                    </span>
                  ) : (
                    <span />
                  )}
                  {isSelected ? (
                    <CheckIcon className="h-4 w-4 shrink-0 text-violet-400" />
                  ) : (
                    <span className="w-4" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];
  return (
    <span className="flex h-4 w-4 overflow-hidden rounded-sm">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
