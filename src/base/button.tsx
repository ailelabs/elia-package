import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import { Spinner } from "./spinner";

/* ─────────────────────────────────────────────────────────
 * BUTTON
 * The workhorse control. Filled variants carry the inset
 * top highlight; loading swaps the icon slot for a spinner
 * and disables the control. IconButton is the square,
 * label-free sibling (aria-label required).
 * ───────────────────────────────────────────────────────── */

type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-ink text-canvas shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
  accent: "bg-accent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
  secondary: "bg-surface text-ink shadow-btn hover:bg-hover",
  ghost: "text-ink-2 hover:bg-hover hover:text-ink",
  danger: "bg-red text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-7 gap-1.5 px-2.5 text-[12.5px]",
  md: "h-8 gap-1.5 px-3 text-[13px]",
  lg: "h-9 gap-2 px-3.5 text-[13px]",
};

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** icon slot rendered before the label; replaced by the spinner while loading */
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex items-center justify-center rounded-control font-medium",
        "transition-[background-color,color,transform] duration-150 active:scale-[0.96]",
        "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
        "disabled:pointer-events-none disabled:opacity-40",
        SIZE[size],
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {loading ? (
        /* system ring on currentColor so it reads on filled and resting variants alike */
        <Spinner
          size={13}
          style={{
            borderColor: "color-mix(in srgb, currentColor 30%, transparent)",
            borderTopColor: "currentColor",
          }}
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

const ICON_VARIANT: Record<"ghost" | "secondary", string> = {
  ghost: "text-ink-3 hover:bg-hover hover:text-ink",
  secondary: "bg-surface text-ink-2 shadow-btn hover:bg-hover hover:text-ink",
};

const ICON_SIZE: Record<ButtonSize, string> = {
  sm: "size-7",
  md: "size-8",
  lg: "size-9",
};

export interface IconButtonProps extends ComponentProps<"button"> {
  "aria-label": string;
  variant?: "ghost" | "secondary";
  size?: ButtonSize;
  /** children = the icon (13–16px, 24-grid stroke) */
  children: ReactNode;
}

export function IconButton({
  variant = "ghost",
  size = "md",
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex items-center justify-center rounded-control",
        "transition-[background-color,color,transform] duration-150 enabled:active:scale-[0.94]",
        "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
        "disabled:pointer-events-none disabled:opacity-40",
        ICON_SIZE[size],
        ICON_VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
