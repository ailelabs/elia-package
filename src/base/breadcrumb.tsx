import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * BREADCRUMB — the trail back up. The last crumb is the
 * current page: it renders as text with aria-current, never
 * as a link to where you already are.
 *
 * Long trails collapse in the middle rather than wrapping,
 * because the first and last crumbs carry the orientation.
 * ───────────────────────────────────────────────────────── */

export interface Crumb {
  label: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps extends Omit<React.ComponentProps<"nav">, "children"> {
  items: Crumb[];
  /** Collapse the middle once the trail is longer than this. */
  maxItems?: number;
  separator?: React.ReactNode;
}

const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export function Breadcrumb({ items, maxItems = 4, separator, className, ...rest }: BreadcrumbProps) {
  const collapsed =
    items.length > maxItems
      ? [items[0], { label: "…" } as Crumb, ...items.slice(items.length - (maxItems - 2))]
      : items;

  return (
    <nav aria-label="Breadcrumb" className={cx("min-w-0", className)} {...rest}>
      <ol className="flex min-w-0 items-center gap-1">
        {collapsed.map((item, i) => {
          const last = i === collapsed.length - 1;
          const interactive = !last && (item.href || item.onClick);

          return (
            <li key={i} className="flex min-w-0 items-center gap-1">
              {interactive ? (
                <a
                  href={item.href}
                  onClick={
                    item.onClick
                      ? (event) => {
                          if (!item.href) event.preventDefault();
                          item.onClick?.();
                        }
                      : undefined
                  }
                  className="truncate rounded-[5px] px-1 py-0.5 text-[12.5px] text-ink-3 transition-colors duration-150 hover:bg-hover-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cx("truncate px-1 py-0.5 text-[12.5px]", last ? "font-medium text-ink" : "text-ink-3")}
                >
                  {item.label}
                </span>
              )}
              {!last && <span className="shrink-0 text-ink-3">{separator ?? <Chevron />}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
