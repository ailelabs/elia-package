"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "./dialog";
import { Kbd } from "./kbd";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * COMMAND — the ⌘K palette. A bare Dialog around Combobox's
 * list grammar: subsequence matching (so "tsk" finds "New
 * task"), grouped rows, per-item shortcut hints, and the
 * gliding highlight the other lists use.
 *
 * `useCommandShortcut` is separate on purpose — plenty of
 * apps already own their ⌘K binding and just want the panel.
 * ───────────────────────────────────────────────────────── */

export interface CommandItem {
  id: string;
  label: string;
  /** Secondary line, also searched. */
  hint?: string;
  group?: string;
  icon?: React.ReactNode;
  /** Extra words to match on that aren't shown. */
  keywords?: string[];
  shortcut?: string[];
  disabled?: boolean;
  onSelect?: () => void;
}

export interface CommandProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
  emptyText?: string;
  /** Take over filtering; items arrive pre-filtered. */
  onSearch?: (query: string) => void;
  footer?: React.ReactNode;
  width?: number;
}

/* subsequence match: every needle char appears in order.
   ponytail: no fuzzy ranking — ties keep source order, which is
   the author's priority. Swap in a scorer if lists get long. */
function matches(item: CommandItem, needle: string) {
  if (!needle) return true;
  const hay = [item.label, item.hint, item.group, ...(item.keywords ?? [])].join(" ").toLowerCase();
  let i = 0;
  for (const char of needle.toLowerCase()) {
    if (char === " ") continue;
    i = hay.indexOf(char, i);
    if (i === -1) return false;
    i++;
  }
  return true;
}

export function Command({
  open,
  onClose,
  items,
  placeholder = "Type a command or search…",
  emptyText = "No results",
  onSearch,
  footer,
  width = 520,
}: CommandProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [rowBox, setRowBox] = useState<{ top: number; height: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const rows = useMemo(
    () => (onSearch ? items : items.filter((item) => matches(item, query))),
    [items, query, onSearch],
  );

  /* every open starts clean, and focus belongs in the input */
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useLayoutEffect(() => {
    const target = rowRefs.current[active];
    if (!target) {
      setRowBox(null);
      return;
    }
    setRowBox({ top: target.offsetTop, height: target.offsetHeight });
    target.scrollIntoView({ block: "nearest" });
  }, [active, rows.length, open]);

  const run = (item: CommandItem) => {
    if (item.disabled) return;
    item.onSelect?.();
    onClose();
  };

  const step = (delta: number) => {
    if (!rows.length) return;
    setActive((current) => {
      let next = current;
      for (let i = 0; i < rows.length; i++) {
        next = (next + delta + rows.length) % rows.length;
        if (!rows[next]?.disabled) break;
      }
      return next;
    });
  };

  let lastGroup: string | undefined;

  return (
    /* important: .elia-dialog's centring margin is unlayered and would
       otherwise beat these utilities. Horizontal stays auto, so the
       palette is centred across and rides high down the page. */
    <Dialog open={open} onClose={onClose} bare width={width} className="!mt-[12vh] !mb-auto overflow-hidden">
      <div
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            step(1);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            step(-1);
          } else if (event.key === "Enter") {
            event.preventDefault();
            if (rows[active]) run(rows[active]);
          } else if (event.key === "Home") {
            event.preventDefault();
            setActive(0);
          } else if (event.key === "End") {
            event.preventDefault();
            setActive(rows.length - 1);
          }
        }}
      >
        {/* search row */}
        <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" className="shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded
            aria-controls="elia-command-list"
            aria-activedescendant={rows[active] ? `elia-command-${rows[active].id}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            value={query}
            placeholder={placeholder}
            onChange={(event) => {
              setQuery(event.target.value);
              onSearch?.(event.target.value);
            }}
            className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
          />
          <Kbd>esc</Kbd>
        </div>

        {/* results */}
        <div
          ref={listRef}
          id="elia-command-list"
          role="listbox"
          className="relative max-h-[320px] overflow-y-auto p-1.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-1.5 rounded-[7px] bg-hover"
            style={{
              top: rowBox?.top ?? 0,
              height: rowBox?.height ?? 0,
              opacity: rowBox ? 1 : 0,
              transition:
                "top 200ms cubic-bezier(0.23,1,0.32,1), height 200ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
            }}
          />

          {rows.length === 0 && (
            <p className="px-2 py-8 text-center text-[12.5px] text-ink-3">{emptyText}</p>
          )}

          {rows.map((item, i) => {
            const heading = item.group && item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;

            return (
              <div key={item.id}>
                {heading && (
                  <p className="px-2 pt-2.5 pb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                    {heading}
                  </p>
                )}
                <button
                  type="button"
                  id={`elia-command-${item.id}`}
                  role="option"
                  aria-selected={i === active}
                  aria-disabled={item.disabled}
                  tabIndex={-1}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  onMouseMove={() => !item.disabled && setActive(i)}
                  onClick={() => run(item)}
                  className={cx(
                    "relative z-10 flex w-full items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-left",
                    item.disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  {item.icon && (
                    <span className="flex size-4 shrink-0 items-center justify-center text-ink-2">{item.icon}</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-ink">{item.label}</span>
                    {item.hint && <span className="block truncate text-[11.5px] text-ink-3">{item.hint}</span>}
                  </span>
                  {item.shortcut && (
                    <span className="flex shrink-0 items-center gap-1">
                      {item.shortcut.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {footer && (
          <div className="flex items-center gap-2 border-t border-line px-3.5 py-2 text-[11.5px] text-ink-3">
            {footer}
          </div>
        )}
      </div>
    </Dialog>
  );
}

/* ── the binding, separate so apps that own ⌘K can skip it ── */
export function useCommandShortcut(onOpen: () => void, key = "k") {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === key && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpen();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpen, key]);
}
