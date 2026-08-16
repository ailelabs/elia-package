"use client";

import { createContext, useContext } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * TABLE — a real <table> in composable parts. The plain
 * counterpart to RecordsTable/FilterTable: no data layer,
 * no column defs, no virtualization. You bring the rows.
 *
 * `dense` and `sticky` ride a context so every cell picks
 * them up without threading props through each one. Sorting
 * is display-only: pass `sort`, handle `onSort` yourself.
 * ───────────────────────────────────────────────────────── */

export type TableSort = "asc" | "desc" | null;

interface TableContext {
  dense: boolean;
  sticky: boolean;
}
const Ctx = createContext<TableContext>({ dense: false, sticky: false });

export interface TableProps extends React.ComponentProps<"table"> {
  /** Shorter rows (h-8 instead of h-10). */
  dense?: boolean;
  /** Header sticks to the top of the scroll container. */
  sticky?: boolean;
  /** Wrapper className — the table itself is always full-width. */
  wrapperClassName?: string;
}

export function Table({ dense = false, sticky = false, className, wrapperClassName, ...rest }: TableProps) {
  return (
    <Ctx.Provider value={{ dense, sticky }}>
      <div className={cx("w-full overflow-x-auto rounded-card shadow-hairline", wrapperClassName)}>
        <table className={cx("w-full border-collapse text-left", className)} {...rest} />
      </div>
    </Ctx.Provider>
  );
}

export function TableHead({ className, ...rest }: React.ComponentProps<"thead">) {
  const { sticky } = useContext(Ctx);
  return (
    <thead
      className={cx("bg-inset", sticky && "sticky top-0 z-10", className)}
      {...rest}
    />
  );
}

export function TableBody({ className, ...rest }: React.ComponentProps<"tbody">) {
  return <tbody className={className} {...rest} />;
}

export function TableFoot({ className, ...rest }: React.ComponentProps<"tfoot">) {
  return <tfoot className={cx("bg-inset font-medium", className)} {...rest} />;
}

export interface TableRowProps extends React.ComponentProps<"tr"> {
  selected?: boolean;
}

export function TableRow({ selected, className, onClick, ...rest }: TableRowProps) {
  return (
    <tr
      aria-selected={selected}
      onClick={onClick}
      className={cx(
        "border-b border-line last:border-b-0 transition-colors duration-150",
        selected ? "bg-inset" : "hover:bg-hover",
        onClick && "cursor-pointer",
        className,
      )}
      {...rest}
    />
  );
}

type Align = "left" | "right" | "center";
const ALIGN: Record<Align, string> = { left: "text-left", right: "text-right", center: "text-center" };

export interface TableHeaderProps extends Omit<React.ComponentProps<"th">, "onClick"> {
  align?: Align;
  sortable?: boolean;
  sort?: TableSort;
  onSort?: () => void;
}

export function TableHeader({
  align = "left",
  sortable,
  sort = null,
  onSort,
  className,
  children,
  ...rest
}: TableHeaderProps) {
  const { dense } = useContext(Ctx);
  const label = (
    <span className={cx("flex items-center gap-1", align === "right" && "justify-end", align === "center" && "justify-center")}>
      {children}
      {sortable && (
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          className={cx("shrink-0 transition-[opacity,transform] duration-200", sort ? "opacity-100" : "opacity-0 group-hover:opacity-40")}
          style={{ transform: sort === "asc" ? "rotate(180deg)" : "rotate(0)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      )}
    </span>
  );

  return (
    <th
      scope="col"
      aria-sort={sortable ? (sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none") : undefined}
      className={cx(
        "border-b border-line px-3 text-[11.5px] font-medium whitespace-nowrap text-ink-3",
        dense ? "h-8" : "h-9",
        ALIGN[align],
        sortable && "group p-0",
        className,
      )}
      {...rest}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={cx(
            "flex h-full w-full items-center px-3 transition-colors duration-150 hover:text-ink",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
            align === "right" && "justify-end",
            align === "center" && "justify-center",
          )}
        >
          {label}
        </button>
      ) : (
        label
      )}
    </th>
  );
}

export interface TableCellProps extends React.ComponentProps<"td"> {
  align?: Align;
  /** Tabular figures — use for anything a reader scans down a column. */
  mono?: boolean;
  /** Drops the cell to the secondary ink. */
  muted?: boolean;
}

export function TableCell({ align = "left", mono, muted, className, ...rest }: TableCellProps) {
  const { dense } = useContext(Ctx);
  return (
    <td
      className={cx(
        "px-3 text-[12.5px]",
        dense ? "h-8" : "h-10",
        ALIGN[align],
        mono && "font-mono text-[11.5px] tabular-nums",
        muted ? "text-ink-3" : "text-ink",
        className,
      )}
      {...rest}
    />
  );
}

export function TableCaption({ className, ...rest }: React.ComponentProps<"caption">) {
  return <caption className={cx("px-3 py-2 text-left text-[11.5px] text-ink-3", className)} {...rest} />;
}
