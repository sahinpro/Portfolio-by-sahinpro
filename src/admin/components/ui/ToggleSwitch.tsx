type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
};

export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  id,
  label,
}: Props): JSX.Element {
  return (
    <label
      htmlFor={id}
      className={`inline-flex cursor-pointer items-center gap-3 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-emerald-500/80" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      {label ? <span className="text-sm text-white/70">{label}</span> : null}
    </label>
  );
}
