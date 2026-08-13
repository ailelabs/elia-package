"use client";

import { useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * FINE-TUNE CARD — compact interactive inspector.
 * Number fields scrub: hover the label for an ↔ cursor and
 * drag to adjust, use ↑/↓ (⇧ for ×10), or type directly.
 * API: heading, typeOptions, width/height/radius/opacity
 * (initial values), onChange(state) fired on every edit.
 * ───────────────────────────────────────────────────────── */

function ScrubField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "",
  active,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  active?: boolean;
}) {
  const drag = useRef<{ x: number; v: number } | null>(null);
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v)));

  return (
    <label
      className="flex h-6.5 min-w-0 items-center gap-1 rounded-chip py-1 pr-1 pl-0.5
        transition-[background-color,box-shadow] duration-200"
      style={{
        background: active ? "var(--accent-tint)" : "var(--field)",
        boxShadow: active ? "0 0 0 1px var(--accent)" : "none",
      }}
    >
      {/* scrub handle */}
      <span
        role="slider"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, v: value };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          onChange(clamp(drag.current.v + ((e.clientX - drag.current.x) / 2) * step));
        }}
        onPointerUp={() => (drag.current = null)}
        onKeyDown={(e) => {
          const mult = e.shiftKey ? 10 : 1;
          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            onChange(clamp(value + step * mult));
          } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            onChange(clamp(value - step * mult));
          }
        }}
        className="flex h-full shrink-0 cursor-ew-resize touch-none items-center rounded-[4px]
          px-0.5 text-[12px] text-ink-3 select-none hover:text-ink-2 focus-visible:text-accent-ink
          focus-visible:outline-none"
      >
        {label}
      </span>
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/[^\d-]/g, ""));
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        aria-label={`${label} value`}
        className="min-w-0 flex-1 bg-transparent text-[12px] text-ink tabular-nums outline-none"
      />
      {suffix && <span className="shrink-0 pr-0.5 text-[11.5px] text-ink-3">{suffix}</span>}
    </label>
  );
}

const SEGMENTS = ["row", "col", "grid"] as const;

export type FineTuneSegment = (typeof SEGMENTS)[number];

export interface FineTuneState {
  seg: FineTuneSegment;
  width: number;
  height: number;
  radius: number;
  opacity: number;
  /** Null until a type is picked. */
  type: string | null;
}

export interface FineTuneCardProps {
  heading?: string;
  typeOptions?: string[];
  /** Initial values — the "Edited" badge appears once any value differs. */
  width?: number;
  height?: number;
  radius?: number;
  opacity?: number;
  onChange?: (state: FineTuneState) => void;
}

function SegmentIcon({ kind }: { kind: string }) {
  const dot = "size-1.5 rounded-[2px] border-[1.2px] border-current";
  if (kind === "row")
    return <span className="flex gap-0.5">{[0, 1, 2].map((i) => <span key={i} className={dot} />)}</span>;
  if (kind === "col")
    return <span className="flex flex-col gap-0.5">{[0, 1].map((i) => <span key={i} className={dot} />)}</span>;
  return (
    <span className="grid grid-cols-2 gap-0.5">
      {[0, 1, 2, 3].map((i) => <span key={i} className={dot} />)}
    </span>
  );
}

const UNSET = "Select type";

