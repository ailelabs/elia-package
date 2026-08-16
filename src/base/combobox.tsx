"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Popover } from "./popover";
import { Spinner } from "./spinner";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * COMBOBOX — Select with a text input in the trigger. Typing
 * filters; the gliding highlight and row grammar are Select's,
 * so the two read as one control at rest.
 *
 * Filtering is local by default. Pass `onSearch` and the list
 * is treated as already-filtered, which is what you want for
 * a server query — the component never re-filters what the
 * server sent back.
 * ───────────────────────────────────────────────────────── */

export interface ComboboxOption {
  value: string;
  label: string;
  /** Second line under the label. */
  hint?: string;
  disabled?: boolean;
  /** Rows sharing a group render under one sticky-free heading. */
  group?: string;
}

export interface ComboboxProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "size"> {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  /** Take over filtering (server-side search); options arrive pre-filtered. */
  onSearch?: (query: string) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  emptyText?: string;
  /** Offers a "Create «query»" row when nothing matches exactly. */
  creatable?: boolean;
  onCreate?: (label: string) => void;
  clearable?: boolean;
  className?: string;
}

const SIZES = {
  sm: "h-7 text-[12.5px]",
  md: "h-8 text-[13px]",
  lg: "h-9 text-[13px]",
} as const;

const CREATE = "__create__";

export function Combobox({
  options,
  value,
  onChange,
  onSearch,
  placeholder = "Search…",
  size = "md",
  loading,
  emptyText = "No results",
  creatable,
  onCreate,
  clearable = true,
  className,
  disabled,
  ...props
}: ComboboxProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [rowBox, setRowBox] = useState<{ top: number; height: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    if (onSearch || !query) return options;
    const needle = query.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) || option.hint?.toLowerCase().includes(needle),
    );
  }, [options, query, onSearch]);

  const exact = filtered.some((option) => option.label.toLowerCase() === query.trim().toLowerCase());
  const showCreate = !!creatable && query.trim().length > 0 && !exact;
  /* the create row is a real row so arrow keys reach it */
  const rows: ComboboxOption[] = showCreate
    ? [...filtered, { value: CREATE, label: query.trim() }]
    : filtered;

  const selectable = rows.filter((row) => !row.disabled);

  /* the input shows the query while open, the selection while closed */
  const shown = open ? query : (selected?.label ?? "");

  const commit = (row: ComboboxOption) => {
    if (row.disabled) return;
    if (row.value === CREATE) onCreate?.(row.label);
    else onChange(row.value);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const step = (delta: number) => {
    if (!selectable.length) return;
    setEngaged(true);
    setActive((current) => {
      let next = current;
      for (let i = 0; i < rows.length; i++) {
        next = (next + delta + rows.length) % rows.length;
        if (!rows[next]?.disabled) break;
      }
      return next;
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    const target = rowRefs.current[active];
    if (!target) return;
    setRowBox({ top: target.offsetTop, height: target.offsetHeight });
    target.scrollIntoView({ block: "nearest" });
  }, [open, active, rows.length]);

  /* a changed query invalidates the old cursor position */
  useEffect(() => {
    setActive(0);
  }, [query]);

  const trigger = (
    <div
      className={cx(
        "flex w-full items-center gap-2 rounded-control bg-inset pr-1.5 pl-2.5",
        "shadow-hairline transition-shadow duration-200",
        disabled && "pointer-events-none opacity-40",
        SIZES[size],
      )}
      style={{ boxShadow: open ? "0 0 0 1px var(--accent)" : undefined }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" className="shrink-0">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>

      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? `${id}-listbox` : undefined}
        aria-activedescendant={open && rows[active] ? `${id}-option-${active}` : undefined}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        value={shown}
        placeholder={selected ? selected.label : placeholder}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setEngaged(true);
          setOpen(true);
          onSearch?.(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) setOpen(true);
            else step(event.key === "ArrowDown" ? 1 : -1);
          } else if (event.key === "Enter") {
            if (open && rows[active]) {
              event.preventDefault();
              commit(rows[active]);
            }
          } else if (event.key === "Escape") {
            setOpen(false);
            setQuery("");
          } else if (event.key === "Tab") {
            setOpen(false);
          } else if (event.key === "Backspace" && !query && selected) {
            onChange("");
          }
        }}
        className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3"
        {...props}
      />

      {loading && <Spinner className="shrink-0" />}

      {clearable && !loading && (selected || query) && (
        <button
          type="button"
          aria-label="Clear"
          onClick={() => {
            onChange("");
            setQuery("");
            onSearch?.("");
            inputRef.current?.focus();
          }}
          className="flex size-5 shrink-0 items-center justify-center rounded-[5px] text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );

  let lastGroup: string | undefined;

  return (
    <Popover
      open={open}
      onClose={() => {
        setOpen(false);
        setQuery("");
      }}
      match
      className={className}
      anchor={trigger}
      panelClassName="rounded-[10px] bg-surface p-1 shadow-raised"
      panelProps={{
        id: `${id}-listbox`,
        role: "listbox",
        onMouseLeave: () => setEngaged(false),
        style: { maxHeight: 260, overflowY: "auto" },
      }}
    >
      {/* gliding highlight — the same span Select and Menu use */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-1 rounded-[6px] bg-hover"
        style={{
          top: rowBox?.top ?? 0,
          height: rowBox?.height ?? 0,
          opacity: rowBox && engaged && rows.length ? 1 : 0,
          transition:
            "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
        }}
      />

      {rows.length === 0 && (
        <p className="px-2 py-3 text-center text-[12.5px] text-ink-3">{loading ? "Searching…" : emptyText}</p>
      )}

      {rows.map((option, i) => {
        const heading = option.group && option.group !== lastGroup ? option.group : null;
        lastGroup = option.group;
        const isCreate = option.value === CREATE;

        return (
          <div key={option.value === CREATE ? CREATE : option.value}>
            {heading && (
              <p className="px-2 pt-2 pb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                {heading}
              </p>
            )}
            <button
              type="button"
              id={`${id}-option-${i}`}
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled}
              tabIndex={-1}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => {
                if (option.disabled) return;
                setActive(i);
                setEngaged(true);
              }}
              onClick={() => commit(option)}
              className={cx(
                "relative z-10 flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left",
                option.disabled && "cursor-not-allowed opacity-40",
              )}
            >
              {isCreate && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" className="shrink-0">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium text-ink">
                  {isCreate ? `Create “${option.label}”` : option.label}
                </span>
                {option.hint && <span className="block truncate text-[11.5px] text-ink-3">{option.hint}</span>}
              </span>
              <span className={cx("shrink-0 text-ink", option.value !== value && "invisible")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
            </button>
          </div>
        );
      })}
    </Popover>
  );
}
