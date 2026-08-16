"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Popover } from "./popover";
import { cx } from "./cx";
import {
  COUNTRIES,
  countryByIso,
  countryFlag,
  countryFromE164,
  groupDigits,
  type Country,
} from "./countries";

/* ─────────────────────────────────────────────────────────
 * PHONE INPUT — a country selector welded to a national
 * number field. The country list is searchable by name, ISO
 * code or dial code, and scrolls; `include`/`exclude`/`only`
 * let an app narrow it without forking the dataset.
 *
 * The value is always E.164 ("+6281234567890"): one canonical
 * string in, one out. What the user sees is the national part
 * grouped for legibility — formatting is a view concern and
 * never reaches the caller.
 *
 * Deliberately no validation beyond digits and length bounds.
 * Numbering plans change constantly, and a field that rejects
 * someone's real number is a worse bug than one that accepts
 * a typo. Validate server-side where you can afford the data.
 * ───────────────────────────────────────────────────────── */

export interface PhoneInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "size" | "type"> {
  /** E.164, e.g. "+14155552671". */
  value: string;
  onChange: (value: string, meta: { country?: Country; national: string }) => void;
  /** Selected when the value has no country yet. */
  defaultCountry?: string;
  /** ISO codes to offer, in this order. Overrides exclude. */
  only?: string[];
  /** ISO codes to drop from the full list. */
  exclude?: string[];
  /** ISO codes pinned above the divider. */
  preferred?: string[];
  size?: "sm" | "md" | "lg";
  /** Hides the dial code chip when the country is fixed. */
  searchable?: boolean;
  className?: string;
}

const SIZES = {
  sm: "h-7 text-[12.5px]",
  md: "h-8 text-[13px]",
  lg: "h-9 text-[13px]",
} as const;

