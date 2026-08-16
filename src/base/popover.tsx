"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * POPOVER — the anchored-panel mechanics shared by Select,
 * Menu and DatePicker: a relative wrapper, an absolute panel,
 * pointerdown-outside and Escape to close, and the flip that
 * keeps the panel on screen near a viewport edge.
 *
 * Deliberately not a controller: `open` stays with the caller,
 * because each consumer already owns richer state (active row,
 * selected range) and its own trigger aria. This owns geometry
 * and dismissal, nothing else.
 * ───────────────────────────────────────────────────────── */

export interface PopoverProps {
  open: boolean;
  onClose: () => void;
  /** The trigger. Rendered as-is; keep its aria on the element itself. */
  anchor: React.ReactNode;
  children: React.ReactNode;
  side?: "bottom" | "top";
  align?: "start" | "end";
  /** Panel spans the anchor's width (Select-style listboxes). */
  match?: boolean;
  /** Gap between anchor and panel, px. */
  offset?: number;
  className?: string;
  panelClassName?: string;
  panelProps?: React.HTMLAttributes<HTMLDivElement>;
}

const MARGIN = 8;

export function Popover({
  open,
  onClose,
  anchor,
  children,
  side = "bottom",
  align = "start",
  match,
  offset = 6,
  className,
  panelClassName,
  panelProps,
}: PopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState({ side, align });

  /* flip before paint: prefer the requested placement, take the
     opposite only when the panel would run off that edge */
  useLayoutEffect(() => {
    if (!open) return;
    setPlaced({ side, align });
    const panel = panelRef.current;
    const root = rootRef.current;
    if (!panel || !root) return;

    const box = panel.getBoundingClientRect();
    const trigger = root.getBoundingClientRect();
    const next = { side, align };

    if (side === "bottom" && trigger.bottom + box.height + offset > window.innerHeight - MARGIN) {
      if (trigger.top - box.height - offset > MARGIN) next.side = "top";
    } else if (side === "top" && trigger.top - box.height - offset < MARGIN) {
      if (trigger.bottom + box.height + offset < window.innerHeight - MARGIN) next.side = "bottom";
    }

    if (!match) {
      if (align === "start" && trigger.left + box.width > window.innerWidth - MARGIN) next.align = "end";
      else if (align === "end" && trigger.right - box.width < MARGIN) next.align = "start";
    }

    setPlaced(next);
  }, [open, side, align, match, offset]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const top = placed.side === "bottom";

  return (
    <div ref={rootRef} className={cx("relative", className)}>
      {anchor}
      {open && (
        <div
          ref={panelRef}
          {...panelProps}
          className={cx(
            "absolute z-20",
            top ? "top-full" : "bottom-full",
            match ? "inset-x-0" : placed.align === "end" ? "right-0" : "left-0",
            panelClassName,
            panelProps?.className,
          )}
          style={{
            [top ? "marginTop" : "marginBottom"]: offset,
            animation: "pop-in 180ms var(--ease-out-strong) both",
            transformOrigin: `${top ? "top" : "bottom"} ${match ? "center" : placed.align === "end" ? "right" : "left"}`,
            ...panelProps?.style,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
