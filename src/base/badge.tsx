import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * BADGE
 * Status pill — tint background, colored text; the
 * task-rows "Completed" grammar. Optional leading dot.
 * ───────────────────────────────────────────────────────── */

const TONES = {
  neutral: "bg-inset text-ink-2 shadow-hairline",
  accent: "bg-accent-tint text-accent-ink",
  green: "bg-green-tint text-green",
  orange: "bg-orange-tint text-orange",
  red: "bg-red-tint text-red",
} as const;

export type BadgeProps = React.ComponentProps<"span"> & {
  tone: keyof typeof TONES;
  dot?: boolean;
};

export function Badge({ tone, dot, className, style, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex h-5.5 items-center gap-1.5 rounded-full px-2 text-[11.5px] font-medium",
        TONES[tone],
        className,
      )}
      style={{ animation: "pop-in 200ms cubic-bezier(0.23,1,0.32,1) both", ...style }}
      {...rest}
    >
      {dot && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}
