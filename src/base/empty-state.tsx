import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * EMPTY STATE — the search primitive's no-results block as
 * a slot: icon tile, title, description, optional action.
 * ───────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cx("flex flex-col items-center justify-center gap-1 px-4 py-8 text-center", className)}
      style={{ animation: "fade-in 250ms ease-out both" }}
      {...props}
    >
      {icon && (
        <span className="mb-1.5 flex size-8 items-center justify-center rounded-control bg-inset text-ink-3 shadow-hairline">
          {icon}
        </span>
      )}
      <span className="text-[13px] font-medium text-ink">{title}</span>
      {description && <span className="text-[12px] text-ink-3">{description}</span>}
      {action && <span className="mt-2.5">{action}</span>}
    </div>
  );
}