export function PhoneInput({
  value,
  onChange,
  defaultCountry = "US",
  only,
  exclude,
  preferred,
  size = "md",
  searchable = true,
  className,
  disabled,
  placeholder,
  ...props
}: PhoneInputProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [rowBox, setRowBox] = useState<{ top: number; height: number } | null>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* the offered list — `only` is an allow-list and wins outright */
  const list = useMemo(() => {
    if (only?.length) {
      return only.map((iso) => countryByIso(iso)).filter((c): c is Country => !!c);
    }
    const dropped = new Set((exclude ?? []).map((iso) => iso.toUpperCase()));
    const rest = COUNTRIES.filter((country) => !dropped.has(country.iso));
    if (!preferred?.length) return rest;

    const top = preferred
      .map((iso) => countryByIso(iso))
      .filter((c): c is Country => !!c && !dropped.has(c.iso));
    const topIso = new Set(top.map((c) => c.iso));
    return [...top, ...rest.filter((country) => !topIso.has(country.iso))];
  }, [only, exclude, preferred]);

  const dividerAfter = only?.length ? -1 : (preferred?.length ?? 0) - 1;

  /* country comes from the value when it has one, so a value set
     from outside re-selects the right flag without extra state */
  const detected = value ? countryFromE164(value) : undefined;
  const [manual, setManual] = useState<Country | undefined>();
  const country =
    detected ?? manual ?? list.find((c) => c.iso === defaultCountry.toUpperCase()) ?? list[0];

  const national = country && value ? value.replace(/\D/g, "").slice(country.dial.length) : "";

  const emit = (nextCountry: Country | undefined, digits: string) => {
    const clean = digits.replace(/\D/g, "");
    onChange(nextCountry ? `+${nextCountry.dial}${clean}` : `+${clean}`, {
      country: nextCountry,
      national: clean,
    });
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    const bare = needle.replace(/^\+/, "");
    return list.filter(
      (country) =>
        country.name.toLowerCase().includes(needle) ||
        country.iso.toLowerCase() === needle ||
        country.dial.startsWith(bare),
    );
  }, [list, query]);

  useLayoutEffect(() => {
    if (!open) return;
    const target = rowRefs.current[active];
    if (!target) return;
    setRowBox({ top: target.offsetTop, height: target.offsetHeight });
    target.scrollIntoView({ block: "nearest" });
  }, [open, active, filtered.length]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(Math.max(0, filtered.findIndex((c) => c.iso === country?.iso)));
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const pick = (next: Country) => {
    setManual(next);
    setOpen(false);
    emit(next, national);
    numberRef.current?.focus();
  };

  const trigger = (
    <div
      className={cx(
        "flex w-full items-center rounded-control bg-field shadow-hairline",
        "transition-shadow duration-150 focus-within:shadow-[0_0_0_1px_var(--accent)]",
        disabled && "pointer-events-none opacity-40",
        SIZES[size],
        className,
      )}
    >
      <button
        type="button"
        aria-label={`Country: ${country?.name ?? "none"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled || !searchable}
        onClick={() => setOpen(!open)}
        className={cx(
          "flex h-full shrink-0 items-center gap-1 rounded-l-control pr-1.5 pl-2 transition-colors duration-150",
          searchable && "hover:bg-hover",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
        )}
      >
        <span className="text-[15px] leading-none">{country ? countryFlag(country.iso) : "🌐"}</span>
        <span className="font-mono text-[12px] tabular-nums text-ink-2">+{country?.dial}</span>
        {searchable && (
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
            className="transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </button>

      <span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-line" />

      <input
        ref={numberRef}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        disabled={disabled}
        value={groupDigits(national, country?.pattern)}
        placeholder={placeholder ?? (country?.pattern ? groupDigits("0".repeat(country.pattern.reduce((a, b) => a + b, 0)), country.pattern) : "Phone number")}
        onChange={(event) => emit(country, event.target.value)}
        onKeyDown={(event) => {
          /* backspace over a space should eat the digit before it,
             not strand the cursor on formatting the user never typed */
          if (event.key === "Backspace" && !national) return;
        }}
        className="h-full min-w-0 flex-1 bg-transparent pr-2.5 text-ink outline-none placeholder:text-ink-3"
        {...props}
      />
    </div>
  );

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      match
      anchor={trigger}
      panelClassName="rounded-[10px] bg-surface p-1 shadow-raised"
      panelProps={{
        id: `${id}-listbox`,
        role: "listbox",
        style: { maxHeight: 280, overflowY: "auto" },
      }}
    >
      <div className="sticky top-0 z-20 -mx-1 -mt-1 mb-1 bg-surface px-1 pt-1 pb-1">
        <input
          ref={searchRef}
          value={query}
          placeholder="Search country or code…"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setActive((current) =>
                filtered.length
                  ? (current + (event.key === "ArrowDown" ? 1 : filtered.length - 1)) % filtered.length
                  : 0,
              );
            } else if (event.key === "Enter") {
              event.preventDefault();
              if (filtered[active]) pick(filtered[active]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className="h-7 w-full rounded-[6px] bg-inset px-2 text-[12.5px] text-ink shadow-hairline outline-none placeholder:text-ink-3 focus:shadow-[0_0_0_1px_var(--accent)]"
        />
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-1 rounded-[6px] bg-hover"
        style={{
          top: rowBox?.top ?? 0,
          height: rowBox?.height ?? 0,
          opacity: rowBox && filtered.length ? 1 : 0,
          transition: "top 200ms var(--ease-out-strong), height 200ms var(--ease-out-strong), opacity 150ms ease",
        }}
      />

      {filtered.length === 0 && (
        <p className="px-2 py-3 text-center text-[12.5px] text-ink-3">No country found</p>
      )}

      {filtered.map((entry, i) => (
        <div key={entry.iso}>
          <button
            type="button"
            role="option"
            aria-selected={entry.iso === country?.iso}
            tabIndex={-1}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActive(i)}
            onClick={() => pick(entry)}
            className="relative z-10 flex h-7.5 w-full items-center gap-2 rounded-[6px] px-2 text-left"
          >
            <span className="shrink-0 text-[14px] leading-none">{countryFlag(entry.iso)}</span>
            <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{entry.name}</span>
            <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-ink-3">+{entry.dial}</span>
          </button>
          {!query && i === dividerAfter && <div className="my-1 h-px bg-line" />}
        </div>
      ))}
    </Popover>
  );
}
