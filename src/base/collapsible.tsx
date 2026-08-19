"use client";

import { useId, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * COLLAPSIBLE — a single standalone disclosure. The same
 * grid 0fr→1fr grammar as the accordion, without the group
 * semantics; use it anywhere one section folds on its own.
 * ───────────────────────────────────────────────────────── */

export interface CollapsibleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  defaultOpen?: boolean;
  /** Controlled open state; pair with onOpenChange. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Collapsible({
  title,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  children,
  ...props
}: CollapsibleProps) {
  const id = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const toggle = () => {
    setUncontrolledOpen(!open);
    onOpenChange?.(!open);
  };

  return (
    <div className={cx("rounded-card bg-surface shadow-hairline", className)} {...props}>
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={toggle}
        className="flex h-9 w-full items-center gap-2 rounded-card px-3 text-left
          transition-colors duration-100 hover:bg-hover
          focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{title}</span>
        <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center text-ink-3">
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            className="transition-transform duration-300"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={id}
        className="grid transition-[grid-template-rows,opacity] duration-400"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transitionTimingFunction: "var(--ease-out-strong)",
        }}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 text-[12.5px] leading-relaxed text-ink-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
