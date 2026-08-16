/* elia base — the foundational component set */
export * from "./base";

/* elia charts — SVG data visualization on the chart palette */
export * from "./charts";

/* elia — AI-native primitives */
export { default as LoadingState } from "./loading-state";
export type { LoadingStateProps } from "./loading-state";
export { default as ThinkingState } from "./thinking-state";
export type { ThinkingStateProps, ThinkingRow } from "./thinking-state";
export { default as StreamingText } from "./streaming-text";
export type { StreamingTextProps, StreamingSource, StreamingAction } from "./streaming-text";
export { default as ApprovalCard } from "./approval-card";
export { default as ToolChips } from "./tool-chips";
export type { ToolChipsProps, ToolChipRow, ToolChipDiff, ToolChipDetail, ToolChipIcon } from "./tool-chips";
export { default as TaskRows } from "./task-rows";
export type { TaskRowsProps, TaskRow, TaskRowDetail, TaskRowStatus } from "./task-rows";
export { default as ChatComposer } from "./chat-composer";
export { default as PromptBar } from "./prompt-bar";
export { default as RecommendationCard } from "./recommendation-card";
export { default as ContextCards } from "./context-cards";
export type { ContextCardsProps, ContextChunk } from "./context-cards";
export { default as DiffTable } from "./diff-table";
export type { DiffTableProps, DiffTableRow, DiffTableAddedRow } from "./diff-table";
export { default as RecordsTable, STRENGTH } from "./records-table";
export type { RecordsTableProps, RecordsRow, RecordsSort, RecordsSortKey, RecordsStrength } from "./records-table";
export { default as FilterTable } from "./filter-table";
export type {
  FilterTableProps,
  FilterTableRow,
  FilterTableFilter,
  FilterTableStatus,
  FilterTableFilterKey,
} from "./filter-table";
export { default as SidebarNav } from "./sidebar-nav";
export type { SidebarNavProps, SidebarNavItem, SidebarWorkspace } from "./sidebar-nav";
export { default as SearchList } from "./search";
export type { SearchListProps } from "./search";
export { default as InsightCards, Entity, Mono } from "./insight-cards";
export type { InsightCardsProps, InsightPage } from "./insight-cards";
export { default as CodeBlock } from "./code-block";
export type { CodeBlockProps, CodeToken } from "./code-block";
export { default as FineTuneCard } from "./fine-tune-card";
export { default as SelectionActions } from "./selection-actions";
export type { ApprovalCardProps, ApprovalQuestion, ApprovalAnswer } from "./approval-card";
export type { RecommendationCardProps, RecommendationOption } from "./recommendation-card";
export type { SelectionActionsProps, SelectionActionKey } from "./selection-actions";
export { Shimmer } from "./atoms/shimmer";
export { StreamText } from "./atoms/stream-text";
