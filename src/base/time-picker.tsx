"use client";

import { useEffect, useRef } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * TIME PICKER — scrolling hour / minute (/ second) columns
 * plus an AM·PM pair when hour12 is on. The value is always
 * a 24-hour "HH:MM" (or "HH:MM:SS") string, so it drops
 * straight into <input type="time"> and back-ends alike;
 * the 12-hour switch is display only.
 * ───────────────────────────────────────────────────────── */

export interface TimePickerProps {
  /** 24-hour "HH:MM" or "HH:MM:SS". */
  value: string;
  onChange: (value: string) => void;
  hour12?: boolean;
  minuteStep?: number;
  secondStep?: number;
  seconds?: boolean;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function parseTime(value: string) {
  const [h, m, s] = value.split(":").map((part) => Number(part) || 0);
  return { h: Math.min(h ?? 0, 23), m: Math.min(m ?? 0, 59), s: Math.min(s ?? 0, 59) };
}

export function formatTime(h: number, m: number, s: number, seconds?: boolean) {
  return seconds ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}`;
}

function Column({
  label,
  options,
  value,
  onSelect,
  format = pad,
}: {
  label: string;
  options: number[];
  value: number;
  onSelect: (value: number) => void;
  format?: (value: number) => string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  /* keep the selection parked in view without scrolling the page */
  useEffect(() => {
    const list = listRef.current;
    const active = activeRef.current;
    if (list && active) list.scrollTop = active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2;
  }, [value]);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="mb-1 text-center text-[10.5px] font-medium text-ink-3">{label}</span>
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(event) => {
          const i = options.indexOf(value);
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const next = (i + (event.key === "ArrowDown" ? 1 : options.length - 1) + options.length) % options.length;
            onSelect(options[next]);
          }
        }}
        className="h-[132px] overflow-y-auto scroll-smooth rounded-control bg-inset p-1 shadow-hairline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              ref={active ? activeRef : undefined}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onSelect(option)}
              className={cx(
                "flex h-7 w-full items-center justify-center rounded-[6px] font-mono text-[12px] tabular-nums transition-colors duration-150",
                active ? "bg-accent font-semibold text-white" : "text-ink-2 hover:bg-hover hover:text-ink",
              )}
            >
              {format(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimePicker({
  value,
  onChange,
  hour12,
  minuteStep = 1,
  secondStep = 1,
  seconds,
  className,
}: TimePickerProps) {
  const { h, m, s } = parseTime(value);
  const emit = (nh: number, nm: number, ns: number) => onChange(formatTime(nh, nm, ns, seconds));

  const hours = hour12
    ? [12, ...Array.from({ length: 11 }, (_, i) => i + 1)]
    : Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);
  const secondList = Array.from({ length: Math.ceil(60 / secondStep) }, (_, i) => i * secondStep);

  const pm = h >= 12;
  const displayHour = hour12 ? h % 12 || 12 : h;

  /* the picker only ever offers stepped minutes; snap an off-step
     incoming value to the nearest one so a row is always selected */
  const shownMinute = minutes.includes(m) ? m : minutes.reduce((a, b) => (Math.abs(b - m) < Math.abs(a - m) ? b : a), minutes[0]);

  return (
    <div className={cx("flex w-full items-start gap-1.5", className)}>
      <Column
        label="Hour"
        options={hours}
        value={displayHour}
        onSelect={(next) => emit(hour12 ? (next % 12) + (pm ? 12 : 0) : next, m, s)}
      />
      <Column label="Min" options={minutes} value={shownMinute} onSelect={(next) => emit(h, next, s)} />
      {seconds && <Column label="Sec" options={secondList} value={s} onSelect={(next) => emit(h, m, next)} />}

      {hour12 && (
        <div className="flex flex-col">
          <span className="mb-1 h-[14px]" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            {(["AM", "PM"] as const).map((half) => {
              const active = (half === "PM") === pm;
              return (
                <button
                  key={half}
                  type="button"
                  aria-pressed={active}
                  onClick={() => emit((h % 12) + (half === "PM" ? 12 : 0), m, s)}
                  className={cx(
                    "flex h-8 w-10 items-center justify-center rounded-control text-[11.5px] font-medium transition-colors duration-150",
                    "active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                    active ? "bg-ink text-canvas shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]" : "bg-inset text-ink-2 shadow-hairline hover:text-ink",
                  )}
                >
                  {half}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
