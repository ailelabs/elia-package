"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * DIFF TABLE
 * The proposed edit plays once and rests on the completed diff.
 * API: title?, rows?, added?, autoplay? — consumer rows render the settled diff.
 * ───────────────────────────────────────────────────────── */

export interface DiffTableRow {
  id: string;
  dept: string;
  email: string;
  removed: boolean;
}

export interface DiffTableAddedRow {
  id: string;
  dept: string;
  email: string;
}

export interface DiffTableProps {
  /** Card title. */
  title?: string;
  /** Existing rows; `removed: true` rows render struck through. Omit for the demo. */
  rows?: DiffTableRow[];
  /** Row appended as an addition. `null` for none. Defaults to the demo row in demo mode only. */
  added?: DiffTableAddedRow | null;
  /** Play the staged reveal. Defaults to true in demo, false with consumer rows. */
  autoplay?: boolean;
}

function useStage(steps: number[]) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (stage >= steps.length) return;
    const t = setTimeout(() => setStage((s) => s + 1), steps[stage]);
    return () => clearTimeout(t);
  }, [stage, steps]);
  return stage;
}

const STEPS = [800, 1000, 1000];
const NO_STEPS: number[] = [];

const ROWS: DiffTableRow[] = [
  { id: "Rocky Road", dept: "Classic", email: "aurora-scoops", removed: true },
  { id: "Bubblegum", dept: "Retro", email: "kumo-creamery", removed: true },
  { id: "Mint Chip", dept: "Classic", email: "maple-orbit", removed: false },
];

const ADDED: DiffTableAddedRow = { id: "Pistachio", dept: "Seasonal", email: "maple-orbit" };

const DOT: Record<string, string> = {
  Classic: "bg-accent",
  Retro: "bg-ink-3",
  Seasonal: "bg-orange",
};

export default function DiffTable({
  title = "Proposed menu cleanup",
  rows,
  added,
  autoplay,
}: DiffTableProps = {}) {
  const isDemo = rows === undefined;
  const data = rows ?? ROWS;
  const addedRow = added === undefined ? (isDemo ? ADDED : null) : added;
  const play = autoplay ?? isDemo;
  const stage = useStage(play ? STEPS : NO_STEPS);
  // stage 0-1 plain · 2 red tint · 3 completed diff
  const tinted = !play || stage >= 2;
  const shown = (!play || stage >= 3) && addedRow !== null;

  return (
    <div className="w-full max-w-95">
      <div className="relative overflow-hidden rounded-card bg-surface shadow-card">
        <div className="primitive-card-bar flex items-center justify-between border-b border-line">
          <span className="text-[12.5px] font-medium text-ink">{title}</span>
        </div>

        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[30%]" />
            <col className="w-[36%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line">
              {["Flavor", "Category", "Supplier"].map((h) => (
                <th key={h} className="primitive-table-cell text-[12px] font-medium text-ink-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const out = row.removed && tinted;
              return (
                <tr
                  key={row.id}
                  className="border-b border-line transition-colors duration-400 last:border-0 hover:bg-hover"
                  style={{ background: out ? "var(--red-tint)" : undefined }}
                >
                  <td
                    className="primitive-table-cell text-[13px] font-medium tabular-nums transition-colors duration-400"
                    style={{ color: out ? "var(--red)" : "var(--ink)" }}
                  >
                    {row.id}
                  </td>
                  <td className="primitive-table-cell">
                    <span
                      className="inline-flex h-5.5 items-center gap-1.5 rounded-full bg-inset px-2 text-[11.5px] font-medium shadow-hairline transition-opacity duration-400"
                      style={{ opacity: out ? 0.55 : 1 }}
                    >
                      <span className={`size-1.5 rounded-full ${DOT[row.dept] ?? "bg-ink-3"}`} />
                      <span className="text-ink-2">{row.dept}</span>
                    </span>
                  </td>
                  <td
                    className="primitive-table-cell text-[12.5px] whitespace-nowrap transition-colors duration-400"
                    style={{
                      color: out ? "var(--red)" : "var(--ink-2)",
                      textDecorationLine: out ? "line-through" : "none",
                      textDecorationColor: "color-mix(in srgb, var(--red) 50%, transparent)",
                    }}
                  >
                    {row.email}
                  </td>
                </tr>
              );
            })}
            {/* added row */}
            {addedRow !== null && (
              <tr>
                <td colSpan={3} className="p-0">
                  <div
                    className="grid transition-[grid-template-rows,opacity] duration-400"
                    style={{
                      gridTemplateRows: shown ? "1fr" : "0fr",
                      opacity: shown ? 1 : 0,
                      transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                  >
                    <div className="overflow-hidden" style={{ background: "var(--green-tint)" }}>
                      <div className="grid grid-cols-[34%_30%_36%] items-center border-t border-line">
                        <span className="primitive-table-cell text-[13px] font-medium text-green tabular-nums">
                          {addedRow.id}
                        </span>
                        <span className="primitive-table-cell">
                          <span className="inline-flex h-5.5 items-center gap-1.5 rounded-full bg-surface px-2 text-[11.5px] font-medium shadow-hairline">
                            <span className="size-1.5 rounded-full bg-green" />
                            <span className="text-ink-2">{addedRow.dept}</span>
                          </span>
                        </span>
                        <span className="primitive-table-cell text-[13px] text-green">
                          {addedRow.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
