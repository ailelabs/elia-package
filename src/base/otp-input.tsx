"use client";

import { useRef, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * OTP INPUT — one box per character for a verification code.
 *
 * The whole point is paste: codes arrive by SMS or email and
 * people paste them. Pasting into any box fills the whole
 * field and lands focus on the first gap, and the browser's
 * one-time-code autofill is wired up rather than fought.
 *
 * Backspace on an empty box steps back and clears the one
 * before it, which is what everybody expects and almost
 * nobody implements.
 * ───────────────────────────────────────────────────────── */

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  /** Fires when the last box is filled. */
  onComplete?: (value: string) => void;
  /** Digits only by default; set for alphanumeric codes. */
  mode?: "numeric" | "alphanumeric";
  /** Renders a gap after this many boxes, e.g. 3 → 123-456. */
  groupAfter?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const SIZES = {
  sm: "size-8 text-[13px]",
  md: "size-10 text-[15px]",
  lg: "size-12 text-[17px]",
} as const;

export function OtpInput({
  value,
  onChange,
  length = 6,
  onComplete,
  mode = "numeric",
  groupAfter,
  size = "md",
  disabled,
  invalid,
  autoFocus,
  className,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(null);

  const allowed = mode === "numeric" ? /[^0-9]/g : /[^0-9a-zA-Z]/g;
  const chars = value.slice(0, length).split("");

  const focus = (index: number) => refs.current[Math.max(0, Math.min(length - 1, index))]?.focus();

  const write = (next: string) => {
    const clean = next.replace(allowed, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
    return clean;
  };

  const setAt = (index: number, char: string) => {
    const filled = value.padEnd(length, " ").split("");
    filled[index] = char;
    return write(filled.join("").trimEnd());
  };

  return (
    <div
      className={cx("flex items-center gap-1.5", className)}
      role="group"
      aria-label={`${length}-character verification code`}
    >
      {Array.from({ length }, (_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode={mode === "numeric" ? "numeric" : "text"}
            /* the first box carries the autofill hint for the whole code */
            autoComplete={i === 0 ? "one-time-code" : "off"}
            autoFocus={autoFocus && i === 0}
            maxLength={1}
            disabled={disabled}
            aria-label={`Character ${i + 1}`}
            aria-invalid={invalid || undefined}
            value={chars[i] ?? ""}
            onFocus={(event) => {
              setFocused(i);
              event.target.select();
            }}
            onBlur={() => setFocused(null)}
            onChange={(event) => {
              const typed = event.target.value.replace(allowed, "");
              if (!typed) return;
              /* a multi-character drop lands as one change event */
              if (typed.length > 1) {
                const merged = write(value.slice(0, i) + typed);
                focus(Math.min(merged.length, length - 1));
                return;
              }
              setAt(i, typed);
              if (i < length - 1) focus(i + 1);
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace") {
                event.preventDefault();
                if (chars[i]) setAt(i, " ");
                else if (i > 0) {
                  setAt(i - 1, " ");
                  focus(i - 1);
                }
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                focus(i - 1);
              } else if (event.key === "ArrowRight") {
                event.preventDefault();
                focus(i + 1);
              }
            }}
            onPaste={(event) => {
              event.preventDefault();
              const merged = write(event.clipboardData.getData("text"));
              focus(Math.min(merged.length, length - 1));
            }}
            className={cx(
              "rounded-control bg-field text-center font-mono tabular-nums text-ink shadow-hairline",
              "transition-[box-shadow,transform] duration-150 outline-none",
              "disabled:pointer-events-none disabled:opacity-40",
              SIZES[size],
              invalid
                ? "shadow-[0_0_0_1px_var(--red)]"
                : focused === i
                  ? "shadow-[0_0_0_1px_var(--accent)]"
                  : undefined,
            )}
          />
          {groupAfter && (i + 1) % groupAfter === 0 && i < length - 1 && (
            <span aria-hidden="true" className="h-px w-2 rounded-full bg-line-strong" />
          )}
        </div>
      ))}
    </div>
  );
}
