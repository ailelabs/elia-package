import { Children } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * AVATAR
 * Initials on a sunken field, or an image when `src` is
 * given. AvatarGroup overlaps with a surface ring and
 * folds the overflow into a +N bubble.
 * ───────────────────────────────────────────────────────── */

const SIZES = {
  sm: "size-6 text-[9.5px]",
  md: "size-7 text-[10.5px]",
  lg: "size-8 text-[11.5px]",
} as const;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

export type AvatarProps = React.ComponentProps<"span"> & {
  name: string;
  src?: string;
  size?: keyof typeof SIZES;
};

export function Avatar({ name, src, size = "md", className, ...rest }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cx(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-field font-semibold text-ink-2",
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : initials(name)}
    </span>
  );
}

export type AvatarGroupProps = React.ComponentProps<"div"> & {
  max?: number;
  size?: keyof typeof SIZES;
};

export function AvatarGroup({ max = 3, size = "md", className, children, ...rest }: AvatarGroupProps) {
  const items = Children.toArray(children);
  const extra = items.length - max;
  return (
    <div
      className={cx("flex items-center -space-x-1 *:shadow-[0_0_0_1.5px_var(--surface)]", className)}
      {...rest}
    >
      {items.slice(0, max)}
      {extra > 0 && (
        <span
          className={cx(
            "inline-flex shrink-0 items-center justify-center rounded-full bg-field font-semibold text-ink-2 tabular-nums",
            SIZES[size],
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
