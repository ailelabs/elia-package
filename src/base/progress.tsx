import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * PROGRESS — hairline determinate bar. Fill width animates
 * 300ms on the strong ease; tone maps to the status colors.
 * ───────────────────────────────────────────────────────── */

const TONES = {
  accent: "bg-accent",
  green: "bg-green",
  orange: "bg-orange",
  red: "bg-red",
} as const;

export function Progress({
  value,
  max = 100,
  tone = "accent",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
  tone?: keyof typeof TONES;
}) {
  const clamped = Math.min(Math.max(value, 0), max);
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cx("h-1 w-full overflow-hidden rounded-full bg-line", className)}
      {...props}
    >
      <div
        className={cx("h-full rounded-full transition-[width] duration-300", TONES[tone])}
        style={{ width: `${(clamped / max) * 100}%`, transitionTimingFunction: "var(--ease-out-strong)" }}
      />
    </div>
  );
}
