import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * TOOLTIP — pure-CSS hover/focus label on the inverted
 * tooltip surface. No JS positioning: the panel is absolute
 * against an inline-flex wrapper, revealed via opacity +
 * a small translate on hover and focus-within.
 * ───────────────────────────────────────────────────────── */

export type TooltipProps = React.HTMLAttributes<HTMLSpanElement> & {
  content: React.ReactNode;
  side?: "top" | "bottom";
};

export function Tooltip({ content, side = "top", children, className, ...rest }: TooltipProps) {
  return (
    <span className={cx("group relative inline-flex", className)} {...rest}>
      {children}
      <span
        role="tooltip"
        className={cx(
          "pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-[8px] px-2 py-1 text-[11.5px] whitespace-nowrap",
          "opacity-0 shadow-overlay transition-[opacity,translate] duration-150",
          "group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100",
          side === "top" ? "bottom-full mb-1.5 translate-y-1" : "top-full mt-1.5 -translate-y-1",
        )}
        style={{
          background: "var(--tooltip-bg)",
          color: "var(--tooltip-fg)",
          border: "1px solid var(--tooltip-border)",
          transitionTimingFunction: "var(--ease-out-strong)",
        }}
      >
        {content}
      </span>
    </span>
  );
}
