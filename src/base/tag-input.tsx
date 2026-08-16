"use client";

import { useRef, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * TAG INPUT — free-text chips. Enter and comma commit,
 * Backspace on an empty field removes the last chip, and
 * pasting a comma- or newline-separated list adds all of it
 * at once (the paste case is how real data actually arrives).
 *
 * Duplicates are rejected silently rather than erroring:
 * the user's intent — "this tag should be present" — is
 * already satisfied.
 * ───────────────────────────────────────────────────────── */

export interface TagInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "size"> {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** Refuse tags past this count. */
  max?: number;
  /** Return false to reject a tag (e.g. an email check). */
  validate?: (tag: string) => boolean;
  size?: "sm" | "md";
  className?: string;
}

const SPLIT = /[,\n\t]/;

export function TagInput({
  value,
  onChange,
  placeholder = "Add a tag…",
  max,
  validate,
  size = "md",
  className,
  disabled,
  ...props
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const parts = raw
      .split(SPLIT)
      .map((part) => part.trim())
      .filter(Boolean);
    if (!parts.length) return;

    const next = [...value];
    let rejected = false;
    for (const part of parts) {
      if (max !== undefined && next.length >= max) break;
      if (next.includes(part)) continue;
      if (validate && !validate(part)) {
        rejected = true;
        continue;
      }
      next.push(part);
    }
    setInvalid(rejected);
    if (next.length !== value.length) onChange(next);
  };

  const remove = (tag: string) => onChange(value.filter((item) => item !== tag));

  const full = max !== undefined && value.length >= max;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={cx(
        "flex w-full flex-wrap items-center gap-1 rounded-control bg-inset px-1.5 py-1.5 shadow-hairline",
        "transition-shadow duration-200 focus-within:shadow-[0_0_0_1px_var(--accent)]",
        invalid && "shadow-[0_0_0_1px_var(--red)]",
        disabled && "pointer-events-none opacity-40",
        size === "sm" ? "min-h-7 text-[12.5px]" : "min-h-8 text-[13px]",
        className,
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex h-5.5 items-center gap-1 rounded-chip bg-surface pr-1 pl-1.5 text-[11.5px] font-medium text-ink shadow-hairline"
          style={{ animation: "pop-in 160ms var(--ease-out-strong) both" }}
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={(event) => {
              event.stopPropagation();
              remove(tag);
            }}
            className="flex size-3.5 items-center justify-center rounded-[4px] text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        value={draft}
        disabled={disabled}
        placeholder={full ? `Limit of ${max} reached` : value.length ? "" : placeholder}
        onChange={(event) => {
          setInvalid(false);
          /* a typed separator commits rather than entering the field */
          if (SPLIT.test(event.target.value)) {
            add(event.target.value);
            setDraft("");
          } else {
            setDraft(event.target.value);
          }
        }}
        onPaste={(event) => {
          const text = event.clipboardData.getData("text");
          if (!SPLIT.test(text)) return;
          event.preventDefault();
          add(text);
          setDraft("");
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            add(draft);
            setDraft("");
          } else if (event.key === "Backspace" && !draft && value.length) {
            remove(value[value.length - 1]);
          }
        }}
        onBlur={() => {
          if (draft.trim()) {
            add(draft);
            setDraft("");
          }
        }}
        className="h-5.5 min-w-24 flex-1 bg-transparent px-1 text-ink outline-none placeholder:text-ink-3"
        {...props}
      />
    </div>
  );
}
