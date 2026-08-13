# elia base — style contract

Every base component reads like a sibling of the 19 primitives. This file is
the contract; deviations are bugs.

## Tokens only

Color comes exclusively from tokens (`styles/elia.css`): utilities
`bg-surface/inset/field/hover/hover-2/canvas/page`, `text-ink/ink-2/ink-3`,
`border-line/line-strong`, `bg-accent/green/orange/red` (+`-tint`,
`text-accent-ink`), or `var(--…)` in inline styles. Never a hardcoded hex.
Dark mode is automatic via tokens; use the `dark:` variant only when a
different *relationship* is needed, not a different color.

## Metrics

| Thing | Value |
|---|---|
| Control heights | sm `h-7` (28px) · md `h-8` (32px) · lg `h-9` (36px) |
| Control radius | `rounded-control` (8px); pills/chips `rounded-full` / `rounded-chip` (6px) |
| Cards/menus | `rounded-card` (10px); menus `rounded-[10px] p-1` |
| Text | controls `text-[12.5px]` sm / `text-[13px]` md+ · labels `text-[12px]` · captions/meta `text-[11.5px]` · mono meta `font-mono text-[11px] tabular-nums` |
| Weights | medium for control labels, semibold for titles, 650 max |
| Icon sizes | 24-grid stroke icons at 13–16px, `strokeWidth 1.8–2` (2.2–2.5 for chevrons/checks at small sizes) |
| Gaps | inside controls `gap-1`–`gap-2`; stacks `gap-0.5`–`gap-2` |

## Surfaces & elevation

- Resting control on a card: `bg-surface shadow-btn`
- Filled/primary: `bg-ink text-canvas` + `shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]`
- Accent filled: `bg-accent text-white` (same inset highlight)
- Sunken field: `bg-inset shadow-hairline` or `bg-field`; focused field ring: `boxShadow: 0 0 0 1px var(--accent)` (via style or `focus-within` class)
- Menus/popovers: `bg-surface p-1 shadow-raised rounded-[10px]`, items `rounded-[6px] px-2 h-7.5`
- Tooltips: `--tooltip-bg/fg/muted/border`, `rounded-[8px] px-2 py-1 text-[11.5px]`

## States

- Hover: `hover:bg-hover` (on-surface) or `hover:bg-hover-2` (inline/ghost); color lift `text-ink-3 → hover:text-ink`
- Press: `active:scale-[0.96]` (controls), `enabled:active:scale-[0.94]` (small icon buttons)
- Disabled: `disabled:opacity-40 disabled:pointer-events-none` (or `enabled:` guards)
- Focus: `focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2` on every interactive element (menus/lists may use gliding highlight + `focus-visible` ring on the container)
- Selected row/option: `bg-inset` or gliding highlight; never accent-filled rows

## Motion

- Ease: `var(--ease-out-strong)` = `cubic-bezier(.23,1,.32,1)`; durations 100–150ms color, 200–300ms layout, 400ms expansions
- Expansion: the grid trick — outer `grid` animating `grid-template-rows: 0fr→1fr` + opacity, inner `overflow-hidden`. Never animate `height`.
- Enter: `pop-in 200ms` (popovers, badges), `fade-up 300–450ms` (list items, staggered `i*80ms`), `fade-in` (subtle)
- Gliding highlight (menus, nav lists, segmented): one absolute `bg-hover` (or `bg-surface shadow-btn` thumb) span, `top/height` (or `transform`) transitioned 220ms; rows are `relative z-10` transparent
- Chevrons rotate 180° / −90° with `transition-transform duration-200–300`
- Respect `prefers-reduced-motion` (global CSS already clamps; don't fight it)

## Accessibility

- Real elements: `<button type="button">`, `<input>`, native `<dialog>`
- Icon-only controls require `aria-label`; toggles `aria-pressed`; disclosure `aria-expanded`; current nav `aria-current`
- Menus/selects: full keyboard (↑ ↓ Enter Esc, Tab closes), `role="listbox"/"option"` or `role="menu"/"menuitem"`, click-outside closes
- Toasts: `role="status"`; errors `role="alert"`
- Labels wired with `useId` (`htmlFor`/`aria-describedby`)

## Code conventions

- One file per component family, kebab-case; named exports; no default exports in base
- Props extend the native element (`React.ButtonHTMLAttributes<…>` etc.); always accept `className` and merge with `cx()`; React 19 — `ref` is a normal prop, no `forwardRef`
- `"use client"` only when the file uses state/effects
- No new dependencies. Icons: inline 24-grid SVG paths (the primitives' style); consumers wanting a full set use `iconoir-react`
- Comments only for constraints the code can't show (matching the primitives' banner style: a short header block per file)
