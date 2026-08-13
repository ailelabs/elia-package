import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * CARD — the surface container primitives share.
 * Header bar, padded body, inset footer; each slice optional.
 * ───────────────────────────────────────────────────────── */

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("overflow-hidden rounded-card bg-surface shadow-card", className)}
      {...props}
    />
  );
}

type CardHeaderProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: React.ReactNode;
  actions?: React.ReactNode;
};

export function CardHeader({ title, actions, className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cx("primitive-card-bar flex items-center gap-2.5 border-b border-line", className)}
      {...props}
    >
      {title != null && (
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{title}</span>
      )}
      {children}
      {actions != null && (
        <span className="ml-auto flex shrink-0 items-center gap-1">{actions}</span>
      )}
    </div>
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("primitive-card-pad", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "primitive-card-footer flex items-center gap-2 border-t border-line bg-inset",
        className,
      )}
      {...props}
    />
  );
}
