import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { KeyboardEvent, useState } from "react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  className = "",
}: Props): JSX.Element {
  const [input, setInput] = useState("");

  const add = (raw: string) => {
    const t = raw.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setInput("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add(input);
    }
    if (e.key === "Backspace" && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className={`flex min-h-[44px] flex-wrap gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 ${className}`}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/90"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== tag))}
            className="rounded p-0.5 hover:bg-white/20"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (input.trim()) add(input);
        }}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-white shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/30 h-8"
      />
    </div>
  );
}
