import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * ALERT — inline tone messaging, the stationary sibling of
 * toast(). Same four-tone vocabulary, so an alert and a
 * toast about the same event read as the same thing.
 * Tinted surface + an icon rail; danger announces itself,
 * everything else is a polite status.
 * ───────────────────────────────────────────────────────── */

export type AlertTone = "info" | "success" | "warn" | "danger";

export interface AlertProps extends Omit<React.ComponentProps<"div">, "title"> {
  tone?: AlertTone;
  title?: React.ReactNode;
  /** Replaces the tone's default glyph. */
  icon?: React.ReactNode;
  /** Buttons or links pinned to the bottom of the message. */
  action?: React.ReactNode;
  onDismiss?: () => void;
}

const TONES: Record<AlertTone, { surface: string; mark: string; path: React.ReactNode }> = {
  info: {
    surface: "bg-accent-tint",
    mark: "text-accent",
    path: <path d="M12 16v-5M12 8h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />,
  },
  success: {
    surface: "bg-green-tint",
    mark: "text-green",
    path: <path d="M12 3a9 9 0 100 18 9 9 0 000-18zM8 12.5l2.5 2.5L16 9.5" />,
  },
  warn: {
    surface: "bg-orange-tint",
    mark: "text-orange",
    path: <path d="M12 9v4m0 3h.01M10.3 3.9L2.4 17a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />,
  },
  danger: {
    surface: "bg-red-tint",
    mark: "text-red",
    path: <path d="M12 8v5m0 3h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />,
  },
};

export function Alert({
  tone = "info",
  title,
  icon,
  action,
  onDismiss,
  className,
  children,
  ...rest
}: AlertProps) {
  const { surface, mark, path } = TONES[tone];

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cx("flex gap-2.5 rounded-card p-3 shadow-hairline", surface, className)}
      {...rest}
    >
      <span className={cx("mt-px flex size-4 shrink-0 items-center justify-center", mark)}>
        {icon ?? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {path}
          </svg>
        )}
      </span>

      <div className="min-w-0 flex-1">
        {title && <p className="text-[13px] font-semibold text-ink">{title}</p>}
        {children && (
          <div className={cx("text-[12.5px] leading-relaxed text-ink-2", !!title && "mt-0.5")}>{children}</div>
        )}
        {action && <div className="mt-2 flex flex-wrap items-center gap-1.5">{action}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="-mt-0.5 -mr-0.5 flex size-6 shrink-0 items-center justify-center rounded-[6px] text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
