"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * DRAWER — a panel that slides in from an edge. Same native
 * <dialog> machinery as Dialog (so focus trapping, Esc and
 * inertness are the platform's job, not ours), but pinned to
 * a side and sized to the content it holds.
 *
 * Use it when the task is secondary but substantial: filters,
 * a record's detail, a mobile nav. A short confirmation is
 * still a Dialog.
 * ───────────────────────────────────────────────────────── */

export type DrawerSide = "right" | "left" | "bottom";

export interface DrawerProps
  extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose" | "title"> {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  /** Width for side drawers, height for bottom ones. */
  size?: number | string;
}

/* rounded-* pairs never overlap, so no order-dependent conflict */
const POSITION: Record<DrawerSide, string> = {
  right: "!mr-0 !ml-auto !my-0 h-dvh max-h-dvh rounded-l-card rounded-r-none",
  left: "!ml-0 !mr-auto !my-0 h-dvh max-h-dvh rounded-r-card rounded-l-none",
  bottom: "!mb-0 !mt-auto !mx-auto w-full max-w-none rounded-t-card rounded-b-none",
};

const ENTER: Record<DrawerSide, string> = {
  right: "drawer-in-right",
  left: "drawer-in-left",
  bottom: "drawer-in-bottom",
};

const EXIT: Record<DrawerSide, string> = {
  right: "drawer-out-right",
  left: "drawer-out-left",
  bottom: "drawer-out-bottom",
};

const EXIT_MS = 200;

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  description,
  footer,
  size = 380,
  children,
  className,
  ...rest
}: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  const [closing, setClosing] = useState(false);
  /* a click only counts as a backdrop dismiss if it BEGAN on the
     backdrop — otherwise the same click that opened the drawer
     completes over the backdrop and closes it again */
  const pressedBackdrop = useRef(false);

  /* layout effect: show before paint so the entry animation owns
     the first frame instead of the element appearing then moving */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      setClosing(false);
      if (!el.open) el.showModal();
      return;
    }
    if (!el.open) return;
    /* let the exit animation play before the element is torn down */
    setClosing(true);
    const timer = window.setTimeout(() => {
      el.close();
      setClosing(false);
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onPointerDown={(event) => {
        pressedBackdrop.current = event.target === ref.current;
      }}
      onClick={(event) => {
        const dismiss = event.target === ref.current && pressedBackdrop.current;
        pressedBackdrop.current = false;
        if (dismiss) onClose();
      }}
      className={cx(
        "elia-dialog flex flex-col overflow-hidden bg-surface p-0 text-ink shadow-overlay",
        POSITION[side],
        className,
      )}
      style={{
        ...(side === "bottom"
          ? { height: size, width: "100%", maxHeight: "90dvh" }
          : { width: size, maxWidth: "calc(100vw - 48px)" }),
        animation: closing
          ? `${EXIT[side]} ${EXIT_MS}ms var(--ease-out-strong) both`
          : open
            ? `${ENTER[side]} 260ms var(--ease-out-strong) both`
            : undefined,
      }}
      {...rest}
    >
      {(title || description) && (
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && (
              <h2 id={titleId} className="text-[13px] font-semibold text-ink">
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className="mt-0.5 text-[12px] text-ink-3">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-1.5 flex size-7 shrink-0 items-center justify-center rounded-[8px] text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-[12.5px] leading-relaxed text-ink-2">
        {children}
      </div>

      {footer && <div className="flex justify-end gap-2 border-t border-line px-4 py-3">{footer}</div>}
    </dialog>
  );
}
