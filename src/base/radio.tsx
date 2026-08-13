"use client";

import { createContext, useContext, useId } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * RADIO — the approval-card radio dot as a real form control.
 * RadioGroup owns value/onChange and shares them via context;
 * each Radio is a visually hidden native <input type="radio">
 * behind the rounded dot (inner dot scales in when selected).
 * ───────────────────────────────────────────────────────── */

const RadioContext = createContext<{
  value: string;
  onChange: (value: string) => void;
  name: string;
} | null>(null);

export interface RadioGroupProps
  extends Omit<React.ComponentProps<"div">, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  name?: string;
}

export function RadioGroup({ value, onChange, name, className, children, ...props }: RadioGroupProps) {
  const autoName = useId();
  return (
    <div role="radiogroup" className={cx("flex flex-col gap-0.5", className)} {...props}>
      <RadioContext.Provider value={{ value, onChange, name: name ?? autoName }}>
        {children}
      </RadioContext.Provider>
    </div>
  );
}

export interface RadioProps
  extends Omit<React.ComponentProps<"input">, "type" | "size" | "value" | "onChange"> {
  value: string;
  label: string;
}

export function Radio({ value, label, className, ...props }: RadioProps) {
  const group = useContext(RadioContext);
  const on = group?.value === value;
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer items-center gap-2 has-[:disabled]:pointer-events-none has-[:disabled]:opacity-40",
        className,
      )}
    >
      <input
        type="radio"
        className="peer sr-only"
        name={group?.name}
        value={value}
        checked={on}
        onChange={() => group?.onChange(value)}
        {...props}
      />
      <span
        aria-hidden="true"
        className={cx(
          "flex size-4 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
          on ? "bg-ink" : "shadow-[inset_0_0_0_1.5px_var(--line-strong)]",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-accent peer-focus-visible:outline-offset-2",
        )}
      >
        <span
          className="size-1.5 rounded-full bg-canvas transition-transform duration-200"
          style={{ transform: on ? "scale(1)" : "scale(0)" }}
        />
      </span>
      <span className={cx("text-[13px] transition-colors duration-200", on ? "text-ink" : "text-ink-2")}>
        {label}
      </span>
    </label>
  );
}
