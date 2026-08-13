import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * CHECKBOX — the approval-card check square as a real form
 * control. A visually hidden native <input type="checkbox">
 * drives state (checked/peer variants), so controlled and
 * uncontrolled usage both work with zero local state.
 * ───────────────────────────────────────────────────────── */

export interface CheckboxProps
  extends Omit<React.ComponentProps<"input">, "type" | "size"> {
  label?: string;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer items-center gap-2 has-[:disabled]:pointer-events-none has-[:disabled]:opacity-40",
        className,
      )}
    >
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className="flex size-4 shrink-0 items-center justify-center rounded-[5px] text-transparent
          shadow-[inset_0_0_0_1.5px_var(--line-strong)] transition-colors duration-200
          peer-checked:bg-ink peer-checked:text-canvas peer-checked:shadow-none
          peer-focus-visible:outline-2 peer-focus-visible:outline-accent peer-focus-visible:outline-offset-2"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      {label && (
        <span className="text-[13px] text-ink-2 transition-colors duration-200 peer-checked:text-ink">
          {label}
        </span>
      )}
    </label>
  );
}
