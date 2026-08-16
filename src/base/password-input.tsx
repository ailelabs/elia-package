"use client";

import { useId, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * PASSWORD INPUT — reveal toggle, Caps Lock warning, and an
 * optional strength meter driven by explicit rules.
 *
 * Strength is scored on rules the user can SEE and act on,
 * not an opaque 0–4 from an entropy guess. A meter that says
 * "weak" without saying why is decoration.
 *
 * The reveal button is a real toggle with aria-pressed, and
 * the field never disables paste — blocking paste breaks
 * password managers and makes people pick worse passwords.
 * ───────────────────────────────────────────────────────── */

export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type" | "size"> {
  size?: "sm" | "md" | "lg";
  /** Shows the meter and, while focused, the rule checklist. */
  strength?: boolean;
  /** Overrides the default rule set. */
  rules?: PasswordRule[];
  /** Warns when Caps Lock is on. Default true. */
  capsWarning?: boolean;
  className?: string;
}

export const DEFAULT_PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: "At least 12 characters", test: (v) => v.length >= 12 },
  { id: "case", label: "Upper and lowercase", test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: "digit", label: "A number", test: (v) => /\d/.test(v) },
  { id: "symbol", label: "A symbol", test: (v) => /[^\w\s]/.test(v) },
];

const SIZES = {
  sm: "h-7 gap-1.5 px-2 text-[12.5px]",
  md: "h-8 gap-2 px-2.5 text-[13px]",
  lg: "h-9 gap-2 px-3 text-[13px]",
} as const;

const BANDS = [
  { label: "Too short", color: "var(--ink-3)" },
  { label: "Weak", color: "var(--red)" },
  { label: "Fair", color: "var(--orange)" },
  { label: "Good", color: "var(--accent)" },
  { label: "Strong", color: "var(--green)" },
];

export function PasswordInput({
  size = "md",
  strength,
  rules = DEFAULT_PASSWORD_RULES,
  capsWarning = true,
  className,
  value,
  onChange,
  ...props
}: PasswordInputProps) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const [caps, setCaps] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inner, setInner] = useState("");

  const text = String(value ?? inner);
  const passed = rules.filter((rule) => rule.test(text));
  const score = text ? passed.length : 0;
  const band = BANDS[Math.min(score, BANDS.length - 1)];

  return (
    <div className={cx("w-full", className)}>
      <div
        className={cx(
          "flex items-center rounded-control bg-field shadow-hairline",
          "transition-shadow duration-150 focus-within:shadow-[0_0_0_1px_var(--accent)]",
          "has-[:disabled]:pointer-events-none has-[:disabled]:opacity-40",
          SIZES[size],
        )}
      >
        <input
          type={shown ? "text" : "password"}
          autoComplete="current-password"
          aria-describedby={strength ? `${id}-strength` : undefined}
          value={value}
          onChange={(event) => {
            setInner(event.target.value);
            onChange?.(event);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setCaps(false);
          }}
          onKeyUp={(event) => capsWarning && setCaps(event.getModifierState?.("CapsLock") ?? false)}
          onKeyDown={(event) => capsWarning && setCaps(event.getModifierState?.("CapsLock") ?? false)}
          className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3"
          {...props}
        />

        {caps && (
          <span
            title="Caps Lock is on"
            className="flex shrink-0 items-center text-orange"
            style={{ animation: "fade-in 150ms ease-out both" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4l7 7h-4v4H9v-4H5l7-7zM9 19h6" />
            </svg>
            <span className="sr-only">Caps Lock is on</span>
          </span>
        )}

        <button
          type="button"
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          onClick={() => setShown(!shown)}
          className="flex size-5 shrink-0 items-center justify-center rounded-[5px] text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          {shown ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
              <path d="M9.4 5.2A9.5 9.5 0 0112 5c5 0 9 4.5 9 7a12 12 0 01-2.4 3.3M6.5 6.9C4.3 8.3 3 10.5 3 12c0 2.5 4 7 9 7a9.6 9.6 0 003.6-.7" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
              <circle cx="12" cy="12" r="2.6" />
            </svg>
          )}
        </button>
      </div>

      {strength && (
        <div id={`${id}-strength`}>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex flex-1 gap-1" aria-hidden="true">
              {rules.map((rule, i) => (
                <span
                  key={rule.id}
                  className="h-1 flex-1 rounded-full transition-colors duration-300"
                  style={{ background: i < score ? band.color : "var(--inset)" }}
                />
              ))}
            </div>
            <span className="w-14 shrink-0 text-right text-[11px] font-medium" style={{ color: band.color }}>
              {text ? band.label : ""}
            </span>
          </div>

          {/* the checklist only earns its space while typing */}
          <div
            className="grid transition-[grid-template-rows] duration-300"
            style={{
              gridTemplateRows: focused && text && score < rules.length ? "1fr" : "0fr",
              transitionTimingFunction: "var(--ease-out-strong)",
            }}
          >
            <div className="overflow-hidden">
              <ul className="mt-1.5 flex flex-col gap-0.5">
                {rules.map((rule) => {
                  const ok = rule.test(text);
                  return (
                    <li key={rule.id} className={cx("flex items-center gap-1.5 text-[11.5px]", ok ? "text-green" : "text-ink-3")}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {ok ? <path d="M20 6L9 17l-5-5" /> : <circle cx="12" cy="12" r="8" />}
                      </svg>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