export default function FineTuneCard({
  heading = "Flavor card",
  typeOptions = ["Seasonal", "Classic", "Limited"],
  width: initialWidth = 324,
  height: initialHeight = 96,
  radius: initialRadius = 28,
  opacity: initialOpacity = 100,
  onChange,
}: FineTuneCardProps) {
  const [seg, setSeg] = useState(0);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [radius, setRadius] = useState(initialRadius);
  const [opacity, setOpacity] = useState(initialOpacity);
  const [menuOpen, setMenuOpen] = useState(false);
  const [typeValue, setTypeValue] = useState(UNSET);
  const done =
    seg !== 0 ||
    width !== initialWidth ||
    height !== initialHeight ||
    radius !== initialRadius ||
    opacity !== initialOpacity ||
    typeValue !== UNSET;

  /* apply a partial edit locally, then report the full state */
  const update = (patch: {
    seg?: number;
    width?: number;
    height?: number;
    radius?: number;
    opacity?: number;
    type?: string;
  }) => {
    if (patch.seg !== undefined) setSeg(patch.seg);
    if (patch.width !== undefined) setWidth(patch.width);
    if (patch.height !== undefined) setHeight(patch.height);
    if (patch.radius !== undefined) setRadius(patch.radius);
    if (patch.opacity !== undefined) setOpacity(patch.opacity);
    if (patch.type !== undefined) setTypeValue(patch.type);
    const type = patch.type ?? typeValue;
    onChange?.({
      seg: SEGMENTS[patch.seg ?? seg],
      width: patch.width ?? width,
      height: patch.height ?? height,
      radius: patch.radius ?? radius,
      opacity: patch.opacity ?? opacity,
      type: type === UNSET ? null : type,
    });
  };

  return (
    <div className="relative w-full max-w-60 rounded-card bg-surface shadow-raised">
      {/* header */}
      <div className="primitive-card-bar flex items-center justify-between border-b border-line">
        <span className="text-[13px] font-medium text-ink">{heading}</span>
        {done ? (
          <span
            className="flex items-center gap-1.5 text-[12px] font-medium text-green"
            style={{ animation: "pop-in 250ms cubic-bezier(0.23,1,0.32,1) both" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Edited
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="flex size-4.5 items-center justify-center rounded-[5px] border border-accent/30 bg-accent-tint">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="var(--accent)">
                <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
              </svg>
            </span>
            <span
              className="bg-clip-text text-[12px] font-medium text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--accent) 35%, var(--accent-ink) 50%, var(--accent) 65%)",
                backgroundSize: "200% 100%",
                animation: "shimmer-text 1.4s linear infinite",
              }}
            >
              Adjust
            </span>
          </span>
        )}
      </div>

      {/* layout section */}
      <div className="primitive-card-pad flex flex-col gap-2 border-b border-line">
        <p className="text-[12.5px] font-medium text-ink">Layout</p>
        {/* Layo segmented: gray track, raised white thumb */}
        <div className="relative grid grid-cols-3 rounded-control bg-field p-0.5">
          <span
            aria-hidden
            className="absolute inset-y-0.5 rounded-[6px] bg-surface shadow-btn transition-transform duration-300"
            style={{
              width: "calc((100% - 4px) / 3)",
              left: 2,
              transform: `translateX(${seg * 100}%)`,
              transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />
          {SEGMENTS.map((s, i) => (
            <button
              key={s}
              type="button"
              aria-label={`${s} layout`}
              aria-pressed={i === seg}
              onClick={() => update({ seg: i })}
              className={`relative z-10 flex h-6 items-center justify-center transition-colors duration-200
                ${i === seg ? "text-accent" : "text-ink-3"}`}
            >
              <SegmentIcon kind={s} />
            </button>
          ))}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-2">
          <ScrubField label="W" value={width} onChange={(v) => update({ width: v })} min={40} max={999} active={width !== initialWidth} />
          <ScrubField label="H" value={height} onChange={(v) => update({ height: v })} min={24} max={999} active={height !== initialHeight} />
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-2">
          <ScrubField label="Radius" value={radius} onChange={(v) => update({ radius: v })} min={0} max={64} active={radius !== initialRadius} />
          <ScrubField label="Opacity" value={opacity} onChange={(v) => update({ opacity: v })} min={0} max={100} suffix="%" active={opacity !== initialOpacity} />
        </div>
      </div>

      {/* interaction section */}
      <div className="primitive-card-footer flex items-center justify-between">
        <span className="text-[12px] text-ink-3">Type</span>
        <div className="relative -mr-0.5 w-30">
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-6.5 w-full items-center justify-between rounded-chip bg-inset py-1 pr-1 pl-2
              shadow-hairline transition-shadow duration-200 focus-visible:outline-none"
            style={{ boxShadow: menuOpen ? "0 0 0 1px var(--accent)" : undefined }}
          >
            <span className={`text-[12px] ${typeValue !== UNSET ? "text-ink" : "text-ink-3"}`}>
              {typeValue}
            </span>
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="transition-transform duration-200"
              style={{ transform: menuOpen ? "rotate(180deg)" : "rotate(0)" }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 bottom-8 z-10 w-30 rounded-[10px] bg-surface p-1 shadow-raised"
              style={{
                animation: "pop-in 200ms cubic-bezier(0.23,1,0.32,1) both",
                transformOrigin: "bottom right",
              }}
            >
              {typeOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    update({ type: item });
                    setMenuOpen(false);
                  }}
                  className="flex h-6.5 w-full items-center rounded-[6px] px-2 text-left text-[12.5px] text-ink
                    transition-colors duration-150 hover:bg-field"
                  style={{ background: item === typeValue ? "var(--field)" : "transparent" }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
