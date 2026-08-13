import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * SKELETON — sunken placeholder block with a shimmer sweep.
 * The sweep is an overlay span riding the shared
 * shimmer-text keyframes (background-position, GPU-cheap).
 * ───────────────────────────────────────────────────────── */

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cx("relative h-3 overflow-hidden rounded-[6px] bg-inset", className)}
      {...props}
    >
      <span
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 35%, var(--surface) 50%, transparent 65%)",
          backgroundSize: "200% 100%",
          animation: "shimmer-text 1.4s linear infinite",
        }}
      />
    </div>
  );
}
