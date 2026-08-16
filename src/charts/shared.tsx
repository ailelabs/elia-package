"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cx } from "../base/cx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../base/table";

/* ─────────────────────────────────────────────────────────
 * CHART SHARED — the parts every chart needs: the fixed
 * categorical palette, a nice-number axis scale, container
 * measurement, the hover tooltip, the legend, and the frame
 * that carries a title plus the accessible table view.
 *
 * Slots are assigned in source order and never cycled: a
 * ninth series folds into "Other" rather than reusing hue 1,
 * because a repeated hue reads as a repeated entity.
 * ───────────────────────────────────────────────────────── */

export const CHART_SLOTS = 8;

export const seriesColor = (index: number) =>
  `var(--chart-${(index % CHART_SLOTS) + 1})`;

export const SEQUENTIAL = [
  "var(--chart-seq-1)",
  "var(--chart-seq-2)",
  "var(--chart-seq-3)",
  "var(--chart-seq-4)",
  "var(--chart-seq-5)",
  "var(--chart-seq-6)",
];

export interface ChartSeries {
  id: string;
  label?: string;
  data: number[];
  /** Overrides the palette slot — only for entities with a fixed brand color. */
  color?: string;
}

export type ChartFormatter = (value: number) => string;

export const compact: ChartFormatter = (value) =>
  new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value);

/* ── axis scale ──────────────────────────────────────────
 * Nice numbers: round the step to 1/2/5 × 10ⁿ so ticks land
 * on values a reader can do arithmetic with. */
export function niceScale(min: number, max: number, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1, ticks: [0, 1] };
  if (min === max) {
    if (min === 0) return { min: 0, max: 1, ticks: [0, 0.5, 1] };
    min = Math.min(0, min);
    max = Math.max(0, max);
  }
  const raw = (max - min) / count || 1;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toPrecision(12)));
  return { min: lo, max: hi, ticks };
}

/* ── container measurement ───────────────────────────────
 * Charts render at real pixel width rather than scaling a
 * viewBox, so labels never stretch. */
export function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    setWidth(node.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

/* ── tooltip ─────────────────────────────────────────────── */

export interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

export function ChartTooltip({
  x,
  y,
  title,
  rows,
  width,
}: {
  x: number;
  y: number;
  title?: string;
  rows: TooltipRow[];
  width: number;
}) {
  /* keep the card inside the plot instead of letting it clip */
  const estimated = 150;
  const flip = x + estimated > width;

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 min-w-[110px] rounded-[8px] px-2 py-1.5 shadow-overlay"
      style={{
        left: x,
        top: y,
        transform: `translate(${flip ? "calc(-100% - 10px)" : "10px"}, -50%)`,
        background: "var(--tooltip-bg)",
        color: "var(--tooltip-fg)",
        border: "1px solid var(--tooltip-border)",
      }}
    >
      {title && (
        <p className="mb-1 text-[11px] font-medium" style={{ color: "var(--tooltip-muted)" }}>
          {title}
        </p>
      )}
      <div className="flex flex-col gap-0.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2 text-[11.5px] whitespace-nowrap">
            {row.color && (
              <span className="size-2 shrink-0 rounded-[3px]" style={{ background: row.color }} />
            )}
            <span className="flex-1" style={{ color: "var(--tooltip-muted)" }}>
              {row.label}
            </span>
            <span className="font-mono tabular-nums">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── legend ──────────────────────────────────────────────
 * Always present for ≥2 series, so identity never rests on
 * color alone. Clicking mutes a series without repainting
 * the survivors — color follows the entity, not its rank. */
export function ChartLegend({
  items,
  hidden,
  onToggle,
  className,
}: {
  items: { id: string; label: string; color: string }[];
  hidden?: Set<string>;
  onToggle?: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      {items.map((item) => {
        const off = hidden?.has(item.id);
        const content = (
          <>
            <span
              className="size-2 shrink-0 rounded-[3px] transition-opacity duration-150"
              style={{ background: item.color, opacity: off ? 0.3 : 1 }}
            />
            <span className={cx("text-[11.5px] transition-colors duration-150", off ? "text-ink-3 line-through" : "text-ink-2")}>
              {item.label}
            </span>
          </>
        );

        return onToggle ? (
          <button
            key={item.id}
            type="button"
            aria-pressed={!off}
            onClick={() => onToggle(item.id)}
            className="flex items-center gap-1.5 rounded-[5px] px-1 py-0.5 transition-colors duration-150 hover:bg-hover-2 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1"
          >
            {content}
          </button>
        ) : (
          <span key={item.id} className="flex items-center gap-1.5 px-1 py-0.5">
            {content}
          </span>
        );
      })}
    </div>
  );
}

/* ── frame ───────────────────────────────────────────────
 * Title, legend, and the table view. The table is not a
 * nicety: it is how the chart stays readable for anyone the
 * color encoding fails, and how the numbers stay copyable. */

export interface ChartFrameProps {
  title?: React.ReactNode;
  caption?: React.ReactNode;
  legend?: React.ReactNode;
  /** Renders the "Show data" toggle and this table beneath it. */
  table?: { columns: string[]; rows: (string | number)[][] };
  className?: string;
  children: React.ReactNode;
}

export function ChartFrame({ title, caption, legend, table, className, children }: ChartFrameProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <figure className={cx("m-0 w-full", className)}>
      {(title || table) && (
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <figcaption className="text-[13px] font-semibold text-ink">{title}</figcaption>}
            {caption && <p className="mt-0.5 text-[11.5px] text-ink-3">{caption}</p>}
          </div>
          {table && (
            <button
              type="button"
              aria-expanded={showTable}
              onClick={() => setShowTable(!showTable)}
              className="shrink-0 rounded-[6px] px-1.5 py-0.5 text-[11.5px] text-ink-3 transition-colors duration-150 hover:bg-hover-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              {showTable ? "Hide data" : "Show data"}
            </button>
          )}
        </div>
      )}

      {children}

      {legend && <div className="mt-2.5">{legend}</div>}

      {/* the grid trick — never animate height */}
      {table && (
        <div
          className="grid transition-[grid-template-rows] duration-300"
          style={{ gridTemplateRows: showTable ? "1fr" : "0fr", transitionTimingFunction: "var(--ease-out-strong)" }}
        >
          <div className="overflow-hidden">
            <div className="pt-3">
              <Table dense>
                <TableHead>
                  <TableRow>
                    {table.columns.map((column, i) => (
                      <TableHeader key={column} align={i === 0 ? "left" : "right"}>
                        {column}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {table.rows.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j} align={j === 0 ? "left" : "right"} mono={j > 0}>
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </figure>
  );
}

/* ── shared axis furniture ──────────────────────────────── */

export const AXIS_TEXT = { fill: "var(--ink-3)", fontSize: 10.5 } as const;

export function GridLines({
  ticks,
  scale,
  x1,
  x2,
  horizontal = true,
}: {
  ticks: number[];
  scale: (value: number) => number;
  x1: number;
  x2: number;
  horizontal?: boolean;
}) {
  return (
    <g aria-hidden="true">
      {ticks.map((tick) => {
        const p = scale(tick);
        return (
          <line
            key={tick}
            x1={horizontal ? x1 : p}
            x2={horizontal ? x2 : p}
            y1={horizontal ? p : x1}
            y2={horizontal ? p : x2}
            stroke="var(--chart-grid)"
            strokeWidth={1}
            shapeRendering="crispEdges"
          />
        );
      })}
    </g>
  );
}

/* Reduced motion is respected globally; charts only need to
   know whether to run their entry draw at all. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);
  return reduced;
}
