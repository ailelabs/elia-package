"use client";

import { useRef, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * DATE FIELD — typed date entry in three segments. This is
 * the keyboard counterpart to DatePicker: a picker is for
 * "sometime next week", a field is for a birthday you already
 * know. Offer both; they are not competing.
 *
 * Segment order follows the locale (Intl decides whether it's
 * D/M/Y or M/D/Y), so nobody has to guess which box is which.
 * Typing rolls into the next segment automatically, and each
 * segment takes arrow keys.
 *
 * The value is a plain YYYY-MM-DD string — same shape as
 * <input type="date"> — so it round-trips through forms and
 * JSON without a Date object's timezone traps.
 * ───────────────────────────────────────────────────────── */

export interface DateFieldProps {
  /** ISO date, "YYYY-MM-DD", or "" when incomplete. */
  value: string;
  onChange: (value: string) => void;
  locale?: string;
  min?: string;
  max?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  invalid?: boolean;
  /** Drops the field chrome so a host control can supply it. */
  bare?: boolean;
  className?: string;
}

/** Local-time Date → "YYYY-MM-DD" (never toISOString, which shifts UTC). */
export function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** "YYYY-MM-DD" → local midnight Date, or null. */
export function fromIsoDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

type Part = "day" | "month" | "year";

const SIZES = {
  sm: "h-7 text-[12.5px]",
  md: "h-8 text-[13px]",
  lg: "h-9 text-[13px]",
} as const;

const LIMITS: Record<Part, { min: number; max: number; size: number }> = {
  day: { min: 1, max: 31, size: 2 },
  month: { min: 1, max: 12, size: 2 },
  year: { min: 1, max: 9999, size: 4 },
};

/* ask Intl which order this locale writes dates in */
function partOrder(locale?: string): Part[] {
  const parts = new Intl.DateTimeFormat(locale).formatToParts(new Date(2024, 4, 9));
  const order = parts
    .filter((part) => part.type === "day" || part.type === "month" || part.type === "year")
    .map((part) => part.type as Part);
  return order.length === 3 ? order : ["month", "day", "year"];
}

const split = (iso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match
    ? { year: match[1], month: match[2], day: match[3] }
    : { year: "", month: "", day: "" };
};

export function DateField({
  value,
  onChange,
  locale,
  min,
  max,
  size = "md",
  disabled,
  invalid,
  bare,
  className,
}: DateFieldProps) {
  const order = partOrder(locale);
  const [parts, setParts] = useState(() => split(value));
  const refs = useRef<Partial<Record<Part, HTMLInputElement | null>>>({});

  /* an externally-set value overrides local editing state */
  const external = split(value);
  const current =
    external.year && (external.year !== parts.year || external.month !== parts.month || external.day !== parts.day) && value
      ? external
      : parts;

  const push = (next: typeof parts) => {
    setParts(next);
    const { year, month, day } = next;
    if (year.length === 4 && month.length === 2 && day.length === 2) {
      const iso = `${year}-${month}-${day}`;
      /* reject impossible dates (Feb 31) rather than emitting them */
      const probe = new Date(`${iso}T00:00:00`);
      const valid =
        probe.getFullYear() === Number(year) &&
        probe.getMonth() + 1 === Number(month) &&
        probe.getDate() === Number(day) &&
        (!min || iso >= min) &&
        (!max || iso <= max);
      onChange(valid ? iso : "");
    } else {
      onChange("");
    }
  };

  const write = (part: Part, raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(-LIMITS[part].size);
    const next = { ...current, [part]: digits };
    push(next);

    /* roll forward once the segment can't take more */
    const filled = digits.length === LIMITS[part].size;
    const early = part !== "year" && digits.length === 1 && Number(digits) * 10 > LIMITS[part].max;
    if (filled || early) {
      const at = order.indexOf(part);
      if (at < order.length - 1) refs.current[order[at + 1]]?.focus();
    }
  };

  const nudge = (part: Part, delta: number) => {
    const { min: lo, max: hi, size: width } = LIMITS[part];
    const base = Number(current[part] || (part === "year" ? new Date().getFullYear() : lo));
    let next = base + delta;
    if (next > hi) next = lo;
    if (next < lo) next = hi;
    push({ ...current, [part]: String(next).padStart(width, "0") });
  };

  const segment = (part: Part) => (
    <input
      key={part}
      ref={(el) => {
        refs.current[part] = el;
      }}
      type="text"
      inputMode="numeric"
      disabled={disabled}
      aria-label={part}
      placeholder={part === "year" ? "yyyy" : part === "month" ? "mm" : "dd"}
      value={current[part]}
      onFocus={(event) => event.target.select()}
      onChange={(event) => write(part, event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          nudge(part, 1);
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          nudge(part, -1);
        } else if (event.key === "Backspace" && !current[part]) {
          const at = order.indexOf(part);
          if (at > 0) refs.current[order[at - 1]]?.focus();
        }
      }}
      onPaste={(event) => {
        const text = event.clipboardData.getData("text").trim();
        const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
        if (!iso) return;
        event.preventDefault();
        push({ year: iso[1], month: iso[2], day: iso[3] });
      }}
      className={cx(
        "bg-transparent text-center tabular-nums text-ink outline-none placeholder:text-ink-3",
        part === "year" ? "w-[4ch]" : "w-[2.2ch]",
      )}
    />
  );

  const segments = order.map((part, i) => (
    <span key={part} className="flex items-center">
      {segment(part)}
      {i < order.length - 1 && <span className="text-ink-3">/</span>}
    </span>
  ));

  /* bare: DatePicker hosts the segments inside its own trigger,
     so the chrome would otherwise be drawn twice */
  if (bare) {
    return (
      <span className={cx("inline-flex items-center gap-0.5", disabled && "pointer-events-none opacity-40", className)}>
        {segments}
      </span>
    );
  }

  return (
    <div
      onClick={() => !current[order[0]] && refs.current[order[0]]?.focus()}
      className={cx(
        "inline-flex items-center gap-0.5 rounded-control bg-field px-2.5 shadow-hairline",
        "transition-shadow duration-150 focus-within:shadow-[0_0_0_1px_var(--accent)]",
        invalid && "shadow-[0_0_0_1px_var(--red)]",
        disabled && "pointer-events-none opacity-40",
        SIZES[size],
        className,
      )}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mr-1 shrink-0">
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
      {segments}
    </div>
  );
}
