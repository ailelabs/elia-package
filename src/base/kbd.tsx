import type { ComponentProps } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * KBD
 * Keycap chip for shortcut hints — sidebar-nav's "/" key.
 * Casing is the caller's: caps center exactly on the mono
 * face, lowercase rides ~1px low. Side padding is sized so
 * a fallback ⌘ still fits the square.
 * ───────────────────────────────────────────────────────── */

const SIZES = {
  sm: "h-4 min-w-4 rounded-[4px] px-[2.5px] text-[9.5px]",
  md: "h-4.5 min-w-4.5 rounded-[5px] px-[3px] text-[10.5px]",
  lg: "h-5 min-w-5 rounded-[6px] px-[3.5px] text-[11.5px]",
} as const;

export type KbdProps = ComponentProps<"kbd"> & {
  size?: keyof typeof SIZES;
};

export function Kbd({ size = "md", className, ...rest }: KbdProps) {
  return (
    <kbd
      className={cx(
        "inline-flex items-center justify-center bg-surface font-mono text-ink-3 shadow-hairline",
        SIZES[size],
        className,
      )}
      {...rest}
    />
  );
}
