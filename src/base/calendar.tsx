"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * CALENDAR — inline month grid. Single or range selection,
 * min/max + per-day predicate, and a three-panel header
 * (days → months → years) reached by clicking the title.
 * The grid is always 6 rows so the box never jumps height.
 * Roving focus: ← → ↑ ↓ day, PageUp/Down month, Home/End
 * week edges, Enter/Space select. Month names come from
 * Intl, so `locale` is the only localisation knob needed.
 * ───────────────────────────────────────────────────────── */

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface CalendarBase {
  min?: Date;
  max?: Date;
  /** Return true to block a day (e.g. weekends, holidays). */
  disabledDate?: (date: Date) => boolean;
  /** 0 = Sunday, 1 = Monday. */
  weekStart?: 0 | 1;
  locale?: string;
  /** Controlled visible month; omit to let the calendar own it. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  className?: string;
}

interface CalendarSingle {
  mode?: "single";
  value: Date | null;
  onChange: (value: Date | null) => void;
}

interface CalendarRange {
  mode: "range";
  value: DateRange;
  onChange: (value: DateRange) => void;
}

export type CalendarProps = CalendarBase & (CalendarSingle | CalendarRange);

/* ── date helpers — plain arithmetic, no dependency ── */
export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addDays = (date: Date, n: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
const addMonths = (date: Date, n: number) => new Date(date.getFullYear(), date.getMonth() + n, 1);
const sameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const sameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const clampDay = (date: Date, min?: Date, max?: Date) => {
  if (min && date < startOfDay(min)) return startOfDay(min);
  if (max && date > startOfDay(max)) return startOfDay(max);
  return date;
};

/* the week containing 2024-01-07 starts on a Sunday — used to name weekdays */
const WEEKDAY_SEED = new Date(2024, 0, 7);

const CHEVRON = "M15 18l-6-6 6-6";

export function Calendar(props: CalendarProps) {
  const { min, max, disabledDate, weekStart = 1, locale, className } = props;
  const mode = props.mode ?? "single";
  const selStart = props.mode === "range" ? props.value.from : props.value;
  const selEnd = props.mode === "range" ? props.value.to : props.value;

  const today = startOfDay(new Date());
  const [ownMonth, setOwnMonth] = useState(() => startOfMonth(selStart ?? today));
  const view = props.month ?? ownMonth;
  const [panel, setPanel] = useState<"days" | "months" | "years">("days");
  const [hover, setHover] = useState<Date | null>(null);
  const [focused, setFocused] = useState<Date>(() => clampDay(selStart ?? today, min, max));
  const [keyboard, setKeyboard] = useState(false);
  const focusRef = useRef<HTMLButtonElement>(null);

  const goto = (next: Date) => {
    setOwnMonth(next);
    props.onMonthChange?.(next);
  };

  /* keep the focused day inside the visible month, and only steal
     DOM focus when the user is actually driving with the keyboard */
  useEffect(() => {
    if (keyboard && panel === "days") focusRef.current?.focus();
  }, [focused, keyboard, panel]);

  const isDisabled = (date: Date) =>
    (!!min && date < startOfDay(min)) || (!!max && date > startOfDay(max)) || !!disabledDate?.(date);

  const moveFocus = (next: Date) => {
    setKeyboard(true);
    setFocused(next);
    if (!sameMonth(next, view)) goto(startOfMonth(next));
  };

  const select = (date: Date) => {
    if (isDisabled(date)) return;
    if (props.mode === "range") {
      const { from, to } = props.value;
      if (!from || to) props.onChange({ from: date, to: null });
      else if (date < from) props.onChange({ from: date, to: from });
      else props.onChange({ from, to: date });
    } else {
      props.onChange(sameDay(props.value, date) ? null : date);
    }
    setFocused(date);
  };

  /* 6 × 7 cells, always — a stable box beats a jumping one */
  const gridStart = (() => {
    const first = startOfMonth(view);
    const lead = (first.getDay() - weekStart + 7) % 7;
    return addDays(first, -lead);
  })();
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(addDays(WEEKDAY_SEED, i + weekStart)),
  );

  /* range shading follows the pointer before the second click lands */
  const previewEnd = mode === "range" && selStart && !selEnd && hover ? hover : selEnd;
  const [spanFrom, spanTo] =
    selStart && previewEnd && previewEnd < selStart ? [previewEnd, selStart] : [selStart, previewEnd];

  const title = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(view);
  const yearPageStart = view.getFullYear() - (((view.getFullYear() % 12) + 12) % 12);

  return (
    <div className={cx("w-[252px] select-none", className)}>
      {/* header */}
      <div className="mb-2 flex items-center gap-1">
        <button
          type="button"
          aria-label={panel === "years" ? "Previous years" : "Previous month"}
          onClick={() => (panel === "years" ? goto(addMonths(view, -144)) : goto(addMonths(view, -1)))}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover-2 hover:text-ink active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d={CHEVRON} />
          </svg>
        </button>

        <button
          type="button"
          aria-expanded={panel !== "days"}
          onClick={() => setPanel(panel === "days" ? "months" : "days")}
          className="flex h-7 flex-1 items-center justify-center gap-1 rounded-control px-2 text-[12.5px] font-semibold text-ink transition-colors duration-150 hover:bg-hover-2 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          {panel === "years" ? `${yearPageStart} – ${yearPageStart + 11}` : title}
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            className="transition-transform duration-200"
            style={{ transform: panel === "days" ? "rotate(0)" : "rotate(180deg)" }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          aria-label={panel === "years" ? "Next years" : "Next month"}
          onClick={() => (panel === "years" ? goto(addMonths(view, 144)) : goto(addMonths(view, 1)))}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover-2 hover:text-ink active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(180deg)" }}>
            <path d={CHEVRON} />
          </svg>
        </button>
      </div>

      {panel === "days" && (
        <div style={{ animation: "fade-in 160ms var(--ease-out-strong) both" }}>
          <div className="mb-1 grid grid-cols-7">
            {weekdays.map((name) => (
              <span key={name} className="flex h-6 items-center justify-center text-[10.5px] font-medium text-ink-3">
                {name.slice(0, 2)}
              </span>
            ))}
          </div>

          <div
            role="grid"
            aria-label={title}
            onMouseLeave={() => setHover(null)}
            onKeyDown={(event) => {
              const jump: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
              if (event.key in jump) {
                event.preventDefault();
                moveFocus(addDays(focused, jump[event.key]));
              } else if (event.key === "PageUp" || event.key === "PageDown") {
                event.preventDefault();
                const step = event.key === "PageUp" ? -1 : 1;
                const next = new Date(focused.getFullYear(), focused.getMonth() + step, focused.getDate());
                moveFocus(next);
              } else if (event.key === "Home" || event.key === "End") {
                event.preventDefault();
                const offset = (focused.getDay() - weekStart + 7) % 7;
                moveFocus(addDays(focused, event.key === "Home" ? -offset : 6 - offset));
              } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                select(focused);
              }
            }}
            className="grid grid-cols-7 gap-y-0.5"
          >
            {days.map((day) => {
              const outside = !sameMonth(day, view);
              const disabled = isDisabled(day);
              const isStart = sameDay(day, spanFrom);
              const isEnd = sameDay(day, spanTo);
              const selected = isStart || isEnd;
              const inSpan = !!spanFrom && !!spanTo && day > spanFrom && day < spanTo;
              const isFocus = sameDay(day, focused);

              return (
                <div
                  key={day.getTime()}
                  role="gridcell"
                  aria-selected={selected}
                  className={cx(
                    "flex h-8 items-center justify-center",
                    /* the tint bar is painted on the cell so the run reads continuous */
                    (inSpan || (mode === "range" && selected && spanFrom && spanTo && !sameDay(spanFrom, spanTo))) &&
                      "bg-accent-tint",
                    isStart && "rounded-l-[8px]",
                    isEnd && "rounded-r-[8px]",
                  )}
                >
                  <button
                    type="button"
                    ref={isFocus ? focusRef : undefined}
                    tabIndex={isFocus ? 0 : -1}
                    disabled={disabled}
                    aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(day)}
                    aria-current={sameDay(day, today) ? "date" : undefined}
                    onFocus={() => setFocused(day)}
                    onBlur={() => setKeyboard(false)}
                    onMouseEnter={() => setHover(day)}
                    onClick={() => select(day)}
                    className={cx(
                      "relative flex h-8 w-8 items-center justify-center rounded-[8px] text-[12.5px] tabular-nums transition-colors duration-150",
                      "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1",
                      "disabled:pointer-events-none disabled:opacity-30",
                      selected
                        ? "bg-accent font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                        : outside
                          ? "text-ink-3/60 hover:bg-hover-2 hover:text-ink-2"
                          : "text-ink hover:bg-hover-2",
                    )}
                  >
                    {day.getDate()}
                    {sameDay(day, today) && !selected && (
                      <span aria-hidden="true" className="absolute bottom-1 h-[3px] w-[3px] rounded-full bg-accent" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {panel === "months" && (
        <div className="grid grid-cols-3 gap-1" style={{ animation: "pop-in 180ms var(--ease-out-strong) both" }}>
          {Array.from({ length: 12 }, (_, m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                goto(new Date(view.getFullYear(), m, 1));
                setPanel("days");
              }}
              className={cx(
                "flex h-9 items-center justify-center rounded-control text-[12.5px] font-medium transition-colors duration-150",
                "hover:bg-hover-2 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                m === view.getMonth() ? "bg-inset text-ink shadow-hairline" : "text-ink-2",
              )}
            >
              {new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(2024, m, 1))}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPanel("years")}
            className="col-span-3 mt-0.5 flex h-8 items-center justify-center rounded-control text-[12px] font-medium text-ink-3 transition-colors duration-150 hover:bg-hover-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            Pick a year
          </button>
        </div>
      )}

      {panel === "years" && (
        <div className="grid grid-cols-3 gap-1" style={{ animation: "pop-in 180ms var(--ease-out-strong) both" }}>
          {Array.from({ length: 12 }, (_, i) => yearPageStart + i).map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => {
                goto(new Date(year, view.getMonth(), 1));
                setPanel("months");
              }}
              className={cx(
                "flex h-9 items-center justify-center rounded-control text-[12.5px] font-medium tabular-nums transition-colors duration-150",
                "hover:bg-hover-2 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                year === view.getFullYear() ? "bg-inset text-ink shadow-hairline" : "text-ink-2",
              )}
            >
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
