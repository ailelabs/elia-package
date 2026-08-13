"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────────────────
 * RECOMMENDATION CARD
 * The card holds its shape. Pressing "Alternatives" opens a
 * new drawer listing the other options; picking one promotes
 * it to the recommendation. The primary action confirms.
 * API: prompt? + options? + onAccept?(key) + onSelect?(key).
 * ───────────────────────────────────────────────────────── */

export interface RecommendationOption {
  key: string;
  body: React.ReactNode;
  short: string;
  /** confidence bars, 0–3 */
  signal: 0 | 1 | 2 | 3;
  tone?: "green" | "orange" | "neutral";
  label: string;
  cta: string;
}

export interface RecommendationCardProps {
  prompt?: string;
  options?: RecommendationOption[];
  onAccept?: (optionKey: string) => void;
  onSelect?: (optionKey: string) => void;
}

const TONE_COLOR = {
  green: "var(--green)",
  orange: "var(--orange)",
  neutral: "var(--ink-3)",
} as const;

const OPTIONS: RecommendationOption[] = [
  {
    key: "high",
    body: (
      <>
        Reorder waffle cones from{" "}
        <code className="rounded-md bg-accent-tint px-1.5 py-0.5 font-mono text-[12px] text-accent-ink">cone_king</code>{" "}
        with lead time{" "}
        <code className="rounded-md bg-accent-tint px-1.5 py-0.5 font-mono text-[12px] text-accent-ink">7_days</code>.
      </>
    ),
    short: "Reorder from cone_king · 7-day lead",
    signal: 3,
    tone: "green",
    label: "High confidence",
    cta: "Accept",
  },
  {
    key: "review",
    body: (
      <>
        Switch vanilla to{" "}
        <code className="rounded-md bg-orange-tint px-1.5 py-0.5 font-mono text-[12px] text-orange">vanilla_madagascar</code>{" "}
        for peak season.
      </>
    ),
    short: "Switch to vanilla_madagascar",
    signal: 2,
    tone: "orange",
    label: "Needs review",
    cta: "Configure",
  },
  {
    key: "none",
    body: (
      <>
        Fall back to a <span className="font-medium text-ink">full restock</span> across every SKU.
      </>
    ),
    short: "Full restock across every SKU",
    signal: 0,
    tone: "neutral",
    label: "No signal",
    cta: "Accept full restock",
  },
];

const toneOf = (o: RecommendationOption) => TONE_COLOR[o.tone ?? "neutral"];
const ctaStyleOf = (o: RecommendationOption) =>
  o.tone === "green" ? "bg-accent text-white" : "bg-ink text-canvas";

function Meter({ signal, tone }: { signal: number; tone: string }) {
  return (
    <span className="flex items-end gap-0.5">
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="w-1 rounded-full transition-colors duration-300"
          style={{ height: 10, background: bar < signal ? tone : "var(--line-strong)" }}
        />
      ))}
    </span>
  );
}

export default function RecommendationCard({
  prompt = "Want me to place this restock order?",
  options = OPTIONS,
  onAccept,
  onSelect,
}: RecommendationCardProps = {}) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const active = options[selected] ?? options[0];
  const others = options.map((o, i) => ({ o, i })).filter(({ i }) => i !== selected);

  return (
    <div className="w-full max-w-95 overflow-hidden rounded-card bg-surface shadow-card">
      <div className="primitive-card-pad">
        <span className="text-[13px] font-semibold text-ink">
          {prompt}
        </span>
        <p
          key={active.key}
          className="mt-1.5 min-h-12 text-[13px] leading-relaxed text-ink-2"
          style={{ animation: "fade-in 180ms ease-out both" }}
        >
          {active.body}
        </p>
      </div>

      {/* alternatives drawer — a distinctly new section of the card */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-line bg-inset px-2 py-2">
            <p className="px-1.5 pb-1 text-[11px] font-medium text-ink-3">
              Other options
            </p>
            {others.map(({ o, i }) => (
              <button
                key={o.key}
                type="button"
                onClick={() => {
                  setSelected(i);
                  setAccepted(false);
                  setOpen(false);
                  onSelect?.(o.key);
                }}
                className="flex w-full items-center gap-2.5 rounded-control px-1.5 py-1.5
                  text-left transition-colors duration-100 hover:bg-hover"
              >
                <Meter signal={o.signal} tone={toneOf(o)} />
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{o.short}</span>
                <span className="shrink-0 text-[11px] text-ink-3">{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="primitive-card-footer flex items-center justify-between gap-3 border-t border-line bg-inset">
        <span className="flex items-center gap-2">
          <Meter signal={active.signal} tone={toneOf(active)} />
          <span className="text-[12.5px] font-medium text-ink-2">{active.label}</span>
        </span>

        <span className="-mr-0.5 flex items-center gap-2">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className={`h-7 rounded-control px-2.5 text-[12.5px] font-medium shadow-btn
              transition-[background-color,transform] duration-100 active:scale-[0.96]
              ${open ? "bg-hover text-ink" : "bg-surface text-ink hover:bg-hover"}`}
          >
            Alternatives
          </button>
          <button
            type="button"
            onClick={() => {
              setAccepted(true);
              onAccept?.(active.key);
            }}
            className={`h-7 rounded-control px-3 text-[12.5px] font-medium
              shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_0_1px_rgba(16,24,40,0.12),0_1px_2px_rgba(16,24,40,0.1)]
              transition-[background-color,transform] duration-150 active:scale-[0.96]
              ${accepted ? "bg-green text-white" : ctaStyleOf(active)}`}
          >
            {accepted ? "Accepted" : active.cta}
          </button>
        </span>
      </div>
    </div>
  );
}
