"use client";

import { useId, useState } from "react";
import { Calendar, startOfDay, type DateRange } from "./calendar";
import { DateField, fromIsoDate, toIsoDate } from "./date-field";
import { TimePicker, formatTime, parseTime } from "./time-picker";
import { Popover } from "./popover";
import { cx } from "./cx";
import { Button } from "./button";

/* ─────────────────────────────────────────────────────────
 * DATE PICKER — Select's sunken trigger opening a raised
 * popover around a Calendar. Single or range, optional time
 * column, min/max, Today / Clear footer. Esc and click
 * outside close; a single-date pick closes on select unless
 * time is in play, where you need the second half first.
 * ───────────────────────────────────────────────────────── */

interface DatePickerBase {
  min?: Date;
  max?: Date;
  disabledDate?: (date: Date) => boolean;
  weekStart?: 0 | 1;
  locale?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  /** Overrides the text shown in the trigger. */
  format?: (value: Date) => string;
}

interface DatePickerSingle {
  mode?: "single";
  value: Date | null;
  onChange: (value: Date | null) => void;
  /** Adds hour/minute columns; the time rides on the same Date. */
  enableTime?: boolean;
  hour12?: boolean;
  minuteStep?: number;
  /**
   * Types the date directly in the trigger via DateField segments,
   * with the calendar still one click away. Single mode only —
   * two typed endpoints want two fields, not one trigger.
   */
  editable?: boolean;
}

interface DatePickerRange {
  mode: "range";
  value: DateRange;
  onChange: (value: DateRange) => void;
}

export type DatePickerProps = DatePickerBase & (DatePickerSingle | DatePickerRange);

const SIZES = {
  sm: "h-7 text-[12.5px]",
  md: "h-8 text-[13px]",
  lg: "h-9 text-[13px]",
} as const;

export function DatePicker(props: DatePickerProps) {
  const {
    min,
    max,
    disabledDate,
    weekStart,
    locale,
    placeholder = "Pick a date",
    size = "md",
    disabled,
    clearable = true,
    className,
    format,
  } = props;

  const id = useId();
  const [open, setOpen] = useState(false);
  const enableTime = props.mode === "range" ? false : !!props.enableTime;

  const show = (date: Date) =>
    format
      ? format(date)
      : new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          ...(enableTime ? { timeStyle: "short" as const } : {}),
        }).format(date);

  const label =
    props.mode === "range"
      ? props.value.from
        ? `${show(props.value.from)} – ${props.value.to ? show(props.value.to) : "…"}`
        : null
      : props.value
        ? show(props.value)
        : null;

  const clear = () => (props.mode === "range" ? props.onChange({ from: null, to: null }) : props.onChange(null));

  const time = props.mode !== "range" && props.value ? formatTime(props.value.getHours(), props.value.getMinutes(), 0) : "09:00";

  /* editable trigger: typed segments plus a calendar button. The
     picker owns the chrome so DateField renders bare inside it. */
  const typedTrigger = props.mode !== "range" && props.editable && (
    <div
      className={cx(
        "flex w-full items-center gap-2 rounded-control bg-inset pr-1 pl-2.5",
        "shadow-hairline transition-shadow duration-200",
        disabled && "pointer-events-none opacity-40",
        SIZES[size],
      )}
      style={{ boxShadow: open ? "0 0 0 1px var(--accent)" : undefined }}
    >
      <DateField
        bare
        locale={locale}
        min={min ? toIsoDate(min) : undefined}
        max={max ? toIsoDate(max) : undefined}
        disabled={disabled}
        value={props.value ? toIsoDate(props.value) : ""}
        onChange={(iso) => {
          const next = fromIsoDate(iso);
          /* keep the time the user already chose */
          if (next && enableTime) {
            const { h, m } = parseTime(time);
            next.setHours(h, m, 0, 0);
          }
          props.onChange(next);
        }}
        className="flex-1"
      />

      {clearable && props.value && (
        <button
          type="button"
          aria-label="Clear date"
          onClick={clear}
          className="flex size-5 shrink-0 items-center justify-center rounded-[5px] text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      <button
        type="button"
        aria-label="Open calendar"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex size-6 shrink-0 items-center justify-center rounded-[6px] text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="16" rx="2.5" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </button>
    </div>
  );

  const trigger = (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? `${id}-popover` : undefined}
      disabled={disabled}
      onClick={() => setOpen(!open)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
        if (!open && (event.key === "ArrowDown" || event.key === "Enter")) setOpen(true);
      }}
      className={cx(
        "flex w-full items-center gap-2 rounded-control bg-inset pr-2 pl-2.5",
        "shadow-hairline transition-shadow duration-200",
        "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
        "disabled:pointer-events-none disabled:opacity-40",
        SIZES[size],
      )}
      style={{ boxShadow: open ? "0 0 0 1px var(--accent)" : undefined }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
      <span className={cx("min-w-0 flex-1 truncate text-left", label ? "text-ink" : "text-ink-3")}>
        {label ?? placeholder}
      </span>
      {clearable && label && (
        <span
          role="button"
          tabIndex={-1}
          aria-label="Clear date"
          onClick={(event) => {
            event.stopPropagation();
            clear();
          }}
          className="shrink-0 rounded-[4px] p-0.5 text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </span>
      )}
    </button>
  );

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      className={className}
      anchor={typedTrigger || trigger}
      panelClassName="rounded-card bg-surface p-2.5 shadow-overlay"
      panelProps={{ id: `${id}-popover`, role: "dialog", "aria-label": "Choose a date" }}
    >
      {props.mode === "range" ? (
        <Calendar
          mode="range"
          value={props.value}
          onChange={(next) => {
            props.onChange(next);
            if (next.from && next.to) setOpen(false);
          }}
          min={min}
          max={max}
          disabledDate={disabledDate}
          weekStart={weekStart}
          locale={locale}
        />
      ) : (
        <Calendar
          value={props.value}
          onChange={(next) => {
            /* a date pick keeps whatever time is already chosen */
            if (next && enableTime) {
              const { h, m } = parseTime(time);
              next.setHours(h, m, 0, 0);
            }
            props.onChange(next);
            if (!enableTime) setOpen(false);
          }}
          min={min}
          max={max}
          disabledDate={disabledDate}
          weekStart={weekStart}
          locale={locale}
        />
      )}

      {enableTime && props.mode !== "range" && (
        <div className="mt-2.5 border-t border-line pt-2.5">
          <TimePicker
            value={time}
            hour12={props.hour12}
            minuteStep={props.minuteStep ?? 5}
            onChange={(next) => {
              const { h, m } = parseTime(next);
              const base = props.value ? new Date(props.value) : startOfDay(new Date());
              base.setHours(h, m, 0, 0);
              props.onChange(base);
            }}
          />
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2.5">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const now = new Date();
            if (props.mode === "range") props.onChange({ from: startOfDay(now), to: null });
            else props.onChange(enableTime ? now : startOfDay(now));
          }}
        >
          Today
        </Button>
        <div className="flex items-center gap-1.5">
          {clearable && (
            <Button size="sm" variant="ghost" onClick={clear}>
              Clear
            </Button>
          )}
          <Button size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </div>
    </Popover>
  );
}
