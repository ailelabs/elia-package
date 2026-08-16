"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * DIALOG — native <dialog>, controlled: showModal()/close()
 * sync to the `open` prop; Esc (native cancel) and backdrop
 * click both route through onClose. Backdrop styling lives
 * in elia.css under the .elia-dialog class.
 * ───────────────────────────────────────────────────────── */

export type DialogProps = Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose" | "title"> & {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
  /** Drops the header, padding and close button — the shell only. */
  bare?: boolean;
};

export function Dialog({ open, onClose, title, footer, width = 400, bare, children, className, ...rest }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  /* a dismiss must BEGIN on the backdrop: otherwise the very click
     that opened the dialog completes over the backdrop and shuts it,
     and a drag that starts inside and releases outside does too */
  const pressedBackdrop = useRef(false);

  /* layout effect: show before paint so the entry animation owns
     the first frame instead of the element appearing then moving */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={title ? titleId : undefined}
      onClose={onClose}
      onPointerDown={(event) => {
        /* only the backdrop is the dialog element itself */
        pressedBackdrop.current = event.target === ref.current;
      }}
      onClick={(event) => {
        const dismiss = event.target === ref.current && pressedBackdrop.current;
        pressedBackdrop.current = false;
        if (dismiss) onClose();
      }}
      className={cx("elia-dialog rounded-card bg-surface p-0 text-ink shadow-overlay", className)}
      style={{ width, maxWidth: "calc(100vw - 32px)", animation: open ? "pop-in 200ms cubic-bezier(0.23,1,0.32,1) both" : undefined }}
      {...rest}
    >
      {bare ? (
        children
      ) : (
        <>
      <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-1">
        <span id={titleId} className="text-[13px] font-semibold text-ink">{title}</span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="-mr-1.5 flex size-7 shrink-0 items-center justify-center rounded-[8px] text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="px-4 py-2 text-[12.5px] leading-relaxed text-ink-2">{children}</div>
      {footer && <div className="flex justify-end gap-2 px-4 pt-1 pb-4">{footer}</div>}
        </>
      )}
    </dialog>
  );
}
