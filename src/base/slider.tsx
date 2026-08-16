"use client";

import { useId } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * SLIDER — a native <input type="range"> so keyboard, touch
 * and a11y come from the platform. All paint lives in
 * `.elia-range` (styles/elia.css); the filled portion is fed
 * through the `--fill` custom property, so no JS runs on drag.
 * ───────────────────────────────────────────────────────── */

export interface SliderProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "type" | "size"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Ticks under the track. Numbers render as their own label. */
  marks?: (number | { value: number; label: string })[];
  /** Shows the current value at the end of the label row. */
  showValue?: boolean;
  formatValue?: (value: number) => string;
  label?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  marks,
  showValue,
  formatValue = String,
  label,
  className,
  disabled,
  ...props
}: SliderProps) {
  const id = useId();
  const span = max - min || 1;
  const pct = (n: number) => ((Math.min(Math.max(n, min), max) - min) / span) * 100;

  return (
    <div className={cx("w-full", disabled && "opacity-40", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label && (
            <label htmlFor={id} className="text-[12px] font-medium text-ink-2">
              {label}
            </label>
          )}
          {showValue && (
            <span className="font-mono text-[11px] tabular-nums text-ink-3">{formatValue(value)}</span>
          )}
        </div>
      )}

      <input
        id={id}
        type="range"
        className="elia-range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={label ? undefined : props["aria-label"]}
        aria-valuetext={formatValue(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--fill": `${pct(value)}%` } as React.CSSProperties}
        {...props}
      />

      {marks && marks.length > 0 && (
        <div className="relative mt-1 h-4">
          {marks.map((mark) => {
            const point = typeof mark === "number" ? { value: mark, label: String(mark) } : mark;
            return (
              <span
                key={point.value}
                className="absolute -translate-x-1/2 font-mono text-[10.5px] tabular-nums text-ink-3"
                style={{ left: `${pct(point.value)}%` }}
              >
                {point.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
