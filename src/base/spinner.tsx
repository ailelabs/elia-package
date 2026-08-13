import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * SPINNER — the system ring. A hairline circle with an
 * ink-2 lead edge, spinning 700ms linear.
 * ───────────────────────────────────────────────────────── */

export function Spinner({
  size = 16,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { size?: number }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cx(
        "inline-block shrink-0 rounded-full border-[1.5px] border-line-strong border-t-ink-2",
        className,
      )}
      style={{
        width: size,
        height: size,
        animation: "spin 700ms linear infinite",
        ...style,
      }}
      {...props}
    />
  );
}
