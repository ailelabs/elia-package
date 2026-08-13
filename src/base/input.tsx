"use client";

import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * INPUT — sunken text fields.
 * Input: single-line row with optional leading icon and a
 * clear action that works controlled and uncontrolled.
 * Textarea: the same surface, multi-line. Focus ring via
 * focus-within so the whole row lights up, not the input.
 * ───────────────────────────────────────────────────────── */

type InputProps = Omit<ComponentProps<"input">, "size"> & {
  size?: "sm" | "md";
  icon?: ReactNode;
  clearable?: boolean;
};

export function Input({
  size = "md",
  icon,
  clearable,
  className,
  ref,
  onChange,
  ...rest
}: InputProps) {
  const innerRef = useRef<HTMLInputElement>(null);
  const [inner, setInner] = useState(String(rest.defaultValue ?? ""));
  const filled = String(rest.value ?? inner).length > 0;

  const clear = () => {
    const el = innerRef.current;
    if (!el) return;
    /* native setter so React's onChange fires — clears controlled and uncontrolled alike */
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(el, "");
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();
  };

  return (
    <div
      className={cx(
        "flex items-center rounded-control bg-field shadow-hairline",
        "transition-shadow duration-150 focus-within:shadow-[0_0_0_1px_var(--accent)]",
        "has-[:disabled]:pointer-events-none has-[:disabled]:opacity-40",
        size === "sm" ? "h-7 gap-1.5 px-2" : "h-8 gap-2 px-2.5",
        className,
      )}
    >
      {icon && (
        <span aria-hidden className="flex shrink-0 items-center justify-center text-ink-3">
          {icon}
        </span>
      )}
      <input
        ref={(el) => {
          innerRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        onChange={(event) => {
          setInner(event.target.value);
          onChange?.(event);
        }}
        className={cx(
          "min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3",
          size === "sm" ? "text-[12.5px]" : "text-[13px]",
        )}
        {...rest}
      />
      {clearable && filled && (
        <button
          type="button"
          aria-label="Clear"
          onClick={clear}
          className="flex size-5 shrink-0 items-center justify-center rounded-full text-ink-3
            transition-[background-color,color,transform] duration-100 hover:bg-line/70 hover:text-ink
            active:scale-[0.94]
            focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          style={{ animation: "fade-in 150ms ease-out both" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

type TextareaProps = ComponentProps<"textarea">;

export function Textarea({ className, ...rest }: TextareaProps) {
  return (
    <textarea
      className={cx(
        "min-h-16 w-full resize-none rounded-control bg-field px-2.5 py-2 text-[13px]",
        "text-ink shadow-hairline outline-none transition-shadow duration-150",
        "placeholder:text-ink-3 focus:shadow-[0_0_0_1px_var(--accent)]",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...rest}
    />
  );
}
