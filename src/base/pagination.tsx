"use client";

import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * PAGINATION — page numbers with an elided middle. The
 * window always shows the first page, the last page, and a
 * run around the current one, so the control never changes
 * width as you walk through it.
 *
 * Page numbers are 1-based here because they are shown to a
 * reader; convert at the data layer, not in the UI.
 * ───────────────────────────────────────────────────────── */

export interface PaginationProps extends Omit<React.ComponentProps<"nav">, "onChange"> {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  /** Page buttons either side of the current one. */
  siblings?: number;
  /** Adds a "1–20 of 340" readout on the left. */
  summary?: React.ReactNode;
}

const ELLIPSIS = "…";

/* first · [gap] · window · [gap] · last */
function pageWindow(page: number, count: number, siblings: number): (number | string)[] {
  const span = siblings * 2 + 5;
  if (count <= span) return Array.from({ length: count }, (_, i) => i + 1);

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, count);
  const showLeftGap = left > 2;
  const showRightGap = right < count - 1;

  if (!showLeftGap && showRightGap) {
    return [...Array.from({ length: span - 2 }, (_, i) => i + 1), ELLIPSIS, count];
  }
  if (showLeftGap && !showRightGap) {
    return [1, ELLIPSIS, ...Array.from({ length: span - 2 }, (_, i) => count - (span - 3) + i)];
  }
  return [1, ELLIPSIS, ...Array.from({ length: right - left + 1 }, (_, i) => left + i), ELLIPSIS, count];
}

const ARROW = "M15 18l-6-6 6-6";

export function Pagination({
  page,
  pageCount,
  onChange,
  siblings = 1,
  summary,
  className,
  ...rest
}: PaginationProps) {
  if (pageCount <= 1 && !summary) return null;
  const pages = pageWindow(page, pageCount, siblings);

  const step = (delta: number) => onChange(Math.max(1, Math.min(pageCount, page + delta)));

  const arrow = (dir: -1 | 1, label: string) => (
    <button
      type="button"
      aria-label={label}
      disabled={dir === -1 ? page <= 1 : page >= pageCount}
      onClick={() => step(dir)}
      className="flex size-7 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover-2 hover:text-ink enabled:active:scale-[0.94] disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === 1 ? "rotate(180deg)" : undefined }}>
        <path d={ARROW} />
      </svg>
    </button>
  );

  return (
    <nav
      aria-label="Pagination"
      className={cx("flex items-center justify-between gap-3", className)}
      {...rest}
    >
      {summary ? <p className="text-[11.5px] text-ink-3">{summary}</p> : <span />}

      <div className="flex items-center gap-0.5">
        {arrow(-1, "Previous page")}

        {pages.map((entry, i) =>
          typeof entry === "string" ? (
            <span key={`gap-${i}`} className="flex size-7 items-center justify-center text-[12px] text-ink-3">
              {ELLIPSIS}
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              aria-label={`Page ${entry}`}
              aria-current={entry === page ? "page" : undefined}
              onClick={() => onChange(entry)}
              className={cx(
                "flex h-7 min-w-7 items-center justify-center rounded-control px-1.5 text-[12.5px] tabular-nums transition-colors duration-150",
                "active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                entry === page
                  ? "bg-ink font-medium text-canvas shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                  : "text-ink-2 hover:bg-hover-2 hover:text-ink",
              )}
            >
              {entry}
            </button>
          ),
        )}

        {arrow(1, "Next page")}
      </div>
    </nav>
  );
}
