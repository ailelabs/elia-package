"use client";

import { useState, type ComponentProps } from "react";
import { cx } from "./cx";
import { IconButton } from "./button";

/* ─────────────────────────────────────────────────────────
 * SNIPPET — static, syntax-highlighted code display.
 * A tiny regex tokenizer in the system's code palette:
 * keywords→accent-ink · strings→green · numbers→orange ·
 * comments→ink-3 · Components/Types→ink. No dependencies.
 * ───────────────────────────────────────────────────────── */

export type SnippetLang = "tsx" | "ts" | "js" | "css" | "bash" | "html";

type Tok = { text: string; color?: string; italic?: boolean };
type Rule = { re: RegExp; color: string; italic?: boolean };

const C = {
  kw: "var(--accent-ink)",
  str: "var(--green)",
  num: "var(--orange)",
  cap: "var(--ink)",
  dim: "var(--ink-3)",
};

const TSX_RULES: Rule[] = [
  { re: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y, color: C.dim, italic: true },
  { re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/y, color: C.str },
  { re: /\b\d+(?:\.\d+)?\b/y, color: C.num },
  {
    re: /\b(?:import|export|from|const|let|var|function|return|if|else|for|while|new|type|interface|extends|implements|default|async|await|typeof|keyof|as|in|of|class|this|null|undefined|true|false)\b/y,
    color: C.kw,
  },
  { re: /\b[A-Z][A-Za-z0-9_]*\b/y, color: C.cap },
];

const CSS_RULES: Rule[] = [
  { re: /\/\*[\s\S]*?\*\//y, color: C.dim, italic: true },
  { re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/y, color: C.str },
  { re: /@[\w-]+/y, color: C.kw },
  { re: /--[\w-]+/y, color: C.cap },
  { re: /[-a-z][\w-]*(?=\s*:)/y, color: C.kw },
  { re: /\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms|fr|vw|vh|deg)?\b/y, color: C.num },
];

const BASH_RULES: Rule[] = [
  { re: /#[^\n]*/y, color: C.dim, italic: true },
  { re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/y, color: C.str },
  { re: /(?<=^|\n)[\w./-]+/y, color: C.cap },
  { re: /\s-{1,2}[\w-]+/y, color: C.dim },
];

const HTML_RULES: Rule[] = [
  { re: /<!--[\s\S]*?-->/y, color: C.dim, italic: true },
  { re: /"(?:[^"\\\n]|\\.)*"/y, color: C.str },
  { re: /<\/?[\w-]+|\/?>/y, color: C.kw },
  { re: /\b[\w-]+(?==)/y, color: C.cap },
];

const RULES: Record<SnippetLang, Rule[]> = {
  tsx: TSX_RULES,
  ts: TSX_RULES,
  js: TSX_RULES,
  css: CSS_RULES,
  bash: BASH_RULES,
  html: HTML_RULES,
};

export function tokenize(code: string, lang: SnippetLang): Tok[] {
  const rules = RULES[lang] ?? TSX_RULES;
  const out: Tok[] = [];
  let i = 0;
  let plain = "";
  while (i < code.length) {
    let matched: Tok | null = null;
    for (const rule of rules) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(code);
      if (m && m[0].length > 0) {
        matched = { text: m[0], color: rule.color, italic: rule.italic };
        break;
      }
    }
    if (matched) {
      if (plain) {
        out.push({ text: plain });
        plain = "";
      }
      out.push(matched);
      i += matched.text.length;
    } else {
      plain += code[i];
      i += 1;
    }
  }
  if (plain) out.push({ text: plain });
  return out;
}

const LANG_LABEL: Record<SnippetLang, string> = {
  tsx: "TypeScript",
  ts: "TypeScript",
  js: "JavaScript",
  css: "CSS",
  bash: "Terminal",
  html: "HTML",
};

export interface SnippetProps extends Omit<ComponentProps<"div">, "children"> {
  code: string;
  lang?: SnippetLang;
  /** file name shown in the header */
  file?: string;
}

export function Snippet({ code, lang = "tsx", file, className, ...rest }: SnippetProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className={cx("overflow-hidden rounded-card bg-surface shadow-card", className)} {...rest}>
      <div className="primitive-card-bar flex items-center justify-between border-b border-line">
        <span className="flex items-baseline gap-2">
          {file && <span className="font-mono text-[12px] font-medium text-ink">{file}</span>}
          <span className="text-[11.5px] text-ink-3">{LANG_LABEL[lang] ?? lang}</span>
        </span>
        <IconButton size="sm" aria-label={copied ? "Copied" : "Copy code"} onClick={copy} className={copied ? "text-green" : undefined}>
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          )}
        </IconButton>
      </div>
      <pre className="overflow-x-auto bg-inset px-3.5 py-3 font-mono text-[11.5px] leading-[1.7] text-ink-2">
        {tokenize(code, lang).map((tok, i) => (
          <span
            key={i}
            style={{
              color: tok.color,
              fontStyle: tok.italic ? "italic" : undefined,
            }}
          >
            {tok.text}
          </span>
        ))}
      </pre>
    </div>
  );
}
