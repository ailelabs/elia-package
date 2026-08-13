"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * SELECT — sunken trigger (fine-tune-card's type dropdown)
 * opening a raised listbox with the prompt-bar's gliding
 * highlight: one absolute bg-hover span floats between rows.
 * Focus stays on the trigger; ↑↓ Enter Esc, Tab and
 * click-outside close. aria-activedescendant tracks rows.
 * ───────────────────────────────────────────────────────── */

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<React.ComponentProps<"button">, "onChange" | "value"> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "h-7 text-[12.5px]",
  md: "h-8 text-[13px]",
  lg: "h-9 text-[13px]",
} as const;

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select…",
  size = "md",
  className,
  ...props
}: SelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [rowBox, setRowBox] = useState<{ top: number; height: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  const show = () => {
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setEngaged(false);
    setOpen(true);
  };

  const pick = (option: SelectOption) => {
    onChange(option.value);
    setOpen(false);
  };

  /* single gliding highlight — floats to the active row */
  useLayoutEffect(() => {
    if (!open) return;
    const target = rowRefs.current[active];
    if (target) setRowBox({ top: target.offsetTop, height: target.offsetHeight });
  }, [open, active]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className={cx("relative", className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? `${id}-listbox` : undefined}
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(event) => {
          if (!open) {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              show();
            }
            return;
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setEngaged(true);
            setActive((current) => (current + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length);
          } else if (event.key === "Enter") {
            event.preventDefault();
            if (options[active]) pick(options[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          } else if (event.key === "Tab") {
            setOpen(false);
          }
        }}
        className={cx(
          "flex w-full items-center justify-between gap-2 rounded-control bg-inset pr-2 pl-2.5",
          "shadow-hairline transition-shadow duration-200",
          "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
          "disabled:pointer-events-none disabled:opacity-40",
          SIZES[size],
        )}
        style={{ boxShadow: open ? "0 0 0 1px var(--accent)" : undefined }}
        {...props}
      >
        <span className={cx("truncate", selected ? "text-ink" : "text-ink-3")}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          onMouseLeave={() => setEngaged(false)}
          className="absolute inset-x-0 top-full z-10 mt-1.5 rounded-[10px] bg-surface p-1 shadow-raised"
          style={{ animation: "pop-in 180ms cubic-bezier(0.23,1,0.32,1) both", transformOrigin: "top center" }}
        >
          {/* single gliding highlight — appears once a row is aimed at */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-1 rounded-[6px] bg-hover"
            style={{
              top: rowBox?.top ?? 0,
              height: rowBox?.height ?? 0,
              opacity: rowBox && engaged ? 1 : 0,
              transition:
                "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
            }}
          />
          {options.map((option, i) => (
            <button
              key={option.value}
              type="button"
              id={`${id}-option-${i}`}
              role="option"
              aria-selected={option.value === value}
              tabIndex={-1}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => {
                setActive(i);
                setEngaged(true);
              }}
              onClick={() => pick(option)}
              className="relative z-10 flex h-7.5 w-full items-center gap-2 rounded-[6px] px-2 text-left"
            >
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink">{option.label}</span>
              <span className={cx("shrink-0 text-ink", option.value !== value && "invisible")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
