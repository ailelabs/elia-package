import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * SWITCH — a real <button role="switch">. Track tints from
 * line-strong to accent; the white thumb glides across on
 * the strong ease. Controlled only: checked + onChange.
 * ───────────────────────────────────────────────────────── */

export interface SwitchProps
  extends Omit<React.ComponentProps<"button">, "onChange"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Switch({ checked, onChange, label, className, disabled, ...props }: SwitchProps) {
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer items-center gap-2",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative h-4.5 w-8 shrink-0 rounded-full transition-colors duration-200
          focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        style={{ background: checked ? "var(--accent)" : "var(--line-strong)" }}
        {...props}
      >
        <span
          aria-hidden="true"
          className="absolute top-0.5 left-0.5 size-3.5 rounded-full bg-white shadow-btn transition-transform duration-200"
          style={{
            transform: checked ? "translateX(14px)" : "translateX(0)",
            transitionTimingFunction: "var(--ease-out-strong)",
          }}
        />
      </button>
      {label && <span className="text-[13px] text-ink-2">{label}</span>}
    </label>
  );
}
