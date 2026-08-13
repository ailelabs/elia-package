import type { ComponentProps } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * KBD
 * Keycap chip for shortcut hints — sidebar-nav's "/" key.
 * ───────────────────────────────────────────────────────── */

export function Kbd({ className, ...rest }: ComponentProps<"kbd">) {
  return (
    <kbd
      className={cx(
        "inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-[5px] bg-surface px-1 font-mono text-[10.5px] text-ink-3 shadow-hairline",
        className,
      )}
      {...rest}
    />
  );
}
