"use client";

import { createContext, useContext, useId, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * ACCORDION — disclosure rows separated by hairlines.
 * Single mode closes siblings; expansion uses the grid
 * 0fr→1fr trick (never animate height).
 * ───────────────────────────────────────────────────────── */

type AccordionContextValue = {
  openKeys: string[];
  toggle: (key: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

type AccordionProps = React.HTMLAttributes<HTMLDivElement> & {
  type?: "single" | "multiple";
};

export function Accordion({ type = "single", className, children, ...props }: AccordionProps) {
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const toggle = (key: string) =>
    setOpenKeys((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : type === "single"
          ? [key]
          : [...current, key],
    );
  return (
    <AccordionContext.Provider value={{ openKeys, toggle }}>
      <div className={cx("flex flex-col", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

type AccordionItemProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  title: React.ReactNode;
};

export function AccordionItem({ title, className, children, ...props }: AccordionItemProps) {
  const id = useId();
  const context = useContext(AccordionContext);
  const open = context?.openKeys.includes(id) ?? false;

  return (
    <div className={cx("border-b border-line last:border-0", className)} {...props}>
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => context?.toggle(id)}
        className="flex h-11 w-full items-center gap-2.5 px-2.5 text-left
          transition-colors duration-100 hover:bg-inset
          focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{title}</span>
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-ink-3"
        >
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            className="transition-transform duration-300"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {/* dropdown panel — same expandable grammar as the task rows */}
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
          <div className="px-2.5 pb-3 text-[12.5px] leading-relaxed text-ink-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
