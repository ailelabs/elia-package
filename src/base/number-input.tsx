"use client";

import { useRef, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * NUMBER INPUT — steppers, clamping, and locale-aware
 * display, without <input type="number">'s worst habits:
 * no scroll-wheel changing values you were only scrolling
 * past, and no silently-empty value when the text is invalid.
 *
 * The field holds TEXT while focused so half-typed input
 * ("-", "1.", "") survives; it commits and reformats on blur.
 * Clamping also happens on blur — clamping mid-keystroke
 * makes typing "5" into a min-10 field impossible.
 * ───────────────────────────────────────────────────────── */

export interface NumberInputProps
  /* `prefix` is a legacy HTML attribute typed as string — ours is a node */
  extends Omit<
    React.ComponentProps<"input">,
    "onChange" | "value" | "size" | "type" | "min" | "max" | "step" | "prefix"
  > {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Decimal places kept on commit. */
  precision?: number;
  /** Rendered inside the field, e.g. "$" or "ms". */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** Thousands separators while not focused. Default true. */
  grouping?: boolean;
  size?: "sm" | "md" | "lg";
  /** Hides the +/− buttons. */
  steppers?: boolean;
  className?: string;
}

const SIZES = {
  sm: "h-7 text-[12.5px]",
  md: "h-8 text-[13px]",
  lg: "h-9 text-[13px]",
} as const;

const round = (value: number, precision?: number) =>
  precision === undefined ? value : Number(value.toFixed(precision));

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  precision,
  prefix,
  suffix,
  grouping = true,
  size = "md",
  steppers = true,
  className,
  disabled,
  ...props
}: NumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const clamp = (n: number) => {
    if (min !== undefined && n < min) return min;
    if (max !== undefined && n > max) return max;
    return n;
  };

  const display =
    draft ??
    (value === null || Number.isNaN(value)
      ? ""
      : grouping
        ? new Intl.NumberFormat(undefined, {
            maximumFractionDigits: precision ?? 20,
            minimumFractionDigits: precision ?? 0,
          }).format(value)
        : String(value));

  const commit = (text: string) => {
    const clean = text.replace(/[^\d.,\-+eE]/g, "").replace(/,/g, "");
    if (clean === "" || clean === "-" || clean === "+") {
      onChange(null);
      return;
    }
    const parsed = Number(clean);
    onChange(Number.isFinite(parsed) ? round(clamp(parsed), precision) : null);
  };

  const bump = (delta: number) => {
    const base = value ?? min ?? 0;
    onChange(round(clamp(base + delta), precision ?? decimalsOf(step)));
    inputRef.current?.focus();
  };

  const atMin = min !== undefined && value !== null && value <= min;
  const atMax = max !== undefined && value !== null && value >= max;

  const stepper = (dir: 1 | -1, label: string, path: string, off: boolean) => (
    <button
      type="button"
      aria-label={label}
      tabIndex={-1}
      disabled={disabled || off}
      onClick={() => bump(dir * step)}
      className="flex h-1/2 w-6 items-center justify-center text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink disabled:pointer-events-none disabled:opacity-30"
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    </button>
  );

  return (
    <div
      className={cx(
        "flex items-center overflow-hidden rounded-control bg-field shadow-hairline",
        "transition-shadow duration-150 focus-within:shadow-[0_0_0_1px_var(--accent)]",
        disabled && "pointer-events-none opacity-40",
        SIZES[size],
        className,
      )}
    >
      {prefix && <span className="shrink-0 pl-2.5 text-ink-3">{prefix}</span>}

      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        role="spinbutton"
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        disabled={disabled}
        value={display}
        onChange={(event) => {
          setDraft(event.target.value);
          /* live-report only clean numbers; the draft keeps the rest */
          const parsed = Number(event.target.value.replace(/,/g, ""));
          if (event.target.value === "") onChange(null);
          else if (Number.isFinite(parsed)) onChange(round(parsed, precision));
        }}
        onFocus={(event) => setDraft(event.target.value)}
        onBlur={(event) => {
          commit(event.target.value);
          setDraft(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            bump(event.shiftKey ? step * 10 : step);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            bump(event.shiftKey ? -step * 10 : -step);
          } else if (event.key === "Enter") {
            commit(event.currentTarget.value);
            setDraft(null);
          }
        }}
        /* no onWheel handler on purpose — scrolling a page should
           never edit a value the pointer happens to rest on */
        className={cx(
          "min-w-0 flex-1 bg-transparent tabular-nums text-ink outline-none placeholder:text-ink-3",
          prefix ? "pl-1" : "pl-2.5",
          suffix ? "pr-1" : "pr-2",
        )}
        {...props}
      />

      {suffix && <span className="shrink-0 pr-2 text-[11.5px] text-ink-3">{suffix}</span>}

      {steppers && (
        <div className="flex h-full shrink-0 flex-col border-l border-line">
          {stepper(1, "Increase", "M12 5v14M5 12h14", atMax)}
          {stepper(-1, "Decrease", "M5 12h14", atMin)}
        </div>
      )}
    </div>
  );
}

/* step 0.25 → 2, so bumping never introduces float dust */
function decimalsOf(step: number) {
  const text = String(step);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}
