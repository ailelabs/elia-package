"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────────────────
 * FILTER TABLE
 * Status chips directly filter the task table.
 * API: filters?, rows?, columns?, onFilterChange?(key), onRowClick?(row).
 * ───────────────────────────────────────────────────────── */

export type FilterTableStatus = "todo" | "progress" | "done";
export type FilterTableFilterKey = "all" | FilterTableStatus;

export interface FilterTableFilter {
  key: FilterTableFilterKey;
  label: string;
  dot?: string;
  count: number;
}

export interface FilterTableRow {
  task: string;
  date: string;
  status: FilterTableStatus;
  owner: string;
}

export interface FilterTableProps {
  /** Filter chips. Defaults to All / To do / In Progress / Completed with counts from rows. */
  filters?: FilterTableFilter[];
  /** Table rows. Omit to render the built-in demo. */
  rows?: FilterTableRow[];
  /** Column header labels. */
  columns?: [string, string, string, string];
  /** Fired when a filter chip is selected. */
  onFilterChange?: (key: FilterTableFilterKey) => void;
  /** Fired when a row is clicked. */
  onRowClick?: (row: FilterTableRow) => void;
}

const ROWS: FilterTableRow[] = [
  { task: "Restock mango sorbet", date: "Dec 03", status: "todo", owner: "Mango Moon Gelato" },
  { task: "Churn black sesame", date: "Sep 22", status: "progress", owner: "Kumo Creamery" },
  { task: "Print summer menu", date: "Jan 02", status: "todo", owner: "Coral Coast Sorbet" },
  { task: "Taste-test batch 42", date: "Nov 08", status: "progress", owner: "Maple Orbit" },
  { task: "Order waffle cones", date: "Apr 14", status: "done", owner: "Aurora Scoops" },
];

const PILLS: Record<FilterTableStatus, { label: string; cls: string }> = {
  todo: { label: "To do", cls: "filter-status-todo" },
  progress: { label: "In Progress", cls: "filter-status-progress" },
  done: { label: "Completed", cls: "filter-status-done" },
};

export default function FilterTable({
  filters,
  rows,
  columns = ["Task name", "Date", "Status", "Advisor"],
  onFilterChange,
  onRowClick,
}: FilterTableProps = {}) {
  const data = rows ?? ROWS;
  const chips: FilterTableFilter[] = filters ?? [
    { key: "all", label: "All", count: data.length },
    { key: "todo", label: "To do", dot: "#f09a2f", count: data.filter((r) => r.status === "todo").length },
    { key: "progress", label: "In Progress", dot: "#16a6c7", count: data.filter((r) => r.status === "progress").length },
    { key: "done", label: "Completed", dot: "#25a878", count: data.filter((r) => r.status === "done").length },
  ];
  const [filter, setFilter] = useState<FilterTableFilterKey>("all");

  return (
    <div className="w-full max-w-105">
      {/* filter chips */}
      <div
        className="-mx-1 mb-1 flex items-center gap-1 overflow-x-auto px-1 py-1"
        style={{ scrollbarWidth: "none" }}
      >
        {chips.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setFilter(f.key);
                onFilterChange?.(f.key);
              }}
              className={`flex h-6.5 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px]
                font-medium transition-[background-color,box-shadow,color] duration-200
                ${active ? "bg-surface text-ink shadow-btn" : "text-ink-2 hover:bg-hover"}`}
            >
              {f.dot && <span className="size-1.5 rounded-full" style={{ background: f.dot }} />}
              {f.label}
              <span
                className={`rounded-[4px] px-1 text-[10.5px] tabular-nums
                  ${active ? "bg-field text-ink-2" : "text-ink-3"}`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* table */}
      <div
        aria-label="Scrollable task table"
        className="overflow-x-auto rounded-card bg-surface shadow-card"
        role="region"
        tabIndex={0}
        style={{ scrollbarWidth: "none" }}
      >
        <div className="min-w-[420px]">
          <div className="grid grid-cols-[1.3fr_0.6fr_0.95fr_0.9fr] border-b border-line px-3 py-2 text-[11.5px] font-medium text-ink-3">
            {columns.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          {data.map((row) => {
            const shown = filter === "all" || row.status === filter;
            const pill = PILLS[row.status];
            return (
              <div
                key={row.task}
                className="grid transition-[grid-template-rows,opacity] duration-300"
                style={{
                  gridTemplateRows: shown ? "1fr" : "0fr",
                  opacity: shown ? 1 : 0,
                  transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                <div className="overflow-hidden">
                  <div
                    onClick={() => onRowClick?.(row)}
                    className="grid grid-cols-[1.3fr_0.6fr_0.95fr_0.9fr] items-center border-b
                      border-line px-3 py-2 text-[12px] transition-colors duration-100
                      last:border-0 hover:bg-hover"
                  >
                    <span className="truncate font-medium text-ink">{row.task}</span>
                    <span className="text-ink-2 tabular-nums">{row.date}</span>
                    <span>
                      <span
                        className={`inline-flex h-5 items-center rounded-[5px] px-1.5
                          text-[11px] font-medium ${pill.cls}`}
                      >
                        {pill.label}
                      </span>
                    </span>
                    <span className="truncate text-ink-2">{row.owner}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
