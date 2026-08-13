import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * CHIP
 * The prompt-bar attachment look — sunken field pill with
 * an optional icon and dismiss ×. Pops in on mount.
 * ───────────────────────────────────────────────────────── */

export type ChipProps = React.ComponentProps<"span"> & {
  icon?: React.ReactNode;
  onDismiss?: () => void;
};

export function Chip({ icon, onDismiss, className, style, children, ...rest }: ChipProps) {
  return (
    <span
      className={cx(
        "inline-flex h-6.5 items-center gap-1.5 rounded-chip bg-field text-[11.5px] text-ink-2 shadow-hairline",
        icon ? "pl-1.5" : "pl-2",
        onDismiss ? "pr-1" : "pr-2",
        className,
      )}
      style={{ animation: "pop-in 200ms cubic-bezier(0.23,1,0.32,1) both", ...style }}
      {...rest}
    >
      {icon && <span className="flex shrink-0 items-center justify-center text-ink-3">{icon}</span>}
      <span className="max-w-36 truncate">{children}</span>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="flex size-4 shrink-0 items-center justify-center rounded-[4px] text-ink-3
            transition-[background-color,color,transform] duration-100 hover:bg-line/70 hover:text-ink
            active:scale-[0.94]
            focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
