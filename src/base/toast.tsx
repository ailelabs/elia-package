"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * TOAST — imperative toast() feeding a module-level pub/sub
 * store; <Toaster/> renders the queue fixed bottom-right.
 * Auto-dismisses (3500ms default), hover pauses the timer,
 * X dismisses immediately. Red toasts announce as alerts.
 * ───────────────────────────────────────────────────────── */

export type ToastTone = "neutral" | "green" | "red";

type ToastItem = {
  id: number;
  message: React.ReactNode;
  tone: ToastTone;
  duration: number;
};

let queue: ToastItem[] = [];
let nextId = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const EMPTY: ToastItem[] = [];

export function toast(message: React.ReactNode, options: { tone?: ToastTone; duration?: number } = {}) {
  queue = [...queue, { id: nextId++, message, tone: options.tone ?? "neutral", duration: options.duration ?? 3500 }];
  emit();
}

function dismiss(id: number) {
  queue = queue.filter((item) => item.id !== id);
  emit();
}

function ToastCard({ item }: { item: ToastItem }) {
  const timer = useRef(0);
  const startedAt = useRef(0);
  const remaining = useRef(item.duration);

  const resume = () => {
    startedAt.current = Date.now();
    timer.current = window.setTimeout(() => dismiss(item.id), remaining.current);
  };
  const pause = () => {
    window.clearTimeout(timer.current);
    remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
  };

  useEffect(() => {
    resume();
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role={item.tone === "red" ? "alert" : "status"}
      onMouseEnter={pause}
      onMouseLeave={resume}
      className="flex items-center gap-2 rounded-card bg-surface px-3 py-2 text-[12.5px] text-ink shadow-overlay"
      style={{ animation: "pop-in 200ms cubic-bezier(0.23,1,0.32,1) both" }}
    >
      <span
        aria-hidden
        className={cx(
          "size-2 shrink-0 rounded-full",
          item.tone === "green" ? "bg-green" : item.tone === "red" ? "bg-red" : "bg-ink-3",
        )}
      />
      <span className="min-w-0">{item.message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dismiss(item.id)}
        className="-mr-1 flex size-5 shrink-0 items-center justify-center rounded-[6px] text-ink-3 transition-[background-color,color,transform] duration-100 hover:bg-hover hover:text-ink active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function Toaster() {
  const items = useSyncExternalStore(
    subscribe,
    () => queue,
    () => EMPTY,
  );
  if (items.length === 0) return null;
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {items.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}
