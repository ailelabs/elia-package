import { cx } from "./cx";

/* ─────────────────────────────────────────────────────────
 * TEXT
 * The type scale as a component — one variant per voice.
 * `serif` is the brand voice (italic Instrument Serif).
 * ───────────────────────────────────────────────────────── */

const VARIANTS = {
  display: "text-[24px] font-[650] tracking-[-0.02em]",
  title: "text-[15px] font-semibold",
  subtitle: "text-[13px] font-medium text-ink-2",
  body: "text-[13px] leading-relaxed",
  label: "text-[12px] font-medium text-ink-2",
  caption: "text-[11.5px] text-ink-3",
  mono: "font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3",
  serif: "font-serif italic text-accent",
} as const;

/* default element per variant — override with `as` */
const TAGS: Record<keyof typeof VARIANTS, string> = {
  display: "h1",
  title: "h2",
  subtitle: "h3",
  body: "p",
  label: "span",
  caption: "span",
  mono: "span",
  serif: "span",
};

export type TextProps = React.HTMLAttributes<HTMLElement> & {
  variant: keyof typeof VARIANTS;
  as?: any;
  ref?: React.Ref<any>;
};

export function Text({ variant, as, className, ...rest }: TextProps) {
  const Tag = as ?? TAGS[variant];
  return <Tag className={cx(VARIANTS[variant], className)} {...rest} />;
}
