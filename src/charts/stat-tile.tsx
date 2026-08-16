"use client";

import { cx } from "../base/cx";
import { compact, seriesColor, useSize, type ChartFormatter } from "./shared";

/* ─────────────────────────────────────────────────────────
 * STAT TILE — a single current value, its change, and an
 * optional sparkline. This is the right answer far more often
 * than a one-bar bar chart: when the reader wants one number,
 * give them the number at size and let the trend whisper.
 *
 * The delta's tone is explicit, not inferred from the sign —
 * falling latency is good and rising churn is bad, and only
 * the caller knows which way is up.
 * ───────────────────────────────────────────────────────── */

export interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  /** Fills under the line. */
  area?: boolean;
  className?: string;
}

export function Sparkline({ data, color = seriesColor(0), height = 32, area = true, className }: SparklineProps) {
  const { ref, width } = useSize<HTMLDivElement>();
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  const x = (i: number) => (data.length < 2 ? width / 2 : (i / (data.length - 1)) * width);
  /* 2px inset top and bottom so the stroke never clips */
  const y = (v: number) => 2 + (1 - (v - min) / span) * (height - 4);

  const d = data.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");

  return (
    <div ref={ref} className={cx("w-full", className)} style={{ height }}>
      {width > 0 && data.length > 1 && (
        <svg width={width} height={height} aria-hidden="true">
          {area && <path d={`${d} L${width},${height} L0,${height} Z`} fill={color} opacity={0.12} />}
          <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r={2.5} fill={color} />
        </svg>
      )}
    </div>
  );
}

export type DeltaTone = "good" | "bad" | "neutral";

export interface StatTileProps extends Omit<React.ComponentProps<"div">, "title"> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Signed change. Rendered with an arrow and the tone below. */
  delta?: number;
  /** Which direction is good — the sign alone can't say. */
  deltaTone?: DeltaTone;
  formatDelta?: ChartFormatter;
  caption?: React.ReactNode;
  /** Trend behind the number. */
  sparkline?: number[];
  icon?: React.ReactNode;
}

const TONE: Record<DeltaTone, string> = {
  good: "text-green",
  bad: "text-red",
  neutral: "text-ink-3",
};

export function StatTile({
  label,
  value,
  delta,
  deltaTone,
  formatDelta = (v) => `${v > 0 ? "+" : ""}${compact(v)}`,
  caption,
  sparkline,
  icon,
  className,
  ...rest
}: StatTileProps) {
  /* unstated tone falls back to "up is good", the common case,
     but stays overridable for latency, cost, churn… */
  const tone: DeltaTone = deltaTone ?? (delta === undefined || delta === 0 ? "neutral" : delta > 0 ? "good" : "bad");

  return (
    <div className={cx("rounded-card bg-surface p-3.5 shadow-card", className)} {...rest}>
      <div className="flex items-center gap-1.5">
        {icon && <span className="flex size-4 shrink-0 items-center justify-center text-ink-3">{icon}</span>}
        <p className="text-[11.5px] font-medium text-ink-3">{label}</p>
      </div>

      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[24px] font-[650] tracking-[-0.02em] text-ink tabular-nums">{value}</span>
        {delta !== undefined && (
          <span className={cx("flex items-center gap-0.5 text-[12px] font-medium tabular-nums", TONE[tone])}>
            {delta !== 0 && (
              <svg
                width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
                style={{ transform: delta > 0 ? "rotate(0)" : "rotate(180deg)" }}
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            )}
            {formatDelta(delta)}
          </span>
        )}
      </div>

      {caption && <p className="mt-0.5 text-[11.5px] text-ink-3">{caption}</p>}

      {sparkline && sparkline.length > 1 && (
        <Sparkline
          className="mt-2.5"
          data={sparkline}
          color={tone === "bad" ? "var(--red)" : tone === "good" ? "var(--green)" : seriesColor(0)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * METER — one ratio against a limit. A two-slice pie would
 * be the wrong shape for this; a track that fills reads as
 * "how much of the allowance is gone" at a glance.
 * ───────────────────────────────────────────────────────── */

export interface MeterProps extends Omit<React.ComponentProps<"div">, "title"> {
  value: number;
  max: number;
  label?: React.ReactNode;
  formatValue?: ChartFormatter;
  /** Turns the bar amber, then red, as usage crosses these. */
  thresholds?: { warn: number; danger: number };
  size?: "sm" | "md";
  showValue?: boolean;
}

export function Meter({
  value,
  max,
  label,
  formatValue = compact,
  thresholds = { warn: 0.75, danger: 0.9 },
  size = "md",
  showValue = true,
  className,
  ...rest
}: MeterProps) {
  const ratio = max > 0 ? Math.max(0, Math.min(value / max, 1)) : 0;
  const color =
    ratio >= thresholds.danger ? "var(--red)" : ratio >= thresholds.warn ? "var(--orange)" : "var(--accent)";

  return (
    <div className={cx("w-full", className)} {...rest}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label && <span className="text-[12px] font-medium text-ink-2">{label}</span>}
          {showValue && (
            <span className="font-mono text-[11px] tabular-nums text-ink-3">
              {formatValue(value)} / {formatValue(max)}
            </span>
          )}
        </div>
      )}
      <div
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={typeof label === "string" ? label : "Usage"}
        className={cx("w-full overflow-hidden rounded-full bg-inset shadow-hairline", size === "sm" ? "h-1.5" : "h-2")}
      >
        <div
          className="h-full rounded-full transition-[width,background-color] duration-500"
          style={{ width: `${ratio * 100}%`, background: color, transitionTimingFunction: "var(--ease-out-strong)" }}
        />
      </div>
    </div>
  );
}
