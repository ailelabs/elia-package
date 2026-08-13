"use client";

import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * TABS — the chat-composer header style: active tab sits on
 * a field chip, inactive tabs fade. Roving tabindex + arrows.
 * ───────────────────────────────────────────────────────── */

export type TabItem = { key: string; label: React.ReactNode };

type TabsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  tabs: TabItem[];
  value: string;
  onChange: (key: string) => void;
};

export function Tabs({ tabs, value, onChange, className, ...props }: TabsProps) {
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.key === value);
    const next = (index + delta + tabs.length) % tabs.length;
    onChange(tabs[next].key);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <div
      role="tablist"
      onKeyDown={onKeyDown}
      className={cx("flex items-center", className)}
      {...props}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === value}
          tabIndex={tab.key === value ? 0 : -1}
          onClick={() => onChange(tab.key)}
          className={cx(
            "rounded-[6px] px-2 py-[3px] text-[13px] text-ink transition-[background-color,opacity] duration-100",
            "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
            tab.key === value ? "bg-field" : "opacity-50 hover:opacity-75",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
