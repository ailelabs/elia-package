"use client";

import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * SEGMENTED — fine-tune-card pattern: gray field track, one
 * raised surface thumb gliding under the active option.
 * ───────────────────────────────────────────────────────── */

export type SegmentedOption = {
  value: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
};

type SegmentedProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
};

export function Segmented({ options, value, onChange, className, style, ...props }: SegmentedProps) {
  const active = Math.max(0, options.findIndex((option) => option.value === value));

  return (
    <div
      className={cx("relative grid rounded-control bg-field p-0.5", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, ...style }}
      {...props}
    >
      <span
        aria-hidden
        className="absolute inset-y-0.5 rounded-[6px] bg-surface shadow-btn transition-transform duration-300"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          left: 2,
          transform: `translateX(${active * 100}%)`,
          transitionTimingFunction: "var(--ease-out-strong)",
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          aria-label={option.label == null ? option.value : undefined}
          onClick={() => onChange(option.value)}
          className={cx(
            "relative z-10 flex h-6 items-center justify-center gap-1.5 text-[12px] font-medium transition-colors duration-200",
            "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
            option.value === value ? "text-accent" : "text-ink-3",
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
