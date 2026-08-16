import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * CHECKBOX — the approval-card check square as a real form
 * control. A visually hidden native <input type="checkbox">
 * drives state (checked/peer variants), so controlled and
 * uncontrolled usage both work with zero local state.
 * `indeterminate` is a DOM property with no HTML attribute,
 * so it is set through a ref callback rather than a prop.
 * ───────────────────────────────────────────────────────── */

export interface CheckboxProps
  extends Omit<React.ComponentProps<"input">, "type" | "size"> {
  label?: string;
  /** The "some but not all" state, for select-all headers. */
  indeterminate?: boolean;
}

export function Checkbox({ label, indeterminate, className, ref, ...props }: CheckboxProps) {
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer items-center gap-2 has-[:disabled]:pointer-events-none has-[:disabled]:opacity-40",
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        aria-checked={indeterminate ? "mixed" : undefined}
        ref={(node) => {
          if (node) node.indeterminate = !!indeterminate;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        {...props}
      />
      <span
        aria-hidden="true"
        className={cx(
          `flex size-4 shrink-0 items-center justify-center rounded-[5px] text-transparent
          shadow-[inset_0_0_0_1.5px_var(--line-strong)] transition-colors duration-200
          peer-checked:bg-ink peer-checked:text-canvas peer-checked:shadow-none
          peer-focus-visible:outline-2 peer-focus-visible:outline-accent peer-focus-visible:outline-offset-2`,
          indeterminate && "bg-ink text-canvas shadow-none",
        )}
      >
        {indeterminate ? (
          <span className="h-[1.5px] w-2 rounded-full bg-current" />
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </span>
      {label && (
        <span className="text-[13px] text-ink-2 transition-colors duration-200 peer-checked:text-ink">
          {label}
        </span>
      )}
    </label>
  );
}
