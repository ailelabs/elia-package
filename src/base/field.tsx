import {
  cloneElement,
  useId,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * FIELD — label + control + hint/error wiring.
 * Clones its child with a generated id and aria-describedby
 * so label, control, and message are announced together.
 * Error replaces hint and is a live alert.
 * ───────────────────────────────────────────────────────── */

type FieldControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

type FieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactElement<FieldControlProps>;
};

export function Field({ label, hint, error, children, className, ...rest }: FieldProps) {
  const id = useId();
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cx("flex flex-col gap-1.5", className)} {...rest}>
      <label htmlFor={id} className="text-[12px] font-medium text-ink-2">
        {label}
      </label>
      {cloneElement(children, {
        id,
        "aria-describedby": messageId,
        "aria-invalid": error ? true : undefined,
      })}
      {error ? (
        <p id={messageId} role="alert" className="text-[11.5px] text-red">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-[11.5px] text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
