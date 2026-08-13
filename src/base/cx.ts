/* join truthy class strings — the system's only class helper */
export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");
