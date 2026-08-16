"use client";

import { useMemo, useState } from "react";
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
  type ChartFormatter,
  type ChartSeries,
} from "./shared";

/* ─────────────────────────────────────────────────────────
 * LINE CHART — 2px strokes, optional area fill, and a
 * crosshair that snaps to the nearest category and reports
 * every visible series at once. Markers appear on hover
 * rather than at every point, so a dense line stays a line.
 *
 * `area` is for a single series; stacking areas hides the
 * very comparison an area implies, so it isn't offered.
 * ───────────────────────────────────────────────────────── */

export interface LineChartProps {
  labels: string[];
  series: ChartSeries[];
  area?: boolean;
  /** Rounded corners through each point (0 = straight segments). */
  curve?: boolean;
  height?: number;
  formatValue?: ChartFormatter;
  formatTick?: ChartFormatter;
  title?: React.ReactNode;
  caption?: React.ReactNode;
  legend?: boolean;
  showTable?: boolean;
  /** Dashed horizontal rule — a target, budget, or SLA. */
  reference?: { value: number; label?: string };
  className?: string;
}

/* Catmull-Rom → cubic bézier. Kept mild (tension 0.2) so the
   curve never invents a peak the data doesn't have. */
export function smoothPath(points: [number, number][]) {
  if (points.length < 2) return "";
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const t = 0.2;
    d += ` C${p1[0] + (p2[0] - p0[0]) * t},${p1[1] + (p2[1] - p0[1]) * t} ${p2[0] - (p3[0] - p1[0]) * t},${p2[1] - (p3[1] - p1[1]) * t} ${p2[0]},${p2[1]}`;
  }
  return d;
}

const linePath = (points: [number, number][]) =>
  points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");

export function LineChart({
  labels,
  series,
  area,
  curve,
  height = 240,
  formatValue = compact,
  formatTick,
  title,
  caption,
  legend,
  showTable,
  reference,
  className,
}: LineChartProps) {
  const { ref, width } = useSize<HTMLDivElement>();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<number | null>(null);

  const active = series.filter((s) => !hidden.has(s.id));
  const tickFormat = formatTick ?? formatValue;

  /* scale over all series, hidden included — see BarChart */
  const { min, max, ticks } = useMemo(() => {
    const values = series.flatMap((s) => s.data).filter(Number.isFinite);
    if (reference) values.push(reference.value);
    return niceScale(Math.min(...values), Math.max(...values));
  }, [series, reference]);

  const gutter = Math.max(...ticks.map((t) => tickFormat(t).length)) * 6 + 10;
  const pad = { top: 10, right: 12, bottom: 22, left: gutter };
  const plotW = Math.max(0, width - pad.left - pad.right);
  const plotH = Math.max(0, height - pad.top - pad.bottom);
  const span = max - min || 1;

  const xAt = (i: number) => pad.left + (labels.length === 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW);
  const yAt = (value: number) => pad.top + plotH - ((value - min) / span) * plotH;

  const nearest = (clientX: number, box: DOMRect) => {
    const x = clientX - box.left;
    const step = labels.length > 1 ? plotW / (labels.length - 1) : plotW;
    return Math.max(0, Math.min(labels.length - 1, Math.round((x - pad.left) / step)));
  };

  const toggle = (id: string) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /* label every ~70px so ticks never collide */
  const labelStride = Math.max(1, Math.ceil((labels.length * 46) / Math.max(plotW, 1)));
  const showLegend = legend ?? series.length > 1;

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
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={typeof title === "string" ? title : "Line chart"}
            onMouseMove={(event) =>
              setHover(nearest(event.clientX, event.currentTarget.getBoundingClientRect()))
            }
          >
            <GridLines ticks={ticks} scale={yAt} x1={pad.left} x2={pad.left + plotW} />

            {ticks.map((tick) => (
              <text key={tick} {...AXIS_TEXT} x={pad.left - 6} y={yAt(tick) + 3.5} textAnchor="end">
                {tickFormat(tick)}
              </text>
            ))}

            {labels.map((label, i) =>
              i % labelStride === 0 || i === labels.length - 1 ? (
                <text
                  key={label + i}
                  {...AXIS_TEXT}
                  x={xAt(i)}
                  y={height - 6}
                  textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
                >
                  {label}
                </text>
              ) : null,
            )}

            {reference && (
              <g>
                <line
                  x1={pad.left}
                  x2={pad.left + plotW}
                  y1={yAt(reference.value)}
                  y2={yAt(reference.value)}
                  stroke="var(--ink-3)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                {reference.label && (
                  <text {...AXIS_TEXT} x={pad.left + plotW} y={yAt(reference.value) - 5} textAnchor="end">
                    {reference.label}
                  </text>
                )}
              </g>
            )}

            {/* crosshair sits under the marks */}
            {hover !== null && (
              <line
                x1={xAt(hover)}
                x2={xAt(hover)}
                y1={pad.top}
                y2={pad.top + plotH}
                stroke="var(--line-strong)"
                strokeWidth={1}
              />
            )}

            {active.map((s) => {
              const color = s.color ?? seriesColor(series.indexOf(s));
              const points = s.data.map((value, i) => [xAt(i), yAt(value)] as [number, number]);
              const d = curve ? smoothPath(points) : linePath(points);
              const only = active.length === 1;

              return (
                <g key={s.id}>
                  {area && only && (
                    <path
                      d={`${d} L${xAt(s.data.length - 1)},${yAt(min)} L${xAt(0)},${yAt(min)} Z`}
                      fill={color}
                      opacity={0.12}
                    />
                  )}
                  <path
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}

            {/* hover markers — a 2px surface ring keeps overlapping
                series readable where they cross */}
            {hover !== null &&
              active.map((s) => {
                const color = s.color ?? seriesColor(series.indexOf(s));
                const value = s.data[hover];
                if (!Number.isFinite(value)) return null;
                return (
                  <circle
                    key={s.id}
                    cx={xAt(hover)}
                    cy={yAt(value)}
                    r={4}
                    fill={color}
                    stroke="var(--surface)"
                    strokeWidth={2}
                  />
                );
              })}
          </svg>
        )}

        {hover !== null && active.length > 0 && (
          <ChartTooltip
            x={xAt(hover)}
            y={pad.top + plotH / 2}
            title={labels[hover]}
            width={width}
            rows={active.map((s) => ({
              label: s.label ?? s.id,
              value: formatValue(s.data[hover] ?? 0),
              color: s.color ?? seriesColor(series.indexOf(s)),
            }))}
          />
        )}
      </div>
    </ChartFrame>
  );
}
