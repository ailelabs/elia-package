"use client";

import { useMemo, useState } from "react";
import {
  ChartFrame,
  ChartLegend,
  ChartTooltip,
  compact,
  seriesColor,
  useSize,
  type ChartFormatter,
} from "./shared";

/* ─────────────────────────────────────────────────────────
 * PIE — part-to-whole as solid wedges from the centre.
 * DoughnutChart (below) is the same geometry with the middle
 * cut out; they are separate exports because they answer
 * different questions. A pie asks "how do the parts compare";
 * a doughnut puts the TOTAL in the hole and asks "what makes
 * up this number". Picking one is an editorial decision, so
 * it shouldn't hide behind a numeric prop default.
 *
 * A 2px surface gap separates slices; hovering lifts a slice
 * outward rather than recoloring it, so the palette keeps
 * meaning what it meant. More than 7 slices is a table —
 * `maxSlices` folds the tail into "Other" instead of
 * reaching for a 9th hue.
 * ───────────────────────────────────────────────────────── */

export interface PieSlice {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieSlice[];
  /** Hole size as a fraction of the radius. 0 = solid pie. */
  innerRadius?: number;
  size?: number;
  formatValue?: ChartFormatter;
  title?: React.ReactNode;
  caption?: React.ReactNode;
  legend?: boolean;
  showTable?: boolean;
  /** Big number in a doughnut's hole. Defaults to the total. */
  centerLabel?: React.ReactNode;
  centerCaption?: React.ReactNode;
  /** Slices past this fold into "Other". */
  maxSlices?: number;
  onSliceClick?: (slice: PieSlice) => void;
  className?: string;
}

const GAP = 2;
const LIFT = 5;

export function arc(cx: number, cy: number, r: number, inner: number, from: number, to: number) {
  const large = to - from > Math.PI ? 1 : 0;
  const x1 = cx + r * Math.cos(from);
  const y1 = cy + r * Math.sin(from);
  const x2 = cx + r * Math.cos(to);
  const y2 = cy + r * Math.sin(to);

  if (inner <= 0) {
    return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
  }
  const x3 = cx + inner * Math.cos(to);
  const y3 = cy + inner * Math.sin(to);
  const x4 = cx + inner * Math.cos(from);
  const y4 = cy + inner * Math.sin(from);
  return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${inner},${inner} 0 ${large} 0 ${x4},${y4} Z`;
}

export function PieChart({
  data,
  innerRadius = 0,
  size = 200,
  formatValue = compact,
  title,
  caption,
  legend = true,
  showTable,
  centerLabel,
  centerCaption,
  maxSlices = 7,
  onSliceClick,
  className,
}: PieChartProps) {
  const { ref, width } = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<{ index: number; x: number; y: number } | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  /* fold the tail rather than seat a 9th hue */
  const slices = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    if (sorted.length <= maxSlices) return sorted;
    const head = sorted.slice(0, maxSlices - 1);
    const tail = sorted.slice(maxSlices - 1);
    return [
      ...head,
      { id: "__other__", label: "Other", value: tail.reduce((sum, s) => sum + s.value, 0) },
    ];
  }, [data, maxSlices]);

  const visible = slices.filter((slice) => !hidden.has(slice.id));
  const total = visible.reduce((sum, slice) => sum + Math.max(0, slice.value), 0);

  const box = size;
  const cx = box / 2;
  const cy = box / 2;
  const radius = box / 2 - LIFT - 2;
  const inner = radius * Math.max(0, Math.min(innerRadius, 0.9));

  /* one gap's worth of angle, so thin slices don't vanish into it */
  const gapAngle = total > 0 ? GAP / radius : 0;

  let cursor = -Math.PI / 2;
  const arcs = visible.map((slice) => {
    const fraction = total > 0 ? Math.max(0, slice.value) / total : 0;
    const sweep = fraction * Math.PI * 2;
    const from = cursor + gapAngle / 2;
    const to = cursor + sweep - gapAngle / 2;
    cursor += sweep;
    return { slice, from, to: Math.max(from, to), fraction, mid: from + (to - from) / 2 };
  });

  const toggle = (id: string) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const colorOf = (slice: PieSlice) =>
    slice.color ?? (slice.id === "__other__" ? "var(--ink-3)" : seriesColor(slices.indexOf(slice)));

  return (
    <ChartFrame
      title={title}
      caption={caption}
      className={className}
      legend={
        legend ? (
          <ChartLegend
            items={slices.map((slice) => ({ id: slice.id, label: slice.label, color: colorOf(slice) }))}
            hidden={hidden}
            onToggle={toggle}
          />
        ) : undefined
      }
      table={
        showTable
          ? {
              columns: ["Slice", "Value", "Share"],
              rows: slices.map((slice) => [
                slice.label,
                formatValue(slice.value),
                total > 0 ? `${((slice.value / total) * 100).toFixed(1)}%` : "—",
              ]),
            }
          : undefined
      }
    >
      <div ref={ref} className="relative flex w-full justify-center" onMouseLeave={() => setHover(null)}>
        <svg
          width={box}
          height={box}
          role="img"
          aria-label={typeof title === "string" ? title : "Pie chart"}
        >
          {arcs.map(({ slice, from, to, mid }, i) => {
            const lifted = hover?.index === i;
            const dx = lifted ? Math.cos(mid) * LIFT : 0;
            const dy = lifted ? Math.sin(mid) * LIFT : 0;

            return (
              <path
                key={slice.id}
                d={arc(cx, cy, radius, inner, from, to)}
                fill={colorOf(slice)}
                transform={`translate(${dx} ${dy})`}
                className="transition-transform duration-200"
                style={{
                  transitionTimingFunction: "var(--ease-out-strong)",
                  cursor: onSliceClick ? "pointer" : undefined,
                }}
                onMouseMove={(event) => {
                  const rect = (event.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                  setHover({ index: i, x: event.clientX - rect.left, y: event.clientY - rect.top });
                }}
                onClick={() => onSliceClick?.(slice)}
              />
            );
          })}

          {inner > 0 && (
            <g>
              <text
                x={cx}
                y={cy - 2}
                textAnchor="middle"
                fill="var(--ink)"
                fontSize={inner > 46 ? 19 : 15}
                fontWeight={650}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {centerLabel ?? formatValue(total)}
              </text>
              {(centerCaption ?? true) && (
                <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--ink-3)" fontSize={10.5}>
                  {centerCaption ?? "Total"}
                </text>
              )}
            </g>
          )}
        </svg>

        {hover && arcs[hover.index] && (
          <ChartTooltip
            x={hover.x + (width - box) / 2}
            y={hover.y}
            width={width}
            rows={[
              {
                label: arcs[hover.index].slice.label,
                value: `${formatValue(arcs[hover.index].slice.value)} · ${(arcs[hover.index].fraction * 100).toFixed(1)}%`,
                color: colorOf(arcs[hover.index].slice),
              },
            ]}
          />
        )}
      </div>
    </ChartFrame>
  );
}

/* ─────────────────────────────────────────────────────────
 * DOUGHNUT — a pie with the middle cut out so the total can
 * live there. Same slices, same rules; the hole is the point,
 * so `innerRadius` is a real default rather than 0.
 * ───────────────────────────────────────────────────────── */

export type DoughnutChartProps = PieChartProps;

export function DoughnutChart({ innerRadius = 0.62, ...props }: DoughnutChartProps) {
  return <PieChart innerRadius={innerRadius} {...props} />;
}
