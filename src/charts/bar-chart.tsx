"use client";

import { useMemo, useState } from "react";
import { cx } from "../base/cx";
import {
  AXIS_TEXT,
  ChartFrame,
  ChartLegend,
  ChartTooltip,
  GridLines,
  compact,
  niceScale,
  seriesColor,
  useSize,
  usePrefersReducedMotion,
  type ChartFormatter,
  type ChartSeries,
} from "./shared";

/* ─────────────────────────────────────────────────────────
 * BAR CHART — grouped, stacked, or horizontal. Rounded
 * data-ends only (4px on the far end, square on the
 * baseline), a 2px surface gap between stacked segments,
 * and a recessive grid behind everything.
 *
 * Hover is per-bar for grouped and per-category for stacked,
 * because a stack's story is its total and its split.
 * ───────────────────────────────────────────────────────── */

export interface BarChartProps {
  /** One label per category — the x axis (y when horizontal). */
  labels: string[];
  series: ChartSeries[];
  stacked?: boolean;
  horizontal?: boolean;
  height?: number;
  formatValue?: ChartFormatter;
  /** Axis tick format; defaults to the compact value format. */
  formatTick?: ChartFormatter;
  title?: React.ReactNode;
  caption?: React.ReactNode;
  /** Draws the legend (forced on for ≥2 series). */
  legend?: boolean;
  /** Adds the "Show data" table view. */
  showTable?: boolean;
  onBarClick?: (payload: { series: string; label: string; value: number }) => void;
  className?: string;
}

const RADIUS = 4;
const SEGMENT_GAP = 2;

/* a rect with only the two far-end corners rounded — the
   baseline end must stay square or the bar looks unanchored */
export function barPath(x: number, y: number, w: number, h: number, side: "top" | "right") {
  const r = Math.min(RADIUS, w / 2, h / 2);
  if (r <= 0 || h <= 0 || w <= 0) return "";
  if (side === "top") {
    return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
  }
  return `M${x},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} L${x},${y + h} Z`;
}

