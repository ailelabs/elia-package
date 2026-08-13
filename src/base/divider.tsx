import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * DIVIDER
 * A hairline rule; with `label`, line · mono caption · line.
 * ───────────────────────────────────────────────────────── */

export type DividerProps = React.ComponentProps<"div"> & {
  label?: string;
};

export function Divider({ label, className, ...rest }: DividerProps) {
  if (!label) {
    return <div role="separator" className={cx("h-px bg-line", className)} {...rest} />;
  }
  return (
    <div role="separator" className={cx("flex items-center gap-3", className)} {...rest}>
      <span aria-hidden className="h-px flex-1 bg-line" />
      <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
        {label}
      </span>
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>
  );
}
