# elia

An open design system for AI-native interfaces. Tokens, base components, charts,
and agent primitives for **React 19** and **Tailwind CSS v4**.

```bash
npm install elia
```

```bash
bun add elia      # pnpm add elia · yarn add elia
```

## Setup

Import the stylesheet once, at the root of your app. It carries the tokens,
keyframes, and the Tailwind v4 `@theme` bridge that every component draws from.

```ts
import "elia/styles/elia.css";
```

```tsx
import { Button, Card, DatePicker } from "elia";

export function Example() {
  return (
    <Card>
      <Button variant="accent">Ship it</Button>
    </Card>
  );
}
```

Dark mode is a `.dark` class on `<html>`; every colour resolves from tokens, so
nothing else has to change. `.band` scopes an always-dark section.

## What's inside

**Base** — the everyday set: `Button` `Input` `Textarea` `Field` `Checkbox`
`RadioGroup` `Switch` `Select` `Combobox` `Slider` `Calendar` `DatePicker`
`DateField` `TimePicker` `PasswordInput` `PhoneInput` `NumberInput` `OtpInput`
`Text` `Badge` `Chip` `Alert` `Avatar` `Divider` `Card` `Table` `Accordion`
`Tabs` `Segmented` `Tooltip` `Menu` `Popover` `Dialog` `Drawer` `Command`
`Toast` `Snippet` `Spinner` `Skeleton` `Progress` `EmptyState` `Navbar`
`Breadcrumb` `Pagination` `TagInput` `FileDrop` `Kbd`

**Charts** — SVG, token-driven, no charting dependency: `BarChart` `LineChart`
`PieChart` `DoughnutChart` `StatTile` `Sparkline` `Meter`. The categorical
palette is validated for colourblind separation in both light and dark, and
every chart ships an accessible table view of its own data.

**Primitives** — AI-native patterns: `StreamingText` `ThinkingState`
`ApprovalCard` `ToolChips` `TaskRows` `ChatComposer` `PromptBar`
`RecommendationCard` `ContextCards` `DiffTable` `RecordsTable` `FilterTable`
`SidebarNav` `SearchList` `InsightCards` `CodeBlock` `FineTuneCard`
`SelectionActions` `LoadingState`

## Peer dependencies

React 19 and React DOM 19. Components are named exports; `ref` is a normal prop
throughout (no `forwardRef`).

## License

MIT — see [LICENSE](./LICENSE), which includes a required third-party notice.