export function BarChart({
  labels,
  series,
  stacked,
  horizontal,
  height = 240,
  formatValue = compact,
  formatTick,
  title,
  caption,
  legend,
  showTable,
  onBarClick,
  className,
}: BarChartProps) {
  const { ref, width } = useSize<HTMLDivElement>();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<{ x: number; y: number; category: number; series?: number } | null>(null);
  const reduced = usePrefersReducedMotion();

  const active = series.filter((s) => !hidden.has(s.id));
  const tickFormat = formatTick ?? formatValue;

  /* the scale spans every value the chart can show, hidden
     series included, so toggling the legend never rescales
     the axis under the reader */
  const { min, max, ticks } = useMemo(() => {
    const totals: number[] = [];
    labels.forEach((_, i) => {
      if (stacked) {
        totals.push(series.reduce((sum, s) => sum + Math.max(0, s.data[i] ?? 0), 0));
        totals.push(series.reduce((sum, s) => sum + Math.min(0, s.data[i] ?? 0), 0));
      } else {
        series.forEach((s) => totals.push(s.data[i] ?? 0));
      }
    });
    return niceScale(Math.min(0, ...totals), Math.max(0, ...totals));
  }, [labels, series, stacked]);

  const gutter = Math.max(...ticks.map((t) => tickFormat(t).length)) * 6 + 10;
  const pad = horizontal
    ? { top: 4, right: 16, bottom: 20, left: Math.max(gutter, 56) }
    : { top: 8, right: 8, bottom: 22, left: gutter };

  const plotW = Math.max(0, width - pad.left - pad.right);
  const plotH = Math.max(0, height - pad.top - pad.bottom);
  const span = max - min || 1;

  /* value → pixel along the measure axis */
  const vScale = (value: number) =>
    horizontal ? pad.left + ((value - min) / span) * plotW : pad.top + plotH - ((value - min) / span) * plotH;
  const zero = vScale(0);

  const bandSize = (horizontal ? plotH : plotW) / (labels.length || 1);
  const bandPad = Math.min(bandSize * 0.28, 22);
  const inner = Math.max(1, bandSize - bandPad);
  const barW = stacked ? inner : Math.max(1, inner / Math.max(active.length, 1));

  const bandStart = (i: number) => (horizontal ? pad.top : pad.left) + i * bandSize + bandPad / 2;

  const toggle = (id: string) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const showLegend = legend ?? series.length > 1;

  const tooltipRows = hover
    ? stacked || hover.series === undefined
      ? active.map((s, i) => ({
          label: s.label ?? s.id,
          value: formatValue(s.data[hover.category] ?? 0),
          color: s.color ?? seriesColor(series.indexOf(s)),
        }))
      : [
          {
            label: active[hover.series]?.label ?? active[hover.series]?.id ?? "",
            value: formatValue(active[hover.series]?.data[hover.category] ?? 0),
            color: active[hover.series]?.color ?? seriesColor(series.indexOf(active[hover.series])),
          },
        ]
    : [];

  return (
    <ChartFrame
      title={title}
      caption={caption}
      className={className}
      legend={
        showLegend ? (
          <ChartLegend
            items={series.map((s, i) => ({ id: s.id, label: s.label ?? s.id, color: s.color ?? seriesColor(i) }))}
            hidden={hidden}
            onToggle={toggle}
          />
        ) : undefined
      }
      table={
        showTable
          ? {
              columns: ["", ...series.map((s) => s.label ?? s.id)],
              rows: labels.map((label, i) => [label, ...series.map((s) => formatValue(s.data[i] ?? 0))]),
            }
          : undefined
      }
    >
      <div ref={ref} className="relative w-full" style={{ height }} onMouseLeave={() => setHover(null)}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label={typeof title === "string" ? title : "Bar chart"}>
            <GridLines
              ticks={ticks}
              scale={vScale}
              x1={horizontal ? pad.top : pad.left}
              x2={horizontal ? pad.top + plotH : pad.left + plotW}
              horizontal={!horizontal}
            />

            {/* measure axis labels */}
            {ticks.map((tick) => (
              <text
                key={tick}
                {...AXIS_TEXT}
                x={horizontal ? vScale(tick) : pad.left - 6}
                y={horizontal ? height - 6 : vScale(tick) + 3.5}
                textAnchor={horizontal ? "middle" : "end"}
              >
                {tickFormat(tick)}
              </text>
            ))}

            {/* category labels */}
            {labels.map((label, i) => (
              <text
                key={label + i}
                {...AXIS_TEXT}
                x={horizontal ? pad.left - 8 : bandStart(i) + inner / 2}
                y={horizontal ? bandStart(i) + inner / 2 + 3.5 : height - 6}
                textAnchor={horizontal ? "end" : "middle"}
              >
                {label}
              </text>
            ))}

            {/* baseline */}
            <line
              x1={horizontal ? zero : pad.left}
              x2={horizontal ? zero : pad.left + plotW}
              y1={horizontal ? pad.top : zero}
              y2={horizontal ? pad.top + plotH : zero}
              stroke="var(--line-strong)"
              strokeWidth={1}
              shapeRendering="crispEdges"
            />

            {labels.map((label, category) => {
              let posCursor = 0;
              let negCursor = 0;

              return (
                <g key={label + category}>
                  {active.map((s, slot) => {
                    const value = s.data[category] ?? 0;
                    const color = s.color ?? seriesColor(series.indexOf(s));

                    /* start = where the segment begins on the measure
                       axis, end = where it stops; cross = its offset
                       along the category axis */
                    let start: number;
                    let end: number;
                    let cross: number;
                    let thick: number;

                    if (stacked) {
                      const base = value >= 0 ? posCursor : negCursor;
                      const tip = base + value;
                      if (value >= 0) posCursor = tip;
                      else negCursor = tip;
                      start = vScale(base);
                      end = vScale(tip);
                      cross = bandStart(category);
                      thick = barW;
                    } else {
                      start = zero;
                      end = vScale(value);
                      cross = bandStart(category) + slot * barW;
                      thick = Math.max(1, barW - 2);
                    }

                    /* the 2px spacer comes off the growing end, so
                       stacked segments never touch */
                    const length = Math.max(0, Math.abs(end - start) - (stacked ? SEGMENT_GAP : 0));
                    if (length <= 0) return null;

                    const near = Math.min(start, end) + (stacked && end > start ? SEGMENT_GAP : 0);

                    const path = horizontal
                      ? barPath(near, cross, length, thick, "right")
                      : barPath(cross, near, thick, length, "top");

                    const dim = hover && hover.category !== category;

                    return (
                      <path
                        key={s.id}
                        d={path}
                        fill={color}
                        opacity={dim ? 0.45 : 1}
                        className={cx("transition-opacity duration-150", onBarClick && "cursor-pointer")}
                        style={
                          reduced
                            ? undefined
                            : {
                                animation: `fade-up 420ms ${category * 40}ms var(--ease-out-strong) both`,
                              }
                        }
                        onMouseMove={(event) => {
                          const box = (event.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                          setHover({
                            x: event.clientX - box.left,
                            y: event.clientY - box.top,
                            category,
                            series: stacked ? undefined : slot,
                          });
                        }}
                        onClick={() =>
                          onBarClick?.({ series: s.id, label, value })
                        }
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        )}

        {hover && (
          <ChartTooltip x={hover.x} y={hover.y} title={labels[hover.category]} rows={tooltipRows} width={width} />
        )}
      </div>
    </ChartFrame>
  );
}
