"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * MENU — dropdown action list. Button-agnostic trigger span,
 * pop-in panel, and the prompt-bar gliding highlight: one
 * absolute bg-hover span floats to the active row instead of
 * each row toggling its own background. ↑↓ Enter Esc, Tab and
 * click-outside close.
 * ───────────────────────────────────────────────────────── */

export type MenuItem = {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  onSelect?: () => void;
};

export type MenuProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
};

export function Menu({ trigger, items, align = "start", className, ...rest }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [rowBox, setRowBox] = useState<{ top: number; height: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelId = useId();

  useEffect(() => {
    setActive(0);
    setEngaged(false);
  }, [open]);

  /* single gliding highlight — appears once a row is hovered or keyed */
  useLayoutEffect(() => {
    const target = rowRefs.current[active];
    if (target) setRowBox({ top: target.offsetTop, height: target.offsetHeight });
  }, [open, active, items.length]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const select = (item: MenuItem) => {
    item.onSelect?.();
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setEngaged(true);
      setActive((current) => (current + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (items[active]) select(items[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} onKeyDown={onKeyDown} className={cx("relative inline-flex", className)} {...rest}>
      <span
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-activedescendant={open ? `${panelId}-item-${active}` : undefined}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex cursor-pointer rounded-[8px] select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {trigger}
      </span>

      {open && (
        <div
          id={panelId}
          role="menu"
          onMouseLeave={() => setEngaged(false)}
          className={cx(
            "absolute top-full z-20 mt-1.5 min-w-44 rounded-[10px] bg-surface p-1 shadow-raised",
            align === "end" ? "right-0" : "left-0",
          )}
          style={{
            animation: "pop-in 180ms cubic-bezier(0.23,1,0.32,1) both",
            transformOrigin: align === "end" ? "top right" : "top left",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-1 rounded-[6px] bg-hover"
            style={{
              top: rowBox?.top ?? 0,
              height: rowBox?.height ?? 0,
              opacity: rowBox && engaged ? 1 : 0,
              transition:
                "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
            }}
          />
          {items.map((item, i) => (
            <button
              key={item.key}
              type="button"
              id={`${panelId}-item-${i}`}
              role="menuitem"
              tabIndex={-1}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => {
                setActive(i);
                setEngaged(true);
              }}
              onClick={() => select(item)}
              className={cx(
                "relative z-10 flex h-7.5 w-full items-center gap-2 rounded-[6px] px-2 text-left text-[12.5px] font-medium whitespace-nowrap",
                item.danger ? "text-red" : "text-ink",
              )}
            >
              {item.icon && (
                <span className={cx("flex size-4 shrink-0 items-center justify-center", item.danger ? "text-red" : "text-ink-2")}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
