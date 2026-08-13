import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * NAVBAR — the gallery header chrome as a component:
 * sticky, translucent page blur, hairline bottom border.
 * NavLink is a plain anchor — no router coupling; pass
 * `active` yourself (aria-current follows it).
 * ───────────────────────────────────────────────────────── */

export function Navbar({
  brand,
  actions,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  brand: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header
      className={cx("sticky top-0 z-20 border-b border-line bg-page/85 backdrop-blur", className)}
      {...props}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-5">
        {brand}
        {children && <nav className="flex items-center gap-4">{children}</nav>}
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function NavLink({
  active,
  className,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  active?: boolean;
}) {
  return (
    <a
      aria-current={active ? "page" : undefined}
      className={cx(
        "rounded-[4px] text-[13px] transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
        active ? "font-medium text-ink" : "text-ink-2 hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
