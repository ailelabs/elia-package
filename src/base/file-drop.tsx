"use client";

import { useRef, useState } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * FILE DROP — a drop zone wrapped around a real <input
 * type="file">, so clicking, keyboard activation and the OS
 * picker all come free; the drag layer is the only part we
 * add.
 *
 * Rejected files are reported rather than dropped in silence
 * — a file that vanishes with no explanation is the worst
 * outcome of an upload control.
 * ───────────────────────────────────────────────────────── */

export interface FileRejection {
  file: File;
  reason: "type" | "size" | "count";
}

export interface FileDropProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "type" | "value" | "size"> {
  onFiles: (files: File[]) => void;
  onReject?: (rejections: FileRejection[]) => void;
  /** e.g. "image/*,.pdf" — matched against type and extension. */
  accept?: string;
  multiple?: boolean;
  /** Bytes. */
  maxSize?: number;
  maxFiles?: number;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

/* accept matches a MIME type, a wildcard family, or an extension */
function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  return accept.split(",").some((rule) => {
    const token = rule.trim().toLowerCase();
    if (!token) return false;
    if (token.startsWith(".")) return file.name.toLowerCase().endsWith(token);
    if (token.endsWith("/*")) return file.type.startsWith(token.slice(0, -1));
    return file.type.toLowerCase() === token;
  });
}

export function FileDrop({
  onFiles,
  onReject,
  accept,
  multiple,
  maxSize,
  maxFiles,
  label = "Drop files here or click to browse",
  hint,
  className,
  disabled,
  ...props
}: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  /* dragenter/leave fire per child element; count them so the
     highlight doesn't flicker as the cursor crosses the label */
  const depth = useRef(0);

  const intake = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];

    for (const file of incoming) {
      if (!matchesAccept(file, accept)) rejected.push({ file, reason: "type" });
      else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: "size" });
      else if (maxFiles !== undefined && accepted.length >= maxFiles) rejected.push({ file, reason: "count" });
      else accepted.push(file);
    }

    if (accepted.length) onFiles(multiple ? accepted : accepted.slice(0, 1));
    if (rejected.length) onReject?.(rejected);
  };

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        depth.current++;
        setOver(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        depth.current = 0;
        setOver(false);
        if (!disabled) intake(event.dataTransfer.files);
      }}
      className={cx(
        "relative flex flex-col items-center justify-center gap-1.5 rounded-card border border-dashed px-4 py-7 text-center transition-colors duration-150",
        over ? "border-accent bg-accent-tint" : "border-line-strong bg-inset hover:bg-hover",
        disabled && "pointer-events-none opacity-40",
        "focus-within:outline-2 focus-within:outline-accent focus-within:outline-offset-2",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          intake(event.target.files);
          /* reset so picking the same file twice still fires */
          event.target.value = "";
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
        {...props}
      />

      <span className={cx("transition-colors duration-150", over ? "text-accent" : "text-ink-3")}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
          <path d="M20 16v2.5a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5V16" />
        </svg>
      </span>

      <p className="text-[12.5px] font-medium text-ink">{label}</p>

      {(hint || accept || maxSize) && (
        <p className="text-[11.5px] text-ink-3">
          {hint ??
            [accept && accept.replace(/,/g, ", "), maxSize && `up to ${formatBytes(maxSize)}`]
              .filter(Boolean)
              .join(" · ")}
        </p>
      )}
    </div>
  );
}
